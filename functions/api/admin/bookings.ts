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
      SELECT b.*, s.title as serviceTitle,
             cu.name as clientName, pu.name as providerName
      FROM Booking b
      JOIN Service s ON b.serviceId = s.id
      JOIN User cu ON b.clientId = cu.id
      JOIN User pu ON b.providerId = pu.id
    `;
    const params: any[] = [];

    if (status) {
      sql += ' WHERE b.status = ?';
      params.push(status.toUpperCase());
    }

    sql += ` ORDER BY b.createdAt DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const bookings = await query(context.env.DB, sql, params);

    return json({ bookings });
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};
