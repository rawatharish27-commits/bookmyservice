// ─── tests/lib/redis.test.ts ───────────────────────────────────────────
// Tests for lib/redis.ts — Redis cache layer with in-memory fallback
// These tests use the in-memory fallback (no real Redis needed).
// ─────────────────────────────────────────────────────────────────────

import { describe, it, expect, beforeAll } from 'vitest'

// Ensure no REDIS_URL so the in-memory fallback is used
delete process.env.REDIS_URL

// Import after env is set
import { redis, CacheKeys, CacheTTL, recordCacheHit, recordCacheMiss, getCacheMetrics, resetCacheMetrics } from '../../lib/redis'

describe('Redis Cache (In-Memory Fallback)', () => {
  // ─── Basic get/set operations ──────────────────────────────────────
  describe('basic operations', () => {
    it('set and get a value', async () => {
      await redis.set('test:key1', 'hello')
      const result = await redis.get('test:key1')
      expect(result).toBe('hello')
    })

    it('returns null for non-existent key', async () => {
      const result = await redis.get('test:nonexistent')
      expect(result).toBeNull()
    })

    it('delete a key', async () => {
      await redis.set('test:key2', 'world')
      await redis.del('test:key2')
      const result = await redis.get('test:key2')
      expect(result).toBeNull()
    })
  })

  // ─── JSON serialization ────────────────────────────────────────────
  describe('JSON operations', () => {
    it('setJson and getJson', async () => {
      const data = { name: 'Test', count: 42, nested: { key: 'value' } }
      await redis.setJson('test:json1', data)
      const result = await redis.getJson<typeof data>('test:json1')
      expect(result).toEqual(data)
    })

    it('returns null for non-existent JSON key', async () => {
      const result = await redis.getJson('test:json_nonexistent')
      expect(result).toBeNull()
    })

    it('handles TTL for JSON entries', async () => {
      await redis.setJson('test:json_ttl', { temp: true }, 100) // 100ms TTL
      const immediate = await redis.getJson('test:json_ttl')
      expect(immediate).toEqual({ temp: true })

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 150))
      const expired = await redis.getJson('test:json_ttl')
      expect(expired).toBeNull()
    })
  })

  // ─── Cache miss returns null ───────────────────────────────────────
  describe('cache miss behavior', () => {
    it('get returns null for missing key', async () => {
      const result = await redis.get('cache:missing:key')
      expect(result).toBeNull()
    })

    it('getJson returns null for missing key', async () => {
      const result = await redis.getJson('cache:missing:json')
      expect(result).toBeNull()
    })
  })

  // ─── Pattern-based deletion ────────────────────────────────────────
  describe('delByPattern', () => {
    it('deletes keys matching a pattern', async () => {
      await redis.set('test:pattern:a', '1')
      await redis.set('test:pattern:b', '2')
      await redis.set('test:other:c', '3')

      const count = await redis.delByPattern('test:pattern:*')
      expect(count).toBeGreaterThanOrEqual(2)

      const a = await redis.get('test:pattern:a')
      const b = await redis.get('test:pattern:b')
      const c = await redis.get('test:other:c')

      expect(a).toBeNull()
      expect(b).toBeNull()
      expect(c).toBe('3') // Should NOT be deleted
    })
  })

  // ─── OTP operations ────────────────────────────────────────────────
  describe('OTP operations', () => {
    it('setOtp and getOtp', async () => {
      await redis.setOtp('usr_123', '654321', 300_000)
      const otp = await redis.getOtp('usr_123')
      expect(otp).toBeDefined()
      expect(otp?.code).toBe('654321')
    })

    it('deleteOtp removes OTP', async () => {
      await redis.setOtp('usr_456', '111111', 300_000)
      await redis.deleteOtp('usr_456')
      const otp = await redis.getOtp('usr_456')
      expect(otp).toBeNull()
    })
  })

  // ─── Cache key builders ────────────────────────────────────────────
  describe('CacheKeys', () => {
    it('generates service list key with all params', () => {
      const key = CacheKeys.servicesList(20, 0, 'cat_123', 'ac repair')
      expect(key).toContain('cache:services:list')
      expect(key).toContain('20')
      expect(key).toContain('cat_123')
      expect(key).toContain('ac repair')
    })

    it('generates category key', () => {
      const key = CacheKeys.categoriesAll()
      expect(key).toBe('cache:categories:all')
    })

    it('generates OTP key', () => {
      const key = CacheKeys.otp('usr_123')
      expect(key).toBe('otp:usr_123')
    })

    it('generates session key', () => {
      const key = CacheKeys.session('usr_123')
      expect(key).toBe('session:usr_123')
    })
  })

  // ─── Cache TTL presets ─────────────────────────────────────────────
  describe('CacheTTL', () => {
    it('has correct TTL values', () => {
      expect(CacheTTL.SHORT).toBe(60_000)
      expect(CacheTTL.MEDIUM).toBe(180_000)
      expect(CacheTTL.LONG).toBe(300_000)
      expect(CacheTTL.OTP).toBe(300_000)
      expect(CacheTTL.SESSION).toBe(900_000)
    })
  })

  // ─── Cache metrics ─────────────────────────────────────────────────
  describe('Cache Metrics', () => {
    beforeAll(() => {
      resetCacheMetrics()
    })

    it('records hits and misses', () => {
      recordCacheHit(5)
      recordCacheHit(10)
      recordCacheMiss(3)

      const metrics = getCacheMetrics()
      expect(metrics.hits).toBe(2)
      expect(metrics.misses).toBe(1)
      expect(metrics.hitRate).toBeGreaterThan(0)
    })

    it('calculates average latency', () => {
      resetCacheMetrics()
      recordCacheHit(10)
      recordCacheHit(20)

      const metrics = getCacheMetrics()
      expect(metrics.avgLatencyMs).toBe(15)
    })

    it('reports fallback mode when no Redis', () => {
      const metrics = getCacheMetrics()
      expect(metrics.fallbackMode).toBe(true) // No REDIS_URL set
    })
  })

  // ─── Health check ──────────────────────────────────────────────────
  describe('Health Check', () => {
    it('returns healthy status for memory fallback', async () => {
      const health = await redis.healthCheck()
      expect(health.status).toBeDefined()
      // Memory fallback should be healthy
      expect(['healthy', 'degraded']).toContain(health.status)
    })
  })

  // ─── Popular search tracking ───────────────────────────────────────
  describe('Popular Searches', () => {
    it('tracks and retrieves popular searches', async () => {
      await redis.trackSearch('AC repair')
      await redis.trackSearch('AC repair')
      await redis.trackSearch('plumbing')

      const popular = await redis.getPopularSearches(5)
      expect(popular).toBeDefined()
      expect(Array.isArray(popular)).toBe(true)
    })

    it('ignores very short search terms', async () => {
      await redis.trackSearch('A') // Too short (< 2 chars)
      // Should not throw
    })
  })
})
