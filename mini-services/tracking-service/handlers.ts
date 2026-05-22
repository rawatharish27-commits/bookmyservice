/**
 * ─── Tracking Service — Socket Event Handlers ─────────────────────────
 *
 * All Socket.IO event handlers for the tracking service.
 * Uses database.ts for persistence and the shared liveLocations Map.
 */

import { Server, Socket } from 'socket.io'
import {
  persistLocationUpdate,
  persistBookingTracking,
  persistStatusChange,
  verifyBookingAccess,
} from './database'
import { AuthPayload } from './auth'

// ─── In-Memory State (for when DB is unavailable, or fast retrieval) ──
export const liveLocations = new Map<string, {
  lat: number
  lng: number
  accuracy?: number
  heading?: number
  speed?: number
  updatedAt: number
}>()

/**
 * Register all Socket.IO event handlers on a connected socket.
 *
 * @param io  - The Socket.IO server instance (for broadcasting)
 * @param socket - The connected socket
 */
export function registerHandlers(io: Server, socket: Socket): void {
  const { userId, role, roleId } = socket.data as AuthPayload
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
}
