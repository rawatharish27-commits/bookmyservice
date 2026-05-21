/**
 * Cloudflare Integration Module for BookMyService API
 *
 * Provides Cloudflare-specific middleware configuration:
 * - Real IP extraction from Cloudflare headers (CF-Connecting-IP, X-Forwarded-For)
 * - Bot protection helpers (Cloudflare Bot Management headers)
 * - Cache control helpers for API responses (CDN caching)
 * - Rate limiting configuration that works behind Cloudflare
 * - DDoS protection helpers (request throttling, IP blocking)
 * - Country/geo detection from CF headers
 * - Bot Score integration with Cloudflare Bot Management
 * - Adaptive Rate Limiting based on bot score, country, time, and endpoint
 * - Advanced Challenge Flow for suspicious requests (proof-of-work)
 */

import type { MiddlewareHandler } from 'hono'
import * as crypto from 'crypto'

// ─── Types ──────────────────────────────────────────────────────────────────

interface CloudflareConfig {
  enabled: boolean
  realIPHeader: string
  countryHeader: string
  botScoreHeader: string
  rayHeader: string
  trustProxy: boolean
}

// ─── Known Bad Bot User-Agents ──────────────────────────────────────────────

const BLOCKED_BOT_PATTERNS = [
  /sqlmap/i,
  /nikto/i,
  /nmap/i,
  /masscan/i,
  /dirbuster/i,
  /gobuster/i,
  /wfuzz/i,
  /burpsuite/i,
  /zap/i,
  /w3af/i,
  /acunetix/i,
  /nessus/i,
  /openvas/i,
  /arachni/i,
  /skipfish/i,
  /wpscan/i,
  /joomscan/i,
  /droopescan/i,
  /whatweb/i,
  /gitleaks/i,
  /trufflehog/i,
  /semgrep/i,
  /sublist3r/i,
  /amass/i,
  /httpx/i,
  /nuclei/i,
  /crawlergo/i,
]

// Note: Common HTTP clients (curl, wget, python-requests, go-http-client, java/)
// are NOT blocked here because they're used by legitimate tools, monitoring,
// and API testing. Instead, we rely on rate limiting + DDoS throttle for abuse.
// Only truly malicious scrapers/attack tools are blocked here.
const BLOCKED_USER_AGENTS = [
  'mechanize',
  'scrapy',
  'libwww-perl',
  'lwp-trivial',
]

// ─── IP Blacklist (known malicious IPs / ranges) ───────────────────────────

const IP_BLACKLIST: Set<string> = new Set([
  // Add known malicious IPs here
])

const IP_RANGE_BLACKLIST: Array<{ start: number; end: number }> = [
  // Add known malicious IP ranges here as { start, end } numeric pairs
  // Example: { start: ipToNum('10.0.0.1'), end: ipToNum('10.0.0.255') }
]

// ─── DDoS Throttle State ────────────────────────────────────────────────────

interface ThrottleState {
  count: number
  firstSeen: number
  blocked: boolean
  blockedUntil: number
}

const throttleStore = new Map<string, ThrottleState>()
const THROTTLE_WINDOW_MS = 60_000 // 1 minute
const THROTTLE_MAX_REQUESTS = 100 // requests per window before throttling
const THROTTLE_BLOCK_DURATION_MS = 300_000 // 5 minutes block
const THROTTLE_CLEANUP_INTERVAL_MS = 120_000 // 2 minutes

// Periodic cleanup of throttle store
setInterval(() => {
  const now = Date.now()
  for (const [ip, state] of throttleStore.entries()) {
    if (now - state.firstSeen > THROTTLE_WINDOW_MS * 2 && !state.blocked) {
      throttleStore.delete(ip)
    } else if (state.blocked && now > state.blockedUntil) {
      throttleStore.delete(ip)
    }
  }
}, THROTTLE_CLEANUP_INTERVAL_MS)

// ─── Adaptive Rate Limiting State ───────────────────────────────────────────

interface AdaptiveRateLimitState {
  count: number
  firstSeen: number
}

const adaptiveThrottleStore = new Map<string, AdaptiveRateLimitState>()
const ADAPTIVE_CLEANUP_INTERVAL_MS = 120_000 // 2 minutes

