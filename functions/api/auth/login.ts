/**
 * POST /api/auth/login
 * Authenticates a user with email and password.
 */

import { queryOne, execute } from '../../_shared/db';
import { signAccessToken, signRefreshToken } from '../../_shared/auth';
import { verifyPassword } from '../../_shared/password';
import { json, error, unauthorized, serverError } from '../../_shared/response';
import { sanitizeString, validateEmail } from '../../_shared/security';

interface LoginBody {
  email?: string;
  password?: string;
}

export async function onRequestPost(context: EventContext<Record<string, unknown>, string, unknown>): Promise<Response> {
  const { request, env } = context as { request: Request; env: { DB: D1Database; JWT_SECRET: string } };

  try {
    const body: LoginBody = await request.json();
    const { email, password } = body;

    // ─── Validate required fields ────────────────────────────────
    if (!email || !password) {
      return error('Email and password are required', 400);
    }

    // ─── Sanitize and validate email ─────────────────────────────
    const sanitizedEmail = sanitizeString(String(email)).toLowerCase();
    if (!validateEmail(sanitizedEmail)) {
      return error('Invalid email address format', 400);
    }

    // ─── Look up user by email ───────────────────────────────────
    const user = await queryOne(
      env.DB,
      `SELECT u.id, u.email, u.phone, u.passwordHash, u.name, u.roleId, u.status, u.profileImageUrl,
              u.city, u.state, u.country, u.address, u.pincode, u.createdAt, u.updatedAt, r.name as role
       FROM User u JOIN Role r ON u.roleId = r.id
       WHERE u.email = ?`,
      [sanitizedEmail]
    ) as (Record<string, unknown> & { passwordHash: string; status: string; roleId: number; id: string; email: string; role: string }) | null;

    if (!user) {
      return unauthorized('Invalid email or password');
    }

    // ─── Verify password ─────────────────────────────────────────
    const isValid = await verifyPassword(String(password), user.passwordHash);
    if (!isValid) {
      return unauthorized('Invalid email or password');
    }

    // ─── Check user status ───────────────────────────────────────
    if (user.status !== 'ACTIVE') {
      return error(
        `Your account is ${String(user.status).toLowerCase()}. Please contact support.`,
        403
      );
    }

    // ─── Update last login timestamp ─────────────────────────────
    await execute(
      env.DB,
      `UPDATE User SET lastLoginAt = datetime('now'), updatedAt = datetime('now') WHERE id = ?`,
      [user.id]
    );

    // ─── Sign tokens ─────────────────────────────────────────────
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      roleId: user.roleId,
      role: user.role,
    };

    const accessToken = await signAccessToken(tokenPayload, env);
    const refreshToken = await signRefreshToken(tokenPayload, env);

    // ─── Remove passwordHash from response ───────────────────────
    const { passwordHash: _ph, ...safeUser } = user as Record<string, unknown> & { passwordHash: string };

    return json({
      message: 'Login successful',
      user: safeUser,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error('Login error:', err);
    return serverError('Login failed. Please try again.');
  }
}
