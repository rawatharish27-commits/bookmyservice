/**
 * GET /api/faq - Returns all active FAQ items
 *   SQL: SELECT * FROM Faq WHERE isActive = 1 ORDER BY displayOrder ASC, id ASC
 */

import { query } from '../../_shared/db';
import { json, error } from '../../_shared/response';

interface Env {
  DB: D1Database;
}

export async function onRequestGet(context: { request: Request; env: Env; params: Record<string, string> }): Promise<Response> {
  try {
    const url = new URL(context.request.url);
    const category = url.searchParams.get('category');

    let faqs;
    if (category) {
      faqs = await query(
        context.env.DB,
        `SELECT * FROM Faq WHERE isActive = 1 AND category = ? ORDER BY displayOrder ASC, id ASC`,
        [category]
      );
    } else {
      faqs = await query(
        context.env.DB,
        `SELECT * FROM Faq WHERE isActive = 1 ORDER BY displayOrder ASC, id ASC`,
        []
      );
    }

    // Group by category for convenience
    const grouped: Record<string, unknown[]> = {};
    for (const faq of faqs as Record<string, unknown>[]) {
      const cat = String(faq.category || 'General');
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(faq);
    }

    return json({
      faqs,
      grouped,
      total: (faqs as unknown[]).length,
    });
  } catch (err) {
    console.error('Get FAQ error:', err);
    return error('Failed to fetch FAQ items', 500);
  }
}
