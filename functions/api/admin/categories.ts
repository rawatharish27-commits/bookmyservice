import { query, execute } from '../../_shared/db';
import { requireAuth } from '../../_shared/auth';
import { json, error } from '../../_shared/response';
import { Env } from '../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);
    if (auth.role !== 'ADMIN') return error('Admin access required', 403);

    const categories = await query(context.env.DB, `
      SELECT c.*,
        (SELECT COUNT(*) FROM ServiceSubcategory WHERE categoryId = c.id) as subcategoryCount,
        (SELECT COUNT(*) FROM Service WHERE categoryId = c.id) as serviceCount
      FROM ServiceCategory c
      ORDER BY c.displayOrder, c.name
    `);

    return json({ categories });
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);
    if (auth.role !== 'ADMIN') return error('Admin access required', 403);

    const body = await context.request.json() as {
      name: string; slug: string; description?: string; icon?: string; iconUrl?: string;
      displayOrder?: number; isActive?: boolean;
    };

    if (!body.name || !body.slug) return error('Name and slug are required', 400);

    await execute(context.env.DB, `
      INSERT INTO ServiceCategory (name, slug, description, icon, iconUrl, isActive, displayOrder, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))
    `, [body.name, body.slug, body.description || null, body.icon || null, body.iconUrl || null,
        body.isActive !== false ? 1 : 0, body.displayOrder || 0]);

    return json({ message: 'Category created successfully' }, 201);
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};
