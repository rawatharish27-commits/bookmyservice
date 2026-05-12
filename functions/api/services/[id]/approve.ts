import { queryOne, execute } from '../../../_shared/db';
import { requireAuth } from '../../../_shared/auth';
import { json, error } from '../../../_shared/response';
import { Env } from '../../../types';

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);
    if (auth.role !== 'ADMIN') return error('Only admins can approve services', 403);

    const { id } = context.params;
    const body = await context.request.json() as { approved?: boolean; rejectionReason?: string };

    const service = await queryOne(context.env.DB, 'SELECT id FROM Service WHERE id = ?', [id]);
    if (!service) return error('Service not found', 404);

    if (body.approved) {
      await execute(context.env.DB, `
        UPDATE Service SET isApproved = 1, approvalStatus = 'APPROVED', approvedBy = ?, approvedAt = datetime("now"), isActive = 1, updatedAt = datetime("now") WHERE id = ?
      `, [auth.userId, id]);
    } else {
      await execute(context.env.DB, `
        UPDATE Service SET isApproved = 0, approvalStatus = 'REJECTED', rejectionReason = ?, updatedAt = datetime("now") WHERE id = ?
      `, [body.rejectionReason || null, id]);
    }

    return json({ message: body.approved ? 'Service approved' : 'Service rejected' });
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};
