/**
 * GET /api/admin/disputes - List disputes
 * POST /api/admin/disputes - Create/resolve dispute
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
  const status = url.searchParams.get('status');

  const supabase = createSupabaseClient(context.env);

  // Build count query
  let countQuery = supabase.from('Dispute').select('id', { count: 'exact' });

  // Build data query
  let dataQuery = supabase
    .from('Dispute')
    .select('id, disputeType, description, status, resolution, createdAt, resolvedAt, bookingId, raisedBy, assignedTo')
    .order('createdAt', { ascending: false })
    .range((page - 1) * limit, (page - 1) * limit + limit - 1);

  if (status) {
    const sanitizedStatus = sanitizeString(status);
    countQuery = countQuery.eq('status', sanitizedStatus);
    dataQuery = dataQuery.eq('status', sanitizedStatus);
  }

  const [countResult, dataResult] = await Promise.all([countQuery, dataQuery]);

  const total = countResult.count ?? 0;
  const disputes = (dataResult.data ?? []) as Record<string, unknown>[];

  // Enrich disputes with related data
  const enrichedDisputes = await enrichDisputes(supabase, disputes);

  return json({
    disputes: enrichedDisputes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

async function enrichDisputes(
  supabase: ReturnType<typeof createSupabaseClient>,
  disputes: Record<string, unknown>[]
): Promise<Record<string, unknown>[]> {
  if (disputes.length === 0) return [];

  const bookingIds = [...new Set(disputes.map((d) => String(d.bookingId)))];
  const raiserIds = [...new Set(disputes.map((d) => String(d.raisedBy)))];
  const assigneeIds = [...new Set(
    disputes
      .filter((d) => d.assignedTo != null)
      .map((d) => String(d.assignedTo))
  )];

  const [bookingsResult, raisersResult, assigneesResult] = await Promise.all([
    supabase.from('Booking').select('id, bookingNumber, finalPrice').in('id', bookingIds),
    supabase.from('User').select('id, name, email').in('id', raiserIds),
    assigneeIds.length > 0
      ? supabase.from('User').select('id, name').in('id', assigneeIds)
      : Promise.resolve({ data: [], error: null, count: null }),
  ]);

  const bookingMap = new Map(
    (bookingsResult.data ?? []).map((b: Record<string, unknown>) => [String(b.id), b])
  );
  const raiserMap = new Map(
    (raisersResult.data ?? []).map((r: Record<string, unknown>) => [String(r.id), r])
  );
  const assigneeMap = new Map(
    (assigneesResult.data ?? []).map((a: Record<string, unknown>) => [String(a.id), a])
  );

  return disputes.map((d) => {
    const booking = bookingMap.get(String(d.bookingId)) as Record<string, unknown> | undefined;
    const raiser = raiserMap.get(String(d.raisedBy)) as Record<string, unknown> | undefined;
    const assignee = d.assignedTo
      ? assigneeMap.get(String(d.assignedTo)) as Record<string, unknown> | undefined
      : undefined;
    return {
      ...d,
      bookingNumber: booking?.bookingNumber ?? null,
      bookingAmount: booking?.finalPrice ?? null,
      raiserName: raiser?.name ?? null,
      raiserEmail: raiser?.email ?? null,
      assigneeName: assignee?.name ?? null,
    };
  });
}

export async function onRequestPost(context: EventContext): Promise<Response> {
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
    body = await context.request.json() as {
      disputeId?: string;
      action?: string;
      resolution?: string;
      assignedTo?: string;
    };
  } catch {
    return error('Invalid request body');
  }

  if (!body.disputeId || !body.action) {
    return error('disputeId and action are required');
  }

  const disputeId = sanitizeString(body.disputeId);
  const action = sanitizeString(body.action);

  const supabase = createSupabaseClient(context.env);

  // Check dispute exists
  const { data: existingDispute } = await supabase
    .from('Dispute')
    .select('id, status, disputeType')
    .eq('id', disputeId)
    .maybeSingle();

  if (!existingDispute) {
    return notFound('Dispute not found');
  }

  const now = new Date().toISOString();

  if (action === 'RESOLVE') {
    if (!body.resolution) {
      return error('resolution is required when resolving a dispute');
    }

    const resolution = sanitizeString(body.resolution);

    const { error: updateError } = await supabase
      .from('Dispute')
      .update({
        status: 'RESOLVED',
        resolution,
        assignedTo: user.userId,
        resolvedAt: now,
        updatedAt: now,
      })
      .eq('id', disputeId);

    if (updateError) {
      return error('Failed to resolve dispute: ' + updateError.message);
    }

    // Log action
    const ip = getClientIP(context.request);
    const userAgent = context.request.headers.get('User-Agent') || null;
    await supabase.from('AdminLog').insert({
      id: crypto.randomUUID(),
      adminId: user.userId,
      action: 'RESOLVE_DISPUTE',
      targetType: 'DISPUTE',
      targetId: disputeId,
      details: JSON.stringify({ resolution }),
      ipAddress: ip,
      userAgent,
      createdAt: now,
    });

    // Notify the raiser
    const { data: disputeInfo } = await supabase
      .from('Dispute')
      .select('raisedBy, bookingId')
      .eq('id', disputeId)
      .maybeSingle();

    if (disputeInfo) {
      const raisedBy = String((disputeInfo as Record<string, unknown>).raisedBy);
      await supabase.from('Notification').insert({
        id: crypto.randomUUID(),
        userId: raisedBy,
        type: 'DISPUTE',
        title: 'Dispute Resolved',
        message: `Your dispute has been resolved. Resolution: ${resolution}`,
        actionUrl: '/disputes',
        isRead: false,
        createdAt: now,
      });
    }

    return json({ message: 'Dispute resolved successfully', disputeId });
  }

  if (action === 'ASSIGN') {
    if (!body.assignedTo) {
      return error('assignedTo is required when assigning a dispute');
    }

    const assignedTo = sanitizeString(body.assignedTo);

    const { error: updateError } = await supabase
      .from('Dispute')
      .update({
        assignedTo,
        status: 'UNDER_REVIEW',
        updatedAt: now,
      })
      .eq('id', disputeId);

    if (updateError) {
      return error('Failed to assign dispute: ' + updateError.message);
    }

    // Log action
    const ip = getClientIP(context.request);
    const userAgent = context.request.headers.get('User-Agent') || null;
    await supabase.from('AdminLog').insert({
      id: crypto.randomUUID(),
      adminId: user.userId,
      action: 'ASSIGN_DISPUTE',
      targetType: 'DISPUTE',
      targetId: disputeId,
      details: JSON.stringify({ assignedTo }),
      ipAddress: ip,
      userAgent,
      createdAt: now,
    });

    return json({ message: 'Dispute assigned successfully', disputeId });
  }

  if (action === 'CLOSE') {
    const { error: updateError } = await supabase
      .from('Dispute')
      .update({
        status: 'CLOSED',
        updatedAt: now,
      })
      .eq('id', disputeId);

    if (updateError) {
      return error('Failed to close dispute: ' + updateError.message);
    }

    return json({ message: 'Dispute closed successfully', disputeId });
  }

  return error('Invalid action. Must be one of: RESOLVE, ASSIGN, CLOSE');
}
