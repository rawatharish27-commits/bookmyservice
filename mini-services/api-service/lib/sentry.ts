// ─── Sentry Monitoring Integration ──────────────────────────────────────
// Tracks: API failures, DB errors, memory leaks, unhandled exceptions
//
// Setup: Set SENTRY_DSN environment variable to enable Sentry.
// Without SENTRY_DSN, all operations are no-ops (graceful fallback).
//
// Features:
//   - Automatic unhandled exception/rejection tracking
//   - API error capture with request context
//   - DB error tracking with query context
//   - Memory usage monitoring (periodic check)
//   - Performance transaction tracking
//   - User context enrichment (after auth)

import * as Sentry from '@sentry/node'

// ─── Initialize Sentry ─────────────────────────────────────────────────
let sentryInitialized = false

export function initSentry(): void {
  const dsn = process.env.SENTRY_DSN

  if (!dsn) {
    console.log('🔍 Sentry: SENTRY_DSN not set — monitoring disabled (no-op fallback)')
    return
  }

  try {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || 'development',
      release: process.env.SENTRY_RELEASE || 'bookmyservice-api@1.0.0',

      // Performance monitoring
      tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),

      // Profile sampling
      profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || '0.1'),

      // Ignore noisy errors
      ignoreErrors: [
        'ERR_JWT_EXPIRED',
        'ERR_JWS_INVALID',
        'TOKEN_EXPIRED',
        'RATE_LIMITED',
        'NotFound',
        'Unauthorized',
      ],

      // Don't send PII by default
      sendDefaultPii: false,

      // Maximum breadcrumbs
      maxBreadcrumbs: 50,

      // Attach stack traces
      attachStacktrace: true,
    })

    sentryInitialized = true
    console.log('🔍 Sentry: Monitoring enabled')
  } catch (err: any) {
    console.warn('🔍 Sentry: Initialization failed —', err.message)
  }
}

// ─── Capture API Error ─────────────────────────────────────────────────
export function captureApiError(
  error: Error | unknown,
  context?: {
    method?: string
    path?: string
    statusCode?: number
    userId?: string
    requestBody?: Record<string, any>
  }
): string | undefined {
  if (!sentryInitialized) return undefined

  return Sentry.captureException(error, {
    tags: {
      category: 'api',
      method: context?.method,
      path: context?.path,
      statusCode: context?.statusCode,
    },
    user: context?.userId ? { id: context.userId } : undefined,
    extra: {
      requestBody: context?.requestBody ? sanitizeForSentry(context.requestBody) : undefined,
    },
  })
}

// ─── Capture DB Error ──────────────────────────────────────────────────
export function captureDbError(
  error: Error | unknown,
  context?: {
    operation?: string
    table?: string
    query?: string
  }
): string | undefined {
  if (!sentryInitialized) return undefined

  return Sentry.captureException(error, {
    tags: {
      category: 'database',
      operation: context?.operation,
      table: context?.table,
    },
    extra: {
      query: context?.query ? sanitizeQuery(context.query) : undefined,
    },
  })
}

// ─── Capture Memory Issue ──────────────────────────────────────────────
export function captureMemoryIssue(
  context: {
    heapUsed: number
    heapTotal: number
    rss: number
    external: number
  }
): void {
  if (!sentryInitialized) return

  const { heapUsed, heapTotal, rss } = context
  const heapUsagePercent = (heapUsed / heapTotal) * 100

  Sentry.captureMessage('High memory usage detected', {
    level: 'warning',
    tags: { category: 'memory', alert: 'high_memory' },
    extra: {
      heapUsedMB: Math.round(heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(heapTotal / 1024 / 1024),
      rssMB: Math.round(rss / 1024 / 1024),
      heapUsagePercent: Math.round(heapUsagePercent),
    },
  })
}

// ─── Set User Context ──────────────────────────────────────────────────
export function setSentryUser(user: { id: string; email?: string; role?: string }): void {
  if (!sentryInitialized) return
  Sentry.setUser(user)
}

// ─── Clear User Context ────────────────────────────────────────────────
export function clearSentryUser(): void {
  if (!sentryInitialized) return
  Sentry.setUser(null)
}

// ─── Add Breadcrumb ────────────────────────────────────────────────────
export function addBreadcrumb(breadcrumb: {
  category: string
  message: string
  level?: Sentry.SeverityLevel
  data?: Record<string, any>
}): void {
  if (!sentryInitialized) return
  Sentry.addBreadcrumb({
    ...breadcrumb,
    timestamp: Date.now() / 1000,
  })
}

// ─── Start Performance Transaction ─────────────────────────────────────
export function startTransaction(name: string, op: string): Sentry.Transaction | null {
  if (!sentryInitialized) return null
  return Sentry.startTransaction({ name, op })
}

// ─── Memory Monitoring ─────────────────────────────────────────────────
// Periodically checks memory usage and reports issues to Sentry
let memoryMonitorInterval: NodeJS.Timeout | null = null

export function startMemoryMonitoring(checkIntervalMs: number = 60_000): void {
  if (!sentryInitialized) return
  if (memoryMonitorInterval) return

  const MEMORY_THRESHOLD_MB = 450 // Alert if heap > 450MB

  memoryMonitorInterval = setInterval(() => {
    const mem = process.memoryUsage()
    const heapUsedMB = mem.heapUsed / 1024 / 1024

    if (heapUsedMB > MEMORY_THRESHOLD_MB) {
      captureMemoryIssue({
        heapUsed: mem.heapUsed,
        heapTotal: mem.heapTotal,
        rss: mem.rss,
        external: mem.external,
      })
    }
  }, checkIntervalMs)
}

export function stopMemoryMonitoring(): void {
  if (memoryMonitorInterval) {
    clearInterval(memoryMonitorInterval)
    memoryMonitorInterval = null
  }
}

// ─── Sentry Status ─────────────────────────────────────────────────────
export function getSentryStatus(): { enabled: boolean; environment: string } {
  return {
    enabled: sentryInitialized,
    environment: process.env.NODE_ENV || 'development',
  }
}

// ─── Sanitization Helpers ──────────────────────────────────────────────
function sanitizeForSentry(obj: Record<string, any>): Record<string, any> {
  const sensitiveKeys = ['password', 'passwordHash', 'token', 'accessToken', 'creditCard', 'otp']
  const sanitized: Record<string, any> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
      sanitized[key] = '[REDACTED]'
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

function sanitizeQuery(query: string): string {
  // Remove parameter values from SQL queries for security
  return query.replace(/\$\d+/g, '$?').replace(/'[^']*'/g, "'***'")
}
