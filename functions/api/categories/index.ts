import { query } from '../../_shared/db';
import { json, error } from '../../_shared/response';
import { Env } from '../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const categories = await query(context.env.DB, `
      SELECT c.*, 
             (SELECT COUNT(*) FROM ServiceSubcategory WHERE categoryId = c.id AND isActive = 1) as subcategoryCount,
             (SELECT COUNT(*) FROM Service WHERE categoryId = c.id AND isActive = 1 AND isApproved = 1) as serviceCount
      FROM ServiceCategory c
      WHERE c.isActive = 1
      ORDER BY c.displayOrder, c.name
    `);

    // Get subcategories for each category
    const formattedCategories = [];
    for (const cat of categories) {
      const subcategories = await query(context.env.DB, `
        SELECT id, categoryId, name, slug, description, isActive, displayOrder
        FROM ServiceSubcategory
        WHERE categoryId = ? AND isActive = 1
        ORDER BY displayOrder, name
      `, [cat.id]);

      formattedCategories.push({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        iconUrl: cat.iconUrl,
        icon: cat.icon,
        isActive: cat.isActive,
        displayOrder: cat.displayOrder,
        subcategoryCount: cat.subcategoryCount,
        serviceCount: cat.serviceCount,
        subcategories: subcategories.map((sc: any) => ({
          id: sc.id,
          categoryId: sc.categoryId,
          name: sc.name,
          slug: sc.slug,
          description: sc.description,
          displayOrder: sc.displayOrder,
        })),
      });
    }

    return json({ categories: formattedCategories });
  } catch (e) {
    return error('Internal server error', 500);
  }
};
