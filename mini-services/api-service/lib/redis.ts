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
  private consecutiveFailures = 0
  private readonly autoRecoveryThreshold = 5
  private tagStore = new Map<string, Set<string>>() // tag → Set of cache keys (in-memory fallback for tag tracking)

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

  /**
   * Record a successful operation — resets the consecutive failure counter.
   */
  private recordSuccess(): void {
    this.consecutiveFailures = 0
  }

  /**
   * Record a failed operation — increments failure counter and triggers
   * auto-recovery if the threshold is exceeded.
   */
  private recordFailure(): void {
    this.consecutiveFailures++
    if (this.consecutiveFailures >= this.autoRecoveryThreshold) {
      console.warn(`📦 Redis: ${this.consecutiveFailures} consecutive failures — triggering auto-recovery`)
      this.forceReconnect().catch((err) => {
        console.warn('📦 Redis: Auto-recovery failed:', (err as Error).message)
      })
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      if (this.isConnected && this.client) {
        const result = await this.client.get(key)
        this.recordSuccess()
        return result
      }
    } catch (err: any) {
      console.warn(`📦 Redis GET ${key} failed:`, err.message)
      this.recordFailure()
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
        this.recordSuccess()
        return
      }
    } catch (err: any) {
      console.warn(`📦 Redis SET ${key} failed:`, err.message)
      this.recordFailure()
    }
    await this.memoryFallback.set(key, value, ttlMs)
  }

  async del(key: string): Promise<void> {
    try {
      if (this.isConnected && this.client) {
        await this.client.del(key)
        this.recordSuccess()
        return
      }
    } catch (err: any) {
      console.warn(`📦 Redis DEL ${key} failed:`, err.message)
      this.recordFailure()
    }
    await this.memoryFallback.del(key)
  }

  async delByPattern(pattern: string): Promise<number> {
    try {
      if (this.isConnected && this.client) {
        // Use SCAN for production-safe key iteration
        const keys: string[] = []
        let cursor = '0'
        do {
          const result = await this.client.scan(cursor, { MATCH: pattern, COUNT: 100 })
          cursor = result.cursor
          keys.push(...result.keys)
        } while (cursor !== '0')

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

  // ─── Distributed Invalidation ───────────────────────────────────────

  /**
   * Invalidate all cache keys associated with a given tag.
   * Uses Redis hash to track keys by tag when Redis is available,
   * falls back to in-memory tag store otherwise.
   *
   * @param tag - The tag to invalidate (e.g., 'user:123', 'category:5')
   * @returns Number of keys invalidated
   */
  async invalidateByTag(tag: string): Promise<number> {
    const tagKey = `__tag:${tag}`

    try {
      if (this.isConnected && this.client) {
        // Get all keys associated with this tag from Redis hash
        const keys = await this.client.hKeys(tagKey)

        if (keys.length > 0) {
          // Delete all the cached keys
          await this.client.del(keys)

          // Delete the tag tracking hash itself
          await this.client.del(tagKey)

          this.recordSuccess()
          return keys.length
        }

        this.recordSuccess()
        return 0
      }
    } catch (err: any) {
      console.warn(`📦 Redis invalidateByTag ${tag} failed:`, err.message)
      this.recordFailure()
    }

    // In-memory fallback
    const taggedKeys = this.tagStore.get(tag)
    if (taggedKeys && taggedKeys.size > 0) {
      const count = taggedKeys.size
      for (const key of taggedKeys) {
        await this.memoryFallback.del(key)
      }
      this.tagStore.delete(tag)
      return count
    }

    return 0
  }

  /**
   * Associate a cache key with one or more tags for distributed invalidation.
   *
   * @param key - The cache key to tag
   * @param tags - Array of tags to associate with this key
   */
  async tagKey(key: string, tags: string[]): Promise<void> {
    if (!tags || tags.length === 0) return

    try {
      if (this.isConnected && this.client) {
        // For each tag, add the key to the tag's hash
        const pipeline = this.client.multi()
        for (const tag of tags) {
          const tagKey = `__tag:${tag}`
          pipeline.hSet(tagKey, { [key]: '1' })
        }
        await pipeline.exec()
        this.recordSuccess()
        return
      }
    } catch (err: any) {
      console.warn(`📦 Redis tagKey ${key} failed:`, err.message)
      this.recordFailure()
    }

    // In-memory fallback
    for (const tag of tags) {
      if (!this.tagStore.has(tag)) {
        this.tagStore.set(tag, new Set())
      }
      this.tagStore.get(tag)!.add(key)
    }
  }

  /**
   * Convenience method to invalidate all cache entries for a user.
   * Calls invalidateByTag with the `user:{userId}` tag.
   *
   * @param userId - The user ID whose cache entries should be invalidated
   */
  async invalidateUser(userId: string): Promise<void> {
    await this.invalidateByTag(`user:${userId}`)
  }

  // ─── Eviction Policy Management ─────────────────────────────────────

  /**
   * Set the Redis eviction policy via CONFIG SET.
   * Only works when Redis is connected; no-op for in-memory fallback.
   *
   * @param policy - The eviction policy to set
   */
  async setEvictionPolicy(
    policy: 'allkeys-lru' | 'volatile-lru' | 'allkeys-lfu' | 'volatile-lfu' | 'noeviction'
  ): Promise<void> {
    try {
      if (this.isConnected && this.client) {
        await this.client.configSet('maxmemory-policy', policy)
        this.recordSuccess()
        return
      }
    } catch (err: any) {
      console.warn(`📦 Redis setEvictionPolicy failed:`, err.message)
      this.recordFailure()
      throw new Error(`Failed to set eviction policy: ${err.message}`)
    }

    // In-memory fallback — no eviction policy concept
    console.warn('📦 Redis: Cannot set eviction policy — using in-memory fallback (no eviction policy)')
  }

  /**
   * Get the current Redis eviction policy.
   *
   * @returns The current eviction policy string
   */
  async getEvictionPolicy(): Promise<string> {
    try {
      if (this.isConnected && this.client) {
        const result = await this.client.configGet('maxmemory-policy')
        const policy = result['maxmemory-policy']
        this.recordSuccess()
        return typeof policy === 'string' ? policy : 'noeviction'
      }
    } catch (err: any) {
      console.warn(`📦 Redis getEvictionPolicy failed:`, err.message)
      this.recordFailure()
    }

    // In-memory fallback
    return 'noeviction'
  }

  /**
   * Get Redis memory information and stats.
   *
   * @returns Object with memory usage, max memory, fragmentation ratio, and eviction policy
   */
  async getMemoryInfo(): Promise<{
    usedMemory: string
    maxMemory: string
    fragmentationRatio: number
    evictionPolicy: string
  }> {
    const defaultInfo = {
      usedMemory: '0B',
      maxMemory: '0B',
      fragmentationRatio: 1.0,
      evictionPolicy: 'noeviction',
    }

    try {
      if (this.isConnected && this.client) {
        const info = await this.client.info('memory')
        const policy = await this.getEvictionPolicy()

        // Parse memory info string
        const usedMemory = this.parseInfoField(info, 'used_memory_human') || '0B'
        const maxMemory = this.parseInfoField(info, 'maxmemory_human') || '0B'
        const fragRatio = parseFloat(this.parseInfoField(info, 'mem_fragmentation_ratio') || '1.0')

        this.recordSuccess()
        return {
          usedMemory,
          maxMemory,
          fragmentationRatio: isNaN(fragRatio) ? 1.0 : fragRatio,
          evictionPolicy: policy,
        }
      }
    } catch (err: any) {
      console.warn(`📦 Redis getMemoryInfo failed:`, err.message)
      this.recordFailure()
    }

    return defaultInfo
  }

  /**
   * Parse a field from Redis INFO output.
   */
  private parseInfoField(info: string, field: string): string | null {
    const lines = info.split('\r\n')
    for (const line of lines) {
      if (line.startsWith(`${field}:`)) {
        return line.substring(field.length + 1)
      }
    }
    return null
  }

  // ─── Health Recovery ────────────────────────────────────────────────

  /**
   * Force-close the current Redis connection and create a new one.
   * Used when the connection is in a bad state.
   *
   * @returns true if reconnection succeeded, false otherwise
   */
  async forceReconnect(): Promise<boolean> {
    console.log('📦 Redis: Force reconnecting...')

    // Close existing connection
    if (this.client) {
      try {
        await this.client.quit()
      } catch {
        // Force disconnect if quit fails
        try {
          this.client.disconnect()
        } catch {
          // ignore
        }
      }
      this.client = null
      this.isConnected = false
    }

    // Reset reconnection attempts to allow fresh connection
    this.reconnectAttempts = 0
    this.connectionPromise = null
    this.consecutiveFailures = 0

    // Attempt to reconnect
    try {
      await this.connect()
      return this.isConnected
    } catch (err: any) {
      console.warn('📦 Redis: Force reconnect failed:', err.message)
      return false
    }
  }

  /**
   * Comprehensive health check that tests read, write, and delete operations.
   *
   * @returns Health status with detailed metrics
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'down'
    backend: string
    latencyMs: number
    memoryUsage?: number
    connectedClients?: number
  }> {
    const start = Date.now()

    // If no Redis URL configured, check memory fallback
    if (!process.env.REDIS_URL) {
      // Test in-memory fallback with read/write/delete
      try {
        const testKey = `__health:${Date.now()}`
        await this.memoryFallback.set(testKey, 'ok', 5000)
        const result = await this.memoryFallback.get(testKey)
        await this.memoryFallback.del(testKey)

        if (result === 'ok') {
          return {
            status: 'degraded', // Memory fallback is degraded compared to Redis
            backend: 'memory',
            latencyMs: Date.now() - start,
          }
        }
      } catch {
        // fall through
      }

      return {
        status: 'down',
        backend: 'none',
        latencyMs: Date.now() - start,
      }
    }

    // Test Redis with read/write/delete
    try {
      if (this.isConnected && this.client) {
        const testKey = `__health:${Date.now()}`
        const testValue = `check-${Date.now()}`

        // Write
        await this.client.set(testKey, testValue, { PX: 5000 })

        // Read
        const result = await this.client.get(testKey)

        // Delete
        await this.client.del(testKey)

        if (result !== testValue) {
          return {
            status: 'degraded',
            backend: 'redis',
            latencyMs: Date.now() - start,
          }
        }

        // Get additional info
        let memoryUsage: number | undefined
        let connectedClients: number | undefined

        try {
          const info = await this.client.info('memory')
          const usedMemoryStr = this.parseInfoField(info, 'used_memory')
          if (usedMemoryStr) {
            memoryUsage = parseInt(usedMemoryStr, 10)
          }
        } catch {
          // ignore
        }

        try {
          const info = await this.client.info('clients')
          const clientsStr = this.parseInfoField(info, 'connected_clients')
          if (clientsStr) {
            connectedClients = parseInt(clientsStr, 10)
          }
        } catch {
          // ignore
        }

        this.recordSuccess()

        return {
          status: 'healthy',
          backend: 'redis',
          latencyMs: Date.now() - start,
          memoryUsage,
          connectedClients,
        }
      }
    } catch (err: any) {
      console.warn('📦 Redis healthCheck failed:', err.message)
      this.recordFailure()
    }

    // Redis unavailable — try memory fallback
    try {
      const testKey = `__health:${Date.now()}`
      await this.memoryFallback.set(testKey, 'ok', 5000)
      const result = await this.memoryFallback.get(testKey)
      await this.memoryFallback.del(testKey)

      if (result === 'ok') {
        return {
          status: 'degraded',
          backend: 'memory',
          latencyMs: Date.now() - start,
        }
      }
    } catch {
      // fall through
    }

    return {
      status: 'down',
      backend: 'none',
      latencyMs: Date.now() - start,
    }
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
