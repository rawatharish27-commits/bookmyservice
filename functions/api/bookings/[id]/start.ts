/**
 * POST /api/bookings/:id/start - Provider starts the service
 *   - Provider only
 *   - Changes status to 'IN_PROGRESS'
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
      return forbidden('Only providers can start bookings');
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

    // Only CONFIRMED bookings can be started
    if (bookingData.status !== 'CONFIRMED') {
      return error(`Booking cannot be started. Current status: ${bookingData.status}`);
    }

    await execute(
      context.env.DB,
      `UPDATE Booking SET status = 'IN_PROGRESS', updatedAt = datetime('now') WHERE id = ?`,
      [bookingId]
    );

    // Notify the client
    const notifId = `notif_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
    await execute(
      context.env.DB,
      `INSERT INTO Notification (id, userId, type, title, message, actionUrl, createdAt)
       VALUES (?, ?, 'BOOKING', 'Service Started', ?, ?, datetime('now'))`,
      [notifId, bookingData.clientId, `Your service provider has started the service`, `/bookings/${bookingId}`]
    );

    return json({ message: 'Booking started successfully', bookingId, status: 'IN_PROGRESS' });
  } catch (err) {
    if ((err as Error).message === 'UNAUTHORIZED') return unauthorized();
    console.error('Start booking error:', err);
    return error('Failed to start booking', 500);
  }
}
