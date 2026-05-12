/**
 * GET /api/admin/dashboard - Admin dashboard stats
 * Requires ADMIN role
 */

import { query, queryOne } from '../../_shared/db';
import { requireAuth, requireRole } from '../../_shared/auth';
import { json, unauthorized, forbidden } from '../../_shared/response';

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

  const db = context.env.DB;

  // Total users
  const totalUsersResult = await queryOne(db, 'SELECT COUNT(*) as count FROM User');
  const totalUsers = (totalUsersResult as { count: number } | null)?.count ?? 0;

  // Total providers (roleId = 2)
  const totalProvidersResult = await queryOne(db, "SELECT COUNT(*) as count FROM User WHERE roleId = (SELECT id FROM Role WHERE name = 'PROVIDER')");
  const totalProviders = (totalProvidersResult as { count: number } | null)?.count ?? 0;

  // Total services
  const totalServicesResult = await queryOne(db, 'SELECT COUNT(*) as count FROM Service');
  const totalServices = (totalServicesResult as { count: number } | null)?.count ?? 0;

  // Total bookings
  const totalBookingsResult = await queryOne(db, 'SELECT COUNT(*) as count FROM Booking');
  const totalBookings = (totalBookingsResult as { count: number } | null)?.count ?? 0;

  // Total revenue (sum of finalPrice from completed bookings)
  const totalRevenueResult = await queryOne(db, "SELECT COALESCE(SUM(finalPrice), 0) as total FROM Booking WHERE status = 'COMPLETED'");
  const totalRevenue = (totalRevenueResult as { total: number } | null)?.total ?? 0;

  // Pending verifications (KYC pending + services pending)
  const pendingKycResult = await queryOne(db, "SELECT COUNT(*) as count FROM ProviderKyc WHERE verificationStatus = 'PENDING'");
  const pendingKyc = (pendingKycResult as { count: number } | null)?.count ?? 0;

  const pendingServicesResult = await queryOne(db, "SELECT COUNT(*) as count FROM Service WHERE approvalStatus = 'PENDING'");
  const pendingServices = (pendingServicesResult as { count: number } | null)?.count ?? 0;

  const pendingVerifications = pendingKyc + pendingServices;

  // Recent bookings (last 10)
  const recentBookings = await query(db, `
    SELECT b.id, b.bookingNumber, b.status, b.finalPrice, b.scheduledDate, b.scheduledTime,
           b.createdAt,
           c.name as clientName, c.email as clientEmail,
           p.name as providerName, p.email as providerEmail,
           s.title as serviceTitle
    FROM Booking b
    JOIN User c ON b.clientId = c.id
    JOIN User p ON b.providerId = p.id
    JOIN Service s ON b.serviceId = s.id
    ORDER BY b.createdAt DESC
    LIMIT 10
  `);

  // Users by role
  const usersByRole = await query(db, `
    SELECT r.name as role, COUNT(u.id) as count
    FROM Role r
    LEFT JOIN User u ON u.roleId = r.id
    GROUP BY r.id, r.name
  `);

  return json({
    totalUsers,
    totalProviders,
    totalServices,
    totalBookings,
    totalRevenue,
    pendingVerifications,
    pendingKyc,
    pendingServices,
    recentBookings,
    usersByRole,
  });
}
