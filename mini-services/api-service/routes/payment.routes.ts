// ─── routes/payment.routes.ts ──────────────────────────────────────────
// All /api/payments/* endpoints — Razorpay Payment Gateway Integration
// ─────────────────────────────────────────────────────────────────────

import { Hono } from 'hono'
import { pool, getAuthUser, requireAdmin } from '../lib/shared'
import { redis } from '../lib/redis'
import { logger } from '../lib/logger'
import {
  getRazorpayKeyId,
  getRazorpayStatus,
  createOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  capturePayment,
  refundPayment,
  getPaymentDetails,
  mapRazorpayStatus,
} from '../lib/razorpay'
import { captureApiError } from '../lib/sentry'
import { pushNotificationJob, pushBookingJob } from '../queues'

const router = new Hono()

// ============================================================
// PAYMENTS — Razorpay Payment Gateway Integration
// ============================================================

// GET /api/payments/config — Get Razorpay public key (for frontend checkout)
router.get('/api/payments/config', (c) => {
  const keyId = getRazorpayKeyId()
  const status = getRazorpayStatus()
  return c.json({
    keyId: keyId || null,
    currency: 'INR',
    stubMode: status.stubMode,
  })
})

// POST /api/payments/create-order — Create Razorpay order for a booking (authenticated)
router.post('/api/payments/create-order', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)

    const { bookingId } = await c.req.json()
    if (!bookingId) return c.json({ error: 'bookingId is required' }, 400)

    // Fetch booking to get amount and verify ownership
    const bookingResult = await pool.query(
      'SELECT id, "clientId", "finalPrice", "paymentStatus", status FROM "Booking" WHERE id = $1',
      [bookingId]
    )
    if (!bookingResult.rows[0]) return c.json({ error: 'Booking not found' }, 404)

    const booking = bookingResult.rows[0]

    // Verify the user owns this booking (or is admin)
    if (booking.clientId !== user.id && user.roleId !== 3 && user.role !== 'ADMIN') {
      return c.json({ error: 'You can only pay for your own bookings' }, 403)
    }

    // Check if booking is in a payable state
    if (booking.status === 'CANCELLED') {
      return c.json({ error: 'Cannot pay for a cancelled booking' }, 400)
    }

    if (booking.paymentStatus === 'PAID' || booking.paymentStatus === 'CAPTURED') {
      return c.json({ error: 'Booking already paid' }, 400)
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
        return c.json({ message: 'Pending order exists', payment: existing, order: cachedOrder })
      }
    }

    const amount = parseFloat(booking.finalPrice) || 0
    if (amount <= 0) {
      return c.json({ error: 'Invalid booking amount' }, 400)
    }

    // Create Razorpay order
    const order = await createOrder({
      amount,
      currency: 'INR',
      receipt: bookingId,
      notes: {
        bookingId,
        userId: user.id,
      },
    })

    // Create payment record in database
    const paymentId = 'pay_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query(
      `INSERT INTO "Payment" (id, "orderId", "bookingId", "userId", amount, currency, status, metadata, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', $7, NOW(), NOW())`,
      [paymentId, order.id, bookingId, user.id, amount, 'INR', JSON.stringify({ razorpayOrderStatus: order.status })]
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

    logger.info('Payment order created', { paymentId, orderId: order.id, bookingId, amount, userId: user.id })

    return c.json({
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
    }, 201)
  } catch (e: any) {
    console.error('Create payment order error:', e)
    captureApiError(e, { method: 'POST', path: '/api/payments/create-order' })
    return c.json({ error: 'Failed to create payment order', detail: process.env.NODE_ENV === 'production' ? undefined : e.message }, 500)
  }
})