// Country risk levels for adaptive rate limiting
const countryRiskLevels = new Map<string, 'low' | 'medium' | 'high'>()

// Default high-risk countries (configurable via setCountryRiskLevel)
const DEFAULT_HIGH_RISK_COUNTRIES: Set<string> = new Set([
  // Example: 'XX', 'YY' — add based on your threat model
])

// Peak hours for adaptive rate limiting (9 AM - 9 PM IST, configurable)
const PEAK_START_HOUR = 9
const PEAK_END_HOUR = 21

// Periodic cleanup of adaptive throttle store
setInterval(() => {
  const now = Date.now()
  for (const [key, state] of adaptiveThrottleStore.entries()) {
    // Clean up entries older than 2 minutes
    if (now - state.firstSeen > 120_000) {
      adaptiveThrottleStore.delete(key)
    }
  }
}, ADAPTIVE_CLEANUP_INTERVAL_MS)

// ─── Challenge Store ────────────────────────────────────────────────────────

interface ChallengeEntry {
  token: string
  difficulty: number
  createdAt: number
}

const challengeStore = new Map<string, ChallengeEntry>()
const CHALLENGE_TTL_MS = 5 * 60 * 1000 // 5 minutes

// Periodic cleanup of expired challenges
setInterval(() => {
  const now = Date.now()
  for (const [token, entry] of challengeStore.entries()) {
    if (now - entry.createdAt > CHALLENGE_TTL_MS) {
      challengeStore.delete(token)
    }
  }
}, 60_000) // Clean up every minute

// ─── Helper Functions ────────────────────────────────────────────────────────

function ipToNum(ip: string): number {
  const parts = ip.split('.').map(Number)
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0
}

function isIPBlacklisted(ip: string): boolean {
  if (IP_BLACKLIST.has(ip)) return true
  const num = ipToNum(ip)
  for (const range of IP_RANGE_BLACKLIST) {
    if (num >= range.start && num <= range.end) return true
  }
  return false
}

// ─── Exported Functions ──────────────────────────────────────────────────────

/**
 * Extract real IP from Cloudflare headers.
 * CF-Connecting-IP is the most reliable header set by Cloudflare.
 * Falls back to X-Forwarded-For and X-Real-IP for other proxy setups.
 */
export function getCloudflareRealIP(c: any): string {
  // Priority 1: Cloudflare's CF-Connecting-IP (set by CF edge servers)
  const cfIP = c.req.header('cf-connecting-ip')
  if (cfIP) return cfIP.trim()

  // Priority 2: First IP in X-Forwarded-For chain (client → proxies)
  const xff = c.req.header('x-forwarded-for')
  if (xff) {
    const firstIP = xff.split(',')[0]?.trim()
    if (firstIP) return firstIP
  }

  // Priority 3: X-Real-IP (set by nginx, etc.)
  const realIP = c.req.header('x-real-ip')
  if (realIP) return realIP.trim()

  return 'unknown'
}

/**
 * Hono middleware to set Cache-Control headers for CDN caching.
 * Allows Cloudflare to cache API responses at the edge.
 *
 * @param ttl - Cache duration in seconds (e.g., 300 for 5 minutes)
 */
export function cloudflareCacheHeaders(ttl: number): MiddlewareHandler {
  return async (c, next) => {
    await next()

    // Only cache successful GET responses
    if (c.req.method === 'GET' && c.res.status >= 200 && c.res.status < 300) {
      c.header('Cache-Control', `public, max-age=${ttl}, s-maxage=${ttl}`)
      c.header('CDN-Cache-Control', `public, max-age=${ttl}`)
      c.header('Cloudflare-CDN-Cache-Control', `public, max-age=${ttl}`)
      // Vary by Authorization to avoid serving cached auth data to wrong users
      c.header('Vary', 'Authorization, Accept-Encoding')
    }
  }
}

/**
 * Check if the request came through Cloudflare by looking for CF-specific headers.
 */
export function isCloudflareRequest(c: any): boolean {
  return !!(
    c.req.header('cf-connecting-ip') ||
    c.req.header('cf-ray') ||
    c.req.header('cf-visitor') ||
    c.req.header('cf-ipcountry')
  )
}

/**
 * Get country from CF-IPCountry header.
 * Cloudflare sets this header to the 2-letter ISO country code of the client.
 */
