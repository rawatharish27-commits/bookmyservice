// ─── services/auth.service.ts ──────────────────────────────────────────
// Pure business logic extracted from routes/auth.routes.ts
// All functions accept dependencies as parameters and return data objects
// (not HTTP responses). HTTP concerns remain in the route file.
// ─────────────────────────────────────────────────────────────────────

import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { pool, JWT_SECRET, validateInputLengths } from '../lib/shared'
import { redis } from '../lib/redis'
import { pushNotificationJob } from '../queues'
import { AuthEvents } from '../lib/logger'
import { setSentryUser } from '../lib/sentry'

// ─── Types ────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  email: string
  role: string
  roleId: number
  name?: string
  phone?: string
}

export interface SanitizedUser {
  [key: string]: any
  role: string
}

export interface RegisterData {
  email: string
  phone: string
  name: string
  password: string
  roleId: number
  specialization?: string
}

// ─── Helper: create JWT access token ──────────────────────────────────

export async function createAccessToken(user: { id: string; email: string; role: string; roleId: number }): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET)
  return new SignJWT({ sub: user.id, email: user.email, role: user.role, roleId: user.roleId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .setIssuer('bookyourservice')
    .setAudience('bookyourservice')
    .sign(secret)
}

// ─── Helper: sanitize user row ────────────────────────────────────────

export function sanitizeUser(user: any): SanitizedUser {
  const { passwordHash, roleName, ...safeUser } = user
  return { ...safeUser, role: roleName }
}

// ─── Helper: verify JWT and return payload ────────────────────────────

export async function verifyToken(token: string): Promise<any> {
  const secret = new TextEncoder().encode(JWT_SECRET)
  const { payload } = await jwtVerify(token, secret, { issuer: 'bookyourservice', audience: 'bookyourservice' })
  return payload
}

// ─── Helper: check if error is a JWT expiry/invalid error ─────────────

export function isJwtError(e: any): boolean {
  return e?.code === 'ERR_JWT_EXPIRED' || e?.code === 'ERR_JWS_INVALID' || e?.code === 'ERR_JWT_INVALID'
}

// ─── Login ────────────────────────────────────────────────────────────

export async function loginUser(email: string, password: string, ip: string): Promise<{
  success: true; user: SanitizedUser; accessToken: string
} | { success: false; error: string; status: number }> {
  const sanitizedEmail = email
  const result = await pool.query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE LOWER(u.email) = LOWER($1)', [sanitizedEmail])
  if (!result.rows[0]) {
    AuthEvents.failedLogin(sanitizedEmail, ip, 'User not found')
    return { success: false, error: 'Invalid email or password', status: 401 }
  }
  const user = result.rows[0]
  const isValid = await bcrypt.compare(String(password), user.passwordHash)
  if (!isValid) {
    AuthEvents.failedLogin(sanitizedEmail, ip, 'Wrong password')
    return { success: false, error: 'Invalid email or password', status: 401 }
  }
  if (user.status !== 'ACTIVE') {
    return { success: false, error: 'Account is ' + user.status.toLowerCase(), status: 403 }
  }
  await pool.query('UPDATE "User" SET "lastLoginAt" = NOW() WHERE id = $1', [user.id])
  const accessToken = await createAccessToken({ id: user.id, email: user.email, role: user.roleName, roleId: user.roleId })
  const safeUser = sanitizeUser(user)
  AuthEvents.successfulLogin(sanitizedEmail, ip, user.roleName)
  setSentryUser({ id: user.id, email: user.email, role: user.roleName })
  return { success: true, user: safeUser, accessToken }
}

// ─── Register ─────────────────────────────────────────────────────────

export async function registerUser(data: RegisterData, ip: string): Promise<{
  success: true; user: SanitizedUser; accessToken: string
} | { success: false; error: string; status: number }> {
  const { email, phone, name, password, roleId, specialization } = data
  const existing = await pool.query('SELECT id FROM "User" WHERE LOWER(email) = LOWER($1)', [email])
  if (existing.rows.length > 0) return { success: false, error: 'Email already registered', status: 409 }
  const existingPhone = await pool.query('SELECT id FROM "User" WHERE phone = $1', [phone])
  if (existingPhone.rows.length > 0) return { success: false, error: 'Phone already registered', status: 409 }
  const passwordHash = await bcrypt.hash(password, 10)
  const userId = 'usr_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
  const roleCheck = await pool.query('SELECT id FROM "Role" WHERE id = $1', [roleId])
  if (roleCheck.rows.length === 0) return { success: false, error: 'Invalid roleId - role does not exist', status: 400 }
  await pool.query('INSERT INTO "User" (id, email, phone, "passwordHash", name, "roleId", status, "emailVerified", "phoneVerified", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, \'ACTIVE\', false, false, NOW())', [userId, email, phone, passwordHash, name, roleId])
  if (roleId === 2 || roleId === 4 || roleId === 5) {
    const kycId = 'kyc_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query('INSERT INTO "ProviderKyc" (id, "providerId", "documentType", "documentNumber", "documentFrontUrl", "selfieUrl", "verificationStatus", "createdAt", "updatedAt") VALUES ($1, $2, \'AADHAAR\', \'PENDING\', \'/pending\', \'/pending\', \'PENDING\', NOW(), NOW())', [kycId, userId])
  }
  if (roleId === 4 && specialization) {
    const techId = 'tech_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query('INSERT INTO "TechnicianProfile" (id, "userId", skills, "isAvailable", "serviceAreaRadiusKm", "dailyEarnings", "weeklyEarnings", "monthlyEarnings", "totalEarnings", "totalJobsCompleted", "totalJobsRejected", "averageRating", "createdAt", "updatedAt") VALUES ($1, $2, $3, true, 15, 0, 0, 0, 0, 0, 0, 0, NOW(), NOW())', [techId, userId, JSON.stringify([specialization])])
  }
  const userResult = await pool.query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE u.id = $1', [userId])
  const user = userResult.rows[0]
  if (!user) return { success: false, error: 'Registration failed - invalid role', status: 400 }
  const accessToken = await createAccessToken({ id: user.id, email: user.email, role: user.roleName, roleId: user.roleId })
  const safeUser = sanitizeUser(user)
  pushNotificationJob({
    type: 'WHATSAPP',
    recipient: { phone: String(phone).trim(), name: String(name).trim(), userId },
    template: 'welcome',
    data: { name: String(name).trim() },
    priority: 4,
  }).catch(() => {})
  AuthEvents.registration(email, roleId === 2 ? 'PROVIDER' : roleId === 4 ? 'TECHNICIAN' : roleId === 5 ? 'VENDOR' : 'CLIENT', ip)
  return { success: true, user: safeUser, accessToken }
}

// ─── Google Auth ──────────────────────────────────────────────────────

export async function googleAuth(token: string): Promise<{
  success: true; user: SanitizedUser; accessToken: string
} | { success: false; error: string; status: number }> {
  let email: string | undefined
  let name: string | undefined
  let profileImageUrl: string | undefined

  const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!userInfoRes.ok) {
    return { success: false, error: 'Invalid Google token', status: 401 }
  }
  const tokenInfo = await userInfoRes.json() as { email?: string; name?: string; picture?: string; sub?: string; email_verified?: boolean }
  if (!tokenInfo.email) {
    return { success: false, error: 'Google account has no email', status: 400 }
  }
  email = tokenInfo.email
  name = tokenInfo.name || tokenInfo.email.split('@')[0]
  profileImageUrl = tokenInfo.picture || undefined

  const lengthError = validateInputLengths({ email, name })
  if (lengthError) return { success: false, error: lengthError, status: 400 }

  const sanitizedEmail = email.toLowerCase().trim()
  const existingResult = await pool.query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE LOWER(u.email) = LOWER($1)', [sanitizedEmail])
  let user: any

  if (existingResult.rows.length > 0) {
    user = existingResult.rows[0]
    if (user.status !== 'ACTIVE') {
      return { success: false, error: 'Account is ' + user.status.toLowerCase(), status: 403 }
    }
    if (profileImageUrl && !user.profileImageUrl) {
      await pool.query('UPDATE "User" SET "profileImageUrl" = $1, "lastLoginAt" = NOW() WHERE id = $2', [profileImageUrl, user.id])
    } else {
      await pool.query('UPDATE "User" SET "lastLoginAt" = NOW() WHERE id = $1', [user.id])
    }
    const refreshed = await pool.query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE u.id = $1', [user.id])
    user = refreshed.rows[0]
  } else {
    const passwordHash = await bcrypt.hash(crypto.randomUUID(), 10)
    const userId = 'usr_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    const uniquePhone = 'g_' + crypto.randomUUID().replace(/-/g, '').slice(0, 15)
    await pool.query(
      'INSERT INTO "User" (id, email, phone, "passwordHash", name, "roleId", status, "emailVerified", "phoneVerified", "profileImageUrl", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, \'ACTIVE\', true, false, $7, NOW())',
      [userId, sanitizedEmail, uniquePhone, passwordHash, String(name).trim(), 1, profileImageUrl || null]
    )
    const newUserResult = await pool.query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE u.id = $1', [userId])
    user = newUserResult.rows[0]
    if (!user) {
      return { success: false, error: 'Failed to create account', status: 500 }
    }
  }

  const accessToken = await createAccessToken({ id: user.id, email: user.email, role: user.roleName, roleId: user.roleId })
  const safeUser = sanitizeUser(user)
  return { success: true, user: safeUser, accessToken }
}

