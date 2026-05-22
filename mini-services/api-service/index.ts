/**
 * BookMyService API — Main Entry Point
 *
 * This file is the SLIM ASSEMBLY POINT for the entire API.
 * All business logic lives in:
 *   - routes/       → Route handlers organized by domain
 *   - lib/          → Shared utilities, integrations, helpers
 *   - middleware/    → CORS, rate limiting, security, error handling
 *   - bootstrap.ts  → Startup, DB init, queue init, graceful shutdown
 *   - validators/   → Zod schemas for input validation
 *   - workers/      → Background job processors
 *   - queues/       → BullMQ queue management
 *
 * Architecture: Controller-Route pattern
 *   index.ts (this file) → mounts route modules onto the Hono app
 *   Each route file exports a Hono router with full paths
 */

import { serve } from '@hono/node-server'
import { Hono } from 'hono'

// ─── Bootstrap: startup, DB init, queues, graceful shutdown ──────────────
import { bootstrap } from './bootstrap'

// ─── Middleware: CORS, security, rate limits, error handler ──────────────
import { applyMiddleware } from './middleware'

// ─── Route Modules ───────────────────────────────────────────────────────
import { healthRoutes } from './routes/health.routes'
import { legalRoutes } from './routes/legal.routes'
import { authRoutes } from './routes/auth.routes'
import { serviceRoutes } from './routes/service.routes'
import { bookingRoutes } from './routes/booking.routes'
import { adminRoutes } from './routes/admin.routes'
import { hyperlocalRoutes } from './routes/hyperlocal.routes'
import { referralRoutes } from './routes/referral.routes'
import { franchiseRoutes } from './routes/franchise.routes'
import { technicianRoutes } from './routes/technician.routes'
import { uploadRoutes } from './routes/upload.routes'
import { deviceRoutes } from './routes/device.routes'
import { paymentRoutes } from './routes/payment.routes'
import { recommendationRoutes } from './routes/recommendation.routes'
import { trackingRoutes } from './routes/tracking.routes'

// ─── Create Hono App ────────────────────────────────────────────────────
const app = new Hono()

// ─── Apply Global Middleware (CORS, security, rate limits, error handler) ──
applyMiddleware(app)

// ─── Mount Route Modules ────────────────────────────────────────────────
// Each route file uses full paths (e.g., /api/auth/login) so we mount at /
app.route('/', healthRoutes)
app.route('/', legalRoutes)
app.route('/', authRoutes)
app.route('/', serviceRoutes)
app.route('/', bookingRoutes)
app.route('/', adminRoutes)
app.route('/', hyperlocalRoutes)
app.route('/', referralRoutes)
app.route('/', franchiseRoutes)
app.route('/', technicianRoutes)
app.route('/', uploadRoutes)
app.route('/', deviceRoutes)
app.route('/', paymentRoutes)
app.route('/', recommendationRoutes)
app.route('/', trackingRoutes)

// ─── Catch-all 404 for unmatched API routes ─────────────────────────────
app.all('/api/*', (c) => {
  return c.json({ error: 'Endpoint not found', path: c.req.path }, 404)
})

// ─── Bootstrap & Start Server ───────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '3001', 10)

;(async () => {
  // Run startup: Sentry, DB, queues, backups, graceful shutdown handlers
  await bootstrap()

  serve({ fetch: app.fetch, port: PORT }, (info) => {
    console.log(`🚀 BookMyService API running on http://localhost:${info.port}`)
    console.log(`   Health: http://localhost:${info.port}/api/health`)
    console.log(`   Routes: 15 domain modules mounted`)
  })
})()

export default app
