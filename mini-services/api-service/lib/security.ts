/**
 * Security Utilities Module for BookMyService API
 *
 * Provides production security enhancements:
 * - Input sanitization (XSS vectors)
 * - Origin validation for CORS
 * - CSP nonce generation
 * - SQL injection detection
 * - XSS detection
 * - Enhanced security headers middleware
 * - Request validation middleware (path traversal, etc.)
 */

import type { MiddlewareHandler } from 'hono'
import crypto from 'crypto'

// ─── Input Sanitization ──────────────────────────────────────────────────────

/**
 * Sanitize input string by removing XSS vectors.
 * Strips script tags, event handlers, javascript: URLs, and encoded variants.
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return input

  let sanitized = input

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '')

  // Remove script tags and their contents
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  // Remove event handler attributes (onclick, onload, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '')

  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript\s*:/gi, '')

  // Remove data: URLs that could contain scripts
  sanitized = sanitized.replace(/data\s*:\s*text\/html/gi, '')

  // Remove vbscript: URLs
  sanitized = sanitized.replace(/vbscript\s*:/gi, '')

  // Remove expression() CSS (IE-specific XSS)
  sanitized = sanitized.replace(/expression\s*\(/gi, '')

  // Remove <iframe>, <object>, <embed>, <form> tags
  sanitized = sanitized.replace(/<(iframe|object|embed|form)\b[^>]*>.*?<\/\1>/gi, '')
  sanitized = sanitized.replace(/<(iframe|object|embed|form)\b[^>]*\/?>/gi, '')

  // Remove <svg> with script content
  sanitized = sanitized.replace(/<svg\b[^>]*>.*?<\/svg>/gi, '')

  // Remove base64 encoded script attempts
  sanitized = sanitized.replace(/base64\s*,\s*[A-Za-z0-9+/=]+/gi, '')

  return sanitized.trim()
}

// ─── Origin Validation ───────────────────────────────────────────────────────

/**
 * Validate that the request origin matches allowed origins.
 * Supports exact matching and wildcard subdomain patterns.
 */
export function isValidOrigin(origin: string, allowedOrigins: string[]): boolean {
  if (!origin) return false

  for (const allowed of allowedOrigins) {
    // Exact match
    if (origin === allowed) return true

    // Wildcard subdomain match (e.g., *.bookyourservice.co.in)
    if (allowed.startsWith('*.')) {
      const domain = allowed.slice(2) // Remove *.
      if (origin.endsWith(domain) || origin === domain.slice(1)) {
        return true
      }
    }

    // Regex match
    if (allowed.startsWith('/') && allowed.endsWith('/')) {
      try {
        const pattern = new RegExp(allowed.slice(1, -1))
        if (pattern.test(origin)) return true
      } catch {
        // Invalid regex — skip
      }
    }
  }

  return false
}

// ─── CSP Nonce Generation ────────────────────────────────────────────────────

/**
 * Generate a Content Security Policy nonce for inline scripts.
 * Each request gets a unique nonce that must be included in the CSP header
 * and referenced by any allowed inline script tags.
 */
export function generateCSPNonce(): string {
  return crypto.randomBytes(16).toString('base64')
}

// ─── SQL Injection Detection ─────────────────────────────────────────────────

const SQL_INJECTION_PATTERNS = [
  /(\b(union\s+select|union\s+all\s+select)\b)/i,
  /(\b(select\s+.+\s+from)\b)/i,
  /(\b(insert\s+into)\b)/i,
  /(\b(delete\s+from)\b)/i,
  /(\b(drop\s+(table|database|schema))\b)/i,
  /(\b(truncate\s+table)\b)/i,
  /(\b(alter\s+table)\b)/i,
  /(\b(update\s+.+\s+set)\b)/i,
  /(--\s*$)/m,                    // SQL comment at end
  /(;\s*(drop|delete|truncate|alter|create)\b)/i,  // Stacked queries
  /('\s*(or|and)\s+['\d])/i,      // ' OR '1'='1
  /(\bor\s+1\s*=\s*1\b)/i,       // OR 1=1
  /(\band\s+1\s*=\s*1\b)/i,      // AND 1=1
  /('\s*;\s*)/,                   // Quote + semicolon
  /(\bexec\s*\()/i,               // exec()
  /(\bexecute\s*\()/i,            // execute()
  /(\bxp_cmdshell\b)/i,           // SQL Server
  /(\binformation_schema\b)/i,
  /(\bsysobjects\b)/i,
  /(\bsyscolumns\b)/i,
  /(\bpg_catalog\b)/i,            // PostgreSQL
  /(\bdba_objects\b)/i,           // Oracle
]

/**
 * Detect basic SQL injection patterns in input string.
 * Returns true if potential SQL injection is detected.
 * This is a supplemental check — parameterized queries are the primary defense.
 */
export function detectSQLInjection(input: string): boolean {
  if (!input || typeof input !== 'string') return false

  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(input)) return true
  }

  return false
}

