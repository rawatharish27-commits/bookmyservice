import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { bookingId, paymentMethod } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Only client can create payment
    if (booking.clientId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (booking.status !== 'ACCEPTED' && booking.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Booking must be accepted or pending to create payment' },
        { status: 400 }
      );
    }

    // Check if payment already exists
    const existingPayment = await db.payment.findUnique({
      where: { bookingId },
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Payment already exists for this booking', payment: existingPayment },
        { status: 409 }
      );
    }

    const gatewayOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const payment = await db.payment.create({
      data: {
        bookingId,
        amount: booking.finalPrice,
        currency: 'INR',
        paymentMethod: paymentMethod || null,
        gateway: 'RAZORPAY',
        gatewayOrderId,
        status: 'CREATED',
      },
    });

    // Update booking payment status
    await db.booking.update({
      where: { id: bookingId },
      data: { paymentStatus: 'PENDING' },
    });

    return NextResponse.json({
      payment,
      orderDetails: {
        orderId: gatewayOrderId,
        amount: booking.finalPrice,
        currency: 'INR',
        bookingNumber: booking.bookingNumber,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Payment order creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
