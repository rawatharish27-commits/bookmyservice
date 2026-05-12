/**
 * GET /api/reviews/:id - Returns single review
 */

import { queryOne } from '../../_shared/db';
import { json, notFound } from '../../_shared/response';

interface Env {
  DB: D1Database;
  JWT_SECRET?: string;
}

export async function onRequestGet(context: { request: Request; env: Env; params: { id: string } }): Promise<Response> {
  try {
    const reviewId = context.params.id;

    const review = await queryOne(
      context.env.DB,
      `SELECT r.id, r.bookingId, r.reviewerId, r.reviewedId, r.serviceId, r.rating, r.comment,
              r.isVerified, r.isFlagged, r.flagReason, r.adminResponse, r.createdAt, r.updatedAt,
              reviewer.name as reviewerName, reviewer.profileImageUrl as reviewerProfileImage,
              reviewed.name as providerName, reviewed.profileImageUrl as providerProfileImage,
              s.title as serviceTitle
       FROM Review r
       LEFT JOIN User reviewer ON r.reviewerId = reviewer.id
       LEFT JOIN User reviewed ON r.reviewedId = reviewed.id
       LEFT JOIN Service s ON r.serviceId = s.id
       WHERE r.id = ?`,
      [reviewId]
    );

    if (!review) {
      return notFound('Review not found');
    }

    return json({ review });
  } catch (err) {
    console.error('Get review error:', err);
    return notFound('Review not found');
  }
}
