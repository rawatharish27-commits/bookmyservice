/**
 * Environment variable validation and configuration schema enforcement
 * Validates all required env vars at startup and provides typed access
 *
 * Features:
 *   - Schema-driven validation with required/optional flags
 *   - Type coercion (string, number, boolean, url)
 *   - Default values for optional vars
 *   - Sensitive value masking (never log secrets)
 *   - Secret health dashboard (which secrets are configured vs missing)
 *   - Graceful degradation — logs warnings but doesn't crash
 */

// ─── Schema Definition ─────────────────────────────────────────────────────

interface EnvVarSchema {
  name: string
  required: boolean
  type: 'string' | 'number' | 'boolean' | 'url'
  default?: any
  description: string
  sensitive?: boolean // Don't log the value
}

const ENV_SCHEMA: EnvVarSchema[] = [
  // Database
  { name: 'DATABASE_URL', required: true, type: 'url', description: 'PostgreSQL connection string' },

  // Auth
  { name: 'JWT_SECRET', required: false, type: 'string', default: 'dev-fallback-secret', description: 'JWT signing secret', sensitive: true },

  // Redis
  { name: 'REDIS_URL', required: false, type: 'url', description: 'Redis connection URL' },

  // Razorpay
  { name: 'RAZORPAY_KEY_ID', required: false, type: 'string', description: 'Razorpay API key ID', sensitive: true },
  { name: 'RAZORPAY_KEY_SECRET', required: false, type: 'string', description: 'Razorpay API key secret', sensitive: true },
  { name: 'RAZORPAY_WEBHOOK_SECRET', required: false, type: 'string', description: 'Razorpay webhook secret', sensitive: true },

  // Firebase
  { name: 'FIREBASE_PROJECT_ID', required: false, type: 'string', description: 'Firebase project ID' },
  { name: 'FIREBASE_CLIENT_EMAIL', required: false, type: 'string', description: 'Firebase client email' },
  { name: 'FIREBASE_PRIVATE_KEY', required: false, type: 'string', description: 'Firebase private key', sensitive: true },

  // Twilio
  { name: 'TWILIO_ACCOUNT_SID', required: false, type: 'string', description: 'Twilio account SID', sensitive: true },
  { name: 'TWILIO_AUTH_TOKEN', required: false, type: 'string', description: 'Twilio auth token', sensitive: true },

  // SendGrid
  { name: 'SENDGRID_API_KEY', required: false, type: 'string', description: 'SendGrid API key', sensitive: true },

  // Cloudinary
  { name: 'CLOUDINARY_CLOUD_NAME', required: false, type: 'string', description: 'Cloudinary cloud name' },
  { name: 'CLOUDINARY_API_KEY', required: false, type: 'string', description: 'Cloudinary API key' },
  { name: 'CLOUDINARY_API_SECRET', required: false, type: 'string', description: 'Cloudinary API secret', sensitive: true },

  // Sentry
  { name: 'SENTRY_DSN', required: false, type: 'url', description: 'Sentry DSN URL' },

  // Server
  { name: 'PORT', required: false, type: 'number', default: 3001, description: 'Server port' },
  { name: 'NODE_ENV', required: false, type: 'string', default: 'development', description: 'Node environment' },

  // Backup
  { name: 'BACKUP_ENCRYPTION_KEY', required: false, type: 'string', description: 'Backup encryption key', sensitive: true },

  // Queue
  { name: 'QUEUE_NOTIFICATION_CONCURRENCY', required: false, type: 'number', default: 5, description: 'Notification worker concurrency' },
  { name: 'QUEUE_BOOKING_CONCURRENCY', required: false, type: 'number', default: 3, description: 'Booking worker concurrency' },
]

// ─── Validation Result ─────────────────────────────────────────────────────

export interface EnvValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  config: Record<string, any>
  secretHealth: {
    total: number
    configured: number
    missing: number
    sensitive: number
    properlySet: number
  }
}

// ─── Validate Environment ──────────────────────────────────────────────────

let cachedResult: EnvValidationResult | null = null

