/**
 * POST /api/bookings/:id/cancel - Client cancels booking
 *   - Client only, must be the booking client
 *   - Requires cancellationReason
 *   - Changes status to 'CANCELLED'
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

    // Client only (or admin)
    if (!requireRole(user, 'CLIENT') && !requireRole(user, 'ADMIN')) {
      return forbidden('Only clients can cancel bookings');
    }

    const bookingId = context.params.id;

    const body = await context.request.json() as Record<string, unknown>;
    const cancellationReason = sanitizeString(String(body.cancellationReason || ''));

    if (!cancellationReason) {
      return error('cancellationReason is required');
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

    // Must be the booking client
    if (user.userId !== bookingData.clientId && user.role !== 'ADMIN') {
      return forbidden('You are not the client for this booking');
    }

    // Can only cancel PENDING or CONFIRMED bookings
    const cancellableStatuses = ['PENDING', 'CONFIRMED'];
    if (!cancellableStatuses.includes(bookingData.status as string)) {
      return error(`Booking cannot be cancelled. Current status: ${bookingData.status}`);
    }

    await execute(
      context.env.DB,
      `UPDATE Booking SET status = 'CANCELLED', cancellationReason = ?, cancelledBy = ?, cancelledAt = datetime('now'), updatedAt = datetime('now') WHERE id = ?`,
      [cancellationReason, user.userId, bookingId]
    );

    // Notify the provider
    const notifId = `notif_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
    await execute(
      context.env.DB,
      `INSERT INTO Notification (id, userId, type, title, message, actionUrl, createdAt)
       VALUES (?, ?, 'BOOKING', 'Booking Cancelled', ?, ?, datetime('now'))`,
      [notifId, bookingData.providerId, `A booking has been cancelled by the client. Reason: ${cancellationReason}`, `/bookings/${bookingId}`]
    );

    return json({ message: 'Booking cancelled', bookingId, status: 'CANCELLED' });
  } catch (err) {
    if ((err as Error).message === 'UNAUTHORIZED') return unauthorized();
    console.error('Cancel booking error:', err);
    return error('Failed to cancel booking', 500);
  }
}
