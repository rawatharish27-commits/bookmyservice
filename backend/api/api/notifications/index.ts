/**
 * GET /api/notifications - Get user's notifications
 * Requires auth
 */

import { createSupabaseClient, Env } from '../../_shared/db';
import { requireAuth } from '../../_shared/auth';
import { json, unauthorized } from '../../_shared/response';

interface EventContext {
  request: Request;
  env: Env;
  params: Record<string, string>;
}

export async function onRequestGet(context: EventContext): Promise<Response> {
  let user;
  try {
    user = await requireAuth(context.request, context.env);
  } catch {
    return unauthorized();
  }

  const supabase = createSupabaseClient(context.env);
  const url = new URL(context.request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
  const unreadOnly = url.searchParams.get('unread') === 'true';

  const offset = (page - 1) * limit;

  // Build query
  let queryBuilder = supabase
    .from('Notification')
    .select('id,type,title,message,actionUrl,isRead,readAt,createdAt', { count: 'exact' })
    .eq('userId', user.userId)
    .order('createdAt', { ascending: false })
    .range(offset, offset + limit - 1);

  if (unreadOnly) {
    queryBuilder = queryBuilder.eq('isRead', false);
  }

  const { data: notifications, error: notifsError, count } = await queryBuilder;

  if (notifsError) {
    console.error('Get notifications error:', notifsError);
    return json({ notifications: [], unreadCount: 0, pagination: { page, limit, total: 0, totalPages: 0 } });
  }

  // Get unread count
  const { count: unreadCount } = await supabase
    .from('Notification')
    .select('', { count: 'exact', head: true })
    .eq('userId', user.userId)
    .eq('isRead', false);

  const total = count || 0;

  return json({
    notifications,
    unreadCount: unreadCount || 0,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
