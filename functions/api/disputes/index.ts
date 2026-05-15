/**
 * GET /api/disputes - List user's disputes
 * POST /api/disputes - Create dispute (body: bookingId, reason, description)
 * Requires auth
 */

import { createSupabaseClient, Env } from '../../_shared/db';
import { requireAuth } from '../../_shared/auth';
import { json, unauthorized, notFound, error } from '../../_shared/response';
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

  const supabase = createSupabaseClient(context.env);
  const url = new URL(context.request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
  const status = url.searchParams.get('status');

  const offset = (page - 1) * limit;

  // Build query with filters
  let queryBuilder = supabase
    .from('Dispute')
    .select('id,disputeType,description,status,resolution,createdAt,resolvedAt,booking:Booking(bookingNumber,finalPrice,status,service:Service(title))', { count: 'exact' })
    .eq('raisedBy', user.userId)
    .order('createdAt', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    queryBuilder = queryBuilder.eq('status', sanitizeString(status));
  }

  const { data: disputes, error: disputesError, count } = await queryBuilder;

  if (disputesError) {
    console.error('Get disputes error:', disputesError);
    return error('Failed to fetch disputes', 500);
  }

  // Flatten the join results
  const flatDisputes = (disputes as Record<string, unknown>[] || []).map((d) => {
    const booking = d.booking as Record<string, unknown> | null;
    const service = booking?.service as Record<string, unknown> | null;
    return {
      id: d.id,
      disputeType: d.disputeType,
      description: d.description,
      status: d.status,
      resolution: d.resolution,
      createdAt: d.createdAt,
      resolvedAt: d.resolvedAt,
      bookingNumber: booking?.bookingNumber ?? null,
      bookingAmount: booking?.finalPrice ?? null,
      bookingStatus: booking?.status ?? null,
      serviceTitle: service?.title ?? null,
    };
  });

  const total = count || 0;

  return json({
    disputes: flatDisputes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function onRequestPost(context: EventContext): Promise<Response> {
  let user;
  try {
    user = await requireAuth(context.request, context.env);
  } catch {
    return unauthorized();
  }

  const supabase = createSupabaseClient(context.env);

  let body;
  try {
    body = await context.request.json() as {
      bookingId?: string;
      disputeType?: string;
      description?: string;
    };
  } catch {
    return error('Invalid request body');
  }

  if (!body.bookingId || !body.disputeType || !body.description) {
    return error('bookingId, disputeType, and description are required');
  }

  const bookingId = sanitizeString(body.bookingId);
  const disputeType = sanitizeString(body.disputeType);
  const description = sanitizeString(body.description);

  // Validate dispute type
  const validDisputeTypes = ['PAYMENT', 'SERVICE_QUALITY', 'NO_SHOW', 'CANCELLATION', 'OTHER'];
  if (!validDisputeTypes.includes(disputeType)) {
    return error(`Invalid disputeType. Must be one of: ${validDisputeTypes.join(', ')}`);
  }

  // Check booking exists and user is part of it
  const { data: booking } = await supabase
    .from('Booking')
    .select('id,clientId,providerId,status')
    .eq('id', bookingId)
    .maybeSingle();

  if (!booking) {
    return notFound('Booking not found');
  }

  const bookingData = booking as { clientId: string; providerId: string; status: string };
  if (bookingData.clientId !== user.userId && bookingData.providerId !== user.userId) {
    return error('You can only raise disputes for your own bookings', 403);
  }

  // Check if dispute already exists for this booking
  const { data: existingDispute } = await supabase
    .from('Dispute')
    .select('id')
    .eq('bookingId', bookingId)
    .in('status', ['OPEN', 'UNDER_REVIEW'])
    .maybeSingle();

  if (existingDispute) {
    return error('An active dispute already exists for this booking', 409);
  }

  const disputeId = crypto.randomUUID();
  const now = new Date().toISOString();

  const { error: insertError } = await supabase
    .from('Dispute')
    .insert({
      id: disputeId,
      bookingId,
      raisedBy: user.userId,
      disputeType,
      description,
      status: 'OPEN',
      createdAt: now,
      updatedAt: now,
    });

  if (insertError) {
    console.error('Create dispute error:', insertError);
    return error('Failed to create dispute', 500);
  }

  // Notify the other party
  const otherPartyId = bookingData.clientId === user.userId ? bookingData.providerId : bookingData.clientId;
  await supabase
    .from('Notification')
    .insert({
      id: crypto.randomUUID(),
      userId: otherPartyId,
      type: 'DISPUTE',
      title: 'New Dispute Raised',
      message: 'A dispute has been raised regarding your booking',
      actionUrl: '/disputes',
      isRead: false,
      createdAt: now,
    });

  const { data: newDispute } = await supabase
    .from('Dispute')
    .select('*')
    .eq('id', disputeId)
    .maybeSingle();

  return json({ dispute: newDispute, message: 'Dispute created successfully' }, 201);
}
