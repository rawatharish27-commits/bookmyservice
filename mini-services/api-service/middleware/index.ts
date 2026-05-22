/**
 * Centralized Middleware Module for BookMyService API
 *
 * Extracts all middleware from the monolithic index.ts into a reusable module.
 * Provides granular functions to apply middleware independently or all at once.
 *
 * Middleware order (applied top-to-bottom, executed in reverse for responses):
 *   1. HTTP Request Logging (Morgan-style)
 *   2. CORS (Cross-Origin Resource Sharing)
 *   3. Security Headers (X-Content-Type-Options, X-Frame-Options, etc.)
 *   4. Request Size Limit (1MB max)
 *   5. Bot Protection (Cloudflare-aware)
 *   6. DDoS Throttle (Cloudflare-aware)
 *   7. Request Validation (path traversal, SQL injection, XSS detection)
 *   8. Cache Headers for public GET endpoints (CDN-friendly)
 *   9. Rate Limiting (per-endpoint granular limits)
 *  10. Global Error Handler (Sentry + logger integration)
 *
 * Usage:
 *   import { applyMiddleware } from './middleware'
 *   const app = new Hono()
 *   applyMiddleware(app)
 *
 * Or apply independently:
 *   import { applyRateLimits, applyCacheHeaders } from './middleware'
 *   applyRateLimits(app)
 *   applyCacheHeaders(app)
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { rateLimiter } from 'hono-rate-limiter'
import {
  getCloudflareRealIP,
  cloudflareCacheHeaders,
  botProtectionMiddleware,
  ddosThrottleMiddleware,
} from '../lib/cloudflare'
import { requestValidationMiddleware } from '../lib/security'
import { captureApiError } from '../lib/sentry'
import { logger, apiLogger, httpLoggingMiddleware } from '../lib/logger'

// ─── Allowed Origins for CORS ──────────────────────────────────────────────

const ALLOWED_ORIGINS = [
  'https://bookmyservice.pages.dev',
  'https://bookyourservice.co.in',
  'https://www.bookyourservice.co.in',
  'https://bookmyservice-eta.vercel.app',
]

// ─── Rate Limit Key Generator ──────────────────────────────────────────────
// Uses Cloudflare real IP for accurate rate limiting behind CDN/proxy

const rlKeyGenerator = (c: any) => getCloudflareRealIP(c)

// ─── Rate Limit Configuration ──────────────────────────────────────────────

interface RateLimitConfig {
  path: string
  windowMs: number
  limit: number
  message: string
}

const RATE_LIMITS: RateLimitConfig[] = [
  {
    path: '/api/auth/login',
    windowMs: 60_000,
    limit: 5,
    message: 'Too many login attempts. Please try again later.',
  },
  {
    path: '/api/auth/register',
    windowMs: 60_000,
    limit: 5,
    message: 'Too many registration attempts. Please try again later.',
  },
  {
    path: '/api/auth/google',
    windowMs: 60_000,
    limit: 5,
    message: 'Too many Google auth attempts. Please try again later.',
  },
  {
    path: '/api/auth/forgot-password',
    windowMs: 60_000,
    limit: 3,
    message: 'Too many password reset attempts. Please try again later.',
  },
  {
    path: '/api/bookings',
    windowMs: 60_000,
    limit: 10,
    message: 'Too many booking requests. Please try again later.',
  },
  {
    // General fallback for other auth routes
    path: '/api/auth/*',
    windowMs: 60_000,
    limit: 20,
    message: 'Too many requests. Please try again later.',
  },
  {
    path: '/api/payments/create-order',
    windowMs: 60_000,
    limit: 5,
    message: 'Too many payment order requests. Please try again later.',
  },
  {
    path: '/api/payments/verify',
    windowMs: 60_000,
    limit: 10,
    message: 'Too many payment verification requests. Please try again later.',
  },
  {
    path: '/api/recommendations',
    windowMs: 60_000,
    limit: 10,
    message: 'Too many recommendation requests. Please try again later.',
  },
  {
    path: '/api/recommendations/search-suggestions',
    windowMs: 60_000,
    limit: 20,
    message: 'Too many search suggestion requests. Please try again later.',
  },
  {
    path: '/api/recommendations/insights',
    windowMs: 60_000,
    limit: 5,
    message: 'Too many insights requests. Please try again later.',
  },
]

// ─── Cache Header Configuration ────────────────────────────────────────────

interface CacheConfig {
  path: string
  /** Cache duration in seconds */
  ttl: number
}

