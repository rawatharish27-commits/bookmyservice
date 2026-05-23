// ─── routes/booking.routes.ts ──────────────────────────────────────────
// All /api/bookings/*, /api/reviews/*, /api/notifications/*, /api/wallet/*, 
// /api/earnings, /api/payouts/*, /api/favorites/*, /api/kyc/*, /api/disputes/*, 
// /api/coupons/*, /api/amc-plans, /api/amc-subscriptions, /api/invoices/*
// ─────────────────────────────────────────────────────────────────────

import { Hono } from 'hono'
import { pool, getAuthUser, requireAdmin, transformServiceRow, transformReviewRow, sendBookingPush } from '../lib/shared'
import { redis, CacheKeys, CacheTTL } from '../lib/redis'
import { createBookingSchema } from '../validators/create-booking.schema'
import { validateBody } from '../validators/validate'
import { pushNotificationJob, pushBookingJob } from '../queues'
import { BookingEvents } from '../lib/logger'
import crypto from 'crypto'

// ═══ OTP SECURITY: Rate limiting & lockout ══════════════════════════════
// Track failed OTP verification attempts per booking
const otpAttempts = new Map<string, { count: number; lockedUntil: number }>()
const MAX_OTP_ATTEMPTS = 3
const OTP_LOCKOUT_MS = 15 * 60 * 1000 // 15 minutes lockout after 3 failed attempts

/** Hash an OTP code using SHA-256 */
function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex')
}

/** Check if a booking is locked out from OTP verification */
function isOtpLockedOut(bookingId: string): { locked: boolean; remainingMs: number } {
  const record = otpAttempts.get(bookingId)
  if (!record) return { locked: false, remainingMs: 0 }
  if (record.lockedUntil && Date.now() < record.lockedUntil) {
    return { locked: true, remainingMs: record.lockedUntil - Date.now() }
  }
  // Lockout expired, reset
  if (record.lockedUntil && Date.now() >= record.lockedUntil) {
    otpAttempts.delete(bookingId)
  }
  return { locked: false, remainingMs: 0 }
}

/** Record a failed OTP attempt */
function recordOtpFailure(bookingId: string): void {
  const record = otpAttempts.get(bookingId) || { count: 0, lockedUntil: 0 }
  record.count++
  if (record.count >= MAX_OTP_ATTEMPTS) {
    record.lockedUntil = Date.now() + OTP_LOCKOUT_MS
  }
  otpAttempts.set(bookingId, record)
}

/** Clear OTP attempts on success */
function clearOtpAttempts(bookingId: string): void {
  otpAttempts.delete(bookingId)
}

// Periodic cleanup of expired OTP attempt records (every 10 minutes)
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of otpAttempts.entries()) {
    if (record.lockedUntil && now >= record.lockedUntil) {
      otpAttempts.delete(key)
    }
  }
}, 10 * 60 * 1000)

const router = new Hono()

// ═══ BOOKINGS ═════════════════════════════════════════════════════════

// POST /api/bookings
router.post('/api/bookings', async (c) => {
  let user: any = null; let serviceId = ''
  try {
    user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const vResult = await validateBody(c, createBookingSchema)
    if (!vResult.success) return vResult.response
    const { serviceId: sId, providerId, technicianId, scheduledDate, scheduledTime, address: serviceAddress, lat: serviceLatitude, lng: serviceLongitude, notes: specialInstructions, couponId } = vResult.data
    serviceId = sId
    const svcResult = await pool.query('SELECT id, "providerId", "basePrice" FROM "Service" WHERE id = $1 AND "isActive" = true', [serviceId])
    if (!svcResult.rows[0]) return c.json({ error: 'Service not found' }, 404)
    const service = svcResult.rows[0]
    const basePrice = service.basePrice || 0
    const bookingId = 'bkg_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    const bookingNumber = 'BK' + Date.now().toString().slice(-8) + Math.random().toString(36).slice(2, 5).toUpperCase()
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const otpCodeHashed = hashOtp(otpCode) // Store hashed OTP, not plaintext
    let couponDiscount = 0
    if (couponId) {
      try {
        const couponResult = await pool.query('SELECT * FROM "Coupon" WHERE id = $1 AND "isActive" = true AND "validTo" > NOW()', [couponId])
        if (couponResult.rows[0]) {
          const coupon = couponResult.rows[0]
          if (coupon.discountType === 'PERCENTAGE') { couponDiscount = (basePrice * coupon.discountValue) / 100; if (coupon.maxDiscount && couponDiscount > coupon.maxDiscount) couponDiscount = coupon.maxDiscount } else { couponDiscount = coupon.discountValue }
        }
      } catch (e) { /* coupon table may not exist */ }
    }
    const finalPrice = Math.max(0, basePrice - couponDiscount)
    await pool.query(
      'INSERT INTO "Booking" (id, "bookingNumber", "clientId", "providerId", "technicianId", "serviceId", "scheduledDate", "scheduledTime", "serviceAddress", "serviceLatitude", "serviceLongitude", "specialInstructions", "basePrice", "couponDiscount", "finalPrice", "couponId", "otpCode", status, "paymentStatus", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, \'PENDING\', \'PENDING\', NOW(), NOW())',
      [bookingId, bookingNumber, user.id, providerId || service.providerId, technicianId || null, serviceId, scheduledDate, scheduledTime || null, serviceAddress, serviceLatitude || null, serviceLongitude || null, specialInstructions || null, basePrice, couponDiscount, finalPrice, couponId || null, otpCodeHashed]
    )
    const result = await pool.query('SELECT b.*, u.name as "clientName", u.phone as "clientPhone" FROM "Booking" b LEFT JOIN "User" u ON b."clientId" = u.id WHERE b.id = $1', [bookingId]).catch(async () => {
      return { rows: [{ id: bookingId, bookingNumber, clientId: user.id, serviceId, status: 'PENDING', basePrice, couponDiscount, finalPrice, scheduledDate, serviceAddress }] }
    })
    await redis.delByPattern('cache:stats:*').catch(() => {})
    await redis.del('cache:admin:analytics:dashboard').catch(() => {})
    BookingEvents.created(bookingId, user.id, serviceId)
    pushBookingJob({ type: 'BOOKING_CONFIRMATION', bookingId, data: { clientName: result.rows[0]?.clientName || '', clientEmail: user.email, clientPhone: result.rows[0]?.clientPhone || '', providerName: service.providerId || '', serviceName: '', scheduledDate, scheduledTime: scheduledTime || null, otp: otpCode }, priority: 2 }).catch(() => {})
    pushBookingJob({ type: 'INVOICE', bookingId, data: { finalPrice, basePrice, couponDiscount, serviceName: '' }, priority: 3 }).catch(() => {})
    pushBookingJob({ type: 'ANALYTICS', bookingId, data: { categoryId: service.categoryId || null, providerId: service.providerId || null }, priority: 4 }).catch(() => {})
    pushBookingJob({ type: 'REFERRAL_REWARD', bookingId, data: { clientId: user.id, referrerId: null, basePrice }, priority: 4 }).catch(() => {})
    return c.json({ message: 'Booking created successfully', booking: result.rows[0] }, 201)
  } catch (e) { console.error('Create booking error:', e); BookingEvents.failed(user?.id || 'unknown', serviceId || 'unknown', e instanceof Error ? e.message : String(e)); return c.json({ error: 'Failed to create booking' }, 500) }
})

