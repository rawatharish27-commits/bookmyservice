import { query } from '../../_shared/db';
import { json, error } from '../../_shared/response';
import { Env } from '../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const pages = await query(context.env.DB,
      'SELECT id, pageType, title, version, effectiveDate, updatedAt FROM LegalPage ORDER BY id'
    );

    return json({ pages });
  } catch (e) {
    return error('Internal server error', 500);
  }
};
