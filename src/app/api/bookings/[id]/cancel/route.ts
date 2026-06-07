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

    const booking = await db.booking.findUnique({
      where: { id },
      include: { payment: true },
    });
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify the user is either the client or provider (or admin)
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
        { status: 409 }
      );
    }

    const body = await request.json();
    const { cancellationReason } = body;
    const now = new Date();

    // Build the update data
    const updateData: Record<string, unknown> = {
      status: 'CANCELLED',
      cancellationReason: cancellationReason || 'No reason provided',
      cancelledBy: user.userId,
      cancelledAt: now,
    };

    // Handle refund if payment was already made
    let refundMessage = '';
    if (booking.payment && booking.payment.status === 'SUCCESS') {
      // Mark payment for refund — actual refund processing should be handled
      // by a background job or webhook from the payment gateway
      await db.payment.update({
        where: { id: booking.payment.id },
        data: {
          status: 'REFUNDED',
          refundAmount: booking.payment.amount,
          refundReason: `Booking cancelled by ${user.role.toLowerCase()}`,
          refundedAt: now,
        },
      });

      // Update booking payment status
      updateData.paymentStatus = 'REFUNDED';

      refundMessage = ' Payment refund has been initiated.';
    }

    const updatedBooking = await db.booking.update({
      where: { id },
      data: updateData,
    });

    // Create BookingTimeline entry
    await db.bookingTimeline.create({
      data: {
        bookingId: booking.id,
        status: 'CANCELLED',
        description: `Booking cancelled by ${user.role.toLowerCase()} (${user.email}).${refundMessage}`,
        performedBy: user.userId,
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
        message: `Booking #${booking.bookingNumber} has been cancelled${refundMessage}`,
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
