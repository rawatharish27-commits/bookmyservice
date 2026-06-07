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
        { error: 'Only providers can start services' },
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

    // Only ACCEPTED bookings can be started
    if (booking.status !== 'ACCEPTED') {
      return NextResponse.json(
        { error: 'Only accepted bookings can be started' },
        { status: 409 }
      );
    }

    const now = new Date();

    const updatedBooking = await db.booking.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        startedAt: now,
      },
    });

    // Create BookingTimeline entry
    await db.bookingTimeline.create({
      data: {
        bookingId: booking.id,
        status: 'IN_PROGRESS',
        description: `Service started by provider ${user.email}`,
        performedBy: user.userId,
      },
    });

    // Notify client
    await db.notification.create({
      data: {
        userId: booking.clientId,
        type: 'SERVICE_STARTED',
        title: 'Service Started',
        message: `Your service for booking #${booking.bookingNumber} has started`,
        actionUrl: `/bookings/${booking.id}`,
      },
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Booking start error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
