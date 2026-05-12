/**
 * GET /api/reviews/:id - Returns single review
 */

import { createSupabaseClient, Env } from '../../_shared/db';
import { json, notFound } from '../../_shared/response';

export async function onRequestGet(context: { request: Request; env: Env; params: { id: string } }): Promise<Response> {
  try {
    const supabase = createSupabaseClient(context.env);
    const reviewId = context.params.id;

    const { data: review, error: reviewError } = await supabase
      .from('Review')
      .select('id,bookingId,reviewerId,reviewedId,serviceId,rating,comment,isVerified,isFlagged,flagReason,adminResponse,createdAt,updatedAt,reviewer:User!Review_reviewerId_fkey(name,profileImageUrl),reviewed:User!Review_reviewedId_fkey(name,profileImageUrl),service:Service(title)')
      .eq('id', reviewId)
      .maybeSingle();

    if (reviewError) {
      console.error('Get review error:', reviewError);
      return notFound('Review not found');
    }

    if (!review) {
      return notFound('Review not found');
    }

    // Flatten the join results
    const r = review as Record<string, unknown>;
    const flatReview = {
      id: r.id,
      bookingId: r.bookingId,
      reviewerId: r.reviewerId,
      reviewedId: r.reviewedId,
      serviceId: r.serviceId,
      rating: r.rating,
      comment: r.comment,
      isVerified: r.isVerified,
      isFlagged: r.isFlagged,
      flagReason: r.flagReason,
      adminResponse: r.adminResponse,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      reviewerName: (r.reviewer as Record<string, unknown>)?.name ?? null,
      reviewerProfileImage: (r.reviewer as Record<string, unknown>)?.profileImageUrl ?? null,
      providerName: (r.reviewed as Record<string, unknown>)?.name ?? null,
      providerProfileImage: (r.reviewed as Record<string, unknown>)?.profileImageUrl ?? null,
      serviceTitle: (r.service as Record<string, unknown>)?.title ?? null,
    };

    return json({ review: flatReview });
  } catch (err) {
    console.error('Get review error:', err);
    return notFound('Review not found');
  }
}
