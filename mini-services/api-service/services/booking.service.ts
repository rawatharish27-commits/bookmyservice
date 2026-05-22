// ─── services/booking.service.ts ───────────────────────────────────────
// Pure business logic extracted from routes/booking.routes.ts (bookings section)
// ─────────────────────────────────────────────────────────────────────

import { pool } from '../lib/shared'
import { redis } from '../lib/redis'
import { pushNotificationJob, pushBookingJob } from '../queues'
import { BookingEvents } from '../lib/logger'

// ─── Types ────────────────────────────────────────────────────────────

export interface CreateBookingInput {
  serviceId: string
  providerId?: string
  technicianId?: string
  scheduledDate: string
  scheduledTime?: string
  address?: string
  lat?: number
  lng?: number
  notes?: string
  couponId?: string
}

// ─── Create Booking ───────────────────────────────────────────────────

export async function createBooking(userId: string, userEmail: string, data: CreateBookingInput): Promise<{
  success: true; booking: any
} | { success: false; error: string; status: number }> {
  const { serviceId, providerId, technicianId, scheduledDate, scheduledTime, address: serviceAddress, lat: serviceLatitude, lng: serviceLongitude, notes: specialInstructions, couponId } = data
  const svcResult = await pool.query('SELECT id, "providerId", "basePrice", "categoryId" FROM "Service" WHERE id = $1 AND "isActive" = true', [serviceId])
  if (!svcResult.rows[0]) return { success: false, error: 'Service not found', status: 404 }
  const service = svcResult.rows[0]
  const basePrice = service.basePrice || 0
  const bookingId = 'bkg_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
  const bookingNumber = 'BK' + Date.now().toString().slice(-8) + Math.random().toString(36).slice(2, 5).toUpperCase()
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
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
    [bookingId, bookingNumber, userId, providerId || service.providerId, technicianId || null, serviceId, scheduledDate, scheduledTime || null, serviceAddress, serviceLatitude || null, serviceLongitude || null, specialInstructions || null, basePrice, couponDiscount, finalPrice, couponId || null, otpCode]
  )
  const result = await pool.query('SELECT b.*, u.name as "clientName", u.phone as "clientPhone" FROM "Booking" b LEFT JOIN "User" u ON b."clientId" = u.id WHERE b.id = $1', [bookingId]).catch(async () => {
    return { rows: [{ id: bookingId, bookingNumber, clientId: userId, serviceId, status: 'PENDING', basePrice, couponDiscount, finalPrice, otpCode, scheduledDate, serviceAddress }] }
  })
  await redis.delByPattern('cache:stats:*').catch(() => {})
  await redis.del('cache:admin:analytics:dashboard').catch(() => {})
  BookingEvents.created(bookingId, userId, serviceId)
  pushBookingJob({ type: 'BOOKING_CONFIRMATION', bookingId, data: { clientName: result.rows[0]?.clientName || '', clientEmail: userEmail, clientPhone: result.rows[0]?.clientPhone || '', providerName: service.providerId || '', serviceName: '', scheduledDate, scheduledTime: scheduledTime || null, otp: otpCode }, priority: 2 }).catch(() => {})
  pushBookingJob({ type: 'INVOICE', bookingId, data: { finalPrice, basePrice, couponDiscount, serviceName: '' }, priority: 3 }).catch(() => {})
  pushBookingJob({ type: 'ANALYTICS', bookingId, data: { categoryId: service.categoryId || null, providerId: service.providerId || null }, priority: 4 }).catch(() => {})
  pushBookingJob({ type: 'REFERRAL_REWARD', bookingId, data: { clientId: userId, referrerId: null, basePrice }, priority: 4 }).catch(() => {})
  return { success: true, booking: result.rows[0] }
}

// ─── List Bookings ────────────────────────────────────────────────────

export async function listBookings(userId: string, roleId: number, role: string, filters: { status?: string; limit?: number; offset?: number }): Promise<{
  bookings: any[]; total: number; limit: number; offset: number
}> {
  const { status, limit = 20, offset = 0 } = filters
  let query = 'SELECT b.*, s.title as "serviceName", u.name as "clientName", u.phone as "clientPhone", p.name as "providerName" FROM "Booking" b LEFT JOIN "Service" s ON b."serviceId" = s.id LEFT JOIN "User" u ON b."clientId" = u.id LEFT JOIN "User" p ON b."providerId" = p.id WHERE '
  const params: any[] = []
  let idx = 1
  if (roleId === 2 || role === 'PROVIDER') { query += `b."providerId" = $${idx}`; params.push(userId) }
  else if (roleId === 4 || role === 'TECHNICIAN') { query += `b."technicianId" = $${idx}`; params.push(userId) }
  else { query += `b."clientId" = $${idx}`; params.push(userId) }
  idx++
  if (status) { query += ` AND b.status = $${idx}`; params.push(status); idx++ }
  query += ` ORDER BY b."createdAt" DESC LIMIT $${idx} OFFSET $${idx + 1}`
  params.push(limit, offset)
  const result = await pool.query(query, params).catch(() => ({ rows: [] }))
  return { bookings: result.rows, total: result.rows.length, limit, offset }
}

