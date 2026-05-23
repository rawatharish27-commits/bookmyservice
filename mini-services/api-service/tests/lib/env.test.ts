// ─── tests/lib/env.test.ts ────────────────────────────────────────────
// Tests for lib/env.ts — Environment variable validation, configuration
// schema enforcement, and secret health dashboard.
// ─────────────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach, vi } from 'vitest'

// We need to re-import the module for each test since validateEnv() caches its result.
// Using vi.resetModules() to clear the module cache.

describe('Environment Validation', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  // ─── validateEnv ────────────────────────────────────────────────────
  describe('validateEnv', () => {
    it('should report error when DATABASE_URL is missing', async () => {
      delete process.env.DATABASE_URL
      const { validateEnv } = await import('../../lib/env')
      const result = validateEnv()
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('DATABASE_URL'))).toBe(true)
    })

    it('should be valid when DATABASE_URL is set', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb'
      const { validateEnv } = await import('../../lib/env')
      const result = validateEnv()
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should return warnings for missing optional secrets', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb'
      delete process.env.RAZORPAY_KEY_ID
      delete process.env.RAZORPAY_KEY_SECRET
      const { validateEnv } = await import('../../lib/env')
      const result = validateEnv()
      expect(result.warnings.length).toBeGreaterThan(0)
    })

    it('should detect weak/placeholder JWT_SECRET values', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb'
      process.env.JWT_SECRET = 'secret'
      const { validateEnv } = await import('../../lib/env')
      const result = validateEnv()
      expect(result.warnings.some(w => w.includes('JWT_SECRET'))).toBe(true)
    })

    it('should accept properly set secrets', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb'
      process.env.JWT_SECRET = 'a-very-long-and-secure-secret-key-for-production'
      const { validateEnv } = await import('../../lib/env')
      const result = validateEnv()
      expect(result.secretHealth.properlySet).toBeGreaterThan(0)
    })

    it('should apply default values for optional vars', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb'
      delete process.env.PORT
      delete process.env.NODE_ENV
      const { validateEnv } = await import('../../lib/env')
      const result = validateEnv()
      expect(result.config.PORT).toBe(3001)
      expect(result.config.NODE_ENV).toBe('development')
    })

    it('should coerce PORT to number', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb'
      process.env.PORT = '4000'
      const { validateEnv } = await import('../../lib/env')
      const result = validateEnv()
      expect(result.config.PORT).toBe(4000)
    })

    it('should report error for non-numeric PORT', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb'
      process.env.PORT = 'not-a-number'
      const { validateEnv } = await import('../../lib/env')
      const result = validateEnv()
      expect(result.errors.some(e => e.includes('PORT'))).toBe(true)
    })

    it('should return secretHealth summary', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb'
      const { validateEnv } = await import('../../lib/env')
      const result = validateEnv()
      expect(result.secretHealth).toHaveProperty('total')
      expect(result.secretHealth).toHaveProperty('configured')
      expect(result.secretHealth).toHaveProperty('missing')
      expect(result.secretHealth).toHaveProperty('sensitive')
      expect(result.secretHealth).toHaveProperty('properlySet')
      expect(result.secretHealth.total).toBeGreaterThan(0)
    })
  })

  // ─── getEnvConfig ───────────────────────────────────────────────────
  describe('getEnvConfig', () => {
    it('should return typed config object', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb'
      process.env.JWT_SECRET = 'a-very-long-and-secure-secret-key'
      const { getEnvConfig } = await import('../../lib/env')
      const config = getEnvConfig()
      expect(config).toHaveProperty('DATABASE_URL')
      expect(config).toHaveProperty('PORT')
      expect(config).toHaveProperty('NODE_ENV')
    })
  })

  // ─── getSecretHealthDashboard ───────────────────────────────────────
  describe('getSecretHealthDashboard', () => {
    it('should return dashboard with summary and secrets', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb'
      const { getSecretHealthDashboard } = await import('../../lib/env')
      const dashboard = getSecretHealthDashboard()
      expect(dashboard).toHaveProperty('summary')
      expect(dashboard).toHaveProperty('secrets')
      expect(dashboard).toHaveProperty('groups')
      expect(dashboard.summary).toHaveProperty('total')
      expect(dashboard.summary).toHaveProperty('configured')
      expect(dashboard.summary).toHaveProperty('missing')
      expect(dashboard.summary).toHaveProperty('properlySet')
      expect(dashboard.summary).toHaveProperty('weakValues')
      expect(Array.isArray(dashboard.secrets)).toBe(true)
    })

    it('should never expose secret values in the dashboard', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb'
      process.env.JWT_SECRET = 'super-secret-production-key-12345'
      const { getSecretHealthDashboard } = await import('../../lib/env')
      const dashboard = getSecretHealthDashboard()
      for (const secret of dashboard.secrets) {
        expect(secret).not.toHaveProperty('value')
        // The dashboard only reveals whether a secret is configured, not its value
        expect(secret).toHaveProperty('configured')
        expect(secret).toHaveProperty('sensitive')
        expect(secret).toHaveProperty('properlySet')
      }
    })

    it('should group secrets by category', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb'
      const { getSecretHealthDashboard } = await import('../../lib/env')
      const dashboard = getSecretHealthDashboard()
      expect(dashboard.groups).toHaveProperty('database')
      expect(dashboard.groups).toHaveProperty('auth')
      expect(dashboard.groups).toHaveProperty('redis')
      expect(dashboard.groups).toHaveProperty('payments')
      expect(dashboard.groups).toHaveProperty('firebase')
      expect(dashboard.groups).toHaveProperty('sms')
      expect(dashboard.groups).toHaveProperty('email')
      expect(dashboard.groups).toHaveProperty('media')
      expect(dashboard.groups).toHaveProperty('monitoring')
      expect(dashboard.groups).toHaveProperty('server')
      expect(dashboard.groups).toHaveProperty('backup')
      expect(dashboard.groups).toHaveProperty('queue')
    })

    it('should detect weak values', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb'
      process.env.JWT_SECRET = 'dev-fallback-secret'
      const { getSecretHealthDashboard } = await import('../../lib/env')
      const dashboard = getSecretHealthDashboard()
      expect(dashboard.summary.weakValues).toBeGreaterThan(0)
    })
  })
})