// ─── Forgot Password ──────────────────────────────────────────────────

export async function forgotPassword(email: string): Promise<{ success: true } | { success: false; error: string; status: number }> {
  if (!email) return { success: false, error: 'Email is required', status: 400 }
  const lengthError = validateInputLengths({ email })
  if (lengthError) return { success: false, error: lengthError, status: 400 }
  const sanitizedEmail = String(email).toLowerCase().trim()
  const resetToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
  await redis.set(`resetToken:${sanitizedEmail}`, JSON.stringify({ token: resetToken, expiresAt: Date.now() + 3600000 }), 3600000)
  pushNotificationJob({
    type: 'SMS',
    recipient: { email: sanitizedEmail },
    template: 'password_reset',
    data: { token: resetToken },
    priority: 2,
  }).catch(() => {})
  return { success: true }
}

// ─── Reset Password ───────────────────────────────────────────────────

export async function resetPassword(token: string, newPassword: string, email: string): Promise<{ success: true } | { success: false; error: string; status: number }> {
  if (!token || !newPassword || !email) return { success: false, error: 'Token, new password, and email are required', status: 400 }
  const lengthError = validateInputLengths({ email, password: newPassword })
  if (lengthError) return { success: false, error: lengthError, status: 400 }
  if (newPassword.length < 8) return { success: false, error: 'Password must be at least 8 characters', status: 400 }
  const sanitizedEmail = String(email).toLowerCase().trim()
  const storedRaw = await redis.get(`resetToken:${sanitizedEmail}`)
  const stored = storedRaw ? JSON.parse(storedRaw) : null
  if (!stored || stored.token !== token || Date.now() > stored.expiresAt) {
    return { success: false, error: 'Invalid or expired reset token', status: 400 }
  }
  const passwordHash = await bcrypt.hash(String(newPassword), 10)
  await pool.query('UPDATE "User" SET "passwordHash" = $1, "updatedAt" = NOW() WHERE LOWER(email) = LOWER($2)', [passwordHash, sanitizedEmail])
  await redis.del(`resetToken:${sanitizedEmail}`)
  return { success: true }
}

