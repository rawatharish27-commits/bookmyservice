import { queryOne } from '../../_shared/db';
import { json, error } from '../../_shared/response';
import { Env } from '../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { type } = context.params;

    const page = await queryOne(context.env.DB,
      'SELECT * FROM LegalPage WHERE pageType = ?', [type.toUpperCase()]
    );

    if (!page) return error('Legal page not found', 404);

    return json({ page });
  } catch (e) {
    return error('Internal server error', 500);
  }
};
