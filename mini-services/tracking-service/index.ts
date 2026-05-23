/**
 * ─── BookMyService — Real-time Booking Tracking Service ─────────────────
 *
 * Socket.IO mini-service for real-time booking tracking.
 * Allows clients to track their service provider's location in real-time,
 * and all parties to receive live booking status updates.
 *
 * Port: 3003
 * Frontend connects via: io("/?XTransformPort=3003")
 *
 * Architecture:
 *   - Each booking gets a room: `booking:{bookingId}`
 *   - Each user gets a room: `user:{userId}`
 *   - Admin gets a room: `admin:notifications`
 *   - Redis adapter (optional) for horizontal scaling via pub/sub
 *   - Redis-backed location store for cross-instance location retrieval
 *
 * Modules:
 *   - config.ts         — Configuration constants (PORT, JWT_SECRET, REDIS_URL, etc.)
 *   - database.ts       — PostgreSQL pool, table creation, DB helpers
 *   - auth.ts           — JWT verification for socket connections
 *   - handlers.ts       — Socket event handlers + in-memory liveLocations
 *   - redis-adapter.ts  — Redis Socket.IO adapter + location store
 *   - index.ts          — Entry point (this file) — assembles all modules
 */

import { Server as SocketIOServer } from 'socket.io'
import { createServer, IncomingMessage, ServerResponse } from 'http'

// ─── Configuration ──────────────────────────────────────────────────────
const PORT = 3003
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'development' ? 'dev-secret-key' : (() => { throw new Error('JWT_SECRET environment variable is required in production') })())

// Allowed CORS origins — matches main API service
// Additional origins can be added via ALLOWED_ORIGINS env var (comma-separated)
const ALLOWED_ORIGINS = [
  'https://bookmyservice.pages.dev',
  'https://bookyourservice.co.in',
  'https://www.bookyourservice.co.in',
  'https://bookmyservice-eta.vercel.app',
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean) : []),
]

function isOriginAllowed(origin: string): boolean {
  if (ALLOWED_ORIGINS.includes(origin)) return true
  if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) return true
  return false
}

// ─── Database Pool ──────────────────────────────────────────────────────
let pool: Pool | null = null
let dbAvailable = false

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 3,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  })

  pool.on('error', (err) => {
    console.error('🔴 Idle pool client error:', err.message)
  })

  // Test connection and create tables
  pool.query('SELECT 1 as ok')
    .then(async () => {
      console.log('✅ Database connected successfully')
      dbAvailable = true
      await createTrackingTables()
    })
    .catch((err) => {
      console.warn('⚠️  Database connection failed (non-fatal — WebSocket will still work):', err.message)
      dbAvailable = false
    })
} else {
  console.warn('⚠️  DATABASE_URL not set — running without DB persistence (WebSocket only)')
}

