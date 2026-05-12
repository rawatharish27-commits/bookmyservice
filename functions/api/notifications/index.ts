import { query, execute } from '../../_shared/db';
import { requireAuth } from '../../_shared/auth';
import { json, error } from '../../_shared/response';
import { Env } from '../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);
    const url = new URL(context.request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');

    const notifications = await query(context.env.DB, `
      SELECT * FROM Notification WHERE userId = ?
      ORDER BY createdAt DESC LIMIT ?
    `, [auth.userId, limit]);

    return json({ notifications });
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);

    // Mark all as read
    await execute(context.env.DB,
      'UPDATE Notification SET isRead = 1, readAt = datetime("now") WHERE userId = ? AND isRead = 0',
      [auth.userId]
    );

    return json({ message: 'All notifications marked as read' });
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};
