/**
 * GET /api/admin/users - List all users with pagination
 * Requires ADMIN role
 * Query: page, limit, role, status, search
 */

import { query, queryOne } from '../../../_shared/db';
import { requireAuth, requireRole } from '../../../_shared/auth';
import { json, unauthorized, forbidden } from '../../../_shared/response';
import { sanitizeString } from '../../../_shared/security';

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
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
  const role = url.searchParams.get('role');
  const status = url.searchParams.get('status');
  const search = url.searchParams.get('search');

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (role) {
    conditions.push('r.name = ?');
    params.push(sanitizeString(role));
  }

  if (status) {
    conditions.push('u.status = ?');
    params.push(sanitizeString(status));
  }

  if (search) {
    const sanitizedSearch = sanitizeString(search);
    conditions.push('(u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)');
    params.push(`%${sanitizedSearch}%`, `%${sanitizedSearch}%`, `%${sanitizedSearch}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Count total
  const countResult = await queryOne(
    context.env.DB,
    `SELECT COUNT(*) as count FROM User u JOIN Role r ON u.roleId = r.id ${whereClause}`,
    params
  );
  const total = (countResult as { count: number } | null)?.count ?? 0;

  // Fetch paginated users
  const offset = (page - 1) * limit;
  const users = await query(
    context.env.DB,
    `SELECT u.id, u.email, u.phone, u.name, u.status, u.emailVerified, u.phoneVerified,
            u.profileImageUrl, u.city, u.state, u.createdAt, u.lastLoginAt,
            r.name as role, r.id as roleId
     FROM User u
     JOIN Role r ON u.roleId = r.id
     ${whereClause}
     ORDER BY u.createdAt DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return json({
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
