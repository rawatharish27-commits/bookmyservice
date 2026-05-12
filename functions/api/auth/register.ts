/**
 * POST /api/auth/register
 * Registers a new user (CLIENT or PROVIDER).
 */

import { queryOne, execute } from '../../_shared/db';
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
  const { request, env } = context as { request: Request; env: { DB: D1Database; JWT_SECRET: string } };

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

    // ─── Check if email already exists ───────────────────────────
    const existingEmail = await queryOne(
      env.DB,
      'SELECT id FROM User WHERE email = ?',
      [sanitizedEmail]
    );
    if (existingEmail) {
      return error('Email is already registered', 409);
    }

    // ─── Check if phone already exists ───────────────────────────
    const existingPhone = await queryOne(
      env.DB,
      'SELECT id FROM User WHERE phone = ?',
      [sanitizedPhone]
    );
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
    await execute(
      env.DB,
      `INSERT INTO User (id, email, phone, passwordHash, name, roleId, status, emailVerified, phoneVerified, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', 0, 0, datetime('now'), datetime('now'))`,
      [userId, sanitizedEmail, sanitizedPhone, passwordHash, sanitizedName, validRoleId]
    );

    // ─── For PROVIDER role, create ProviderKyc placeholder ───────
    if (validRoleId === 2) {
      const kycId = `kyc_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
      await execute(
        env.DB,
        `INSERT INTO ProviderKyc (id, providerId, documentType, documentNumber, documentFrontUrl, selfieUrl, verificationStatus, createdAt, updatedAt)
         VALUES (?, ?, 'PENDING', 'PENDING', '/pending', '/pending', 'PENDING', datetime('now'), datetime('now'))`,
        [kycId, userId]
      );
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

    // ─── Fetch created user ──────────────────────────────────────
    const user = await queryOne(
      env.DB,
      `SELECT u.id, u.email, u.phone, u.name, u.roleId, u.status, u.profileImageUrl, u.city, u.state, u.country, u.createdAt, r.name as role
       FROM User u JOIN Role r ON u.roleId = r.id
       WHERE u.id = ?`,
      [userId]
    );

    return json({
      message: 'Registration successful',
      user,
      accessToken,
      refreshToken,
    }, 201);
  } catch (err) {
    console.error('Register error:', err);
    return serverError('Registration failed. Please try again.');
  }
}