const CACHE_CONFIGS: CacheConfig[] = [
  { path: '/api/categories', ttl: 300 },       // 5 min
  { path: '/api/categories/*', ttl: 300 },      // 5 min
  { path: '/api/services', ttl: 180 },           // 3 min
  { path: '/api/services/*', ttl: 180 },         // 3 min
  { path: '/api/stats', ttl: 300 },              // 5 min
  { path: '/api/stats/*', ttl: 300 },            // 5 min
]

// ─── Apply Global Error Handler ────────────────────────────────────────────
/**
 * Registers the global error handler on the Hono app.
 * Logs errors via Winston logger and captures them in Sentry.
 * In production, internal error messages are not exposed to clients.
 */
export function applyGlobalErrorHandler(app: Hono): void {
  app.onError((err, c) => {
    const method = c.req.method
    const path = c.req.path

    // Log via Winston
    logger.error('Unhandled API Error', { error: err.message, method, path })
    apiLogger.error('API server error', { error: err.message, method, path, event: 'API_500' })

    // Capture in Sentry
    captureApiError(err, { method, path, statusCode: 500 })

    // Don't expose internal errors in production
    const isDev = process.env.NODE_ENV !== 'production'
    return c.json(
      {
        error: 'Internal server error',
        detail: isDev ? (err.message || String(err)) : undefined,
      },
      500,
    )
  })
}

// ─── Apply CORS ────────────────────────────────────────────────────────────
/**
 * Configures and applies CORS middleware.
 * Allows known production origins, localhost/127.0.0.1 for development,
 * and falls back to http://localhost:5173.
 */
function applyCORS(app: Hono): void {
  app.use(
    '*',
    cors({
      origin: (origin, _c) => {
        // Allow known production origins
        if (ALLOWED_ORIGINS.includes(origin)) return origin

        // Allow localhost and sandbox origins
        if (
          origin &&
          (origin.startsWith('http://localhost:') ||
            origin.startsWith('http://127.0.0.1:'))
        ) {
          return origin
        }

        // Default fallback
        return 'http://localhost:5173'
      },
      allowHeaders: ['Content-Type', 'Authorization'],
      allowMethods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      credentials: true,
    }),
  )
}

// ─── Apply Security Headers ────────────────────────────────────────────────
/**
 * Applies security headers to all responses:
 * - X-Content-Type-Options: nosniff
 * - X-Frame-Options: DENY
 * - X-XSS-Protection: 1; mode=block
 * - Referrer-Policy: strict-origin-when-cross-origin
 * - Content-Security-Policy
 */
function applySecurityHeaders(app: Hono): void {
  app.use('*', async (c, next) => {
    await next()
    c.header('X-Content-Type-Options', 'nosniff')
    c.header('X-Frame-Options', 'DENY')
    c.header('X-XSS-Protection', '1; mode=block')
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
    c.header(
      'Content-Security-Policy',
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; img-src 'self' data: blob: https:; font-src 'self' data:; style-src 'self' 'unsafe-inline'",
    )
  })
}

// ─── Apply Request Size Limit ──────────────────────────────────────────────
/**
 * Applies a request body size limit of 1MB.
 * Rejects requests with Content-Length exceeding the limit with 413.
 */
function applyRequestSizeLimit(app: Hono): void {
  app.use('*', async (c, next) => {
    const contentLength = c.req.header('content-length')
    if (contentLength && parseInt(contentLength) > 1024 * 1024) {
      return c.json(
        { error: 'Request body too large. Maximum size is 1MB.' },
        413,
      )
    }
    await next()
  })
}

// ─── Apply Bot Protection & DDoS Throttle ──────────────────────────────────
/**
 * Applies bot protection and DDoS throttle middleware for all API routes.
 * Uses Cloudflare-aware IP detection for accurate throttling.
 */
function applyBotProtection(app: Hono): void {
  app.use('/api/*', botProtectionMiddleware())
  app.use('/api/*', ddosThrottleMiddleware())
}

