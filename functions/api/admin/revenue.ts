/**
 * GET /api/admin/revenue - Revenue analytics
 * Requires ADMIN role
 * Returns: totalRevenue, monthlyRevenue (last 12 months), revenueByCategory
 */

import { createSupabaseClient, Env } from '../../_shared/db';
import { requireAuth, requireRole } from '../../_shared/auth';
import { json, unauthorized, forbidden } from '../../_shared/response';

interface EventContext {
  request: Request;
  env: Env;
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

  const supabase = createSupabaseClient(context.env);

  // Total revenue from completed bookings
  const { data: completedBookings } = await supabase
    .from('Booking')
    .select('finalPrice, platformFee, providerEarnings')
    .eq('status', 'COMPLETED');

  const totalRevenue = completedBookings?.reduce((sum, b) => sum + Number(b.finalPrice ?? 0), 0) ?? 0;
  const totalPlatformFees = completedBookings?.reduce((sum, b) => sum + Number(b.platformFee ?? 0), 0) ?? 0;
  const totalProviderEarnings = completedBookings?.reduce((sum, b) => sum + Number(b.providerEarnings ?? 0), 0) ?? 0;

  // Monthly revenue for last 12 months
  // Calculate the date 12 months ago
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const { data: monthlyBookings } = await supabase
    .from('Booking')
    .select('finalPrice, platformFee, providerEarnings, createdAt')
    .eq('status', 'COMPLETED')
    .gte('createdAt', twelveMonthsAgo.toISOString());

  // Group by month in JavaScript
  const monthlyMap = new Map<string, { bookingCount: number; revenue: number; platformFees: number; providerEarnings: number }>();
  for (const b of (monthlyBookings ?? [])) {
    const createdAt = String(b.createdAt);
    const month = createdAt.substring(0, 7); // "YYYY-MM"
    const existing = monthlyMap.get(month) ?? { bookingCount: 0, revenue: 0, platformFees: 0, providerEarnings: 0 };
    existing.bookingCount++;
    existing.revenue += Number(b.finalPrice ?? 0);
    existing.platformFees += Number(b.platformFee ?? 0);
    existing.providerEarnings += Number(b.providerEarnings ?? 0);
    monthlyMap.set(month, existing);
  }

  const monthlyRevenue = Array.from(monthlyMap.entries())
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => b.month.localeCompare(a.month));

  // Revenue by category
  const { data: allCompletedBookings } = await supabase
    .from('Booking')
    .select('id, finalPrice, platformFee, serviceId')
    .eq('status', 'COMPLETED');

  const revenueByCategory = await computeRevenueByCategory(supabase, allCompletedBookings as Record<string, unknown>[] | null);

  // Payment status breakdown
  const { data: allBookings } = await supabase
    .from('Booking')
    .select('paymentStatus, finalPrice');

  const paymentMap = new Map<string, { count: number; total: number }>();
  for (const b of (allBookings ?? [])) {
    const ps = String(b.paymentStatus ?? 'UNKNOWN');
    const existing = paymentMap.get(ps) ?? { count: 0, total: 0 };
    existing.count++;
    existing.total += Number(b.finalPrice ?? 0);
    paymentMap.set(ps, existing);
  }

  const paymentBreakdown = Array.from(paymentMap.entries()).map(([paymentStatus, data]) => ({
    paymentStatus,
    ...data,
  }));

  // Booking status breakdown
  const { data: allBookingsForStatus } = await supabase
    .from('Booking')
    .select('status, finalPrice');

  const statusMap = new Map<string, { count: number; total: number }>();
  for (const b of (allBookingsForStatus ?? [])) {
    const s = String(b.status ?? 'UNKNOWN');
    const existing = statusMap.get(s) ?? { count: 0, total: 0 };
    existing.count++;
    existing.total += Number(b.finalPrice ?? 0);
    statusMap.set(s, existing);
  }

  const bookingBreakdown = Array.from(statusMap.entries()).map(([status, data]) => ({
    status,
    ...data,
  }));

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

async function computeRevenueByCategory(
  supabase: ReturnType<typeof createSupabaseClient>,
  bookings: Record<string, unknown>[] | null
): Promise<Record<string, unknown>[]> {
  if (!bookings || bookings.length === 0) return [];

  // Get service IDs from bookings
  const serviceIds = [...new Set(bookings.map((b) => String(b.serviceId)))];

  // Fetch services with their categories
  const { data: services } = await supabase
    .from('Service')
    .select('id, categoryId')
    .in('id', serviceIds);

  const serviceCategoryMap = new Map(
    (services ?? []).map((s: Record<string, unknown>) => [String(s.id), s.categoryId])
  );

  // Fetch categories
  const categoryIds = [...new Set(
    (services ?? []).map((s: Record<string, unknown>) => String(s.categoryId)).filter((id) => id !== 'null' && id !== 'undefined')
  )];

  let categoryMap = new Map<string, { name: string; slug: string }>();
  if (categoryIds.length > 0) {
    const { data: categories } = await supabase
      .from('ServiceCategory')
      .select('id, name, slug')
      .in('id', categoryIds);
    categoryMap = new Map(
      (categories ?? []).map((c: Record<string, unknown>) => [
        String(c.id),
        { name: String(c.name), slug: String(c.slug) },
      ])
    );
  }

  // Aggregate by category
  const categoryRevenueMap = new Map<string, { category: string; categorySlug: string; bookingCount: number; revenue: number; platformFees: number }>();
  for (const b of bookings) {
    const catId = String(serviceCategoryMap.get(String(b.serviceId)) ?? 'UNKNOWN');
    const catInfo = categoryMap.get(catId) ?? { name: 'Unknown', slug: 'unknown' };
    const existing = categoryRevenueMap.get(catId) ?? {
      category: catInfo.name,
      categorySlug: catInfo.slug,
      bookingCount: 0,
      revenue: 0,
      platformFees: 0,
    };
    existing.bookingCount++;
    existing.revenue += Number(b.finalPrice ?? 0);
    existing.platformFees += Number(b.platformFee ?? 0);
    categoryRevenueMap.set(catId, existing);
  }

  return Array.from(categoryRevenueMap.values()).sort((a, b) => b.revenue - a.revenue);
}
