/**
 * GET /api/stats/platform - Returns platform statistics
 *   - Public endpoint (no auth required)
 */

import { createSupabaseClient, Env } from '../../_shared/db';
import { json, error } from '../../_shared/response';

export async function onRequestGet(context: { request: Request; env: Env; params: Record<string, string> }): Promise<Response> {
  try {
    const supabase = createSupabaseClient(context.env);

    // Count clients (roleId = 1, status != BLOCKED)
    const { count: clientCount } = await supabase
      .from('User')
      .select('', { count: 'exact', head: true })
      .eq('roleId', 1)
      .neq('status', 'BLOCKED');

    // Count providers (roleId = 2, status = ACTIVE)
    const { count: providerCount } = await supabase
      .from('User')
      .select('', { count: 'exact', head: true })
      .eq('roleId', 2)
      .eq('status', 'ACTIVE');

    // Count active services
    const { count: serviceCount } = await supabase
      .from('Service')
      .select('', { count: 'exact', head: true })
      .eq('isActive', true)
      .eq('approvalStatus', 'APPROVED');

    // Count total bookings
    const { count: bookingCount } = await supabase
      .from('Booking')
      .select('', { count: 'exact', head: true });

    // Count active visitors (sessions active in last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { count: activeVisitorCount } = await supabase
      .from('VisitorSession')
      .select('', { count: 'exact', head: true })
      .eq('isActive', true)
      .gte('lastActive', fiveMinutesAgo);

    // Count total visitors
    const { count: totalVisitorCount } = await supabase
      .from('VisitorSession')
      .select('', { count: 'exact', head: true });

    // Count completed bookings
    const { count: completedBookings } = await supabase
      .from('Booking')
      .select('', { count: 'exact', head: true })
      .eq('status', 'COMPLETED');

    // Count pending bookings
    const { count: pendingBookings } = await supabase
      .from('Booking')
      .select('', { count: 'exact', head: true })
      .eq('status', 'PENDING');

    return json({
      totalClients: clientCount || 0,
      totalProviders: providerCount || 0,
      totalServices: serviceCount || 0,
      totalBookings: bookingCount || 0,
      completedBookings: completedBookings || 0,
      pendingBookings: pendingBookings || 0,
      activeVisitors: activeVisitorCount || 0,
      totalVisitors: totalVisitorCount || 0,
    });
  } catch (err) {
    console.error('Platform stats error:', err);
    return error('Failed to fetch platform statistics', 500);
  }
}
