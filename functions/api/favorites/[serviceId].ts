import { queryOne, execute } from '../../_shared/db';
import { requireAuth } from '../../_shared/auth';
import { json, error } from '../../_shared/response';
import { Env } from '../../types';

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);
    const { serviceId } = context.params;

    const favorite = await queryOne(context.env.DB,
      'SELECT id FROM Favorite WHERE userId = ? AND serviceId = ?', [auth.userId, serviceId]
    );
    if (!favorite) return error('Favorite not found', 404);

    await execute(context.env.DB, 'DELETE FROM Favorite WHERE userId = ? AND serviceId = ?', [auth.userId, serviceId]);

    return json({ message: 'Favorite removed' });
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};
