import { query, execute } from '../../_shared/db';
import { requireAuth } from '../../_shared/auth';
import { json, error } from '../../_shared/response';
import { Env } from '../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);
    if (auth.role !== 'ADMIN') return error('Admin access required', 403);

    const faqs = await query(context.env.DB,
      'SELECT * FROM Faq ORDER BY category, displayOrder, id'
    );

    return json({ faqs });
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);
    if (auth.role !== 'ADMIN') return error('Admin access required', 403);

    const body = await context.request.json() as {
      category: string; question: string; answer: string;
      displayOrder?: number; isActive?: boolean;
    };

    if (!body.category || !body.question || !body.answer) {
      return error('category, question, and answer are required', 400);
    }

    await execute(context.env.DB, `
      INSERT INTO Faq (category, question, answer, displayOrder, isActive, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, datetime("now"), datetime("now"))
    `, [body.category, body.question, body.answer, body.displayOrder || 0,
        body.isActive !== false ? 1 : 0]);

    return json({ message: 'FAQ created successfully' }, 201);
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};