// POST /api/payments/verify — Verify payment signature after Razorpay checkout (authenticated)
router.post('/api/payments/verify', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = await c.req.json()
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return c.json({ error: 'razorpayOrderId, razorpayPaymentId, and razorpaySignature are required' }, 400)
    }

    // Verify the payment signature
    const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)
    if (!isValid) {
      logger.warn('Payment signature verification failed', { razorpayOrderId, razorpayPaymentId, userId: user.id })
      return c.json({ error: 'Invalid payment signature' }, 400)
    }

    // Find the payment record by orderId
    const paymentResult = await pool.query(
      'SELECT * FROM "Payment" WHERE "orderId" = $1',
      [razorpayOrderId]
    )
    if (!paymentResult.rows[0]) {
      return c.json({ error: 'Payment record not found for this order' }, 404)
    }

    const payment = paymentResult.rows[0]

    // Verify the user owns this payment
    if (payment.userId !== user.id && user.roleId !== 3 && user.role !== 'ADMIN') {
      return c.json({ error: 'Unauthorized' }, 403)
    }

    // Update payment record with Razorpay payment ID and signature
    await pool.query(
      `UPDATE "Payment" SET "paymentId" = $1, signature = $2, status = 'AUTHORIZED', "updatedAt" = NOW() WHERE id = $3`,
      [razorpayPaymentId, razorpaySignature, payment.id]
    )

    // Update booking payment status
    await pool.query(
      `UPDATE "Booking" SET "paymentStatus" = 'PAID', "updatedAt" = NOW() WHERE id = $1`,
      [payment.bookingId]
    )

    // Invalidate caches
    await redis.del(`payment:status:${payment.id}`).catch(() => {})
    await redis.del(`payment:order:${razorpayOrderId}`).catch(() => {})
    await redis.delByPattern('cache:stats:*').catch(() => {})
    await redis.del('cache:admin:analytics:dashboard').catch(() => {})

    // Push booking confirmation notification (non-blocking)
    pushNotificationJob({
      type: 'PUSH',
      recipient: { userId: user.id },
      template: 'booking_confirmed',
      data: { bookingId: payment.bookingId, amount: String(payment.amount) },
      priority: 2,
    }).catch(() => {})

    // Push booking processing job (non-blocking)
    pushBookingJob({
      type: 'BOOKING_CONFIRMATION',
      bookingId: payment.bookingId,
      data: { clientEmail: user.email, paymentId: razorpayPaymentId },
      priority: 2,
    }).catch(() => {})

    logger.info('Payment verified successfully', { paymentId: payment.id, razorpayPaymentId, bookingId: payment.bookingId, userId: user.id })

    return c.json({
      message: 'Payment verified successfully',
      payment: {
        id: payment.id,
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        bookingId: payment.bookingId,
        amount: payment.amount,
        status: 'AUTHORIZED',
      },
    })
  } catch (e: any) {
    console.error('Payment verification error:', e)
    captureApiError(e, { method: 'POST', path: '/api/payments/verify' })
    return c.json({ error: 'Payment verification failed', detail: process.env.NODE_ENV === 'production' ? undefined : e.message }, 500)
  }
})

// POST /api/payments/capture/:paymentId — Capture an authorized payment (admin only)
router.post('/api/payments/capture/:paymentId', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)

    const razorpayPaymentId = c.req.param('paymentId')
    if (!razorpayPaymentId) return c.json({ error: 'Payment ID is required' }, 400)

    // Find payment record by Razorpay payment ID
    const paymentResult = await pool.query(
      'SELECT * FROM "Payment" WHERE "paymentId" = $1',
      [razorpayPaymentId]
    )
    if (!paymentResult.rows[0]) {
      return c.json({ error: 'Payment record not found' }, 404)
    }

    const payment = paymentResult.rows[0]

    if (payment.status !== 'AUTHORIZED') {
      return c.json({ error: `Payment cannot be captured. Current status: ${payment.status}` }, 400)
    }

    // Capture the payment via Razorpay API
    const capturedPayment = await capturePayment({
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

    logger.info('Payment captured', { paymentId: payment.id, razorpayPaymentId, bookingId: payment.bookingId, adminId: admin.id })

    return c.json({
      message: 'Payment captured successfully',
      payment: {
        id: payment.id,
        paymentId: razorpayPaymentId,
        bookingId: payment.bookingId,
        amount: payment.amount,
        status: 'CAPTURED',
        method: capturedPayment.method,
      },
    })
  } catch (e: any) {
    console.error('Payment capture error:', e)
    captureApiError(e, { method: 'POST', path: '/api/payments/capture' })
    return c.json({ error: 'Failed to capture payment', detail: process.env.NODE_ENV === 'production' ? undefined : e.message }, 500)
  }
})

// POST /api/payments/refund/:paymentId — Initiate refund (admin/provider)
router.post('/api/payments/refund/:paymentId', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)

    const razorpayPaymentId = c.req.param('paymentId')
    if (!razorpayPaymentId) return c.json({ error: 'Payment ID is required' }, 400)

    // Find payment record
    const paymentResult = await pool.query(
      'SELECT p.*, b."providerId" FROM "Payment" p JOIN "Booking" b ON p."bookingId" = b.id WHERE p."paymentId" = $1',
      [razorpayPaymentId]
    )
    if (!paymentResult.rows[0]) {
      return c.json({ error: 'Payment record not found' }, 404)
    }

    const payment = paymentResult.rows[0]

    // Only admin or the booking's provider can initiate refund
    const isAdmin = user.roleId === 3 || user.role === 'ADMIN' || user.roleId === 7 || user.role === 'SUB_ADMIN'
    const isProvider = payment.providerId === user.id
    if (!isAdmin && !isProvider) {
      return c.json({ error: 'Only admin or the assigned provider can initiate refunds' }, 403)
    }

    if (payment.status !== 'CAPTURED' && payment.status !== 'AUTHORIZED') {
      return c.json({ error: `Refund not allowed for payment with status: ${payment.status}` }, 400)
    }

    const body = await c.req.json().catch(() => ({}))
    const refundAmount = body.amount ? parseFloat(body.amount) : undefined
    const refundNotes = body.notes || { reason: 'Refund initiated by ' + user.role }

    // Validate partial refund amount
    if (refundAmount && refundAmount > parseFloat(payment.amount)) {
      return c.json({ error: 'Refund amount cannot exceed payment amount' }, 400)
    }

    // Initiate refund via Razorpay API
    const refundResult = await refundPayment({
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
        JSON.stringify({ refundId: refundResult.id, refundCreatedAt: new Date().toISOString(), refundInitiatedBy: user.id }),
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

    logger.info('Refund initiated', { paymentId: payment.id, refundId: refundResult.id, amount: refundAmountStored, bookingId: payment.bookingId, userId: user.id })

    return c.json({
      message: 'Refund initiated successfully',
      refund: {
        id: refundResult.id,
        paymentId: razorpayPaymentId,
        amount: refundAmountStored,
        status: refundResult.status,
        bookingId: payment.bookingId,
      },
    })
  } catch (e: any) {
    console.error('Payment refund error:', e)
    captureApiError(e, { method: 'POST', path: '/api/payments/refund' })
    return c.json({ error: 'Failed to initiate refund', detail: process.env.NODE_ENV === 'production' ? undefined : e.message }, 500)
  }
})

