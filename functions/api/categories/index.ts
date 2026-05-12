/**
 * GET /api/categories
 * Returns all categories with subcategories count and services count.
 */

import { query } from '../../_shared/db';
import { json, serverError } from '../../_shared/response';

export async function onRequestGet(context: EventContext<Record<string, unknown>, string, unknown>): Promise<Response> {
  const { env } = context as { env: { DB: D1Database } };

  try {
    const categories = await query(
      env.DB,
      `SELECT c.id, c.name, c.slug, c.description, c.icon, c.isActive, c.displayOrder,
              (SELECT COUNT(*) FROM ServiceSubcategory WHERE categoryId = c.id AND isActive = 1) as subcategoriesCount,
              (SELECT COUNT(*) FROM Service WHERE categoryId = c.id AND isActive = 1 AND approvalStatus = 'APPROVED') as servicesCount
       FROM ServiceCategory c
       WHERE c.isActive = 1
       ORDER BY c.displayOrder, c.id`
    );

    return json({
      categories,
      total: categories.length,
    });
  } catch (err) {
    console.error('Get categories error:', err);
    return serverError('Failed to fetch categories');
  }
}