// ─── XSS Detection ───────────────────────────────────────────────────────────

const XSS_PATTERNS = [
  /<script\b[^>]*>/i,
  /<\/script>/i,
  /javascript\s*:/i,
  /vbscript\s*:/i,
  /on(click|load|error|mouseover|focus|blur|submit|change|keydown|keyup|keypress|mouseout|mousemove|resize|unload|abort)\s*=/i,
  /<img\b[^>]*\bon\w+\s*=/i,
  /<svg\b[^>]*\bon\w+\s*=/i,
  /<body\b[^>]*\bon\w+\s*=/i,
  /<iframe\b/i,
  /<object\b/i,
  /<embed\b/i,
  /<link\b[^>]*\brel\s*=\s*["']stylesheet["']/i,
  /expression\s*\(/i,
  /url\s*\(\s*javascript/i,
  /data\s*:\s*text\/html/i,
  /<meta\b[^>]*\bhttp-equiv\s*=\s*["']refresh["']/i,
  /<base\b/i,
  /<form\b/i,
  /&#x[0-9a-f]+;/i,              // Hex-encoded entities
  /&#\d+;/i,                      // Decimal-encoded entities (suspicious in API input)
  /%3cscript/i,                   // URL-encoded <script
  /%3c%73%63%72%69%70%74/i,       // Fully URL-encoded <script
]

/**
 * Detect basic XSS patterns in input string.
 * Returns true if potential XSS is detected.
 */
export function detectXSS(input: string): boolean {
  if (!input || typeof input !== 'string') return false

  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(input)) return true
  }

  return false
}

// ─── Security Headers Middleware ──────────────────────────────────────────────

/**
 * Enhanced security headers middleware for production.
 * Adds comprehensive security headers that complement Cloudflare's protections.
 * This should be used in addition to the existing basic security headers middleware.
 */
export function securityHeadersMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    await next()

    // Prevent MIME type sniffing
    c.header('X-Content-Type-Options', 'nosniff')

    // Prevent clickjacking
    c.header('X-Frame-Options', 'DENY')

    // Enable XSS filter in browsers
    c.header('X-XSS-Protection', '1; mode=block')

    // Control referrer information
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin')

    // Restrict browser features
    c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self), payment=()')

    // HSTS — force HTTPS (only set in production, 1 year + preload)
    if (process.env.NODE_ENV === 'production') {
      c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
    }

    // Prevent caching of API responses by default (can be overridden per-route)
    c.header('Pragma', 'no-cache')

    // Remove server identification
    c.header('X-Powered-By', '')

    // Add nonce to CSP if available (stored in c.set by requestValidationMiddleware)
    const nonce = c.get?.('cspNonce') as string | undefined
    const cspNonceDirective = nonce ? ` 'nonce-${nonce}'` : ''

    c.header(
      'Content-Security-Policy',
      `default-src 'self'${cspNonceDirective} 'unsafe-inline' 'unsafe-eval' data: blob:; img-src 'self' data: blob: https:; font-src 'self' data:; style-src 'self' 'unsafe-inline'`
    )
  }
}

// ─── Request Validation Middleware ────────────────────────────────────────────

/**
 * Validate request patterns to detect and block:
 * - Path traversal attempts (../, ..%2f, etc.)
 * - Suspicious query parameters
 * - Malformed URLs
 * - Header injection attempts
 */
