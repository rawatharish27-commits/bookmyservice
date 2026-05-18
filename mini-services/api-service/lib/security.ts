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
