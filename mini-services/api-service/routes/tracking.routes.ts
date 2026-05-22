// ─── routes/tracking.routes.ts ──────────────────────────────────────────
// REST fallback for real-time tracking data
// ─────────────────────────────────────────────────────────────────────

import { Hono } from 'hono'
import { pool, getAuthUser } from '../lib/shared'

const router = new Hono()

// GET /api/tracking/:bookingId — Get current tracking data for a booking
router.get('/api/tracking/:bookingId', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const bookingId = c.req.param('bookingId')

    // Verify user is part of this booking (client, provider, or technician) or admin
    const bookingResult = await pool.query(
      'SELECT "clientId", "providerId", "technicianId", status, "serviceLatitude", "serviceLongitude", "serviceAddress" FROM "Booking" WHERE id = $1',
      [bookingId]
    ).catch(() => ({ rows: [] }))

    if (bookingResult.rows.length === 0) {
      return c.json({ error: 'Booking not found' }, 404)
    }

    const booking = bookingResult.rows[0]
    const isParticipant = booking.clientId === user.id || booking.providerId === user.id || booking.technicianId === user.id
    const isAdmin = user.roleId === 3 || user.roleId === 7 || user.role === 'ADMIN' || user.role === 'SUB_ADMIN'

    if (!isParticipant && !isAdmin) {
      return c.json({ error: 'Access denied — you are not part of this booking' }, 403)
    }

    // Get latest provider/technician location
    let currentLocation: any = null
    if (booking.providerId) {
      const locResult = await pool.query(
        'SELECT latitude, longitude, accuracy, heading, speed, "updatedAt" FROM "LiveTechnicianLocation" WHERE "userId" = $1',
        [booking.providerId]
      ).catch(() => ({ rows: [] }))
      if (locResult.rows.length > 0) {
        currentLocation = {
          lat: locResult.rows[0].latitude,
          lng: locResult.rows[0].longitude,
          accuracy: locResult.rows[0].accuracy,
          heading: locResult.rows[0].heading,
          speed: locResult.rows[0].speed,
          updatedAt: locResult.rows[0].updatedAt,
        }
      }
    }

    // Get latest timeline events
    const timelineResult = await pool.query(
      'SELECT status, "changedBy", note, "createdAt" FROM "BookingTimeline" WHERE "bookingId" = $1 ORDER BY "createdAt" DESC LIMIT 20',
      [bookingId]
    ).catch(() => ({ rows: [] }))

    // Get most recent tracking point
    const latestTrackingResult = await pool.query(
      'SELECT latitude, longitude, accuracy, heading, speed, "createdAt" FROM "BookingTracking" WHERE "bookingId" = $1 ORDER BY "createdAt" DESC LIMIT 1',
      [bookingId]
    ).catch(() => ({ rows: [] }))

    const latestTracking = latestTrackingResult.rows.length > 0 ? {
      lat: latestTrackingResult.rows[0].latitude,
      lng: latestTrackingResult.rows[0].longitude,
      accuracy: latestTrackingResult.rows[0].accuracy,
      heading: latestTrackingResult.rows[0].heading,
      speed: latestTrackingResult.rows[0].speed,
      createdAt: latestTrackingResult.rows[0].createdAt,
    } : null

    return c.json({
      bookingId,
      bookingStatus: booking.status,
      serviceLocation: {
        lat: booking.serviceLatitude,
        lng: booking.serviceLongitude,
        address: booking.serviceAddress,
      },
      providerLocation: currentLocation || latestTracking,
      timeline: timelineResult.rows,
      trackingServiceUrl: `io("/?XTransformPort=3003")`,
    })
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

    // Verify user is part of this booking or admin
    const bookingResult = await pool.query(
      'SELECT "clientId", "providerId", "technicianId" FROM "Booking" WHERE id = $1',
      [bookingId]
    ).catch(() => ({ rows: [] }))

    if (bookingResult.rows.length === 0) {
      return c.json({ error: 'Booking not found' }, 404)
    }

    const booking = bookingResult.rows[0]
    const isParticipant = booking.clientId === user.id || booking.providerId === user.id || booking.technicianId === user.id
    const isAdmin = user.roleId === 3 || user.roleId === 7 || user.role === 'ADMIN' || user.role === 'SUB_ADMIN'

    if (!isParticipant && !isAdmin) {
      return c.json({ error: 'Access denied — you are not part of this booking' }, 403)
    }

    // Get location history
    const historyResult = await pool.query(
      'SELECT latitude, longitude, accuracy, heading, speed, "providerId", "createdAt" FROM "BookingTracking" WHERE "bookingId" = $1 ORDER BY "createdAt" ASC LIMIT $2 OFFSET $3',
      [bookingId, limit, offset]
    ).catch(() => ({ rows: [] }))

    // Get total count
    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM "BookingTracking" WHERE "bookingId" = $1',
      [bookingId]
    ).catch(() => ({ rows: [{ total: 0 }] }))

    const locations = historyResult.rows.map((r: any) => ({
      lat: r.latitude,
      lng: r.longitude,
      accuracy: r.accuracy,
      heading: r.heading,
      speed: r.speed,
      providerId: r.providerId,
      timestamp: r.createdAt,
    }))

    return c.json({
      bookingId,
      locations,
      total: parseInt(countResult.rows[0]?.total || '0'),
      limit,
      offset,
    })
  } catch (e: any) {
    console.error('Tracking history error:', e)
    if (e?.code === 'ERR_JWT_EXPIRED' || e?.code === 'ERR_JWS_INVALID' || e?.code === 'ERR_JWT_INVALID') {
      return c.json({ error: 'Token expired or invalid', code: 'TOKEN_EXPIRED' }, 401)
    }
    return c.json({ error: 'Failed to fetch tracking history' }, 500)
  }
})

export const trackingRoutes = router
