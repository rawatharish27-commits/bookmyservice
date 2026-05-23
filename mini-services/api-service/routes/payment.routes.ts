// ─── routes/payment.routes.ts ──────────────────────────────────────────
// All /api/payments/* endpoints — thin handlers that delegate to payment.service
// ─────────────────────────────────────────────────────────────────────

import { Hono } from 'hono'
import { pool, getAuthUser, requireAdmin } from '../lib/shared'
import { captureApiError } from '../lib/sentry'
import * as paymentService from '../services/payment.service'

const router = new Hono()

// ============================================================
// PAYMENTS — Razorpay Payment Gateway Integration
// ============================================================

// GET /api/payments/config — Get Razorpay public key (for frontend checkout)
router.get('/api/payments/config', (c) => {
  const config = paymentService.getPaymentConfig()
  return c.json(config)
})

// POST /api/payments/create-order — Create Razorpay order for a booking (authenticated)
router.post('/api/payments/create-order', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)

    const { bookingId } = await c.req.json()
    if (!bookingId) return c.json({ error: 'bookingId is required' }, 400)

    const result = await paymentService.createPaymentOrder(pool, user.id, user.roleId, user.role, bookingId)
    if ('error' in result) {
      const status = result.error === 'Booking not found' ? 404
        : result.error === 'You can only pay for your own bookings' ? 403
        : result.error === 'Cannot pay for a cancelled booking' || result.error === 'Booking already paid' || result.error === 'Invalid booking amount' ? 400
        : 400
      return c.json({ error: result.error }, status)
    }
    return c.json(result, 201)
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
    const result = await paymentService.verifyPayment(pool, user.id, user.roleId, user.role, { razorpayOrderId, razorpayPaymentId, razorpaySignature })
    if ('error' in result) {
      const status = result.error === 'Invalid payment signature' ? 400
        : result.error === 'Payment record not found for this order' ? 404
        : result.error === 'Unauthorized' ? 403
        : 400
      return c.json({ error: result.error }, status)
    }
    return c.json(result)
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
    const result = await paymentService.capturePayment(pool, admin.id, razorpayPaymentId)
    if ('error' in result) {
      const status = result.error === 'Payment ID is required' ? 400
        : result.error === 'Payment record not found' ? 404
        : 400
      return c.json({ error: result.error }, status)
    }
    return c.json(result)
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
    const body = await c.req.json().catch(() => ({}))

    const result = await paymentService.refundPayment(pool, user.id, user.roleId, user.role, razorpayPaymentId, { amount: body.amount, notes: body.notes })
    if ('error' in result) {
      const status = result.error === 'Payment ID is required' ? 400
        : result.error === 'Payment record not found' ? 404
        : result.error === 'Only admin or the assigned provider can initiate refunds' ? 403
        : result.error === 'Refund amount cannot exceed payment amount' ? 400
        : 400
      return c.json({ error: result.error }, status)
    }
    return c.json(result)
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
    const result = await paymentService.getPaymentDetails(pool, user.id, user.roleId, user.role, paymentIdParam)
    if ('error' in result) {
      const status = result.error === 'Payment not found' ? 404
        : result.error === 'Unauthorized' ? 403
        : 400
      return c.json({ error: result.error }, status)
    }
    return c.json(result)
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
    const result = await paymentService.getBookingPayments(pool, user.id, user.roleId, user.role, bookingId)
    if ('error' in result) {
      const status = result.error === 'Booking not found' ? 404
        : result.error === 'Unauthorized' ? 403
        : 400
      return c.json({ error: result.error }, status)
    }
    return c.json(result)
  } catch (e: any) {
    console.error('Get booking payments error:', e)
    return c.json({ error: 'Failed to get booking payments' }, 500)
  }
})

// POST /api/payments/webhook — Razorpay webhook handler (no auth, signature verified)
router.post('/api/payments/webhook', async (c) => {
  try {
    const body = await c.req.text()
    const signature = c.req.header('x-razorpay-signature') || ''

    const result = await paymentService.processWebhook(pool, body, signature)
    if ('error' in result) {
      return c.json({ error: result.error }, 400)
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
