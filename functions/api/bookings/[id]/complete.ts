/**
 * POST /api/bookings/:id/complete - Provider completes the service
 *   - Provider only
 *   - Changes status to 'COMPLETED', sets completedAt
 */

import { createSupabaseClient, Env } from '../../../_shared/db';
import { requireAuth, requireRole } from '../../../_shared/auth';
import { json, unauthorized, forbidden, notFound, error } from '../../../_shared/response';

export async function onRequestPost(context: { request: Request; env: Env; params: { id: string } }): Promise<Response> {
  try {
    const user = await requireAuth(context.request, context.env);
    if (!user) return unauthorized();

    // Provider only
    if (!requireRole(user, 'PROVIDER') && !requireRole(user, 'ADMIN')) {
      return forbidden('Only providers can complete bookings');
    }

    const bookingId = context.params.id;
    const supabase = createSupabaseClient(context.env);

    const { data: booking, error: fetchError } = await supabase
      .from('Booking')
      .select('*')
      .eq('id', bookingId)
      .maybeSingle();

    if (fetchError) {
      console.error('Complete booking error:', fetchError);
      return error('Failed to fetch booking', 500);
    }

    if (!booking) {
      return notFound('Booking not found');
    }

    const bookingData = booking as Record<string, unknown>;

    // Must be the assigned provider
    if (user.userId !== bookingData.providerId && user.role !== 'ADMIN') {
      return forbidden('You are not the assigned provider for this booking');
    }

    // Only IN_PROGRESS bookings can be completed
    if (bookingData.status !== 'IN_PROGRESS') {
      return error(`Booking cannot be completed. Current status: ${bookingData.status}`);
    }

    const now = new Date().toISOString();

    const { error: updateError } = await supabase
      .from('Booking')
      .update({
        status: 'COMPLETED',
        completedAt: now,
        updatedAt: now,
      })
      .eq('id', bookingId);

    if (updateError) {
      console.error('Complete booking update error:', updateError);
      return error('Failed to complete booking', 500);
    }

    // Update service total bookings count (read-then-write since PostgREST doesn't support atomic increment)
    const { data: serviceData } = await supabase
      .from('Service')
      .select('totalBookings')
      .eq('id', String(bookingData.serviceId))
      .maybeSingle();

    if (serviceData) {
      const currentBookings = Number((serviceData as Record<string, unknown>).totalBookings) || 0;
      await supabase
        .from('Service')
        .update({ totalBookings: currentBookings + 1 })
        .eq('id', String(bookingData.serviceId));
    }

    // Notify the client
    const notifId = `notif_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
    await supabase
      .from('Notification')
      .insert({
        id: notifId,
        userId: String(bookingData.clientId),
        type: 'BOOKING',
        title: 'Service Completed',
        message: 'Your service has been completed. Please leave a review!',
        actionUrl: `/bookings/${bookingId}`,
        createdAt: now,
      });

    return json({ message: 'Booking completed successfully', bookingId, status: 'COMPLETED' });
  } catch (err) {
    if ((err as Error).message === 'UNAUTHORIZED') return unauthorized();
    console.error('Complete booking error:', err);
    return error('Failed to complete booking', 500);
  }
}
