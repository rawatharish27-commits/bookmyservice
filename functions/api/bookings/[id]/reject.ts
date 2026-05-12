/**
 * POST /api/bookings/:id/reject - Provider rejects booking
 *   - Provider only, must be the assigned provider
 *   - Requires rejectionReason
 *   - Changes status to 'REJECTED'
 */

import { createSupabaseClient, Env } from '../../../_shared/db';
import { requireAuth, requireRole } from '../../../_shared/auth';
import { json, unauthorized, forbidden, notFound, error } from '../../../_shared/response';
import { sanitizeString } from '../../../_shared/security';

export async function onRequestPost(context: { request: Request; env: Env; params: { id: string } }): Promise<Response> {
  try {
    const user = await requireAuth(context.request, context.env);
    if (!user) return unauthorized();

    // Provider only
    if (!requireRole(user, 'PROVIDER') && !requireRole(user, 'ADMIN')) {
      return forbidden('Only providers can reject bookings');
    }

    const bookingId = context.params.id;

    const body = await context.request.json() as Record<string, unknown>;
    const rejectionReason = sanitizeString(String(body.rejectionReason || ''));

    if (!rejectionReason) {
      return error('rejectionReason is required');
    }

    const supabase = createSupabaseClient(context.env);

    const { data: booking, error: fetchError } = await supabase
      .from('Booking')
      .select('*')
      .eq('id', bookingId)
      .maybeSingle();

    if (fetchError) {
      console.error('Reject booking error:', fetchError);
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

    // Only PENDING bookings can be rejected
    if (bookingData.status !== 'PENDING') {
      return error(`Booking cannot be rejected. Current status: ${bookingData.status}`);
    }

    const now = new Date().toISOString();

    const { error: updateError } = await supabase
      .from('Booking')
      .update({
        status: 'REJECTED',
        cancellationReason: rejectionReason,
        cancelledBy: user.userId,
        cancelledAt: now,
        updatedAt: now,
      })
      .eq('id', bookingId);

    if (updateError) {
      console.error('Reject booking update error:', updateError);
      return error('Failed to reject booking', 500);
    }

    // Notify the client
    const notifId = `notif_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
    await supabase
      .from('Notification')
      .insert({
        id: notifId,
        userId: String(bookingData.clientId),
        type: 'BOOKING',
        title: 'Booking Rejected',
        message: `Your booking has been rejected. Reason: ${rejectionReason}`,
        actionUrl: `/bookings/${bookingId}`,
        createdAt: now,
      });

    return json({ message: 'Booking rejected', bookingId, status: 'REJECTED' });
  } catch (err) {
    if ((err as Error).message === 'UNAUTHORIZED') return unauthorized();
    console.error('Reject booking error:', err);
    return error('Failed to reject booking', 500);
  }
}