export function getCloudflareCountry(c: any): string | null {
  return c.req.header('cf-ipcountry') || null
}

/**
 * Get Cloudflare Ray ID for request tracing.
 * Useful for debugging and correlating with Cloudflare logs.
 */
export function getCloudflareRayID(c: any): string | null {
  return c.req.header('cf-ray') || null
}

/**
 * Bot protection middleware for Hono.
 * Blocks known bad bots based on User-Agent patterns and Cloudflare Bot Management headers.
 * Should be placed BEFORE rate limiter in the middleware chain.
 */
export function botProtectionMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    const userAgent = c.req.header('user-agent') || ''

    // Block empty user agents (most legitimate clients send one)
    if (!userAgent && c.req.method !== 'OPTIONS') {
      return c.json({ error: 'Forbidden', code: 'BOT_DETECTED' }, 403)
    }

    // Check against blocked bot patterns (security scanners, etc.)
    for (const pattern of BLOCKED_BOT_PATTERNS) {
      if (pattern.test(userAgent)) {
        return c.json({ error: 'Forbidden', code: 'BOT_DETECTED' }, 403)
      }
    }

    // Check against blocked user agents (aggressive crawlers, etc.)
    const uaLower = userAgent.toLowerCase()
    for (const blockedUA of BLOCKED_USER_AGENTS) {
      if (uaLower.includes(blockedUA.toLowerCase())) {
        // Allow if the request is from a legitimate source with a matching substring
        // (e.g., "curl/" in a legitimate tool name) — only block exact tool patterns
        if (uaLower.startsWith(blockedUA.toLowerCase()) || uaLower.includes(` ${blockedUA.toLowerCase()}`)) {
          return c.json({ error: 'Forbidden', code: 'BOT_DETECTED' }, 403)
        }
      }
    }

    // Check Cloudflare Bot Management score (if available)
    // CF sets cf.botManagement.score header for Enterprise plans
    const botScore = c.req.header('cf.botmanagement-score')
    if (botScore) {
      const score = parseInt(botScore, 10)
      // Scores below 30 are very likely bots
      if (!isNaN(score) && score < 30) {
        return c.json({ error: 'Forbidden', code: 'BOT_DETECTED' }, 403)
      }
    }

    // Check if the request is explicitly flagged as a bot by CF
    const cfBot = c.req.header('cf.botmanagement-verifiedBot')
    if (cfBot === 'false' && botScore && parseInt(botScore, 10) < 50) {
      return c.json({ error: 'Forbidden', code: 'BOT_DETECTED' }, 403)
    }

    await next()
  }
}

/**
 * DDoS protection middleware for Hono.
 * Implements request throttling per IP with automatic block periods.
 * Uses getCloudflareRealIP() for accurate IP detection behind CF.
 */
export function ddosThrottleMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    const ip = getCloudflareRealIP(c)
    const now = Date.now()

    // Check IP blacklist first
    if (isIPBlacklisted(ip)) {
      return c.json({ error: 'Forbidden', code: 'IP_BLOCKED' }, 403)
    }

    const state = throttleStore.get(ip)

    if (state) {
      // If currently blocked, check if block has expired
      if (state.blocked) {
        if (now > state.blockedUntil) {
          // Block expired — reset
          throttleStore.delete(ip)
        } else {
          // Still blocked
          c.header('Retry-After', String(Math.ceil((state.blockedUntil - now) / 1000)))
          return c.json(
            { error: 'Too many requests. Try again later.', code: 'DDOS_THROTTLED' },
            429
          )
        }
      } else {
        // Not blocked — check if threshold exceeded
        if (now - state.firstSeen > THROTTLE_WINDOW_MS) {
          // Window expired — reset counter
          state.count = 1
          state.firstSeen = now
        } else {
          state.count++
          if (state.count > THROTTLE_MAX_REQUESTS) {
            // Threshold exceeded — block the IP
            state.blocked = true
            state.blockedUntil = now + THROTTLE_BLOCK_DURATION_MS
            c.header('Retry-After', String(Math.ceil(THROTTLE_BLOCK_DURATION_MS / 1000)))
            return c.json(
              { error: 'Too many requests. Try again later.', code: 'DDOS_THROTTLED' },
              429
            )
          }
        }
      }
    } else {
      // First request from this IP
      throttleStore.set(ip, {
        count: 1,
        firstSeen: now,
        blocked: false,
        blockedUntil: 0,
      })
    }

    await next()
  }
}

