import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.oblhyxdjwrqtdycvnoky:x6fpra3VPHUwsoqn@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

const app = new Hono()

app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
}))

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }))

// Legal pages
const TYPE_MAP: Record<string, string> = {
  'TERMS': 'TERMS', 'PRIVACY': 'PRIVACY', 'REFUND': 'REFUND',
  'COOKIES': 'COOKIES', 'AUP': 'AUP', 'PROVIDER_AGREEMENT': 'PROVIDER_AGREEMENT',
  'COMMUNITY_GUIDELINES': 'COMMUNITY_GUIDELINES',
  'terms': 'TERMS', 'privacy': 'PRIVACY', 'refund-policy': 'REFUND',
  'cookies': 'COOKIES', 'aup': 'AUP', 'provider-agreement': 'PROVIDER_AGREEMENT',
  'community-guidelines': 'COMMUNITY_GUIDELINES',
}

app.get('/api/legal', async (c) => {
  try {
    const result = await pool.query('SELECT id, "pageType", title, version, "effectiveDate", "updatedAt" FROM "LegalPage" ORDER BY id ASC')
    return c.json({ documents: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.get('/api/legal/:type', async (c) => {
  try {
    const typeParam = c.req.param('type')
    const pageType = TYPE_MAP[typeParam] || typeParam.toUpperCase()
    const result = await pool.query('SELECT * FROM "LegalPage" WHERE "pageType" = $1', [pageType])
    if (!result.rows[0]) return c.json({ error: 'Not found' }, 404)
    return c.json(result.rows[0])
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// Auth
app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json()
    if (!email || !password) return c.json({ error: 'Email and password are required' }, 400)
    const sanitizedEmail = String(email).toLowerCase().trim()
    const result = await pool.query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE LOWER(u.email) = LOWER($1)', [sanitizedEmail])
    if (!result.rows[0]) return c.json({ error: 'Invalid email or password' }, 401)
    const user = result.rows[0]
    const bcrypt = require('bcryptjs')
    const isValid = await bcrypt.compare(String(password), user.passwordHash)
    if (!isValid) return c.json({ error: 'Invalid email or password' }, 401)
    if (user.status !== 'ACTIVE') return c.json({ error: 'Account is ' + user.status.toLowerCase() }, 403)
    await pool.query('UPDATE "User" SET "lastLoginAt" = NOW() WHERE id = $1', [user.id])
    const { SignJWT } = require('jose')
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'bys-dev-secret-key-change-in-production-2024')
    const token = await new SignJWT({ sub: user.id, email: user.email, role: user.roleName, roleId: user.roleId })
      .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('15m')
      .setIssuer('bookyourservice').setAudience('bookyourservice').sign(secret)
    const { passwordHash, roleName, ...safeUser } = user
    return c.json({ message: 'Login successful', user: { ...safeUser, role: roleName }, accessToken: token })
  } catch (e) { console.error('Login error:', e); return c.json({ error: 'Login failed' }, 500) }
})

app.post('/api/auth/register', async (c) => {
  try {
    const { email, phone, name, password, roleId } = await c.req.json()
    if (!email || !phone || !name || !password || !roleId) return c.json({ error: 'All fields required' }, 400)
    const sanitizedEmail = String(email).toLowerCase().trim()
    const existing = await pool.query('SELECT id FROM "User" WHERE LOWER(email) = LOWER($1)', [sanitizedEmail])
    if (existing.rows.length > 0) return c.json({ error: 'Email already registered' }, 409)
    const existingPhone = await pool.query('SELECT id FROM "User" WHERE phone = $1', [String(phone).trim()])
    if (existingPhone.rows.length > 0) return c.json({ error: 'Phone already registered' }, 409)
    const bcrypt = require('bcryptjs')
    const passwordHash = await bcrypt.hash(String(password), 10)
    const userId = 'usr_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    const validRoleId = Number(roleId)
    await pool.query('INSERT INTO "User" (id, email, phone, "passwordHash", name, "roleId", status, "emailVerified", "phoneVerified") VALUES ($1, $2, $3, $4, $5, $6, \'ACTIVE\', false, false)', [userId, sanitizedEmail, String(phone).trim(), passwordHash, String(name).trim(), validRoleId])
    if (validRoleId === 2) {
      const kycId = 'kyc_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
      await pool.query('INSERT INTO "ProviderKyc" (id, "providerId", "documentType", "documentNumber", "documentFrontUrl", "selfieUrl", "verificationStatus") VALUES ($1, $2, \'PENDING\', \'PENDING\', \'/pending\', \'/pending\', \'PENDING\')', [kycId, userId]).catch(() => {})
    }
    const userResult = await pool.query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE u.id = $1', [userId])
    const user = userResult.rows[0]
    const { SignJWT } = require('jose')
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'bys-dev-secret-key-change-in-production-2024')
    const token = await new SignJWT({ sub: user.id, email: user.email, role: user.roleName, roleId: user.roleId })
      .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('15m')
      .setIssuer('bookyourservice').setAudience('bookyourservice').sign(secret)
    const { passwordHash: _ph, roleName: _rn, ...safeUser } = user
    return c.json({ message: 'Registration successful', user: { ...safeUser, role: user.roleName }, accessToken: token }, 201)
  } catch (e) { console.error('Register error:', e); return c.json({ error: 'Registration failed' }, 500) }
})

app.post('/api/auth/forgot-password', async (c) => {
  try {
    const { email } = await c.req.json()
    if (!email) return c.json({ error: 'Email is required' }, 400)
    return c.json({ message: 'If an account with that email exists, a reset token has been generated.', resetToken: crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, ''), expiresAt: new Date(Date.now() + 3600000).toISOString() })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.post('/api/auth/reset-password', async (c) => {
  try {
    const { token, newPassword, email } = await c.req.json()
    if (!token || !newPassword || !email) return c.json({ error: 'Token, new password, and email are required' }, 400)
    if (newPassword.length < 8) return c.json({ error: 'Password must be at least 8 characters' }, 400)
    if (token.length < 32) return c.json({ error: 'Invalid token' }, 400)
    const bcrypt = require('bcryptjs')
    const passwordHash = await bcrypt.hash(String(newPassword), 10)
    await pool.query('UPDATE "User" SET "passwordHash" = $1, "updatedAt" = NOW() WHERE LOWER(email) = LOWER($2)', [passwordHash, String(email).toLowerCase().trim()])
    return c.json({ message: 'Password has been reset successfully' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.post('/api/auth/change-password', async (c) => {
  try {
    const authHeader = c.req.header('authorization')
    if (!authHeader?.startsWith('Bearer ')) return c.json({ error: 'Authentication required' }, 401)
    const { jwtVerify } = require('jose')
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'bys-dev-secret-key-change-in-production-2024')
    const { payload } = await jwtVerify(authHeader.split(' ')[1], secret, { issuer: 'bookyourservice', audience: 'bookyourservice' })
    const { currentPassword, newPassword } = await c.req.json()
    if (!currentPassword || !newPassword) return c.json({ error: 'Current and new password required' }, 400)
    const result = await pool.query('SELECT "passwordHash" FROM "User" WHERE id = $1', [payload.sub])
    if (!result.rows[0]) return c.json({ error: 'User not found' }, 404)
    const bcrypt = require('bcryptjs')
    const isValid = await bcrypt.compare(String(currentPassword), result.rows[0].passwordHash)
    if (!isValid) return c.json({ error: 'Current password is incorrect' }, 401)
    if (newPassword.length < 8) return c.json({ error: 'New password must be at least 8 characters' }, 400)
    const newHash = await bcrypt.hash(String(newPassword), 10)
    await pool.query('UPDATE "User" SET "passwordHash" = $1, "updatedAt" = NOW() WHERE id = $2', [newHash, payload.sub])
    return c.json({ message: 'Password changed successfully' })
  } catch (e) { return c.json({ error: 'Failed to change password' }, 500) }
})

app.get('/api/auth/profile', async (c) => {
  try {
    const authHeader = c.req.header('authorization')
    if (!authHeader?.startsWith('Bearer ')) return c.json({ error: 'Authentication required' }, 401)
    const { jwtVerify } = require('jose')
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'bys-dev-secret-key-change-in-production-2024')
    const { payload } = await jwtVerify(authHeader.split(' ')[1], secret, { issuer: 'bookyourservice', audience: 'bookyourservice' })
    const result = await pool.query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE u.id = $1', [payload.sub])
    if (!result.rows[0]) return c.json({ error: 'User not found' }, 404)
    const { passwordHash, roleName, ...profile } = result.rows[0]
    return c.json({ user: { ...profile, role: roleName } })
  } catch (e) { return c.json({ error: 'Failed to fetch profile' }, 500) }
})

app.patch('/api/auth/profile', async (c) => {
  try {
    const authHeader = c.req.header('authorization')
    if (!authHeader?.startsWith('Bearer ')) return c.json({ error: 'Authentication required' }, 401)
    const { jwtVerify } = require('jose')
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'bys-dev-secret-key-change-in-production-2024')
    const { payload } = await jwtVerify(authHeader.split(' ')[1], secret, { issuer: 'bookyourservice', audience: 'bookyourservice' })
    const body = await c.req.json()
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
  } catch (e) { return c.json({ error: 'Failed to update profile' }, 500) }
})

// FAQ
app.get('/api/faq', async (c) => {
  try {
    const category = c.req.query('category')
    const result = category 
      ? await pool.query('SELECT * FROM "Faq" WHERE category = $1 AND "isActive" = true ORDER BY "displayOrder"', [category])
      : await pool.query('SELECT * FROM "Faq" WHERE "isActive" = true ORDER BY "displayOrder"')
    return c.json({ faqs: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// Contact
app.post('/api/contact', async (c) => {
  try {
    const { name, email, subject, message } = await c.req.json()
    if (!name || !email || !subject || !message) return c.json({ error: 'All fields required' }, 400)
    const id = 'msg_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query('INSERT INTO "ContactMessage" (id, name, email, subject, message) VALUES ($1, $2, $3, $4, $5)', [id, name, email, subject, message])
    return c.json({ success: true, id }, 201)
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// Stats
app.get('/api/stats/platform', async (c) => {
  try {
    const result = await pool.query('SELECT * FROM "PlatformStats" ORDER BY id DESC LIMIT 1')
    return c.json(result.rows[0] || { totalVisitors: 0, totalUsers: 0, totalProviders: 0, totalBookings: 0, totalServices: 0, activeVisitors: 0 })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// Categories
app.get('/api/categories', async (c) => {
  try {
    const result = await pool.query('SELECT id, name, slug, description, "iconUrl", icon, "imageUrl", "parentId", "isActive", "displayOrder", "isEmergency", "seoTitle", "seoDescription", "createdAt", "updatedAt" FROM "ServiceCategory" WHERE "isActive" = true ORDER BY "displayOrder"')
    return c.json({ categories: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.get('/api/categories/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const result = await pool.query('SELECT * FROM "ServiceCategory" WHERE id::text = $1 OR slug = $1', [id])
    if (!result.rows[0]) return c.json({ error: 'Not found' }, 404)
    // Also get subcategories
    const subResult = await pool.query('SELECT * FROM "ServiceSubcategory" WHERE "categoryId" = $1 AND "isActive" = true ORDER BY "displayOrder"', [result.rows[0].id])
    return c.json({ ...result.rows[0], subcategories: subResult.rows })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.get('/api/categories/:id/services', async (c) => {
  try {
    const id = c.req.param('id')
    // Find category first
    const catResult = await pool.query('SELECT id FROM "ServiceCategory" WHERE id::text = $1 OR slug = $1', [id])
    if (!catResult.rows[0]) return c.json({ error: 'Category not found' }, 404)
    const categoryId = catResult.rows[0].id
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    const result = await pool.query(
      'SELECT s.*, u.name as "providerName", u."profileImageUrl" as "providerImage", sc.name as "categoryName", sc.slug as "categorySlug", sc.icon as "categoryIcon", sc."imageUrl" as "categoryImage", ss.name as "subcategoryName" FROM "Service" s LEFT JOIN "User" u ON s."providerId" = u.id LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id LEFT JOIN "ServiceSubcategory" ss ON s."subcategoryId" = ss.id WHERE s."categoryId" = $1 AND s."isActive" = true AND s."isApproved" = true ORDER BY s."isFeatured" DESC, s."averageRating" DESC LIMIT $2 OFFSET $3',
      [categoryId, limit, offset]
    )
    const countResult = await pool.query('SELECT COUNT(*) as total FROM "Service" WHERE "categoryId" = $1 AND "isActive" = true AND "isApproved" = true', [categoryId])
    return c.json({ services: result.rows, total: parseInt(countResult.rows[0].total), limit, offset })
  } catch (e) { console.error('Category services error:', e); return c.json({ error: 'Failed' }, 500) }
})

// Subcategories
app.get('/api/subcategories', async (c) => {
  try {
    const categoryId = c.req.query('categoryId')
    if (categoryId) {
      const result = await pool.query('SELECT * FROM "ServiceSubcategory" WHERE "categoryId" = $1 AND "isActive" = true ORDER BY "displayOrder"', [parseInt(categoryId)])
      return c.json({ subcategories: result.rows, total: result.rows.length })
    }
    const result = await pool.query('SELECT * FROM "ServiceSubcategory" WHERE "isActive" = true ORDER BY "categoryId", "displayOrder"')
    return c.json({ subcategories: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// Services
app.get('/api/services', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    const categoryId = c.req.query('categoryId')
    let query = 'SELECT s.*, u.name as "providerName", u."profileImageUrl" as "providerImage", sc.name as "categoryName", sc.slug as "categorySlug", sc.icon as "categoryIcon", sc."imageUrl" as "categoryImage" FROM "Service" s LEFT JOIN "User" u ON s."providerId" = u.id LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id WHERE s."isActive" = true AND s."isApproved" = true'
    const params: any[] = []
    if (categoryId) {
      query += ' AND s."categoryId" = $' + (params.length + 1)
      params.push(parseInt(categoryId))
    }
    query += ' ORDER BY s."isFeatured" DESC, s."averageRating" DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2)
    params.push(limit, offset)
    const result = await pool.query(query, params)
    return c.json({ services: result.rows, total: result.rows.length, limit, offset })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.get('/api/services/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const result = await pool.query(
      'SELECT s.*, u.name as "providerName", u."profileImageUrl" as "providerImage", u.phone as "providerPhone", u.city as "providerCity", u."isVerified" as "providerVerified", u."completedJobsCount" as "providerCompletedJobs", u."verifiedBadge" as "providerVerifiedBadge", sc.name as "categoryName", sc.slug as "categorySlug", sc.icon as "categoryIcon", sc."imageUrl" as "categoryImage", ss.name as "subcategoryName" FROM "Service" s LEFT JOIN "User" u ON s."providerId" = u.id LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id LEFT JOIN "ServiceSubcategory" ss ON s."subcategoryId" = ss.id WHERE s.id = $1',
      [id]
    )
    if (!result.rows[0]) return c.json({ error: 'Service not found' }, 404)
    // Also get availability slots
    const availResult = await pool.query('SELECT * FROM "ServiceAvailability" WHERE "serviceId" = $1 AND "isAvailable" = true ORDER BY "dayOfWeek"', [id])
    // Get reviews
    const reviewResult = await pool.query('SELECT r.*, u.name as "reviewerName", u."profileImageUrl" as "reviewerImage" FROM "Review" r LEFT JOIN "User" u ON r."reviewerId" = u.id WHERE r."serviceId" = $1 ORDER BY r."createdAt" DESC LIMIT 10', [id])
    return c.json({ ...result.rows[0], availability: availResult.rows, reviews: reviewResult.rows })
  } catch (e) { console.error('Service detail error:', e); return c.json({ error: 'Failed' }, 500) }
})

// Catch-all for other API routes
app.all('/api/*', async (c) => {
  return c.json({ error: 'Not Found', message: 'The requested resource was not found' }, 404)
})

const port = 3001
console.log(`🚀 API Server is running on http://localhost:${port}`)
serve({ fetch: app.fetch, port })
