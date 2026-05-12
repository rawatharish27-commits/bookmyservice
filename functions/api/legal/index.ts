/**
 * GET /api/legal - Returns list of all legal documents
 */

import { query } from '../../_shared/db';
import { json, error } from '../../_shared/response';

interface Env {
  DB: D1Database;
}

export async function onRequestGet(context: { request: Request; env: Env; params: Record<string, string> }): Promise<Response> {
  try {
    const documents = await query(
      context.env.DB,
      `SELECT id, pageType, title, version, effectiveDate, updatedAt FROM LegalPage ORDER BY id ASC`,
      []
    );

    return json({
      documents,
      total: (documents as unknown[]).length,
    });
  } catch (err) {
    console.error('Get legal documents error:', err);
    return error('Failed to fetch legal documents', 500);
  }
}
