import { query, queryOne } from '../../_shared/db';
import { requireAuth } from '../../_shared/auth';
import { json, error } from '../../_shared/response';
import { Env } from '../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);
    if (auth.role !== 'ADMIN') return error('Admin access required', 403);

    const url = new URL(context.request.url);
    const search = url.searchParams.get('search');
    const role = url.searchParams.get('role');
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let sql = `
      SELECT u.*, r.name as roleName
      FROM User u
      JOIN Role r ON u.roleId = r.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (search) {
      conditions.push('(u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (role) {
      conditions.push('r.name = ?');
      params.push(role.toUpperCase());
    }

    if (status) {
      conditions.push('u.status = ?');
      params.push(status.toUpperCase());
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    // Count total
    let countSql = sql.replace(/SELECT u\.\*,.*FROM/, 'SELECT COUNT(*) as total FROM');
    countSql = countSql.split('ORDER BY')[0];
    const countResult = await query(context.env.DB, countSql, params);
    const total = (countResult[0] as any)?.total || 0;

    sql += ` ORDER BY u.createdAt DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const users = await query(context.env.DB, sql, params);

    const formatted = users.map((u: any) => ({
      id: u.id,
      email: u.email,
      phone: u.phone,
      name: u.name,
      role: u.roleName,
      status: u.status,
      emailVerified: u.emailVerified,
      phoneVerified: u.phoneVerified,
      profileImageUrl: u.profileImageUrl,
      city: u.city,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
    }));

    return json({ users: formatted, pagination: { total, page, limit } });
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};
