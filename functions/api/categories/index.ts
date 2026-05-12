/**
 * GET /api/categories
 * Returns all categories with subcategories count and services count.
 */

import { createSupabaseClient, Env } from '../../_shared/db';
import { json, serverError } from '../../_shared/response';

export async function onRequestGet(context: EventContext<Record<string, unknown>, string, unknown>): Promise<Response> {
  const { env } = context as unknown as { env: Env };

  try {
    const supabase = createSupabaseClient(env);

    const { data: categories, error } = await supabase
      .from('ServiceCategory')
      .select('*')
      .eq('isActive', true)
      .order('displayOrder')
      .order('id');

    if (error) {
      console.error('Get categories error:', error);
      return serverError('Failed to fetch categories');
    }

    // PostgREST doesn't support subqueries, so fetch counts separately
    const categoriesWithCounts = await Promise.all(
      (categories || []).map(async (cat: Record<string, unknown>) => {
        const { count: subcategoriesCount } = await supabase
          .from('ServiceSubcategory')
          .select('id', { count: 'exact' })
          .eq('categoryId', cat.id)
          .eq('isActive', true);

        const { count: servicesCount } = await supabase
          .from('Service')
          .select('id', { count: 'exact' })
          .eq('categoryId', cat.id)
          .eq('isActive', true)
          .eq('approvalStatus', 'APPROVED');

        return {
          ...cat,
          subcategoriesCount: subcategoriesCount ?? 0,
          servicesCount: servicesCount ?? 0,
        };
      })
    );

    return json({
      categories: categoriesWithCounts,
      total: categoriesWithCounts.length,
    });
  } catch (err) {
    console.error('Get categories error:', err);
    return serverError('Failed to fetch categories');
  }
}