export function requestValidationMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    const path = c.req.path
    const query = c.req.url.split('?')[1] || ''

    // ─── Path Traversal Detection ────────────────────────────────────────
    const pathTraversalPatterns = [
      /\.\./,                    // ../
      /%2e%2e/i,                // URL-encoded ..
      /%2e\./i,                 // Mixed encoding
      /\.\.%2f/i,               // Mixed encoding
      /%2e%2e%2f/i,             // Fully URL-encoded ../
      /%252e/i,                 // Double URL-encoding
      /\.\.\\/,                 // Windows-style path traversal
      /%5c/i,                   // URL-encoded backslash
    ]

    for (const pattern of pathTraversalPatterns) {
      if (pattern.test(path) || pattern.test(query)) {
        return c.json({ error: 'Invalid request path', code: 'PATH_TRAVERSAL' }, 400)
      }
    }

    // ─── Null Byte Injection ─────────────────────────────────────────────
    if (path.includes('\0') || query.includes('\0')) {
      return c.json({ error: 'Invalid request', code: 'NULL_BYTE' }, 400)
    }

    // ─── Excessive Path Depth ────────────────────────────────────────────
    const pathSegments = path.split('/').filter(Boolean)
    if (pathSegments.length > 20) {
      return c.json({ error: 'Request path too deep', code: 'PATH_TOO_DEEP' }, 400)
    }

    // ─── Query Parameter Length ──────────────────────────────────────────
    if (query.length > 5000) {
      return c.json({ error: 'Query string too long', code: 'QUERY_TOO_LONG' }, 400)
    }

    // ─── SQL Injection in Path/Query ─────────────────────────────────────
    if (detectSQLInjection(decodeURIComponent(path)) || detectSQLInjection(decodeURIComponent(query))) {
      return c.json({ error: 'Invalid request', code: 'SQL_INJECTION' }, 400)
    }

    // ─── XSS in Path/Query ──────────────────────────────────────────────
    if (detectXSS(decodeURIComponent(path)) || detectXSS(decodeURIComponent(query))) {
      return c.json({ error: 'Invalid request', code: 'XSS_DETECTED' }, 400)
    }

    // ─── Header Injection ────────────────────────────────────────────────
    const host = c.req.header('host') || ''
    if (host.includes('\r') || host.includes('\n')) {
      return c.json({ error: 'Invalid host header', code: 'HEADER_INJECTION' }, 400)
    }

    // ─── Generate CSP nonce for this request ─────────────────────────────
    const nonce = generateCSPNonce()
    c.set('cspNonce', nonce)

    await next()
  }
}

// ─── WAF-Level Rule Engine ───────────────────────────────────────────────

/**
 * WAF Action returned by the firewall evaluation.
 */
export interface WAFAction {
  action: 'allow' | 'challenge' | 'block'
  score: number
  reason?: string
}

/**
 * Internal tracking record for each IP address.
 */
interface IPRecord {
  score: number
  lastSeen: number          // timestamp of last activity
  banned: boolean
  banExpiry: number | null  // timestamp when ban expires
  violations: string[]      // recent violation types
}

/**
 * Violation type → score increment mapping.
 */
const VIOLATION_SCORES: Record<string, number> = {
  'sql_injection': 30,
  'xss': 25,
  'path_traversal': 20,
  'rapid_401_403': 15,
  'unusual_user_agent': 10,
}

/**
 * WAFFirewall — A Web Application Firewall rule engine that tracks IP behavior
 * scores and auto-bans suspicious IPs.
 *
 * Score range: 0–100 (higher = more suspicious)
 * Auto-ban threshold: 80 (banned for 1 hour)
 * Score decay: 5 points every 10 minutes
 */
class WAFFirewall {
  private ipRecords = new Map<string, IPRecord>()
  private decayInterval: NodeJS.Timeout

  constructor() {
    // Decay scores by 5 points every 10 minutes
    this.decayInterval = setInterval(() => {
      this.decayScores()
    }, 10 * 60 * 1000)
  }

