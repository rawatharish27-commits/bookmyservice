/**
 * POST /api/bookings/:id/start - Provider starts the service
 *   - Provider only
 *   - Changes status to 'IN_PROGRESS'
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
      return forbidden('Only providers can start bookings');
    }

    const bookingId = context.params.id;
    const supabase = createSupabaseClient(context.env);

    const { data: booking, error: fetchError } = await supabase
      .from('Booking')
      .select('*')
      .eq('id', bookingId)
      .maybeSingle();

    if (fetchError) {
      console.error('Start booking error:', fetchError);
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

    // Only CONFIRMED bookings can be started
    if (bookingData.status !== 'CONFIRMED') {
      return error(`Booking cannot be started. Current status: ${bookingData.status}`);
    }

    const now = new Date().toISOString();

    const { error: updateError } = await supabase
      .from('Booking')
      .update({
        status: 'IN_PROGRESS',
        updatedAt: now,
      })
      .eq('id', bookingId);

    if (updateError) {
      console.error('Start booking update error:', updateError);
      return error('Failed to start booking', 500);
    }

    // Notify the client
    const notifId = `notif_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
    await supabase
      .from('Notification')
      .insert({
        id: notifId,
        userId: String(bookingData.clientId),
        type: 'BOOKING',
        title: 'Service Started',
        message: 'Your service provider has started the service',
        actionUrl: `/bookings/${bookingId}`,
        createdAt: now,
      });

    return json({ message: 'Booking started successfully', bookingId, status: 'IN_PROGRESS' });
  } catch (err) {
    if ((err as Error).message === 'UNAUTHORIZED') return unauthorized();
    console.error('Start booking error:', err);
    return error('Failed to start booking', 500);
  }
}
