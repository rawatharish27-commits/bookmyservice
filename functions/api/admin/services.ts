/**
 * GET /api/admin/services - List all services (including PENDING)
 * PATCH /api/admin/services - Approve/reject services (body: serviceId, status)
 * Requires ADMIN role
 */

import { query, queryOne, execute } from '../../_shared/db';
import { requireAuth, requireRole } from '../../_shared/auth';
import { json, unauthorized, forbidden, notFound, error } from '../../_shared/response';
import { sanitizeString, getClientIP } from '../../_shared/security';

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
  const status = url.searchParams.get('status'); // PENDING, APPROVED, REJECTED

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (status) {
    conditions.push('s.approvalStatus = ?');
    params.push(sanitizeString(status));
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Count
  const countResult = await queryOne(
    context.env.DB,
    `SELECT COUNT(*) as count FROM Service s ${whereClause}`,
    params
  );
  const total = (countResult as { count: number } | null)?.count ?? 0;

  // Fetch services
  const offset = (page - 1) * limit;
  const services = await query(
    context.env.DB,
    `SELECT s.id, s.title, s.description, s.basePrice, s.approvalStatus, s.isActive,
            s.city, s.averageRating, s.totalBookings, s.totalReviews, s.createdAt,
            sc.name as categoryName, sc.slug as categorySlug,
            u.name as providerName, u.email as providerEmail
     FROM Service s
     JOIN ServiceCategory sc ON s.categoryId = sc.id
     JOIN User u ON s.providerId = u.id
     ${whereClause}
     ORDER BY s.createdAt DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return json({
    services,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
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

  // Check service exists
  const existingService = await queryOne(
    context.env.DB,
    'SELECT id, title, approvalStatus FROM Service WHERE id = ?',
    [serviceId]
  );

  if (!existingService) {
    return notFound('Service not found');
  }

  const isActive = newStatus === 'APPROVED' ? 1 : 0;
  const isApproved = newStatus === 'APPROVED' ? 1 : 0;

  await execute(
    context.env.DB,
    `UPDATE Service SET approvalStatus = ?, isActive = ?, isApproved = ?, approvedBy = ?, approvedAt = datetime('now'),
            rejectionReason = ?, updatedAt = datetime('now') WHERE id = ?`,
    [newStatus, isActive, isApproved, user.userId, rejectionReason, serviceId]
  );

  // Log admin action
  const ip = getClientIP(context.request);
  const userAgent = context.request.headers.get('User-Agent') || null;
  await execute(
    context.env.DB,
    `INSERT INTO AdminLog (id, adminId, action, targetType, targetId, details, ipAddress, userAgent, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    [
      crypto.randomUUID(),
      user.userId,
      newStatus === 'APPROVED' ? 'APPROVE_SERVICE' : 'REJECT_SERVICE',
      'SERVICE',
      serviceId,
      JSON.stringify({
        previousStatus: (existingService as { approvalStatus: string }).approvalStatus,
        newStatus,
        rejectionReason,
      }),
      ip,
      userAgent,
    ]
  );

  // Create notification for the provider
  const serviceInfo = await queryOne(
    context.env.DB,
    'SELECT providerId FROM Service WHERE id = ?',
    [serviceId]
  );

  if (serviceInfo) {
    const providerId = (serviceInfo as { providerId: string }).providerId;
    const notifTitle = newStatus === 'APPROVED' ? 'Service Approved' : 'Service Rejected';
    const notifMessage = newStatus === 'APPROVED'
      ? `Your service "${(existingService as { title: string }).title}" has been approved`
      : `Your service "${(existingService as { title: string }).title}" has been rejected${rejectionReason ? `. Reason: ${rejectionReason}` : ''}`;

    await execute(
      context.env.DB,
      `INSERT INTO Notification (id, userId, type, title, message, actionUrl, isRead, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, 0, datetime('now'))`,
      [
        crypto.randomUUID(),
        providerId,
        'SERVICE_STATUS',
        notifTitle,
        notifMessage,
        `/provider/services`,
      ]
    );
  }

  return json({
    message: `Service ${newStatus.toLowerCase()} successfully`,
    service: { id: serviceId, approvalStatus: newStatus },
  });
}
