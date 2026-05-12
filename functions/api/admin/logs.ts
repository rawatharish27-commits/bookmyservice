import { query } from '../../_shared/db';
import { requireAuth } from '../../_shared/auth';
import { json, error } from '../../_shared/response';
import { Env } from '../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);
    if (auth.role !== 'ADMIN') return error('Admin access required', 403);

    const url = new URL(context.request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    const action = url.searchParams.get('action');

    let sql = `
      SELECT al.*, u.name as adminName, u.email as adminEmail
      FROM AdminLog al
      JOIN User u ON al.adminId = u.id
    `;
    const params: any[] = [];

    if (action) {
      sql += ' WHERE al.action LIKE ?';
      params.push(`%${action}%`);
    }

    sql += ` ORDER BY al.createdAt DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const logs = await query(context.env.DB, sql, params);

    return json({ logs });
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};
