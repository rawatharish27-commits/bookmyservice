/**
 * DELETE /api/favorites/:serviceId - Remove service from favorites
 * Requires CLIENT role
 */

import { queryOne, execute } from '../../_shared/db';
import { requireAuth, requireRole } from '../../_shared/auth';
import { json, unauthorized, forbidden, notFound } from '../../_shared/response';
import { sanitizeString } from '../../_shared/security';

interface EventContext {
  request: Request;
  env: { DB: D1Database; JWT_SECRET?: string };
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

  const serviceId = sanitizeString(context.params.serviceId);

  // Check favorite exists
  const favorite = await queryOne(
    context.env.DB,
    'SELECT id FROM Favorite WHERE userId = ? AND serviceId = ?',
    [user.userId, serviceId]
  );

  if (!favorite) {
    return notFound('Favorite not found');
  }

  await execute(
    context.env.DB,
    'DELETE FROM Favorite WHERE userId = ? AND serviceId = ?',
    [user.userId, serviceId]
  );

  return json({ message: 'Service removed from favorites' });
}