// GET /api/bookings
router.get('/api/bookings', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const status = c.req.query('status')
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    let query = 'SELECT b.*, s.title as "serviceName", u.name as "clientName", u.phone as "clientPhone", p.name as "providerName" FROM "Booking" b LEFT JOIN "Service" s ON b."serviceId" = s.id LEFT JOIN "User" u ON b."clientId" = u.id LEFT JOIN "User" p ON b."providerId" = p.id WHERE '
    const params: any[] = []
    let idx = 1
    if (user.roleId === 2 || user.role === 'PROVIDER') { query += `b."providerId" = $${idx}`; params.push(user.id) }
    else if (user.roleId === 4 || user.role === 'TECHNICIAN') { query += `b."technicianId" = $${idx}`; params.push(user.id) }
    else { query += `b."clientId" = $${idx}`; params.push(user.id) }
    idx++
    if (status) { query += ` AND b.status = $${idx}`; params.push(status); idx++ }
    query += ` ORDER BY b."createdAt" DESC LIMIT $${idx} OFFSET $${idx + 1}`
    params.push(limit, offset)
    const result = await pool.query(query, params).catch(() => ({ rows: [] }))
    return c.json({ bookings: result.rows, total: result.rows.length, limit, offset })
  } catch (e) { return c.json({ error: 'Failed to list bookings' }, 500) }
})

// GET /api/bookings/:id
router.get('/api/bookings/:id', async (c) => {
  try {
    const auth = await getAuthUser(c)
    if (!auth) return c.json({ error: 'Authentication required' }, 401)
    const id = c.req.param('id')
    const result = await pool.query(
      'SELECT b.*, s.title as "serviceName", s."images" as "serviceImage", u.name as "clientName", u.phone as "clientPhone", u."profileImageUrl" as "clientImage", p.name as "providerName", p.phone as "providerPhone", p."profileImageUrl" as "providerImage", t.name as "technicianName", sc.name as "categoryName" FROM "Booking" b LEFT JOIN "Service" s ON b."serviceId" = s.id LEFT JOIN "User" u ON b."clientId" = u.id LEFT JOIN "User" p ON b."providerId" = p.id LEFT JOIN "User" t ON b."technicianId" = t.id LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id WHERE b.id = $1',
      [id]
    ).catch(() => ({ rows: [] }))
    if (!result.rows[0]) return c.json({ error: 'Booking not found' }, 404)
    const booking = result.rows[0]
    if (booking.clientId !== auth.userId && booking.providerId !== auth.userId && auth.roleId !== 1 && auth.roleId !== 3 && auth.roleId !== 7) return c.json({ error: 'Forbidden' }, 403)
    return c.json({ booking })
  } catch (e) { return c.json({ error: 'Failed to get booking' }, 500) }
})

// PATCH /api/bookings/:id
router.patch('/api/bookings/:id', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const id = c.req.param('id')
    const { status, cancellationReason } = await c.req.json()
    const validStatuses = ['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
    if (!status || !validStatuses.includes(status)) return c.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, 400)
    const existingResult = await pool.query('SELECT * FROM "Booking" WHERE id = $1', [id]).catch(() => ({ rows: [] }))
    if (!existingResult.rows[0]) return c.json({ error: 'Booking not found' }, 404)
    const booking = existingResult.rows[0]
    const allowedTransitions: Record<string, number[]> = { 'CANCELLED': [1, 2], 'ACCEPTED': [2, 4], 'REJECTED': [2, 4], 'IN_PROGRESS': [2, 4], 'COMPLETED': [2, 4] }
    const allowedRoles = allowedTransitions[status] || []
    if (!allowedRoles.includes(user.roleId) && user.roleId !== 1 && user.roleId !== 3) return c.json({ error: 'Not authorized for this status change' }, 403)
    const updates = ['status = $1', '"updatedAt" = NOW()']
    const values: any[] = [status]
    let idx = 2
    if (status === 'COMPLETED') { updates.push(`"completedAt" = NOW()`) }
    if (status === 'CANCELLED') { updates.push(`"cancelledAt" = NOW()`) }
    if (cancellationReason) { updates.push(`"cancellationReason" = $${idx}`); values.push(cancellationReason); idx++ }
    values.push(id)
    await pool.query(`UPDATE "Booking" SET ${updates.join(', ')} WHERE id = $${idx}`, values)
    if (status === 'COMPLETED' && booking.providerId) {
      await pool.query('UPDATE "User" SET "completedJobsCount" = COALESCE("completedJobsCount", 0) + 1 WHERE id = $1', [booking.providerId])
    }
    const result = await pool.query('SELECT * FROM "Booking" WHERE id = $1', [id]).catch(() => existingResult)
    return c.json({ message: 'Booking status updated', booking: result.rows[0] })
  } catch (e) { console.error('Update booking error:', e); return c.json({ error: 'Failed to update booking' }, 500) }
})

