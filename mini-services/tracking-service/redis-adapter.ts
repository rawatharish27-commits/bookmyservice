/**
 * ─── Tracking Service — Redis Socket.IO Adapter ────────────────────────
 *
 * Dedicated module for Redis-based Socket.IO adapter setup.
 * Enables horizontal scaling by sharing Socket.IO state across
 * multiple tracking service instances via Redis pub/sub.
 *
 * Features:
 *   - Automatic Redis adapter setup with graceful fallback
 *   - Connection lifecycle management (connect, reconnect, shutdown)
 *   - Redis-backed live location storage (cross-instance retrieval)
 *   - Health check and status reporting
 *   - Reconnection strategy with exponential backoff
 */

import { Server as SocketIOServer } from 'socket.io'
import { REDIS_URL } from './config'

// ─── Types ────────────────────────────────────────────────────────────

interface LocationData {
  lat: number
  lng: number
  accuracy?: number
  heading?: number
  speed?: number
  updatedAt: number
}

interface RedisAdapterStatus {
  active: boolean
  connected: boolean
  url: string
  pubClientReady: boolean
  subClientReady: boolean
  lastError: string | null
  reconnectAttempts: number
  locationStoreActive: boolean
}

// ─── Module State ─────────────────────────────────────────────────────

let pubClient: any = null
let subClient: any = null
let adapterActive = false
let locationStoreActive = false
let lastError: string | null = null
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 10

// Redis key prefix for live location storage
const LOCATION_KEY_PREFIX = 'tracking:location:'
// TTL for location entries (5 minutes — stale locations auto-expire)
const LOCATION_TTL_MS = 300_000

// ─── Adapter Setup ────────────────────────────────────────────────────

/**
 * Initialize the Redis Socket.IO adapter.
 * If REDIS_URL is not set or connection fails, the service continues
 * in single-instance (in-memory) mode.
 *
 * @param io - The Socket.IO server instance
 * @returns Promise resolving to true if adapter was set up successfully
 */
export async function setupRedisAdapter(io: SocketIOServer): Promise<boolean> {
  if (!REDIS_URL) {
    console.log('📡 Redis adapter: REDIS_URL not set — running in single-instance mode')
    return false
  }

  try {
    // Dynamic imports to avoid loading Redis when not needed
    const { createAdapter } = await import('@socket.io/redis-adapter')
    const { createClient } = await import('redis')

    // Create publisher client (for emitting events)
    pubClient = createClient({
      url: REDIS_URL,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries: number) => {
          if (retries > MAX_RECONNECT_ATTEMPTS) {
            console.warn(`📡 Redis adapter: Max reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached`)
            return new Error('Max reconnection attempts reached')
          }
          reconnectAttempts = retries
          // Exponential backoff: 100ms, 200ms, 400ms, 800ms, etc. (max 5s)
          const delay = Math.min(retries * 100, 5000)
          console.log(`📡 Redis adapter: Reconnecting in ${delay}ms (attempt ${retries})`)
          return delay
        },
      },
    })

    // Create subscriber client (for receiving events)
    subClient = pubClient.duplicate()

    // Set up event listeners for monitoring
    pubClient.on('connect', () => {
      console.log('📡 Redis adapter: Publisher client connected')
      adapterActive = true
      reconnectAttempts = 0
      lastError = null
    })

    pubClient.on('disconnect', () => {
      console.warn('📡 Redis adapter: Publisher client disconnected')
      adapterActive = false
    })

    pubClient.on('error', (err: Error) => {
      console.warn('📡 Redis adapter: Publisher client error —', err.message)
      lastError = err.message
      adapterActive = false
    })

    subClient.on('connect', () => {
      console.log('📡 Redis adapter: Subscriber client connected')
      reconnectAttempts = 0
    })

    subClient.on('error', (err: Error) => {
      console.warn('📡 Redis adapter: Subscriber client error —', err.message)
      lastError = err.message
    })

    // Connect both clients
    await Promise.all([pubClient.connect(), subClient.connect()])

    // Attach the Redis adapter to Socket.IO
    io.adapter(createAdapter(pubClient, subClient))

    adapterActive = true
    locationStoreActive = true

    console.log('📡 Redis adapter: Socket.IO Redis adapter connected successfully')
    console.log(`📡 Redis adapter: Location store enabled (TTL: ${LOCATION_TTL_MS / 1000}s)`)

    return true
  } catch (err: any) {
    console.warn('📡 Redis adapter: Setup failed, using in-memory only —', err.message)
    lastError = err.message
    adapterActive = false
    locationStoreActive = false
    pubClient = null
    subClient = null
    return false
  }
}

