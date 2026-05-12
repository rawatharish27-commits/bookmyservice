/**
 * GET /api/admin/revenue - Revenue analytics
 * Requires ADMIN role
 * Returns: totalRevenue, monthlyRevenue (last 12 months), revenueByCategory
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

  // Total revenue from completed bookings
  const totalRevenueResult = await queryOne(
    db,
    "SELECT COALESCE(SUM(finalPrice), 0) as total FROM Booking WHERE status = 'COMPLETED'"
  );
  const totalRevenue = (totalRevenueResult as { total: number } | null)?.total ?? 0;

  // Total platform fees
  const totalPlatformFeesResult = await queryOne(
    db,
    "SELECT COALESCE(SUM(platformFee), 0) as total FROM Booking WHERE status = 'COMPLETED'"
  );
  const totalPlatformFees = (totalPlatformFeesResult as { total: number } | null)?.total ?? 0;

  // Total provider earnings
  const totalProviderEarningsResult = await queryOne(
    db,
    "SELECT COALESCE(SUM(providerEarnings), 0) as total FROM Booking WHERE status = 'COMPLETED'"
  );
  const totalProviderEarnings = (totalProviderEarningsResult as { total: number } | null)?.total ?? 0;

  // Monthly revenue for last 12 months
  const monthlyRevenue = await query(
    db,
    `SELECT 
       strftime('%Y-%m', createdAt) as month,
       COUNT(*) as bookingCount,
       COALESCE(SUM(finalPrice), 0) as revenue,
       COALESCE(SUM(platformFee), 0) as platformFees,
       COALESCE(SUM(providerEarnings), 0) as providerEarnings
     FROM Booking
     WHERE status = 'COMPLETED'
       AND createdAt >= datetime('now', '-12 months')
     GROUP BY strftime('%Y-%m', createdAt)
     ORDER BY month DESC`
  );

  // Revenue by category
  const revenueByCategory = await query(
    db,
    `SELECT 
       sc.name as category,
       sc.slug as categorySlug,
       COUNT(b.id) as bookingCount,
       COALESCE(SUM(b.finalPrice), 0) as revenue,
       COALESCE(SUM(b.platformFee), 0) as platformFees
     FROM Booking b
     JOIN Service s ON b.serviceId = s.id
     JOIN ServiceCategory sc ON s.categoryId = sc.id
     WHERE b.status = 'COMPLETED'
     GROUP BY sc.id, sc.name, sc.slug
     ORDER BY revenue DESC`
  );

  // Payment status breakdown
  const paymentBreakdown = await query(
    db,
    `SELECT paymentStatus, COUNT(*) as count, COALESCE(SUM(finalPrice), 0) as total
     FROM Booking
     GROUP BY paymentStatus`
  );

  // Booking status breakdown
  const bookingBreakdown = await query(
    db,
    `SELECT status, COUNT(*) as count, COALESCE(SUM(finalPrice), 0) as total
     FROM Booking
     GROUP BY status`
  );

  return json({
    totalRevenue,
    totalPlatformFees,
    totalProviderEarnings,
    monthlyRevenue,
    revenueByCategory,
    paymentBreakdown,
    bookingBreakdown,
  });
}
