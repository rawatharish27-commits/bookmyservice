// ─── Structured Logging System ──────────────────────────────────────────
// Winston-based logging with multiple transports (console, file, error file)
// + Morgan HTTP request logging middleware for Hono.
//
// Log Levels: error > warn > info > http > verbose > debug > silly
//
// Log Files:
//   logs/combined.log   → All logs (info and above)
//   logs/error.log      → Error logs only
//   logs/auth.log       → Auth events (failed logins, suspicious attempts)
//   logs/booking.log    → Booking events (failed bookings, payment failures)
//   logs/api.log        → API events (500 errors, slow APIs)
//
// Usage:
//   import { logger, authLogger, bookingLogger, apiLogger } from './lib/logger'
//   logger.info('Server started', { port: 3001 })
//   authLogger.warn('Failed login attempt', { email, ip })
//   bookingLogger.error('Booking creation failed', { userId, error })
//   apiLogger.error('500 Internal Server Error', { method, path, duration })

import winston from 'winston'
import fs from 'fs'
import path from 'path'
import readline from 'readline'

// ─── Log Format ────────────────────────────────────────────────────────
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
)

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : ''
    return `${timestamp} [${level}]: ${message}${metaStr}`
  }),
)

// ─── Shared Transports ─────────────────────────────────────────────────
const transports = {
  console: new winston.transports.Console({
    level: process.env.LOG_LEVEL || 'info',
    format: consoleFormat,
  }),
  combinedFile: new winston.transports.File({
    filename: 'logs/combined.log',
    level: 'info',
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    tailable: true,
  }),
  errorFile: new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    tailable: true,
  }),
}

// ─── Main Logger ───────────────────────────────────────────────────────
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'bookmyservice-api' },
  transports: [
    transports.console,
    transports.combinedFile,
    transports.errorFile,
  ],
  exitOnError: false,
})

// ─── Auth Logger ───────────────────────────────────────────────────────
// Tracks: failed logins, suspicious attempts, registration events
export const authLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'bookmyservice-api', category: 'auth' },
  transports: [
    transports.console,
    new winston.transports.File({
      filename: 'logs/auth.log',
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
      tailable: true,
    }),
    transports.errorFile,
  ],
  exitOnError: false,
})

// ─── Booking Logger ────────────────────────────────────────────────────
// Tracks: failed bookings, payment failures, booking status changes
export const bookingLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'bookmyservice-api', category: 'booking' },
  transports: [
    transports.console,
    new winston.transports.File({
      filename: 'logs/booking.log',
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
      tailable: true,
    }),
    transports.errorFile,
  ],
  exitOnError: false,
})

// ─── API Logger ────────────────────────────────────────────────────────
// Tracks: 500 errors, slow APIs, request/response metrics
export const apiLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'bookmyservice-api', category: 'api' },
  transports: [
    transports.console,
    new winston.transports.File({
      filename: 'logs/api.log',
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
      tailable: true,
    }),
    transports.errorFile,
  ],
  exitOnError: false,
})

// ─── Hono HTTP Logging Middleware ───────────────────────────────────────
// Morgan-style request logging for Hono framework.
// Logs: method, path, status, duration, user agent, IP
export function httpLoggingMiddleware() {
  return async (c: any, next: () => Promise<void>) => {
    const start = Date.now()
    const method = c.req.method
    const path = c.req.path
    const userAgent = c.req.header('user-agent') || 'unknown'
    const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim()
      || c.req.header('x-real-ip')
      || 'unknown'

    await next()

    const duration = Date.now() - start
    const status = c.res?.status || 0

    const logData = {
      method,
      path,
      status,
      duration,
      ip,
      userAgent: userAgent.slice(0, 100),
    }

    // Log level based on status code
    if (status >= 500) {
      apiLogger.error(`HTTP ${status} ${method} ${path} - ${duration}ms`, logData)
    } else if (status >= 400) {
      apiLogger.warn(`HTTP ${status} ${method} ${path} - ${duration}ms`, logData)
    } else if (duration > 3000) {
      // Slow API warning (over 3 seconds)
      apiLogger.warn(`SLOW API ${method} ${path} - ${duration}ms`, logData)
    } else {
      apiLogger.http(`HTTP ${status} ${method} ${path} - ${duration}ms`, logData)
    }
  }
}

