/**
 * GET /api/categories/:id
 * Returns single category with its subcategories.
 */

import { createSupabaseClient, Env } from '../../_shared/db';
import { json, notFound, serverError } from '../../_shared/response';

export async function onRequestGet(context: EventContext<Record<string, unknown>, string, unknown>): Promise<Response> {
  const { env, params } = context as unknown as { env: Env; params: { id: string } };

  try {
    const categoryId = Number(params.id);

    if (!categoryId || isNaN(categoryId)) {
      return json({ error: 'Invalid category ID' }, 400);
    }

    const supabase = createSupabaseClient(env);

    // ─── Fetch category ──────────────────────────────────────────
    const { data: category, error: catError } = await supabase
      .from('ServiceCategory')
      .select('*')
      .eq('id', categoryId)
      .eq('isActive', true)
      .maybeSingle();

    if (catError) {
      console.error('Get category error:', catError);
      return serverError('Failed to fetch category');
    }

    if (!category) {
      return notFound('Category not found');
    }

    // Fetch counts for the category
    const { count: subcategoriesCount } = await supabase
      .from('ServiceSubcategory')
      .select('id', { count: 'exact' })
      .eq('categoryId', categoryId)
      .eq('isActive', true);

    const { count: servicesCount } = await supabase
      .from('Service')
      .select('id', { count: 'exact' })
      .eq('categoryId', categoryId)
      .eq('isActive', true)
      .eq('approvalStatus', 'APPROVED');

    const categoryWithCounts = {
      ...category,
      subcategoriesCount: subcategoriesCount ?? 0,
      servicesCount: servicesCount ?? 0,
    };

    // ─── Fetch subcategories for this category ───────────────────
    const { data: subcategories, error: subError } = await supabase
      .from('ServiceSubcategory')
      .select('*')
      .eq('categoryId', categoryId)
      .eq('isActive', true)
      .order('displayOrder')
      .order('id');

    if (subError) {
      console.error('Get subcategories error:', subError);
      return serverError('Failed to fetch subcategories');
    }

    return json({
      category: categoryWithCounts,
      subcategories: subcategories || [],
    });
  } catch (err) {
    console.error('Get category error:', err);
    return serverError('Failed to fetch category');
  }
}
