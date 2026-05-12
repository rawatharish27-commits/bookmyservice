/**
 * POST /api/auth/change-password
 * Changes the authenticated user's password.
 */

import { createSupabaseClient, Env } from '../../_shared/db';
import { requireAuth } from '../../_shared/auth';
import { verifyPassword, hashPassword } from '../../_shared/password';
import { json, error, unauthorized, serverError } from '../../_shared/response';
import { validatePassword } from '../../_shared/security';

interface ChangePasswordBody {
  currentPassword?: string;
  newPassword?: string;
}

export async function onRequestPost(context: EventContext<Record<string, unknown>, string, unknown>): Promise<Response> {
  const { request, env } = context as unknown as { request: Request; env: Env };

  try {
    // ─── Authenticate ─────────────────────────────────────────────
    let user;
    try {
      user = await requireAuth(request, env);
    } catch {
      return unauthorized('Authentication required');
    }

    const body: ChangePasswordBody = await request.json();
    const { currentPassword, newPassword } = body;

    // ─── Validate required fields ────────────────────────────────
    if (!currentPassword || !newPassword) {
      return error('Current password and new password are required', 400);
    }

    // ─── Create Supabase client ──────────────────────────────────
    const supabase = createSupabaseClient(env);

    // ─── Fetch current password hash ─────────────────────────────
    const { data: userRecord, error: queryError } = await supabase
      .from('User')
      .select('passwordHash')
      .eq('id', user.userId)
      .maybeSingle();

    if (queryError) {
      console.error('Change password query error:', queryError);
      return serverError('Failed to change password');
    }

    if (!userRecord) {
      return error('User not found', 404);
    }

    const storedHash = (userRecord as Record<string, unknown>).passwordHash as string;

    // ─── Verify current password ─────────────────────────────────
    const isCurrentValid = await verifyPassword(String(currentPassword), storedHash);
    if (!isCurrentValid) {
      return error('Current password is incorrect', 401);
    }

    // ─── Validate new password strength ──────────────────────────
    const passwordValidation = validatePassword(String(newPassword));
    if (!passwordValidation.valid) {
      return error('New password does not meet requirements', 400, { errors: passwordValidation.errors });
    }

    // ─── Ensure new password is different from current ───────────
    const isSamePassword = await verifyPassword(String(newPassword), storedHash);
    if (isSamePassword) {
      return error('New password must be different from current password', 400);
    }

    // ─── Hash and update password ────────────────────────────────
    const newPasswordHash = await hashPassword(String(newPassword));
    await supabase
      .from('User')
      .update({ passwordHash: newPasswordHash, updatedAt: new Date().toISOString() })
      .eq('id', user.userId);

    return json({
      message: 'Password changed successfully',
    });
  } catch (err) {
    console.error('Change password error:', err);
    return serverError('Failed to change password');
  }
}
