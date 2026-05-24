/**
 * GET /api/favorites - Get client's favorite services
 * POST /api/favorites - Add service to favorites (body: serviceId)
 * Requires CLIENT role
 */

import { createSupabaseClient, Env } from '../../_shared/db';
import { requireAuth, requireRole } from '../../_shared/auth';
import { json, unauthorized, forbidden, notFound, error } from '../../_shared/response';
import { sanitizeString } from '../../_shared/security';

interface EventContext {
  request: Request;
  env: Env;
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

  const supabase = createSupabaseClient(context.env);
  const url = new URL(context.request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));

  const offset = (page - 1) * limit;

  // Fetch favorites with service details using PostgREST joins
  const { data: favorites, error: favError, count } = await supabase
    .from('Favorite')
    .select('id,createdAt,service:Service(id,title,description,basePrice,images,city,averageRating,totalReviews,isActive,approvalStatus,category:ServiceCategory(name,slug,icon),provider:User!Service_providerId_fkey(name,profileImageUrl))', { count: 'exact' })
    .eq('userId', user.userId)
    .order('createdAt', { ascending: false })
    .range(offset, offset + limit - 1);

  if (favError) {
    console.error('Get favorites error:', favError);
    return error('Failed to fetch favorites', 500);
  }

  // Flatten the join results
  const flatFavorites = (favorites as Record<string, unknown>[] || []).map((f) => {
    const service = f.service as Record<string, unknown> | null;
    const category = service?.category as Record<string, unknown> | null;
    const provider = service?.provider as Record<string, unknown> | null;
    return {
      favoriteId: f.id,
      favoritedAt: f.createdAt,
      id: service?.id ?? null,
      title: service?.title ?? null,
      description: service?.description ?? null,
      basePrice: service?.basePrice ?? null,
      images: service?.images ?? null,
      city: service?.city ?? null,
      averageRating: service?.averageRating ?? null,
      totalReviews: service?.totalReviews ?? null,
      isActive: service?.isActive ?? null,
      approvalStatus: service?.approvalStatus ?? null,
      categoryName: category?.name ?? null,
      categorySlug: category?.slug ?? null,
      categoryIcon: category?.icon ?? null,
      providerName: provider?.name ?? null,
      providerImage: provider?.profileImageUrl ?? null,
    };
  });

  const total = count || 0;

  return json({
    favorites: flatFavorites,
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

  const supabase = createSupabaseClient(context.env);

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
  const { data: service } = await supabase
    .from('Service')
    .select('id,title')
    .eq('id', serviceId)
    .maybeSingle();

  if (!service) {
    return notFound('Service not found');
  }

  // Check if already favorited
  const { data: existing } = await supabase
    .from('Favorite')
    .select('id')
    .eq('userId', user.userId)
    .eq('serviceId', serviceId)
    .maybeSingle();

  if (existing) {
    return error('Service already in favorites', 409);
  }

  const now = new Date().toISOString();
  const { error: insertError } = await supabase
    .from('Favorite')
    .insert({
      id: crypto.randomUUID(),
      userId: user.userId,
      serviceId,
      createdAt: now,
    });

  if (insertError) {
    console.error('Add favorite error:', insertError);
    return error('Failed to add favorite', 500);
  }

  return json({ message: 'Service added to favorites' }, 201);
}
