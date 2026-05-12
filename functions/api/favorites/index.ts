/**
 * GET /api/favorites - Get client's favorite services
 * POST /api/favorites - Add service to favorites (body: serviceId)
 * Requires CLIENT role
 */

import { query, queryOne, execute } from '../../_shared/db';
import { requireAuth, requireRole } from '../../_shared/auth';
import { json, unauthorized, forbidden, notFound, error } from '../../_shared/response';
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

  if (!requireRole(user, 'CLIENT')) {
    return forbidden('Client access required');
  }

  const url = new URL(context.request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));

  const offset = (page - 1) * limit;

  // Count
  const countResult = await queryOne(
    context.env.DB,
    'SELECT COUNT(*) as count FROM Favorite WHERE userId = ?',
    [user.userId]
  );
  const total = (countResult as { count: number } | null)?.count ?? 0;

  // Fetch favorites with service details
  const favorites = await query(
    context.env.DB,
    `SELECT f.id as favoriteId, f.createdAt as favoritedAt,
            s.id, s.title, s.description, s.basePrice, s.images, s.city,
            s.averageRating, s.totalReviews, s.isActive, s.approvalStatus,
            sc.name as categoryName, sc.slug as categorySlug, sc.icon as categoryIcon,
            u.name as providerName, u.profileImageUrl as providerImage
     FROM Favorite f
     JOIN Service s ON f.serviceId = s.id
     LEFT JOIN ServiceCategory sc ON s.categoryId = sc.id
     LEFT JOIN User u ON s.providerId = u.id
     WHERE f.userId = ?
     ORDER BY f.createdAt DESC
     LIMIT ? OFFSET ?`,
    [user.userId, limit, offset]
  );

  return json({
    favorites,
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

  if (!requireRole(user, 'CLIENT')) {
    return forbidden('Client access required');
  }

  let body;
  try {
    body = await context.request.json() as { serviceId?: string };
  } catch {
    return error('Invalid request body');
  }

  if (!body.serviceId) {
    return error('serviceId is required');
  }

  const serviceId = sanitizeString(body.serviceId);

  // Check service exists
  const service = await queryOne(
    context.env.DB,
    'SELECT id, title FROM Service WHERE id = ?',
    [serviceId]
  );

  if (!service) {
    return notFound('Service not found');
  }

  // Check if already favorited
  const existing = await queryOne(
    context.env.DB,
    'SELECT id FROM Favorite WHERE userId = ? AND serviceId = ?',
    [user.userId, serviceId]
  );

  if (existing) {
    return error('Service already in favorites', 409);
  }

  await execute(
    context.env.DB,
    `INSERT INTO Favorite (id, userId, serviceId, createdAt) VALUES (?, ?, ?, datetime('now'))`,
    [crypto.randomUUID(), user.userId, serviceId]
  );

  return json({ message: 'Service added to favorites' }, 201);
}
