import { queryOne, execute } from '../../_shared/db';
import { requireAuth } from '../../_shared/auth';
import { verifyPassword, hashPassword } from '../../_shared/password';
import { json, error } from '../../_shared/response';
import { Env } from '../../types';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);
    const { currentPassword, newPassword } = await context.request.json() as {
      currentPassword: string; newPassword: string;
    };

    if (!currentPassword || !newPassword) return error('Current password and new password are required', 400);
    if (newPassword.length < 8) return error('New password must be at least 8 characters', 400);

    const user = await queryOne(context.env.DB, 'SELECT passwordHash FROM User WHERE id = ?', [auth.userId]);
    if (!user) return error('User not found', 404);

    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) return error('Current password is incorrect', 401);

    const newHash = await hashPassword(newPassword);
    await execute(context.env.DB, 'UPDATE User SET passwordHash = ?, updatedAt = datetime("now") WHERE id = ?', [newHash, auth.userId]);

    return json({ message: 'Password changed successfully' });
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};
