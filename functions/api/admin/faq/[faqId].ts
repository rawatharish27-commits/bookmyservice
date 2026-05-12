/**
 * PATCH /api/admin/faq/:faqId - Update FAQ item
 * DELETE /api/admin/faq/:faqId - Delete FAQ item
 * Requires ADMIN role
 */

import { queryOne, execute } from '../../../_shared/db';
import { requireAuth, requireRole } from '../../../_shared/auth';
import { json, unauthorized, forbidden, notFound, error } from '../../../_shared/response';
import { sanitizeString, getClientIP } from '../../../_shared/security';

interface EventContext {
  request: Request;
  env: { DB: D1Database; JWT_SECRET?: string };
  params: { faqId: string };
}

export async function onRequestPatch(context: EventContext): Promise<Response> {
  let user;
  try {
    user = await requireAuth(context.request, context.env);
  } catch {
    return unauthorized();
  }

  if (!requireRole(user, 'ADMIN')) {
    return forbidden('Admin access required');
  }

  const faqId = parseInt(context.params.faqId, 10);
  if (isNaN(faqId)) {
    return error('Invalid FAQ ID');
  }

  // Check FAQ exists
  const existing = await queryOne(
    context.env.DB,
    'SELECT id FROM Faq WHERE id = ?',
    [faqId]
  );

  if (!existing) {
    return notFound('FAQ item not found');
  }

  let body;
  try {
    body = await context.request.json() as {
      category?: string;
      question?: string;
      answer?: string;
      displayOrder?: number;
      isActive?: boolean;
    };
  } catch {
    return error('Invalid request body');
  }

  // Build dynamic update
  const updates: string[] = ['updatedAt = datetime(\'now\')'];
  const params: unknown[] = [];

  if (body.category !== undefined) {
    updates.push('category = ?');
    params.push(sanitizeString(body.category));
  }
  if (body.question !== undefined) {
    updates.push('question = ?');
    params.push(sanitizeString(body.question));
  }
  if (body.answer !== undefined) {
    updates.push('answer = ?');
    params.push(sanitizeString(body.answer));
  }
  if (body.displayOrder !== undefined) {
    updates.push('displayOrder = ?');
    params.push(body.displayOrder);
  }
  if (body.isActive !== undefined) {
    updates.push('isActive = ?');
    params.push(body.isActive ? 1 : 0);
  }

  params.push(faqId);

  await execute(
    context.env.DB,
    `UPDATE Faq SET ${updates.join(', ')} WHERE id = ?`,
    params
  );

  // Log action
  const ip = getClientIP(context.request);
  const userAgent = context.request.headers.get('User-Agent') || null;
  await execute(
    context.env.DB,
    `INSERT INTO AdminLog (id, adminId, action, targetType, targetId, details, ipAddress, userAgent, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    [
      crypto.randomUUID(),
      user.userId,
      'UPDATE_FAQ',
      'FAQ',
      String(faqId),
      JSON.stringify(body),
      ip,
      userAgent,
    ]
  );

  const updatedFaq = await queryOne(
    context.env.DB,
    'SELECT * FROM Faq WHERE id = ?',
    [faqId]
  );

  return json({ faq: updatedFaq, message: 'FAQ updated successfully' });
}

export async function onRequestDelete(context: EventContext): Promise<Response> {
  let user;
  try {
    user = await requireAuth(context.request, context.env);
  } catch {
    return unauthorized();
  }

  if (!requireRole(user, 'ADMIN')) {
    return forbidden('Admin access required');
  }

  const faqId = parseInt(context.params.faqId, 10);
  if (isNaN(faqId)) {
    return error('Invalid FAQ ID');
  }

  // Check FAQ exists
  const existing = await queryOne(
    context.env.DB,
    'SELECT id FROM Faq WHERE id = ?',
    [faqId]
  );

  if (!existing) {
    return notFound('FAQ item not found');
  }

  await execute(
    context.env.DB,
    'DELETE FROM Faq WHERE id = ?',
    [faqId]
  );

  // Log action
  const ip = getClientIP(context.request);
  const userAgent = context.request.headers.get('User-Agent') || null;
  await execute(
    context.env.DB,
    `INSERT INTO AdminLog (id, adminId, action, targetType, targetId, details, ipAddress, userAgent, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    [
      crypto.randomUUID(),
      user.userId,
      'DELETE_FAQ',
      'FAQ',
      String(faqId),
      null,
      ip,
      userAgent,
    ]
  );

  return json({ message: 'FAQ deleted successfully' });
}
