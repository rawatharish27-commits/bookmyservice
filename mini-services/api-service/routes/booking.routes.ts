// ─── routes/booking.routes.ts ──────────────────────────────────────────
// All /api/bookings/*, /api/reviews/*, /api/notifications/*, /api/wallet/*, 
// /api/earnings, /api/payouts/*, /api/favorites/*, /api/kyc/*, /api/disputes/*, 
// /api/coupons/*, /api/amc-plans, /api/amc-subscriptions, /api/invoices/*
//
// Refactored: thin handlers that delegate to service modules
// ─────────────────────────────────────────────────────────────────────

import { Hono } from 'hono'
import { pool, getAuthUser } from '../lib/shared'
import { createBookingSchema } from '../validators/create-booking.schema'
import { validateBody } from '../validators/validate'
import { BookingEvents } from '../lib/logger'

// Service imports
import * as bookingService from '../services/booking.service'
import * as reviewService from '../services/review.service'
import * as notificationService from '../services/notification.service'
import * as walletService from '../services/wallet.service'
import * as earningsService from '../services/earnings.service'
import * as payoutService from '../services/payout.service'
import * as favoritesService from '../services/favorites.service'
import * as kycService from '../services/kyc.service'
import * as disputeService from '../services/dispute.service'

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
    const { serviceId: sId, providerId, technicianId, scheduledDate, scheduledTime, address, lat, lng, notes, couponId } = vResult.data
    serviceId = sId
    const result = await bookingService.createBooking(user.id, user.email, { serviceId, providerId, technicianId, scheduledDate, scheduledTime, address, lat, lng, notes, couponId })
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ message: 'Booking created successfully', booking: result.booking }, 201)
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
    const result = await bookingService.listBookings(user.id, user.roleId, user.role, { status: status || undefined, limit, offset })
    return c.json(result)
  } catch (e) { return c.json({ error: 'Failed to list bookings' }, 500) }
})

// GET /api/bookings/:id
router.get('/api/bookings/:id', async (c) => {
  try {
    const auth = await getAuthUser(c)
    if (!auth) return c.json({ error: 'Authentication required' }, 401)
    const id = c.req.param('id')
    const result = await bookingService.getBooking(id, auth.id, auth.roleId)
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ booking: result.booking })
  } catch (e) { return c.json({ error: 'Failed to get booking' }, 500) }
})

// PATCH /api/bookings/:id
router.patch('/api/bookings/:id', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const id = c.req.param('id')
    const { status, cancellationReason } = await c.req.json()
    const result = await bookingService.updateBookingStatus(id, user.id, user.roleId, status, cancellationReason)
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ message: 'Booking status updated', booking: result.booking })
  } catch (e) { console.error('Update booking error:', e); return c.json({ error: 'Failed to update booking' }, 500) }
})

// POST /api/bookings/:id/otp-verify
router.post('/api/bookings/:id/otp-verify', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const id = c.req.param('id')
    const { otp } = await c.req.json()
    const result = await bookingService.verifyOtp(id, otp)
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ message: 'OTP verified, service started', bookingId: result.bookingId })
  } catch (e) { return c.json({ error: 'OTP verification failed' }, 500) }
})

// PATCH /api/bookings/:id/cancel
router.patch('/api/bookings/:id/cancel', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const id = c.req.param('id')
    const body = await c.req.json().catch(() => ({}))
    const result = await bookingService.cancelBooking(id, user.id, body.reason)
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ message: 'Booking cancelled' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// PATCH /api/bookings/:id/complete
router.patch('/api/bookings/:id/complete', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const id = c.req.param('id')
    const result = await bookingService.completeBooking(id, user.id)
    if (!result.success) return c.json({ error: result.error }, result.status)
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
    const result = await bookingService.rejectBooking(id, user.id, body.reason)
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ message: 'Booking rejected' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// PATCH /api/bookings/:id/accept
router.patch('/api/bookings/:id/accept', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const id = c.req.param('id')
    const result = await bookingService.acceptBooking(id, user.id, user.name)
    if (!result.success) return c.json({ error: result.error }, result.status)
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
    const result = await reviewService.createReview(user.id, { bookingId, serviceId, reviewedId, rating, comment })
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ message: 'Review submitted successfully', review: result.review }, 201)
  } catch (e) { console.error('Create review error:', e); return c.json({ error: 'Failed to submit review' }, 500) }
})

// GET /api/reviews
router.get('/api/reviews', async (c) => {
  try {
    const serviceId = c.req.query('serviceId')
    const reviewedId = c.req.query('reviewedId')
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    const result = await reviewService.listReviews({ serviceId: serviceId || undefined, reviewedId: reviewedId || undefined, limit, offset })
    return c.json(result)
  } catch (e) { return c.json({ error: 'Failed to list reviews' }, 500) }
})

// DELETE /api/reviews/:id
router.delete('/api/reviews/:id', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const id = c.req.param('id')
    const result = await reviewService.deleteReview(id, user.id, user.roleId)
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ message: 'Review deleted' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// PATCH /api/reviews/:id
router.patch('/api/reviews/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const result = await reviewService.updateReview(id, body)
    if (!result.success) return c.json({ error: result.error }, result.status)
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
    const result = await notificationService.listNotifications(user.id, limit, offset)
    return c.json(result)
  } catch (e) { return c.json({ error: 'Failed to list notifications' }, 500) }
})

// PATCH /api/notifications/:id/read
router.patch('/api/notifications/:id/read', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const id = c.req.param('id')
    await notificationService.markNotificationRead(id, user.id)
    return c.json({ message: 'Notification marked as read' })
  } catch (e) { return c.json({ message: 'Notification marked as read' }) }
})

