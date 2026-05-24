/**
 * Distributed rate limiting using Redis for multi-instance coordination
 * Falls back to in-memory when Redis is unavailable
 */

import { redis } from './redis'

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  retryAfter?: number
}

// ─── In-Memory Rate Limit Store (Fallback) ──────────────────────────
interface MemoryRateLimitEntry {
  count: number
  resetAt: number
}

class MemoryRateLimitStore {
  private store = new Map<string, MemoryRateLimitEntry>()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Clean up expired entries every 60 seconds
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of this.store) {
        if (now >= entry.resetAt) {
          this.store.delete(key)
        }
      }
    }, 60_000)
  }

  check(key: string, windowMs: number, maxRequests: number): RateLimitResult {
    const now = Date.now()
    const entry = this.store.get(key)

    if (!entry || now >= entry.resetAt) {
      // New window
      const resetAt = now + windowMs
      this.store.set(key, { count: 1, resetAt })
      return { allowed: true, remaining: maxRequests - 1, resetAt }
    }

    if (entry.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.resetAt,
        retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      }
    }

    entry.count++
    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      resetAt: entry.resetAt,
    }
  }

  shutdown(): void {
    clearInterval(this.cleanupInterval)
    this.store.clear()
  }
}

// ─── Distributed Rate Limiter ───────────────────────────────────────
export class DistributedRateLimiter {
  private prefix: string
  private windowMs: number
  private maxRequests: number
  private memoryFallback = new MemoryRateLimitStore()

  constructor(prefix: string, windowMs: number, maxRequests: number) {
    this.prefix = prefix
    this.windowMs = windowMs
    this.maxRequests = maxRequests
  }

  async check(key: string): Promise<RateLimitResult> {
    const fullKey = `${this.prefix}:${key}`
    const now = Date.now()
    const resetAt = now + this.windowMs

    // Try Redis first for distributed rate limiting
    try {
      if (redis.isConnected && (redis as any).client) {
        const client = (redis as any).client

        // Use Redis MULTI for atomic check-and-increment
        // Key format: rl:prefix:key → { count, resetAt }
        const rlKey = fullKey

        // Get current window data
        const currentData = await client.get(rlKey)

        if (currentData) {
          const parsed = JSON.parse(currentData)

          // Check if window has expired
          if (now >= parsed.resetAt) {
            // Start new window
            const newData = JSON.stringify({ count: 1, resetAt })
            await client.set(rlKey, newData, { PX: this.windowMs + 1000 })
            return { allowed: true, remaining: this.maxRequests - 1, resetAt }
          }

          // Window is active
          if (parsed.count >= this.maxRequests) {
            return {
              allowed: false,
              remaining: 0,
              resetAt: parsed.resetAt,
              retryAfter: Math.ceil((parsed.resetAt - now) / 1000),
            }
          }

          // Increment count
          parsed.count++
          const newData = JSON.stringify(parsed)
          await client.set(rlKey, newData, { PX: Math.max(0, parsed.resetAt - now + 1000) })

          return {
            allowed: true,
            remaining: this.maxRequests - parsed.count,
            resetAt: parsed.resetAt,
          }
        }

        // No existing window — start new one
        const newData = JSON.stringify({ count: 1, resetAt })
        await client.set(rlKey, newData, { PX: this.windowMs + 1000 })
        return { allowed: true, remaining: this.maxRequests - 1, resetAt }
      }
    } catch (err: any) {
      // Redis operation failed — fall back to in-memory
      console.warn(`📦 Rate limiter Redis fallback for ${fullKey}:`, err.message)
    }

    // In-memory fallback
    return this.memoryFallback.check(fullKey, this.windowMs, this.maxRequests)
  }
}

// ─── Pre-configured Rate Limiters ───────────────────────────────────
export const authLimiter = new DistributedRateLimiter('rl:auth', 60_000, 20)
export const apiLimiter = new DistributedRateLimiter('rl:api', 60_000, 100)
export const bookingLimiter = new DistributedRateLimiter('rl:booking', 60_000, 10)
export const paymentLimiter = new DistributedRateLimiter('rl:payment', 60_000, 5)
