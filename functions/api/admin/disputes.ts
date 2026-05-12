/**
 * GET /api/admin/disputes - List disputes
 * POST /api/admin/disputes - Create/resolve dispute
 * Requires ADMIN role
 */

import { query, queryOne, execute } from '../../_shared/db';
import { requireAuth, requireRole } from '../../_shared/auth';
import { json, unauthorized, forbidden, notFound, error } from '../../_shared/response';
import { sanitizeString, sanitizeObject, getClientIP } from '../../_shared/security';

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

  const url = new URL(context.request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
  const status = url.searchParams.get('status');

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (status) {
    conditions.push('d.status = ?');
    params.push(sanitizeString(status));
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

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
            b.bookingNumber, b.finalPrice as bookingAmount,
            raiser.name as raiserName, raiser.email as raiserEmail,
            assignee.name as assigneeName
     FROM Dispute d
     JOIN Booking b ON d.bookingId = b.id
     JOIN User raiser ON d.raisedBy = raiser.id
     LEFT JOIN User assignee ON d.assignedTo = assignee.id
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

  // Check dispute exists
  const existingDispute = await queryOne(
    context.env.DB,
    'SELECT id, status, disputeType FROM Dispute WHERE id = ?',
    [disputeId]
  );

  if (!existingDispute) {
    return notFound('Dispute not found');
  }

  if (action === 'RESOLVE') {
    if (!body.resolution) {
      return error('resolution is required when resolving a dispute');
    }

    const resolution = sanitizeString(body.resolution);

    await execute(
      context.env.DB,
      `UPDATE Dispute SET status = 'RESOLVED', resolution = ?, assignedTo = ?, resolvedAt = datetime('now'), updatedAt = datetime('now')
       WHERE id = ?`,
      [resolution, user.userId, disputeId]
    );

    // Log action
    const ip = getClientIP(context.request);
    const userAgent = context.request.headers.get('User-Agent') || null;
    await execute(
      context.env.DB,
      `INSERT INTO AdminLog (id, adminId, action, targetType, targetId, details, ipAddress, userAgent, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        crypto.randomUUID(),
        user.userId,
        'RESOLVE_DISPUTE',
        'DISPUTE',
        disputeId,
        JSON.stringify({ resolution }),
        ip,
        userAgent,
      ]
    );

    // Notify the raiser
    const disputeInfo = await queryOne(
      context.env.DB,
      'SELECT raisedBy, bookingId FROM Dispute WHERE id = ?',
      [disputeId]
    );
    if (disputeInfo) {
      const { raisedBy } = disputeInfo as { raisedBy: string; bookingId: string };
      await execute(
        context.env.DB,
        `INSERT INTO Notification (id, userId, type, title, message, actionUrl, isRead, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, 0, datetime('now'))`,
        [
          crypto.randomUUID(),
          raisedBy,
          'DISPUTE',
          'Dispute Resolved',
          `Your dispute has been resolved. Resolution: ${resolution}`,
          '/disputes',
        ]
      );
    }

    return json({ message: 'Dispute resolved successfully', disputeId });
  }

  if (action === 'ASSIGN') {
    if (!body.assignedTo) {
      return error('assignedTo is required when assigning a dispute');
    }

    const assignedTo = sanitizeString(body.assignedTo);

    await execute(
      context.env.DB,
      `UPDATE Dispute SET assignedTo = ?, status = 'UNDER_REVIEW', updatedAt = datetime('now') WHERE id = ?`,
      [assignedTo, disputeId]
    );

    // Log action
    const ip = getClientIP(context.request);
    const userAgent = context.request.headers.get('User-Agent') || null;
    await execute(
      context.env.DB,
      `INSERT INTO AdminLog (id, adminId, action, targetType, targetId, details, ipAddress, userAgent, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        crypto.randomUUID(),
        user.userId,
        'ASSIGN_DISPUTE',
        'DISPUTE',
        disputeId,
        JSON.stringify({ assignedTo }),
        ip,
        userAgent,
      ]
    );

    return json({ message: 'Dispute assigned successfully', disputeId });
  }

  if (action === 'CLOSE') {
    await execute(
      context.env.DB,
      `UPDATE Dispute SET status = 'CLOSED', updatedAt = datetime('now') WHERE id = ?`,
      [disputeId]
    );

    return json({ message: 'Dispute closed successfully', disputeId });
  }

  return error('Invalid action. Must be one of: RESOLVE, ASSIGN, CLOSE');
}
