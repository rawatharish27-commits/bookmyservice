/**
 * GET /api/admin/services - List all services (including PENDING)
 * PATCH /api/admin/services - Approve/reject services (body: serviceId, status)
 * Requires ADMIN role
 */

import { createSupabaseClient, Env } from '../../_shared/db';
import { requireAuth, requireRole } from '../../_shared/auth';
import { json, unauthorized, forbidden, notFound, error } from '../../_shared/response';
import { sanitizeString, getClientIP } from '../../_shared/security';

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
  const status = url.searchParams.get('status'); // PENDING, APPROVED, REJECTED

  const supabase = createSupabaseClient(context.env);

  // Build count query
  let countQuery = supabase.from('Service').select('id', { count: 'exact' });

  // Build data query
  let dataQuery = supabase
    .from('Service')
    .select('id, title, description, basePrice, approvalStatus, isActive, city, averageRating, totalBookings, totalReviews, createdAt, categoryId, providerId')
    .order('createdAt', { ascending: false })
    .range((page - 1) * limit, (page - 1) * limit + limit - 1);

  if (status) {
    const sanitizedStatus = sanitizeString(status);
    countQuery = countQuery.eq('approvalStatus', sanitizedStatus);
    dataQuery = dataQuery.eq('approvalStatus', sanitizedStatus);
  }

  const [countResult, dataResult] = await Promise.all([countQuery, dataQuery]);

  const total = countResult.count ?? 0;
  const services = (dataResult.data ?? []) as Record<string, unknown>[];

  // Enrich services with category and provider info
  const enrichedServices = await enrichServices(supabase, services);

  return json({
    services: enrichedServices,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

async function enrichServices(
  supabase: ReturnType<typeof createSupabaseClient>,
  services: Record<string, unknown>[]
): Promise<Record<string, unknown>[]> {
  if (services.length === 0) return [];

  const categoryIds = [...new Set(
    services
      .map((s) => String(s.categoryId))
      .filter((id) => id !== 'null' && id !== 'undefined')
  )];
  const providerIds = [...new Set(services.map((s) => String(s.providerId)))];

  const [categoriesResult, providersResult] = await Promise.all([
    categoryIds.length > 0
      ? supabase.from('ServiceCategory').select('id, name, slug').in('id', categoryIds)
      : Promise.resolve({ data: [], error: null, count: null }),
    supabase.from('User').select('id, name, email').in('id', providerIds),
  ]);

  const categoryMap = new Map(
    (categoriesResult.data ?? []).map((c: Record<string, unknown>) => [String(c.id), c])
  );
  const providerMap = new Map(
    (providersResult.data ?? []).map((p: Record<string, unknown>) => [String(p.id), p])
  );

  return services.map((s) => {
    const category = categoryMap.get(String(s.categoryId)) as Record<string, unknown> | undefined;
    const provider = providerMap.get(String(s.providerId)) as Record<string, unknown> | undefined;
    return {
      ...s,
      categoryName: category?.name ?? null,
      categorySlug: category?.slug ?? null,
      providerName: provider?.name ?? null,
      providerEmail: provider?.email ?? null,
    };
  });
}

export async function onRequestPatch(context: EventContext): Promise<Response> {
  let user;
  try {
    user = await requireAuth(context.request, context.env);
  } catch {
    return unauthorized();
  }

  if (!requireRole(user, 'ADMIN')) {
    return forbidden('Admin access required');
  }

  let body;
  try {
    body = await context.request.json() as { serviceId?: string; status?: string; rejectionReason?: string };
  } catch {
    return error('Invalid request body');
  }

  if (!body.serviceId || !body.status) {
    return error('serviceId and status are required');
  }

  const validStatuses = ['APPROVED', 'REJECTED', 'PENDING'];
  if (!validStatuses.includes(body.status)) {
    return error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const serviceId = sanitizeString(body.serviceId);
  const newStatus = sanitizeString(body.status);
  const rejectionReason = body.rejectionReason ? sanitizeString(body.rejectionReason) : null;

  const supabase = createSupabaseClient(context.env);

  // Check service exists
  const { data: existingService } = await supabase
    .from('Service')
    .select('id, title, approvalStatus')
    .eq('id', serviceId)
    .maybeSingle();

  if (!existingService) {
    return notFound('Service not found');
  }

  const isActive = newStatus === 'APPROVED';
  const isApproved = newStatus === 'APPROVED';
  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from('Service')
    .update({
      approvalStatus: newStatus,
      isActive,
      isApproved,
      approvedBy: user.userId,
      approvedAt: now,
      rejectionReason,
      updatedAt: now,
    })
    .eq('id', serviceId);

  if (updateError) {
    return error('Failed to update service: ' + updateError.message);
  }

  // Log admin action
  const ip = getClientIP(context.request);
  const userAgent = context.request.headers.get('User-Agent') || null;
  await supabase.from('AdminLog').insert({
    id: crypto.randomUUID(),
    adminId: user.userId,
    action: newStatus === 'APPROVED' ? 'APPROVE_SERVICE' : 'REJECT_SERVICE',
    targetType: 'SERVICE',
    targetId: serviceId,
    details: JSON.stringify({
      previousStatus: (existingService as Record<string, unknown>).approvalStatus,
      newStatus,
      rejectionReason,
    }),
    ipAddress: ip,
    userAgent,
    createdAt: now,
  });

  // Create notification for the provider
  const { data: serviceInfo } = await supabase
    .from('Service')
    .select('providerId')
    .eq('id', serviceId)
    .maybeSingle();

  if (serviceInfo) {
    const providerId = String((serviceInfo as Record<string, unknown>).providerId);
    const notifTitle = newStatus === 'APPROVED' ? 'Service Approved' : 'Service Rejected';
    const notifMessage = newStatus === 'APPROVED'
      ? `Your service "${(existingService as Record<string, unknown>).title}" has been approved`
      : `Your service "${(existingService as Record<string, unknown>).title}" has been rejected${rejectionReason ? `. Reason: ${rejectionReason}` : ''}`;

    await supabase.from('Notification').insert({
      id: crypto.randomUUID(),
      userId: providerId,
      type: 'SERVICE_STATUS',
      title: notifTitle,
      message: notifMessage,
      actionUrl: '/provider/services',
      isRead: false,
      createdAt: now,
    });
  }

  return json({
    message: `Service ${newStatus.toLowerCase()} successfully`,
    service: { id: serviceId, approvalStatus: newStatus },
  });
}
