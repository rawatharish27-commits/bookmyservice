import { createClient, RedisClientType } from 'redis'

// ─── Redis Cache Layer ─────────────────────────────────────────────────
// Provides a unified caching interface with automatic fallback to in-memory
// when Redis is unavailable. All cache operations are non-blocking — if the
// cache fails, the application continues to work normally.
//
// Use Cases:
//   - Service listings cache (categories, services, providers)
//   - OTP storage (otp:userId → { code, expiresAt })
//   - Session data (session:userId → JWT payload)
//   - Popular searches (popular:services → sorted set)
//
// Cache Keys Convention:
//   cache:services:list          → Service listings
//   cache:services:category:{id} → Services by category
//   cache:categories:all         → All categories
//   cache:providers:nearby:{key} → Nearby providers
//   otp:{userId}                 → OTP codes
//   session:{userId}             → Session data
//   popular:services             → Popular search terms

// ─── In-Memory Fallback Store ──────────────────────────────────────────
interface CacheEntry {
  value: string
  expiresAt: number | null // null = no expiry
}

class MemoryCacheStore {
  private store = new Map<string, CacheEntry>()
  private sortedSets = new Map<string, Map<string, number>>()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Clean up expired entries every 60 seconds
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of this.store) {
        if (entry.expiresAt !== null && entry.expiresAt <= now) {
          this.store.delete(key)
        }
      }
    }, 60_000)
  }

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key)
    if (!entry) return null
    if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
      this.store.delete(key)
      return null
    }
    return entry.value
  }

  async set(key: string, value: string, ttlMs?: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: ttlMs ? Date.now() + ttlMs : null,
    })
  }

  async del(key: string): Promise<void> {
    this.store.delete(key)
  }

  async delByPattern(pattern: string): Promise<number> {
    // Convert Redis-style pattern to regex
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
    let count = 0
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key)
        count++
      }
    }
    return count
  }

  async incr(key: string): Promise<number> {
    const current = parseInt((await this.get(key)) || '0', 10)
    const next = current + 1
    await this.set(key, String(next))
    return next
  }

  async expire(key: string, ttlMs: number): Promise<void> {
    const entry = this.store.get(key)
    if (entry) {
      entry.expiresAt = Date.now() + ttlMs
    }
  }

  // Sorted set operations for popular searches
  async zincrby(key: string, increment: number, member: string): Promise<void> {
    if (!this.sortedSets.has(key)) {
      this.sortedSets.set(key, new Map())
    }
    const set = this.sortedSets.get(key)!
    const current = set.get(member) || 0
    set.set(member, current + increment)
  }

  async zrevrange(key: string, start: number, stop: number): Promise<string[]> {
    const set = this.sortedSets.get(key)
    if (!set) return []
    const entries = [...set.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(start, stop >= 0 ? stop + 1 : undefined)
    return entries.map(([member]) => member)
  }

  async exists(key: string): Promise<boolean> {
    const entry = this.store.get(key)
    if (!entry) return false
    if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
      this.store.delete(key)
      return false
    }
    return true
  }

  shutdown(): void {
    clearInterval(this.cleanupInterval)
    this.store.clear()
    this.sortedSets.clear()
  }
}

// ─── Redis Client Wrapper ──────────────────────────────────────────────
class RedisCache {
  private client: RedisClientType | null = null
  private memoryFallback = new MemoryCacheStore()
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private connectionPromise: Promise<void> | null = null

  constructor() {
    this.connect()
  }

  private async connect(): Promise<void> {
    const redisUrl = process.env.REDIS_URL

    if (!redisUrl) {
      console.log('📦 REDIS_URL not set — using in-memory cache fallback')
      this.isConnected = false
      return
    }

    try {
      this.client = createClient({
        url: redisUrl,
        socket: {
          connectTimeout: 5000,
          reconnectStrategy: (retries) => {
            if (retries > this.maxReconnectAttempts) {
              console.warn('📦 Redis: Max reconnection attempts reached, using memory fallback')
              return new Error('Max reconnection attempts reached')
            }
            // Exponential backoff: 100ms, 200ms, 400ms, etc.
            const delay = Math.min(retries * 100, 3000)
            console.log(`📦 Redis: Reconnecting in ${delay}ms (attempt ${retries})`)
            return delay
          },
        },
      }) as RedisClientType

      this.client.on('connect', () => {
        console.log('📦 Redis: Connected')
        this.isConnected = true
        this.reconnectAttempts = 0
      })

      this.client.on('disconnect', () => {
        console.warn('📦 Redis: Disconnected — falling back to in-memory cache')
        this.isConnected = false
      })

      this.client.on('error', (err) => {
        console.warn('📦 Redis: Error —', err.message)
        this.isConnected = false
      })

      await this.client.connect()
    } catch (err: any) {
      console.warn('📦 Redis: Connection failed —', err.message, '— using in-memory cache fallback')
      this.isConnected = false
      this.client = null
    }
  }

