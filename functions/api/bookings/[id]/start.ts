import { queryOne, execute } from '../../../_shared/db';
import { requireAuth } from '../../../_shared/auth';
import { json, error } from '../../../_shared/response';
import { Env } from '../../../types';

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);
    if (auth.role !== 'PROVIDER' && auth.role !== 'ADMIN') {
      return error('Only providers can start bookings', 403);
    }

    const { id } = context.params;
    const booking = await queryOne(context.env.DB, 'SELECT id, status, providerId FROM Booking WHERE id = ?', [id]);
    if (!booking) return error('Booking not found', 404);
    if (booking.status !== 'ACCEPTED') return error('Booking must be accepted first', 400);

    if (auth.role === 'PROVIDER' && booking.providerId !== auth.userId) {
      return error('Not your booking', 403);
    }

    await execute(context.env.DB,
      'UPDATE Booking SET status = \'IN_PROGRESS\', updatedAt = datetime("now") WHERE id = ?',
      [id]
    );

    return json({ message: 'Booking started', status: 'IN_PROGRESS' });
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};
