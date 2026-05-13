/**
 * GET /api/legal - Returns list of all legal documents
 */

import { createSupabaseClient, Env } from '../../_shared/db';
import { json, error } from '../../_shared/response';

export async function onRequestGet(context: { request: Request; env: Env; params: Record<string, string> }): Promise<Response> {
  try {
    const supabase = createSupabaseClient(context.env);

    const { data: documents, error: docsError } = await supabase
      .from('LegalPage')
      .select('id,pageType,title,version,effectiveDate,updatedAt')
      .order('id', { ascending: true });

    if (docsError) {
      console.error('Get legal documents error:', docsError);
      return error('Failed to fetch legal documents', 500);
    }

    return json({
      documents,
      total: (documents || []).length,
    });
  } catch (err) {
    console.error('Get legal documents error:', err);
    return error('Failed to fetch legal documents', 500);
  }
}