// ─── Get Booking ──────────────────────────────────────────────────────

export async function getBooking(bookingId: string, userId: string, roleId: number): Promise<{
  success: true; booking: any
} | { success: false; error: string; status: number }> {
  const result = await pool.query(
    'SELECT b.*, s.title as "serviceName", s."images" as "serviceImage", u.name as "clientName", u.phone as "clientPhone", u."profileImageUrl" as "clientImage", p.name as "providerName", p.phone as "providerPhone", p."profileImageUrl" as "providerImage", t.name as "technicianName", sc.name as "categoryName" FROM "Booking" b LEFT JOIN "Service" s ON b."serviceId" = s.id LEFT JOIN "User" u ON b."clientId" = u.id LEFT JOIN "User" p ON b."providerId" = p.id LEFT JOIN "User" t ON b."technicianId" = t.id LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id WHERE b.id = $1',
    [bookingId]
  ).catch(() => ({ rows: [] }))
  if (!result.rows[0]) return { success: false, error: 'Booking not found', status: 404 }
  const booking = result.rows[0]
  if (booking.clientId !== userId && booking.providerId !== userId && roleId !== 1 && roleId !== 3 && roleId !== 7) return { success: false, error: 'Forbidden', status: 403 }
  return { success: true, booking }
}

// ─── Update Booking Status ───────────────────────────────────────────

