// ─── tests/lib/logger.test.ts ───────────────────────────────────────────
// Tests for lib/logger.ts — PII redaction, log event helpers,
// trace ID generation, and per-module log levels
// ─────────────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach } from 'vitest'
import {
  redactPII,
  generateTraceId,
  getModuleLogger,
  setModuleLogLevel,
  getModuleLogLevels,
} from '../../lib/logger'

describe('Logger Utilities', () => {
  // ─── redactPII ─────────────────────────────────────────────────────
  describe('redactPII', () => {
    it('removes email addresses', () => {
      const result = redactPII('User test@example.com logged in')
      expect(result).not.toContain('test@example.com')
      expect(result).toContain('[REDACTED_EMAIL]')
    })

    it('removes phone numbers', () => {
      const result = redactPII('Called +919876543210 at noon')
      expect(result).not.toContain('+919876543210')
      expect(result).toContain('[REDACTED_PHONE]')
    })

    it('removes Indian phone numbers without country code', () => {
      const result = redactPII('Number is 9876543210')
      expect(result).not.toContain('9876543210')
      expect(result).toContain('[REDACTED_PHONE]')
    })

    it('removes sensitive field values in JSON', () => {
      const result = redactPII('{"password": "secret123", "email": "test@example.com"}')
      expect(result).not.toContain('secret123')
      expect(result).toContain('[REDACTED_PASSWORD]')
    })

    it('removes token values', () => {
      const result = redactPII('token=abc123def456')
      expect(result).toContain('[REDACTED_TOKEN]')
    })

    it('handles null/undefined input', () => {
      expect(redactPII(null as any)).toBeNull()
      expect(redactPII(undefined as any)).toBeUndefined()
    })

    it('preserves non-PII text', () => {
      const result = redactPII('User logged in successfully from Mumbai')
      expect(result).toBe('User logged in successfully from Mumbai')
    })

    it('handles empty string', () => {
      expect(redactPII('')).toBe('')
    })

    it('removes Aadhaar-like numbers', () => {
      const result = redactPII('Aadhaar: 1234 5678 9012')
      expect(result).not.toContain('1234 5678 9012')
      expect(result).toContain('[REDACTED_AADHAAR]')
    })

    it('removes PAN-like numbers', () => {
      const result = redactPII('PAN: ABCDE1234F')
      expect(result).not.toContain('ABCDE1234F')
      expect(result).toContain('[REDACTED_PAN]')
    })
  })

  // ─── generateTraceId ───────────────────────────────────────────────
  describe('generateTraceId', () => {
    it('generates a trace ID with correct format', () => {
      const traceId = generateTraceId()
      expect(traceId).toMatch(/^bys-\d+-[a-z0-9]+$/)
    })

    it('generates unique trace IDs', () => {
      const id1 = generateTraceId()
      const id2 = generateTraceId()
      expect(id1).not.toBe(id2)
    })
  })

  // ─── Per-module log levels ─────────────────────────────────────────
  describe('Per-module log levels', () => {
    it('sets and retrieves module log levels', () => {
      setModuleLogLevel('auth', 'debug')
      const levels = getModuleLogLevels()
      expect(levels.auth).toBe('debug')
    })

    it('creates module logger with custom level', () => {
      setModuleLogLevel('booking', 'verbose')
      const modLogger = getModuleLogger('booking')
      expect(modLogger).toBeDefined()
      expect(modLogger.level).toBe('verbose')
    })

    it('returns cached module logger', () => {
      const logger1 = getModuleLogger('payment')
      const logger2 = getModuleLogger('payment')
      expect(logger1).toBe(logger2) // Same instance
    })

    it('defaults to info level when no custom level set', () => {
      const modLogger = getModuleLogger('unknown_module_xyz')
      expect(modLogger.level).toBe('info')
    })
  })
})
