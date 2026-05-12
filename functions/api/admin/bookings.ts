/**
 * GET /api/admin/bookings - List all bookings with pagination
 * Requires ADMIN role
 */

import { query, queryOne } from '../../_shared/db';
import { requireAuth, requireRole } from '../../_shared/auth';
import { json, unauthorized, forbidden } from '../../_shared/response';
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

  if (!requireRole(user, 'ADMIN')) {
    return forbidden('Admin access required');
  }

  const url = new URL(context.request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
  const status = url.searchParams.get('status');
  const search = url.searchParams.get('search');

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (status) {
    conditions.push('b.status = ?');
    params.push(sanitizeString(status));
  }

  if (search) {
    const sanitizedSearch = sanitizeString(search);
    conditions.push('(b.bookingNumber LIKE ? OR c.name LIKE ? OR p.name LIKE ? OR s.title LIKE ?)');
    params.push(`%${sanitizedSearch}%`, `%${sanitizedSearch}%`, `%${sanitizedSearch}%`, `%${sanitizedSearch}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Count total
  const countResult = await queryOne(
    context.env.DB,
    `SELECT COUNT(*) as count FROM Booking b
     JOIN User c ON b.clientId = c.id
     JOIN User p ON b.providerId = p.id
     JOIN Service s ON b.serviceId = s.id
     ${whereClause}`,
    params
  );
  const total = (countResult as { count: number } | null)?.count ?? 0;

  // Fetch bookings
  const offset = (page - 1) * limit;
  const bookings = await query(
    context.env.DB,
    `SELECT b.id, b.bookingNumber, b.status, b.scheduledDate, b.scheduledTime,
            b.finalPrice, b.platformFee, b.providerEarnings, b.paymentStatus,
            b.serviceAddress, b.specialInstructions, b.createdAt, b.completedAt,
            c.name as clientName, c.email as clientEmail, c.phone as clientPhone,
            p.name as providerName, p.email as providerEmail, p.phone as providerPhone,
            s.title as serviceTitle, sc.name as categoryName
     FROM Booking b
     JOIN User c ON b.clientId = c.id
     JOIN User p ON b.providerId = p.id
     JOIN Service s ON b.serviceId = s.id
     LEFT JOIN ServiceCategory sc ON s.categoryId = sc.id
     ${whereClause}
     ORDER BY b.createdAt DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return json({
    bookings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
