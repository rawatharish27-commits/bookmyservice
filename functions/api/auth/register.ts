import { queryOne, execute } from '../../_shared/db';
import { signToken } from '../../_shared/auth';
import { hashPassword } from '../../_shared/password';
import { json, error } from '../../_shared/response';
import { Env } from '../../types';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { email, phone, password, name, role, roleId } = await context.request.json() as {
      email: string; phone: string; password: string; name: string; role?: string; roleId?: number;
    };
    if (!email || !phone || !password || !name) return error('All fields are required', 400);

    const existingEmail = await queryOne(context.env.DB, 'SELECT id FROM User WHERE email = ?', [email]);
    if (existingEmail) return error('Email already registered', 409);

    const existingPhone = await queryOne(context.env.DB, 'SELECT id FROM User WHERE phone = ?', [phone]);
    if (existingPhone) return error('Phone already registered', 409);

    const roleName = (role || 'CLIENT').toUpperCase();
    const roleRecord = await queryOne(context.env.DB, 'SELECT id FROM Role WHERE name = ?', [roleName]);
    if (!roleRecord) return error('Invalid role', 400);

    // Use roleId if provided and matches, otherwise use roleRecord.id
    const userRoleId = roleId && roleId === roleRecord.id ? roleId : roleRecord.id;

    const passwordHash = await hashPassword(password);
    const id = crypto.randomUUID();

    await execute(context.env.DB,
      'INSERT INTO User (id, email, phone, passwordHash, name, roleId, status, emailVerified, phoneVerified, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, datetime("now"), datetime("now"))',
      [id, email, phone, passwordHash, name, userRoleId, 'PENDING']
    );

    const tokenPayload = { userId: id, email, roleId: userRoleId as number, role: roleName };
    const accessToken = await signToken(tokenPayload, context.env.JWT_SECRET, '15m');
    const refreshToken = await signToken(tokenPayload, context.env.JWT_SECRET, '7d');

    return json({
      user: { id, email, phone, name, role: roleName, status: 'PENDING', roleId: userRoleId },
      accessToken,
      refreshToken,
    }, 201);
  } catch (e) {
    return error('Internal server error', 500);
  }
};
