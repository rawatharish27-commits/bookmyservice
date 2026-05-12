/**
 * GET /api/legal/:type - Returns specific legal document
 *   - type can be: terms, privacy, refund-policy, cookies, aup, provider-agreement, community-guidelines
 */

import { queryOne } from '../../_shared/db';
import { json, error, notFound } from '../../_shared/response';

interface Env {
  DB: D1Database;
}

// Map URL type param to database pageType values
const TYPE_MAP: Record<string, string> = {
  'terms': 'terms-of-service',
  'privacy': 'privacy-policy',
  'refund-policy': 'refund-policy',
  'cookies': 'cookie-policy',
  'aup': 'acceptable-use-policy',
  'provider-agreement': 'provider-agreement',
  'community-guidelines': 'community-guidelines',
};

export async function onRequestGet(context: { request: Request; env: Env; params: { type: string } }): Promise<Response> {
  try {
    const typeParam = context.params.type;

    // Map the URL-friendly type to the database pageType
    const pageType = TYPE_MAP[typeParam] || typeParam;

    const document = await queryOne(
      context.env.DB,
      `SELECT * FROM LegalPage WHERE pageType = ?`,
      [pageType]
    );

    if (!document) {
      return notFound(`Legal document '${typeParam}' not found`);
    }

    return json({ document });
  } catch (err) {
    console.error('Get legal document error:', err);
    return error('Failed to fetch legal document', 500);
  }
}