  /**
   * Evaluate an incoming request against WAF rules.
   * @param ip - Client IP address
   * @param violations - Array of violation type strings detected for this request
   * @returns WAFAction determining whether to allow, challenge, or block
   */
  evaluateRequest(ip: string, violations: string[]): WAFAction {
    let record = this.ipRecords.get(ip)

    if (!record) {
      record = { score: 0, lastSeen: Date.now(), banned: false, banExpiry: null, violations: [] }
      this.ipRecords.set(ip, record)
    }

    // Check if currently banned
    if (record.banned) {
      if (record.banExpiry && Date.now() < record.banExpiry) {
        return { action: 'block', score: record.score, reason: `IP banned until ${new Date(record.banExpiry).toISOString()}` }
      }
      // Ban expired
      record.banned = false
      record.banExpiry = null
    }

    // Accumulate score from violations
    for (const violation of violations) {
      const increment = VIOLATION_SCORES[violation] || 5 // default 5 for unknown violations
      record.score = Math.min(100, record.score + increment)
      record.violations.push(violation)
    }

    record.lastSeen = Date.now()

    // Trim violations list to last 50
    if (record.violations.length > 50) {
      record.violations = record.violations.slice(-50)
    }

    // Auto-ban if score exceeds 80
    if (record.score >= 80) {
      record.banned = true
      record.banExpiry = Date.now() + 60 * 60 * 1000 // 1 hour
      return { action: 'block', score: record.score, reason: `Score ${record.score} exceeds threshold 80 — auto-banned for 1 hour` }
    }

    // Challenge if score is between 50–79
    if (record.score >= 50) {
      return { action: 'challenge', score: record.score, reason: `Score ${record.score} — challenge required` }
    }

    return { action: 'allow', score: record.score }
  }

  /**
   * Get the current suspicion score for an IP address.
   */
  getIPScore(ip: string): number {
    const record = this.ipRecords.get(ip)
    if (!record) return 0

    // If banned and ban hasn't expired, return full score
    if (record.banned && record.banExpiry && Date.now() < record.banExpiry) {
      return record.score
    }

    return record.score
  }

  /**
   * Reset (unban) an IP address — for admin use.
   */
  resetIP(ip: string): void {
    this.ipRecords.delete(ip)
  }

  /**
   * Decay all IP scores by 5 points. Called every 10 minutes.
   * Also cleans up expired bans.
   */
  private decayScores(): void {
    const now = Date.now()
    for (const [ip, record] of this.ipRecords) {
      // Decay score
      record.score = Math.max(0, record.score - 5)

      // Check if ban expired
      if (record.banned && record.banExpiry && now >= record.banExpiry) {
        record.banned = false
        record.banExpiry = null
      }

      // Remove records with score 0 that haven't been seen in 2 hours
      if (record.score === 0 && !record.banned && (now - record.lastSeen > 2 * 60 * 60 * 1000)) {
        this.ipRecords.delete(ip)
      }
    }
  }

  /**
   * Get total number of tracked IPs (for monitoring).
   */
  getTrackedIPCount(): number {
    return this.ipRecords.size
  }

  /**
   * Get all currently banned IPs (for admin dashboard).
   */
  getBannedIPs(): Array<{ ip: string; score: number; banExpiry: Date | null }> {
    const banned: Array<{ ip: string; score: number; banExpiry: Date | null }> = []
    for (const [ip, record] of this.ipRecords) {
      if (record.banned) {
        banned.push({ ip, score: record.score, banExpiry: record.banExpiry ? new Date(record.banExpiry) : null })
      }
    }
    return banned
  }

  /**
   * Shutdown the WAF (clear interval).
   */
  shutdown(): void {
    clearInterval(this.decayInterval)
    this.ipRecords.clear()
  }
}

/** Singleton WAF instance */
export const waf = new WAFFirewall()

// ─── Session Fingerprinting ──────────────────────────────────────────────

/**
 * SessionFingerprinter — Generates device fingerprints and detects anomalous
 * session changes (e.g., new device login).
 *
 * Fingerprint is a SHA-256 hash of: user-agent + accept-language + accept-encoding
 */
class SessionFingerprinter {
  private userDevices = new Map<string, Set<string>>()

  /**
   * Generate a device fingerprint from request headers.
   * Uses SHA-256 hash of user-agent + accept-language + accept-encoding.
   */
  generateFingerprint(userAgent: string, acceptLanguage: string, acceptEncoding: string): string {
    const raw = `${userAgent}||${acceptLanguage}||${acceptEncoding}`
    return crypto.createHash('sha256').update(raw).digest('hex')
  }

