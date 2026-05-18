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
 */

import type { MiddlewareHandler } from 'hono'

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
