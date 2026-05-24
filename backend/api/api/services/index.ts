/**
 * GET /api/services
 * Returns paginated services with provider and category info.
 * Query params: limit, offset, categoryId, city, minPrice, maxPrice, search
 */

import { createSupabaseClient, Env } from '../../_shared/db';
import { json, serverError } from '../../_shared/response';
import { sanitizeString } from '../../_shared/security';

export async function onRequestGet(context: EventContext<Record<string, unknown>, string, unknown>): Promise<Response> {
  const { request, env } = context as unknown as { request: Request; env: Env };

  try {
    const url = new URL(request.url);
    const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 20, 1), 100);
    const offset = Math.max(Number(url.searchParams.get('offset')) || 0, 0);
    const categoryId = url.searchParams.get('categoryId');
    const city = url.searchParams.get('city');
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');
    const search = url.searchParams.get('search');

    const supabase = createSupabaseClient(env);

    // ─── Build query with PostgREST joins and filters ────────────
    const selectColumns = '*,provider:User!Service_providerId_fkey(id,name,profileImageUrl),category:ServiceCategory!Service_categoryId_fkey(id,name,slug,icon),subcategory:ServiceSubcategory!Service_subcategoryId_fkey(id,name,slug)';

    let query = supabase
      .from('Service')
      .select(selectColumns, { count: 'exact' })
      .eq('isActive', true)
      .eq('approvalStatus', 'APPROVED');

    if (categoryId) {
      query = query.eq('categoryId', Number(categoryId));
    }

    if (city) {
      query = query.ilike('city', `%${sanitizeString(city)}%`);
    }

    if (minPrice) {
      query = query.gte('basePrice', Number(minPrice));
    }

    if (maxPrice) {
      query = query.lte('basePrice', Number(maxPrice));
    }

    if (search) {
      const sanitizedSearch = sanitizeString(search).replace(/[%(),]/g, '');
      query = query.or(`title.ilike.%${sanitizedSearch}%,description.ilike.%${sanitizedSearch}%`);
    }

    // ─── Execute count + data query together ─────────────────────
    const { data: services, count, error: svcError } = await query
      .order('averageRating', { ascending: false })
      .order('totalBookings', { ascending: false })
      .range(offset, offset + limit - 1);

    if (svcError) {
      console.error('Get services error:', svcError);
      return serverError('Failed to fetch services');
    }

    const total = count ?? 0;

    // ─── Transform to structured format matching original response ──
    const formattedServices = (services || []).map((s: Record<string, unknown>) => ({
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
      provider: s.provider || null,
      category: s.category || null,
      subcategory: s.subcategoryId ? (s.subcategory || null) : null,
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