  async ensureConnection(): Promise<void> {
    if (this.connectionPromise) {
      await this.connectionPromise
      return
    }
    if (this.isConnected && this.client) return
    // Try reconnecting once
    this.connectionPromise = this.connect()
    await this.connectionPromise
    this.connectionPromise = null
  }

  // ─── Core Cache Operations ──────────────────────────────────────────

  async get(key: string): Promise<string | null> {
    try {
      if (this.isConnected && this.client) {
        return await this.client.get(key)
      }
    } catch (err: any) {
      console.warn(`📦 Redis GET ${key} failed:`, err.message)
    }
    return this.memoryFallback.get(key)
  }

  async set(key: string, value: string, ttlMs?: number): Promise<void> {
    try {
      if (this.isConnected && this.client) {
        if (ttlMs) {
          await this.client.set(key, value, { PX: ttlMs })
        } else {
          await this.client.set(key, value)
        }
        return
      }
    } catch (err: any) {
      console.warn(`📦 Redis SET ${key} failed:`, err.message)
    }
    await this.memoryFallback.set(key, value, ttlMs)
  }

  async del(key: string): Promise<void> {
    try {
      if (this.isConnected && this.client) {
        await this.client.del(key)
        return
      }
    } catch (err: any) {
      console.warn(`📦 Redis DEL ${key} failed:`, err.message)
    }
    await this.memoryFallback.del(key)
  }

  async delByPattern(pattern: string): Promise<number> {
    try {
      if (this.isConnected && this.client) {
        // Use SCAN for production-safe key iteration
        const keys: string[] = []
        let cursor = 0
        do {
          const result = await this.client.scan(cursor, { MATCH: pattern, COUNT: 100 })
          cursor = result.cursor
          keys.push(...result.keys)
        } while (cursor !== 0)

        if (keys.length > 0) {
          await this.client.del(keys)
        }
        return keys.length
      }
    } catch (err: any) {
      console.warn(`📦 Redis DELBY Pattern ${pattern} failed:`, err.message)
    }
    return this.memoryFallback.delByPattern(pattern)
  }

  async incr(key: string): Promise<number> {
    try {
      if (this.isConnected && this.client) {
        return await this.client.incr(key)
      }
    } catch (err: any) {
      console.warn(`📦 Redis INCR ${key} failed:`, err.message)
    }
    return this.memoryFallback.incr(key)
  }

