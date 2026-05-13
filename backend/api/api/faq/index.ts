/**
 * GET /api/faq - Returns all active FAQ items
 *   Fetches from Faq table where isActive = true, ordered by displayOrder and id
 */

import { createSupabaseClient, Env } from '../../_shared/db';
import { json, error } from '../../_shared/response';

export async function onRequestGet(context: { request: Request; env: Env; params: Record<string, string> }): Promise<Response> {
  try {
    const supabase = createSupabaseClient(context.env);
    const url = new URL(context.request.url);
    const category = url.searchParams.get('category');

    let queryBuilder = supabase
      .from('Faq')
      .select('*')
      .eq('isActive', true)
      .order('displayOrder', { ascending: true })
      .order('id', { ascending: true });

    if (category) {
      queryBuilder = queryBuilder.eq('category', category);
    }

    const { data: faqs, error: faqsError } = await queryBuilder;

    if (faqsError) {
      console.error('Get FAQ error:', faqsError);
      return error('Failed to fetch FAQ items', 500);
    }

    // Group by category for convenience
    const grouped: Record<string, unknown[]> = {};
    for (const faq of (faqs || []) as Record<string, unknown>[]) {
      const cat = String(faq.category || 'General');
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(faq);
    }

    return json({
      faqs,
      grouped,
      total: (faqs || []).length,
    });
  } catch (err) {
    console.error('Get FAQ error:', err);
    return error('Failed to fetch FAQ items', 500);
  }
}
