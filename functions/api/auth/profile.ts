/**
 * GET  /api/auth/profile - Returns current user profile
 * PATCH /api/auth/profile - Updates user profile
 */

import { createSupabaseClient, Env } from '../../_shared/db';
import { requireAuth } from '../../_shared/auth';
import { json, error, unauthorized, serverError } from '../../_shared/response';
import { sanitizeString, validatePhone } from '../../_shared/security';

// ─── GET /api/auth/profile ────────────────────────────────────────

export async function onRequestGet(context: EventContext<Record<string, unknown>, string, unknown>): Promise<Response> {
  const { request, env } = context as unknown as { request: Request; env: Env };

  try {
    // ─── Authenticate ─────────────────────────────────────────────
    let user;
    try {
      user = await requireAuth(request, env);
    } catch {
      return unauthorized('Authentication required');
    }

    // ─── Create Supabase client ──────────────────────────────────
    const supabase = createSupabaseClient(env);

    // ─── Fetch user profile with Role join ───────────────────────
    const { data: profile, error: queryError } = await supabase
      .from('User')
      .select('*, Role(name)')
      .eq('id', user.userId)
      .maybeSingle();

    if (queryError) {
      console.error('Get profile query error:', queryError);
      return serverError('Failed to fetch profile');
    }

    if (!profile) {
      return error('User not found', 404);
    }

    // ─── Flatten PostgREST join result ───────────────────────────
    const { Role: _role, ...profileFields } = profile as Record<string, unknown> & { Role?: { name: string } };
    const flatProfile = { ...profileFields, role: (profile as Record<string, unknown> & { Role?: { name: string } }).Role?.name ?? '' };

    // ─── If provider, also fetch KYC status ──────────────────────
    let kycStatus: string | null = null;
    if (user.roleId === 2) {
      const { data: kyc } = await supabase
        .from('ProviderKyc')
        .select('verificationStatus')
        .eq('providerId', user.userId)
        .maybeSingle();
      kycStatus = kyc ? String((kyc as Record<string, unknown>).verificationStatus ?? null) : null;
    }

    return json({
      user: flatProfile,
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
  const { request, env } = context as unknown as { request: Request; env: Env };

  try {
    // ─── Authenticate ─────────────────────────────────────────────
    let user;
    try {
      user = await requireAuth(request, env);
    } catch {
      return unauthorized('Authentication required');
    }

    const body: UpdateProfileBody = await request.json();
    const updateData: Record<string, unknown> = {};

    // ─── Create Supabase client ──────────────────────────────────
    const supabase = createSupabaseClient(env);

    // ─── Validate and build update fields ─────────────────────────
    if (body.name !== undefined) {
      const sanitizedName = sanitizeString(String(body.name));
      if (sanitizedName.length < 2 || sanitizedName.length > 100) {
        return error('Name must be between 2 and 100 characters', 400);
      }
      updateData.name = sanitizedName;
    }

    if (body.phone !== undefined) {
      const sanitizedPhone = sanitizeString(String(body.phone));
      if (!validatePhone(sanitizedPhone)) {
        return error('Invalid phone number. Must be 10 digits starting with 6-9', 400);
      }
      // Check if phone is already used by another user
      const { data: existingPhone } = await supabase
        .from('User')
        .select('id')
        .eq('phone', sanitizedPhone)
        .neq('id', user.userId)
        .maybeSingle();
      if (existingPhone) {
        return error('Phone number is already registered by another user', 409);
      }
      updateData.phone = sanitizedPhone;
    }

    if (body.city !== undefined) {
      updateData.city = sanitizeString(String(body.city));
    }

    if (body.state !== undefined) {
      updateData.state = sanitizeString(String(body.state));
    }

    if (body.country !== undefined) {
      updateData.country = sanitizeString(String(body.country));
    }

    if (Object.keys(updateData).length === 0) {
      return error('No fields provided to update', 400);
    }

    // ─── Always update updatedAt ──────────────────────────────────
    updateData.updatedAt = new Date().toISOString();

    // ─── Execute update ───────────────────────────────────────────
    await supabase
      .from('User')
      .update(updateData)
      .eq('id', user.userId);

    // ─── Fetch updated profile with Role join ────────────────────
    const { data: updatedProfile, error: fetchError } = await supabase
      .from('User')
      .select('*, Role(name)')
      .eq('id', user.userId)
      .maybeSingle();

    if (fetchError || !updatedProfile) {
      console.error('Fetch updated profile error:', fetchError);
      return serverError('Profile updated but failed to fetch updated data');
    }

    // ─── Flatten PostgREST join result ───────────────────────────
    const { Role: _role, ...profileFields } = updatedProfile as Record<string, unknown> & { Role?: { name: string } };
    const flatProfile = { ...profileFields, role: (updatedProfile as Record<string, unknown> & { Role?: { name: string } }).Role?.name ?? '' };

    return json({
      message: 'Profile updated successfully',
      user: flatProfile,
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return serverError('Failed to update profile');
  }
}