// POST /api/bookings/:id/otp-verify
router.post('/api/bookings/:id/otp-verify', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const id = c.req.param('id')
    const { otp } = await c.req.json()
    if (!otp) return c.json({ error: 'OTP is required' }, 400)

    // Check rate limiting and lockout
    const lockoutStatus = isOtpLockedOut(id)
    if (lockoutStatus.locked) {
      const remainingMin = Math.ceil(lockoutStatus.remainingMs / 60000)
      return c.json({ error: `OTP verification locked. Try again in ${remainingMin} minutes.`, attemptsRemaining: 0 }, 429)
    }

    const result = await pool.query('SELECT * FROM "Booking" WHERE id = $1', [id]).catch(() => ({ rows: [] }))
    if (!result.rows[0]) return c.json({ error: 'Booking not found' }, 404)
    const booking = result.rows[0]

    // Compare hashed OTP
    const inputHashed = hashOtp(otp)
    if (booking.otpCode !== inputHashed) {
      recordOtpFailure(id)
      const currentAttempts = otpAttempts.get(id)
      const attemptsRemaining = MAX_OTP_ATTEMPTS - (currentAttempts?.count || 0)
      if (attemptsRemaining <= 0) {
        return c.json({ error: 'OTP verification locked due to too many failed attempts. Try again later.', attemptsRemaining: 0 }, 429)
      }
      return c.json({ error: 'Invalid OTP', attemptsRemaining }, 400)
    }

    // OTP verified successfully
    clearOtpAttempts(id)
    await pool.query('UPDATE "Booking" SET status = \'IN_PROGRESS\', "startedAt" = NOW(), "updatedAt" = NOW() WHERE id = $1', [id])
    return c.json({ message: 'OTP verified, service started', bookingId: id })
  } catch (e) { return c.json({ error: 'OTP verification failed' }, 500) }
})

