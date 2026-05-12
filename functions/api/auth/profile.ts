/**
 * GET  /api/auth/profile - Returns current user profile
 * PATCH /api/auth/profile - Updates user profile
 */

import { queryOne, execute } from '../../_shared/db';
import { requireAuth } from '../../_shared/auth';
import { json, error, unauthorized, serverError } from '../../_shared/response';
import { sanitizeString, validatePhone, validateEmail } from '../../_shared/security';

// ─── GET /api/auth/profile ────────────────────────────────────────

export async function onRequestGet(context: EventContext<Record<string, unknown>, string, unknown>): Promise<Response> {
  const { request, env } = context as { request: Request; env: { DB: D1Database; JWT_SECRET: string } };

  try {
    // ─── Authenticate ─────────────────────────────────────────────
    let user;
    try {
      user = await requireAuth(request, env);
    } catch {
      return unauthorized('Authentication required');
    }

    // ─── Fetch user profile ──────────────────────────────────────
    const profile = await queryOne(
      env.DB,
      `SELECT u.id, u.email, u.phone, u.name, u.roleId, u.status, u.profileImageUrl,
              u.city, u.state, u.country, u.address, u.pincode, u.emailVerified, u.phoneVerified,
              u.createdAt, u.updatedAt, u.lastLoginAt, r.name as role
       FROM User u JOIN Role r ON u.roleId = r.id
       WHERE u.id = ?`,
      [user.userId]
    );

    if (!profile) {
      return error('User not found', 404);
    }

    // ─── If provider, also fetch KYC status ──────────────────────
    let kycStatus = null;
    if (user.roleId === 2) {
      const kyc = await queryOne(
        env.DB,
        'SELECT verificationStatus FROM ProviderKyc WHERE providerId = ?',
        [user.userId]
      );
      kycStatus = kyc ? (kyc as Record<string, unknown>).verificationStatus : null;
    }

    return json({
      user: profile,
      kycStatus,
    });
  } catch (err) {
    console.error('Get profile error:', err);
    return serverError('Failed to fetch profile');
  }
}

// ─── PATCH /api/auth/profile ──────────────────────────────────────

interface UpdateProfileBody {
  name?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
}

export async function onRequestPatch(context: EventContext<Record<string, unknown>, string, unknown>): Promise<Response> {
  const { request, env } = context as { request: Request; env: { DB: D1Database; JWT_SECRET: string } };

  try {
    // ─── Authenticate ─────────────────────────────────────────────
    let user;
    try {
      user = await requireAuth(request, env);
    } catch {
      return unauthorized('Authentication required');
    }

    const body: UpdateProfileBody = await request.json();
    const updates: string[] = [];
    const params: unknown[] = [];

    // ─── Validate and build update fields ─────────────────────────
    if (body.name !== undefined) {
      const sanitizedName = sanitizeString(String(body.name));
      if (sanitizedName.length < 2 || sanitizedName.length > 100) {
        return error('Name must be between 2 and 100 characters', 400);
      }
      updates.push('name = ?');
      params.push(sanitizedName);
    }

    if (body.phone !== undefined) {
      const sanitizedPhone = sanitizeString(String(body.phone));
      if (!validatePhone(sanitizedPhone)) {
        return error('Invalid phone number. Must be 10 digits starting with 6-9', 400);
      }
      // Check if phone is already used by another user
      const existingPhone = await queryOne(
        env.DB,
        'SELECT id FROM User WHERE phone = ? AND id != ?',
        [sanitizedPhone, user.userId]
      );
      if (existingPhone) {
        return error('Phone number is already registered by another user', 409);
      }
      updates.push('phone = ?');
      params.push(sanitizedPhone);
    }

    if (body.city !== undefined) {
      updates.push('city = ?');
      params.push(sanitizeString(String(body.city)));
    }

    if (body.state !== undefined) {
      updates.push('state = ?');
      params.push(sanitizeString(String(body.state)));
    }

    if (body.country !== undefined) {
      updates.push('country = ?');
      params.push(sanitizeString(String(body.country)));
    }

    if (updates.length === 0) {
      return error('No fields provided to update', 400);
    }

    // ─── Always update updatedAt ──────────────────────────────────
    updates.push("updatedAt = datetime('now')");
    params.push(user.userId);

    // ─── Execute update ───────────────────────────────────────────
    await execute(
      env.DB,
      `UPDATE User SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // ─── Fetch updated profile ────────────────────────────────────
    const updatedProfile = await queryOne(
      env.DB,
      `SELECT u.id, u.email, u.phone, u.name, u.roleId, u.status, u.profileImageUrl,
              u.city, u.state, u.country, u.address, u.pincode, u.emailVerified, u.phoneVerified,
              u.createdAt, u.updatedAt, r.name as role
       FROM User u JOIN Role r ON u.roleId = r.id
       WHERE u.id = ?`,
      [user.userId]
    );

    return json({
      message: 'Profile updated successfully',
      user: updatedProfile,
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return serverError('Failed to update profile');
  }
}