export function validateEnv(): EnvValidationResult {
  if (cachedResult) return cachedResult

  const errors: string[] = []
  const warnings: string[] = []
  const config: Record<string, any> = {}

  let totalSecrets = 0
  let configuredSecrets = 0
  let missingSecrets = 0
  let sensitiveCount = 0
  let properlySetCount = 0

  for (const schema of ENV_SCHEMA) {
    const rawValue = process.env[schema.name]
    const isSensitive = schema.sensitive || false

    if (isSensitive) {
      totalSecrets++
      sensitiveCount++
    }

    // Check required
    if (schema.required && !rawValue) {
      errors.push(`Required environment variable ${schema.name} is not set — ${schema.description}`)
      if (isSensitive) missingSecrets++
      config[schema.name] = schema.default
      continue
    }

    // Not set, use default
    if (!rawValue) {
      if (schema.default !== undefined) {
        config[schema.name] = schema.default
      }
      if (isSensitive) missingSecrets++
      if (schema.required) {
        // Already handled above
      } else if (isSensitive) {
        warnings.push(`Optional secret ${schema.name} is not set — ${schema.description}`)
      }
      continue
    }

    // Value is set — validate type
    let value: any = rawValue
    let typeError = false

    switch (schema.type) {
      case 'number': {
        const parsed = Number(rawValue)
        if (isNaN(parsed)) {
          errors.push(`${schema.name} must be a number, got "${rawValue}"`)
          typeError = true
        } else {
          value = parsed
        }
        break
      }
      case 'boolean': {
        const lower = rawValue.toLowerCase()
        if (!['true', 'false', '1', '0', 'yes', 'no'].includes(lower)) {
          errors.push(`${schema.name} must be a boolean, got "${rawValue}"`)
          typeError = true
        } else {
          value = ['true', '1', 'yes'].includes(lower)
        }
        break
      }
      case 'url': {
        try {
          new URL(rawValue)
          value = rawValue
        } catch {
          // Some "url" types like DATABASE_URL have query params that may not parse cleanly
          // Only warn for clearly malformed URLs (empty or whitespace)
          if (!rawValue.trim()) {
            errors.push(`${schema.name} must be a valid URL, got empty value`)
            typeError = true
          } else {
            // Accept it — DATABASE_URL with sslmode params is still valid
            value = rawValue
          }
        }
        break
      }
      case 'string':
      default:
        value = rawValue
        break
    }

    config[schema.name] = value

    if (isSensitive) {
      configuredSecrets++
      // Check if the value is a dev/default/placeholder
      const isDevValue = rawValue.includes('dev-fallback') ||
        rawValue.includes('test-') ||
        rawValue.includes('example') ||
        rawValue === 'changeme' ||
        rawValue === 'secret' ||
        rawValue.length < 8

      if (!isDevValue && !typeError) {
        properlySetCount++
      } else if (isDevValue) {
        warnings.push(`Secret ${schema.name} appears to use a development/placeholder value`)
      }
    }
  }

  cachedResult = {
    valid: errors.length === 0,
    errors,
    warnings,
    config,
    secretHealth: {
      total: totalSecrets,
      configured: configuredSecrets,
      missing: missingSecrets,
      sensitive: sensitiveCount,
      properlySet: properlySetCount,
    },
  }

  return cachedResult
}

// ─── Get Typed Config ──────────────────────────────────────────────────────

export function getEnvConfig(): Record<string, any> {
  const result = validateEnv()
  return { ...result.config }
}

// ─── Secret Health Dashboard ───────────────────────────────────────────────

export function getSecretHealthDashboard(): {
  summary: {
    total: number
    configured: number
    missing: number
    properlySet: number
    weakValues: number
  }
  secrets: Array<{
    name: string
    configured: boolean
    sensitive: boolean
    properlySet: boolean
    description: string
    // Value is NEVER exposed — only whether it's set
  }>
  groups: {
    database: string[]
    auth: string[]
    redis: string[]
    payments: string[]
    firebase: string[]
    sms: string[]
    email: string[]
    media: string[]
    monitoring: string[]
    server: string[]
    backup: string[]
    queue: string[]
  }
} {
  const result = validateEnv()
  const secrets: Array<{
    name: string
    configured: boolean
    sensitive: boolean
    properlySet: boolean
    description: string
  }> = []

  let properlySetCount = 0
  let weakCount = 0

  for (const schema of ENV_SCHEMA) {
    const rawValue = process.env[schema.name]
    const isConfigured = !!rawValue
    let isProperlySet = false

    if (isConfigured && schema.sensitive) {
      const isWeak = rawValue.includes('dev-fallback') ||
        rawValue.includes('test-') ||
        rawValue.includes('example') ||
        rawValue === 'changeme' ||
        rawValue === 'secret' ||
        rawValue.length < 8

      if (!isWeak) {
        isProperlySet = true
        properlySetCount++
      } else {
        weakCount++
      }
    } else if (isConfigured) {
      isProperlySet = true
      if (schema.sensitive) properlySetCount++
    }

    secrets.push({
      name: schema.name,
      configured: isConfigured,
      sensitive: schema.sensitive || false,
      properlySet: isProperlySet,
      description: schema.description,
    })
  }

  // Group secrets by category
  const groups = {
    database: ENV_SCHEMA.filter(s => s.name === 'DATABASE_URL').map(s => s.name),
    auth: ENV_SCHEMA.filter(s => s.name === 'JWT_SECRET').map(s => s.name),
    redis: ENV_SCHEMA.filter(s => s.name === 'REDIS_URL').map(s => s.name),
    payments: ENV_SCHEMA.filter(s => s.name.startsWith('RAZORPAY_')).map(s => s.name),
    firebase: ENV_SCHEMA.filter(s => s.name.startsWith('FIREBASE_')).map(s => s.name),
    sms: ENV_SCHEMA.filter(s => s.name.startsWith('TWILIO_')).map(s => s.name),
    email: ENV_SCHEMA.filter(s => s.name.startsWith('SENDGRID_')).map(s => s.name),
    media: ENV_SCHEMA.filter(s => s.name.startsWith('CLOUDINARY_')).map(s => s.name),
    monitoring: ENV_SCHEMA.filter(s => s.name.startsWith('SENTRY_')).map(s => s.name),
    server: ENV_SCHEMA.filter(s => ['PORT', 'NODE_ENV'].includes(s.name)).map(s => s.name),
    backup: ENV_SCHEMA.filter(s => s.name === 'BACKUP_ENCRYPTION_KEY').map(s => s.name),
    queue: ENV_SCHEMA.filter(s => s.name.startsWith('QUEUE_')).map(s => s.name),
  }

  return {
    summary: {
      total: result.secretHealth.total,
      configured: result.secretHealth.configured,
      missing: result.secretHealth.missing,
      properlySet: properlySetCount,
      weakValues: weakCount,
    },
    secrets,
    groups,
  }
}
