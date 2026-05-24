import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { bookingId, proposedPrice, message } = body;

    if (!bookingId || !proposedPrice) {
      return NextResponse.json(
        { error: 'Booking ID and proposed price are required' },
        { status: 400 }
      );
    }

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { service: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Both client and provider can negotiate
    if (
      booking.clientId !== user.userId &&
      booking.providerId !== user.userId &&
      user.role !== 'ADMIN'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!booking.service.priceNegotiable) {
      return NextResponse.json(
        { error: 'This service does not accept price negotiation' },
        { status: 400 }
      );
    }

    if (!['PENDING', 'ACCEPTED'].includes(booking.status)) {
      return NextResponse.json(
        { error: 'Negotiation is only allowed on pending or accepted bookings' },
        { status: 400 }
      );
    }

    const negotiation = await db.negotiation.create({
      data: {
        bookingId,
        serviceId: booking.serviceId,
        proposedBy: user.userId,
        proposedPrice: parseFloat(proposedPrice),
        message: message || null,
        status: 'PENDING',
      },
    });

    // Notify the other party
    const notifyUserId =
      user.userId === booking.clientId ? booking.providerId : booking.clientId;
    await db.notification.create({
      data: {
        userId: notifyUserId,
        type: 'NEGOTIATION_REQUEST',
        title: 'Price Negotiation',
        message: `A price negotiation of ₹${proposedPrice} has been proposed for booking #${booking.bookingNumber}`,
        actionUrl: `/bookings/${booking.id}`,
      },
    });

    return NextResponse.json(negotiation, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Negotiation creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const booking = await db.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (
      booking.clientId !== user.userId &&
      booking.providerId !== user.userId &&
      user.role !== 'ADMIN'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const negotiations = await db.negotiation.findMany({
      where: { bookingId },
      include: {
        proposer: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(negotiations);
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Negotiations fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
