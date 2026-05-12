/**
 * GET /api/admin/logs - Audit logs
 * Requires ADMIN role
 * Returns recent activity logs
 */

import { query, queryOne } from '../../_shared/db';
import { requireAuth, requireRole } from '../../_shared/auth';
import { json, unauthorized, forbidden } from '../../_shared/response';
import { sanitizeString } from '../../_shared/security';

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

  if (!requireRole(user, 'ADMIN')) {
    return forbidden('Admin access required');
  }

  const url = new URL(context.request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10)));
  const action = url.searchParams.get('action');
  const targetType = url.searchParams.get('targetType');
  const adminId = url.searchParams.get('adminId');

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (action) {
    conditions.push('al.action = ?');
    params.push(sanitizeString(action));
  }

  if (targetType) {
    conditions.push('al.targetType = ?');
    params.push(sanitizeString(targetType));
  }

  if (adminId) {
    conditions.push('al.adminId = ?');
    params.push(sanitizeString(adminId));
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Count
  const countResult = await queryOne(
    context.env.DB,
    `SELECT COUNT(*) as count FROM AdminLog al ${whereClause}`,
    params
  );
  const total = (countResult as { count: number } | null)?.count ?? 0;

  // Fetch logs
  const offset = (page - 1) * limit;
  const logs = await query(
    context.env.DB,
    `SELECT al.id, al.action, al.targetType, al.targetId, al.details, al.ipAddress, al.userAgent, al.createdAt,
            u.name as adminName, u.email as adminEmail
     FROM AdminLog al
     JOIN User u ON al.adminId = u.id
     ${whereClause}
     ORDER BY al.createdAt DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  // Available action types for filtering
  const actionTypes = await query(
    context.env.DB,
    'SELECT DISTINCT action FROM AdminLog ORDER BY action'
  );

  // Available target types for filtering
  const targetTypes = await query(
    context.env.DB,
    'SELECT DISTINCT targetType FROM AdminLog WHERE targetType IS NOT NULL ORDER BY targetType'
  );

  return json({
    logs,
    filters: {
      actionTypes: (actionTypes as { action: string }[]).map(a => a.action),
      targetTypes: (targetTypes as { targetType: string }[]).map(t => t.targetType),
    },
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
