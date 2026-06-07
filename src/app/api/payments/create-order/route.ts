import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const RAZORPAY_BASE_URL = 'https://api.razorpay.com/v1';

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

    // ── Create Razorpay order (or dev stub) ─────────────────────────
    let gatewayOrderId: string;
    let razorpayKeyId: string | null = null;

    if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
      // Real Razorpay order creation
      const amountInPaise = Math.round(booking.finalPrice * 100);
      const receipt = `rcpt_${booking.bookingNumber}`;

      const response = await fetch(`${RAZORPAY_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`,
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt,
          notes: { bookingId, bookingNumber: booking.bookingNumber },
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = (errData as any)?.error?.description || `Razorpay API error: ${response.status}`;
        console.error('Razorpay order creation failed:', errMsg);
        return NextResponse.json(
          { error: 'Failed to create payment order with gateway', details: errMsg },
          { status: 502 }
        );
      }

      const order = await response.json();
      gatewayOrderId = order.id;
      razorpayKeyId = RAZORPAY_KEY_ID;
    } else if (process.env.NODE_ENV === 'production') {
      // Production but no Razorpay credentials — cannot process payments
      return NextResponse.json(
        { error: 'Payment gateway not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.' },
        { status: 503 }
      );
    } else {
      // Dev-only stub order
      gatewayOrderId = `order_stub_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      console.warn('⚠️  [DEV] Razorpay not configured — creating stub order');
    }

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

    const orderDetails: Record<string, any> = {
      orderId: gatewayOrderId,
      amount: booking.finalPrice,
      currency: 'INR',
      bookingNumber: booking.bookingNumber,
    };

    // Include Razorpay key ID so frontend can open the checkout modal
    if (razorpayKeyId) {
      orderDetails.razorpayKeyId = razorpayKeyId;
    }

    return NextResponse.json({
      payment,
      orderDetails,
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