// ─── Auth Event Helpers ────────────────────────────────────────────────
export const AuthEvents = {
  failedLogin(email: string, ip: string, reason: string) {
    authLogger.warn('Failed login attempt', { email, ip, reason, event: 'LOGIN_FAILED' })
  },

  suspiciousAttempt(email: string, ip: string, attempts: number, reason: string) {
    authLogger.error('Suspicious auth attempt detected', {
      email, ip, attempts, reason, event: 'SUSPICIOUS_ATTEMPT',
    })
  },

  successfulLogin(email: string, ip: string, role: string) {
    authLogger.info('Successful login', { email, ip, role, event: 'LOGIN_SUCCESS' })
  },

  registration(email: string, role: string, ip: string) {
    authLogger.info('User registration', { email, role, ip, event: 'REGISTRATION' })
  },

  tokenExpired(userId: string, ip: string) {
    authLogger.warn('JWT token expired', { userId, ip, event: 'TOKEN_EXPIRED' })
  },

  passwordReset(email: string, ip: string) {
    authLogger.info('Password reset requested', { email, ip, event: 'PASSWORD_RESET' });
  },
}

// ─── Booking Event Helpers ─────────────────────────────────────────────
export const BookingEvents = {
  created(bookingId: string, clientId: string, serviceId: string) {
    bookingLogger.info('Booking created', { bookingId, clientId, serviceId, event: 'BOOKING_CREATED' })
  },

  failed(clientId: string, serviceId: string, error: string) {
    bookingLogger.error('Booking creation failed', { clientId, serviceId, error, event: 'BOOKING_FAILED' })
  },

  paymentFailed(bookingId: string, amount: number, error: string) {
    bookingLogger.error('Payment failed', { bookingId, amount, error, event: 'PAYMENT_FAILED' })
  },

  cancelled(bookingId: string, reason: string) {
    bookingLogger.warn('Booking cancelled', { bookingId, reason, event: 'BOOKING_CANCELLED' })
  },

  completed(bookingId: string) {
    bookingLogger.info('Booking completed', { bookingId, event: 'BOOKING_COMPLETED' })
  },
}

// ─── API Event Helpers ─────────────────────────────────────────────────
export const ApiEvents = {
  serverError(method: string, path: string, error: string, duration?: number) {
    apiLogger.error('API server error', { method, path, error, duration, event: 'API_500' })
  },

  slowApi(method: string, path: string, duration: number) {
    apiLogger.warn('Slow API detected', { method, path, duration, event: 'API_SLOW' })
  },

  dbError(operation: string, table: string, error: string) {
    apiLogger.error('Database error', { operation, table, error, event: 'DB_ERROR' })
  },

  rateLimited(ip: string, path: string) {
    apiLogger.warn('Rate limit hit', { ip, path, event: 'RATE_LIMITED' })
  },
}

// ═══════════════════════════════════════════════════════════════════════
// ─── REQUEST TRACING ─────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

// ─── Log Entry Type ────────────────────────────────────────────────────
export interface LogEntry {
  timestamp?: string
  level?: string
  message?: string
  service?: string
  category?: string
  traceId?: string
  userId?: string
  [key: string]: any
}

// MiddlewareHandler type compatible with Hono
export type MiddlewareHandler = (c: any, next: () => Promise<void>) => Promise<void>

/**
 * Generates a unique trace ID in format: bys-{timestamp}-{random}
 * Example: bys-1700000000-a1b2c3
 */
