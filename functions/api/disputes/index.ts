/**
 * GET /api/disputes - List user's disputes
 * POST /api/disputes - Create dispute (body: bookingId, reason, description)
 * Requires auth
 */

import { query, queryOne, execute } from '../../_shared/db';
import { requireAuth } from '../../_shared/auth';
import { json, unauthorized, notFound, error } from '../../_shared/response';
import { sanitizeString } from '../../_shared/security';

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

  const url = new URL(context.request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
  const status = url.searchParams.get('status');

  const conditions: string[] = ['d.raisedBy = ?'];
  const params: unknown[] = [user.userId];

  if (status) {
    conditions.push('d.status = ?');
    params.push(sanitizeString(status));
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  // Count
  const countResult = await queryOne(
    context.env.DB,
    `SELECT COUNT(*) as count FROM Dispute d ${whereClause}`,
    params
  );
  const total = (countResult as { count: number } | null)?.count ?? 0;

  // Fetch disputes
  const offset = (page - 1) * limit;
  const disputes = await query(
    context.env.DB,
    `SELECT d.id, d.disputeType, d.description, d.status, d.resolution, d.createdAt, d.resolvedAt,
            b.bookingNumber, b.finalPrice as bookingAmount, b.status as bookingStatus,
            s.title as serviceTitle
     FROM Dispute d
     JOIN Booking b ON d.bookingId = b.id
     JOIN Service s ON b.serviceId = s.id
     ${whereClause}
     ORDER BY d.createdAt DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return json({
    disputes,
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
  const booking = await queryOne(
    context.env.DB,
    'SELECT id, clientId, providerId, status FROM Booking WHERE id = ?',
    [bookingId]
  );

  if (!booking) {
    return notFound('Booking not found');
  }

  const bookingData = booking as { clientId: string; providerId: string; status: string };
  if (bookingData.clientId !== user.userId && bookingData.providerId !== user.userId) {
    return error('You can only raise disputes for your own bookings', 403);
  }

  // Check if dispute already exists for this booking
  const existingDispute = await queryOne(
    context.env.DB,
    "SELECT id FROM Dispute WHERE bookingId = ? AND status IN ('OPEN', 'UNDER_REVIEW')",
    [bookingId]
  );

  if (existingDispute) {
    return error('An active dispute already exists for this booking', 409);
  }

  const disputeId = crypto.randomUUID();

  await execute(
    context.env.DB,
    `INSERT INTO Dispute (id, bookingId, raisedBy, disputeType, description, status, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, 'OPEN', datetime('now'), datetime('now'))`,
    [disputeId, bookingId, user.userId, disputeType, description]
  );

  // Notify the other party
  const otherPartyId = bookingData.clientId === user.userId ? bookingData.providerId : bookingData.clientId;
  await execute(
    context.env.DB,
    `INSERT INTO Notification (id, userId, type, title, message, actionUrl, isRead, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, 0, datetime('now'))`,
    [
      crypto.randomUUID(),
      otherPartyId,
      'DISPUTE',
      'New Dispute Raised',
      `A dispute has been raised regarding your booking`,
      '/disputes',
    ]
  );

  const newDispute = await queryOne(
    context.env.DB,
    'SELECT * FROM Dispute WHERE id = ?',
    [disputeId]
  );

  return json({ dispute: newDispute, message: 'Dispute created successfully' }, 201);
}
