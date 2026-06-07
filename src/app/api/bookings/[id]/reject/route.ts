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
        { error: 'Only providers can reject bookings' },
        { status: 403 }
      );
    }

    const booking = await db.booking.findUnique({ where: { id } });
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify the user is the assigned provider
    if (booking.providerId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Only PENDING bookings can be rejected
    if (booking.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Only pending bookings can be rejected' },
        { status: 409 }
      );
    }

    const body = await request.json();
    const { rejectionReason } = body;
    const now = new Date();

    const updatedBooking = await db.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancellationReason: rejectionReason || 'Rejected by provider',
        cancelledBy: user.userId,
        cancelledAt: now,
      },
    });

    // Create BookingTimeline entry
    await db.bookingTimeline.create({
      data: {
        bookingId: booking.id,
        status: 'CANCELLED',
        description: `Booking rejected by provider ${user.email}${rejectionReason ? `: ${rejectionReason}` : ''}`,
        performedBy: user.userId,
      },
    });

    // Notify client
    await db.notification.create({
      data: {
        userId: booking.clientId,
        type: 'BOOKING_REJECTED',
        title: 'Booking Rejected',
        message: `Your booking #${booking.bookingNumber} has been rejected${rejectionReason ? `: ${rejectionReason}` : ''}`,
        actionUrl: `/bookings/${booking.id}`,
      },
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Booking reject error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
