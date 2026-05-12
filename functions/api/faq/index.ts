import { query } from '../../_shared/db';
import { json, error } from '../../_shared/response';
import { Env } from '../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const category = url.searchParams.get('category');

    let sql = 'SELECT * FROM Faq WHERE isActive = 1';
    const params: any[] = [];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY displayOrder, id';

    const faqs = await query(context.env.DB, sql, params);

    return json({ faqs });
  } catch (e) {
    return error('Internal server error', 500);
  }
};
