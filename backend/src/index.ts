import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

// Import API routes
import authRoutes from './api/auth/index.ts'
import bookingRoutes from './api/bookings/index.ts'
import categoryRoutes from './api/categories/index.ts'
import serviceRoutes from './api/services/index.ts'
import userRoutes from './api/users/index.ts'
import reviewRoutes from './api/reviews/index.ts'

const app = new Hono()

// Middleware
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
}))

app.use('*', logger())

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', version: '0.2.0', timestamp: new Date().toISOString() })
})

// API routes
app.route('/api/auth', authRoutes)
app.route('/api/bookings', bookingRoutes)
app.route('/api/categories', categoryRoutes)
app.route('/api/services', serviceRoutes)
app.route('/api/users', userRoutes)
app.route('/api/reviews', reviewRoutes)

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found', message: 'The requested resource was not found' }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error(`${err}`)
  return c.json({ error: 'Internal Server Error', message: 'Something went wrong' }, 500)
})

const port = process.env.PORT || 3001

console.log(`🚀 Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port: Number(port),
})