// ─── Change Password ──────────────────────────────────────────────────

export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: true } | { success: false; error: string; status: number }> {
  if (!currentPassword || !newPassword) return { success: false, error: 'Current and new password required', status: 400 }
  const lengthError = validateInputLengths({ password: newPassword })
  if (lengthError) return { success: false, error: lengthError, status: 400 }
  const result = await pool.query('SELECT "passwordHash" FROM "User" WHERE id = $1', [userId])
  if (!result.rows[0]) return { success: false, error: 'User not found', status: 404 }
  const isValid = await bcrypt.compare(String(currentPassword), result.rows[0].passwordHash)
  if (!isValid) return { success: false, error: 'Current password is incorrect', status: 401 }
  if (newPassword.length < 8) return { success: false, error: 'New password must be at least 8 characters', status: 400 }
  const newHash = await bcrypt.hash(String(newPassword), 10)
  await pool.query('UPDATE "User" SET "passwordHash" = $1, "updatedAt" = NOW() WHERE id = $2', [newHash, userId])
  return { success: true }
}

// ─── Get Profile ──────────────────────────────────────────────────────

export async function getProfile(userId: string, ip: string): Promise<{
  success: true; user: SanitizedUser; accessToken: string
} | { success: false; error: string; status: number }> {
  const result = await pool.query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE u.id = $1', [userId])
  if (!result.rows[0]) return { success: false, error: 'User not found', status: 404 }
  const { passwordHash, roleName, ...profile } = result.rows[0]
  setSentryUser({ id: profile.id, email: profile.email, role: roleName })
  const newToken = await createAccessToken({ id: profile.id, email: profile.email, role: roleName, roleId: profile.roleId })
  return { success: true, user: { ...profile, role: roleName }, accessToken: newToken }
}

