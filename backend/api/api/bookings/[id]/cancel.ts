/**
 * POST /api/bookings/:id/cancel - Client cancels booking
 *   - Client only, must be the booking client
 *   - Requires cancellationReason
 *   - Changes status to 'CANCELLED'
 */

import { createSupabaseClient, Env } from '../../../_shared/db';
import { requireAuth, requireRole } from '../../../_shared/auth';
import { json, unauthorized, forbidden, notFound, error } from '../../../_shared/response';
import { sanitizeString } from '../../../_shared/security';

export async function onRequestPost(context: { request: Request; env: Env; params: { id: string } }): Promise<Response> {
  try {
    const user = await requireAuth(context.request, context.env);
    if (!user) return unauthorized();

    // Client only (or admin)
    if (!requireRole(user, 'CLIENT') && !requireRole(user, 'ADMIN')) {
      return forbidden('Only clients can cancel bookings');
    }

    const bookingId = context.params.id;

    const body = await context.request.json() as Record<string, unknown>;
    const cancellationReason = sanitizeString(String(body.cancellationReason || ''));

    if (!cancellationReason) {
      return error('cancellationReason is required');
    }

    const supabase = createSupabaseClient(context.env);

    const { data: booking, error: fetchError } = await supabase
      .from('Booking')
      .select('*')
      .eq('id', bookingId)
      .maybeSingle();

    if (fetchError) {
      console.error('Cancel booking error:', fetchError);
      return error('Failed to fetch booking', 500);
    }

    if (!booking) {
      return notFound('Booking not found');
    }

    const bookingData = booking as Record<string, unknown>;

    // Must be the booking client
    if (user.userId !== bookingData.clientId && user.role !== 'ADMIN') {
      return forbidden('You are not the client for this booking');
    }

    // Can only cancel PENDING or CONFIRMED bookings
    const cancellableStatuses = ['PENDING', 'CONFIRMED'];
    if (!cancellableStatuses.includes(bookingData.status as string)) {
      return error(`Booking cannot be cancelled. Current status: ${bookingData.status}`);
    }

    const now = new Date().toISOString();

    const { error: updateError } = await supabase
      .from('Booking')
      .update({
        status: 'CANCELLED',
        cancellationReason,
        cancelledBy: user.userId,
        cancelledAt: now,
        updatedAt: now,
      })
      .eq('id', bookingId);

    if (updateError) {
      console.error('Cancel booking update error:', updateError);
      return error('Failed to cancel booking', 500);
    }

    // Notify the provider
    const notifId = `notif_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
    await supabase
      .from('Notification')
      .insert({
        id: notifId,
        userId: String(bookingData.providerId),
        type: 'BOOKING',
        title: 'Booking Cancelled',
        message: `A booking has been cancelled by the client. Reason: ${cancellationReason}`,
        actionUrl: `/bookings/${bookingId}`,
        createdAt: now,
      });

    return json({ message: 'Booking cancelled', bookingId, status: 'CANCELLED' });
  } catch (err) {
    if ((err as Error).message === 'UNAUTHORIZED') return unauthorized();
    console.error('Cancel booking error:', err);
    return error('Failed to cancel booking', 500);
  }
}
