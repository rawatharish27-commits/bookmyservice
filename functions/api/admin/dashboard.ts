/**
 * GET /api/admin/dashboard - Admin dashboard stats
 * Requires ADMIN role
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

  // Total users count
  const { count: totalUsers } = await supabase
    .from('User')
    .select('id', { count: 'exact' });

  // Total providers (roleId = 2)
  const { count: totalProviders } = await supabase
    .from('User')
    .select('id', { count: 'exact' })
    .eq('roleId', 2);

  // Total services count
  const { count: totalServices } = await supabase
    .from('Service')
    .select('id', { count: 'exact' });

  // Total bookings count
  const { count: totalBookings } = await supabase
    .from('Booking')
    .select('id', { count: 'exact' });

  // Total revenue (sum of finalPrice from completed bookings)
  const { data: completedBookings } = await supabase
    .from('Booking')
    .select('finalPrice')
    .eq('status', 'COMPLETED');
  const totalRevenue = completedBookings?.reduce((sum, b) => sum + Number(b.finalPrice ?? 0), 0) ?? 0;

  // Pending KYC verifications
  const { count: pendingKyc } = await supabase
    .from('ProviderKyc')
    .select('id', { count: 'exact' })
    .eq('verificationStatus', 'PENDING');

  // Pending service approvals
  const { count: pendingServices } = await supabase
    .from('Service')
    .select('id', { count: 'exact' })
    .eq('approvalStatus', 'PENDING');

  const pendingVerifications = (pendingKyc ?? 0) + (pendingServices ?? 0);

  // Recent bookings (last 10)
  const { data: recentBookingsRaw } = await supabase
    .from('Booking')
    .select('id, bookingNumber, status, finalPrice, scheduledDate, scheduledTime, createdAt, clientId, providerId, serviceId')
    .order('createdAt', { ascending: false })
    .limit(10);

  // Enrich recent bookings with user and service info
  const recentBookings = await enrichBookings(supabase, recentBookingsRaw as Record<string, unknown>[] | null);

  // Users by role
  const { data: roles } = await supabase
    .from('Role')
    .select('id, name');

  const usersByRole = await Promise.all(
    (roles ?? []).map(async (role) => {
      const { count } = await supabase
        .from('User')
        .select('id', { count: 'exact' })
        .eq('roleId', role.id);
      return { role: role.name, count: count ?? 0 };
    })
  );

  return json({
    totalUsers: totalUsers ?? 0,
    totalProviders: totalProviders ?? 0,
    totalServices: totalServices ?? 0,
    totalBookings: totalBookings ?? 0,
    totalRevenue,
    pendingVerifications,
    pendingKyc: pendingKyc ?? 0,
    pendingServices: pendingServices ?? 0,
    recentBookings,
    usersByRole,
  });
}

async function enrichBookings(
  supabase: ReturnType<typeof createSupabaseClient>,
  bookings: Record<string, unknown>[] | null
): Promise<Record<string, unknown>[]> {
  if (!bookings || bookings.length === 0) return [];

  const clientIds = [...new Set(bookings.map((b) => String(b.clientId)))];
  const providerIds = [...new Set(bookings.map((b) => String(b.providerId)))];
  const serviceIds = [...new Set(bookings.map((b) => String(b.serviceId)))];

  const [clientsResult, providersResult, servicesResult] = await Promise.all([
    supabase.from('User').select('id, name, email').in('id', clientIds),
    supabase.from('User').select('id, name, email').in('id', providerIds),
    supabase.from('Service').select('id, title').in('id', serviceIds),
  ]);

  const clientMap = new Map(
    (clientsResult.data ?? []).map((c: Record<string, unknown>) => [String(c.id), c])
  );
  const providerMap = new Map(
    (providersResult.data ?? []).map((p: Record<string, unknown>) => [String(p.id), p])
  );
  const serviceMap = new Map(
    (servicesResult.data ?? []).map((s: Record<string, unknown>) => [String(s.id), s])
  );

  return bookings.map((b) => {
    const client = clientMap.get(String(b.clientId)) as Record<string, unknown> | undefined;
    const provider = providerMap.get(String(b.providerId)) as Record<string, unknown> | undefined;
    const service = serviceMap.get(String(b.serviceId)) as Record<string, unknown> | undefined;
    return {
      ...b,
      clientName: client?.name ?? null,
      clientEmail: client?.email ?? null,
      providerName: provider?.name ?? null,
      providerEmail: provider?.email ?? null,
      serviceTitle: service?.title ?? null,
    };
  });
}
