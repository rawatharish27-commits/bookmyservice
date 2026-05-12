/**
 * GET /api/subcategories?categoryId=X
 * Returns subcategories for a given category.
 */

import { query } from '../../_shared/db';
import { json, error, serverError } from '../../_shared/response';

export async function onRequestGet(context: EventContext<Record<string, unknown>, string, unknown>): Promise<Response> {
  const { request, env } = context as { request: Request; env: { DB: D1Database } };

  try {
    const url = new URL(request.url);
    const categoryId = url.searchParams.get('categoryId');

    if (!categoryId) {
      return error('categoryId query parameter is required', 400);
    }

    const categoryIdNum = Number(categoryId);
    if (isNaN(categoryIdNum) || categoryIdNum <= 0) {
      return error('Invalid categoryId', 400);
    }

    const subcategories = await query(
      env.DB,
      `SELECT id, name, slug, description, categoryId, displayOrder, isActive,
              (SELECT COUNT(*) FROM Service WHERE subcategoryId = ServiceSubcategory.id AND isActive = 1 AND approvalStatus = 'APPROVED') as servicesCount
       FROM ServiceSubcategory
       WHERE categoryId = ? AND isActive = 1
       ORDER BY displayOrder, id`,
      [categoryIdNum]
    );

    return json({
      subcategories,
      total: subcategories.length,
      categoryId: categoryIdNum,
    });
  } catch (err) {
    console.error('Get subcategories error:', err);
    return serverError('Failed to fetch subcategories');
  }
}