// ─── Redis-Backed Location Storage ────────────────────────────────────

/**
 * Store a live location update in Redis.
 * This allows other tracking service instances to retrieve the
 * latest provider/technician location for a booking.
 *
 * Falls back silently if Redis is not available.
 *
 * @param bookingId - The booking ID
 * @param location - The location data to store
 */
export async function storeLocation(bookingId: string, location: LocationData): Promise<void> {
  if (!locationStoreActive || !pubClient) return

  try {
    const key = `${LOCATION_KEY_PREFIX}${bookingId}`
    await pubClient.set(key, JSON.stringify(location), { PX: LOCATION_TTL_MS })
  } catch (err: any) {
    // Non-blocking — in-memory fallback is always available
    console.warn('📡 Redis location store: Failed to store —', err.message)
  }
}

/**
 * Retrieve a live location from Redis.
 * Used when a client joins a booking room on a different instance
 * than the one where the provider is sending location updates.
 *
 * @param bookingId - The booking ID to look up
 * @returns Location data or null if not found / Redis unavailable
 */
export async function retrieveLocation(bookingId: string): Promise<LocationData | null> {
  if (!locationStoreActive || !pubClient) return null

  try {
    const key = `${LOCATION_KEY_PREFIX}${bookingId}`
    const raw = await pubClient.get(key)
    if (!raw) return null

    const parsed = JSON.parse(raw) as LocationData

    // Check if location is stale (older than 2x TTL)
    const age = Date.now() - parsed.updatedAt
    if (age > LOCATION_TTL_MS * 2) {
      return null // Stale location, discard
    }

    return parsed
  } catch (err: any) {
    console.warn('📡 Redis location store: Failed to retrieve —', err.message)
    return null
  }
}

/**
 * Remove a booking's live location from Redis.
 * Called when a booking is completed or cancelled.
 *
 * @param bookingId - The booking ID to remove
 */
export async function removeLocation(bookingId: string): Promise<void> {
  if (!locationStoreActive || !pubClient) return

  try {
    const key = `${LOCATION_KEY_PREFIX}${bookingId}`
    await pubClient.del(key)
  } catch (err: any) {
    console.warn('📡 Redis location store: Failed to remove —', err.message)
  }
}

/**
 * Get all active booking IDs that have live locations in Redis.
 * Useful for monitoring and debugging.
 *
 * @returns Array of booking IDs with active locations
 */
export async function getActiveLocationBookings(): Promise<string[]> {
  if (!locationStoreActive || !pubClient) return []

  try {
    const keys: string[] = []
    let cursor = '0'
    do {
      const result = await pubClient.scan(cursor, {
        MATCH: `${LOCATION_KEY_PREFIX}*`,
        COUNT: 100,
      })
      cursor = result.cursor
      keys.push(...result.keys)
    } while (cursor !== '0')

    // Strip the prefix to return just booking IDs
    return keys.map((key: string) => key.replace(LOCATION_KEY_PREFIX, ''))
  } catch (err: any) {
    console.warn('📡 Redis location store: Failed to scan —', err.message)
    return []
  }
}

// ─── Health Check ─────────────────────────────────────────────────────

/**
 * Check the health of the Redis adapter connection.
 *
 * @returns Detailed status of the Redis adapter
 */
export function getAdapterStatus(): RedisAdapterStatus {
  return {
    active: adapterActive,
    connected: adapterActive,
    url: REDIS_URL ? REDIS_URL.replace(/\/\/.*:.*@/, '//***:***@') : '(not set)',
    pubClientReady: pubClient?.isReady ?? false,
    subClientReady: subClient?.isReady ?? false,
    lastError,
    reconnectAttempts,
    locationStoreActive,
  }
}

/**
 * Perform a Redis PING health check.
 *
 * @returns true if Redis responded, false otherwise
 */
export async function pingRedis(): Promise<boolean> {
  if (!pubClient) return false

  try {
    const result = await pubClient.ping()
    return result === 'PONG'
  } catch {
    return false
  }
}

// ─── Graceful Shutdown ────────────────────────────────────────────────

/**
 * Close Redis adapter connections gracefully.
 * Called during service shutdown to clean up resources.
 */
export async function closeRedisAdapter(): Promise<void> {
  const clients = [pubClient, subClient]

  for (const client of clients) {
    if (client) {
      try {
        await client.quit()
      } catch {
        // Force disconnect if quit fails
        try {
          client.disconnect()
        } catch {
          // ignore
        }
      }
    }
  }

  pubClient = null
  subClient = null
  adapterActive = false
  locationStoreActive = false

  console.log('📡 Redis adapter: Connections closed')
}
