import { query } from '../../_shared/db';
import { requireAuth } from '../../_shared/auth';
import { json, error } from '../../_shared/response';
import { Env } from '../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);
    if (auth.role !== 'ADMIN') return error('Admin access required', 403);

    // Get dashboard stats
    const [totalUsers, totalProviders, totalClients, totalBookings, totalServices, totalRevenue] = await Promise.all([
      query(context.env.DB, 'SELECT COUNT(*) as count FROM User'),
      query(context.env.DB, 'SELECT COUNT(*) as count FROM User WHERE roleId = (SELECT id FROM Role WHERE name = \'PROVIDER\')'),
      query(context.env.DB, 'SELECT COUNT(*) as count FROM User WHERE roleId = (SELECT id FROM Role WHERE name = \'CLIENT\')'),
      query(context.env.DB, 'SELECT COUNT(*) as count FROM Booking'),
      query(context.env.DB, 'SELECT COUNT(*) as count FROM Service'),
      query(context.env.DB, 'SELECT COALESCE(SUM(finalPrice), 0) as total FROM Booking WHERE status = \'COMPLETED\''),
    ]);

    const recentBookings = await query(context.env.DB, `
      SELECT b.id, b.bookingNumber, b.status, b.finalPrice, b.createdAt,
             cu.name as clientName, pu.name as providerName, s.title as serviceTitle
      FROM Booking b
      JOIN User cu ON b.clientId = cu.id
      JOIN User pu ON b.providerId = pu.id
      JOIN Service s ON b.serviceId = s.id
      ORDER BY b.createdAt DESC LIMIT 10
    `);

    const pendingServices = await query(context.env.DB, `
      SELECT s.id, s.title, s.createdAt, u.name as providerName
      FROM Service s
      JOIN User u ON s.providerId = u.id
      WHERE s.approvalStatus = 'PENDING'
      ORDER BY s.createdAt DESC LIMIT 10
    `);

    return json({
      stats: {
        totalUsers: (totalUsers[0] as any)?.count || 0,
        totalProviders: (totalProviders[0] as any)?.count || 0,
        totalClients: (totalClients[0] as any)?.count || 0,
        totalBookings: (totalBookings[0] as any)?.count || 0,
        totalServices: (totalServices[0] as any)?.count || 0,
        totalRevenue: (totalRevenue[0] as any)?.total || 0,
      },
      recentBookings,
      pendingServices,
    });
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};