/**
 * Returns current Cloudflare configuration status.
 * Useful for health check endpoints and monitoring.
 */
export function getCloudflareConfig(): {
  enabled: boolean
  realIPHeader: string
  countryHeader: string
  botScoreHeader: string
  rayHeader: string
  trustProxy: boolean
  throttleConfig: {
    windowMs: number
    maxRequests: number
    blockDurationMs: number
    activeIPs: number
    blockedIPs: number
  }
} {
  let blockedCount = 0
  for (const state of throttleStore.values()) {
    if (state.blocked && Date.now() < state.blockedUntil) {
      blockedCount++
    }
  }

  return {
    enabled: true,
    realIPHeader: 'CF-Connecting-IP',
    countryHeader: 'CF-IPCountry',
    botScoreHeader: 'cf.botmanagement-score',
    rayHeader: 'CF-Ray',
    trustProxy: true,
    throttleConfig: {
      windowMs: THROTTLE_WINDOW_MS,
      maxRequests: THROTTLE_MAX_REQUESTS,
      blockDurationMs: THROTTLE_BLOCK_DURATION_MS,
      activeIPs: throttleStore.size,
      blockedIPs: blockedCount,
    },
  }
}

/**
 * Clear DDoS throttle state for a specific IP (admin utility).
 */
export function clearThrottleForIP(ip: string): boolean {
  return throttleStore.delete(ip)
}

/**
 * Add an IP to the blacklist (admin utility).
 */
export function blacklistIP(ip: string): void {
  IP_BLACKLIST.add(ip)
}

/**
 * Remove an IP from the blacklist (admin utility).
 */
export function unblacklistIP(ip: string): void {
  IP_BLACKLIST.delete(ip)
}

// ─── Bot Score Integration ──────────────────────────────────────────────────

/**
 * Extract and normalize Cloudflare Bot Management headers.
 * Returns bot score, category, and verified bot status.
 */
export function getBotScore(c: any): { score: number | null; category: string | null; verifiedBot: boolean } {
  const scoreHeader = c.req.header('cf.botmanagement-score')
  const verifiedBotHeader = c.req.header('cf.botmanagement-verifiedBot')
  const staticResourceHeader = c.req.header('cf.botmanagement-staticResource')

  let score: number | null = null
  let category: string | null = null

  if (scoreHeader) {
    const parsed = parseInt(scoreHeader, 10)
    if (!isNaN(parsed)) {
      score = parsed
      // Categorize based on score ranges
      if (score >= 80) {
        category = 'likely_human'
      } else if (score >= 40) {
        category = 'suspicious'
      } else if (score >= 20) {
        category = 'likely_automated'
      } else {
        category = 'definite_bot'
      }
    }
  }

  const verifiedBot = verifiedBotHeader === 'true'
  const isStaticResource = staticResourceHeader === 'true'

  // Override category for verified bots and static resources
  if (verifiedBot) {
    category = 'verified_bot'
  } else if (isStaticResource && category === null) {
    category = 'static_resource'
  }

  return { score, category, verifiedBot }
}

/**
 * Bot Score Middleware for Hono.
 * Extracts bot score from CF headers and applies rules:
 * - Score < 20: Block with 403
 * - Score 20-40: Add X-Bot-Suspect header, allow with tracking
 * - Score > 40: Allow normally
 * Injects score into Hono context: c.set('botScore', score)
 * Logs suspicious bot activity.
 */
export function botScoreMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    const { score, category, verifiedBot } = getBotScore(c)

    // Inject score into Hono context
    c.set('botScore', score)

    // If no bot score available (not behind Cloudflare), allow normally
    if (score === null) {
      await next()
      return
    }

    // Verified bots are allowed through
    if (verifiedBot) {
      await next()
      return
    }

    // Score < 20: Block with 403
    if (score < 20) {
      console.warn(`🤖 Bot blocked (score: ${score}, category: ${category}) — IP: ${getCloudflareRealIP(c)}, Path: ${c.req.path}`)
      return c.json({ error: 'Forbidden', code: 'BOT_BLOCKED', score }, 403)
    }

    // Score 20-40: Suspect — allow with tracking header
    if (score >= 20 && score <= 40) {
      c.header('X-Bot-Suspect', 'true')
      console.warn(`⚠️  Suspicious bot activity (score: ${score}, category: ${category}) — IP: ${getCloudflareRealIP(c)}, Path: ${c.req.path}`)
    }

    // Score > 40: Allow normally
    await next()
  }
}

