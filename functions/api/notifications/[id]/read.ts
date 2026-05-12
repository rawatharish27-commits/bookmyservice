/**
 * POST /api/notifications/:id/read - Mark notification as read
 * Requires auth, must own the notification
 */

import { queryOne, execute } from '../../../_shared/db';
import { requireAuth } from '../../../_shared/auth';
import { json, unauthorized, notFound, error, forbidden } from '../../../_shared/response';
import { sanitizeString } from '../../../_shared/security';

interface EventContext {
  request: Request;
  env: { DB: D1Database; JWT_SECRET?: string };
  params: { id: string };
}

export async function onRequestPost(context: EventContext): Promise<Response> {
  let user;
  try {
    user = await requireAuth(context.request, context.env);
  } catch {
    return unauthorized();
  }

  const notificationId = sanitizeString(context.params.id);

  // Check notification exists and belongs to user
  const notification = await queryOne(
    context.env.DB,
    'SELECT id, userId, isRead FROM Notification WHERE id = ?',
    [notificationId]
  );

  if (!notification) {
    return notFound('Notification not found');
  }

  if ((notification as { userId: string }).userId !== user.userId) {
    return forbidden('You do not have access to this notification');
  }

  // Already read
  if ((notification as { isRead: number }).isRead === 1) {
    return json({ message: 'Notification already marked as read' });
  }

  await execute(
    context.env.DB,
    `UPDATE Notification SET isRead = 1, readAt = datetime('now') WHERE id = ?`,
    [notificationId]
  );

  return json({ message: 'Notification marked as read' });
}
