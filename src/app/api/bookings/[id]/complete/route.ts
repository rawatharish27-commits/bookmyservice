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
        { error: 'Only providers can complete services' },
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

    // Only IN_PROGRESS bookings can be completed
    if (booking.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'Only in-progress bookings can be completed' },
        { status: 409 }
      );
    }

    // Verify OTP if the booking has one and it hasn't been verified yet
    const body = await request.json();
    const { otpCode } = body;

    if (booking.otpCode && !booking.otpVerified) {
      if (!otpCode) {
        return NextResponse.json(
          { error: 'OTP code is required to complete this booking' },
          { status: 400 }
        );
      }
      if (otpCode !== booking.otpCode) {
        return NextResponse.json(
          { error: 'Invalid OTP code' },
          { status: 400 }
        );
      }
    }

    const now = new Date();
    const warrantyDays = booking.warrantyDays || 90;
    const warrantyExpiresAt = new Date(now);
    warrantyExpiresAt.setDate(warrantyExpiresAt.getDate() + warrantyDays);

    const updatedBooking = await db.booking.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: now,
        warrantyExpiresAt,
        otpVerified: true,
        otpVerifiedAt: now,
      },
    });

    // Update service totalBookings count
    await db.service.update({
      where: { id: booking.serviceId },
      data: {
        totalBookings: { increment: 1 },
      },
    });

    // Create BookingTimeline entry
    await db.bookingTimeline.create({
      data: {
        bookingId: booking.id,
        status: 'COMPLETED',
        description: `Service completed by provider ${user.email}. Warranty expires on ${warrantyExpiresAt.toISOString().split('T')[0]}`,
        performedBy: user.userId,
      },
    });

    // Notify client
    await db.notification.create({
      data: {
        userId: booking.clientId,
        type: 'SERVICE_COMPLETED',
        title: 'Service Completed',
        message: `Your service for booking #${booking.bookingNumber} has been completed. Please leave a review!`,
        actionUrl: `/bookings/${booking.id}`,
      },
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Booking complete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
