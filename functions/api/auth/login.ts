import { queryOne, execute } from '../../_shared/db';
import { signToken } from '../../_shared/auth';
import { verifyPassword } from '../../_shared/password';
import { json, error } from '../../_shared/response';
import { Env } from '../../types';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { email, password } = await context.request.json() as { email: string; password: string };
    if (!email || !password) return error('Email and password are required', 400);

    const user = await queryOne(context.env.DB,
      'SELECT u.*, r.name as roleName FROM User u JOIN Role r ON u.roleId = r.id WHERE u.email = ?',
      [email]
    );
    if (!user) return error('Invalid email or password', 401);

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) return error('Invalid email or password', 401);

    if (user.status === 'BLOCKED') return error('Account is blocked', 403);

    const tokenPayload = { userId: user.id, email: user.email, roleId: user.roleId, role: user.roleName };
    const accessToken = await signToken(tokenPayload, context.env.JWT_SECRET, '15m');
    const refreshToken = await signToken(tokenPayload, context.env.JWT_SECRET, '7d');

    // Update last login
    await execute(context.env.DB, 'UPDATE User SET lastLoginAt = datetime("now") WHERE id = ?', [user.id]);

    return json({
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.roleName,
        status: user.status,
        profileImageUrl: user.profileImageUrl,
        city: user.city,
        state: user.state,
        country: user.country,
        roleId: user.roleId,
      },
      accessToken,
      refreshToken,
    });
  } catch (e) {
    return error('Internal server error', 500);
  }
};
