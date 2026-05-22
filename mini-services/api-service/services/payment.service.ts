// ─── services/payment.service.ts ──────────────────────────────────────────
// Pure business logic extracted from routes/payment.routes.ts
// All functions accept dependencies as parameters and return data objects
// (not HTTP responses). HTTP concerns remain in the route file.
// ─────────────────────────────────────────────────────────────────────

import { Pool } from 'pg'
import { redis } from '../lib/redis'
import { logger } from '../lib/logger'
import {
  getRazorpayKeyId,
  getRazorpayStatus,
  createOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  capturePayment as razorpayCapturePayment,
  refundPayment as razorpayRefundPayment,
  getPaymentDetails as razorpayGetPaymentDetails,
  mapRazorpayStatus,
} from '../lib/razorpay'
import { pushNotificationJob, pushBookingJob } from '../queues'

// ─── Types ─────────────────────────────────────────────────────────────

export interface CreatePaymentOrderResult {
  message: string
  payment: {
    id: string
    orderId: string
    amount: number
    currency: string
    status: string
  }
  order: {
    id: string
    amount: number
    currency: string
    receipt: string
  }
}

export interface VerifyPaymentResult {
  message: string
  payment: {
    id: string
    orderId: string
    paymentId: string
    bookingId: string
    amount: any
    status: string
  }
}

export interface CapturePaymentResult {
  message: string
  payment: {
    id: string
    paymentId: string
    bookingId: string
    amount: any
    status: string
    method: string | null
  }
}

export interface RefundPaymentResult {
  message: string
  refund: {
    id: string
    paymentId: string
    amount: number
    status: string
    bookingId: string
  }
}

export interface PaymentDetailsResult {
  payment: any
  cached: any
  razorpay: any
}

export interface BookingPaymentsResult {
  bookingId: string
  payments: any[]
  total: number
}

export interface WebhookProcessResult {
  received: boolean
  error?: string
}

export interface PaymentConfigResult {
  keyId: string | null
  currency: string
  stubMode: boolean
}

// ─── Get Payment Config ────────────────────────────────────────────────

export function getPaymentConfig(): PaymentConfigResult {
  const keyId = getRazorpayKeyId()
  const status = getRazorpayStatus()
  return {
    keyId: keyId || null,
    currency: 'INR',
    stubMode: status.stubMode,
  }
}

// ─── Create Payment Order ──────────────────────────────────────────────

export async function createPaymentOrder(
  pool: Pool,
  userId: string,
  roleId: number,
  role: string,
  bookingId: string
): Promise<CreatePaymentOrderResult | { error: string }> {
  // Fetch booking to get amount and verify ownership
  const bookingResult = await pool.query(
    'SELECT id, "clientId", "finalPrice", "paymentStatus", status FROM "Booking" WHERE id = $1',
    [bookingId]
  )
  if (!bookingResult.rows[0]) return { error: 'Booking not found' }

  const booking = bookingResult.rows[0]

  // Verify the user owns this booking (or is admin)
  if (booking.clientId !== userId && roleId !== 3 && role !== 'ADMIN') {
    return { error: 'You can only pay for your own bookings' }
  }

  // Check if booking is in a payable state
  if (booking.status === 'CANCELLED') {
    return { error: 'Cannot pay for a cancelled booking' }
  }

  if (booking.paymentStatus === 'PAID' || booking.paymentStatus === 'CAPTURED') {
    return { error: 'Booking already paid' }
  }

  // Check if a pending payment already exists for this booking
  const existingPayment = await pool.query(
    'SELECT id, "orderId", status FROM "Payment" WHERE "bookingId" = $1 AND status IN (\'PENDING\', \'AUTHORIZED\') ORDER BY "createdAt" DESC LIMIT 1',
    [bookingId]
  )
  if (existingPayment.rows.length > 0) {
    const existing = existingPayment.rows[0]
    // Return existing order instead of creating a new one
    const cachedOrder = await redis.getJson<any>(`payment:order:${existing.orderId}`)
    if (cachedOrder) {
      return { message: 'Pending order exists', payment: existing, order: cachedOrder } as any
    }
  }

  const amount = parseFloat(booking.finalPrice) || 0
  if (amount <= 0) {
    return { error: 'Invalid booking amount' }
  }

  // Create Razorpay order
  const order = await createOrder({
    amount,
    currency: 'INR',
    receipt: bookingId,
    notes: {
      bookingId,
      userId,
    },
  })

  // Create payment record in database
  const paymentId = 'pay_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
  await pool.query(
    `INSERT INTO "Payment" (id, "orderId", "bookingId", "userId", amount, currency, status, metadata, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', $7, NOW(), NOW())`,
    [paymentId, order.id, bookingId, userId, amount, 'INR', JSON.stringify({ razorpayOrderStatus: order.status })]
  )

  // Cache the order details for quick retrieval
  await redis.setJson(`payment:order:${order.id}`, {
    id: order.id,
    amount: order.amount,
    currency: order.currency,
    receipt: order.receipt,
  }, 600_000) // 10 min TTL

  // Cache payment status
  await redis.setJson(`payment:status:${paymentId}`, { status: 'PENDING', orderId: order.id }, 600_000)

  logger.info('Payment order created', { paymentId, orderId: order.id, bookingId, amount, userId })

  return {
    message: 'Payment order created',
    payment: {
      id: paymentId,
      orderId: order.id,
      amount,
      currency: 'INR',
      status: 'PENDING',
    },
    order: {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    },
  }
}

