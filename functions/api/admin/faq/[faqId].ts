import { queryOne, execute } from '../../../_shared/db';
import { requireAuth } from '../../../_shared/auth';
import { json, error } from '../../../_shared/response';
import { Env } from '../../../types';

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);
    if (auth.role !== 'ADMIN') return error('Admin access required', 403);

    const { faqId } = context.params;
    const body = await context.request.json() as Record<string, any>;

    const faq = await queryOne(context.env.DB, 'SELECT id FROM Faq WHERE id = ?', [parseInt(faqId)]);
    if (!faq) return error('FAQ not found', 404);

    const allowedFields = ['category', 'question', 'answer', 'displayOrder', 'isActive'];
    const updates: string[] = [];
    const values: any[] = [];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(body[field]);
      }
    }

    if (updates.length === 0) return error('No valid fields to update', 400);

    updates.push('updatedAt = datetime("now")');
    values.push(parseInt(faqId));

    await execute(context.env.DB, `UPDATE Faq SET ${updates.join(', ')} WHERE id = ?`, values);

    return json({ message: 'FAQ updated successfully' });
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);
    if (auth.role !== 'ADMIN') return error('Admin access required', 403);

    const { faqId } = context.params;

    await execute(context.env.DB, 'DELETE FROM Faq WHERE id = ?', [parseInt(faqId)]);

    return json({ message: 'FAQ deleted successfully' });
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};
