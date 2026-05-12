import { queryOne, execute } from '../../../_shared/db';
import { requireAuth } from '../../../_shared/auth';
import { json, error } from '../../../_shared/response';
import { Env } from '../../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);
    if (auth.role !== 'ADMIN') return error('Admin access required', 403);

    const { userId } = context.params;
    const user = await queryOne(context.env.DB, `
      SELECT u.*, r.name as roleName,
        (SELECT COUNT(*) FROM Booking WHERE clientId = u.id) as totalBookingsAsClient,
        (SELECT COUNT(*) FROM Booking WHERE providerId = u.id) as totalBookingsAsProvider,
        (SELECT COUNT(*) FROM Service WHERE providerId = u.id) as totalServices,
        (SELECT COUNT(*) FROM Review WHERE reviewedId = u.id) as totalReviewsReceived
      FROM User u
      JOIN Role r ON u.roleId = r.id
      WHERE u.id = ?
    `, [userId]);

    if (!user) return error('User not found', 404);

    return json({ user });
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);
    if (auth.role !== 'ADMIN') return error('Admin access required', 403);

    const { userId } = context.params;
    const body = await context.request.json() as Record<string, any>;

    const allowedFields = ['name', 'phone', 'status', 'emailVerified', 'phoneVerified', 'city', 'state', 'country'];
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
    values.push(userId);

    await execute(context.env.DB, `UPDATE User SET ${updates.join(', ')} WHERE id = ?`, values);

    return json({ message: 'User updated successfully' });
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);
    if (auth.role !== 'ADMIN') return error('Admin access required', 403);

    const { userId } = context.params;

    if (userId === auth.userId) return error('Cannot delete your own account', 400);

    await execute(context.env.DB, 'DELETE FROM User WHERE id = ?', [userId]);

    return json({ message: 'User deleted successfully' });
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};
