// ─── routes/auth.routes.ts ─────────────────────────────────────────────
// All /api/auth/* routes
// ─────────────────────────────────────────────────────────────────────

import { Hono } from 'hono'
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { loginSchema } from '../validators/login.schema'
import { signupSchema } from '../validators/signup.schema'
import { validateBody } from '../validators/validate'
import { pool, JWT_SECRET, validateInputLengths, getAuthUser } from '../lib/shared'
import { redis } from '../lib/redis'
import { pushNotificationJob } from '../queues'
import { AuthEvents } from '../lib/logger'
import { setSentryUser } from '../lib/sentry'

const router = new Hono()

// POST /api/auth/login
router.post('/api/auth/login', async (c) => {
  try {
    const vResult = await validateBody(c, loginSchema)
    if (!vResult.success) return vResult.response
    const { email, password } = vResult.data
    const sanitizedEmail = email
    const result = await pool.query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE LOWER(u.email) = LOWER($1)', [sanitizedEmail])
    if (!result.rows[0]) { AuthEvents.failedLogin(sanitizedEmail, c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown', 'User not found'); return c.json({ error: 'Invalid email or password' }, 401) }
    const user = result.rows[0]
    const isValid = await bcrypt.compare(String(password), user.passwordHash)
    if (!isValid) { AuthEvents.failedLogin(sanitizedEmail, c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown', 'Wrong password'); return c.json({ error: 'Invalid email or password' }, 401) }
    if (user.status !== 'ACTIVE') return c.json({ error: 'Account is ' + user.status.toLowerCase() }, 403)
    await pool.query('UPDATE "User" SET "lastLoginAt" = NOW() WHERE id = $1', [user.id])
    const secret = new TextEncoder().encode(JWT_SECRET)
    const token = await new SignJWT({ sub: user.id, email: user.email, role: user.roleName, roleId: user.roleId })
      .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('15m')
      .setIssuer('bookyourservice').setAudience('bookyourservice').sign(secret)
    const { passwordHash, roleName, ...safeUser } = user
    AuthEvents.successfulLogin(sanitizedEmail, c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown', user.roleName)
    setSentryUser({ id: user.id, email: user.email, role: user.roleName })
    return c.json({ message: 'Login successful', user: { ...safeUser, role: roleName }, accessToken: token })
  } catch (e) { console.error('Login error:', e); return c.json({ error: 'Login failed', detail: process.env.NODE_ENV === 'production' ? undefined : (e instanceof Error ? e.message : String(e)) }, 500) }
})

// POST /api/auth/register
router.post('/api/auth/register', async (c) => {
  try {
    const vResult = await validateBody(c, signupSchema)
    if (!vResult.success) return vResult.response
    const { email, phone, name, password, roleId, specialization } = vResult.data
    const existing = await pool.query('SELECT id FROM "User" WHERE LOWER(email) = LOWER($1)', [email])
    if (existing.rows.length > 0) return c.json({ error: 'Email already registered' }, 409)
    const existingPhone = await pool.query('SELECT id FROM "User" WHERE phone = $1', [phone])
    if (existingPhone.rows.length > 0) return c.json({ error: 'Phone already registered' }, 409)
    const passwordHash = await bcrypt.hash(password, 10)
    const userId = 'usr_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    const roleCheck = await pool.query('SELECT id FROM "Role" WHERE id = $1', [roleId])
    if (roleCheck.rows.length === 0) return c.json({ error: 'Invalid roleId - role does not exist' }, 400)
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
    if (!user) { console.error('Register error: user not found after insert, roleId may not exist in Role table'); return c.json({ error: 'Registration failed - invalid role' }, 400) }
    const secret = new TextEncoder().encode(JWT_SECRET)
    const token = await new SignJWT({ sub: user.id, email: user.email, role: user.roleName, roleId: user.roleId })
      .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('15m')
      .setIssuer('bookyourservice').setAudience('bookyourservice').sign(secret)
    const { passwordHash: _ph, roleName: _rn, ...safeUser } = user
    pushNotificationJob({
      type: 'WHATSAPP',
      recipient: { phone: String(phone).trim(), name: String(name).trim(), userId },
      template: 'welcome',
      data: { name: String(name).trim() },
      priority: 4,
    }).catch(() => {})
    AuthEvents.registration(email, roleId === 2 ? 'PROVIDER' : roleId === 4 ? 'TECHNICIAN' : roleId === 5 ? 'VENDOR' : 'CLIENT', c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown')
    return c.json({ message: 'Registration successful', user: { ...safeUser, role: user.roleName }, accessToken: token }, 201)
  } catch (e) { console.error('Register error:', e); return c.json({ error: 'Registration failed', detail: process.env.NODE_ENV === 'production' ? undefined : (e instanceof Error ? e.message : String(e)) }, 500) }
})

// POST /api/auth/forgot-password
router.post('/api/auth/forgot-password', async (c) => {
  try {
    const { email } = await c.req.json()
    if (!email) return c.json({ error: 'Email is required' }, 400)
    const lengthError = validateInputLengths({ email })
    if (lengthError) return c.json({ error: lengthError }, 400)
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
    return c.json({ message: 'If an account with that email exists, a reset token has been sent.' })
  } catch (e) { console.error("DB Error:", e); return c.json({ error: 'Failed' }, 500) }
})

// POST /api/auth/reset-password
router.post('/api/auth/reset-password', async (c) => {
  try {
    const { token, newPassword, email } = await c.req.json()
    if (!token || !newPassword || !email) return c.json({ error: 'Token, new password, and email are required' }, 400)
    const lengthError = validateInputLengths({ email, password: newPassword })
    if (lengthError) return c.json({ error: lengthError }, 400)
    if (newPassword.length < 8) return c.json({ error: 'Password must be at least 8 characters' }, 400)
    const sanitizedEmail = String(email).toLowerCase().trim()
    const storedRaw = await redis.get(`resetToken:${sanitizedEmail}`)
    const stored = storedRaw ? JSON.parse(storedRaw) : null
    if (!stored || stored.token !== token || Date.now() > stored.expiresAt) {
      return c.json({ error: 'Invalid or expired reset token' }, 400)
    }
    const passwordHash = await bcrypt.hash(String(newPassword), 10)
    await pool.query('UPDATE "User" SET "passwordHash" = $1, "updatedAt" = NOW() WHERE LOWER(email) = LOWER($2)', [passwordHash, sanitizedEmail])
    await redis.del(`resetToken:${sanitizedEmail}`)
    return c.json({ message: 'Password has been reset successfully' })
  } catch (e) { console.error('Reset password error:', e); return c.json({ error: 'Failed' }, 500) }
})

// POST /api/auth/google
router.post('/api/auth/google', async (c) => {
  try {
    const body = await c.req.json()
    let email: string | undefined
    let name: string | undefined
    let profileImageUrl: string | undefined

    if (body.token) {
      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${body.token}` },
      })
      if (!userInfoRes.ok) {
        return c.json({ error: 'Invalid Google token' }, 401)
      }
      const tokenInfo = await userInfoRes.json() as { email?: string; name?: string; picture?: string; sub?: string; email_verified?: boolean }
      if (!tokenInfo.email) {
        return c.json({ error: 'Google account has no email' }, 400)
      }
      email = tokenInfo.email
      name = tokenInfo.name || tokenInfo.email.split('@')[0]
      profileImageUrl = tokenInfo.picture || undefined
    }
    else {
      return c.json({ error: 'Google token is required for verification' }, 400)
    }

    const lengthError = validateInputLengths({ email, name })
    if (lengthError) return c.json({ error: lengthError }, 400)

    const sanitizedEmail = email.toLowerCase().trim()

    const existingResult = await pool.query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE LOWER(u.email) = LOWER($1)', [sanitizedEmail])

    let user: any

    if (existingResult.rows.length > 0) {
      user = existingResult.rows[0]
      if (user.status !== 'ACTIVE') {
        return c.json({ error: 'Account is ' + user.status.toLowerCase() }, 403)
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
        return c.json({ error: 'Failed to create account' }, 500)
      }
    }

    const secret = new TextEncoder().encode(JWT_SECRET)
    const token = await new SignJWT({ sub: user.id, email: user.email, role: user.roleName, roleId: user.roleId })
      .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('15m')
      .setIssuer('bookyourservice').setAudience('bookyourservice').sign(secret)
    const { passwordHash, roleName, ...safeUser } = user
    return c.json({ message: 'Login successful', user: { ...safeUser, role: roleName }, accessToken: token })
  } catch (e) {
    console.error('Google auth error:', e)
    return c.json({ error: 'Google authentication failed', detail: process.env.NODE_ENV === 'production' ? undefined : (e instanceof Error ? e.message : String(e)) }, 500)
  }
})

// POST /api/auth/change-password
router.post('/api/auth/change-password', async (c) => {
  try {
    const authHeader = c.req.header('authorization')
    if (!authHeader?.startsWith('Bearer ')) return c.json({ error: 'Authentication required' }, 401)
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(authHeader.split(' ')[1], secret, { issuer: 'bookyourservice', audience: 'bookyourservice' })
    const { currentPassword, newPassword } = await c.req.json()
    if (!currentPassword || !newPassword) return c.json({ error: 'Current and new password required' }, 400)
    const lengthError = validateInputLengths({ password: newPassword })
    if (lengthError) return c.json({ error: lengthError }, 400)
    const result = await pool.query('SELECT "passwordHash" FROM "User" WHERE id = $1', [payload.sub])
    if (!result.rows[0]) return c.json({ error: 'User not found' }, 404)
    const isValid = await bcrypt.compare(String(currentPassword), result.rows[0].passwordHash)
    if (!isValid) return c.json({ error: 'Current password is incorrect' }, 401)
    if (newPassword.length < 8) return c.json({ error: 'New password must be at least 8 characters' }, 400)
    const newHash = await bcrypt.hash(String(newPassword), 10)
    await pool.query('UPDATE "User" SET "passwordHash" = $1, "updatedAt" = NOW() WHERE id = $2', [newHash, payload.sub])
    return c.json({ message: 'Password changed successfully' })
  } catch (e: any) { 
    console.error('Change password error:', e); 
    if (e?.code === 'ERR_JWT_EXPIRED' || e?.code === 'ERR_JWS_INVALID' || e?.code === 'ERR_JWT_INVALID') {
      return c.json({ error: 'Token expired or invalid', code: 'TOKEN_EXPIRED' }, 401)
    }
    return c.json({ error: 'Failed to change password' }, 500) 
  }
})

// GET /api/auth/profile
router.get('/api/auth/profile', async (c) => {
  let payload: any = null
  try {
    const authHeader = c.req.header('authorization')
    if (!authHeader?.startsWith('Bearer ')) return c.json({ error: 'Authentication required' }, 401)
    const secret = new TextEncoder().encode(JWT_SECRET)
    const jwtResult = await jwtVerify(authHeader.split(' ')[1], secret, { issuer: 'bookyourservice', audience: 'bookyourservice' })
    payload = jwtResult.payload
    const result = await pool.query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE u.id = $1', [payload.sub])
    if (!result.rows[0]) return c.json({ error: 'User not found' }, 404)
    const { passwordHash, roleName, ...profile } = result.rows[0]
    setSentryUser({ id: profile.id, email: profile.email, role: roleName })
    const newToken = await new SignJWT({ sub: profile.id, email: profile.email, role: roleName, roleId: profile.roleId })
      .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('15m')
      .setIssuer('bookyourservice').setAudience('bookyourservice').sign(secret)
    return c.json({ user: { ...profile, role: roleName }, accessToken: newToken })
  } catch (e: any) { 
    console.error('Profile fetch error:', e); 
    if (e?.code === 'ERR_JWT_EXPIRED' || e?.code === 'ERR_JWS_INVALID' || e?.code === 'ERR_JWT_INVALID') {
      AuthEvents.tokenExpired(payload?.sub as string || 'unknown', c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown')
      return c.json({ error: 'Token expired or invalid', code: 'TOKEN_EXPIRED' }, 401)
    }
    return c.json({ error: 'Failed to fetch profile' }, 500) 
  }
})

// PATCH /api/auth/location
router.patch('/api/auth/location', async (c) => {
  try {
    const authHeader = c.req.header('authorization')
    if (!authHeader?.startsWith('Bearer ')) return c.json({ error: 'Authentication required' }, 401)
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(authHeader.split(' ')[1], secret, { issuer: 'bookyourservice', audience: 'bookyourservice' })
    const { latitude, longitude } = await c.req.json()
    if (latitude === undefined || longitude === undefined) return c.json({ error: 'latitude and longitude are required' }, 400)
    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return c.json({ error: 'Invalid latitude or longitude values' }, 400)

    await pool.query(
      'UPDATE "User" SET latitude = $1, longitude = $2, location = ST_MakePoint($2, $1)::geography, "updatedAt" = NOW() WHERE id = $3',
      [lat, lng, payload.sub]
    ).catch(async (err) => {
      if (err.message?.includes('location') || err.message?.includes('geography')) {
        await pool.query(
          'UPDATE "User" SET latitude = $1, longitude = $2, "updatedAt" = NOW() WHERE id = $3',
          [lat, lng, payload.sub]
        )
      } else {
        throw err
      }
    })

    await redis.delByPattern('cache:providers:nearby:*').catch(() => {})

    return c.json({ message: 'Location updated successfully', latitude: lat, longitude: lng })
  } catch (e: any) {
    if (e?.code === 'ERR_JWT_EXPIRED' || e?.code === 'ERR_JWS_INVALID' || e?.code === 'ERR_JWT_INVALID') {
      return c.json({ error: 'Token expired or invalid', code: 'TOKEN_EXPIRED' }, 401)
    }
    return c.json({ error: 'Failed to update location' }, 500)
  }
})

// PATCH /api/auth/profile
router.patch('/api/auth/profile', async (c) => {
  try {
    const authHeader = c.req.header('authorization')
    if (!authHeader?.startsWith('Bearer ')) return c.json({ error: 'Authentication required' }, 401)
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(authHeader.split(' ')[1], secret, { issuer: 'bookyourservice', audience: 'bookyourservice' })
    const body = await c.req.json()
    if (body.newPassword && body.newPassword.length < 8) return c.json({ error: 'Password must be at least 8 characters' }, 400)
    const fields = ['name', 'phone', 'city', 'state', 'country', 'address', 'pincode', 'profileImageUrl']
    const updates = []
    const values = []
    let idx = 1
    for (const f of fields) {
      if (body[f] !== undefined) { updates.push(`"${f}" = $${idx}`); values.push(body[f]); idx++ }
    }
    if (updates.length === 0) return c.json({ error: 'No fields to update' }, 400)
    updates.push(`"updatedAt" = NOW()`)
    values.push(payload.sub)
    await pool.query(`UPDATE "User" SET ${updates.join(', ')} WHERE id = $${idx}`, values)
    const result = await pool.query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE u.id = $1', [payload.sub])
    const { passwordHash, roleName, ...profile } = result.rows[0]
    return c.json({ message: 'Profile updated', user: { ...profile, role: roleName } })
  } catch (e: any) { 
    console.error('Profile update error:', e); 
    if (e?.code === 'ERR_JWT_EXPIRED' || e?.code === 'ERR_JWS_INVALID' || e?.code === 'ERR_JWT_INVALID') {
      return c.json({ error: 'Token expired or invalid', code: 'TOKEN_EXPIRED' }, 401)
    }
    return c.json({ error: 'Failed to update profile' }, 500) 
  }
})

// POST /api/auth/logout
router.post('/api/auth/logout', (c) => c.json({ success: true, message: 'Logged out' }))

export default router
