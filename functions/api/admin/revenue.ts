import { query } from '../../_shared/db';
import { requireAuth } from '../../_shared/auth';
import { json, error } from '../../_shared/response';
import { Env } from '../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);
    if (auth.role !== 'ADMIN') return error('Admin access required', 403);

    // Revenue breakdown by booking status
    const revenueByStatus = await query(context.env.DB, `
      SELECT status, COUNT(*) as count, COALESCE(SUM(finalPrice), 0) as revenue,
             COALESCE(SUM(platformFee), 0) as platformFees,
             COALESCE(SUM(providerEarnings), 0) as providerEarnings
      FROM Booking
      GROUP BY status
    `);

    // Revenue streams
    const revenueStreams = await query(context.env.DB,
      'SELECT * FROM RevenueStream ORDER BY streamType'
    );

    // Monthly revenue (last 12 months)
    const monthlyRevenue = await query(context.env.DB, `
      SELECT strftime('%Y-%m', createdAt) as month,
             COUNT(*) as bookings,
             COALESCE(SUM(finalPrice), 0) as revenue,
             COALESCE(SUM(platformFee), 0) as platformFees
      FROM Booking
      WHERE status = 'COMPLETED' AND createdAt >= datetime('now', '-12 months')
      GROUP BY strftime('%Y-%m', createdAt)
      ORDER BY month DESC
    `);

    return json({ revenueByStatus, revenueStreams, monthlyRevenue });
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};