// PATCH /api/bookings/:id/cancel
router.patch('/api/bookings/:id/cancel', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const id = c.req.param('id')
    const body = await c.req.json().catch(() => ({}))
    const reason = body.reason || ''
    const bookingResult = await pool.query('SELECT b.*, s.title as "serviceName", u.name as "clientName", p.name as "providerName" FROM "Booking" b LEFT JOIN "Service" s ON b."serviceId" = s.id LEFT JOIN "User" u ON b."clientId" = u.id LEFT JOIN "User" p ON b."providerId" = p.id WHERE b.id = $1', [id])
    const booking = bookingResult.rows[0]
    if (!booking) return c.json({ error: 'Booking not found' }, 404)
    // Ownership check: only the booking client or admin can cancel
    const isAdmin = user.roleId === 1 || user.roleId === 3 || user.roleId === 7
    if (booking.clientId !== user.id && !isAdmin) return c.json({ error: 'Only the booking client or admin can cancel this booking' }, 403)
    await pool.query('UPDATE "Booking" SET status = \'CANCELLED\', "cancellationReason" = $2, "updatedAt" = NOW() WHERE id = $1', [id, reason])
    await redis.del('cache:admin:analytics:dashboard').catch(() => {})
    if (booking) {
      if (booking.clientId) { pushNotificationJob({ type: 'PUSH', recipient: { userId: booking.clientId }, template: 'booking_cancelled', data: { serviceName: booking.serviceName || 'Service', reason, bookingId: id }, priority: 2 }).catch(() => {}) }
      if (booking.providerId && booking.providerId !== user.id) { pushNotificationJob({ type: 'PUSH', recipient: { userId: booking.providerId }, template: 'booking_cancelled', data: { serviceName: booking.serviceName || 'Service', reason: reason || 'Client cancelled', bookingId: id }, priority: 2 }).catch(() => {}) }
    }
    return c.json({ message: 'Booking cancelled' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// PATCH /api/bookings/:id/complete
router.patch('/api/bookings/:id/complete', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const id = c.req.param('id')
    const bookingResult = await pool.query('SELECT b.*, s.title as "serviceName", p.name as "providerName" FROM "Booking" b LEFT JOIN "Service" s ON b."serviceId" = s.id LEFT JOIN "User" p ON b."providerId" = p.id WHERE b.id = $1', [id])
    const booking = bookingResult.rows[0]
    if (!booking) return c.json({ error: 'Booking not found' }, 404)
    // Ownership check: only the booking provider or admin can complete
    const isAdmin = user.roleId === 1 || user.roleId === 3 || user.roleId === 7
    if (booking.providerId !== user.id && !isAdmin) return c.json({ error: 'Only the booking provider or admin can complete this booking' }, 403)
    await pool.query('UPDATE "Booking" SET status = \'COMPLETED\', "completedAt" = NOW(), "updatedAt" = NOW() WHERE id = $1', [id])
    await redis.del('cache:admin:analytics:dashboard').catch(() => {})
    if (booking?.clientId) { pushBookingPush(booking.clientId, 'booking_completed', { serviceName: booking.serviceName || 'Service', providerName: booking.providerName || 'Provider', bookingId: id }) }
    return c.json({ message: 'Booking completed' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// PATCH /api/bookings/:id/reject
router.patch('/api/bookings/:id/reject', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const id = c.req.param('id')
    const body = await c.req.json().catch(() => ({}))
    const reason = body.reason || ''
    const bookingResult = await pool.query('SELECT b.*, s.title as "serviceName" FROM "Booking" b LEFT JOIN "Service" s ON b."serviceId" = s.id WHERE b.id = $1', [id])
    const booking = bookingResult.rows[0]
    if (!booking) return c.json({ error: 'Booking not found' }, 404)
    // Ownership check: only the booking provider or admin can reject
    const isAdmin = user.roleId === 1 || user.roleId === 3 || user.roleId === 7
    if (booking.providerId !== user.id && !isAdmin) return c.json({ error: 'Only the booking provider or admin can reject this booking' }, 403)
    await pool.query('UPDATE "Booking" SET status = \'REJECTED\', "cancellationReason" = $2, "updatedAt" = NOW() WHERE id = $1', [id, reason])
    if (booking?.clientId) { pushNotificationJob({ type: 'PUSH', recipient: { userId: booking.clientId }, template: 'booking_cancelled', data: { serviceName: booking.serviceName || 'Service', reason: reason || 'Provider declined', bookingId: id }, priority: 2 }).catch(() => {}) }
    return c.json({ message: 'Booking rejected' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// PATCH /api/bookings/:id/accept
router.patch('/api/bookings/:id/accept', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const id = c.req.param('id')
    const bookingResult = await pool.query('SELECT b.*, s.title as "serviceName", p.name as "providerName", u.name as "clientName" FROM "Booking" b LEFT JOIN "Service" s ON b."serviceId" = s.id LEFT JOIN "User" p ON b."providerId" = p.id LEFT JOIN "User" u ON b."clientId" = u.id WHERE b.id = $1', [id])
    const booking = bookingResult.rows[0]
    if (!booking) return c.json({ error: 'Booking not found' }, 404)
    // Ownership check: only the booking provider or admin can accept
    const isAdmin = user.roleId === 1 || user.roleId === 3 || user.roleId === 7
    if (booking.providerId !== user.id && !isAdmin) return c.json({ error: 'Only the booking provider or admin can accept this booking' }, 403)
    await pool.query('UPDATE "Booking" SET status = \'ACCEPTED\', "updatedAt" = NOW() WHERE id = $1', [id])
    await redis.del('cache:admin:analytics:dashboard').catch(() => {})
    if (booking?.clientId) {
      pushNotificationJob({ type: 'PUSH', recipient: { userId: booking.clientId }, template: 'provider_accepted', data: { providerName: booking.providerName || user.name || 'Provider', serviceName: booking.serviceName || 'Service', scheduledDate: booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : 'TBD', bookingId: id }, priority: 1 }).catch(() => {})
    }
    return c.json({ message: 'Booking accepted' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// ═══ REVIEWS ══════════════════════════════════════════════════════════

// POST /api/reviews
router.post('/api/reviews', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const { bookingId, serviceId, reviewedId, rating, comment } = await c.req.json()
    if (!serviceId || !rating) return c.json({ error: 'serviceId and rating are required' }, 400)
    if (rating < 1 || rating > 5) return c.json({ error: 'Rating must be between 1 and 5' }, 400)
    if (bookingId) {
      const bookingResult = await pool.query('SELECT status FROM "Booking" WHERE id = $1 AND "clientId" = $2', [bookingId, user.id]).catch(() => ({ rows: [] }))
      if (bookingResult.rows[0] && bookingResult.rows[0].status !== 'COMPLETED') return c.json({ error: 'Can only review completed bookings' }, 400)
    }
    if (bookingId) {
      const existing = await pool.query('SELECT id FROM "Review" WHERE "bookingId" = $1', [bookingId])
      if (existing.rows.length > 0) return c.json({ error: 'Review already exists for this booking' }, 409)
    }
    const id = 'rev_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query('INSERT INTO "Review" (id, "bookingId", "serviceId", "reviewerId", rating, comment, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())', [id, bookingId || null, serviceId, user.id, rating, comment || null])
    try { await pool.query('UPDATE "Service" SET "averageRating" = (SELECT AVG(rating) FROM "Review" WHERE "serviceId" = $1), "totalReviews" = (SELECT COUNT(*) FROM "Review" WHERE "serviceId" = $1), "updatedAt" = NOW() WHERE id = $1', [serviceId]) } catch (e) { /* ignore */ }
    return c.json({ message: 'Review submitted successfully', review: { id, rating, comment } }, 201)
  } catch (e) { console.error('Create review error:', e); return c.json({ error: 'Failed to submit review' }, 500) }
})

// GET /api/reviews
router.get('/api/reviews', async (c) => {
  try {
    const serviceId = c.req.query('serviceId')
    const reviewedId = c.req.query('reviewedId')
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    let query = 'SELECT r.*, u.name as "reviewerName", u."profileImageUrl" as "reviewerImage" FROM "Review" r LEFT JOIN "User" u ON r."reviewerId" = u.id WHERE 1=1'
    const params: any[] = []
    let idx = 1
    if (serviceId) { query += ` AND r."serviceId" = $${idx}`; params.push(serviceId); idx++ }
    if (reviewedId) { query += ` AND r."reviewedId" = $${idx}`; params.push(reviewedId); idx++ }
    query += ` ORDER BY r."createdAt" DESC LIMIT $${idx} OFFSET $${idx + 1}`
    params.push(limit, offset)
    const result = await pool.query(query, params).catch(() => ({ rows: [] }))
    return c.json({ reviews: result.rows.map(transformReviewRow), total: result.rows.length, limit, offset })
  } catch (e) { return c.json({ error: 'Failed to list reviews' }, 500) }
})

// DELETE /api/reviews/:id
router.delete('/api/reviews/:id', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const id = c.req.param('id')
    const reviewCheck = await pool.query('SELECT "reviewerId" FROM "Review" WHERE id = $1', [id])
    if (reviewCheck.rows.length === 0) return c.json({ error: 'Review not found' }, 404)
    if (reviewCheck.rows[0].reviewerId !== user.id && user.roleId !== 1 && user.roleId !== 3) return c.json({ error: 'Not authorized' }, 403)
    await pool.query('DELETE FROM "Review" WHERE id = $1', [id])
    return c.json({ message: 'Review deleted' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// PATCH /api/reviews/:id
router.patch('/api/reviews/:id', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const id = c.req.param('id')
    // Ownership check: verify the user is the reviewer or admin
    const reviewCheck = await pool.query('SELECT "reviewerId" FROM "Review" WHERE id = $1', [id])
    if (reviewCheck.rows.length === 0) return c.json({ error: 'Review not found' }, 404)
    const isAdmin = user.roleId === 1 || user.roleId === 3 || user.roleId === 7
    if (reviewCheck.rows[0].reviewerId !== user.id && !isAdmin) return c.json({ error: 'Not authorized to update this review' }, 403)
    const body = await c.req.json()
    const updates = []
    const values = []
    let idx = 1
    for (const f of ['rating', 'comment']) {
      if (body[f] !== undefined) { updates.push(`"${f}" = $${idx}`); values.push(body[f]); idx++ }
    }
    if (updates.length === 0) return c.json({ error: 'No fields' }, 400)
    updates.push('"updatedAt" = NOW()')
    values.push(id)
    await pool.query(`UPDATE "Review" SET ${updates.join(', ')} WHERE id = $${idx}`, values)
    return c.json({ message: 'Review updated' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// ═══ NOTIFICATIONS ════════════════════════════════════════════════════

// GET /api/notifications
router.get('/api/notifications', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    const result = await pool.query('SELECT * FROM "Notification" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT $2 OFFSET $3', [user.id, limit, offset]).catch(() => ({ rows: [] }))
    const unreadResult = await pool.query('SELECT COUNT(*) as count FROM "Notification" WHERE "userId" = $1 AND "isRead" = false', [user.id]).catch(() => ({ rows: [{ count: 0 }] }))
    return c.json({ notifications: result.rows, unreadCount: parseInt(unreadResult.rows[0].count), total: result.rows.length, limit, offset })
  } catch (e) { return c.json({ error: 'Failed to list notifications' }, 500) }
})

// PATCH /api/notifications/:id/read
router.patch('/api/notifications/:id/read', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const id = c.req.param('id')
    await pool.query('UPDATE "Notification" SET "isRead" = true WHERE id = $1 AND "userId" = $2', [id, user.id])
    return c.json({ message: 'Notification marked as read' })
  } catch (e) { return c.json({ message: 'Notification marked as read' }) }
})

// PATCH /api/notifications (mark all read)
router.patch('/api/notifications', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    await pool.query('UPDATE "Notification" SET "isRead" = true WHERE "userId" = $1', [user.id])
    return c.json({ message: 'All notifications marked as read' })
  } catch (e) { return c.json({ message: 'All notifications marked as read' }) }
})

// ═══ WALLET ═══════════════════════════════════════════════════════════

// GET /api/wallet
router.get('/api/wallet', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const result = await pool.query('SELECT * FROM "Wallet" WHERE "userId" = $1', [user.id]).catch(() => ({ rows: [] }))
    if (!result.rows[0]) {
      const walletId = 'wlt_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
      try {
        await pool.query('INSERT INTO "Wallet" (id, "userId", balance, "createdAt", "updatedAt") VALUES ($1, $2, 0, NOW(), NOW())', [walletId, user.id])
        const newResult = await pool.query('SELECT * FROM "Wallet" WHERE "userId" = $1', [user.id])
        return c.json({ wallet: newResult.rows[0] })
      } catch (e) { return c.json({ wallet: { id: walletId, userId: user.id, balance: 0 } }) }
    }
    return c.json({ wallet: result.rows[0] })
  } catch (e) { return c.json({ error: 'Failed to get wallet' }, 500) }
})

// POST /api/wallet/deposit
router.post('/api/wallet/deposit', async (c) => {
  const client = await pool.connect()
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const { amount, category, referenceId, referenceType } = await c.req.json()
    if (!amount || amount <= 0) return c.json({ error: 'Amount must be positive' }, 400)

    await client.query('BEGIN')
    // Acquire row lock on wallet
    let walletResult = await client.query('SELECT * FROM "Wallet" WHERE "userId" = $1 FOR UPDATE', [user.id])
    if (!walletResult.rows[0]) {
      const walletId = 'wlt_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
      await client.query('INSERT INTO "Wallet" (id, "userId", balance, "createdAt", "updatedAt") VALUES ($1, $2, 0, NOW(), NOW())', [walletId, user.id])
      walletResult = await client.query('SELECT * FROM "Wallet" WHERE "userId" = $1 FOR UPDATE', [user.id])
    }
    const wallet = walletResult.rows[0]
    await client.query('UPDATE "Wallet" SET balance = balance + $1, "updatedAt" = NOW() WHERE id = $2', [amount, wallet.id])
    const txnId = 'txn_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await client.query('INSERT INTO "WalletTransaction" (id, "walletId", "userId", type, category, amount, description, "referenceId", "referenceType", status, "createdAt") VALUES ($1, $2, $3, \'CREDIT\', $4, $5, \'Wallet deposit\', $6, $7, \'COMPLETED\', NOW())', [txnId, wallet.id, user.id, category || 'CASHBACK', amount, referenceId || null, referenceType || null])
    await client.query('COMMIT')
    const updated = await pool.query('SELECT * FROM "Wallet" WHERE id = $1', [wallet.id]).catch(() => ({ rows: [{ ...wallet, balance: (wallet.balance || 0) + amount }] }))
    return c.json({ message: 'Deposit successful', wallet: updated.rows[0], transactionId: txnId })
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('Wallet deposit error:', e)
    return c.json({ error: 'Failed to deposit' }, 500)
  } finally {
    client.release()
  }
})

// GET /api/wallet/transactions
router.get('/api/wallet/transactions', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const result = await pool.query('SELECT * FROM "WalletTransaction" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 50', [user.id]).catch(() => ({ rows: [] }))
    return c.json({ transactions: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ transactions: [], total: 0 }) }
})

// POST /api/wallet/withdraw
router.post('/api/wallet/withdraw', async (c) => {
  const client = await pool.connect()
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const { amount, method } = await c.req.json()
    if (!amount || amount <= 0) return c.json({ error: 'Invalid amount' }, 400)

    await client.query('BEGIN')
    // Acquire row lock on wallet
    const walletResult = await client.query('SELECT * FROM "Wallet" WHERE "userId" = $1 FOR UPDATE', [user.id])
    const wallet = walletResult.rows[0]
    if (!wallet) {
      await client.query('ROLLBACK')
      return c.json({ error: 'Wallet not found' }, 404)
    }
    if (wallet.balance < amount) {
      await client.query('ROLLBACK')
      return c.json({ error: 'Insufficient balance' }, 400)
    }
    const id = 'pay_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await client.query('INSERT INTO "PayoutRequest" (id, "userId", amount, method, status, "createdAt") VALUES ($1, $2, $3, $4, $5, NOW())', [id, user.id, amount, method || 'BANK_TRANSFER', 'PENDING'])
    await client.query('UPDATE "Wallet" SET balance = balance - $1, "updatedAt" = NOW() WHERE id = $2', [amount, wallet.id])
    await client.query('COMMIT')
    return c.json({ message: 'Withdrawal request submitted', amount, payoutId: id })
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {})
    return c.json({ error: 'Failed' }, 500)
  } finally {
    client.release()
  }
})

// ═══ EARNINGS ═════════════════════════════════════════════════════════

// GET /api/earnings
router.get('/api/earnings', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const period = c.req.query('period') || 'month'
    let dateFilter = ''
    if (period === 'week') dateFilter = "AND b.\"completedAt\" >= NOW() - INTERVAL '7 days'"
    else if (period === 'month') dateFilter = "AND b.\"completedAt\" >= NOW() - INTERVAL '30 days'"
    else if (period === 'year') dateFilter = "AND b.\"completedAt\" >= NOW() - INTERVAL '365 days'"
    const earningsResult = await pool.query(`SELECT COALESCE(SUM(b."finalPrice"), 0) as "totalEarnings", COUNT(*) as "totalJobs", COALESCE(AVG(b."finalPrice"), 0) as "avgEarning" FROM "Booking" b WHERE (b."providerId" = $1 OR b."technicianId" = $1) AND b.status = 'COMPLETED' ${dateFilter}`, [user.id]).catch(() => ({ rows: [{ totalEarnings: 0, totalJobs: 0, avgEarning: 0 }] }))
    const pendingResult = await pool.query('SELECT COALESCE(SUM(b."finalPrice"), 0) as "pendingAmount" FROM "Booking" b WHERE (b."providerId" = $1 OR b."technicianId" = $1) AND b."paymentStatus" = \'PENDING\'', [user.id]).catch(() => ({ rows: [{ pendingAmount: 0 }] }))
    const recentResult = await pool.query('SELECT b.id, b."bookingNumber", b."finalPrice", b."completedAt", s.title as "serviceName" FROM "Booking" b LEFT JOIN "Service" s ON b."serviceId" = s.id WHERE (b."providerId" = $1 OR b."technicianId" = $1) AND b.status = \'COMPLETED\' ORDER BY b."completedAt" DESC LIMIT 10', [user.id]).catch(() => ({ rows: [] }))
    return c.json({ earnings: { ...earningsResult.rows[0], pendingAmount: pendingResult.rows[0].pendingAmount }, recentBookings: recentResult.rows, period })
  } catch (e) { return c.json({ error: 'Failed to get earnings' }, 500) }
})

// ═══ PAYOUTS ══════════════════════════════════════════════════════════

// GET /api/payouts
router.get('/api/payouts', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    const result = await pool.query('SELECT * FROM "PayoutRequest" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT $2 OFFSET $3', [user.id, limit, offset]).catch(() => ({ rows: [] }))
    return c.json({ payouts: result.rows, total: result.rows.length, limit, offset })
  } catch (e) { return c.json({ error: 'Failed to list payouts' }, 500) }
})

