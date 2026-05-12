import { queryOne, execute } from '../../_shared/db';
import { requireAuth } from '../../_shared/auth';
import { json, error } from '../../_shared/response';
import { Env } from '../../types';

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);
    const { id } = context.params;
    const body = await context.request.json() as { rating?: number; comment?: string };

    const review = await queryOne(context.env.DB, 'SELECT reviewerId, serviceId FROM Review WHERE id = ?', [id]);
    if (!review) return error('Review not found', 404);
    if (auth.role !== 'ADMIN' && review.reviewerId !== auth.userId) {
      return error('Not authorized', 403);
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (body.rating !== undefined) {
      if (body.rating < 1 || body.rating > 5) return error('Rating must be between 1 and 5', 400);
      updates.push('rating = ?');
      values.push(body.rating);
    }
    if (body.comment !== undefined) {
      updates.push('comment = ?');
      values.push(body.comment);
    }

    if (updates.length === 0) return error('No valid fields to update', 400);

    updates.push('updatedAt = datetime("now")');
    values.push(id);

    await execute(context.env.DB, `UPDATE Review SET ${updates.join(', ')} WHERE id = ?`, values);

    // Recalculate service average rating
    await execute(context.env.DB, `
      UPDATE Service SET
        averageRating = (SELECT AVG(rating) FROM Review WHERE serviceId = ?),
        updatedAt = datetime("now")
      WHERE id = ?
    `, [review.serviceId, review.serviceId]);

    return json({ message: 'Review updated' });
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);
    const { id } = context.params;

    const review = await queryOne(context.env.DB, 'SELECT reviewerId, serviceId FROM Review WHERE id = ?', [id]);
    if (!review) return error('Review not found', 404);
    if (auth.role !== 'ADMIN' && review.reviewerId !== auth.userId) {
      return error('Not authorized', 403);
    }

    await execute(context.env.DB, 'DELETE FROM Review WHERE id = ?', [id]);

    // Recalculate service average rating
    await execute(context.env.DB, `
      UPDATE Service SET
        totalReviews = (SELECT COUNT(*) FROM Review WHERE serviceId = ?),
        averageRating = COALESCE((SELECT AVG(rating) FROM Review WHERE serviceId = ?), 0),
        updatedAt = datetime("now")
      WHERE id = ?
    `, [review.serviceId, review.serviceId, review.serviceId]);

    return json({ message: 'Review deleted' });
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};