  /**
   * Register a session for a user. Detects if this is a new device.
   * @param userId - The user's ID
   * @param fingerprint - The device fingerprint hash
   * @returns Object indicating whether this is a new device
   */
  registerSession(userId: string, fingerprint: string): { isNewDevice: boolean } {
    let devices = this.userDevices.get(userId)
    const isNewDevice = !devices || !devices.has(fingerprint)

    if (!devices) {
      devices = new Set<string>()
      this.userDevices.set(userId, devices)
    }

    devices.add(fingerprint)
    return { isNewDevice }
  }

  /**
   * Get all registered device fingerprints for a user.
   */
  getUserDevices(userId: string): string[] {
    const devices = this.userDevices.get(userId)
    return devices ? Array.from(devices) : []
  }

  /**
   * Clear all registered sessions/devices for a user.
   */
  clearUserSessions(userId: string): void {
    this.userDevices.delete(userId)
  }

  /**
   * Get the number of devices registered for a user.
   */
  getDeviceCount(userId: string): number {
    const devices = this.userDevices.get(userId)
    return devices ? devices.size : 0
  }

  /**
   * Check if a fingerprint is recognized for a user.
   */
  isKnownDevice(userId: string, fingerprint: string): boolean {
    const devices = this.userDevices.get(userId)
    return devices ? devices.has(fingerprint) : false
  }
}

/** Singleton fingerprinter instance */
export const fingerprinter = new SessionFingerprinter()

// ─── Allowlist Validation Strategy ───────────────────────────────────────

/**
 * Strict allowlist validation against known input schemas.
 * Instead of deny-list regex (block bad patterns), this uses allowlist
 * regex (only allow known good patterns).
 */

/** RFC 5322 compliant email regex */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

/** Indian phone number: +91 followed by 10 digits, or just 10 digits starting with 6-9 */
const PHONE_REGEX = /^(\+91[-\s]?)?[6-9]\d{9}$/

