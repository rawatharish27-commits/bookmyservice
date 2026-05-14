/**
 * GET /api/bookings/:id - Returns booking details
 *   - Only accessible if user is the client, provider, or admin
 */

import { createSupabaseClient, Env } from '../../_shared/db';
import { requireAuth } from '../../_shared/auth';
import { json, unauthorized, forbidden, notFound } from '../../_shared/response';

export async function onRequestGet(context: { request: Request; env: Env; params: { id: string } }): Promise<Response> {
  try {
    const user = await requireAuth(context.request, context.env);
    if (!user) return unauthorized();

    const bookingId = context.params.id;

    const supabase = createSupabaseClient(context.env);

    const { data: booking, error: fetchError } = await supabase
      .from('Booking')
      .select('*,service:Service!Booking_serviceId_fkey(title,description,basePrice,images,serviceDurationMinutes,category:ServiceCategory!Service_categoryId_fkey(name,icon)),client:User!Booking_clientId_fkey(name,email,phone,profileImageUrl),provider:User!Booking_providerId_fkey(name,email,phone,profileImageUrl)')
      .eq('id', bookingId)
      .maybeSingle();

    if (fetchError) {
      console.error('Get booking error:', fetchError);
      return notFound('Booking not found');
    }

    if (!booking) {
      return notFound('Booking not found');
    }

    const bookingData = booking as Record<string, unknown>;

    // Check access: client, provider, or admin only
    if (
      user.role !== 'ADMIN' &&
      user.userId !== bookingData.clientId &&
      user.userId !== bookingData.providerId
    ) {
      return forbidden('You do not have access to this booking');
    }

    // Fetch any review for this booking
    const { data: review } = await supabase
      .from('Review')
      .select('id,rating,comment,createdAt')
      .eq('bookingId', bookingId)
      .maybeSingle();

    // Flatten nested objects for backward compatibility
    const service = (bookingData.service as Record<string, unknown>) || {};
    const serviceCategory = (service.category as Record<string, unknown>) || {};
    const client = (bookingData.client as Record<string, unknown>) || {};
    const provider = (bookingData.provider as Record<string, unknown>) || {};

    const flatBooking = {
      ...bookingData,
      serviceTitle: service.title ?? null,
      serviceDescription: service.description ?? null,
      serviceBasePrice: service.basePrice ?? null,
      serviceImages: service.images ?? null,
      serviceDurationMinutes: service.serviceDurationMinutes ?? null,
      categoryName: serviceCategory.name ?? null,
      categoryIcon: serviceCategory.icon ?? null,
      clientName: client.name ?? null,
      clientEmail: client.email ?? null,
      clientPhone: client.phone ?? null,
      clientProfileImage: client.profileImageUrl ?? null,
      providerName: provider.name ?? null,
      providerEmail: provider.email ?? null,
      providerPhone: provider.phone ?? null,
      providerProfileImage: provider.profileImageUrl ?? null,
      review: review || null,
      // Remove nested objects
      service: undefined,
      client: undefined,
      provider: undefined,
    };

    return json(flatBooking);
  } catch (err) {
    if ((err as Error).message === 'UNAUTHORIZED') return unauthorized();
    console.error('Get booking error:', err);
    return notFound('Booking not found');
  }
}
