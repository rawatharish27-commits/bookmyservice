/**
 * DELETE /api/favorites/:serviceId - Remove service from favorites
 * Requires CLIENT role
 */

import { createSupabaseClient, Env } from '../../_shared/db';
import { requireAuth, requireRole } from '../../_shared/auth';
import { json, unauthorized, forbidden, notFound } from '../../_shared/response';
import { sanitizeString } from '../../_shared/security';

interface EventContext {
  request: Request;
  env: Env;
  params: { serviceId: string };
}

export async function onRequestDelete(context: EventContext): Promise<Response> {
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
  const serviceId = sanitizeString(context.params.serviceId);

  // Check favorite exists
  const { data: favorite } = await supabase
    .from('Favorite')
    .select('id')
    .eq('userId', user.userId)
    .eq('serviceId', serviceId)
    .maybeSingle();

  if (!favorite) {
    return notFound('Favorite not found');
  }

  const { error: deleteError } = await supabase
    .from('Favorite')
    .delete()
    .eq('userId', user.userId)
    .eq('serviceId', serviceId);

  if (deleteError) {
    console.error('Remove favorite error:', deleteError);
    return notFound('Favorite not found');
  }

  return json({ message: 'Service removed from favorites' });
}
