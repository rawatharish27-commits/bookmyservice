/**
 * POST /api/stats/visitor - Track visitor session
 *   - Body: sessionId, page
 *   - Upserts visitor record
 */

import { createSupabaseClient, Env } from '../../_shared/db';
import { json, error } from '../../_shared/response';
import { sanitizeString, getClientIP } from '../../_shared/security';

function generateId(): string {
  return `vs_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

export async function onRequestPost(context: { request: Request; env: Env; params: Record<string, string> }): Promise<Response> {
  try {
    const supabase = createSupabaseClient(context.env);
    const body = await context.request.json() as Record<string, unknown>;
    const sessionId = sanitizeString(String(body.sessionId || ''));
    const page = sanitizeString(String(body.page || ''));

    if (!sessionId) {
      return error('sessionId is required');
    }

    const ipAddress = getClientIP(context.request);
    const userAgent = context.request.headers.get('User-Agent') || null;
    const now = new Date().toISOString();

    // Check if session already exists
    const { data: existing } = await supabase
      .from('VisitorSession')
      .select('id')
      .eq('sessionId', sessionId)
      .maybeSingle();

    if (existing) {
      // Update existing session
      await supabase
        .from('VisitorSession')
        .update({
          lastActive: now,
          isActive: true,
          page: page || null,
          updatedAt: now,
        })
        .eq('sessionId', sessionId);
    } else {
      // Create new session
      const id = generateId();
      await supabase
        .from('VisitorSession')
        .insert({
          id,
          sessionId,
          ipAddress,
          userAgent,
          page: page || null,
          isActive: true,
          lastActive: now,
          createdAt: now,
          updatedAt: now,
        });
    }

    // Update PlatformStats table
    // First, count total and active visitors
    const { count: totalVisitors } = await supabase
      .from('VisitorSession')
      .select('', { count: 'exact', head: true });

    // For active visitors, we need sessions where lastActive is within 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { count: activeVisitors } = await supabase
      .from('VisitorSession')
      .select('', { count: 'exact', head: true })
      .eq('isActive', true)
      .gte('lastActive', fiveMinutesAgo);

    // Try to update existing stats row
    const { data: statsRow } = await supabase
      .from('PlatformStats')
      .select('id')
      .eq('id', 1)
      .maybeSingle();

    if (statsRow) {
      await supabase
        .from('PlatformStats')
        .update({
          totalVisitors: totalVisitors || 0,
          activeVisitors: activeVisitors || 0,
          updatedAt: now,
        })
        .eq('id', 1);
    } else {
      // Count other stats for initial row
      const { count: totalUsers } = await supabase
        .from('User')
        .select('', { count: 'exact', head: true })
        .eq('roleId', 1);

      const { count: totalProviders } = await supabase
        .from('User')
        .select('', { count: 'exact', head: true })
        .eq('roleId', 2)
        .eq('status', 'ACTIVE');

      const { count: totalBookings } = await supabase
        .from('Booking')
        .select('', { count: 'exact', head: true });

      const { count: totalServices } = await supabase
        .from('Service')
        .select('', { count: 'exact', head: true })
        .eq('isActive', true)
        .eq('approvalStatus', 'APPROVED');

      await supabase
        .from('PlatformStats')
        .insert({
          id: 1,
          totalVisitors: totalVisitors || 0,
          totalUsers: totalUsers || 0,
          totalProviders: totalProviders || 0,
          totalBookings: totalBookings || 0,
          totalServices: totalServices || 0,
          activeVisitors: activeVisitors || 0,
          updatedAt: now,
        });
    }

    return json({ success: true });
  } catch (err) {
    console.error('Visitor tracking error:', err);
    return error('Failed to track visitor', 500);
  }
}