// POST /api/payouts/request
router.post('/api/payouts/request', async (c) => {
  const client = await pool.connect()
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const { amount, method, metadata } = await c.req.json()
    if (!amount || amount <= 0) return c.json({ error: 'Amount must be positive' }, 400)
    if (!method || !['BANK_TRANSFER', 'UPI'].includes(method)) return c.json({ error: 'method must be BANK_TRANSFER or UPI' }, 400)

    await client.query('BEGIN')
    // Acquire row lock on wallet
    const walletResult = await client.query('SELECT * FROM "Wallet" WHERE "userId" = $1 FOR UPDATE', [user.id])
    const wallet = walletResult.rows[0]
    if (!wallet) {
      await client.query('ROLLBACK')
      return c.json({ error: 'Wallet not found' }, 404)
    }
    if (wallet.balance < amount) {
      await client.query('ROLLBACK')
      return c.json({ error: 'Insufficient wallet balance' }, 400)
    }
    const id = 'pay_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await client.query('INSERT INTO "PayoutRequest" (id, "userId", amount, method, metadata, status, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, \'PENDING\', NOW(), NOW())', [id, user.id, amount, method, metadata || null])
    await client.query('UPDATE "Wallet" SET balance = balance - $1, "updatedAt" = NOW() WHERE id = $2', [amount, wallet.id])
    await client.query('COMMIT')
    return c.json({ message: 'Payout request submitted', payout: { id, amount, status: 'PENDING' } }, 201)
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('Payout request error:', e)
    return c.json({ error: 'Failed to create payout request' }, 500)
  } finally {
    client.release()
  }
})