// ─── Apply Request Validation ──────────────────────────────────────────────
/**
 * Applies request validation middleware for all API routes.
 * Detects and blocks path traversal, SQL injection, XSS, and other attacks.
 */
function applyRequestValidation(app: Hono): void {
  app.use('/api/*', requestValidationMiddleware())
}

// ─── Apply Cache Headers ───────────────────────────────────────────────────
/**
 * Applies CDN-friendly cache headers for public GET endpoints.
 * Uses Cloudflare cache headers for optimal edge caching.
 *
 * Cache durations:
 *   - /api/categories*  → 5 min (300s)
 *   - /api/services*    → 3 min (180s)
 *   - /api/stats*       → 5 min (300s)
 */
export function applyCacheHeaders(app: Hono): void {
  for (const { path, ttl } of CACHE_CONFIGS) {
    app.use(path, cloudflareCacheHeaders(ttl))
  }
}

// ─── Apply Rate Limits ─────────────────────────────────────────────────────
/**
 * Applies granular per-endpoint rate limiting using hono-rate-limiter.
 * Uses Cloudflare real IP as the key generator for accurate rate limiting
 * behind CDN/proxy.
 *
 * Rate limits (per minute):
 *   - /api/auth/login            → 5/min
 *   - /api/auth/register         → 5/min
 *   - /api/auth/google           → 5/min
 *   - /api/auth/forgot-password  → 3/min
 *   - /api/bookings              → 10/min
 *   - /api/auth/* (fallback)     → 20/min
 *   - /api/payments/create-order → 5/min
 *   - /api/payments/verify       → 10/min
 *   - /api/recommendations       → 10/min
 *   - /api/recommendations/search-suggestions → 20/min
 *   - /api/recommendations/insights           → 5/min
 */
export function applyRateLimits(app: Hono): void {
  for (const { path, windowMs, limit, message } of RATE_LIMITS) {
    app.use(
      path,
      rateLimiter({
        windowMs,
        limit,
        keyGenerator: rlKeyGenerator,
        message: { error: message, code: 'RATE_LIMITED' },
        statusCode: 429,
      }),
    )
  }
}

// ─── Apply HTTP Logging ────────────────────────────────────────────────────
/**
 * Applies Morgan-style HTTP request logging middleware.
 * Logs method, path, status, duration, user agent, and IP for every request.
 */
function applyHTTPLogging(app: Hono): void {
  app.use('*', httpLoggingMiddleware())
}

// ─── Apply All Middleware ──────────────────────────────────────────────────
/**
 * Applies ALL middleware to the Hono app in the correct order.
 * This is the primary entry point for middleware setup.
 *
 * Middleware is applied in this order (which determines execution sequence):
 *   1. HTTP Request Logging     — logs every request/response
 *   2. CORS                     — handles cross-origin requests
 *   3. Global Error Handler     — catches unhandled errors
 *   4. Security Headers         — adds security headers to responses
 *   5. Request Size Limit       — rejects oversized request bodies
 *   6. Bot Protection           — blocks known malicious bots
 *   7. DDoS Throttle            — throttles excessive requests per IP
 *   8. Request Validation       — blocks path traversal, SQLi, XSS
 *   9. Cache Headers            — sets CDN cache headers for public endpoints
 *  10. Rate Limiting            — enforces per-endpoint rate limits
 */
export function applyMiddleware(app: Hono): void {
  // 1. HTTP Request Logging (Morgan-style)
  applyHTTPLogging(app)

  // 2. CORS
  applyCORS(app)

  // 3. Global Error Handler (Sentry + logger)
  applyGlobalErrorHandler(app)

  // 4. Security Headers
  applySecurityHeaders(app)

  // 5. Request Size Limit (1MB max)
  applyRequestSizeLimit(app)

  // 6. Bot Protection & DDoS Throttle (Cloudflare-aware)
  applyBotProtection(app)

  // 7. Request Validation (path traversal, SQL injection, XSS detection)
  applyRequestValidation(app)

  // 8. Cache Headers for public GET endpoints (CDN-friendly)
  applyCacheHeaders(app)

  // 9. Rate Limiting (per-endpoint granular limits)
  applyRateLimits(app)
}
