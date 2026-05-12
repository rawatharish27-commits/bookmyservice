/**
 * GET /api/services
 * Returns paginated services with provider and category info.
 * Query params: limit, offset, categoryId, city, minPrice, maxPrice, search
 */

import { query, queryOne } from '../../_shared/db';
import { json, serverError } from '../../_shared/response';
import { sanitizeString } from '../../_shared/security';

export async function onRequestGet(context: EventContext<Record<string, unknown>, string, unknown>): Promise<Response> {
  const { request, env } = context as { request: Request; env: { DB: D1Database } };

  try {
    const url = new URL(request.url);
    const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 20, 1), 100);
    const offset = Math.max(Number(url.searchParams.get('offset')) || 0, 0);
    const categoryId = url.searchParams.get('categoryId');
    const city = url.searchParams.get('city');
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');
    const search = url.searchParams.get('search');

    // ─── Build WHERE conditions ──────────────────────────────────
    const conditions: string[] = [
      "s.isActive = 1",
      "s.approvalStatus = 'APPROVED'",
    ];
    const params: unknown[] = [];

    if (categoryId) {
      conditions.push('s.categoryId = ?');
      params.push(Number(categoryId));
    }

    if (city) {
      conditions.push('LOWER(s.city) = LOWER(?)');
      params.push(sanitizeString(city));
    }

    if (minPrice) {
      conditions.push('s.basePrice >= ?');
      params.push(Number(minPrice));
    }

    if (maxPrice) {
      conditions.push('s.basePrice <= ?');
      params.push(Number(maxPrice));
    }

    if (search) {
      conditions.push('(LOWER(s.title) LIKE LOWER(?) OR LOWER(s.description) LIKE LOWER(?))');
      const searchTerm = `%${sanitizeString(search)}%`;
      params.push(searchTerm);
      params.push(searchTerm);
    }

    const whereClause = conditions.join(' AND ');

    // ─── Count total matching services ───────────────────────────
    const countResult = await queryOne(
      env.DB,
      `SELECT COUNT(*) as total FROM Service s WHERE ${whereClause}`,
      params
    );
    const total = (countResult as Record<string, unknown>)?.total ?? 0;

    // ─── Fetch paginated services ────────────────────────────────
    const services = await query(
      env.DB,
      `SELECT s.id, s.title, s.description, s.basePrice, s.priceNegotiable,
              s.averageRating, s.totalBookings, s.totalReviews, s.city, s.images,
              s.serviceDurationMinutes, s.createdAt, s.updatedAt,
              u.id as providerId, u.name as providerName, u.profileImageUrl as providerImage,
              sc.id as categoryId, sc.name as categoryName, sc.slug as categorySlug, sc.icon as categoryIcon,
              ss.id as subcategoryId, ss.name as subcategoryName, ss.slug as subcategorySlug
       FROM Service s
       JOIN User u ON s.providerId = u.id
       JOIN ServiceCategory sc ON s.categoryId = sc.id
       LEFT JOIN ServiceSubcategory ss ON s.subcategoryId = ss.id
       WHERE ${whereClause}
       ORDER BY s.averageRating DESC, s.totalBookings DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
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
      updatedAt: s.updatedAt,
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

    return json({
      services: formattedServices,
      pagination: {
        total: Number(total),
        limit,
        offset,
        hasMore: offset + limit < Number(total),
      },
    });
  } catch (err) {
    console.error('Get services error:', err);
    return serverError('Failed to fetch services');
  }
}
