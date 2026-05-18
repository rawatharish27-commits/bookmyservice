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