export async function updateBookingStatus(bookingId: string, userId: string, roleId: number, status: string, reason?: string): Promise<{
  success: true; booking: any
} | { success: false; error: string; status: number }> {
  const validStatuses = ['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
  if (!status || !validStatuses.includes(status)) return { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`, status: 400 }
  const existingResult = await pool.query('SELECT * FROM "Booking" WHERE id = $1', [bookingId]).catch(() => ({ rows: [] }))
  if (!existingResult.rows[0]) return { success: false, error: 'Booking not found', status: 404 }
  const booking = existingResult.rows[0]
  const allowedTransitions: Record<string, number[]> = { 'CANCELLED': [1, 2], 'ACCEPTED': [2, 4], 'REJECTED': [2, 4], 'IN_PROGRESS': [2, 4], 'COMPLETED': [2, 4] }
  const allowedRoles = allowedTransitions[status] || []
  if (!allowedRoles.includes(roleId) && roleId !== 1 && roleId !== 3) return { success: false, error: 'Not authorized for this status change', status: 403 }
  const updates = ['status = $1', '"updatedAt" = NOW()']
  const values: any[] = [status]
  let idx = 2
  if (status === 'COMPLETED') { updates.push(`"completedAt" = NOW()`) }
  if (status === 'CANCELLED') { updates.push(`"cancelledAt" = NOW()`) }
  if (reason) { updates.push(`"cancellationReason" = $${idx}`); values.push(reason); idx++ }
  values.push(bookingId)
  await pool.query(`UPDATE "Booking" SET ${updates.join(', ')} WHERE id = $${idx}`, values)
  if (status === 'COMPLETED' && booking.providerId) {
    await pool.query('UPDATE "User" SET "completedJobsCount" = COALESCE("completedJobsCount", 0) + 1 WHERE id = $1', [booking.providerId])
  }
  const result = await pool.query('SELECT * FROM "Booking" WHERE id = $1', [bookingId]).catch(() => existingResult)
  return { success: true, booking: result.rows[0] }
}

// ─── Verify OTP ──────────────────────────────────────────────────────

export async function verifyOtp(bookingId: string, otp: string): Promise<{
  success: true; bookingId: string
} | { success: false; error: string; status: number }> {
  if (!otp) return { success: false, error: 'OTP is required', status: 400 }
  const result = await pool.query('SELECT * FROM "Booking" WHERE id = $1', [bookingId]).catch(() => ({ rows: [] }))
  if (!result.rows[0]) return { success: false, error: 'Booking not found', status: 404 }
  const booking = result.rows[0]
  if (booking.otpCode !== otp) return { success: false, error: 'Invalid OTP', status: 400 }
  await pool.query('UPDATE "Booking" SET status = \'IN_PROGRESS\', "startedAt" = NOW(), "updatedAt" = NOW() WHERE id = $1', [bookingId])
  return { success: true, bookingId }
}

// ─── Cancel Booking ──────────────────────────────────────────────────

export async function cancelBooking(bookingId: string, userId: string, reason?: string): Promise<{
  success: true
} | { success: false; error: string; status: number }> {
  const bookingResult = await pool.query('SELECT b.*, s.title as "serviceName", u.name as "clientName", p.name as "providerName" FROM "Booking" b LEFT JOIN "Service" s ON b."serviceId" = s.id LEFT JOIN "User" u ON b."clientId" = u.id LEFT JOIN "User" p ON b."providerId" = p.id WHERE b.id = $1', [bookingId])
  const booking = bookingResult.rows[0]
  await pool.query('UPDATE "Booking" SET status = \'CANCELLED\', "cancellationReason" = $2, "updatedAt" = NOW() WHERE id = $1', [bookingId, reason || ''])
  await redis.del('cache:admin:analytics:dashboard').catch(() => {})
  if (booking) {
    if (booking.clientId) { pushNotificationJob({ type: 'PUSH', recipient: { userId: booking.clientId }, template: 'booking_cancelled', data: { serviceName: booking.serviceName || 'Service', reason: reason || '', bookingId }, priority: 2 }).catch(() => {}) }
    if (booking.providerId && booking.providerId !== userId) { pushNotificationJob({ type: 'PUSH', recipient: { userId: booking.providerId }, template: 'booking_cancelled', data: { serviceName: booking.serviceName || 'Service', reason: reason || 'Client cancelled', bookingId }, priority: 2 }).catch(() => {}) }
  }
  return { success: true }
}

// ─── Complete Booking ─────────────────────────────────────────────────

export async function completeBooking(bookingId: string, userId: string): Promise<{
  success: true
} | { success: false; error: string; status: number }> {
  const bookingResult = await pool.query('SELECT b.*, s.title as "serviceName", p.name as "providerName" FROM "Booking" b LEFT JOIN "Service" s ON b."serviceId" = s.id LEFT JOIN "User" p ON b."providerId" = p.id WHERE b.id = $1', [bookingId])
  const booking = bookingResult.rows[0]
  await pool.query('UPDATE "Booking" SET status = \'COMPLETED\', "completedAt" = NOW(), "updatedAt" = NOW() WHERE id = $1', [bookingId])
  await redis.del('cache:admin:analytics:dashboard').catch(() => {})
  if (booking?.clientId) { pushNotificationJob({ type: 'PUSH', recipient: { userId: booking.clientId }, template: 'booking_completed', data: { serviceName: booking.serviceName || 'Service', providerName: booking.providerName || 'Provider', bookingId }, priority: 2 }).catch(() => {}) }
  return { success: true }
}

// ─── Accept Booking ───────────────────────────────────────────────────

export async function acceptBooking(bookingId: string, userId: string, userName?: string): Promise<{
  success: true
} | { success: false; error: string; status: number }> {
  const bookingResult = await pool.query('SELECT b.*, s.title as "serviceName", p.name as "providerName", u.name as "clientName" FROM "Booking" b LEFT JOIN "Service" s ON b."serviceId" = s.id LEFT JOIN "User" p ON b."providerId" = p.id LEFT JOIN "User" u ON b."clientId" = u.id WHERE b.id = $1', [bookingId])
  const booking = bookingResult.rows[0]
  await pool.query('UPDATE "Booking" SET status = \'ACCEPTED\', "updatedAt" = NOW() WHERE id = $1', [bookingId])
  await redis.del('cache:admin:analytics:dashboard').catch(() => {})
  if (booking?.clientId) {
    pushNotificationJob({ type: 'PUSH', recipient: { userId: booking.clientId }, template: 'provider_accepted', data: { providerName: booking.providerName || userName || 'Provider', serviceName: booking.serviceName || 'Service', scheduledDate: booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : 'TBD', bookingId }, priority: 1 }).catch(() => {})
  }
  return { success: true }
}

// ─── Reject Booking ───────────────────────────────────────────────────

export async function rejectBooking(bookingId: string, userId: string, reason?: string): Promise<{
  success: true
} | { success: false; error: string; status: number }> {
  const bookingResult = await pool.query('SELECT b.*, s.title as "serviceName" FROM "Booking" b LEFT JOIN "Service" s ON b."serviceId" = s.id WHERE b.id = $1', [bookingId])
  const booking = bookingResult.rows[0]
  await pool.query('UPDATE "Booking" SET status = \'REJECTED\', "cancellationReason" = $2, "updatedAt" = NOW() WHERE id = $1', [bookingId, reason || ''])
  if (booking?.clientId) { pushNotificationJob({ type: 'PUSH', recipient: { userId: booking.clientId }, template: 'booking_cancelled', data: { serviceName: booking.serviceName || 'Service', reason: reason || 'Provider declined', bookingId }, priority: 2 }).catch(() => {}) }
  return { success: true }
}
