/**
 * GET /api/disputes/:disputeId - Get dispute details
 * PATCH /api/disputes/:disputeId - Update dispute (add response)
 * Requires auth
 */

import { createSupabaseClient, Env } from '../../_shared/db';
import { requireAuth } from '../../_shared/auth';
import { json, unauthorized, notFound, error, forbidden } from '../../_shared/response';
import { sanitizeString } from '../../_shared/security';

interface EventContext {
  request: Request;
  env: Env;
  params: { disputeId: string };
}

export async function onRequestGet(context: EventContext): Promise<Response> {
  let user;
  try {
    user = await requireAuth(context.request, context.env);
  } catch {
    return unauthorized();
  }

  const supabase = createSupabaseClient(context.env);
  const disputeId = sanitizeString(context.params.disputeId);

  // Fetch dispute with booking and service info via joins, plus messages
  const { data: dispute, error: disputeError } = await supabase
    .from('Dispute')
    .select('id,bookingId,raisedBy,disputeType,description,evidence,status,assignedTo,resolution,createdAt,resolvedAt,updatedAt,booking:Booking(bookingNumber,finalPrice,status,scheduledDate,scheduledTime,service:Service(title)),raiser:User!Dispute_raisedBy_fkey(name,email),assignee:User!Dispute_assignedTo_fkey(name),messages:DisputeMessage(id,senderId,message,attachments,createdAt,sender:User!DisputeMessage_senderId_fkey(name,email,profileImageUrl))')
    .eq('id', disputeId)
    .maybeSingle();

  if (disputeError) {
    console.error('Get dispute error:', disputeError);
    return notFound('Dispute not found');
  }

  if (!dispute) {
    return notFound('Dispute not found');
  }

  // Check access - user must be the raiser, the other party in booking, or admin
  const d = dispute as Record<string, unknown>;
  const booking = d.booking as Record<string, unknown> | null;

  // We need to check clientId and providerId from the booking
  // Since the join doesn't include those, fetch them separately
  const { data: bookingRow } = await supabase
    .from('Booking')
    .select('clientId,providerId')
    .eq('id', d.bookingId as string)
    .maybeSingle();

  if (bookingRow) {
    const bk = bookingRow as { clientId: string; providerId: string };
    if (d.raisedBy !== user.userId &&
        bk.clientId !== user.userId &&
        bk.providerId !== user.userId &&
        user.role !== 'ADMIN') {
      return forbidden('You do not have access to this dispute');
    }
  }

  // Flatten the dispute join results
  const service = booking?.service as Record<string, unknown> | null;
  const raiser = d.raiser as Record<string, unknown> | null;
  const assignee = d.assignee as Record<string, unknown> | null;
  const messages = (d.messages as Record<string, unknown>[] || []).map((msg) => {
    const sender = msg.sender as Record<string, unknown> | null;
    return {
      id: msg.id,
      senderId: msg.senderId,
      message: msg.message,
      attachments: msg.attachments,
      createdAt: msg.createdAt,
      senderName: sender?.name ?? null,
      senderEmail: sender?.email ?? null,
      senderImage: sender?.profileImageUrl ?? null,
    };
  });

  const flatDispute = {
    id: d.id,
    bookingId: d.bookingId,
    raisedBy: d.raisedBy,
    disputeType: d.disputeType,
    description: d.description,
    evidence: d.evidence,
    status: d.status,
    assignedTo: d.assignedTo,
    resolution: d.resolution,
    createdAt: d.createdAt,
    resolvedAt: d.resolvedAt,
    updatedAt: d.updatedAt,
    bookingNumber: booking?.bookingNumber ?? null,
    bookingAmount: booking?.finalPrice ?? null,
    bookingStatus: booking?.status ?? null,
    scheduledDate: booking?.scheduledDate ?? null,
    scheduledTime: booking?.scheduledTime ?? null,
    serviceTitle: service?.title ?? null,
    raiserName: raiser?.name ?? null,
    raiserEmail: raiser?.email ?? null,
    assigneeName: assignee?.name ?? null,
  };

  return json({
    dispute: flatDispute,
    messages,
  });
}

export async function onRequestPatch(context: EventContext): Promise<Response> {
  let user;
  try {
    user = await requireAuth(context.request, context.env);
  } catch {
    return unauthorized();
  }

  const supabase = createSupabaseClient(context.env);
  const disputeId = sanitizeString(context.params.disputeId);

  // Check dispute exists
  const { data: dispute } = await supabase
    .from('Dispute')
    .select('id,raisedBy,bookingId,status')
    .eq('id', disputeId)
    .maybeSingle();

  if (!dispute) {
    return notFound('Dispute not found');
  }

  const disputeData = dispute as { raisedBy: string; bookingId: string; status: string };

  // Check access
  const { data: bookingRow } = await supabase
    .from('Booking')
    .select('clientId,providerId')
    .eq('id', disputeData.bookingId)
    .maybeSingle();

  if (bookingRow) {
    const bk = bookingRow as { clientId: string; providerId: string };
    if (disputeData.raisedBy !== user.userId &&
        bk.clientId !== user.userId &&
        bk.providerId !== user.userId &&
        user.role !== 'ADMIN') {
      return forbidden('You do not have access to this dispute');
    }
  }

  // Check dispute is still open
  if (disputeData.status === 'RESOLVED' || disputeData.status === 'CLOSED') {
    return error('Cannot update a resolved or closed dispute');
  }

  let body;
  try {
    body = await context.request.json() as {
      message?: string;
      attachments?: string;
    };
  } catch {
    return error('Invalid request body');
  }

  if (!body.message) {
    return error('message is required');
  }

  const message = sanitizeString(body.message);
  const attachments = body.attachments ? sanitizeString(body.attachments) : null;
  const now = new Date().toISOString();

  // Add dispute message
  const msgId = crypto.randomUUID();
  const { error: msgInsertError } = await supabase
    .from('DisputeMessage')
    .insert({
      id: msgId,
      disputeId,
      senderId: user.userId,
      message,
      attachments,
      createdAt: now,
    });

  if (msgInsertError) {
    console.error('Add dispute message error:', msgInsertError);
    return error('Failed to add message', 500);
  }

  // Update dispute status to UNDER_REVIEW if it was OPEN
  let newStatus = disputeData.status;
  if (disputeData.status === 'OPEN') {
    newStatus = 'UNDER_REVIEW';
    await supabase
      .from('Dispute')
      .update({ status: 'UNDER_REVIEW', updatedAt: now })
      .eq('id', disputeId);
  }

  // Notify the other party about the new message
  let otherPartyId: string | null = null;
  if (bookingRow) {
    const bk = bookingRow as { clientId: string; providerId: string };
    if (disputeData.raisedBy === user.userId) {
      otherPartyId = bk.clientId === user.userId ? bk.providerId : bk.clientId;
    } else {
      otherPartyId = disputeData.raisedBy;
    }
  }

  if (otherPartyId) {
    await supabase
      .from('Notification')
      .insert({
        id: crypto.randomUUID(),
        userId: otherPartyId,
        type: 'DISPUTE',
        title: 'Dispute Update',
        message: 'A new message has been added to the dispute',
        actionUrl: `/disputes/${disputeId}`,
        isRead: false,
        createdAt: now,
      });
  }

  const { data: newMessage } = await supabase
    .from('DisputeMessage')
    .select('*')
    .eq('id', msgId)
    .maybeSingle();

  return json({ message: newMessage, disputeStatus: newStatus });
}