// GET /api/payments/:paymentId — Get payment details (authenticated)
router.get('/api/payments/:paymentId', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)

    const paymentIdParam = c.req.param('paymentId')

    // Try to find by internal ID or Razorpay payment ID
    const paymentResult = await pool.query(
      'SELECT * FROM "Payment" WHERE id = $1 OR "paymentId" = $1',
      [paymentIdParam]
    )
    if (!paymentResult.rows[0]) {
      return c.json({ error: 'Payment not found' }, 404)
    }

    const payment = paymentResult.rows[0]

    // Verify access: user must own the payment, be admin, or be the booking's provider
    const isAdmin = user.roleId === 3 || user.role === 'ADMIN' || user.roleId === 7 || user.role === 'SUB_ADMIN'
    if (payment.userId !== user.id && !isAdmin) {
      // Check if user is the provider for this booking
      const bookingResult = await pool.query(
        'SELECT "providerId" FROM "Booking" WHERE id = $1',
        [payment.bookingId]
      )
      if (!bookingResult.rows[0] || bookingResult.rows[0].providerId !== user.id) {
        return c.json({ error: 'Unauthorized' }, 403)
      }
    }

    // Try cache first
    const cacheKey = `payment:status:${payment.id}`
    const cached = await redis.getJson<any>(cacheKey)

    // Optionally fetch fresh details from Razorpay
    let razorpayDetails: any = null
    if (payment.paymentId && !getRazorpayStatus().stubMode) {
      try {
        razorpayDetails = await getPaymentDetails(payment.paymentId)
      } catch (e) {
        // Non-fatal — just return DB data
        console.warn('Failed to fetch Razorpay payment details:', (e as Error).message)
      }
    }

    return c.json({
      payment: payment,
      cached: cached,
      razorpay: razorpayDetails,
    })
  } catch (e: any) {
    console.error('Get payment details error:', e)
    return c.json({ error: 'Failed to get payment details' }, 500)
  }
})

// GET /api/payments/booking/:bookingId — Get payment for a specific booking (authenticated)
router.get('/api/payments/booking/:bookingId', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)

    const bookingId = c.req.param('bookingId')

    // Verify the user has access to this booking
    const bookingResult = await pool.query(
      'SELECT "clientId", "providerId" FROM "Booking" WHERE id = $1',
      [bookingId]
    )
    if (!bookingResult.rows[0]) {
      return c.json({ error: 'Booking not found' }, 404)
    }

    const isAdmin = user.roleId === 3 || user.role === 'ADMIN' || user.roleId === 7 || user.role === 'SUB_ADMIN'
    if (bookingResult.rows[0].clientId !== user.id && bookingResult.rows[0].providerId !== user.id && !isAdmin) {
      return c.json({ error: 'Unauthorized' }, 403)
    }

    // Get all payments for this booking
    const paymentsResult = await pool.query(
      'SELECT * FROM "Payment" WHERE "bookingId" = $1 ORDER BY "createdAt" DESC',
      [bookingId]
    )

    return c.json({
      bookingId,
      payments: paymentsResult.rows,
      total: paymentsResult.rows.length,
    })
  } catch (e: any) {
    console.error('Get booking payments error:', e)
    return c.json({ error: 'Failed to get booking payments' }, 500)
  }
})

// POST /api/payments/webhook — Razorpay webhook handler (no auth, signature verified)
router.post('/api/payments/webhook', async (c) => {
  try {
    const body = await c.req.text()
    const signature = c.req.header('x-razorpay-signature')

    if (!signature) {
      logger.warn('Webhook received without signature')
      return c.json({ error: 'Missing signature' }, 400)
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature)
    if (!isValid) {
      logger.warn('Webhook signature verification failed')
      return c.json({ error: 'Invalid signature' }, 400)
    }

    const event = JSON.parse(body)
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

    // Always return 200 to Razorpay to acknowledge receipt
    return c.json({ received: true })
  } catch (e: any) {
    console.error('Webhook processing error:', e)
    captureApiError(e, { method: 'POST', path: '/api/payments/webhook' })
    // Still return 200 to prevent Razorpay from retrying
    return c.json({ received: true, error: 'Processing failed' })
  }
})

export const paymentRoutes = router
