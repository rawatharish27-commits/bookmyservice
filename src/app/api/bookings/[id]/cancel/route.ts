import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    const booking = await db.booking.findUnique({ where: { id } });
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Both client and provider can cancel
    if (
      booking.clientId !== user.userId &&
      booking.providerId !== user.userId &&
      user.role !== 'ADMIN'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Only PENDING and ACCEPTED bookings can be cancelled
    if (!['PENDING', 'ACCEPTED'].includes(booking.status)) {
      return NextResponse.json(
        { error: 'Only pending or accepted bookings can be cancelled' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { cancellationReason } = body;

    const updatedBooking = await db.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancellationReason: cancellationReason || 'No reason provided',
        cancelledBy: user.userId,
        cancelledAt: new Date(),
      },
    });

    // Notify the other party
    const notifyUserId =
      user.userId === booking.clientId ? booking.providerId : booking.clientId;
    await db.notification.create({
      data: {
        userId: notifyUserId,
        type: 'BOOKING_CANCELLED',
        title: 'Booking Cancelled',
        message: `Booking #${booking.bookingNumber} has been cancelled`,
        actionUrl: `/bookings/${booking.id}`,
      },
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Booking cancel error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