  async expire(key: string, ttlMs: number): Promise<void> {
    try {
      if (this.isConnected && this.client) {
        await this.client.expire(key, Math.ceil(ttlMs / 1000))
        return
      }
    } catch (err: any) {
      console.warn(`📦 Redis EXPIRE ${key} failed:`, err.message)
    }
    await this.memoryFallback.expire(key, ttlMs)
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (this.isConnected && this.client) {
        return (await this.client.exists(key)) === 1
      }
    } catch (err: any) {
      console.warn(`📦 Redis EXISTS ${key} failed:`, err.message)
    }
    return this.memoryFallback.exists(key)
  }

  // ─── Sorted Set Operations (Popular Searches) ───────────────────────

  async zincrby(key: string, increment: number, member: string): Promise<void> {
    try {
      if (this.isConnected && this.client) {
        await this.client.zIncrBy(key, increment, member)
        return
      }
    } catch (err: any) {
      console.warn(`📦 Redis ZINCRBY ${key} failed:`, err.message)
    }
    await this.memoryFallback.zincrby(key, increment, member)
  }

  async zrevrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      if (this.isConnected && this.client) {
        return await this.client.zRange(key, start, stop, { REV: true })
      }
    } catch (err: any) {
      console.warn(`📦 Redis ZREVRANGE ${key} failed:`, err.message)
    }
    return this.memoryFallback.zrevrange(key, start, stop)
  }

  // ─── JSON Helper (most common use case) ────────────────────────────

  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.get(key)
    if (!raw) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }

  async setJson<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttlMs)
  }

  // ─── OTP Operations ───────────────────────────────────────────────

  async setOtp(userId: string, otpCode: string, ttlMs: number = 300_000): Promise<void> {
    await this.setJson(`otp:${userId}`, { code: otpCode, createdAt: Date.now() }, ttlMs)
  }

  async getOtp(userId: string): Promise<{ code: string; createdAt: number } | null> {
    return this.getJson(`otp:${userId}`)
  }

  async deleteOtp(userId: string): Promise<void> {
    await this.del(`otp:${userId}`)
  }

  // ─── Session Operations ────────────────────────────────────────────

  async setSession(userId: string, sessionData: Record<string, any>, ttlMs: number = 900_000): Promise<void> {
    await this.setJson(`session:${userId}`, sessionData, ttlMs)
  }

  async getSession(userId: string): Promise<Record<string, any> | null> {
    return this.getJson(`session:${userId}`)
  }

  async deleteSession(userId: string): Promise<void> {
    await this.del(`session:${userId}`)
  }

  // ─── Popular Search Tracking ───────────────────────────────────────

  async trackSearch(searchTerm: string): Promise<void> {
    const normalized = searchTerm.toLowerCase().trim()
    if (normalized.length < 2 || normalized.length > 100) return
    await this.zincrby('popular:services', 1, normalized)
  }

  async getPopularSearches(count: number = 10): Promise<string[]> {
    return this.zrevrange('popular:services', 0, count - 1)
  }

  // ─── Health Check ──────────────────────────────────────────────────

  get status(): { connected: boolean; backend: string } {
    return {
      connected: this.isConnected,
      backend: this.isConnected ? 'redis' : 'memory',
    }
  }

  async ping(): Promise<{ ok: boolean; backend: string; latencyMs?: number }> {
    const start = Date.now()
    try {
      if (this.isConnected && this.client) {
        await this.client.ping()
        return { ok: true, backend: 'redis', latencyMs: Date.now() - start }
      }
    } catch {
      // fall through
    }
    // Memory cache is always available
    return { ok: true, backend: 'memory', latencyMs: Date.now() - start }
  }

  shutdown(): void {
    this.memoryFallback.shutdown()
    if (this.client) {
      this.client.disconnect().catch(() => {})
    }
  }
}

// ─── Singleton Export ──────────────────────────────────────────────────
// Single instance shared across the entire application
export const redis = new RedisCache()

// ─── Cache Key Builders ────────────────────────────────────────────────
export const CacheKeys = {
  // Service listings
  servicesList: (limit: number, offset: number, categoryId?: string, search?: string) =>
    `cache:services:list:${limit}:${offset}:${categoryId || 'all'}:${search || ''}`,

  servicesByCategory: (categoryId: string | number, limit: number, offset: number) =>
    `cache:services:category:${categoryId}:${limit}:${offset}`,

  serviceDetail: (id: string) =>
    `cache:services:detail:${id}`,

  // Categories
  categoriesAll: () => 'cache:categories:all',

  categoryDetail: (id: string) =>
    `cache:categories:detail:${id}`,

  // Providers
  nearbyProviders: (lat: number, lng: number, radius: number, categoryId?: string) =>
    `cache:providers:nearby:${lat.toFixed(2)}:${lng.toFixed(2)}:${radius}:${categoryId || 'all'}`,

  // Stats
  platformStats: () => 'cache:stats:platform',

  // OTPs
  otp: (userId: string) => `otp:${userId}`,

  // Sessions
  session: (userId: string) => `session:${userId}`,

  // Popular
  popularSearches: () => 'popular:services',
}

// ─── Cache TTL Presets (in milliseconds) ───────────────────────────────
export const CacheTTL = {
  SHORT: 60_000,        // 60 seconds — for rapidly changing data
  MEDIUM: 180_000,      // 3 minutes — for service listings
  LONG: 300_000,        // 5 minutes — for categories, stats
  OTP: 300_000,         // 5 minutes — OTP expiry
  SESSION: 900_000,     // 15 minutes — session data (matches JWT)
  POPULAR: 3_600_000,   // 1 hour — popular searches persist longer
}
