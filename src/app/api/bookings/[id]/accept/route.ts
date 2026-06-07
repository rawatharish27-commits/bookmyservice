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

    if (user.role !== 'PROVIDER' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only providers can accept bookings' },
        { status: 403 }
      );
    }

    const booking = await db.booking.findUnique({ where: { id } });
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify the user is the assigned provider for this booking
    if (booking.providerId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Only PENDING or ASSIGNED bookings can be accepted
    if (booking.status !== 'PENDING' && booking.status !== 'ASSIGNED') {
      return NextResponse.json(
        { error: 'Only pending or assigned bookings can be accepted' },
        { status: 409 }
      );
    }

    const now = new Date();

    const updatedBooking = await db.booking.update({
      where: { id },
      data: {
        status: 'ACCEPTED',
        acceptedAt: now,
      },
    });

    // Create BookingTimeline entry
    await db.bookingTimeline.create({
      data: {
        bookingId: booking.id,
        status: 'ACCEPTED',
        description: `Booking accepted by provider ${user.email}`,
        performedBy: user.userId,
      },
    });

    // Notify client
    await db.notification.create({
      data: {
        userId: booking.clientId,
        type: 'BOOKING_ACCEPTED',
        title: 'Booking Accepted',
        message: `Your booking #${booking.bookingNumber} has been accepted`,
        actionUrl: `/bookings/${booking.id}`,
      },
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Booking accept error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
