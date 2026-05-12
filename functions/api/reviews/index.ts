/**
 * GET /api/reviews?serviceId=X - Returns reviews for a service
 * POST /api/reviews - Client creates a review (must have completed booking)
 */

import { query, queryOne, execute } from '../../_shared/db';
import { requireAuth, requireRole } from '../../_shared/auth';
import { json, error, unauthorized, forbidden } from '../../_shared/response';
import { sanitizeString, sanitizeObject } from '../../_shared/security';

interface Env {
  DB: D1Database;
  JWT_SECRET?: string;
}

function generateId(): string {
  return `rev_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

export async function onRequestGet(context: { request: Request; env: Env; params: Record<string, string> }): Promise<Response> {
  try {
    const url = new URL(context.request.url);
    const serviceId = url.searchParams.get('serviceId');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);
    const offset = (page - 1) * limit;

    if (!serviceId) {
      return error('serviceId query parameter is required');
    }

    const countResult = await queryOne(
      context.env.DB,
      `SELECT COUNT(*) as total FROM Review WHERE serviceId = ?`,
      [serviceId]
    );

    const reviews = await query(
      context.env.DB,
      `SELECT r.id, r.bookingId, r.reviewerId, r.reviewedId, r.serviceId, r.rating, r.comment,
              r.isVerified, r.createdAt,
              u.name as reviewerName, u.profileImageUrl as reviewerProfileImage,
              s.title as serviceTitle
       FROM Review r
       LEFT JOIN User u ON r.reviewerId = u.id
       LEFT JOIN Service s ON r.serviceId = s.id
       WHERE r.serviceId = ?
       ORDER BY r.createdAt DESC
       LIMIT ? OFFSET ?`,
      [serviceId, limit, offset]
    );

    const total = (countResult as Record<string, unknown>)?.total || 0;

    // Get average rating for the service
    const avgResult = await queryOne(
      context.env.DB,
      `SELECT AVG(rating) as avgRating, COUNT(*) as totalReviews FROM Review WHERE serviceId = ?`,
      [serviceId]
    );

    return json({
      reviews,
      summary: {
        averageRating: Number((avgResult as Record<string, unknown>)?.avgRating || 0).toFixed(1),
        totalReviews: (avgResult as Record<string, unknown>)?.totalReviews || 0,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(Number(total) / limit),
      },
    });
  } catch (err) {
    console.error('Get reviews error:', err);
    return error('Failed to fetch reviews', 500);
  }
}

export async function onRequestPost(context: { request: Request; env: Env; params: Record<string, string> }): Promise<Response> {
  try {
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
    const booking = await queryOne(
      context.env.DB,
      `SELECT * FROM Booking WHERE id = ? AND clientId = ?`,
      [bookingId, user.userId]
    );

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
    const existingReview = await queryOne(
      context.env.DB,
      `SELECT id FROM Review WHERE bookingId = ?`,
      [bookingId]
    );

    if (existingReview) {
      return error('You have already reviewed this booking');
    }

    const reviewId = generateId();
    const providerId = String(bookingData.providerId);

    await execute(
      context.env.DB,
      `INSERT INTO Review (id, bookingId, reviewerId, reviewedId, serviceId, rating, comment, isVerified, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))`,
      [reviewId, bookingId, user.userId, providerId, serviceId, rating, comment]
    );

    // Update service average rating and total reviews
    await execute(
      context.env.DB,
      `UPDATE Service SET
        totalReviews = totalReviews + 1,
        averageRating = (SELECT AVG(rating) FROM Review WHERE serviceId = ?)
       WHERE id = ?`,
      [serviceId, serviceId]
    );

    // Notify the provider
    const notifId = `notif_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
    await execute(
      context.env.DB,
      `INSERT INTO Notification (id, userId, type, title, message, actionUrl, createdAt)
       VALUES (?, ?, 'REVIEW', 'New Review', ?, ?, datetime('now'))`,
      [notifId, providerId, `You received a ${rating}-star review for your service`, `/reviews/${reviewId}`]
    );

    // Fetch the created review
    const review = await queryOne(
      context.env.DB,
      `SELECT r.*, u.name as reviewerName FROM Review r LEFT JOIN User u ON r.reviewerId = u.id WHERE r.id = ?`,
      [reviewId]
    );

    return json({ review }, 201);
  } catch (err) {
    if ((err as Error).message === 'UNAUTHORIZED') return unauthorized();
    console.error('Create review error:', err);
    return error('Failed to create review', 500);
  }
}
