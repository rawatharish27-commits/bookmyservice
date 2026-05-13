/**
 * POST /api/auth/register
 * Registers a new user (CLIENT or PROVIDER).
 */

import { createSupabaseClient, Env } from '../../_shared/db';
import { signAccessToken, signRefreshToken } from '../../_shared/auth';
import { hashPassword } from '../../_shared/password';
import { json, error, serverError } from '../../_shared/response';
import { sanitizeString, validateEmail, validatePhone, validatePassword } from '../../_shared/security';

interface RegisterBody {
  email?: string;
  phone?: string;
  name?: string;
  password?: string;
  roleId?: number;
}

export async function onRequestPost(context: EventContext<Record<string, unknown>, string, unknown>): Promise<Response> {
  const { request, env } = context as unknown as { request: Request; env: Env };

  try {
    const body: RegisterBody = await request.json();
    const { email, phone, name, password, roleId } = body;

    // ─── Validate required fields ────────────────────────────────
    if (!email || !phone || !name || !password || !roleId) {
      return error('All fields are required: email, phone, name, password, roleId', 400);
    }

    // ─── Sanitize inputs ─────────────────────────────────────────
    const sanitizedEmail = sanitizeString(String(email)).toLowerCase();
    const sanitizedPhone = sanitizeString(String(phone));
    const sanitizedName = sanitizeString(String(name));

    // ─── Validate email ──────────────────────────────────────────
    if (!validateEmail(sanitizedEmail)) {
      return error('Invalid email address format', 400);
    }

    // ─── Validate phone (Indian: starts with 6-9, 10 digits) ────
    if (!validatePhone(sanitizedPhone)) {
      return error('Invalid phone number. Must be 10 digits starting with 6-9', 400);
    }

    // ─── Validate name length ────────────────────────────────────
    if (sanitizedName.length < 2 || sanitizedName.length > 100) {
      return error('Name must be between 2 and 100 characters', 400);
    }

    // ─── Validate roleId ─────────────────────────────────────────
    const validRoleId = Number(roleId);
    if (![1, 2].includes(validRoleId)) {
      return error('Invalid roleId. Must be 1 (CLIENT) or 2 (PROVIDER)', 400);
    }

    // ─── Validate password strength ──────────────────────────────
    const passwordValidation = validatePassword(String(password));
    if (!passwordValidation.valid) {
      return error('Password does not meet requirements', 400, { errors: passwordValidation.errors });
    }

    // ─── Create Supabase client ──────────────────────────────────
    const supabase = createSupabaseClient(env);

    // ─── Check if email already exists ───────────────────────────
    const { data: existingEmail } = await supabase
      .from('User')
      .select('id')
      .ilike('email', sanitizedEmail)
      .maybeSingle();
    if (existingEmail) {
      return error('Email is already registered', 409);
    }

    // ─── Check if phone already exists ───────────────────────────
    const { data: existingPhone } = await supabase
      .from('User')
      .select('id')
      .eq('phone', sanitizedPhone)
      .maybeSingle();
    if (existingPhone) {
      return error('Phone number is already registered', 409);
    }

    // ─── Hash password ───────────────────────────────────────────
    const passwordHash = await hashPassword(String(password));

    // ─── Generate unique user ID ─────────────────────────────────
    const userId = `usr_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;

    // ─── Determine role name ─────────────────────────────────────
    const roleName = validRoleId === 1 ? 'CLIENT' : 'PROVIDER';

    // ─── Create user ─────────────────────────────────────────────
    const now = new Date().toISOString();
    const { data: insertedUser, error: insertError } = await supabase
      .from('User')
      .insert({
        id: userId,
        email: sanitizedEmail,
        phone: sanitizedPhone,
        passwordHash,
        name: sanitizedName,
        roleId: validRoleId,
        status: 'ACTIVE',
        emailVerified: false,
        phoneVerified: false,
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Register insert error:', insertError);
      return serverError('Registration failed. Please try again.');
    }

    // ─── For PROVIDER role, create ProviderKyc placeholder ───────
    if (validRoleId === 2) {
      const kycId = `kyc_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
      const { error: kycError } = await supabase
        .from('ProviderKyc')
        .insert({
          id: kycId,
          providerId: userId,
          documentType: 'PENDING',
          documentNumber: 'PENDING',
          documentFrontUrl: '/pending',
          selfieUrl: '/pending',
          verificationStatus: 'PENDING',
          createdAt: now,
          updatedAt: now,
        });
      if (kycError) {
        console.error('ProviderKyc insert error:', kycError);
        // Non-fatal: user was created, KYC can be retried later
      }
    }

    // ─── Sign tokens ─────────────────────────────────────────────
    const tokenPayload = {
      userId,
      email: sanitizedEmail,
      roleId: validRoleId,
      role: roleName,
    };

    const accessToken = await signAccessToken(tokenPayload, env);
    const refreshToken = await signRefreshToken(tokenPayload, env);

    // ─── Fetch created user with Role join ───────────────────────
    const { data: user, error: fetchError } = await supabase
      .from('User')
      .select('*, Role(name)')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError || !user) {
      // User was created but fetch failed — return minimal info
      console.error('Register fetch error:', fetchError);
      return json({
        message: 'Registration successful',
        user: { id: userId, email: sanitizedEmail, phone: sanitizedPhone, name: sanitizedName, roleId: validRoleId, role: roleName, status: 'ACTIVE' },
        accessToken,
        refreshToken,
      }, 201);
    }

    // ─── Flatten PostgREST join result ───────────────────────────
    const { Role: _role, passwordHash: _ph, ...userFields } = user as Record<string, unknown> & { Role?: { name: string }; passwordHash?: string };
    const flatUser = { ...userFields, role: (user as Record<string, unknown> & { Role?: { name: string } }).Role?.name ?? roleName };

    return json({
      message: 'Registration successful',
      user: flatUser,
      accessToken,
      refreshToken,
    }, 201);
  } catch (err) {
    console.error('Register error:', err);
    return serverError('Registration failed. Please try again.');
  }
}
