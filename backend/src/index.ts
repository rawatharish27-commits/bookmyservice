import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

// Import API routes
import authRoutes from './api/auth/index.ts'
import bookingRoutes from './api/bookings/index.ts'
import technicianRoutes from './api/technicians/index.ts'
import categoryRoutes from './api/categories/index.ts'
import subcategoryRoutes from './api/subcategories/index.ts'
import serviceRoutes from './api/services/index.ts'
import walletRoutes from './api/wallet/index.ts'
import areaRoutes from './api/areas/index.ts'
import franchiseRoutes from './api/franchise/index.ts'
import userRoutes from './api/users/index.ts'
import notificationRoutes from './api/notifications/index.ts'
import reviewRoutes from './api/reviews/index.ts'
import statsRoutes from './api/stats/index.ts'
import contactRoutes from './api/contact/index.ts'

const app = new Hono()

// Middleware
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
}))

app.use('*', logger())

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', version: '0.2.0', timestamp: new Date().toISOString() })
})

// API routes
app.route('/api/auth', authRoutes)
app.route('/api/bookings', bookingRoutes)
app.route('/api/technicians', technicianRoutes)
app.route('/api/categories', categoryRoutes)
app.route('/api/subcategories', subcategoryRoutes)
app.route('/api/services', serviceRoutes)
app.route('/api/wallet', walletRoutes)
app.route('/api/areas', areaRoutes)
app.route('/api/franchise', franchiseRoutes)
app.route('/api/users', userRoutes)
app.route('/api/notifications', notificationRoutes)
app.route('/api/reviews', reviewRoutes)
app.route('/api/stats', statsRoutes)
app.route('/api/contact', contactRoutes)

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found', message: 'The requested resource was not found' }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error(`${err}`)
  return c.json({ error: 'Internal Server Error', message: 'Something went wrong' }, 500)
})

const port = process.env.PORT || 3000

console.log(`🚀 Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port: Number(port),
})