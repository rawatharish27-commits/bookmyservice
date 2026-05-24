import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const review = await db.review.findUnique({
      where: { id },
      include: {
        reviewer: { select: { id: true, name: true, profileImageUrl: true } },
        reviewed: { select: { id: true, name: true, profileImageUrl: true } },
        service: { select: { id: true, title: true } },
        booking: { select: { id: true, bookingNumber: true } },
      },
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error('Review fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    const review = await db.review.findUnique({ where: { id } });
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (review.reviewerId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You can only update your own reviews' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.rating !== undefined) {
      if (body.rating < 1 || body.rating > 5) {
        return NextResponse.json(
          { error: 'Rating must be between 1 and 5' },
          { status: 400 }
        );
      }
      updateData.rating = body.rating;
    }
    if (body.comment !== undefined) updateData.comment = body.comment;
    if (body.images !== undefined) updateData.images = JSON.stringify(body.images);

    const updatedReview = await db.review.update({
      where: { id },
      data: updateData,
    });

    // Recalculate service rating
    const serviceReviews = await db.review.findMany({
      where: { serviceId: review.serviceId },
    });
    const avgRating =
      serviceReviews.reduce((sum, r) => sum + r.rating, 0) / serviceReviews.length;

    await db.service.update({
      where: { id: review.serviceId },
      data: { averageRating: Math.round(avgRating * 10) / 10 },
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Review update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    const review = await db.review.findUnique({ where: { id } });
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (review.reviewerId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You can only delete your own reviews' },
        { status: 403 }
      );
    }

    await db.review.delete({ where: { id } });

    // Recalculate service rating
    const serviceReviews = await db.review.findMany({
      where: { serviceId: review.serviceId },
    });
    const avgRating = serviceReviews.length > 0
      ? serviceReviews.reduce((sum, r) => sum + r.rating, 0) / serviceReviews.length
      : 0;

    await db.service.update({
      where: { id: review.serviceId },
      data: {
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: { decrement: 1 },
      },
    });

    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Review delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