// ─── Adaptive Rate Limiting ─────────────────────────────────────────────────

/**
 * Set the risk level for a specific country (admin utility).
 * Countries with higher risk levels get stricter rate limits.
 */
export function setCountryRiskLevel(country: string, level: 'low' | 'medium' | 'high'): void {
  countryRiskLevels.set(country.toUpperCase(), level)
}

/**
 * Get current adaptive rate limit configuration.
 * Returns the configuration state for monitoring and debugging.
 */
export function getAdaptiveConfig(): {
  countryRiskLevels: Record<string, string>
  peakHours: { start: number; end: number }
  rateLimits: { bot: number; normal: number; auth: number }
  activeKeys: number
} {
  const countryConfig: Record<string, string> = {}
  for (const [country, level] of countryRiskLevels.entries()) {
    countryConfig[country] = level
  }

  return {
    countryRiskLevels: countryConfig,
    peakHours: { start: PEAK_START_HOUR, end: PEAK_END_HOUR },
    rateLimits: {
      bot: 30,      // req/min for score < 40
      normal: 100,  // req/min for normal users
      auth: 33,     // req/min for auth endpoints (1/3 of normal)
    },
    activeKeys: adaptiveThrottleStore.size,
  }
}

/**
 * Adaptive Rate Limiting Middleware for Hono.
 * Adjusts rate limits dynamically based on:
 * a. Bot score: Lower scores get stricter limits (30 req/min for score < 40, 100 for normal)
 * b. Country: Different limits for high-risk vs low-risk countries
 * c. Time of day: Stricter during peak hours
 * d. Endpoint sensitivity: Auth endpoints get 1/3 of normal limits
 * Uses the existing throttle store pattern but with dynamic thresholds.
 */
export function adaptiveRateLimitMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    const ip = getCloudflareRealIP(c)
    const now = Date.now()
    const { score } = getBotScore(c)
    const country = getCloudflareCountry(c)

    // Determine base rate limit from bot score
    let maxRequestsPerMin: number
    if (score !== null && score < 40) {
      maxRequestsPerMin = 30 // Bot-like traffic
    } else {
      maxRequestsPerMin = 100 // Normal traffic
    }

    // Adjust for country risk
    const countryRisk = country ? (countryRiskLevels.get(country.toUpperCase()) || null) : null
    const isHighRiskCountry = countryRisk === 'high' || (country ? DEFAULT_HIGH_RISK_COUNTRIES.has(country.toUpperCase()) : false)
    if (isHighRiskCountry) {
      maxRequestsPerMin = Math.floor(maxRequestsPerMin * 0.5) // Halve for high-risk countries
    } else if (countryRisk === 'medium') {
      maxRequestsPerMin = Math.floor(maxRequestsPerMin * 0.75) // 75% for medium-risk
    }

    // Adjust for time of day (stricter during peak hours)
    const currentHour = new Date().getHours()
    const isPeakHour = currentHour >= PEAK_START_HOUR && currentHour < PEAK_END_HOUR
    if (isPeakHour) {
      maxRequestsPerMin = Math.floor(maxRequestsPerMin * 0.8) // 80% during peak hours
    }

    // Adjust for endpoint sensitivity (auth endpoints get 1/3)
    const path = c.req.path.toLowerCase()
    const isAuthEndpoint = path.includes('/auth/') || path.includes('/login') || path.includes('/register')
    if (isAuthEndpoint) {
      maxRequestsPerMin = Math.floor(maxRequestsPerMin / 3)
    }

    // Use composite key for IP + endpoint type for granular tracking
    const key = `${ip}:${isAuthEndpoint ? 'auth' : 'general'}`
    const state = adaptiveThrottleStore.get(key)

    if (state) {
      // Reset if window expired (60 second window)
      if (now - state.firstSeen > 60_000) {
        state.count = 1
        state.firstSeen = now
      } else {
        state.count++
        if (state.count > maxRequestsPerMin) {
          const retryAfter = Math.ceil((60_000 - (now - state.firstSeen)) / 1000)
          c.header('Retry-After', String(Math.max(1, retryAfter)))
          c.header('X-RateLimit-Limit', String(maxRequestsPerMin))
          c.header('X-RateLimit-Remaining', '0')
          return c.json(
            {
              error: 'Rate limit exceeded',
              code: 'ADAPTIVE_RATE_LIMITED',
              limit: maxRequestsPerMin,
              retryAfter: Math.max(1, retryAfter),
            },
            429
          )
        }
      }
    } else {
      adaptiveThrottleStore.set(key, { count: 1, firstSeen: now })
    }

    // Set rate limit headers for transparency
    const currentState = adaptiveThrottleStore.get(key)
    if (currentState) {
      c.header('X-RateLimit-Limit', String(maxRequestsPerMin))
      c.header('X-RateLimit-Remaining', String(Math.max(0, maxRequestsPerMin - currentState.count)))
    }

    await next()
  }
}

