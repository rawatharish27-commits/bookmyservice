/**
 * GET /api/admin/faq - List all FAQ items
 * POST /api/admin/faq - Create FAQ item
 * Requires ADMIN role
 */

import { query, queryOne, execute } from '../../../_shared/db';
import { requireAuth, requireRole } from '../../../_shared/auth';
import { json, unauthorized, forbidden, error } from '../../../_shared/response';
import { sanitizeString, getClientIP } from '../../../_shared/security';

interface EventContext {
  request: Request;
  env: { DB: D1Database; JWT_SECRET?: string };
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

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (category) {
    conditions.push('category = ?');
    params.push(sanitizeString(category));
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const faqs = await query(
    context.env.DB,
    `SELECT id, category, question, answer, displayOrder, isActive, createdAt, updatedAt
     FROM Faq
     ${whereClause}
     ORDER BY category ASC, displayOrder ASC, id ASC`,
    params
  );

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
  const isActive = body.isActive !== false ? 1 : 0;

  await execute(
    context.env.DB,
    `INSERT INTO Faq (category, question, answer, displayOrder, isActive, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    [category, question, answer, displayOrder, isActive]
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
      'CREATE_FAQ',
      'FAQ',
      null,
      JSON.stringify({ category, question }),
      ip,
      userAgent,
    ]
  );

  const newFaq = await queryOne(
    context.env.DB,
    'SELECT * FROM Faq ORDER BY id DESC LIMIT 1'
  );

  return json({ faq: newFaq, message: 'FAQ created successfully' }, 201);
}