export function generateTraceId(): string {
  const timestamp = Math.floor(Date.now() / 1000)
  const random = Math.random().toString(36).slice(2, 8)
  return `bys-${timestamp}-${random}`
}

/**
 * Hono middleware that:
 * a. Checks for X-Request-ID header, or generates a new trace ID
 * b. Sets X-Request-ID on the response
 * c. Stores trace ID in Hono context: c.set('traceId', traceId)
 * d. Adds traceId to all log entries within this request
 */
export function traceMiddleware(): MiddlewareHandler {
  return async (c: any, next: () => Promise<void>) => {
    // a. Check for X-Request-ID header, or generate a new trace ID
    const traceId = c.req.header('X-Request-ID') || generateTraceId()

    // b. Set X-Request-ID on the response
    c.header('X-Request-ID', traceId)

    // c. Store trace ID in Hono context
    c.set('traceId', traceId)

    // d. Add traceId to all log entries within this request
    // We override the defaultMeta temporarily for the duration of the request
    const originalDefaultMeta = logger.defaultMeta
    const originalAuthMeta = authLogger.defaultMeta
    const originalBookingMeta = bookingLogger.defaultMeta
    const originalApiMeta = apiLogger.defaultMeta

    logger.defaultMeta = { ...originalDefaultMeta, traceId }
    authLogger.defaultMeta = { ...originalAuthMeta, traceId }
    bookingLogger.defaultMeta = { ...originalBookingMeta, traceId }
    apiLogger.defaultMeta = { ...originalApiMeta, traceId }

    try {
      await next()
    } finally {
      // Restore original defaultMeta after request completes
      logger.defaultMeta = originalDefaultMeta
      authLogger.defaultMeta = originalAuthMeta
      bookingLogger.defaultMeta = originalBookingMeta
      apiLogger.defaultMeta = originalApiMeta
    }
  }
}

/**
 * Creates a child logger that automatically includes traceId and module in every log entry.
 * Useful for per-request or per-module scoped logging.
 */
export function getChildLogger(traceId: string, module: string): winston.Logger {
  return logger.child({ traceId, module })
}

// ═══════════════════════════════════════════════════════════════════════
// ─── TRACE CORRELATION ──────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

/**
 * Searches all log files for entries with the given traceId.
 * Reads from combined.log, auth.log, booking.log, api.log
 */
export function correlateLogs(traceId: string): LogEntry[] {
  const logFiles = [
    'logs/combined.log',
    'logs/auth.log',
    'logs/booking.log',
    'logs/api.log',
  ]

  const entries: LogEntry[] = []
  const seenMessages = new Set<string>()

  for (const logFile of logFiles) {
    const fullPath = path.resolve(logFile)
    if (!fs.existsSync(fullPath)) continue

    try {
      const fileContent = fs.readFileSync(fullPath, 'utf-8')
      const lines = fileContent.split('\n').filter(Boolean)

      for (const line of lines) {
        try {
          const parsed: LogEntry = JSON.parse(line)
          if (parsed.traceId === traceId) {
            // Deduplicate entries (combined.log may contain same entries as category logs)
            const dedupeKey = `${parsed.timestamp}|${parsed.message}|${parsed.level}`
            if (!seenMessages.has(dedupeKey)) {
              seenMessages.add(dedupeKey)
              entries.push(parsed)
            }
          }
        } catch {
          // Skip non-JSON lines
        }
      }
    } catch (err: any) {
      logger.warn(`Failed to read log file for correlation: ${logFile}`, { error: err.message })
    }
  }

  // Sort by timestamp
  entries.sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''))
  return entries
}

/**
 * Finds all trace IDs associated with a user in the last N minutes.
 * Searches all log files for entries containing the userId.
 */