// ─── Advanced Challenge Flow ────────────────────────────────────────────────

/**
 * Challenge Middleware for Hono.
 * For suspicious requests (bot score 20-40):
 * a. Sets X-Challenge-Required: true response header
 * b. For API requests: Returns 202 with challenge details
 * c. The frontend would need to solve a simple hash challenge and resubmit
 * d. Challenge store: In-memory Map with 5-minute TTL for challenge tokens
 */
export function challengeMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    const { score, category } = getBotScore(c)

    // Only challenge suspicious requests (bot score 20-40)
    if (score === null || score < 20 || score > 40) {
      await next()
      return
    }

    // Check if the request already includes a valid challenge response
    const challengeResponse = c.req.header('X-Challenge-Response')
    const challengeToken = c.req.header('X-Challenge-Token')

    if (challengeResponse && challengeToken) {
      // Verify the challenge response
      if (verifyChallengeResponse(challengeToken, challengeResponse)) {
        // Challenge passed — allow the request
        challengeStore.delete(challengeToken)
        await next()
        return
      }
    }

    // Generate a new challenge
    const token = crypto.randomUUID().replace(/-/g, '')
    const difficulty = 3 // Number of leading zeros required in SHA-256 hash

    const entry: ChallengeEntry = {
      token,
      difficulty,
      createdAt: Date.now(),
    }
    challengeStore.set(token, entry)

    // Set challenge headers
    c.header('X-Challenge-Required', 'true')

    // For API requests (JSON accepting), return challenge details
    const accept = c.req.header('accept') || ''
    if (accept.includes('application/json') || c.req.path.startsWith('/api/')) {
      return c.json(
        {
          challenge: 'proof-of-work',
          difficulty,
          token,
          message: 'Solve the SHA-256 hash challenge: find a nonce such that SHA-256(token + nonce) starts with ' + difficulty + ' zero(s)',
        },
        202
      )
    }

    // For non-API requests, just set the header and continue
    // The frontend framework can intercept and handle the challenge
    await next()
  }
}

/**
 * Verify a proof-of-work challenge response.
 * The response must be a nonce such that SHA-256(token + nonce) starts with
 * `difficulty` number of leading zeros.
 */
export function verifyChallengeResponse(challengeToken: string, response: string): boolean {
  const entry = challengeStore.get(challengeToken)

  if (!entry) {
    return false // Token not found or expired
  }

  // Check if challenge has expired
  if (Date.now() - entry.createdAt > CHALLENGE_TTL_MS) {
    challengeStore.delete(challengeToken)
    return false
  }

  // Verify the proof-of-work: SHA-256(token + nonce) must start with `difficulty` zeros
  try {
    const hash = crypto
      .createHash('sha256')
      .update(challengeToken + response)
      .digest('hex')

    const requiredPrefix = '0'.repeat(entry.difficulty)
    const isValid = hash.startsWith(requiredPrefix)

    if (isValid) {
      // Remove the challenge after successful verification
      challengeStore.delete(challengeToken)
    }

    return isValid
  } catch {
    return false
  }
}
