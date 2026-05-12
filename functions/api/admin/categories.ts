/**
 * GET /api/admin/categories - List categories
 * POST /api/admin/categories - Create category
 * PATCH /api/admin/categories - Update category
 * Requires ADMIN role
 */

import { query, queryOne, execute } from '../../_shared/db';
import { requireAuth, requireRole } from '../../_shared/auth';
import { json, unauthorized, forbidden, notFound, error } from '../../_shared/response';
import { sanitizeString, sanitizeObject, getClientIP } from '../../_shared/security';

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

  const categories = await query(
    context.env.DB,
    `SELECT c.id, c.name, c.slug, c.description, c.iconUrl, c.icon, c.parentId,
            c.isActive, c.displayOrder, c.createdAt,
            (SELECT COUNT(*) FROM Service s WHERE s.categoryId = c.id) as serviceCount,
            (SELECT COUNT(*) FROM ServiceSubcategory sc WHERE sc.categoryId = c.id) as subcategoryCount
     FROM ServiceCategory c
     ORDER BY c.displayOrder ASC, c.name ASC`
  );

  // Get subcategories for each category
  const categoriesWithSubs = await Promise.all(
    (categories as Record<string, unknown>[]).map(async (cat) => {
      const subcategories = await query(
        context.env.DB,
        `SELECT id, name, slug, description, isActive, displayOrder
         FROM ServiceSubcategory
         WHERE categoryId = ?
         ORDER BY displayOrder ASC, name ASC`,
        [cat.id]
      );
      return { ...cat, subcategories };
    })
  );

  return json({ categories: categoriesWithSubs });
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
      name?: string;
      slug?: string;
      description?: string;
      iconUrl?: string;
      icon?: string;
      parentId?: number;
      displayOrder?: number;
    };
  } catch {
    return error('Invalid request body');
  }

  if (!body.name || !body.slug) {
    return error('name and slug are required');
  }

  const name = sanitizeString(body.name);
  const slug = sanitizeString(body.slug);
  const description = body.description ? sanitizeString(body.description) : null;
  const iconUrl = body.iconUrl ? sanitizeString(body.iconUrl) : null;
  const icon = body.icon ? sanitizeString(body.icon) : null;
  const parentId = body.parentId || null;
  const displayOrder = body.displayOrder || 0;

  // Check slug uniqueness
  const existing = await queryOne(
    context.env.DB,
    'SELECT id FROM ServiceCategory WHERE slug = ?',
    [slug]
  );

  if (existing) {
    return error('Category with this slug already exists');
  }

  await execute(
    context.env.DB,
    `INSERT INTO ServiceCategory (name, slug, description, iconUrl, icon, parentId, isActive, displayOrder, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?, datetime('now'), datetime('now'))`,
    [name, slug, description, iconUrl, icon, parentId, displayOrder]
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
      'CREATE_CATEGORY',
      'CATEGORY',
      slug,
      JSON.stringify({ name, slug }),
      ip,
      userAgent,
    ]
  );

  const newCategory = await queryOne(
    context.env.DB,
    'SELECT * FROM ServiceCategory WHERE slug = ?',
    [slug]
  );

  return json({ category: newCategory, message: 'Category created successfully' }, 201);
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

  let body;
  try {
    body = await context.request.json() as {
      categoryId?: number;
      name?: string;
      description?: string;
      iconUrl?: string;
      icon?: string;
      isActive?: boolean;
      displayOrder?: number;
    };
  } catch {
    return error('Invalid request body');
  }

  if (!body.categoryId) {
    return error('categoryId is required');
  }

  const categoryId = body.categoryId;

  // Check category exists
  const existing = await queryOne(
    context.env.DB,
    'SELECT id, name FROM ServiceCategory WHERE id = ?',
    [categoryId]
  );

  if (!existing) {
    return notFound('Category not found');
  }

  // Build dynamic update query
  const updates: string[] = ['updatedAt = datetime(\'now\')'];
  const params: unknown[] = [];

  if (body.name !== undefined) {
    updates.push('name = ?');
    params.push(sanitizeString(body.name));
  }
  if (body.description !== undefined) {
    updates.push('description = ?');
    params.push(sanitizeString(body.description));
  }
  if (body.iconUrl !== undefined) {
    updates.push('iconUrl = ?');
    params.push(sanitizeString(body.iconUrl));
  }
  if (body.icon !== undefined) {
    updates.push('icon = ?');
    params.push(sanitizeString(body.icon));
  }
  if (body.isActive !== undefined) {
    updates.push('isActive = ?');
    params.push(body.isActive ? 1 : 0);
  }
  if (body.displayOrder !== undefined) {
    updates.push('displayOrder = ?');
    params.push(body.displayOrder);
  }

  params.push(categoryId);

  await execute(
    context.env.DB,
    `UPDATE ServiceCategory SET ${updates.join(', ')} WHERE id = ?`,
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
      'UPDATE_CATEGORY',
      'CATEGORY',
      String(categoryId),
      JSON.stringify(body),
      ip,
      userAgent,
    ]
  );

  const updatedCategory = await queryOne(
    context.env.DB,
    'SELECT * FROM ServiceCategory WHERE id = ?',
    [categoryId]
  );

  return json({ category: updatedCategory, message: 'Category updated successfully' });
}