export function getRelatedTraces(userId: string, minutes: number = 60): string[] {
  const cutoff = new Date(Date.now() - minutes * 60 * 1000)
  const logFiles = [
    'logs/combined.log',
    'logs/auth.log',
    'logs/booking.log',
    'logs/api.log',
  ]

  const traceIds = new Set<string>()

  for (const logFile of logFiles) {
    const fullPath = path.resolve(logFile)
    if (!fs.existsSync(fullPath)) continue

    try {
      const fileContent = fs.readFileSync(fullPath, 'utf-8')
      const lines = fileContent.split('\n').filter(Boolean)

      for (const line of lines) {
        try {
          const parsed: LogEntry = JSON.parse(line)
          // Check if this entry has the userId
          if (parsed.userId === userId || parsed.recipient?.userId === userId) {
            if (parsed.traceId && parsed.timestamp) {
              // Check if within time window
              const entryDate = new Date(parsed.timestamp.replace(' ', 'T'))
              if (entryDate >= cutoff) {
                traceIds.add(parsed.traceId)
              }
            }
          }
        } catch {
          // Skip non-JSON lines
        }
      }
    } catch (err: any) {
      logger.warn(`Failed to read log file for related traces: ${logFile}`, { error: err.message })
    }
  }

  return Array.from(traceIds)
}

// ═══════════════════════════════════════════════════════════════════════
// ─── OBSERVABILITY PIPELINE ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

/**
 * Exports logs in JSON or OpenTelemetry format for external observability platforms
 * (Datadog, Grafana Loki, etc.)
 */
export async function exportLogs(format: 'json' | 'otel', since: Date): Promise<string> {
  const logFiles = [
    'logs/combined.log',
    'logs/auth.log',
    'logs/booking.log',
    'logs/api.log',
  ]

  const allEntries: LogEntry[] = []

  for (const logFile of logFiles) {
    const fullPath = path.resolve(logFile)
    if (!fs.existsSync(fullPath)) continue

    try {
      const fileContent = fs.readFileSync(fullPath, 'utf-8')
      const lines = fileContent.split('\n').filter(Boolean)

      for (const line of lines) {
        try {
          const parsed: LogEntry = JSON.parse(line)
          if (parsed.timestamp) {
            const entryDate = new Date(parsed.timestamp.replace(' ', 'T'))
            if (entryDate >= since) {
              allEntries.push(parsed)
            }
          }
        } catch {
          // Skip non-JSON lines
        }
      }
    } catch (err: any) {
      logger.warn(`Failed to read log file for export: ${logFile}`, { error: err.message })
    }
  }

  // Sort by timestamp
  allEntries.sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''))

  if (format === 'json') {
    // Standard JSON export — array of log entries
    return JSON.stringify(allEntries, null, 2)
  }

  // OpenTelemetry Logs format
  // Reference: https://opentelemetry.io/docs/specs/otel/logs/data-model/
  const otelLogs = allEntries.map(entry => {
    const timestampNs = entry.timestamp
      ? new Date(entry.timestamp.replace(' ', 'T')).getTime() * 1_000_000
      : Date.now() * 1_000_000

    // Map winston levels to OTel severity numbers
    const severityMap: Record<string, number> = {
      error: 17,   // ERROR
      warn: 13,    // WARN
      info: 9,     // INFO
      http: 8,     // INFO2
      verbose: 5,  // DEBUG
      debug: 5,    // DEBUG
      silly: 1,    // TRACE
    }

    const severityNumber = severityMap[entry.level || 'info'] || 9
    const severityText = entry.level?.toUpperCase() || 'INFO'

    // Build OTel LogRecord
    const logRecord: Record<string, any> = {
      timeUnixNano: String(timestampNs),
      severityNumber,
      severityText,
      body: entry.message || '',
      attributes: {} as Record<string, any>,
    }

    // Add all extra fields as attributes
    for (const [key, value] of Object.entries(entry)) {
      if (!['timestamp', 'level', 'message'].includes(key) && value !== undefined) {
        logRecord.attributes[key] = value
      }
    }

    return logRecord
  })

  const otelExport = {
    resourceLogs: [{
      resource: {
        attributes: [
          { key: 'service.name', value: { stringValue: 'bookmyservice-api' } },
          { key: 'service.version', value: { stringValue: process.env.APP_VERSION || '1.0.0' } },
          { key: 'telemetry.sdk.name', value: { stringValue: 'winston-otel-exporter' } },
        ],
      },
      scopeLogs: [{
        scope: { name: 'bookmyservice-logger' },
        logRecords: otelLogs,
      }],
    }],
  }

  return JSON.stringify(otelExport, null, 2)
}

