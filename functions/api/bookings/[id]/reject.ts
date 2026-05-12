/**
 * POST /api/bookings/:id/reject - Provider rejects booking
 *   - Provider only, must be the assigned provider
 *   - Requires rejectionReason
 *   - Changes status to 'REJECTED'
 */

import { queryOne, execute } from '../../../_shared/db';
import { requireAuth, requireRole } from '../../../_shared/auth';
import { json, unauthorized, forbidden, notFound, error } from '../../../_shared/response';
import { sanitizeString } from '../../../_shared/security';

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
      return forbidden('Only providers can reject bookings');
    }

    const bookingId = context.params.id;

    const body = await context.request.json() as Record<string, unknown>;
    const rejectionReason = sanitizeString(String(body.rejectionReason || ''));

    if (!rejectionReason) {
      return error('rejectionReason is required');
    }

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

    // Only PENDING bookings can be rejected
    if (bookingData.status !== 'PENDING') {
      return error(`Booking cannot be rejected. Current status: ${bookingData.status}`);
    }

    await execute(
      context.env.DB,
      `UPDATE Booking SET status = 'REJECTED', cancellationReason = ?, cancelledBy = ?, cancelledAt = datetime('now'), updatedAt = datetime('now') WHERE id = ?`,
      [rejectionReason, user.userId, bookingId]
    );

    // Notify the client
    const notifId = `notif_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
    await execute(
      context.env.DB,
      `INSERT INTO Notification (id, userId, type, title, message, actionUrl, createdAt)
       VALUES (?, ?, 'BOOKING', 'Booking Rejected', ?, ?, datetime('now'))`,
      [notifId, bookingData.clientId, `Your booking has been rejected. Reason: ${rejectionReason}`, `/bookings/${bookingId}`]
    );

    return json({ message: 'Booking rejected', bookingId, status: 'REJECTED' });
  } catch (err) {
    if ((err as Error).message === 'UNAUTHORIZED') return unauthorized();
    console.error('Reject booking error:', err);
    return error('Failed to reject booking', 500);
  }
}