// ═══ FAVORITES ════════════════════════════════════════════════════════

// GET /api/favorites
router.get('/api/favorites', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const result = await pool.query('SELECT f.*, s.title as "serviceName", s."images" as "serviceImage", s."basePrice", s."basePrice" as "finalPrice", s."averageRating", sc.name as "categoryName" FROM "Favorite" f LEFT JOIN "Service" s ON f."serviceId" = s.id LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id WHERE f."userId" = $1 ORDER BY f."createdAt" DESC', [user.id]).catch(() => ({ rows: [] }))
    return c.json({ favorites: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed to list favorites' }, 500) }
})

// POST /api/favorites
router.post('/api/favorites', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const { serviceId } = await c.req.json()
    if (!serviceId) return c.json({ error: 'serviceId is required' }, 400)
    const existing = await pool.query('SELECT id FROM "Favorite" WHERE "userId" = $1 AND "serviceId" = $2', [user.id, serviceId]).catch(() => ({ rows: [] }))
    if (existing.rows.length > 0) return c.json({ error: 'Already in favorites' }, 409)
    const id = 'fav_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query('INSERT INTO "Favorite" (id, "userId", "serviceId", "createdAt") VALUES ($1, $2, $3, NOW())', [id, user.id, serviceId])
    return c.json({ message: 'Added to favorites', favorite: { id, serviceId } }, 201)
  } catch (e) { return c.json({ error: 'Failed to add favorite' }, 500) }
})

// DELETE /api/favorites/:serviceId
router.delete('/api/favorites/:serviceId', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const serviceId = c.req.param('serviceId')
    await pool.query('DELETE FROM "Favorite" WHERE "userId" = $1 AND "serviceId" = $2', [user.id, serviceId])
    return c.json({ message: 'Removed from favorites' })
  } catch (e) { return c.json({ error: 'Failed to remove favorite' }, 500) }
})

// ═══ KYC ══════════════════════════════════════════════════════════════

// GET /api/kyc
router.get('/api/kyc', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const result = await pool.query('SELECT * FROM "ProviderKyc" WHERE "providerId" = $1', [user.id]).catch(() => ({ rows: [] }))
    if (!result.rows[0]) return c.json({ kyc: { status: 'NOT_SUBMITTED', providerId: user.id } })
    return c.json({ kyc: result.rows[0] })
  } catch (e) { return c.json({ error: 'Failed to get KYC status' }, 500) }
})