/**
 * Computes basic metrics from recent log entries.
 */
export function getLogMetrics(): {
  totalEntries: number
  errorCount: number
  warnCount: number
  avgResponseTime: number
  topErrors: { message: string; count: number }[]
} {
  const logFile = path.resolve('logs/combined.log')
  if (!fs.existsSync(logFile)) {
    return {
      totalEntries: 0,
      errorCount: 0,
      warnCount: 0,
      avgResponseTime: 0,
      topErrors: [],
    }
  }

  let totalEntries = 0
  let errorCount = 0
  let warnCount = 0
  let totalDuration = 0
  let durationCount = 0
  const errorMessages = new Map<string, number>()

  try {
    const fileContent = fs.readFileSync(logFile, 'utf-8')
    const lines = fileContent.split('\n').filter(Boolean)

    for (const line of lines) {
      try {
        const parsed: LogEntry = JSON.parse(line)
        totalEntries++

        if (parsed.level === 'error') {
          errorCount++
          const msg = parsed.message || 'Unknown error'
          errorMessages.set(msg, (errorMessages.get(msg) || 0) + 1)
        }

        if (parsed.level === 'warn') {
          warnCount++
        }

        if (typeof parsed.duration === 'number') {
          totalDuration += parsed.duration
          durationCount++
        }
      } catch {
        // Skip non-JSON lines
      }
    }
  } catch (err: any) {
    logger.warn('Failed to compute log metrics', { error: err.message })
  }

  // Build top errors sorted by count
  const topErrors = Array.from(errorMessages.entries())
    .map(([message, count]) => ({ message, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return {
    totalEntries,
    errorCount,
    warnCount,
    avgResponseTime: durationCount > 0 ? Math.round(totalDuration / durationCount) : 0,
    topErrors,
  }
}

/**
 * Forces flush of all buffered log entries to disk/transport.
 * Winston doesn't have a direct flush API, but we can force-close and recreate,
 * or use the callback pattern on the transport.
 * The practical approach: wait for all transports to finish writing.
 */
export async function flushLogs(): Promise<void> {
  const allLoggers = [logger, authLogger, bookingLogger, apiLogger]

  const flushPromises = allLoggers.map(
    logInstance =>
      new Promise<void>((resolve) => {
        let pending = logInstance.transports.length
        if (pending === 0) {
          resolve()
          return
        }

        for (const transport of logInstance.transports) {
          // Force flush by calling the internal _flush if available
          if (typeof (transport as any)._flush === 'function') {
            ;(transport as any)._flush(() => {
              pending--
              if (pending === 0) resolve()
            })
          } else {
            // For transports without _flush, we just mark as done
            pending--
            if (pending === 0) resolve()
          }
        }

        // Safety timeout: resolve after 5 seconds regardless
        setTimeout(resolve, 5000)
      })
  )

  await Promise.all(flushPromises)
  logger.debug('Log flush completed')
}

// ═══════════════════════════════════════════════════════════════════════
// ─── ENHANCEMENT: PII Redaction ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

/** PII patterns to detect and redact */
const PII_PATTERNS: Array<{ pattern: RegExp; replacement: string; name: string }> = [
  // Email addresses
  { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, replacement: '[REDACTED_EMAIL]', name: 'email' },
  // Indian phone numbers (+91 or 10 digits starting with 6-9)
  { pattern: /(\+91[-\s]?)?[6-9]\d{9}/g, replacement: '[REDACTED_PHONE]', name: 'phone' },
  // Credit card numbers (basic pattern: 13-19 digits with spaces/dashes)
  { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{3,4}\b/g, replacement: '[REDACTED_CARD]', name: 'card' },
  // Aadhaar numbers (12 digits)
  { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, replacement: '[REDACTED_AADHAAR]', name: 'aadhaar' },
  // PAN numbers (5 letters + 4 digits + 1 letter)
  { pattern: /\b[A-Z]{5}\d{4}[A-Z]\b/g, replacement: '[REDACTED_PAN]', name: 'pan' },
]

/** Sensitive field names to redact from objects */
const SENSITIVE_FIELDS = new Set([
  'password', 'token', 'secret', 'apiKey', 'api_key', 'accessToken', 'access_token',
  'refreshToken', 'refresh_token', 'authorization', 'cookie', 'sessionId', 'session_id',
  'creditCard', 'credit_card', 'cardNumber', 'card_number', 'cvv', 'pin', 'otp',
  'ssn', 'socialSecurity', 'aadhaar', 'panNumber', 'pan_number',
])

/**
 * Redact PII (Personally Identifiable Information) from a log message.
 * Detects and replaces email addresses, phone numbers, and common
 * sensitive fields in log entries.
 *
 * @param message - The log message or stringified object to redact
 * @returns Redacted version with PII replaced by placeholders
 */
export function redactPII(message: string): string {
  if (!message || typeof message !== 'string') return message

  let redacted = message

  // Apply PII pattern redaction
  for (const { pattern, replacement } of PII_PATTERNS) {
    redacted = redacted.replace(pattern, replacement)
  }

  // Redact sensitive field values in JSON-like structures
  // Matches patterns like "password": "value" or password=value
  for (const field of SENSITIVE_FIELDS) {
    // JSON format: "field": "value"
    const jsonRegex = new RegExp(`("${field}"\\s*:\\s*)"[^"]*"`, 'gi')
    redacted = redacted.replace(jsonRegex, `$1"[REDACTED_${field.toUpperCase()}]"`)

    // Key-value format: field=value
    const kvRegex = new RegExp(`(${field}=)[^,\\s}\\]]+`, 'gi')
    redacted = redacted.replace(kvRegex, `$1[REDACTED_${field.toUpperCase()}]`)
  }

  return redacted
}

// ═══════════════════════════════════════════════════════════════════════
// ─── ENHANCEMENT: AsyncLocalStorage Trace ID ────────────────────────
// ═══════════════════════════════════════════════════════════════════════

import { AsyncLocalStorage } from 'async_hooks'

/** AsyncLocalStorage for request-scoped trace ID — prevents trace ID bleeding */
const traceContext = new AsyncLocalStorage<{ traceId: string }>()

/**
 * Get the current trace ID from AsyncLocalStorage.
 * Returns undefined if not in a request context.
 */
export function getCurrentTraceId(): string | undefined {
  return traceContext.getStore()?.traceId
}

/**
 * Enhanced traceMiddleware that uses AsyncLocalStorage instead of
 * modifying defaultMeta. This prevents trace ID bleeding between
 * concurrent requests — each request gets its own isolated context.
 */
export function traceMiddlewareAsync(): MiddlewareHandler {
  return async (c: any, next: () => Promise<void>) => {
    // Check for X-Request-ID header, or generate a new trace ID
    const traceId = c.req.header('X-Request-ID') || generateTraceId()

    // Set X-Request-ID on the response
    c.header('X-Request-ID', traceId)

    // Store trace ID in Hono context
    c.set('traceId', traceId)

    // Use AsyncLocalStorage to scope the trace ID to this request only
    await traceContext.run({ traceId }, async () => {
      // Create child loggers with the trace ID for this request scope
      const childLogger = logger.child({ traceId })
      const childAuthLogger = authLogger.child({ traceId })
      const childBookingLogger = bookingLogger.child({ traceId })
      const childApiLogger = apiLogger.child({ traceId })

      // Store scoped loggers in context for use within the request
      c.set('scopedLogger', childLogger)
      c.set('scopedAuthLogger', childAuthLogger)
      c.set('scopedBookingLogger', childBookingLogger)
      c.set('scopedApiLogger', childApiLogger)

      await next()
    })
  }
}

// ═══════════════════════════════════════════════════════════════════════
// ─── ENHANCEMENT: Date-based Log Rotation ───────────────────────────
// ═══════════════════════════════════════════════════════════════════════

/**
 * Create a Winston file transport with date-based log file naming
 * alongside size-based rotation.
 *
 * File naming pattern: logs/{baseName}-{YYYY-MM-DD}.log
 * Also respects maxsize and maxFiles for size-based rotation.
 */
export function createDateBasedFileTransport(baseName: string, level: string, maxsize: number = 10 * 1024 * 1024, maxFiles: number = 5) {
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  return new winston.transports.File({
    filename: `logs/${baseName}-${today}.log`,
    level,
    maxsize,
    maxFiles,
    tailable: true,
  })
}

/**
 * Reconfigure all loggers with date-based file transports.
 * Call this at startup or on date change to get date-based log files.
 */
export function reconfigureWithDateBasedRotation(): void {
  // Note: In production, you'd want to call this at midnight to rotate
  // to a new date-based file. This is a setup function for initial configuration.
  const today = new Date().toISOString().split('T')[0]

  const dateBasedTransports = {
    combinedFile: new winston.transports.File({
      filename: `logs/combined-${today}.log`,
      level: 'info',
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
      tailable: true,
    }),
    errorFile: new winston.transports.File({
      filename: `logs/error-${today}.log`,
      level: 'error',
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
      tailable: true,
    }),
  }

  // Add date-based transports to all loggers (keep existing transports)
  logger.add(dateBasedTransports.combinedFile)
  logger.add(dateBasedTransports.errorFile)

  console.log(`📝 [Logger] Date-based log rotation configured for ${today}`)
}

// ═══════════════════════════════════════════════════════════════════════
// ─── ENHANCEMENT: Per-Module Log Level Override ─────────────────────
// ═══════════════════════════════════════════════════════════════════════

/** Module-level log level overrides */
const moduleLogLevels = new Map<string, string>()

/** Cache of module-specific child loggers */
const moduleLoggers = new Map<string, winston.Logger>()

/**
 * Set the log level for a specific module.
 * This allows fine-grained control over logging verbosity per module.
 *
 * @param module - Module name (e.g., 'auth', 'booking', 'payment')
 * @param level - Log level ('error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly')
 */
export function setModuleLogLevel(module: string, level: string): void {
  moduleLogLevels.set(module, level)

  // Update existing child logger if it exists
  const existing = moduleLoggers.get(module)
  if (existing) {
    existing.level = level
  }

  console.log(`📝 [Logger] Module "${module}" log level set to: ${level}`)
}

/**
 * Get a module-specific logger with its own log level.
 * If a custom level has been set via setModuleLogLevel, it will be used.
 * Otherwise, inherits the global log level.
 *
 * @param module - Module name
 * @returns Winston logger instance scoped to the module
 */
export function getModuleLogger(module: string): winston.Logger {
  const existing = moduleLoggers.get(module)
  if (existing) return existing

  const level = moduleLogLevels.get(module) || process.env.LOG_LEVEL || 'info'
  const moduleLogger = logger.child({ module })
  moduleLogger.level = level

  moduleLoggers.set(module, moduleLogger)
  return moduleLogger
}

/**
 * Get all current module log level overrides.
 */
export function getModuleLogLevels(): Record<string, string> {
  const levels: Record<string, string> = {}
  for (const [module, level] of moduleLogLevels.entries()) {
    levels[module] = level
  }
  return levels
}
