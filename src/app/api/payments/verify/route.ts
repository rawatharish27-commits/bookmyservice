import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { paymentId, gatewayPaymentId, gatewayOrderId } = body;

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

    // Simulate payment verification (in production, verify with Razorpay/Stripe)
    const isValidPayment = true; // Simulated

    if (!isValidPayment) {
      await db.payment.update({
        where: { id: paymentId },
        data: { status: 'FAILED' },
      });
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Update payment
    const updatedPayment = await db.payment.update({
      where: { id: paymentId },
      data: {
        status: 'SUCCESS',
        gatewayPaymentId: gatewayPaymentId || `pay_${Date.now()}`,
        gatewayOrderId: gatewayOrderId || payment.gatewayOrderId,
      },
    });

    // Update booking payment status
    await db.booking.update({
      where: { id: payment.bookingId },
      data: { paymentStatus: 'PAID' },
    });

    // Notify provider
    await db.notification.create({
      data: {
        userId: booking.providerId,
        type: 'PAYMENT_RECEIVED',
        title: 'Payment Received',
        message: `Payment of ₹${payment.amount} received for booking #${booking.bookingNumber}`,
        actionUrl: `/bookings/${booking.id}`,
      },
    });

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
