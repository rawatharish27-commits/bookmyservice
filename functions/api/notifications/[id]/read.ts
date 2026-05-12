import { queryOne, execute } from '../../../_shared/db';
import { requireAuth } from '../../../_shared/auth';
import { json, error } from '../../../_shared/response';
import { Env } from '../../../types';

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);
    const { id } = context.params;

    const notification = await queryOne(context.env.DB,
      'SELECT userId FROM Notification WHERE id = ?', [id]
    );
    if (!notification) return error('Notification not found', 404);
    if (notification.userId !== auth.userId) return error('Not authorized', 403);

    await execute(context.env.DB,
      'UPDATE Notification SET isRead = 1, readAt = datetime("now") WHERE id = ?', [id]
    );

    return json({ message: 'Notification marked as read' });
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};
