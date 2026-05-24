// ─── routes/tracking.routes.ts ──────────────────────────────────────────
// REST fallback for real-time tracking data
// Refactored: thin handlers that delegate to tracking.service
// ─────────────────────────────────────────────────────────────────────

import { Hono } from 'hono'
import { getAuthUser } from '../lib/shared'
import * as trackingService from '../services/tracking.service'

const router = new Hono()

// GET /api/tracking/:bookingId — Get current tracking data for a booking
router.get('/api/tracking/:bookingId', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const bookingId = c.req.param('bookingId')

    const result = await trackingService.getBookingTracking(user.id, user.roleId, user.role, bookingId)
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json(result.data)
  } catch (e: any) {
    console.error('Tracking fetch error:', e)
    if (e?.code === 'ERR_JWT_EXPIRED' || e?.code === 'ERR_JWS_INVALID' || e?.code === 'ERR_JWT_INVALID') {
      return c.json({ error: 'Token expired or invalid', code: 'TOKEN_EXPIRED' }, 401)
    }
    return c.json({ error: 'Failed to fetch tracking data' }, 500)
  }
})

// GET /api/tracking/:bookingId/history — Get location history for a booking
router.get('/api/tracking/:bookingId/history', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const bookingId = c.req.param('bookingId')
    const limit = Math.min(Math.max(parseInt(c.req.query('limit') || '100'), 1), 1000)
    const offset = parseInt(c.req.query('offset') || '0')

    const result = await trackingService.getBookingTrackingHistory(user.id, user.roleId, user.role, bookingId, limit, offset)
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json(result.data)
  } catch (e: any) {
    console.error('Tracking history error:', e)
    if (e?.code === 'ERR_JWT_EXPIRED' || e?.code === 'ERR_JWS_INVALID' || e?.code === 'ERR_JWT_INVALID') {
      return c.json({ error: 'Token expired or invalid', code: 'TOKEN_EXPIRED' }, 401)
    }
    return c.json({ error: 'Failed to fetch tracking history' }, 500)
  }
})

export const trackingRoutes = router
