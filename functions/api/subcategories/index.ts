import { query } from '../../_shared/db';
import { json, error } from '../../_shared/response';
import { Env } from '../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const categoryId = url.searchParams.get('categoryId');

    if (!categoryId) return error('categoryId is required', 400);

    const subcategories = await query(context.env.DB, `
      SELECT id, categoryId, name, slug, description, isActive, displayOrder
      FROM ServiceSubcategory
      WHERE categoryId = ? AND isActive = 1
      ORDER BY displayOrder, name
    `, [parseInt(categoryId)]);

    return json({ subcategories });
  } catch (e) {
    return error('Internal server error', 500);
  }
};