// ─── Create Tracking Tables ─────────────────────────────────────────────
async function createTrackingTables(): Promise<void> {
  if (!pool) return

  try {
    // LiveTechnicianLocation — stores the most recent GPS position per provider/technician
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "LiveTechnicianLocation" (
        id TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL,
        accuracy DOUBLE PRECISION,
        heading DOUBLE PRECISION,
        speed DOUBLE PRECISION,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `)
    await pool.query('CREATE INDEX IF NOT EXISTS idx_live_tech_loc_userId ON "LiveTechnicianLocation" ("userId");')
      .catch(() => {}) // index may already exist

    // BookingTracking — stores location history for a specific booking
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "BookingTracking" (
        id TEXT PRIMARY KEY,
        "bookingId" TEXT NOT NULL,
        "providerId" TEXT NOT NULL,
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL,
        accuracy DOUBLE PRECISION,
        heading DOUBLE PRECISION,
        speed DOUBLE PRECISION,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `)
    await pool.query('CREATE INDEX IF NOT EXISTS idx_booking_tracking_bookingId ON "BookingTracking" ("bookingId");')
      .catch(() => {})
    await pool.query('CREATE INDEX IF NOT EXISTS idx_booking_tracking_createdAt ON "BookingTracking" ("createdAt" DESC);')
      .catch(() => {})

    // BookingTimeline — stores status change events per booking
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "BookingTimeline" (
        id TEXT PRIMARY KEY,
        "bookingId" TEXT NOT NULL,
        status TEXT NOT NULL,
        "changedBy" TEXT NOT NULL,
        note TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `)
    await pool.query('CREATE INDEX IF NOT EXISTS idx_booking_timeline_bookingId ON "BookingTimeline" ("bookingId");')
      .catch(() => {})
    await pool.query('CREATE INDEX IF NOT EXISTS idx_booking_timeline_createdAt ON "BookingTimeline" ("createdAt" DESC);')
      .catch(() => {})

    console.log('✅ Tracking tables ensured (LiveTechnicianLocation, BookingTracking, BookingTimeline)')
  } catch (err: any) {
    console.error('⚠️  Tracking table creation error (non-fatal):', err.message)
  }
}

// ─── JWT Verification ───────────────────────────────────────────────────
interface AuthPayload {
  sub: string        // userId
  email: string
  role: string       // CLIENT, PROVIDER, TECHNICIAN, ADMIN, etc.
  roleId: number     // 1=CLIENT, 2=PROVIDER, 3=ADMIN, 4=TECHNICIAN, etc.
}

async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'bookyourservice',
      audience: 'bookyourservice',
    })
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      role: payload.role as string,
      roleId: payload.roleId as number,
    }
  } catch (err: any) {
    console.warn('🔐 JWT verification failed:', err.code || err.message)
    return null
  }
}

// ─── Database Helpers ───────────────────────────────────────────────────

/** Update LiveTechnicianLocation with latest GPS data */
async function persistLocationUpdate(
  userId: string,
  lat: number,
  lng: number,
  accuracy?: number,
  heading?: number,
  speed?: number,
): Promise<void> {
  if (!pool || !dbAvailable) return
  try {
    const id = 'loc_' + userId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)
    await pool.query(`
      INSERT INTO "LiveTechnicianLocation" (id, "userId", latitude, longitude, accuracy, heading, speed, "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (id) DO UPDATE SET
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        accuracy = EXCLUDED.accuracy,
        heading = EXCLUDED.heading,
        speed = EXCLUDED.speed,
        "updatedAt" = NOW()
    `, [id, userId, lat, lng, accuracy ?? null, heading ?? null, speed ?? null])
  } catch (err: any) {
    console.error('⚠️  Failed to persist LiveTechnicianLocation:', err.message)
  }
}

/** Insert a location history point for a booking */
async function persistBookingTracking(
  bookingId: string,
  providerId: string,
  lat: number,
  lng: number,
  accuracy?: number,
  heading?: number,
  speed?: number,
): Promise<void> {
  if (!pool || !dbAvailable) return
  try {
    const id = 'bt_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query(`
      INSERT INTO "BookingTracking" (id, "bookingId", "providerId", latitude, longitude, accuracy, heading, speed, "createdAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    `, [id, bookingId, providerId, lat, lng, accuracy ?? null, heading ?? null, speed ?? null])
  } catch (err: any) {
    console.error('⚠️  Failed to persist BookingTracking:', err.message)
  }
}

/** Insert a timeline event and update Booking status */
async function persistStatusChange(
  bookingId: string,
  status: string,
  changedBy: string,
  note?: string,
): Promise<void> {
  if (!pool || !dbAvailable) return
  try {
    // Insert timeline event
    const timelineId = 'tl_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query(`
      INSERT INTO "BookingTimeline" (id, "bookingId", status, "changedBy", note, "createdAt")
      VALUES ($1, $2, $3, $4, $5, NOW())
    `, [timelineId, bookingId, status, changedBy, note ?? null])

    // Update Booking table status
    const updates = ['status = $1', '"updatedAt" = NOW()']
    const values: any[] = [status]
    let idx = 2

    if (status === 'COMPLETED') {
      updates.push('"completedAt" = NOW()')
    }
    if (status === 'CANCELLED') {
      updates.push('"cancelledAt" = NOW()')
    }

    values.push(bookingId)
    await pool.query(`UPDATE "Booking" SET ${updates.join(', ')} WHERE id = $${idx}`, values)
  } catch (err: any) {
    console.error('⚠️  Failed to persist status change:', err.message)
  }
}

/** Verify that a user is part of a booking (client, provider, or technician) */
async function verifyBookingAccess(userId: string, bookingId: string): Promise<boolean> {
  if (!pool || !dbAvailable) return true // If no DB, allow access (graceful degradation)
  try {
    const result = await pool.query(
      'SELECT "clientId", "providerId", "technicianId" FROM "Booking" WHERE id = $1',
      [bookingId]
    )
    if (result.rows.length === 0) return false
    const booking = result.rows[0]
    return (
      booking.clientId === userId ||
      booking.providerId === userId ||
      booking.technicianId === userId
    )
  } catch (err: any) {
    console.error('⚠️  Failed to verify booking access:', err.message)
    return true // Graceful degradation — allow on DB error
  }
}

// ─── In-Memory State (for when DB is unavailable) ───────────────────────
const liveLocations = new Map<string, {
  lat: number
  lng: number
  accuracy?: number
  heading?: number
  speed?: number
  updatedAt: number
}>()

// ─── Socket.IO Server ──────────────────────────────────────────────────
// Create an HTTP server first, then attach Socket.IO to it.
// This approach is compatible with bun --hot: on hot reload, the old
// server remains bound to the port while the new module re-registers
// event handlers on the existing Socket.IO instance via globalThis.

const globalForHot = globalThis as any

let io: SocketIOServer

if (globalForHot.__trackingIo) {
  // bun --hot reload: reuse the existing Socket.IO server
  io = globalForHot.__trackingIo
  console.log('♻️  Reusing existing Socket.IO server (hot reload)')
} else {
  // First load: create HTTP server + Socket.IO
  const httpServer = createServer()

  // Add health check endpoint to the HTTP server BEFORE attaching Socket.IO
  // This ensures our handler runs first for HTTP requests
  httpServer.on('request', async (req: IncomingMessage, res: ServerResponse) => {
    if (req.url === '/health' || req.url === '/') {
      const adapterStatus = getAdapterStatus()
      const redisPingOk = adapterStatus.active ? await pingRedis().catch(() => false) : null
      const activeBookings = await getActiveLocationBookings().catch(() => [])

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        status: 'ok',
        service: 'tracking-service',
        version: '2.1.0',
        port: config.PORT,
        database: isDbAvailable() ? 'connected' : 'unavailable',
        redisAdapter: {
          active: adapterStatus.active,
          connected: adapterStatus.connected,
          pubClientReady: adapterStatus.pubClientReady,
          subClientReady: adapterStatus.subClientReady,
          locationStore: adapterStatus.locationStoreActive ? 'active' : 'inactive',
          redisPing: redisPingOk === true ? 'pong' : redisPingOk === false ? 'failed' : 'n/a',
          reconnectAttempts: adapterStatus.reconnectAttempts,
          lastError: adapterStatus.lastError,
        },
        connectedSockets: io.sockets.sockets.size,
        activeBookingRooms: countBookingRooms(),
        redisLocationBookings: activeBookings.length,
        timestamp: new Date().toISOString(),
      }))
      return
    }

    // 404 for other paths
    if (!req.url?.startsWith('/socket.io')) {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Not found' }))
    }
  })

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (e.g., mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true)
        if (isOriginAllowed(origin)) return callback(null, true)
        // In production, reject unknown origins; in development, allow all
        if (process.env.NODE_ENV === 'production') {
          return callback(new Error('Origin not allowed'), false)
        }
        callback(null, true)
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Default Socket.IO path — Caddy routes all traffic via XTransformPort=3003
    // Frontend connects using: io("/?XTransformPort=3003")
    path: '/socket.io',
    // Allow upgrading from HTTP long-polling to WebSocket
    transports: ['websocket', 'polling'],
    // Ping/pong for connection health
    pingInterval: 25000,
    pingTimeout: 20000,
  })

  // ─── Redis Socket.IO Adapter (optional — for horizontal scaling) ─────
  // If REDIS_URL is set, use Redis adapter for multi-instance sync.
  // This enables horizontal scaling — multiple tracking service instances
  // can broadcast events to each other through Redis pub/sub.
  // Also enables Redis-backed live location storage for cross-instance
  // location retrieval when clients join a booking on a different instance.
  setupRedisAdapter(io).then((success) => {
    if (success) {
      console.log('📡 Redis adapter initialized — horizontal scaling enabled')
    } else {
      console.log('📡 Running in single-instance mode (no Redis adapter)')
    }
  }).catch((err) => {
    console.warn('📡 Redis adapter setup failed:', (err as Error).message)
  })

  // Bind to port
  httpServer.listen(config.PORT, () => {
    console.log(`🚀 Tracking service started on port ${config.PORT}`)
  })

  httpServer.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️  Port ${config.PORT} already in use — another instance may be running`)
      return
    }
    console.error('🔴 HTTP server error:', err.message)
  })

  // Store for hot reload reuse
  globalForHot.__trackingIo = io
  globalForHot.__trackingHttp = httpServer
  console.log(`🚀 Tracking service initializing on port ${config.PORT}`)
}

