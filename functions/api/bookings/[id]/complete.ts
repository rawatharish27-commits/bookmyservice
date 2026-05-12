/**
 * POST /api/bookings/:id/complete - Provider completes the service
 *   - Provider only
 *   - Changes status to 'COMPLETED', sets completedAt
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
      return forbidden('Only providers can complete bookings');
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

    // Only IN_PROGRESS bookings can be completed
    if (bookingData.status !== 'IN_PROGRESS') {
      return error(`Booking cannot be completed. Current status: ${bookingData.status}`);
    }

    await execute(
      context.env.DB,
      `UPDATE Booking SET status = 'COMPLETED', completedAt = datetime('now'), updatedAt = datetime('now') WHERE id = ?`,
      [bookingId]
    );

    // Update service total bookings count
    await execute(
      context.env.DB,
      `UPDATE Service SET totalBookings = totalBookings + 1 WHERE id = ?`,
      [bookingData.serviceId]
    );

    // Notify the client
    const notifId = `notif_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
    await execute(
      context.env.DB,
      `INSERT INTO Notification (id, userId, type, title, message, actionUrl, createdAt)
       VALUES (?, ?, 'BOOKING', 'Service Completed', ?, ?, datetime('now'))`,
      [notifId, bookingData.clientId, `Your service has been completed. Please leave a review!`, `/bookings/${bookingId}`]
    );

    return json({ message: 'Booking completed successfully', bookingId, status: 'COMPLETED' });
  } catch (err) {
    if ((err as Error).message === 'UNAUTHORIZED') return unauthorized();
    console.error('Complete booking error:', err);
    return error('Failed to complete booking', 500);
  }
}
