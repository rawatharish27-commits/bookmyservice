// ─── routes/auth.routes.ts ─────────────────────────────────────────────
// All /api/auth/* routes — thin handlers that delegate to auth.service
// ─────────────────────────────────────────────────────────────────────

import { Hono } from 'hono'
import { loginSchema } from '../validators/login.schema'
import { signupSchema } from '../validators/signup.schema'
import { validateBody } from '../validators/validate'
import { getAuthUser } from '../lib/shared'
import { AuthEvents } from '../lib/logger'
import {
  loginUser,
  registerUser,
  googleAuth,
  forgotPassword,
  resetPassword,
  changePassword,
  getProfile,
  updateProfile,
  updateLocation,
  verifyToken,
  isJwtError,
} from '../services/auth.service'

const router = new Hono()

// POST /api/auth/login
router.post('/api/auth/login', async (c) => {
  try {
    const vResult = await validateBody(c, loginSchema)
    if (!vResult.success) return vResult.response
    const { email, password } = vResult.data
    const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const result = await loginUser(email, password, ip)
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ message: 'Login successful', user: result.user, accessToken: result.accessToken })
  } catch (e) { console.error('Login error:', e); return c.json({ error: 'Login failed', detail: process.env.NODE_ENV === 'production' ? undefined : (e instanceof Error ? e.message : String(e)) }, 500) }
})

// POST /api/auth/register
router.post('/api/auth/register', async (c) => {
  try {
    const vResult = await validateBody(c, signupSchema)
    if (!vResult.success) return vResult.response
    const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const result = await registerUser(vResult.data, ip)
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ message: 'Registration successful', user: result.user, accessToken: result.accessToken }, 201)
  } catch (e) { console.error('Register error:', e); return c.json({ error: 'Registration failed', detail: process.env.NODE_ENV === 'production' ? undefined : (e instanceof Error ? e.message : String(e)) }, 500) }
})

// POST /api/auth/forgot-password
router.post('/api/auth/forgot-password', async (c) => {
  try {
    const { email } = await c.req.json()
    const result = await forgotPassword(email)
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ message: 'If an account with that email exists, a reset token has been sent.' })
  } catch (e) { console.error("DB Error:", e); return c.json({ error: 'Failed' }, 500) }
})

// POST /api/auth/reset-password
router.post('/api/auth/reset-password', async (c) => {
  try {
    const { token, newPassword, email } = await c.req.json()
    const result = await resetPassword(token, newPassword, email)
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ message: 'Password has been reset successfully' })
  } catch (e) { console.error('Reset password error:', e); return c.json({ error: 'Failed' }, 500) }
})

// POST /api/auth/google
router.post('/api/auth/google', async (c) => {
  try {
    const body = await c.req.json()
    if (!body.token) return c.json({ error: 'Google token is required for verification' }, 400)
    const result = await googleAuth(body.token)
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ message: 'Login successful', user: result.user, accessToken: result.accessToken })
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
    const payload = await verifyToken(authHeader.split(' ')[1])
    const { currentPassword, newPassword } = await c.req.json()
    const result = await changePassword(payload.sub, currentPassword, newPassword)
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ message: 'Password changed successfully' })
  } catch (e: any) { 
    console.error('Change password error:', e); 
    if (isJwtError(e)) {
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
    payload = await verifyToken(authHeader.split(' ')[1])
    const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const result = await getProfile(payload.sub, ip)
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ user: result.user, accessToken: result.accessToken })
  } catch (e: any) { 
    console.error('Profile fetch error:', e); 
    if (isJwtError(e)) {
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
    const payload = await verifyToken(authHeader.split(' ')[1])
    const { latitude, longitude } = await c.req.json()
    if (latitude === undefined || longitude === undefined) return c.json({ error: 'latitude and longitude are required' }, 400)
    const result = await updateLocation(payload.sub, latitude, longitude)
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ message: 'Location updated successfully', latitude: result.latitude, longitude: result.longitude })
  } catch (e: any) {
    if (isJwtError(e)) {
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
    const payload = await verifyToken(authHeader.split(' ')[1])
    const body = await c.req.json()
    const result = await updateProfile(payload.sub, body)
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ message: 'Profile updated', user: result.user })
  } catch (e: any) { 
    console.error('Profile update error:', e); 
    if (isJwtError(e)) {
      return c.json({ error: 'Token expired or invalid', code: 'TOKEN_EXPIRED' }, 401)
    }
    return c.json({ error: 'Failed to update profile' }, 500) 
  }
})

// POST /api/auth/logout
router.post('/api/auth/logout', (c) => c.json({ success: true, message: 'Logged out' }))

export const authRoutes = router