// ─── Socket Middleware: JWT Authentication ──────────────────────────────
io.use(async (socket, next) => {
  try {
    // Token can come from handshake auth or query param
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.auth?.Authorization?.replace('Bearer ', '') ||
      socket.handshake.query?.token

    if (!token) {
      console.warn('🔐 Socket connection rejected — no token provided')
      return next(new Error('Authentication required'))
    }

    const payload = await verifySocketToken(String(token))
    if (!payload) {
      console.warn('🔐 Socket connection rejected — invalid token')
      return next(new Error('Invalid or expired token'))
    }

    // Store auth data in socket for later use
    socket.data = {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      roleId: payload.roleId,
    }

    console.log(`🔐 Socket authenticated: ${payload.email} (${payload.role})`)
    next()
  } catch (err: any) {
    console.error('🔐 Socket auth error:', err.message)
    next(new Error('Authentication failed'))
  }
})

// ─── Register Event Handlers ───────────────────────────────────────────
io.on('connection', (socket) => {
  const { sub: userId, role, roleId } = socket.data as AuthPayload
  console.log(`🔌 Client connected: ${userId} (${role}) [socket=${socket.id}]`)

  // Auto-join user's personal room for push notifications
  socket.join(`user:${userId}`)

  // Admin users auto-join admin notification room
  if (roleId === 3 || role === 'ADMIN') {
    socket.join('admin:notifications')
  }

  // ─── join-booking ──────────────────────────────────────────────────
  // Client or provider joins a booking room to receive real-time updates
  socket.on('join-booking', async (data: { bookingId: string }) => {
    try {
      const { bookingId } = data
      if (!bookingId) {
        socket.emit('error', { message: 'bookingId is required' })
        return
      }

      // Verify user is part of this booking
      const hasAccess = await verifyBookingAccess(userId, bookingId)
      if (!hasAccess) {
        socket.emit('error', { message: 'Access denied — you are not part of this booking' })
        return
      }

      const roomName = `booking:${bookingId}`
      socket.join(roomName)
      console.log(`📍 User ${userId} joined booking room: ${roomName}`)

      // Send current location if available (in-memory fallback)
      const currentLocation = liveLocations.get(bookingId)
      if (currentLocation) {
        socket.emit('location-update', {
          bookingId,
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          accuracy: currentLocation.accuracy,
          heading: currentLocation.heading,
          speed: currentLocation.speed,
          timestamp: currentLocation.updatedAt,
        })
      }

      socket.emit('booking-notification', {
        type: 'JOINED_BOOKING',
        bookingId,
        message: 'You have joined the booking tracking room',
      })
    } catch (err: any) {
      console.error('❌ join-booking error:', err.message)
      socket.emit('error', { message: 'Failed to join booking room' })
    }
  })

  // ─── leave-booking ─────────────────────────────────────────────────
  socket.on('leave-booking', (data: { bookingId: string }) => {
    const { bookingId } = data
    if (!bookingId) return

    const roomName = `booking:${bookingId}`
    socket.leave(roomName)
    console.log(`📍 User ${userId} left booking room: ${roomName}`)
  })

  // ─── update-location ───────────────────────────────────────────────
  // Provider/technician sends GPS coordinates
  socket.on('update-location', async (data: {
    bookingId: string
    lat: number
    lng: number
    accuracy?: number
    heading?: number
    speed?: number
  }) => {
    try {
      const { bookingId, lat, lng, accuracy, heading, speed } = data

      // Validate required fields
      if (!bookingId || lat === undefined || lng === undefined) {
        socket.emit('error', { message: 'bookingId, lat, and lng are required' })
        return
      }

      // Validate coordinate ranges
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        socket.emit('error', { message: 'Invalid latitude/longitude values' })
        return
      }

      // Only providers (roleId=2) or technicians (roleId=4) can update location
      if (roleId !== 2 && roleId !== 4 && roleId !== 3) {
        socket.emit('error', { message: 'Only providers and technicians can update location' })
        return
      }

      const now = Date.now()
      const locationPayload = {
        bookingId,
        providerId: userId,
        lat,
        lng,
        accuracy: accuracy ?? null,
        heading: heading ?? null,
        speed: speed ?? null,
        timestamp: now,
      }

      // Broadcast to booking room
      io.to(`booking:${bookingId}`).emit('location-update', locationPayload)

      // Also push to the client's personal room (in case they aren't in the booking room)
      io.to(`booking:${bookingId}`).emit('eta-update', {
        bookingId,
        timestamp: now,
        // ETA calculation would require a routing service; for now just pass location
        location: { lat, lng },
      })

      // Store in-memory (for fast retrieval)
      liveLocations.set(bookingId, {
        lat, lng, accuracy, heading, speed, updatedAt: now,
      })

      // Persist to database (non-blocking)
      persistLocationUpdate(userId, lat, lng, accuracy, heading, speed).catch(() => {})
      persistBookingTracking(bookingId, userId, lat, lng, accuracy, heading, speed).catch(() => {})

    } catch (err: any) {
      console.error('❌ update-location error:', err.message)
      socket.emit('error', { message: 'Failed to update location' })
    }
  })

  // ─── booking-status-change ─────────────────────────────────────────
  // Provider/technician updates booking status (ON_THE_WAY, ARRIVED, etc.)
  socket.on('booking-status-change', async (data: {
    bookingId: string
    status: string
    note?: string
  }) => {
    try {
      const { bookingId, status, note } = data

      if (!bookingId || !status) {
        socket.emit('error', { message: 'bookingId and status are required' })
        return
      }

      // Validate status values
      const validStatuses = [
        'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS',
        'COMPLETED', 'CANCELLED', 'REJECTED', 'PENDING',
      ]
      if (!validStatuses.includes(status)) {
        socket.emit('error', { message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` })
        return
      }

      // Only providers (2), technicians (4), and admins (3) can change status
      if (roleId !== 2 && roleId !== 4 && roleId !== 3) {
        socket.emit('error', { message: 'Not authorized to change booking status' })
        return
      }

      const statusPayload = {
        bookingId,
        status,
        changedBy: userId,
        changedByRole: role,
        note: note ?? null,
        timestamp: Date.now(),
      }

      // Broadcast to booking room
      io.to(`booking:${bookingId}`).emit('booking-status-update', statusPayload)

      // Push notification to client's personal room
      io.to(`booking:${bookingId}`).emit('booking-notification', {
        type: 'STATUS_CHANGE',
        bookingId,
        status,
        message: `Booking status changed to ${status}`,
        changedBy: userId,
        timestamp: Date.now(),
      })

      // Notify admins
      io.to('admin:notifications').emit('booking-notification', {
        type: 'STATUS_CHANGE',
        bookingId,
        status,
        changedBy: userId,
        timestamp: Date.now(),
      })

      // Persist to database (non-blocking)
      persistStatusChange(bookingId, status, userId, note).catch(() => {})

      console.log(`📋 Booking ${bookingId} status → ${status} (by ${userId})`)

    } catch (err: any) {
      console.error('❌ booking-status-change error:', err.message)
      socket.emit('error', { message: 'Failed to update booking status' })
    }
  })

  // ─── Disconnect ────────────────────────────────────────────────────
  socket.on('disconnect', (reason) => {
    console.log(`🔌 Client disconnected: ${userId} (${role}) [reason=${reason}]`)
  })
})

// ─── Utility ───────────────────────────────────────────────────────────
function countBookingRooms(): number {
  let count = 0
  for (const room of io.sockets.adapter.rooms.keys()) {
    if (room.startsWith('booking:')) count++
  }
  return count
}

// ─── Graceful Shutdown ─────────────────────────────────────────────────
async function shutdown(signal: string) {
  console.log(`\n🛑 ${signal} received — shutting down tracking service gracefully`)
  io.disconnectSockets(true)
  await closeRedisAdapter()
  await closePool()
  io.close()
  console.log('👋 Tracking service shut down')
  process.exit(0)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

// ─── Process Error Protection ───────────────────────────────────────────
process.on('uncaughtException', (err) => {
  // Ignore port-in-use errors from bun --hot reload attempts
  if (err.message?.includes('EADDRINUSE') || err.message?.includes('Is port')) {
    console.warn('⚠️  Port conflict detected (likely from hot reload) — server still running on previous load')
    return
  }
  console.error('🔴 Uncaught Exception (non-fatal):', err.message)
})

process.on('unhandledRejection', (reason) => {
  console.error('🔴 Unhandled Rejection (non-fatal):', String(reason))
})

console.log(`✅ Tracking service ready — WebSocket on port ${config.PORT}`)
console.log(`   Frontend connects via: io("/?XTransformPort=${config.PORT}")`)
console.log(`   Health check: http://localhost:${config.PORT}/health`)