// ─── Update Profile ───────────────────────────────────────────────────

export async function updateProfile(userId: string, fields: Record<string, any>): Promise<{
  success: true; user: SanitizedUser
} | { success: false; error: string; status: number }> {
  if (fields.newPassword && fields.newPassword.length < 8) return { success: false, error: 'Password must be at least 8 characters', status: 400 }
  const allowedFields = ['name', 'phone', 'city', 'state', 'country', 'address', 'pincode', 'profileImageUrl']
  const updates: string[] = []
  const values: any[] = []
  let idx = 1
  for (const f of allowedFields) {
    if (fields[f] !== undefined) { updates.push(`"${f}" = $${idx}`); values.push(fields[f]); idx++ }
  }
  if (updates.length === 0) return { success: false, error: 'No fields to update', status: 400 }
  updates.push(`"updatedAt" = NOW()`)
  values.push(userId)
  await pool.query(`UPDATE "User" SET ${updates.join(', ')} WHERE id = $${idx}`, values)
  const result = await pool.query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE u.id = $1', [userId])
  const { passwordHash, roleName, ...profile } = result.rows[0]
  return { success: true, user: { ...profile, role: roleName } }
}

// ─── Update Location ──────────────────────────────────────────────────

export async function updateLocation(userId: string, latitude: number, longitude: number): Promise<{
  success: true; latitude: number; longitude: number
} | { success: false; error: string; status: number }> {
  const lat = parseFloat(String(latitude))
  const lng = parseFloat(String(longitude))
  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return { success: false, error: 'Invalid latitude or longitude values', status: 400 }

  await pool.query(
    'UPDATE "User" SET latitude = $1, longitude = $2, location = ST_MakePoint($2, $1)::geography, "updatedAt" = NOW() WHERE id = $3',
    [lat, lng, userId]
  ).catch(async (err) => {
    if (err.message?.includes('location') || err.message?.includes('geography')) {
      await pool.query(
        'UPDATE "User" SET latitude = $1, longitude = $2, "updatedAt" = NOW() WHERE id = $3',
        [lat, lng, userId]
      )
    } else {
      throw err
    }
  })

  await redis.delByPattern('cache:providers:nearby:*').catch(() => {})

  return { success: true, latitude: lat, longitude: lng }
}