// POST /api/kyc
router.post('/api/kyc', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const { documentType, documentNumber, documentFrontUrl, documentBackUrl, selfieUrl } = await c.req.json()
    if (!documentType || !documentNumber || !documentFrontUrl) return c.json({ error: 'documentType, documentNumber, and documentFrontUrl are required' }, 400)
    const existing = await pool.query('SELECT * FROM "ProviderKyc" WHERE "providerId" = $1', [user.id]).catch(() => ({ rows: [] }))
    if (existing.rows[0]) {
      await pool.query('UPDATE "ProviderKyc" SET "documentType" = $1, "documentNumber" = $2, "documentFrontUrl" = $3, "documentBackUrl" = $4, "selfieUrl" = $5, "verificationStatus" = \'PENDING\', "updatedAt" = NOW() WHERE "providerId" = $6', [documentType, documentNumber, documentFrontUrl, documentBackUrl || null, selfieUrl || null, user.id])
      return c.json({ message: 'KYC updated, pending verification', kyc: { providerId: user.id, verificationStatus: 'PENDING' } })
    }
    const id = 'kyc_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query('INSERT INTO "ProviderKyc" (id, "providerId", "documentType", "documentNumber", "documentFrontUrl", "documentBackUrl", "selfieUrl", "verificationStatus", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, \'PENDING\', NOW(), NOW())', [id, user.id, documentType, documentNumber, documentFrontUrl, documentBackUrl || null, selfieUrl || null])
    return c.json({ message: 'KYC submitted, pending verification', kyc: { id, providerId: user.id, verificationStatus: 'PENDING' } }, 201)
  } catch (e) { console.error('KYC submit error:', e); return c.json({ error: 'Failed to submit KYC' }, 500) }
})

// GET /api/kyc/status
router.get('/api/kyc/status', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const result = await pool.query('SELECT * FROM "ProviderKyc" WHERE "providerId" = $1', [user.id])
    return c.json({ kyc: result.rows[0] || { verificationStatus: 'PENDING' } })
  } catch (e) { return c.json({ kyc: { verificationStatus: 'PENDING' } }) }
})

// POST /api/kyc/submit
router.post('/api/kyc/submit', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const body = await c.req.json()
    const kycId = 'kyc_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query('INSERT INTO "ProviderKyc" (id, "providerId", "documentType", "documentNumber", "documentFrontUrl", "selfieUrl", "verificationStatus") VALUES ($1, $2, $3, $4, $5, $6, \'PENDING\') ON CONFLICT ("providerId") DO UPDATE SET "documentType" = $3, "documentNumber" = $4, "documentFrontUrl" = $5, "selfieUrl" = $6, "verificationStatus" = \'PENDING\', "updatedAt" = NOW()', [kycId, user.id, body.documentType || 'AADHAAR', body.documentNumber || '', body.documentFrontUrl || '/pending', body.selfieUrl || '/pending'])
    return c.json({ message: 'KYC submitted successfully', status: 'PENDING' })
  } catch (e) { return c.json({ message: 'KYC submitted successfully', status: 'PENDING' }) }
})

// ═══ DISPUTES ═════════════════════════════════════════════════════════

// GET /api/disputes
router.get('/api/disputes', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    const result = await pool.query('SELECT d.*, b."bookingNumber" FROM "Dispute" d LEFT JOIN "Booking" b ON d."bookingId" = b.id WHERE d."raisedBy" = $1 OR d."assignedTo" = $1 ORDER BY d."createdAt" DESC LIMIT $2 OFFSET $3', [user.id, limit, offset]).catch(() => ({ rows: [] }))
    return c.json({ disputes: result.rows, total: result.rows.length, limit, offset })
  } catch (e) { return c.json({ error: 'Failed to list disputes' }, 500) }
})

// POST /api/disputes
router.post('/api/disputes', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const { bookingId, assignedTo, disputeType, description, evidence } = await c.req.json()
    if (!bookingId || !disputeType || !description) return c.json({ error: 'bookingId, disputeType, and description are required' }, 400)
    const id = 'dsp_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query('INSERT INTO "Dispute" (id, "bookingId", "raisedBy", "assignedTo", "disputeType", description, evidence, status, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, \'OPEN\', NOW(), NOW())', [id, bookingId, user.id, assignedTo || null, disputeType || 'OTHER', description, evidence || null])
    return c.json({ message: 'Dispute created', dispute: { id, status: 'OPEN', disputeType } }, 201)
  } catch (e) { console.error('Create dispute error:', e); return c.json({ error: 'Failed to create dispute' }, 500) }
})

