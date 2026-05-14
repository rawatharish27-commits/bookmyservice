/**
 * POST /api/auth/login
 * Authenticates a user with email and password.
 */

import { createSupabaseClient, Env } from '../../_shared/db';
import { signAccessToken, signRefreshToken } from '../../_shared/auth';
import { verifyPassword } from '../../_shared/password';
import { json, error, unauthorized, serverError } from '../../_shared/response';
import { sanitizeString, validateEmail } from '../../_shared/security';

interface LoginBody {
  email?: string;
  password?: string;
}

export async function onRequestPost(context: EventContext<Record<string, unknown>, string, unknown>): Promise<Response> {
  const { request, env } = context as unknown as { request: Request; env: Env };

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

    // ─── Create Supabase client ──────────────────────────────────
    const supabase = createSupabaseClient(env);

    // ─── Look up user by email with Role join ────────────────────
    const { data: user, error: queryError } = await supabase
      .from('User')
      .select('*, Role(name)')
      .ilike('email', sanitizedEmail)
      .maybeSingle();

    if (queryError) {
      console.error('Login query error:', queryError);
      return serverError('Login failed. Please try again.');
    }

    if (!user) {
      return unauthorized('Invalid email or password');
    }

    // ─── Flatten PostgREST join result ───────────────────────────
    // PostgREST returns: { id, email, ..., roleId, Role: { name: "CLIENT" } }
    // Flatten to: { id, email, ..., roleId, role: "CLIENT" }
    const userRecord = user as Record<string, unknown> & { passwordHash: string; status: string; roleId: number; id: string; email: string; Role?: { name: string } };
    const roleName = userRecord.Role?.name ?? '';

    // ─── Verify password ─────────────────────────────────────────
    const isValid = await verifyPassword(String(password), userRecord.passwordHash);
    if (!isValid) {
      return unauthorized('Invalid email or password');
    }

    // ─── Check user status ───────────────────────────────────────
    if (userRecord.status !== 'ACTIVE') {
      return error(
        `Your account is ${String(userRecord.status).toLowerCase()}. Please contact support.`,
        403
      );
    }

    // ─── Update last login timestamp ─────────────────────────────
    await supabase
      .from('User')
      .update({ lastLoginAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
      .eq('id', userRecord.id);

    // ─── Sign tokens ─────────────────────────────────────────────
    const tokenPayload = {
      userId: userRecord.id,
      email: userRecord.email,
      roleId: userRecord.roleId,
      role: roleName,
    };

    const accessToken = await signAccessToken(tokenPayload, env);
    const refreshToken = await signRefreshToken(tokenPayload, env);

    // ─── Remove passwordHash and flatten role for response ───────
    const { passwordHash: _ph, Role: _role, ...safeFields } = userRecord as Record<string, unknown> & { passwordHash: string; Role?: unknown };
    const safeUser = { ...safeFields, role: roleName };

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
