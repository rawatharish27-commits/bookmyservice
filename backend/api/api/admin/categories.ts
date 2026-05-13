/**
 * GET /api/admin/categories - List categories
 * POST /api/admin/categories - Create category
 * PATCH /api/admin/categories - Update category
 * Requires ADMIN role
 */

import { createSupabaseClient, Env, DbRecord } from '../../_shared/db';
import { requireAuth, requireRole } from '../../_shared/auth';
import { json, unauthorized, forbidden, notFound, error } from '../../_shared/response';
import { sanitizeString, getClientIP } from '../../_shared/security';

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

  const supabase = createSupabaseClient(context.env);

  // Fetch categories
  const { data: categories } = await supabase
    .from('ServiceCategory')
    .select('id, name, slug, description, iconUrl, icon, parentId, isActive, displayOrder, createdAt')
    .order('displayOrder', { ascending: true })
    .order('name', { ascending: true });

  // Fetch service counts per category
  const { data: serviceCounts } = await supabase
    .from('Service')
    .select('categoryId');

  const serviceCountMap = new Map<string, number>();
  for (const s of ((serviceCounts ?? []) as DbRecord[])) {
    const catId = String((s as Record<string, unknown>).categoryId);
    serviceCountMap.set(catId, (serviceCountMap.get(catId) ?? 0) + 1);
  }

  // Fetch subcategory counts per category
  const { data: subcategoryCounts } = await supabase
    .from('ServiceSubcategory')
    .select('categoryId');

  const subcategoryCountMap = new Map<string, number>();
  for (const sc of ((subcategoryCounts ?? []) as DbRecord[])) {
    const catId = String((sc as Record<string, unknown>).categoryId);
    subcategoryCountMap.set(catId, (subcategoryCountMap.get(catId) ?? 0) + 1);
  }

  // Fetch all subcategories
  const { data: allSubcategories } = await supabase
    .from('ServiceSubcategory')
    .select('id, name, slug, description, isActive, displayOrder, categoryId')
    .order('displayOrder', { ascending: true })
    .order('name', { ascending: true });

  const subcategoriesByCategory = new Map<string, Record<string, unknown>[]>();
  for (const sub of ((allSubcategories ?? []) as DbRecord[])) {
    const catId = String((sub as Record<string, unknown>).categoryId);
    if (!subcategoriesByCategory.has(catId)) {
      subcategoriesByCategory.set(catId, []);
    }
    subcategoriesByCategory.get(catId)!.push(sub);
  }

  const categoriesWithSubs = (categories ?? []).map((cat: Record<string, unknown>) => ({
    ...cat,
    serviceCount: serviceCountMap.get(String(cat.id)) ?? 0,
    subcategoryCount: subcategoryCountMap.get(String(cat.id)) ?? 0,
    subcategories: subcategoriesByCategory.get(String(cat.id)) ?? [],
  }));

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

  const supabase = createSupabaseClient(context.env);

  // Check slug uniqueness
  const { data: existing } = await supabase
    .from('ServiceCategory')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (existing) {
    return error('Category with this slug already exists');
  }

  const now = new Date().toISOString();

  const { data: newCategory, error: insertError } = await supabase
    .from('ServiceCategory')
    .insert({
      name,
      slug,
      description,
      iconUrl,
      icon,
      parentId,
      isActive: true,
      displayOrder,
      createdAt: now,
      updatedAt: now,
    })
    .select()
    .single();

  if (insertError) {
    return error('Failed to create category: ' + insertError.message);
  }

  // Log action
  const ip = getClientIP(context.request);
  const userAgent = context.request.headers.get('User-Agent') || null;
  await supabase.from('AdminLog').insert({
    id: crypto.randomUUID(),
    adminId: user.userId,
    action: 'CREATE_CATEGORY',
    targetType: 'CATEGORY',
    targetId: slug,
    details: JSON.stringify({ name, slug }),
    ipAddress: ip,
    userAgent,
    createdAt: now,
  });

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

  const supabase = createSupabaseClient(context.env);

  // Check category exists
  const { data: existing } = await supabase
    .from('ServiceCategory')
    .select('id, name')
    .eq('id', categoryId)
    .maybeSingle();

  if (!existing) {
    return notFound('Category not found');
  }

  // Build dynamic update object
  const updates: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (body.name !== undefined) {
    updates.name = sanitizeString(body.name);
  }
  if (body.description !== undefined) {
    updates.description = sanitizeString(body.description);
  }
  if (body.iconUrl !== undefined) {
    updates.iconUrl = sanitizeString(body.iconUrl);
  }
  if (body.icon !== undefined) {
    updates.icon = sanitizeString(body.icon);
  }
  if (body.isActive !== undefined) {
    updates.isActive = body.isActive;
  }
  if (body.displayOrder !== undefined) {
    updates.displayOrder = body.displayOrder;
  }

  const { data: updatedCategory, error: updateError } = await supabase
    .from('ServiceCategory')
    .update(updates)
    .eq('id', categoryId)
    .select()
    .single();

  if (updateError) {
    return error('Failed to update category: ' + updateError.message);
  }

  // Log action
  const ip = getClientIP(context.request);
  const userAgent = context.request.headers.get('User-Agent') || null;
  await supabase.from('AdminLog').insert({
    id: crypto.randomUUID(),
    adminId: user.userId,
    action: 'UPDATE_CATEGORY',
    targetType: 'CATEGORY',
    targetId: String(categoryId),
    details: JSON.stringify(body),
    ipAddress: ip,
    userAgent,
    createdAt: new Date().toISOString(),
  });

  return json({ category: updatedCategory, message: 'Category updated successfully' });
}
