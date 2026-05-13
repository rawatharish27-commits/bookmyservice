/**
 * GET /api/admin/faq - List all FAQ items
 * POST /api/admin/faq - Create FAQ item
 * Requires ADMIN role
 */

import { createSupabaseClient, Env } from '../../../_shared/db';
import { requireAuth, requireRole } from '../../../_shared/auth';
import { json, unauthorized, forbidden, error } from '../../../_shared/response';
import { sanitizeString, getClientIP } from '../../../_shared/security';

interface EventContext {
  request: Request;
  env: Env;
  params: Record<string, string>;
}

export async function onRequestGet(context: EventContext): Promise<Response> {
  let user;
  try {
    user = await requireAuth(context.request, context.env);
  } catch {
    return unauthorized();
  }

  if (!requireRole(user, 'ADMIN')) {
    return forbidden('Admin access required');
  }

  const url = new URL(context.request.url);
  const category = url.searchParams.get('category');

  const supabase = createSupabaseClient(context.env);

  let query = supabase
    .from('Faq')
    .select('id, category, question, answer, displayOrder, isActive, createdAt, updatedAt')
    .order('category', { ascending: true })
    .order('displayOrder', { ascending: true })
    .order('id', { ascending: true });

  if (category) {
    query = query.eq('category', sanitizeString(category));
  }

  const { data: faqs } = await query;

  return json({ faqs });
}

export async function onRequestPost(context: EventContext): Promise<Response> {
  let user;
  try {
    user = await requireAuth(context.request, context.env);
  } catch {
    return unauthorized();
  }

  if (!requireRole(user, 'ADMIN')) {
    return forbidden('Admin access required');
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

  if (!body.category || !body.question || !body.answer) {
    return error('category, question, and answer are required');
  }

  const category = sanitizeString(body.category);
  const question = sanitizeString(body.question);
  const answer = sanitizeString(body.answer);
  const displayOrder = body.displayOrder || 0;
  const isActive = body.isActive !== false;

  const supabase = createSupabaseClient(context.env);
  const now = new Date().toISOString();

  const { data: newFaq, error: insertError } = await supabase
    .from('Faq')
    .insert({
      category,
      question,
      answer,
      displayOrder,
      isActive,
      createdAt: now,
      updatedAt: now,
    })
    .select()
    .single();

  if (insertError) {
    return error('Failed to create FAQ: ' + insertError.message);
  }

  // Log action
  const ip = getClientIP(context.request);
  const userAgent = context.request.headers.get('User-Agent') || null;
  await supabase.from('AdminLog').insert({
    id: crypto.randomUUID(),
    adminId: user.userId,
    action: 'CREATE_FAQ',
    targetType: 'FAQ',
    targetId: null,
    details: JSON.stringify({ category, question }),
    ipAddress: ip,
    userAgent,
    createdAt: now,
  });

  return json({ faq: newFaq, message: 'FAQ created successfully' }, 201);
}
