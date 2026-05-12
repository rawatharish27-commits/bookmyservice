/**
 * PATCH /api/admin/faq/:faqId - Update FAQ item
 * DELETE /api/admin/faq/:faqId - Delete FAQ item
 * Requires ADMIN role
 */

import { createSupabaseClient, Env } from '../../../_shared/db';
import { requireAuth, requireRole } from '../../../_shared/auth';
import { json, unauthorized, forbidden, notFound, error } from '../../../_shared/response';
import { sanitizeString, getClientIP } from '../../../_shared/security';

interface EventContext {
  request: Request;
  env: Env;
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

  const supabase = createSupabaseClient(context.env);

  // Check FAQ exists
  const { data: existing } = await supabase
    .from('Faq')
    .select('id')
    .eq('id', faqId)
    .maybeSingle();

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

  // Build dynamic update object
  const updates: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (body.category !== undefined) {
    updates.category = sanitizeString(body.category);
  }
  if (body.question !== undefined) {
    updates.question = sanitizeString(body.question);
  }
  if (body.answer !== undefined) {
    updates.answer = sanitizeString(body.answer);
  }
  if (body.displayOrder !== undefined) {
    updates.displayOrder = body.displayOrder;
  }
  if (body.isActive !== undefined) {
    updates.isActive = body.isActive;
  }

  const { data: updatedFaq, error: updateError } = await supabase
    .from('Faq')
    .update(updates)
    .eq('id', faqId)
    .select()
    .single();

  if (updateError) {
    return error('Failed to update FAQ: ' + updateError.message);
  }

  // Log action
  const ip = getClientIP(context.request);
  const userAgent = context.request.headers.get('User-Agent') || null;
  await supabase.from('AdminLog').insert({
    id: crypto.randomUUID(),
    adminId: user.userId,
    action: 'UPDATE_FAQ',
    targetType: 'FAQ',
    targetId: String(faqId),
    details: JSON.stringify(body),
    ipAddress: ip,
    userAgent,
    createdAt: new Date().toISOString(),
  });

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

  const supabase = createSupabaseClient(context.env);

  // Check FAQ exists
  const { data: existing } = await supabase
    .from('Faq')
    .select('id')
    .eq('id', faqId)
    .maybeSingle();

  if (!existing) {
    return notFound('FAQ item not found');
  }

  const { error: deleteError } = await supabase
    .from('Faq')
    .delete()
    .eq('id', faqId);

  if (deleteError) {
    return error('Failed to delete FAQ: ' + deleteError.message);
  }

  // Log action
  const ip = getClientIP(context.request);
  const userAgent = context.request.headers.get('User-Agent') || null;
  await supabase.from('AdminLog').insert({
    id: crypto.randomUUID(),
    adminId: user.userId,
    action: 'DELETE_FAQ',
    targetType: 'FAQ',
    targetId: String(faqId),
    details: null,
    ipAddress: ip,
    userAgent,
    createdAt: new Date().toISOString(),
  });

  return json({ message: 'FAQ deleted successfully' });
}
