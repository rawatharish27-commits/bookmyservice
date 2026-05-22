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
 *
 * Modules:
 *   - config.ts    — Configuration constants (PORT, JWT_SECRET, REDIS_URL, etc.)
 *   - database.ts  — PostgreSQL pool, table creation, DB helpers
 *   - auth.ts      — JWT verification for socket connections
 *   - handlers.ts  — Socket event handlers + in-memory liveLocations
 *   - index.ts     — Entry point (this file) — assembles all modules
 */

import { Server as SocketIOServer } from 'socket.io'
import { createServer, IncomingMessage, ServerResponse } from 'http'

// Module imports
import * as config from './config'
import { isDbAvailable, closePool } from './database'
import { verifySocketToken } from './auth'
import { registerHandlers } from './handlers'

// Redis adapter (optional — for horizontal scaling)
let redisAdapterActive = false

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
  httpServer.on('request', (req: IncomingMessage, res: ServerResponse) => {
    if (req.url === '/health' || req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        status: 'ok',
        service: 'tracking-service',
        version: '2.0.0',
        port: config.PORT,
        database: isDbAvailable() ? 'connected' : 'unavailable',
        redisAdapter: redisAdapterActive ? 'connected' : 'not-configured',
        connectedSockets: 0, // will be updated by the io instance
        activeBookingRooms: 0,
        timestamp: new Date().toISOString(),
      }))
      return
    }
  })

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (e.g., mobile apps, curl)
        if (!origin) return callback(null, true)
        if (config.isOriginAllowed(origin)) return callback(null, true)
        // In development, be permissive
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

  // ─── Redis Socket.IO Adapter (optional) ──────────────────────────────
  // If REDIS_URL is set, use Redis adapter for multi-instance sync.
  // This enables horizontal scaling — multiple tracking service instances
  // can broadcast events to each other through Redis pub/sub.
  if (config.REDIS_URL) {
    ;(async () => {
      try {
        const { createAdapter } = await import('@socket.io/redis-adapter')
        const { createClient } = await import('redis')

        const pubClient = createClient({ url: config.REDIS_URL })
        const subClient = pubClient.duplicate()
        await Promise.all([pubClient.connect(), subClient.connect()])
        io.adapter(createAdapter(pubClient, subClient))
        redisAdapterActive = true
        console.log('📡 Socket.IO Redis adapter connected')
      } catch (e) {
        console.warn('⚠️  Redis adapter failed, using in-memory only:', (e as Error).message)
      }
    })()
  }

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
  registerHandlers(io, socket)
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
