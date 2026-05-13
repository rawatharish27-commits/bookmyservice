/**
 * GET /api/services/:id
 * Returns single service with full details, provider info, and reviews.
 */

import { createSupabaseClient, Env } from '../../_shared/db';
import { json, notFound, serverError } from '../../_shared/response';

export async function onRequestGet(context: EventContext<Record<string, unknown>, string, unknown>): Promise<Response> {
  const { env, params } = context as unknown as { env: Env; params: { id: string } };

  try {
    const serviceId = String(params.id);

    if (!serviceId) {
      return json({ error: 'Invalid service ID' }, 400);
    }

    const supabase = createSupabaseClient(env);

    // ─── Fetch service with provider and category info ───────────
    const { data: service, error: svcError } = await supabase
      .from('Service')
      .select('*,provider:User!Service_providerId_fkey(id,name,email,phone,profileImageUrl,city,providerKyc:ProviderKyc!ProviderKyc_providerId_fkey(verificationStatus)),category:ServiceCategory!Service_categoryId_fkey(id,name,slug,icon),subcategory:ServiceSubcategory!Service_subcategoryId_fkey(id,name,slug)')
      .eq('id', serviceId)
      .maybeSingle();

    if (svcError) {
      console.error('Get service error:', svcError);
      return serverError('Failed to fetch service');
    }

    if (!service) {
      return notFound('Service not found');
    }

    // ─── Fetch availability slots ────────────────────────────────
    const { data: availability, error: availError } = await supabase
      .from('ServiceAvailability')
      .select('id,dayOfWeek,startTime,endTime,isAvailable,maxBookingsPerSlot')
      .eq('serviceId', serviceId)
      .order('dayOfWeek')
      .order('startTime');

    if (availError) {
      console.error('Get availability error:', availError);
      // Non-fatal — continue without availability
    }

    // ─── Fetch reviews for this service ──────────────────────────
    const { data: reviews, error: revError } = await supabase
      .from('Review')
      .select('id,rating,comment,isVerified,createdAt,reviewer:User!Review_reviewerId_fkey(id,name,profileImageUrl)')
      .eq('serviceId', serviceId)
      .order('createdAt', { ascending: false })
      .limit(50);

    if (revError) {
      console.error('Get reviews error:', revError);
      // Non-fatal — continue without reviews
    }

    // ─── Build structured response ───────────────────────────────
    const s = service as Record<string, unknown>;
    const provider = (s.provider as Record<string, unknown>) || {};
    const providerKyc = (provider.providerKyc as Record<string, unknown>[]) || [];

    const formattedService = {
      id: s.id,
      title: s.title,
      description: s.description,
      basePrice: s.basePrice,
      priceNegotiable: s.priceNegotiable,
      averageRating: s.averageRating,
      totalBookings: s.totalBookings,
      totalReviews: s.totalReviews,
      city: s.city,
      state: s.state,
      country: s.country,
      address: s.address,
      pincode: s.pincode,
      images: s.images,
      serviceDurationMinutes: s.serviceDurationMinutes,
      serviceAreaRadiusKm: s.serviceAreaRadiusKm,
      isActive: s.isActive,
      approvalStatus: s.approvalStatus,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      provider: {
        id: provider.id,
        name: provider.name,
        email: provider.email,
        phone: provider.phone,
        profileImageUrl: provider.profileImageUrl,
        city: provider.city,
        kycStatus: providerKyc.length > 0 ? providerKyc[0].verificationStatus : null,
      },
      category: s.category || null,
      subcategory: s.subcategoryId ? (s.subcategory || null) : null,
      availability: (availability || []).map((a: Record<string, unknown>) => ({
        id: a.id,
        dayOfWeek: a.dayOfWeek,
        startTime: a.startTime,
        endTime: a.endTime,
        isAvailable: a.isAvailable,
        maxBookingsPerSlot: a.maxBookingsPerSlot,
      })),
      reviews: (reviews || []).map((r: Record<string, unknown>) => {
        const reviewer = (r.reviewer as Record<string, unknown>) || {};
        return {
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          isVerified: r.isVerified,
          createdAt: r.createdAt,
          reviewer: {
            id: reviewer.id,
            name: reviewer.name,
            profileImageUrl: reviewer.profileImageUrl,
          },
        };
      }),
    };

    return json({ service: formattedService });
  } catch (err) {
    console.error('Get service error:', err);
    return serverError('Failed to fetch service');
  }
}