/** Name: letters, spaces, hyphens, apostrophes only (2-100 chars) */
const NAME_REGEX = /^[a-zA-Z\s'-]{2,100}$/

/** Indian pincode: exactly 6 digits */
const PINCODE_REGEX = /^\d{6}$/

/** URL: http or https only, no javascript/data protocol */
const URL_REGEX = /^https?:\/\/[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*(:\d{1,5})?(\/[^\s]*)?$/

/**
 * Validate an input string against a strict allowlist schema.
 * Returns validation result with sanitized value and optional reason for failure.
 *
 * @param input - The input string to validate
 * @param schema - The schema type to validate against
 * @returns Object with valid flag, sanitized string, and optional failure reason
 */
export function validateAgainstSchema(
  input: string,
  schema: 'email' | 'phone' | 'name' | 'pincode' | 'url'
): { valid: boolean; sanitized: string; reason?: string } {
  if (!input || typeof input !== 'string') {
    return { valid: false, sanitized: '', reason: `${schema}: input is required` }
  }

  // Basic sanitization: trim whitespace and remove null bytes
  let sanitized = input.trim().replace(/\0/g, '')

  switch (schema) {
    case 'email': {
      // Additional sanitization: lowercase, remove surrounding dots/spaces
      sanitized = sanitized.toLowerCase().replace(/\s+/g, '')

      if (sanitized.length > 254) {
        return { valid: false, sanitized, reason: 'email: exceeds maximum length of 254 characters' }
      }

      if (!EMAIL_REGEX.test(sanitized)) {
        return { valid: false, sanitized, reason: 'email: does not match RFC 5322 format' }
      }

      return { valid: true, sanitized }
    }

    case 'phone': {
      // Remove spaces, dashes, parentheses for normalization
      sanitized = sanitized.replace(/[\s\-()]/g, '')

      if (!PHONE_REGEX.test(sanitized)) {
        return { valid: false, sanitized, reason: 'phone: must be a valid Indian phone number (+91 or 10 digits starting with 6-9)' }
      }

      // Normalize: if it starts with +91, keep it; otherwise prepend +91
      if (!sanitized.startsWith('+91')) {
        sanitized = '+91' + sanitized
      }

      return { valid: true, sanitized }
    }

    case 'name': {
      // Normalize unicode to NFC form
      sanitized = sanitized.normalize('NFC')

      // Remove excessive whitespace
      sanitized = sanitized.replace(/\s+/g, ' ').trim()

      if (!NAME_REGEX.test(sanitized)) {
        return { valid: false, sanitized, reason: 'name: must contain only letters, spaces, hyphens, and apostrophes (2-100 chars)' }
      }

      return { valid: true, sanitized }
    }

    case 'pincode': {
      // Remove any spaces
      sanitized = sanitized.replace(/\s/g, '')

      if (!PINCODE_REGEX.test(sanitized)) {
        return { valid: false, sanitized, reason: 'pincode: must be exactly 6 digits' }
      }

      return { valid: true, sanitized }
    }

    case 'url': {
      // Remove whitespace
      sanitized = sanitized.replace(/\s/g, '')

      // Reject javascript: and data: protocols
      const lowerSanitized = sanitized.toLowerCase()
      if (lowerSanitized.startsWith('javascript:') || lowerSanitized.startsWith('data:') || lowerSanitized.startsWith('vbscript:')) {
        return { valid: false, sanitized: '', reason: 'url: only http and https protocols are allowed' }
      }

      if (sanitized.length > 2048) {
        return { valid: false, sanitized, reason: 'url: exceeds maximum length of 2048 characters' }
      }

      if (!URL_REGEX.test(sanitized)) {
        return { valid: false, sanitized, reason: 'url: must be a valid http or https URL' }
      }

      return { valid: true, sanitized }
    }

    default:
      return { valid: false, sanitized, reason: `Unknown schema: ${schema}` }
  }
}

// ─── Hono WAF Middleware ─────────────────────────────────────────────────

/**
 * WAF Middleware for Hono — integrates WAF evaluation into the request pipeline.
 *
 * Flow:
 * 1. Detect violations from the request (SQL injection, XSS, path traversal, etc.)
 * 2. Evaluate the request via the WAF engine
 * 3. If WAF says 'block' → return 403
 * 4. If WAF says 'challenge' → add X-WAF-Challenge header and continue
 * 5. If WAF says 'allow' → continue normally
 * 6. Always inject WAF score into context: c.set('wafScore', score)
 */
export function wafMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim()
      || c.req.header('x-real-ip')
      || 'unknown'

    const violations: string[] = []

    // Check for SQL injection in path and query
    const path = c.req.path
    const query = c.req.url.split('?')[1] || ''

    try {
      if (detectSQLInjection(decodeURIComponent(path)) || detectSQLInjection(decodeURIComponent(query))) {
        violations.push('sql_injection')
      }
    } catch {
      // URI decode failure — ignore
    }

    // Check for XSS in path and query
    try {
      if (detectXSS(decodeURIComponent(path)) || detectXSS(decodeURIComponent(query))) {
        violations.push('xss')
      }
    } catch {
      // URI decode failure — ignore
    }

    // Check for path traversal
    const pathTraversalPatterns = [/\.\./, /%2e%2e/i, /%2e\./i, /\.\.%2f/i, /%2e%2e%2f/i]
    for (const pattern of pathTraversalPatterns) {
      if (pattern.test(path) || pattern.test(query)) {
        violations.push('path_traversal')
        break
      }
    }

    // Check for unusual user agent (empty or known bot/attack patterns)
    const userAgent = c.req.header('user-agent') || ''
    if (!userAgent || /^(sqlmap|nikto|nmap|masscan|zgrab|nuclei|dirbuster|gobuster|wfuzz)/i.test(userAgent)) {
      violations.push('unusual_user_agent')
    }

    // Evaluate request against WAF
    const wafResult = waf.evaluateRequest(ip, violations)

    // Inject WAF score into context
    c.set('wafScore', wafResult.score)

    // Handle WAF decision
    if (wafResult.action === 'block') {
      return c.json(
        { error: 'Request blocked by WAF', code: 'WAF_BLOCKED', reason: wafResult.reason },
        403
      )
    }

    if (wafResult.action === 'challenge') {
      c.header('X-WAF-Challenge', 'true')
    }

    await next()
  }
}