// ─── Verify Payment ────────────────────────────────────────────────────

export async function verifyPayment(
  pool: Pool,
  userId: string,
  roleId: number,
  role: string,
  data: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }
): Promise<VerifyPaymentResult | { error: string }> {
  if (!data.razorpayOrderId || !data.razorpayPaymentId || !data.razorpaySignature) {
    return { error: 'razorpayOrderId, razorpayPaymentId, and razorpaySignature are required' }
  }

  // Verify the payment signature
  const isValid = verifyPaymentSignature(data.razorpayOrderId, data.razorpayPaymentId, data.razorpaySignature)
  if (!isValid) {
    logger.warn('Payment signature verification failed', { razorpayOrderId: data.razorpayOrderId, razorpayPaymentId: data.razorpayPaymentId, userId })
    return { error: 'Invalid payment signature' }
  }

  // Find the payment record by orderId
  const paymentResult = await pool.query(
    'SELECT * FROM "Payment" WHERE "orderId" = $1',
    [data.razorpayOrderId]
  )
  if (!paymentResult.rows[0]) {
    return { error: 'Payment record not found for this order' }
  }

  const payment = paymentResult.rows[0]

  // Verify the user owns this payment
  if (payment.userId !== userId && roleId !== 3 && role !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  // Update payment record with Razorpay payment ID and signature
  await pool.query(
    `UPDATE "Payment" SET "paymentId" = $1, signature = $2, status = 'AUTHORIZED', "updatedAt" = NOW() WHERE id = $3`,
    [data.razorpayPaymentId, data.razorpaySignature, payment.id]
  )

  // Update booking payment status
  await pool.query(
    `UPDATE "Booking" SET "paymentStatus" = 'PAID', "updatedAt" = NOW() WHERE id = $1`,
    [payment.bookingId]
  )

  // Invalidate caches
  await redis.del(`payment:status:${payment.id}`).catch(() => {})
  await redis.del(`payment:order:${data.razorpayOrderId}`).catch(() => {})
  await redis.delByPattern('cache:stats:*').catch(() => {})
  await redis.del('cache:admin:analytics:dashboard').catch(() => {})

  // Push booking confirmation notification (non-blocking)
  pushNotificationJob({
    type: 'PUSH',
    recipient: { userId },
    template: 'booking_confirmed',
    data: { bookingId: payment.bookingId, amount: String(payment.amount) },
    priority: 2,
  }).catch(() => {})

  // Push booking processing job (non-blocking)
  pushBookingJob({
    type: 'BOOKING_CONFIRMATION',
    bookingId: payment.bookingId,
    data: { clientEmail: '', paymentId: data.razorpayPaymentId },
    priority: 2,
  }).catch(() => {})

  logger.info('Payment verified successfully', { paymentId: payment.id, razorpayPaymentId: data.razorpayPaymentId, bookingId: payment.bookingId, userId })

  return {
    message: 'Payment verified successfully',
    payment: {
      id: payment.id,
      orderId: data.razorpayOrderId,
      paymentId: data.razorpayPaymentId,
      bookingId: payment.bookingId,
      amount: payment.amount,
      status: 'AUTHORIZED',
    },
  }
}

// ─── Capture Payment ───────────────────────────────────────────────────

export async function capturePayment(
  pool: Pool,
  adminId: string,
  razorpayPaymentId: string
): Promise<CapturePaymentResult | { error: string }> {
  if (!razorpayPaymentId) return { error: 'Payment ID is required' }

  // Find payment record by Razorpay payment ID
  const paymentResult = await pool.query(
    'SELECT * FROM "Payment" WHERE "paymentId" = $1',
    [razorpayPaymentId]
  )
  if (!paymentResult.rows[0]) {
    return { error: 'Payment record not found' }
  }

  const payment = paymentResult.rows[0]

  if (payment.status !== 'AUTHORIZED') {
    return { error: `Payment cannot be captured. Current status: ${payment.status}` }
  }

  // Capture the payment via Razorpay API
  const capturedPayment = await razorpayCapturePayment({
    paymentId: razorpayPaymentId,
    amount: parseFloat(payment.amount),
    currency: payment.currency || 'INR',
  })

  // Update payment record
  await pool.query(
    `UPDATE "Payment" SET status = 'CAPTURED', metadata = COALESCE(metadata, '{}') || $1, "updatedAt" = NOW() WHERE id = $2`,
    [JSON.stringify({ captureMethod: capturedPayment.method, capturedAt: new Date().toISOString() }), payment.id]
  )

  // Update booking payment status
  await pool.query(
    `UPDATE "Booking" SET "paymentStatus" = 'CAPTURED', "updatedAt" = NOW() WHERE id = $1`,
    [payment.bookingId]
  )

  // Invalidate cache
  await redis.del(`payment:status:${payment.id}`).catch(() => {})

  logger.info('Payment captured', { paymentId: payment.id, razorpayPaymentId, bookingId: payment.bookingId, adminId })

  return {
    message: 'Payment captured successfully',
    payment: {
      id: payment.id,
      paymentId: razorpayPaymentId,
      bookingId: payment.bookingId,
      amount: payment.amount,
      status: 'CAPTURED',
      method: capturedPayment.method,
    },
  }
}

// ─── Refund Payment ────────────────────────────────────────────────────

export async function refundPayment(
  pool: Pool,
  userId: string,
  roleId: number,
  role: string,
  razorpayPaymentId: string,
  data: { amount?: number; notes?: Record<string, string> }
): Promise<RefundPaymentResult | { error: string }> {
  if (!razorpayPaymentId) return { error: 'Payment ID is required' }

  // Find payment record
  const paymentResult = await pool.query(
    'SELECT p.*, b."providerId" FROM "Payment" p JOIN "Booking" b ON p."bookingId" = b.id WHERE p."paymentId" = $1',
    [razorpayPaymentId]
  )
  if (!paymentResult.rows[0]) {
    return { error: 'Payment record not found' }
  }

  const payment = paymentResult.rows[0]

  // Only admin or the booking's provider can initiate refund
  const isAdmin = roleId === 3 || role === 'ADMIN' || roleId === 7 || role === 'SUB_ADMIN'
  const isProvider = payment.providerId === userId
  if (!isAdmin && !isProvider) {
    return { error: 'Only admin or the assigned provider can initiate refunds' }
  }

  if (payment.status !== 'CAPTURED' && payment.status !== 'AUTHORIZED') {
    return { error: `Refund not allowed for payment with status: ${payment.status}` }
  }

  const refundAmount = data.amount ? parseFloat(String(data.amount)) : undefined
  const refundNotes = data.notes || { reason: 'Refund initiated by ' + role }

  // Validate partial refund amount
  if (refundAmount && refundAmount > parseFloat(payment.amount)) {
    return { error: 'Refund amount cannot exceed payment amount' }
  }

  // Initiate refund via Razorpay API
  const refundResult = await razorpayRefundPayment({
    paymentId: razorpayPaymentId,
    amount: refundAmount,
    notes: refundNotes,
    receipt: `refund_${payment.id}`,
  })

  // Update payment record with refund info
  const refundAmountStored = refundAmount || parseFloat(payment.amount)
  const newRefundAmount = parseFloat(payment.refundAmount || 0) + refundAmountStored
  const newStatus = newRefundAmount >= parseFloat(payment.amount) ? 'REFUNDED' : 'PARTIALLY_REFUNDED'

  await pool.query(
    `UPDATE "Payment" SET "refundId" = $1, "refundAmount" = $2, "refundStatus" = $3, status = CASE WHEN $4 >= amount THEN 'REFUNDED' ELSE status END, metadata = COALESCE(metadata, '{}') || $5, "updatedAt" = NOW() WHERE id = $6`,
    [
      refundResult.id,
      newRefundAmount,
      refundResult.status,
      newRefundAmount,
      JSON.stringify({ refundId: refundResult.id, refundCreatedAt: new Date().toISOString(), refundInitiatedBy: userId }),
      payment.id,
    ]
  )

  // Update booking payment status if fully refunded
  if (newRefundAmount >= parseFloat(payment.amount)) {
    await pool.query(
      `UPDATE "Booking" SET "paymentStatus" = 'REFUNDED', "updatedAt" = NOW() WHERE id = $1`,
      [payment.bookingId]
    )
  }

  // Invalidate cache
  await redis.del(`payment:status:${payment.id}`).catch(() => {})

  // Push notification to user (non-blocking)
  pushNotificationJob({
    type: 'PUSH',
    recipient: { userId: payment.userId },
    template: 'refund_initiated',
    data: { bookingId: payment.bookingId, amount: String(refundAmountStored), refundId: refundResult.id },
    priority: 2,
  }).catch(() => {})

  logger.info('Refund initiated', { paymentId: payment.id, refundId: refundResult.id, amount: refundAmountStored, bookingId: payment.bookingId, userId })

  return {
    message: 'Refund initiated successfully',
    refund: {
      id: refundResult.id,
      paymentId: razorpayPaymentId,
      amount: refundAmountStored,
      status: refundResult.status,
      bookingId: payment.bookingId,
    },
  }
}

// ─── Get Payment Details ───────────────────────────────────────────────

export async function getPaymentDetails(
  pool: Pool,
  userId: string,
  roleId: number,
  role: string,
  paymentIdParam: string
): Promise<PaymentDetailsResult | { error: string }> {
  // Try to find by internal ID or Razorpay payment ID
  const paymentResult = await pool.query(
    'SELECT * FROM "Payment" WHERE id = $1 OR "paymentId" = $1',
    [paymentIdParam]
  )
  if (!paymentResult.rows[0]) {
    return { error: 'Payment not found' }
  }

  const payment = paymentResult.rows[0]

  // Verify access: user must own the payment, be admin, or be the booking's provider
  const isAdmin = roleId === 3 || role === 'ADMIN' || roleId === 7 || role === 'SUB_ADMIN'
  if (payment.userId !== userId && !isAdmin) {
    // Check if user is the provider for this booking
    const bookingResult = await pool.query(
      'SELECT "providerId" FROM "Booking" WHERE id = $1',
      [payment.bookingId]
    )
    if (!bookingResult.rows[0] || bookingResult.rows[0].providerId !== userId) {
      return { error: 'Unauthorized' }
    }
  }

  // Try cache first
  const cacheKey = `payment:status:${payment.id}`
  const cached = await redis.getJson<any>(cacheKey)

  // Optionally fetch fresh details from Razorpay
  let razorpayDetails: any = null
  if (payment.paymentId && !getRazorpayStatus().stubMode) {
    try {
      razorpayDetails = await razorpayGetPaymentDetails(payment.paymentId)
    } catch (e) {
      // Non-fatal — just return DB data
      console.warn('Failed to fetch Razorpay payment details:', (e as Error).message)
    }
  }

  return {
    payment: payment,
    cached: cached,
    razorpay: razorpayDetails,
  }
}

// ─── Get Booking Payments ──────────────────────────────────────────────

export async function getBookingPayments(
  pool: Pool,
  userId: string,
  roleId: number,
  role: string,
  bookingId: string
): Promise<BookingPaymentsResult | { error: string }> {
  // Verify the user has access to this booking
  const bookingResult = await pool.query(
    'SELECT "clientId", "providerId" FROM "Booking" WHERE id = $1',
    [bookingId]
  )
  if (!bookingResult.rows[0]) {
    return { error: 'Booking not found' }
  }

  const isAdmin = roleId === 3 || role === 'ADMIN' || roleId === 7 || role === 'SUB_ADMIN'
  if (bookingResult.rows[0].clientId !== userId && bookingResult.rows[0].providerId !== userId && !isAdmin) {
    return { error: 'Unauthorized' }
  }

  // Get all payments for this booking
  const paymentsResult = await pool.query(
    'SELECT * FROM "Payment" WHERE "bookingId" = $1 ORDER BY "createdAt" DESC',
    [bookingId]
  )

  return {
    bookingId,
    payments: paymentsResult.rows,
    total: paymentsResult.rows.length,
  }
}

// ─── Process Webhook ───────────────────────────────────────────────────

export async function processWebhook(
  pool: Pool,
  rawBody: string,
  signature: string
): Promise<WebhookProcessResult | { error: string }> {
  if (!signature) {
    logger.warn('Webhook received without signature')
    return { error: 'Missing signature' }
  }

  // Verify webhook signature
  const isValid = verifyWebhookSignature(rawBody, signature)
  if (!isValid) {
    logger.warn('Webhook signature verification failed')
    return { error: 'Invalid signature' }
  }

  const event = JSON.parse(rawBody)
  const eventType = event.event

  logger.info('Razorpay webhook received', { event: eventType })

  // Handle different webhook events
  switch (eventType) {
    case 'payment.captured': {
      const paymentEntity = event.payload?.payment?.entity
      if (paymentEntity) {
        const razorpayOrderId = paymentEntity.order_id
        const razorpayPaymentId = paymentEntity.id
        const paymentMethod = paymentEntity.method
        const paymentStatus = mapRazorpayStatus(paymentEntity.status)

        // Find payment by order ID
        const paymentResult = await pool.query(
          'SELECT * FROM "Payment" WHERE "orderId" = $1',
          [razorpayOrderId]
        )
        if (paymentResult.rows[0]) {
          const payment = paymentResult.rows[0]

          // Update payment record
          await pool.query(
            `UPDATE "Payment" SET "paymentId" = $1, status = $2, method = $3, "updatedAt" = NOW() WHERE id = $4`,
            [razorpayPaymentId, paymentStatus, paymentMethod, payment.id]
          )

          // Update booking payment status
          await pool.query(
            `UPDATE "Booking" SET "paymentStatus" = 'CAPTURED', "updatedAt" = NOW() WHERE id = $1`,
            [payment.bookingId]
          )

          // Invalidate cache
          await redis.del(`payment:status:${payment.id}`).catch(() => {})
          await redis.del(`payment:order:${razorpayOrderId}`).catch(() => {})

          // Push notification (non-blocking)
          pushNotificationJob({
            type: 'PUSH',
            recipient: { userId: payment.userId },
            template: 'payment_captured',
            data: { bookingId: payment.bookingId, amount: String(payment.amount), method: paymentMethod },
            priority: 2,
          }).catch(() => {})

          logger.info('Payment captured via webhook', { paymentId: payment.id, razorpayPaymentId, bookingId: payment.bookingId })
        }
      }
      break
    }

    case 'payment.failed': {
      const paymentEntity = event.payload?.payment?.entity
      if (paymentEntity) {
        const razorpayOrderId = paymentEntity.order_id
        const razorpayPaymentId = paymentEntity.id
        const errorCode = paymentEntity.error_code
        const errorDescription = paymentEntity.error_description

        // Find payment by order ID
        const paymentResult = await pool.query(
          'SELECT * FROM "Payment" WHERE "orderId" = $1',
          [razorpayOrderId]
        )
        if (paymentResult.rows[0]) {
          const payment = paymentResult.rows[0]

          // Update payment record
          await pool.query(
            `UPDATE "Payment" SET "paymentId" = $1, status = 'FAILED', metadata = COALESCE(metadata, '{}') || $2, "updatedAt" = NOW() WHERE id = $3`,
            [razorpayPaymentId, JSON.stringify({ errorCode, errorDescription, failedAt: new Date().toISOString() }), payment.id]
          )

          // Update booking payment status
          await pool.query(
            `UPDATE "Booking" SET "paymentStatus" = 'FAILED', "updatedAt" = NOW() WHERE id = $1`,
            [payment.bookingId]
          )

          // Invalidate cache
          await redis.del(`payment:status:${payment.id}`).catch(() => {})

          logger.info('Payment failed via webhook', { paymentId: payment.id, razorpayPaymentId, errorCode, errorDescription })
        }
      }
      break
    }

    case 'refund.processed': {
      const refundEntity = event.payload?.refund?.entity
      if (refundEntity) {
        const razorpayPaymentId = refundEntity.payment_id
        const refundId = refundEntity.id
        const refundAmount = refundEntity.amount / 100 // Convert paise to rupees

        // Find payment by Razorpay payment ID
        const paymentResult = await pool.query(
          'SELECT * FROM "Payment" WHERE "paymentId" = $1',
          [razorpayPaymentId]
        )
        if (paymentResult.rows[0]) {
          const payment = paymentResult.rows[0]

          // Update payment record
          await pool.query(
            `UPDATE "Payment" SET "refundId" = $1, "refundAmount" = $2, "refundStatus" = 'processed', status = CASE WHEN $2 >= amount THEN 'REFUNDED' ELSE status END, "updatedAt" = NOW() WHERE id = $3`,
            [refundId, refundAmount, payment.id]
          )

          // Update booking if fully refunded
          if (refundAmount >= parseFloat(payment.amount)) {
            await pool.query(
              `UPDATE "Booking" SET "paymentStatus" = 'REFUNDED', "updatedAt" = NOW() WHERE id = $1`,
              [payment.bookingId]
            )
          }

          // Invalidate cache
          await redis.del(`payment:status:${payment.id}`).catch(() => {})

          logger.info('Refund processed via webhook', { paymentId: payment.id, refundId, refundAmount })
        }
      }
      break
    }

    default:
      logger.info('Unhandled webhook event', { event: eventType })
  }

  // Always return received: true to acknowledge
  return { received: true }
}
