/**
 * GET /api/reviews?serviceId=X - Returns reviews for a service
 * POST /api/reviews - Client creates a review (must have completed booking)
 */

import { createSupabaseClient, Env } from '../../_shared/db';
import { requireAuth, requireRole } from '../../_shared/auth';
import { json, error, unauthorized, forbidden } from '../../_shared/response';
import { sanitizeString, sanitizeObject } from '../../_shared/security';

function generateId(): string {
  return `rev_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

export async function onRequestGet(context: { request: Request; env: Env; params: Record<string, string> }): Promise<Response> {
  try {
    const supabase = createSupabaseClient(context.env);
    const url = new URL(context.request.url);
    const serviceId = url.searchParams.get('serviceId');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);
    const offset = (page - 1) * limit;

    if (!serviceId) {
      return error('serviceId query parameter is required');
    }

    // Fetch reviews with reviewer and service info using PostgREST joins
    const { data: reviews, error: reviewsError, count } = await supabase
      .from('Review')
      .select('id,bookingId,reviewerId,reviewedId,serviceId,rating,comment,isVerified,createdAt,reviewer:User!Review_reviewerId_fkey(name,profileImageUrl),service:Service(title)', { count: 'exact' })
      .eq('serviceId', serviceId)
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1);

    if (reviewsError) {
      console.error('Get reviews error:', reviewsError);
      return error('Failed to fetch reviews', 500);
    }

    // Flatten the join results
    const flatReviews = (reviews as Record<string, unknown>[] || []).map((r) => ({
      id: r.id,
      bookingId: r.bookingId,
      reviewerId: r.reviewerId,
      reviewedId: r.reviewedId,
      serviceId: r.serviceId,
      rating: r.rating,
      comment: r.comment,
      isVerified: r.isVerified,
      createdAt: r.createdAt,
      reviewerName: (r.reviewer as Record<string, unknown>)?.name ?? null,
      reviewerProfileImage: (r.reviewer as Record<string, unknown>)?.profileImageUrl ?? null,
      serviceTitle: (r.service as Record<string, unknown>)?.title ?? null,
    }));

    const total = count || 0;

    // Calculate average rating client-side
    const { data: allRatings } = await supabase
      .from('Review')
      .select('rating')
      .eq('serviceId', serviceId);

    const ratings = (allRatings || []) as { rating: number }[];
    const avgRating = ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
      : '0.0';
    const totalReviews = ratings.length;

    return json({
      reviews: flatReviews,
      summary: {
        averageRating: avgRating,
        totalReviews,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Get reviews error:', err);
    return error('Failed to fetch reviews', 500);
  }
}

export async function onRequestPost(context: { request: Request; env: Env; params: Record<string, string> }): Promise<Response> {
  try {
    const supabase = createSupabaseClient(context.env);
    const user = await requireAuth(context.request, context.env);
    if (!user) return unauthorized();

    // Client only
    if (!requireRole(user, 'CLIENT')) {
      return forbidden('Only clients can create reviews');
    }

    const body = await context.request.json() as Record<string, unknown>;
    const sanitized = sanitizeObject(body);

    const bookingId = sanitized.bookingId as string;
    const serviceId = sanitized.serviceId as string;
    const rating = Number(sanitized.rating);
    const comment = sanitized.comment ? sanitizeString(String(sanitized.comment)) : null;

    // Validate required fields
    if (!bookingId) return error('bookingId is required');
    if (!serviceId) return error('serviceId is required');
    if (!rating) return error('rating is required');

    // Validate rating (1-5)
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return error('rating must be an integer between 1 and 5');
    }

    // Check that the booking exists and belongs to this client
    const { data: booking } = await supabase
      .from('Booking')
      .select('*')
      .eq('id', bookingId)
      .eq('clientId', user.userId)
      .maybeSingle();

    if (!booking) {
      return error('Booking not found or does not belong to you', 404);
    }

    const bookingData = booking as Record<string, unknown>;

    // Booking must be completed to review
    if (bookingData.status !== 'COMPLETED') {
      return error('You can only review completed bookings');
    }

    // Service ID must match booking
    if (bookingData.serviceId !== serviceId) {
      return error('Service ID does not match the booking');
    }

    // Check if review already exists for this booking
    const { data: existingReview } = await supabase
      .from('Review')
      .select('id')
      .eq('bookingId', bookingId)
      .maybeSingle();

    if (existingReview) {
      return error('You have already reviewed this booking');
    }

    const reviewId = generateId();
    const providerId = String(bookingData.providerId);
    const now = new Date().toISOString();

    await supabase
      .from('Review')
      .insert({
        id: reviewId,
        bookingId,
        reviewerId: user.userId,
        reviewedId: providerId,
        serviceId,
        rating,
        comment,
        isVerified: true,
        createdAt: now,
        updatedAt: now,
      });

    // Recalculate average rating for the service
    const { data: serviceReviews } = await supabase
      .from('Review')
      .select('rating')
      .eq('serviceId', serviceId);

    const svcReviews = (serviceReviews || []) as { rating: number }[];
    const newAvg = svcReviews.length > 0
      ? svcReviews.reduce((sum, r) => sum + r.rating, 0) / svcReviews.length
      : 0;

    // Update service average rating and total reviews
    await supabase
      .from('Service')
      .update({
        totalReviews: svcReviews.length,
        averageRating: Math.round(newAvg * 100) / 100,
      })
      .eq('id', serviceId);

    // Notify the provider
    const notifId = `notif_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
    await supabase
      .from('Notification')
      .insert({
        id: notifId,
        userId: providerId,
        type: 'REVIEW',
        title: 'New Review',
        message: `You received a ${rating}-star review for your service`,
        actionUrl: `/reviews/${reviewId}`,
        isRead: false,
        createdAt: now,
      });

    // Fetch the created review with reviewer name
    const { data: review } = await supabase
      .from('Review')
      .select('*,reviewer:User!Review_reviewerId_fkey(name)')
      .eq('id', reviewId)
      .maybeSingle();

    // Flatten the join result
    let flatReview = review;
    if (review) {
      const r = review as Record<string, unknown>;
      flatReview = {
        ...r,
        reviewerName: (r.reviewer as Record<string, unknown>)?.name ?? null,
      };
      delete (flatReview as Record<string, unknown>).reviewer;
    }

    return json({ review: flatReview }, 201);
  } catch (err) {
    if ((err as Error).message === 'UNAUTHORIZED') return unauthorized();
    console.error('Create review error:', err);
    return error('Failed to create review', 500);
  }
}
