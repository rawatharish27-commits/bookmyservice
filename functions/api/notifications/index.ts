/**
 * GET /api/notifications - Get user's notifications
 * Requires auth
 */

import { query, queryOne } from '../../_shared/db';
import { requireAuth } from '../../_shared/auth';
import { json, unauthorized } from '../../_shared/response';

interface EventContext {
  request: Request;
  env: { DB: D1Database; JWT_SECRET?: string };
  params: Record<string, string>;
}

export async function onRequestGet(context: EventContext): Promise<Response> {
  let user;
  try {
    user = await requireAuth(context.request, context.env);
  } catch {
    return unauthorized();
  }

  const url = new URL(context.request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
  const unreadOnly = url.searchParams.get('unread') === 'true';

  const conditions: string[] = ['userId = ?'];
  const params: unknown[] = [user.userId];

  if (unreadOnly) {
    conditions.push('isRead = 0');
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  // Count
  const countResult = await queryOne(
    context.env.DB,
    `SELECT COUNT(*) as count FROM Notification ${whereClause}`,
    params
  );
  const total = (countResult as { count: number } | null)?.count ?? 0;

  // Unread count
  const unreadResult = await queryOne(
    context.env.DB,
    'SELECT COUNT(*) as count FROM Notification WHERE userId = ? AND isRead = 0',
    [user.userId]
  );
  const unreadCount = (unreadResult as { count: number } | null)?.count ?? 0;

  // Fetch notifications
  const offset = (page - 1) * limit;
  const notifications = await query(
    context.env.DB,
    `SELECT id, type, title, message, actionUrl, isRead, readAt, createdAt
     FROM Notification
     ${whereClause}
     ORDER BY createdAt DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return json({
    notifications,
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
