/**
 * GET /api/disputes/:disputeId - Get dispute details
 * PATCH /api/disputes/:disputeId - Update dispute (add response)
 * Requires auth
 */

import { query, queryOne, execute } from '../../_shared/db';
import { requireAuth } from '../../_shared/auth';
import { json, unauthorized, notFound, error, forbidden } from '../../_shared/response';
import { sanitizeString } from '../../_shared/security';

interface EventContext {
  request: Request;
  env: { DB: D1Database; JWT_SECRET?: string };
  params: { disputeId: string };
}

export async function onRequestGet(context: EventContext): Promise<Response> {
  let user;
  try {
    user = await requireAuth(context.request, context.env);
  } catch {
    return unauthorized();
  }

  const disputeId = sanitizeString(context.params.disputeId);

  const dispute = await queryOne(
    context.env.DB,
    `SELECT d.id, d.bookingId, d.raisedBy, d.disputeType, d.description, d.evidence,
            d.status, d.assignedTo, d.resolution, d.createdAt, d.resolvedAt, d.updatedAt,
            b.bookingNumber, b.finalPrice as bookingAmount, b.status as bookingStatus,
            b.scheduledDate, b.scheduledTime,
            s.title as serviceTitle,
            raiser.name as raiserName, raiser.email as raiserEmail,
            assignee.name as assigneeName
     FROM Dispute d
     JOIN Booking b ON d.bookingId = b.id
     JOIN Service s ON b.serviceId = s.id
     JOIN User raiser ON d.raisedBy = raiser.id
     LEFT JOIN User assignee ON d.assignedTo = assignee.id
     WHERE d.id = ?`,
    [disputeId]
  );

  if (!dispute) {
    return notFound('Dispute not found');
  }

  // Check access - user must be the raiser, the other party in booking, or admin
  const disputeData = dispute as { raisedBy: string; bookingId: string };
  const booking = await queryOne(
    context.env.DB,
    'SELECT clientId, providerId FROM Booking WHERE id = ?',
    [disputeData.bookingId]
  );

  if (booking) {
    const bookingData = booking as { clientId: string; providerId: string };
    if (disputeData.raisedBy !== user.userId &&
        bookingData.clientId !== user.userId &&
        bookingData.providerId !== user.userId &&
        user.role !== 'ADMIN') {
      return forbidden('You do not have access to this dispute');
    }
  }

  // Get dispute messages
  const messages = await query(
    context.env.DB,
    `SELECT dm.id, dm.senderId, dm.message, dm.attachments, dm.createdAt,
            u.name as senderName, u.email as senderEmail, u.profileImageUrl as senderImage
     FROM DisputeMessage dm
     JOIN User u ON dm.senderId = u.id
     WHERE dm.disputeId = ?
     ORDER BY dm.createdAt ASC`,
    [disputeId]
  );

  return json({
    dispute,
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

  const disputeId = sanitizeString(context.params.disputeId);

  // Check dispute exists
  const dispute = await queryOne(
    context.env.DB,
    'SELECT id, raisedBy, bookingId, status FROM Dispute WHERE id = ?',
    [disputeId]
  );

  if (!dispute) {
    return notFound('Dispute not found');
  }

  const disputeData = dispute as { raisedBy: string; bookingId: string; status: string };

  // Check access
  const booking = await queryOne(
    context.env.DB,
    'SELECT clientId, providerId FROM Booking WHERE id = ?',
    [disputeData.bookingId]
  );

  if (booking) {
    const bookingData = booking as { clientId: string; providerId: string };
    if (disputeData.raisedBy !== user.userId &&
        bookingData.clientId !== user.userId &&
        bookingData.providerId !== user.userId &&
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

  // Add dispute message
  const msgId = crypto.randomUUID();
  await execute(
    context.env.DB,
    `INSERT INTO DisputeMessage (id, disputeId, senderId, message, attachments, createdAt)
     VALUES (?, ?, ?, ?, ?, datetime('now'))`,
    [msgId, disputeId, user.userId, message, attachments]
  );

  // Update dispute status to UNDER_REVIEW if it was OPEN
  if (disputeData.status === 'OPEN') {
    await execute(
      context.env.DB,
      `UPDATE Dispute SET status = 'UNDER_REVIEW', updatedAt = datetime('now') WHERE id = ?`,
      [disputeId]
    );
  }

  // Notify the other party about the new message
  const otherPartyId = disputeData.raisedBy === user.userId
    ? (booking as { clientId: string; providerId: string } | null)?.clientId === user.userId
      ? (booking as { clientId: string; providerId: string }).providerId
      : (booking as { clientId: string; providerId: string }).clientId
    : disputeData.raisedBy;

  if (otherPartyId) {
    await execute(
      context.env.DB,
      `INSERT INTO Notification (id, userId, type, title, message, actionUrl, isRead, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, 0, datetime('now'))`,
      [
        crypto.randomUUID(),
        otherPartyId,
        'DISPUTE',
        'Dispute Update',
        'A new message has been added to the dispute',
        `/disputes/${disputeId}`,
      ]
    );
  }

  const newMessage = await queryOne(
    context.env.DB,
    'SELECT * FROM DisputeMessage WHERE id = ?',
    [msgId]
  );

  return json({ message: newMessage, disputeStatus: disputeData.status === 'OPEN' ? 'UNDER_REVIEW' : disputeData.status });
}