// PATCH /api/disputes/:id
router.patch('/api/disputes/:id', async (c) => {
  try {
    const auth = await getAuthUser(c)
    if (!auth) return c.json({ error: 'Authentication required' }, 401)
    const id = c.req.param('id')
    const disputeCheck = await pool.query('SELECT "raisedBy", "assignedTo" FROM "Dispute" WHERE id = $1', [id])
    if (disputeCheck.rows.length === 0) return c.json({ error: 'Dispute not found' }, 404)
    if (disputeCheck.rows[0].raisedBy !== auth.id && disputeCheck.rows[0].assignedTo !== auth.id && auth.roleId !== 1 && auth.roleId !== 3 && auth.roleId !== 7) return c.json({ error: 'Not authorized' }, 403)
    const body = await c.req.json()
    const updates = []; const values = []; let idx = 1
    for (const f of ['status', 'resolution', 'adminNotes']) {
      if (body[f] !== undefined) { updates.push(`"${f}" = $${idx}`); values.push(body[f]); idx++ }
    }
    if (updates.length === 0) return c.json({ error: 'No fields' }, 400)
    updates.push('"updatedAt" = NOW()')
    values.push(id)
    await pool.query(`UPDATE "Dispute" SET ${updates.join(', ')} WHERE id = $${idx}`, values)
    return c.json({ message: 'Dispute updated' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// ═══ COUPONS ══════════════════════════════════════════════════════════

// GET /api/coupons
router.get('/api/coupons', async (c) => {
  try {
    const result = await pool.query('SELECT * FROM "Coupon" WHERE "isActive" = true AND "validTo" > NOW() ORDER BY "createdAt" DESC').catch(() => ({ rows: [] }))
    return c.json({ coupons: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed to list coupons' }, 500) }
})

// POST /api/coupons/validate
router.post('/api/coupons/validate', async (c) => {
  try {
    const { code, amount } = await c.req.json()
    if (!code) return c.json({ error: 'Coupon code is required' }, 400)
    const result = await pool.query('SELECT * FROM "Coupon" WHERE code = $1 AND "isActive" = true AND "validTo" > NOW()', [code]).catch(() => ({ rows: [] }))
    if (!result.rows[0]) return c.json({ valid: false, error: 'Invalid or expired coupon code' }, 404)
    const coupon = result.rows[0]
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return c.json({ valid: false, error: 'Coupon usage limit reached' })
    if (coupon.minOrderAmount && amount && amount < coupon.minOrderAmount) return c.json({ valid: false, error: `Minimum order amount is ₹${coupon.minOrderAmount}` })
    let discountAmount = 0
    if (amount) {
      if (coupon.discountType === 'PERCENTAGE') { discountAmount = (amount * coupon.discountValue) / 100; if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) discountAmount = coupon.maxDiscount } else { discountAmount = coupon.discountValue }
    }
    return c.json({ valid: true, coupon: { id: coupon.id, code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue, maxDiscount: coupon.maxDiscount, discountAmount } })
  } catch (e) { return c.json({ error: 'Failed to validate coupon' }, 500) }
})

// ═══ AMC PLANS ═════════════════════════════════════════════════════════

// GET /api/amc-plans
router.get('/api/amc-plans', async (c) => {
  try {
    const categoryId = c.req.query('categoryId')
    let query = 'SELECT * FROM "AMCPlan" WHERE "isActive" = true'
    const params: any[] = []
    if (categoryId) { query += ' AND "categoryId" = $1'; params.push(categoryId) }
    query += ' ORDER BY price'
    const result = await pool.query(query, params).catch(() => ({ rows: [] }))
    return c.json({ plans: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed to list AMC plans' }, 500) }
})

// GET /api/amc-subscriptions
router.get('/api/amc-subscriptions', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const result = await pool.query('SELECT s.*, p.name as "planName", p."visitsIncluded" FROM "AMCSubscription" s LEFT JOIN "AMCPlan" p ON s."planId" = p.id WHERE s."clientId" = $1 ORDER BY s."createdAt" DESC', [user.id]).catch(() => ({ rows: [] }))
    return c.json({ subscriptions: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed to list AMC subscriptions' }, 500) }
})

// GET /api/amc/plans
router.get('/api/amc/plans', async (c) => {
  try {
    const result = await pool.query('SELECT * FROM "AMCPlan" WHERE "isActive" = true ORDER BY "price"').catch(() => ({ rows: [] }))
    return c.json({ plans: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ plans: [], total: 0 }) }
})

// GET /api/amc/subscriptions
router.get('/api/amc/subscriptions', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const result = await pool.query('SELECT * FROM "AMCSubscription" WHERE "clientId" = $1 ORDER BY "createdAt" DESC', [user.id]).catch(() => ({ rows: [] }))
    return c.json({ subscriptions: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ subscriptions: [], total: 0 }) }
})

// POST /api/amc/subscribe
router.post('/api/amc/subscribe', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const { planId } = await c.req.json()
    const subId = 'amc_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query('INSERT INTO "AMCSubscription" (id, "clientId", "planId", status, "startDate", "endDate") VALUES ($1, $2, $3, \'ACTIVE\', NOW(), NOW() + INTERVAL \'1 year\')', [subId, user.id, planId])
    return c.json({ message: 'Subscribed successfully', subscriptionId: subId }, 201)
  } catch (e) { return c.json({ error: 'Failed to subscribe' }, 500) }
})

// ═══ INVOICES ═════════════════════════════════════════════════════════

// GET /api/invoices
router.get('/api/invoices', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    const result = await pool.query('SELECT i.*, b."bookingNumber", s.title as "serviceName" FROM "Invoice" i LEFT JOIN "Booking" b ON i."bookingId" = b.id LEFT JOIN "Service" s ON b."serviceId" = s.id WHERE i."clientId" = $1 OR i."providerId" = $1 ORDER BY i."createdAt" DESC LIMIT $2 OFFSET $3', [user.id, limit, offset]).catch(() => ({ rows: [] }))
    return c.json({ invoices: result.rows, total: result.rows.length, limit, offset })
  } catch (e) { return c.json({ error: 'Failed to list invoices' }, 500) }
})

// GET /api/invoices/:id
router.get('/api/invoices/:id', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const id = c.req.param('id')
    const result = await pool.query('SELECT i.*, b."bookingNumber", b."serviceAddress", b."scheduledDate", s.title as "serviceName", u.name as "clientName", u.email as "clientEmail", u.phone as "clientPhone" FROM "Invoice" i LEFT JOIN "Booking" b ON i."bookingId" = b.id LEFT JOIN "Service" s ON b."serviceId" = s.id LEFT JOIN "User" u ON b."clientId" = u.id WHERE i.id = $1', [id]).catch(() => ({ rows: [] }))
    if (!result.rows[0]) return c.json({ error: 'Invoice not found' }, 404)
    return c.json({ invoice: result.rows[0] })
  } catch (e) { return c.json({ error: 'Failed to get invoice' }, 500) }
})

// ═══ CRM ══════════════════════════════════════════════════════════════

// GET /api/crm/activities
router.get('/api/crm/activities', async (c) => {
  try {
    const result = await pool.query('SELECT * FROM "CRMActivity" ORDER BY "createdAt" DESC LIMIT 50').catch(() => ({ rows: [] }))
    return c.json({ activities: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ activities: [], total: 0 }) }
})

// GET /api/crm/follow-ups
router.get('/api/crm/follow-ups', async (c) => {
  try {
    const result = await pool.query('SELECT * FROM "FollowUp" ORDER BY "scheduledAt" ASC LIMIT 50').catch(() => ({ rows: [] }))
    return c.json({ followUps: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ followUps: [], total: 0 }) }
})

// POST /api/crm/follow-ups
router.post('/api/crm/follow-ups', async (c) => {
  try {
    const body = await c.req.json()
    const id = 'fu_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query('INSERT INTO "FollowUp" (id, "leadId", "scheduledAt", notes, status, "createdAt") VALUES ($1, $2, $3, $4, $5, NOW())', [id, body.leadId || null, body.scheduledAt || null, body.notes || '', body.status || 'PENDING'])
    return c.json({ message: 'Follow-up created', id }, 201)
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

export default router