// PATCH /api/notifications (mark all read)
router.patch('/api/notifications', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    await notificationService.markAllNotificationsRead(user.id)
    return c.json({ message: 'All notifications marked as read' })
  } catch (e) { return c.json({ message: 'All notifications marked as read' }) }
})

// ═══ WALLET ═══════════════════════════════════════════════════════════

// GET /api/wallet
router.get('/api/wallet', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const wallet = await walletService.getOrCreateWallet(user.id)
    return c.json({ wallet })
  } catch (e) { return c.json({ error: 'Failed to get wallet' }, 500) }
})

// POST /api/wallet/deposit
router.post('/api/wallet/deposit', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const { amount, category, referenceId, referenceType } = await c.req.json()
    const result = await walletService.depositToWallet(user.id, amount, category, referenceId, referenceType)
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ message: 'Deposit successful', wallet: result.wallet, transactionId: result.transactionId })
  } catch (e) { console.error('Wallet deposit error:', e); return c.json({ error: 'Failed to deposit' }, 500) }
})

// GET /api/wallet/transactions
router.get('/api/wallet/transactions', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const result = await walletService.getWalletTransactions(user.id)
    return c.json(result)
  } catch (e) { return c.json({ transactions: [], total: 0 }) }
})

// POST /api/wallet/withdraw
router.post('/api/wallet/withdraw', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const { amount, method } = await c.req.json()
    const result = await walletService.withdrawFromWallet(user.id, amount, method)
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ message: 'Withdrawal request submitted', amount: result.amount, payoutId: result.payoutId })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// ═══ EARNINGS ═════════════════════════════════════════════════════════

// GET /api/earnings
router.get('/api/earnings', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const period = c.req.query('period') || 'month'
    const result = await earningsService.getEarnings(user.id, period)
    return c.json(result)
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
    const result = await payoutService.listPayouts(user.id, limit, offset)
    return c.json(result)
  } catch (e) { return c.json({ error: 'Failed to list payouts' }, 500) }
})

// POST /api/payouts/request
router.post('/api/payouts/request', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const { amount, method, metadata } = await c.req.json()
    const result = await payoutService.requestPayout(user.id, amount, method, metadata)
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ message: 'Payout request submitted', payout: result.payout }, 201)
  } catch (e) { console.error('Payout request error:', e); return c.json({ error: 'Failed to create payout request' }, 500) }
})

// ═══ FAVORITES ════════════════════════════════════════════════════════

// GET /api/favorites
router.get('/api/favorites', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const result = await favoritesService.listFavorites(user.id)
    return c.json(result)
  } catch (e) { return c.json({ error: 'Failed to list favorites' }, 500) }
})

// POST /api/favorites
router.post('/api/favorites', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const { serviceId } = await c.req.json()
    const result = await favoritesService.addFavorite(user.id, serviceId)
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ message: 'Added to favorites', favorite: result.favorite }, 201)
  } catch (e) { return c.json({ error: 'Failed to add favorite' }, 500) }
})

// DELETE /api/favorites/:serviceId
router.delete('/api/favorites/:serviceId', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const serviceId = c.req.param('serviceId')
    await favoritesService.removeFavorite(user.id, serviceId)
    return c.json({ message: 'Removed from favorites' })
  } catch (e) { return c.json({ error: 'Failed to remove favorite' }, 500) }
})

// ═══ KYC ══════════════════════════════════════════════════════════════

// GET /api/kyc
router.get('/api/kyc', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const result = await kycService.getKyc(user.id)
    return c.json(result)
  } catch (e) { return c.json({ error: 'Failed to get KYC status' }, 500) }
})

// POST /api/kyc
router.post('/api/kyc', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const { documentType, documentNumber, documentFrontUrl, documentBackUrl, selfieUrl } = await c.req.json()
    const result = await kycService.submitKyc(user.id, { documentType, documentNumber, documentFrontUrl, documentBackUrl, selfieUrl })
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ message: result.message, kyc: result.kyc }, result.created ? 201 : 200)
  } catch (e) { console.error('KYC submit error:', e); return c.json({ error: 'Failed to submit KYC' }, 500) }
})

// GET /api/kyc/status
router.get('/api/kyc/status', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const result = await kycService.getKycStatus(user.id)
    return c.json(result)
  } catch (e) { return c.json({ kyc: { verificationStatus: 'PENDING' } }) }
})

// POST /api/kyc/submit
router.post('/api/kyc/submit', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const body = await c.req.json()
    const result = await kycService.submitKycForm(user.id, body)
    return c.json(result)
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
    const result = await disputeService.listDisputes(user.id, limit, offset)
    return c.json(result)
  } catch (e) { return c.json({ error: 'Failed to list disputes' }, 500) }
})

// POST /api/disputes
router.post('/api/disputes', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const { bookingId, assignedTo, disputeType, description, evidence } = await c.req.json()
    const result = await disputeService.createDispute(user.id, { bookingId, assignedTo, disputeType, description, evidence })
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ message: 'Dispute created', dispute: result.dispute }, 201)
  } catch (e) { console.error('Create dispute error:', e); return c.json({ error: 'Failed to create dispute' }, 500) }
})

// PATCH /api/disputes/:id
router.patch('/api/disputes/:id', async (c) => {
  try {
    const auth = await getAuthUser(c)
    if (!auth) return c.json({ error: 'Authentication required' }, 401)
    const id = c.req.param('id')
    const body = await c.req.json()
    const result = await disputeService.updateDispute(id, auth.id, auth.roleId, body)
    if (!result.success) return c.json({ error: result.error }, result.status)
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

export const bookingRoutes = router
