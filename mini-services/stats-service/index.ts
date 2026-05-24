import { createServer } from 'http'
import { Server } from 'socket.io'
import { Database } from 'bun:sqlite'

// ─── Database Setup ───────────────────────────────────────────────────────────
const DB_PATH = '/home/z/my-project/db/custom.db'
let db: Database

try {
  db = new Database(DB_PATH, { readonly: true })
  console.log(`[stats-service] Connected to SQLite database at ${DB_PATH}`)
} catch (err) {
  console.error(`[stats-service] Failed to connect to database:`, err)
  process.exit(1)
}

// ─── Prepared Statements ──────────────────────────────────────────────────────
const stmtTotalClients = db.prepare(`
  SELECT COUNT(*) as count FROM User WHERE roleId = (SELECT id FROM Role WHERE name = 'CLIENT')
`)

const stmtTotalProviders = db.prepare(`
  SELECT COUNT(*) as count FROM User WHERE roleId = (SELECT id FROM Role WHERE name = 'PROVIDER')
`)

const stmtTotalServices = db.prepare(`
  SELECT COUNT(*) as count FROM Service WHERE isActive = 1 AND isApproved = 1
`)

const stmtTotalBookings = db.prepare(`
  SELECT COUNT(*) as count FROM Booking
`)

const stmtTotalVisitors = db.prepare(`
  SELECT COUNT(*) as count FROM VisitorSession
`)

// ─── Stats Interface ──────────────────────────────────────────────────────────
interface PlatformStats {
  activeVisitors: number
  totalVisitors: number
  totalUsers: number
  totalProviders: number
  totalServices: number
  totalBookings: number
  timestamp: string
}

// ─── Helper: Fetch stats from DB ──────────────────────────────────────────────
function fetchStats(): Omit<PlatformStats, 'activeVisitors' | 'timestamp'> {
  try {
    const totalUsers = (stmtTotalClients.get() as { count: number } | null)?.count ?? 0
    const totalProviders = (stmtTotalProviders.get() as { count: number } | null)?.count ?? 0
    const totalServices = (stmtTotalServices.get() as { count: number } | null)?.count ?? 0
    const totalBookings = (stmtTotalBookings.get() as { count: number } | null)?.count ?? 0
    const totalVisitors = (stmtTotalVisitors.get() as { count: number } | null)?.count ?? 0

    return { totalVisitors, totalUsers, totalProviders, totalServices, totalBookings }
  } catch (err) {
    console.error('[stats-service] Error fetching stats from DB:', err)
    return {
      totalVisitors: 0,
      totalUsers: 0,
      totalProviders: 0,
      totalServices: 0,
      totalBookings: 0,
    }
  }
}

// ─── Socket.io Server Setup ───────────────────────────────────────────────────
const httpServer = createServer()
const io = new Server(httpServer, {
  // DO NOT change the path — Caddy uses it for routing
  path: '/',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// ─── Connection Handling ──────────────────────────────────────────────────────
io.on('connection', (socket) => {
  const activeVisitors = io.sockets.sockets.size
  console.log(`[stats-service] Client connected: ${socket.id} (active: ${activeVisitors})`)

  // Broadcast visitor join event
  io.emit('visitor:join', { activeVisitors })

  // Send immediate stats to the newly connected client
  const dbStats = fetchStats()
  const initialStats: PlatformStats = {
    ...dbStats,
    activeVisitors,
    timestamp: new Date().toISOString(),
  }
  socket.emit('stats:update', initialStats)

  socket.on('disconnect', (reason) => {
    const updatedCount = io.sockets.sockets.size
    console.log(`[stats-service] Client disconnected: ${socket.id} (reason: ${reason}, active: ${updatedCount})`)

    // Broadcast visitor leave event
    io.emit('visitor:leave', { activeVisitors: updatedCount })
  })

  socket.on('error', (error) => {
    console.error(`[stats-service] Socket error (${socket.id}):`, error)
  })
})

// ─── Periodic Stats Broadcast (every 5 seconds) ──────────────────────────────
const STATS_INTERVAL_MS = 5000

const statsInterval = setInterval(() => {
  const activeVisitors = io.sockets.sockets.size
  const dbStats = fetchStats()

  const stats: PlatformStats = {
    ...dbStats,
    activeVisitors,
    timestamp: new Date().toISOString(),
  }

  io.emit('stats:update', stats)
}, STATS_INTERVAL_MS)

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = 3003

httpServer.listen(PORT, () => {
  console.log(`[stats-service] WebSocket server running on port ${PORT}`)
  console.log(`[stats-service] Broadcasting stats every ${STATS_INTERVAL_MS / 1000}s`)
})

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
function shutdown(signal: string) {
  console.log(`[stats-service] Received ${signal}, shutting down...`)

  clearInterval(statsInterval)

  io.disconnectSockets(true)

  httpServer.close(() => {
    db.close()
    console.log('[stats-service] Server closed, database connection released')
    process.exit(0)
  })

  // Force exit after 5 seconds if graceful shutdown hangs
  setTimeout(() => {
    console.error('[stats-service] Forced shutdown after timeout')
    process.exit(1)
  }, 5000)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
