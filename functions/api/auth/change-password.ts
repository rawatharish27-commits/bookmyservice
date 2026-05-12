/**
 * POST /api/auth/change-password
 * Changes the authenticated user's password.
 */

import { queryOne, execute } from '../../_shared/db';
import { requireAuth } from '../../_shared/auth';
import { verifyPassword, hashPassword } from '../../_shared/password';
import { json, error, unauthorized, serverError } from '../../_shared/response';
import { validatePassword } from '../../_shared/security';

interface ChangePasswordBody {
  currentPassword?: string;
  newPassword?: string;
}

export async function onRequestPost(context: EventContext<Record<string, unknown>, string, unknown>): Promise<Response> {
  const { request, env } = context as { request: Request; env: { DB: D1Database; JWT_SECRET: string } };

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

    // ─── Fetch current password hash ─────────────────────────────
    const userRecord = await queryOne(
      env.DB,
      'SELECT passwordHash FROM User WHERE id = ?',
      [user.userId]
    ) as { passwordHash: string } | null;

    if (!userRecord) {
      return error('User not found', 404);
    }

    // ─── Verify current password ─────────────────────────────────
    const isCurrentValid = await verifyPassword(String(currentPassword), userRecord.passwordHash);
    if (!isCurrentValid) {
      return error('Current password is incorrect', 401);
    }

    // ─── Validate new password strength ──────────────────────────
    const passwordValidation = validatePassword(String(newPassword));
    if (!passwordValidation.valid) {
      return error('New password does not meet requirements', 400, { errors: passwordValidation.errors });
    }

    // ─── Ensure new password is different from current ───────────
    const isSamePassword = await verifyPassword(String(newPassword), userRecord.passwordHash);
    if (isSamePassword) {
      return error('New password must be different from current password', 400);
    }

    // ─── Hash and update password ────────────────────────────────
    const newPasswordHash = await hashPassword(String(newPassword));
    await execute(
      env.DB,
      "UPDATE User SET passwordHash = ?, updatedAt = datetime('now') WHERE id = ?",
      [newPasswordHash, user.userId]
    );

    return json({
      message: 'Password changed successfully',
    });
  } catch (err) {
    console.error('Change password error:', err);
    return serverError('Failed to change password');
  }
}
