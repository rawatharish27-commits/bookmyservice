import { queryOne, execute } from '../../../_shared/db';
import { requireAuth } from '../../../_shared/auth';
import { json, error } from '../../../_shared/response';
import { Env } from '../../../types';

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);
    const { id } = context.params;

    const body = await context.request.json() as { reason?: string };
    const booking = await queryOne(context.env.DB, 'SELECT id, status, clientId, providerId FROM Booking WHERE id = ?', [id]);
    if (!booking) return error('Booking not found', 404);

    // Can only cancel PENDING or ACCEPTED bookings
    if (!['PENDING', 'ACCEPTED'].includes(booking.status)) {
      return error('Cannot cancel this booking', 400);
    }

    // Client or provider of the booking, or admin
    if (auth.role === 'CLIENT' && booking.clientId !== auth.userId) {
      return error('Not your booking', 403);
    }
    if (auth.role === 'PROVIDER' && booking.providerId !== auth.userId) {
      return error('Not your booking', 403);
    }

    await execute(context.env.DB, `
      UPDATE Booking SET status = 'CANCELLED', cancellationReason = ?, cancelledBy = ?, cancelledAt = datetime("now"), updatedAt = datetime("now") WHERE id = ?
    `, [body.reason || null, auth.userId, id]);

    return json({ message: 'Booking cancelled', status: 'CANCELLED' });
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};
