/**
 * GET /api/providers/nearby - Find nearby service providers
 *   - Public endpoint (no auth required, but auth optional for personalized results)
 *   - Query params: latitude, longitude, categoryId, radius (default 10km)
 */

import { createSupabaseClient, Env } from '../../_shared/db';
import { json, error } from '../../_shared/response';

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function onRequestGet(context: { request: Request; env: Env; params: Record<string, string> }): Promise<Response> {
  try {
    const url = new URL(context.request.url);
    const latitude = parseFloat(url.searchParams.get('latitude') || '');
    const longitude = parseFloat(url.searchParams.get('longitude') || '');
    const categoryId = url.searchParams.get('categoryId');
    const radius = parseInt(url.searchParams.get('radius') || '10', 10);

    if (isNaN(latitude) || isNaN(longitude)) {
      return error('latitude and longitude are required');
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return error('Invalid latitude/longitude values');
    }

    const supabase = createSupabaseClient(context.env);

    // Build query for active approved services
    let query = supabase
      .from('Service')
      .select('id,title,basePrice,latitude,longitude,serviceAreaRadiusKm,city,averageRating,totalBookings,provider:User!Service_providerId_fkey(id,name,phone,profileImageUrl,latitude,longitude),category:ServiceCategory!Service_categoryId_fkey(id,name)')
      .eq('isActive', true)
      .eq('approvalStatus', 'APPROVED');

    if (categoryId) {
      query = query.eq('categoryId', parseInt(categoryId, 10));
    }

    const { data: services, error: fetchError } = await query;

    if (fetchError) {
      console.error('Nearby providers fetch error:', fetchError);
      return error('Failed to fetch nearby providers', 500);
    }

    // Calculate distances and filter by radius
    interface ServiceWithProvider {
      id: string;
      title: string;
      basePrice: number;
      latitude: number | null;
      longitude: number | null;
      serviceAreaRadiusKm: number | null;
      city: string | null;
      averageRating: number;
      totalBookings: number;
      provider: Record<string, unknown> | null;
      category: Record<string, unknown> | null;
    }

    const nearbyProviders = ((services || []) as ServiceWithProvider[])
      .filter(s => s.latitude && s.longitude)
      .map(s => {
        const distance = haversineDistance(latitude, longitude, s.latitude!, s.longitude!);
        const maxRadius = s.serviceAreaRadiusKm || 10;
        return { ...s, distance, maxRadius };
      })
      .filter(s => s.distance <= radius && s.distance <= s.maxRadius)
      .sort((a, b) => a.distance - b.distance)
      .map(s => ({
        serviceId: s.id,
        serviceTitle: s.title,
        basePrice: s.basePrice,
        distanceKm: Math.round(s.distance * 10) / 10,
        city: s.city,
        averageRating: s.averageRating,
        totalBookings: s.totalBookings,
        providerId: (s.provider as Record<string, unknown>)?.id ?? null,
        providerName: (s.provider as Record<string, unknown>)?.name ?? null,
        providerProfileImage: (s.provider as Record<string, unknown>)?.profileImageUrl ?? null,
        categoryId: (s.category as Record<string, unknown>)?.id ?? null,
        categoryName: (s.category as Record<string, unknown>)?.name ?? null,
      }));

    return json({
      providers: nearbyProviders,
      searchCenter: { latitude, longitude },
      radius,
      total: nearbyProviders.length,
    });
  } catch (err) {
    console.error('Nearby providers error:', err);
    return error('Failed to find nearby providers', 500);
  }
}
