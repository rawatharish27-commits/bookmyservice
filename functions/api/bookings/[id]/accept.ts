/**
 * POST /api/bookings/:id/accept - Provider accepts booking
 *   - Provider only, must be the assigned provider
 *   - Changes status to 'CONFIRMED'
 */

import { queryOne, execute } from '../../../_shared/db';
import { requireAuth, requireRole } from '../../../_shared/auth';
import { json, unauthorized, forbidden, notFound, error } from '../../../_shared/response';

interface Env {
  DB: D1Database;
  JWT_SECRET?: string;
}

export async function onRequestPost(context: { request: Request; env: Env; params: { id: string } }): Promise<Response> {
  try {
    const user = await requireAuth(context.request, context.env);
    if (!user) return unauthorized();

    // Provider only
    if (!requireRole(user, 'PROVIDER') && !requireRole(user, 'ADMIN')) {
      return forbidden('Only providers can accept bookings');
    }

    const bookingId = context.params.id;

    const booking = await queryOne(
      context.env.DB,
      `SELECT * FROM Booking WHERE id = ?`,
      [bookingId]
    );

    if (!booking) {
      return notFound('Booking not found');
    }

    const bookingData = booking as Record<string, unknown>;

    // Must be the assigned provider
    if (user.userId !== bookingData.providerId && user.role !== 'ADMIN') {
      return forbidden('You are not the assigned provider for this booking');
    }

    // Only PENDING bookings can be accepted
    if (bookingData.status !== 'PENDING') {
      return error(`Booking cannot be accepted. Current status: ${bookingData.status}`);
    }

    await execute(
      context.env.DB,
      `UPDATE Booking SET status = 'CONFIRMED', updatedAt = datetime('now') WHERE id = ?`,
      [bookingId]
    );

    // Notify the client
    const notifId = `notif_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
    await execute(
      context.env.DB,
      `INSERT INTO Notification (id, userId, type, title, message, actionUrl, createdAt)
       VALUES (?, ?, 'BOOKING', 'Booking Confirmed', ?, ?, datetime('now'))`,
      [notifId, bookingData.clientId, `Your booking has been confirmed by the provider`, `/bookings/${bookingId}`]
    );

    return json({ message: 'Booking accepted successfully', bookingId, status: 'CONFIRMED' });
  } catch (err) {
    if ((err as Error).message === 'UNAUTHORIZED') return unauthorized();
    console.error('Accept booking error:', err);
    return error('Failed to accept booking', 500);
  }
}
