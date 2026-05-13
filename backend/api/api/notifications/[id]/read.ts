/**
 * POST /api/notifications/:id/read - Mark notification as read
 * Requires auth, must own the notification
 */

import { createSupabaseClient, Env } from '../../../_shared/db';
import { requireAuth } from '../../../_shared/auth';
import { json, unauthorized, notFound, forbidden } from '../../../_shared/response';
import { sanitizeString } from '../../../_shared/security';

interface EventContext {
  request: Request;
  env: Env;
  params: { id: string };
}

export async function onRequestPost(context: EventContext): Promise<Response> {
  let user;
  try {
    user = await requireAuth(context.request, context.env);
  } catch {
    return unauthorized();
  }

  const supabase = createSupabaseClient(context.env);
  const notificationId = sanitizeString(context.params.id);

  // Check notification exists and belongs to user
  const { data: notification } = await supabase
    .from('Notification')
    .select('id,userId,isRead')
    .eq('id', notificationId)
    .maybeSingle();

  if (!notification) {
    return notFound('Notification not found');
  }

  const notifData = notification as { userId: string; isRead: boolean };

  if (notifData.userId !== user.userId) {
    return forbidden('You do not have access to this notification');
  }

  // Already read
  if (notifData.isRead) {
    return json({ message: 'Notification already marked as read' });
  }

  const now = new Date().toISOString();
  await supabase
    .from('Notification')
    .update({ isRead: true, readAt: now })
    .eq('id', notificationId)
    .eq('userId', user.userId);

  return json({ message: 'Notification marked as read' });
}
