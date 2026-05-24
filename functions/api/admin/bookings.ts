/**
 * GET /api/admin/bookings - List all bookings with pagination
 * Requires ADMIN role
 */

import { createSupabaseClient, Env } from '../../_shared/db';
import { requireAuth, requireRole } from '../../_shared/auth';
import { json, unauthorized, forbidden } from '../../_shared/response';
import { sanitizeString } from '../../_shared/security';

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

  const url = new URL(context.request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
  const status = url.searchParams.get('status');
  const search = url.searchParams.get('search');

  const supabase = createSupabaseClient(context.env);

  // Build base query for count
  let countQuery = supabase.from('Booking').select('id', { count: 'exact' });

  // Build data query
  let dataQuery = supabase
    .from('Booking')
    .select('id, bookingNumber, status, scheduledDate, scheduledTime, finalPrice, platformFee, providerEarnings, paymentStatus, serviceAddress, specialInstructions, createdAt, completedAt, clientId, providerId, serviceId')
    .order('createdAt', { ascending: false })
    .range((page - 1) * limit, (page - 1) * limit + limit - 1);

  if (status) {
    const sanitizedStatus = sanitizeString(status);
    countQuery = countQuery.eq('status', sanitizedStatus);
    dataQuery = dataQuery.eq('status', sanitizedStatus);
  }

  // For search, we need to find matching booking IDs first via related tables
  let matchingBookingIds: string[] | null = null;
  if (search) {
    const sanitizedSearch = sanitizeString(search);
    const searchPattern = `%${sanitizedSearch}%`;

    // Search in booking number
    const { data: bookingsByNumber } = await supabase
      .from('Booking')
      .select('id')
      .ilike('bookingNumber', searchPattern);

    // Search in users by name
    const { data: matchingUsers } = await supabase
      .from('User')
      .select('id')
      .ilike('name', searchPattern);

    // Search in services by title
    const { data: matchingServices } = await supabase
      .from('Service')
      .select('id')
      .ilike('title', searchPattern);

    const userIds = (matchingUsers ?? []).map((u: Record<string, unknown>) => String(u.id));
    const serviceIds = (matchingServices ?? []).map((s: Record<string, unknown>) => String(s.id));
    const bookingIdsByNumber = (bookingsByNumber ?? []).map((b: Record<string, unknown>) => String(b.id));

    // Fetch bookings matching client or provider or service
    const orConditions: string[] = [];
    if (userIds.length > 0) {
      const { data: bookingsByClient } = await supabase
        .from('Booking')
        .select('id')
        .in('clientId', userIds);
      const { data: bookingsByProvider } = await supabase
        .from('Booking')
        .select('id')
        .in('providerId', userIds);
      (bookingsByClient ?? []).forEach((b: Record<string, unknown>) => bookingIdsByNumber.push(String(b.id)));
      (bookingsByProvider ?? []).forEach((b: Record<string, unknown>) => bookingIdsByNumber.push(String(b.id)));
    }
    if (serviceIds.length > 0) {
      const { data: bookingsByService } = await supabase
        .from('Booking')
        .select('id')
        .in('serviceId', serviceIds);
      (bookingsByService ?? []).forEach((b: Record<string, unknown>) => bookingIdsByNumber.push(String(b.id)));
    }

    matchingBookingIds = [...new Set(bookingIdsByNumber)] as string[];

    if (matchingBookingIds.length === 0) {
      return json({
        bookings: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      });
    }

    countQuery = countQuery.in('id', matchingBookingIds as unknown[]);
    dataQuery = dataQuery.in('id', matchingBookingIds as unknown[]);
  }

  // Execute count and data queries
  const [countResult, dataResult] = await Promise.all([countQuery, dataQuery]);

  const total = countResult.count ?? 0;
  const bookings = (dataResult.data ?? []) as Record<string, unknown>[];

  // Enrich with related data
  const enrichedBookings = await enrichBookings(supabase, bookings);

  return json({
    bookings: enrichedBookings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

async function enrichBookings(
  supabase: ReturnType<typeof createSupabaseClient>,
  bookings: Record<string, unknown>[]
): Promise<Record<string, unknown>[]> {
  if (bookings.length === 0) return [];

  const clientIds = [...new Set(bookings.map((b) => String(b.clientId)))];
  const providerIds = [...new Set(bookings.map((b) => String(b.providerId)))];
  const serviceIds = [...new Set(bookings.map((b) => String(b.serviceId)))];

  const [clientsResult, providersResult, servicesResult] = await Promise.all([
    supabase.from('User').select('id, name, email, phone').in('id', clientIds),
    supabase.from('User').select('id, name, email, phone').in('id', providerIds),
    supabase.from('Service').select('id, title, categoryId').in('id', serviceIds),
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

  // Fetch categories for services
  const categoryIds = [...new Set(
    (servicesResult.data ?? [])
      .map((s: Record<string, unknown>) => String(s.categoryId))
      .filter((id) => id !== 'null' && id !== 'undefined')
  )];

  let categoryMap = new Map<string, Record<string, unknown>>();
  if (categoryIds.length > 0) {
    const { data: categories } = await supabase
      .from('ServiceCategory')
      .select('id, name')
      .in('id', categoryIds);
    categoryMap = new Map(
      (categories ?? []).map((c: Record<string, unknown>) => [String(c.id), c])
    );
  }

  return bookings.map((b) => {
    const client = clientMap.get(String(b.clientId)) as Record<string, unknown> | undefined;
    const provider = providerMap.get(String(b.providerId)) as Record<string, unknown> | undefined;
    const service = serviceMap.get(String(b.serviceId)) as Record<string, unknown> | undefined;
    const category = service?.categoryId
      ? categoryMap.get(String(service.categoryId)) as Record<string, unknown> | undefined
      : undefined;
    return {
      ...b,
      clientName: client?.name ?? null,
      clientEmail: client?.email ?? null,
      clientPhone: client?.phone ?? null,
      providerName: provider?.name ?? null,
      providerEmail: provider?.email ?? null,
      providerPhone: provider?.phone ?? null,
      serviceTitle: service?.title ?? null,
      categoryName: category?.name ?? null,
    };
  });
}
