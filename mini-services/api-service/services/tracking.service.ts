// ─── services/tracking.service.ts ───────────────────────────────────────
// Pure business logic extracted from routes/tracking.routes.ts
// ─────────────────────────────────────────────────────────────────────

import { pool } from '../lib/shared'

// ─── Get Booking Tracking ────────────────────────────────────────────

export async function getBookingTracking(userId: string, userRoleId: number, userRole: string, bookingId: string): Promise<{
  success: true; data: {
    bookingId: string; bookingStatus: string; serviceLocation: any; providerLocation: any; timeline: any[]; trackingServiceUrl: string
  }
} | { success: false; error: string; status: number }> {
  // Verify user is part of this booking (client, provider, or technician) or admin
  const bookingResult = await pool.query(
    'SELECT "clientId", "providerId", "technicianId", status, "serviceLatitude", "serviceLongitude", "serviceAddress" FROM "Booking" WHERE id = $1',
    [bookingId]
  ).catch(() => ({ rows: [] }))

  if (bookingResult.rows.length === 0) {
    return { success: false, error: 'Booking not found', status: 404 }
  }

  const booking = bookingResult.rows[0]
  const isParticipant = booking.clientId === userId || booking.providerId === userId || booking.technicianId === userId
  const isAdmin = userRoleId === 3 || userRoleId === 7 || userRole === 'ADMIN' || userRole === 'SUB_ADMIN'

  if (!isParticipant && !isAdmin) {
    return { success: false, error: 'Access denied — you are not part of this booking', status: 403 }
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

  return {
    success: true,
    data: {
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
    },
  }
}

// ─── Get Booking Tracking History ────────────────────────────────────

export async function getBookingTrackingHistory(userId: string, userRoleId: number, userRole: string, bookingId: string, limit: number, offset: number): Promise<{
  success: true; data: {
    bookingId: string; locations: any[]; total: number; limit: number; offset: number
  }
} | { success: false; error: string; status: number }> {
  // Verify user is part of this booking or admin
  const bookingResult = await pool.query(
    'SELECT "clientId", "providerId", "technicianId" FROM "Booking" WHERE id = $1',
    [bookingId]
  ).catch(() => ({ rows: [] }))

  if (bookingResult.rows.length === 0) {
    return { success: false, error: 'Booking not found', status: 404 }
  }

  const booking = bookingResult.rows[0]
  const isParticipant = booking.clientId === userId || booking.providerId === userId || booking.technicianId === userId
  const isAdmin = userRoleId === 3 || userRoleId === 7 || userRole === 'ADMIN' || userRole === 'SUB_ADMIN'

  if (!isParticipant && !isAdmin) {
    return { success: false, error: 'Access denied — you are not part of this booking', status: 403 }
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

  return {
    success: true,
    data: {
      bookingId,
      locations,
      total: parseInt(countResult.rows[0]?.total || '0'),
      limit,
      offset,
    },
  }
}
