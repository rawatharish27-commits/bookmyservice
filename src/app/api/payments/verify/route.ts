import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

/**
 * Verify a Razorpay payment signature server-side.
 * Uses HMAC-SHA256 with the Razorpay key secret (same pattern as mini-services/api-service/lib/razorpay.ts).
 * Returns true ONLY if the signature is valid. Returns false if credentials are missing (dev stub mode)
 * or if the signature does not match.
 */
function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): { valid: boolean; reason?: string } {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    // In production, reject if no credentials — NEVER auto-approve
    if (process.env.NODE_ENV === 'production') {
      return { valid: false, reason: 'Razorpay not configured — cannot verify payment' };
    }
    // Dev-only stub: accept signature with a warning
    console.warn('⚠️  [DEV] Razorpay key secret not set — accepting payment without verification');
    return { valid: true };
  }

  // Razorpay signature = HMAC-SHA256(order_id + "|" + payment_id, key_secret)
  const expected = createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  try {
    const valid = timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expected, 'hex')
    );
    return valid ? { valid: true } : { valid: false, reason: 'Signature mismatch' };
  } catch {
    // Length mismatch or invalid hex — treat as invalid
    return { valid: false, reason: 'Invalid signature format' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const {
      paymentId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      gatewayPaymentId,
      gatewayOrderId,
    } = body;

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    const payment = await db.payment.findUnique({ where: { id: paymentId } });
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Verify the user owns this payment's booking
    const booking = await db.booking.findUnique({
      where: { id: payment.bookingId },
    });

    if (
      !booking ||
      (booking.clientId !== user.userId && user.role !== 'ADMIN')
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ── Real payment verification via Razorpay signature ──────────────
    // If Razorpay fields are present, verify the HMAC-SHA256 signature.
    // If Razorpay fields are missing AND we're in production, reject (503).
    // If Razorpay fields are missing AND we're in dev, fall through to stub.
    let isValidPayment = false;

    if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      // Full Razorpay checkout verification
      const result = verifyRazorpaySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );
      isValidPayment = result.valid;

      if (!isValidPayment) {
        await db.payment.update({
          where: { id: paymentId },
          data: { status: 'FAILED' },
        });
        return NextResponse.json(
          { error: 'Payment verification failed', reason: result.reason },
          { status: 400 }
        );
      }
    } else if (process.env.NODE_ENV === 'production') {
      // Production but no Razorpay signature → service unavailable
      return NextResponse.json(
        { error: 'Payment gateway not configured. Cannot verify payment.' },
        { status: 503 }
      );
    } else {
      // Dev-only stub: no Razorpay signature provided, auto-approve with warning
      console.warn(
        `⚠️  [DEV] Payment ${paymentId} auto-approved without Razorpay signature verification`
      );
      isValidPayment = true;
    }

    // Update payment
    const updatedPayment = await db.payment.update({
      where: { id: paymentId },
      data: {
        status: 'SUCCESS',
        gatewayPaymentId: razorpay_payment_id || gatewayPaymentId || `pay_${Date.now()}`,
        gatewayOrderId: razorpay_order_id || gatewayOrderId || payment.gatewayOrderId,
      },
    });

    // Update booking payment status
    await db.booking.update({
      where: { id: payment.bookingId },
      data: { paymentStatus: 'PAID' },
    });

    // Notify provider
    if (booking.providerId) {
      await db.notification.create({
        data: {
          userId: booking.providerId,
          type: 'PAYMENT_RECEIVED',
          title: 'Payment Received',
          message: `Payment of ₹${payment.amount} received for booking #${booking.bookingNumber}`,
          actionUrl: `/bookings/${booking.id}`,
        },
      });
    }

    return NextResponse.json({
      message: 'Payment verified successfully',
      payment: updatedPayment,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
