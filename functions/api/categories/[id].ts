/**
 * GET /api/categories/:id
 * Returns single category with its subcategories.
 */

import { queryOne, query } from '../../_shared/db';
import { json, notFound, serverError } from '../../_shared/response';

export async function onRequestGet(context: EventContext<Record<string, unknown>, string, unknown>): Promise<Response> {
  const { env, params } = context as { env: { DB: D1Database }; params: { id: string } };

  try {
    const categoryId = Number(params.id);

    if (!categoryId || isNaN(categoryId)) {
      return json({ error: 'Invalid category ID' }, 400);
    }

    // ─── Fetch category ──────────────────────────────────────────
    const category = await queryOne(
      env.DB,
      `SELECT c.id, c.name, c.slug, c.description, c.icon, c.isActive, c.displayOrder,
              (SELECT COUNT(*) FROM ServiceSubcategory WHERE categoryId = c.id AND isActive = 1) as subcategoriesCount,
              (SELECT COUNT(*) FROM Service WHERE categoryId = c.id AND isActive = 1 AND approvalStatus = 'APPROVED') as servicesCount
       FROM ServiceCategory c
       WHERE c.id = ? AND c.isActive = 1`,
      [categoryId]
    );

    if (!category) {
      return notFound('Category not found');
    }

    // ─── Fetch subcategories for this category ───────────────────
    const subcategories = await query(
      env.DB,
      `SELECT id, name, slug, description, displayOrder, isActive
       FROM ServiceSubcategory
       WHERE categoryId = ? AND isActive = 1
       ORDER BY displayOrder, id`,
      [categoryId]
    );

    return json({
      category,
      subcategories,
    });
  } catch (err) {
    console.error('Get category error:', err);
    return serverError('Failed to fetch category');
  }
}
