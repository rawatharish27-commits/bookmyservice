/**
 * GET /api/subcategories?categoryId=X
 * Returns subcategories for a given category.
 */

import { createSupabaseClient, Env } from '../../_shared/db';
import { json, error, serverError } from '../../_shared/response';

export async function onRequestGet(context: EventContext<Record<string, unknown>, string, unknown>): Promise<Response> {
  const { request, env } = context as unknown as { request: Request; env: Env };

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

    const supabase = createSupabaseClient(env);

    const { data: subcategories, error: subError } = await supabase
      .from('ServiceSubcategory')
      .select('*')
      .eq('categoryId', categoryIdNum)
      .eq('isActive', true)
      .order('displayOrder')
      .order('id');

    if (subError) {
      console.error('Get subcategories error:', subError);
      return serverError('Failed to fetch subcategories');
    }

    // Fetch services count for each subcategory
    const subcategoriesWithCounts = await Promise.all(
      (subcategories || []).map(async (sub: Record<string, unknown>) => {
        const { count: servicesCount } = await supabase
          .from('Service')
          .select('id', { count: 'exact' })
          .eq('subcategoryId', sub.id)
          .eq('isActive', true)
          .eq('approvalStatus', 'APPROVED');

        return {
          ...sub,
          servicesCount: servicesCount ?? 0,
        };
      })
    );

    return json({
      subcategories: subcategoriesWithCounts,
      total: subcategoriesWithCounts.length,
      categoryId: categoryIdNum,
    });
  } catch (err) {
    console.error('Get subcategories error:', err);
    return serverError('Failed to fetch subcategories');
  }
}
