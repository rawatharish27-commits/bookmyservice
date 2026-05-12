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
      SELECT d.*, b.bookingNumber, b.status as bookingStatus,
             ru.name as raiserName, au.name as assigneeName
      FROM Dispute d
      JOIN Booking b ON d.bookingId = b.id
      JOIN User ru ON d.raisedBy = ru.id
      LEFT JOIN User au ON d.assignedTo = au.id
    `;
    const params: any[] = [];

    if (status) {
      sql += ' WHERE d.status = ?';
      params.push(status.toUpperCase());
    }

    sql += ` ORDER BY d.createdAt DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const disputes = await query(context.env.DB, sql, params);

    return json({ disputes });
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};
