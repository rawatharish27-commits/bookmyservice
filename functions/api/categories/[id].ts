import { queryOne, query } from '../../_shared/db';
import { json, error } from '../../_shared/response';
import { Env } from '../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { id } = context.params;

    const category = await queryOne(context.env.DB, `
      SELECT c.*,
             (SELECT COUNT(*) FROM Service WHERE categoryId = c.id AND isActive = 1 AND isApproved = 1) as serviceCount
      FROM ServiceCategory c
      WHERE c.id = ? OR c.slug = ?
    `, [id, id]);

    if (!category) return error('Category not found', 404);

    const subcategories = await query(context.env.DB, `
      SELECT id, categoryId, name, slug, description, isActive, displayOrder
      FROM ServiceSubcategory
      WHERE categoryId = ? AND isActive = 1
      ORDER BY displayOrder, name
    `, [category.id]);

    return json({
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        iconUrl: category.iconUrl,
        icon: category.icon,
        isActive: category.isActive,
        displayOrder: category.displayOrder,
        serviceCount: category.serviceCount,
        subcategories: subcategories.map((sc: any) => ({
          id: sc.id,
          categoryId: sc.categoryId,
          name: sc.name,
          slug: sc.slug,
          description: sc.description,
          displayOrder: sc.displayOrder,
        })),
      },
    });
  } catch (e) {
    return error('Internal server error', 500);
  }
};
