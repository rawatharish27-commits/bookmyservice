import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    if (user.role !== 'CLIENT' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only clients can submit reviews' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { bookingId, rating, comment, images } = body;

    if (!bookingId || !rating) {
      return NextResponse.json(
        { error: 'Booking ID and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Verify booking exists and is completed
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.clientId !== user.userId) {
      return NextResponse.json(
        { error: 'You can only review your own bookings' },
        { status: 403 }
      );
    }

    if (booking.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Only completed bookings can be reviewed' },
        { status: 400 }
      );
    }

    // Check if review already exists
    const existingReview = await db.review.findUnique({
      where: { bookingId },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'Review already exists for this booking' },
        { status: 409 }
      );
    }

    const review = await db.review.create({
      data: {
        bookingId,
        reviewerId: user.userId,
        reviewedId: booking.providerId,
        serviceId: booking.serviceId,
        rating,
        comment: comment || null,
        images: images ? JSON.stringify(images) : null,
        isVerified: true,
      },
    });

    // Update service rating
    const serviceReviews = await db.review.findMany({
      where: { serviceId: booking.serviceId },
    });
    const avgRating =
      serviceReviews.reduce((sum, r) => sum + r.rating, 0) / serviceReviews.length;

    await db.service.update({
      where: { id: booking.serviceId },
      data: {
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: serviceReviews.length,
      },
    });

    // Notify provider
    await db.notification.create({
      data: {
        userId: booking.providerId,
        type: 'NEW_REVIEW',
        title: 'New Review',
        message: `You received a ${rating}-star review for booking #${booking.bookingNumber}`,
        actionUrl: `/bookings/${booking.id}`,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Review creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
