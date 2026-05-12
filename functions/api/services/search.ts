/**
 * GET /api/services/search
 * Full-text search across service titles and descriptions.
 * Query params: q, categoryId, city, minPrice, maxPrice, page, limit
 */

import { query, queryOne } from '../../_shared/db';
import { json, serverError } from '../../_shared/response';
import { sanitizeString } from '../../_shared/security';

export async function onRequestGet(context: EventContext<Record<string, unknown>, string, unknown>): Promise<Response> {
  const { request, env } = context as { request: Request; env: { DB: D1Database } };

  try {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';
    const categoryId = url.searchParams.get('categoryId');
    const city = url.searchParams.get('city');
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');
    const page = Math.max(Number(url.searchParams.get('page')) || 1, 1);
    const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 20, 1), 100);
    const offset = (page - 1) * limit;

    // ─── Build WHERE conditions ──────────────────────────────────
    const conditions: string[] = [
      "s.isActive = 1",
      "s.approvalStatus = 'APPROVED'",
    ];
    const params: unknown[] = [];

    // Search query - match against title and description
    if (q) {
      const sanitizedQ = sanitizeString(q);
      conditions.push('(LOWER(s.title) LIKE LOWER(?) OR LOWER(s.description) LIKE LOWER(?))');
      const searchTerm = `%${sanitizedQ}%`;
      params.push(searchTerm);
      params.push(searchTerm);
    }

    if (categoryId) {
      conditions.push('s.categoryId = ?');
      params.push(Number(categoryId));
    }

    if (city) {
      conditions.push('LOWER(s.city) LIKE LOWER(?)');
      params.push(`%${sanitizeString(city)}%`);
    }

    if (minPrice) {
      conditions.push('s.basePrice >= ?');
      params.push(Number(minPrice));
    }

    if (maxPrice) {
      conditions.push('s.basePrice <= ?');
      params.push(Number(maxPrice));
    }

    const whereClause = conditions.join(' AND ');

    // ─── Count total matching services ───────────────────────────
    const countResult = await queryOne(
      env.DB,
      `SELECT COUNT(*) as total FROM Service s WHERE ${whereClause}`,
      params
    );
    const total = Number((countResult as Record<string, unknown>)?.total ?? 0);

    // ─── Fetch paginated search results ──────────────────────────
    const services = await query(
      env.DB,
      `SELECT s.id, s.title, s.description, s.basePrice, s.priceNegotiable,
              s.averageRating, s.totalBookings, s.totalReviews, s.city, s.images,
              s.serviceDurationMinutes, s.createdAt,
              u.id as providerId, u.name as providerName, u.profileImageUrl as providerImage,
              sc.id as categoryId, sc.name as categoryName, sc.slug as categorySlug, sc.icon as categoryIcon,
              ss.id as subcategoryId, ss.name as subcategoryName, ss.slug as subcategorySlug
       FROM Service s
       JOIN User u ON s.providerId = u.id
       JOIN ServiceCategory sc ON s.categoryId = sc.id
       LEFT JOIN ServiceSubcategory ss ON s.subcategoryId = ss.id
       WHERE ${whereClause}
       ORDER BY
         CASE WHEN LOWER(s.title) LIKE LOWER(?) THEN 0 ELSE 1 END,
         s.averageRating DESC, s.totalBookings DESC
       LIMIT ? OFFSET ?`,
      [...params, q ? `%${sanitizeString(q)}%` : '', limit, offset]
    );

    // ─── Transform to structured format ──────────────────────────
    const formattedServices = (services as Record<string, unknown>[]).map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      basePrice: s.basePrice,
      priceNegotiable: s.priceNegotiable,
      averageRating: s.averageRating,
      totalBookings: s.totalBookings,
      totalReviews: s.totalReviews,
      city: s.city,
      images: s.images,
      serviceDurationMinutes: s.serviceDurationMinutes,
      createdAt: s.createdAt,
      provider: {
        id: s.providerId,
        name: s.providerName,
        profileImageUrl: s.providerImage,
      },
      category: {
        id: s.categoryId,
        name: s.categoryName,
        slug: s.categorySlug,
        icon: s.categoryIcon,
      },
      subcategory: s.subcategoryId ? {
        id: s.subcategoryId,
        name: s.subcategoryName,
        slug: s.subcategorySlug,
      } : null,
    }));

    const totalPages = Math.ceil(total / limit);

    return json({
      services: formattedServices,
      query: q,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (err) {
    console.error('Search services error:', err);
    return serverError('Failed to search services');
  }
}
