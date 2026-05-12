import { query } from '../../_shared/db';
import { requireAuth } from '../../_shared/auth';
import { json, error } from '../../_shared/response';
import { Env } from '../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);
    if (auth.role !== 'ADMIN') return error('Admin access required', 403);

    const url = new URL(context.request.url);
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let sql = `
      SELECT s.*, sc.name as categoryName, u.name as providerName, u.email as providerEmail
      FROM Service s
      JOIN ServiceCategory sc ON s.categoryId = sc.id
      JOIN User u ON s.providerId = u.id
    `;
    const params: any[] = [];

    if (status) {
      sql += ' WHERE s.approvalStatus = ?';
      params.push(status.toUpperCase());
    }

    sql += ` ORDER BY s.createdAt DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const services = await query(context.env.DB, sql, params);

    return json({ services });
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};
