/**
 * GET /api/bookings/:id - Returns booking details
 *   - Only accessible if user is the client, provider, or admin
 */

import { queryOne } from '../../_shared/db';
import { requireAuth } from '../../_shared/auth';
import { json, unauthorized, forbidden, notFound } from '../../_shared/response';

interface Env {
  DB: D1Database;
  JWT_SECRET?: string;
}

export async function onRequestGet(context: { request: Request; env: Env; params: { id: string } }): Promise<Response> {
  try {
    const user = await requireAuth(context.request, context.env);
    if (!user) return unauthorized();

    const bookingId = context.params.id;

    const booking = await queryOne(
      context.env.DB,
      `SELECT b.*,
              s.title as serviceTitle, s.description as serviceDescription,
              s.basePrice as serviceBasePrice, s.images as serviceImages,
              s.serviceDurationMinutes,
              sc.name as categoryName, sc.icon as categoryIcon,
              c.name as clientName, c.email as clientEmail, c.phone as clientPhone,
              c.profileImageUrl as clientProfileImage,
              p.name as providerName, p.email as providerEmail, p.phone as providerPhone,
              p.profileImageUrl as providerProfileImage
       FROM Booking b
       LEFT JOIN Service s ON b.serviceId = s.id
       LEFT JOIN ServiceCategory sc ON s.categoryId = sc.id
       LEFT JOIN User c ON b.clientId = c.id
       LEFT JOIN User p ON b.providerId = p.id
       WHERE b.id = ?`,
      [bookingId]
    );

    if (!booking) {
      return notFound('Booking not found');
    }

    const bookingData = booking as Record<string, unknown>;

    // Check access: client, provider, or admin only
    if (
      user.role !== 'ADMIN' &&
      user.userId !== bookingData.clientId &&
      user.userId !== bookingData.providerId
    ) {
      return forbidden('You do not have access to this booking');
    }

    // Also fetch any reviews for this booking
    const review = await queryOne(
      context.env.DB,
      `SELECT r.id, r.rating, r.comment, r.createdAt FROM Review r WHERE r.bookingId = ?`,
      [bookingId]
    );

    return json({
      ...bookingData,
      review: review || null,
    });
  } catch (err) {
    if ((err as Error).message === 'UNAUTHORIZED') return unauthorized();
    console.error('Get booking error:', err);
    return notFound('Booking not found');
  }
}
