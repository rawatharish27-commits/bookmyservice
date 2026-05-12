import { queryOne, execute } from '../../_shared/db';
import { requireAuth } from '../../_shared/auth';
import { json, error } from '../../_shared/response';
import { Env } from '../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);

    const user = await queryOne(context.env.DB,
      'SELECT u.id, u.email, u.phone, u.name, u.status, u.profileImageUrl, u.address, u.city, u.state, u.country, u.pincode, u.emailVerified, u.phoneVerified, u.roleId, r.name as role FROM User u JOIN Role r ON u.roleId = r.id WHERE u.id = ?',
      [auth.userId]
    );
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
    const body = await context.request.json() as Record<string, any>;

    const allowedFields = ['name', 'phone', 'address', 'city', 'state', 'country', 'pincode', 'profileImageUrl'];
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
    values.push(auth.userId);

    await execute(context.env.DB, `UPDATE User SET ${updates.join(', ')} WHERE id = ?`, values);

    const user = await queryOne(context.env.DB,
      'SELECT u.id, u.email, u.phone, u.name, u.status, u.profileImageUrl, u.address, u.city, u.state, u.country, u.pincode, u.emailVerified, u.phoneVerified, u.roleId, r.name as role FROM User u JOIN Role r ON u.roleId = r.id WHERE u.id = ?',
      [auth.userId]
    );

    return json({ user });
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};
