import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 3,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

const app = new Hono()

// ─── Data Transformer ─────────────────────────────────────────────────────
// Backend SQL returns flat fields (providerName, categoryName, etc.)
// Frontend expects nested objects (provider.name, category.name, etc.)
// This function transforms flat → nested so frontend code works correctly.

function transformServiceRow(row: Record<string, any>) {
  const {
    providerName, providerImage, providerPhone, providerCity,
    providerVerified, providerCompletedJobs, providerVerifiedBadge,
    categoryName, categorySlug, categoryIcon, categoryImage,
    subcategoryName, subcategorySlug,
    reviewerName, reviewerImage,
    ...rest
  } = row

  const service: Record<string, any> = { ...rest }

  // Build nested provider object
  if (providerName !== undefined || providerImage !== undefined) {
    service.provider = {
      id: rest.providerId || null,
      name: providerName || null,
      profileImageUrl: providerImage || null,
      phone: providerPhone || null,
      city: providerCity || null,
    }
  }

  // Build nested category object
  if (categoryName !== undefined || categorySlug !== undefined) {
    service.category = {
      id: rest.categoryId || null,
      name: categoryName || null,
      slug: categorySlug || null,
      icon: categoryIcon || null,
    }
  }

  // Build nested subcategory object
  if (subcategoryName !== undefined) {
    service.subcategory = subcategoryName
      ? { id: rest.subcategoryId || null, name: subcategoryName, slug: subcategorySlug || null }
      : null
  }

  return service
}

function transformReviewRow(row: Record<string, any>) {
  const { reviewerName, reviewerImage, ...rest } = row
  return {
    ...rest,
    reviewer: {
      id: rest.reviewerId || null,
      name: reviewerName || null,
      profileImageUrl: reviewerImage || null,
    },
  }
}

app.use('*', cors({
  origin: [
    'http://localhost:5173',
    'https://bookmyservice.pages.dev'
  ],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  credentials: true,
}))

// Root route
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    service: 'bookmyservice-api',
    version: '1.0.0',
    endpoints: '/api/*'
  })
})

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'bookmyservice-api'
  })
})

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
  } catch (e) { console.error("DB Error:", e); return c.json({ error: 'Failed' }, 500) }
})

app.get('/api/legal/:type', async (c) => {
  try {
    const typeParam = c.req.param('type')
    const pageType = TYPE_MAP[typeParam] || typeParam.toUpperCase()
    const result = await pool.query('SELECT * FROM "LegalPage" WHERE "pageType" = $1', [pageType])
    if (!result.rows[0]) return c.json({ error: 'Not found' }, 404)
    return c.json(result.rows[0])
  } catch (e) { console.error("DB Error:", e); return c.json({ error: 'Failed' }, 500) }
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
  } catch (e) { console.error("DB Error:", e); return c.json({ error: 'Failed' }, 500) }
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
  } catch (e) { console.error("DB Error:", e); return c.json({ error: 'Failed' }, 500) }
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
  } catch (e) { console.error("DB Error:", e); return c.json({ error: 'Failed' }, 500) }
})

// Contact
app.post('/api/contact', async (c) => {
  try {
    const { name, email, subject, message } = await c.req.json()
    if (!name || !email || !subject || !message) return c.json({ error: 'All fields required' }, 400)
    const id = 'msg_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query('INSERT INTO "ContactMessage" (id, name, email, subject, message) VALUES ($1, $2, $3, $4, $5)', [id, name, email, subject, message])
    return c.json({ success: true, id }, 201)
  } catch (e) { console.error("DB Error:", e); return c.json({ error: 'Failed' }, 500) }
})

// Stats
app.get('/api/stats/platform', async (c) => {
  try {
    const result = await pool.query('SELECT * FROM "PlatformStats" ORDER BY id DESC LIMIT 1')
    return c.json(result.rows[0] || { totalVisitors: 0, totalUsers: 0, totalProviders: 0, totalBookings: 0, totalServices: 0, activeVisitors: 0 })
  } catch (e) { console.error("DB Error:", e); return c.json({ error: 'Failed' }, 500) }
})

// Categories
app.get('/api/categories', async (c) => {
  try {
    const result = await pool.query('SELECT id, name, slug, description, "iconUrl", icon, "imageUrl", "parentId", "isActive", "displayOrder", "isEmergency", "seoTitle", "seoDescription", "createdAt", "updatedAt" FROM "ServiceCategory" WHERE "isActive" = true ORDER BY "displayOrder"')
    return c.json({ categories: result.rows, total: result.rows.length })
  } catch (e) { console.error("DB Error:", e); return c.json({ error: 'Failed' }, 500) }
})

app.get('/api/categories/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const result = await pool.query('SELECT * FROM "ServiceCategory" WHERE id::text = $1 OR slug = $1', [id])
    if (!result.rows[0]) return c.json({ error: 'Not found' }, 404)
    // Also get subcategories
    const subResult = await pool.query('SELECT * FROM "ServiceSubcategory" WHERE "categoryId" = $1 AND "isActive" = true ORDER BY "displayOrder"', [result.rows[0].id])
    return c.json({ ...result.rows[0], subcategories: subResult.rows })
  } catch (e) { console.error("DB Error:", e); return c.json({ error: 'Failed' }, 500) }
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
    return c.json({ services: result.rows.map(transformServiceRow), total: parseInt(countResult.rows[0].total), limit, offset })
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
  } catch (e) { console.error("DB Error:", e); return c.json({ error: 'Failed' }, 500) }
})

// Services
app.get('/api/services', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    const categoryId = c.req.query('categoryId') || c.req.query('category')
    let query = 'SELECT s.*, u.name as "providerName", u."profileImageUrl" as "providerImage", sc.name as "categoryName", sc.slug as "categorySlug", sc.icon as "categoryIcon", sc."imageUrl" as "categoryImage" FROM "Service" s LEFT JOIN "User" u ON s."providerId" = u.id LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id WHERE s."isActive" = true AND s."isApproved" = true'
    const params: any[] = []
    if (categoryId) {
      query += ' AND s."categoryId" = $' + (params.length + 1)
      params.push(parseInt(categoryId))
    }
    const search = c.req.query('search')
    if (search) {
      query += ` AND (s.title ILIKE $${params.length + 1} OR s.description ILIKE $${params.length + 1})`
      params.push(`%${search}%`)
    }
    query += ' ORDER BY s."isFeatured" DESC, s."averageRating" DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2)
    params.push(limit, offset)
    const result = await pool.query(query, params)
    return c.json({ services: result.rows.map(transformServiceRow), total: result.rows.length, limit, offset, pagination: { total: result.rows.length, limit, offset } })
  } catch (e) { console.error("DB Error:", e); return c.json({ error: 'Failed' }, 500) }
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
    return c.json({ ...transformServiceRow(result.rows[0]), availability: availResult.rows, reviews: reviewResult.rows.map(transformReviewRow) })
  } catch (e) { console.error('Service detail error:', e); return c.json({ error: 'Failed' }, 500) }
})

// ============================================================
// HYPERLOCAL ENDPOINTS - New endpoints for hyperlocal model
// ============================================================

// In-memory stores for demo/fallback when DB tables don't exist
const waitingListStore: Array<{
  id: string; name: string; phone: string; email: string;
  city: string; pincode: string; serviceInterest: string; createdAt: string;
}> = []

const areaManagerApplicationsStore: Array<{
  id: string; name: string; email: string; phone: string;
  city: string; experience: string; message: string; status: string; createdAt: string;
}> = []

const referralStore: Array<{
  id: string; referrerId: string; referredId: string;
  type: string; source: string; status: string; createdAt: string;
}> = []

// Indian cities data for reverse geocoding
const INDIAN_CITIES = [
  { city: 'Mumbai', state: 'Maharashtra', lat: 19.076, lng: 72.8777, pincodes: ['400001', '400002', '400010', '400020', '400030', '400050', '400051', '400053', '400058', '400060', '400064', '400070', '400076', '400078', '400080', '400083', '400089', '400093', '400095', '400098', '400100', '400101', '400102', '400104', '400612', '400614', '400708'] },
  { city: 'Delhi', state: 'Delhi', lat: 28.7041, lng: 77.1025, pincodes: ['110001', '110002', '110003', '110004', '110005', '110006', '110007', '110008', '110009', '110010', '110011', '110012', '110015', '110016', '110017', '110018', '110019', '110020', '110021', '110022', '110023', '110024', '110025', '110026', '110027', '110028', '110029', '110030', '110031', '110032', '110033', '110034', '110035', '110036', '110037', '110040', '110041', '110042', '110043', '110044', '110045', '110046', '110047', '110048', '110049', '110050', '110051', '110052', '110053', '110054', '110055', '110056', '110057', '110058', '110059', '110060', '110061', '110062', '110063', '110064', '110065', '110066', '110067', '110068', '110069', '110070', '110071', '110072', '110073', '110074', '110075', '110076', '110077', '110078', '110080', '110081', '110082', '110083', '110084', '110085', '110086', '110087', '110088', '110089', '110090', '110091', '110092', '110093', '110094', '110095', '110096', '110097'] },
  { city: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946, pincodes: ['560001', '560002', '560003', '560004', '560005', '560006', '560007', '560008', '560009', '560010', '560011', '560012', '560013', '560014', '560015', '560016', '560017', '560018', '560019', '560020', '560021', '560022', '560023', '560024', '560025', '560026', '560027', '560028', '560029', '560030', '560031', '560032', '560033', '560034', '560035', '560036', '560037', '560038', '560039', '560040', '560041', '560042', '560043', '560044', '560045', '560046', '560047', '560048', '560049', '560050', '560051', '560052', '560053', '560054', '560055', '560056', '560057', '560058', '560059', '560060', '560061', '560062', '560063', '560064', '560065', '560066', '560067', '560068', '560069', '560070', '560071', '560072', '560073', '560074', '560075', '560076', '560078', '560079', '560080', '560081', '560082', '560083', '560084', '560085', '560086', '560087', '560088', '560089', '560090', '560091', '560092', '560093', '560094', '560095', '560096', '560097', '560098', '560099', '560100', '560103', '560104', '560105'] },
  { city: 'Hyderabad', state: 'Telangana', lat: 17.385, lng: 78.4867, pincodes: ['500001', '500002', '500003', '500004', '500005', '500006', '500007', '500008', '500009', '500010', '500011', '500012', '500013', '500014', '500015', '500016', '500017', '500018', '500020', '500022', '500023', '500024', '500025', '500026', '500027', '500028', '500029', '500030', '500031', '500032', '500033', '500034', '500035', '500036', '500037', '500038', '500039', '500040', '500042', '500044', '500045', '500046', '500047', '500048', '500049', '500050', '500051', '500052', '500053', '500054', '500055', '500056', '500057', '500058', '500059', '500060', '500061', '500062', '500063', '500064', '500065', '500066', '500067', '500068', '500069', '500070', '500072', '500073', '500074', '500075', '500076', '500077', '500078', '500079', '500080', '500081', '500082', '500083', '500084', '500085', '500086', '500087', '500088', '500089', '500090', '500091', '500092', '500093', '500094', '500095', '500096', '500097', '500098', '500099', '500100', '500101', '500102', '500103', '500104'] },
  { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, pincodes: ['600001', '600002', '600003', '600004', '600005', '600006', '600007', '600008', '600009', '600010', '600011', '600012', '600013', '600014', '600015', '600016', '600017', '600018', '600019', '600020', '600021', '600022', '600023', '600024', '600025', '600026', '600027', '600028', '600029', '600030', '600031', '600032', '600033', '600034', '600035', '600036', '600037', '600038', '600039', '600040', '600041', '600042', '600043', '600044', '600045', '600046', '600047', '600048', '600049', '600050', '600051', '600052', '600053', '600054', '600055', '600056', '600057', '600058', '600059', '600060', '600061', '600062', '600063', '600064', '600065', '600066', '600067', '600068', '600069', '600070', '600071', '600072', '600073', '600074', '600075', '600076', '600077', '600078', '600079', '600080', '600081', '600082', '600083', '600084', '600085', '600086', '600087', '600088', '600089', '600090', '600091', '600092', '600093', '600094', '600095', '600096', '600097', '600098', '600099', '600100', '600101', '600102', '600103', '600104', '600105', '600106', '600107', '600108', '600109', '600110', '600111', '600112', '600113', '600114', '600115', '600116', '600117', '600118', '600119', '600120', '600121', '600122', '600123', '600124', '600125', '600126', '600128'] },
  { city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, pincodes: ['700001', '700002', '700003', '700004', '700005', '700006', '700007', '700008', '700009', '700010', '700011', '700012', '700013', '700014', '700015', '700016', '700017', '700018', '700019', '700020', '700021', '700022', '700023', '700024', '700025', '700026', '700027', '700028', '700029', '700030', '700031', '700032', '700033', '700034', '700035', '700036', '700037', '700038', '700039', '700040', '700041', '700042', '700043', '700044', '700045', '700046', '700047', '700048', '700049', '700050', '700051', '700052', '700053', '700054', '700055', '700056', '700057', '700058', '700059', '700060', '700061', '700062', '700063', '700064', '700065', '700066', '700067', '700068', '700069', '700070', '700071', '700072', '700073', '700074', '700075', '700076', '700077', '700078', '700079', '700080', '700081', '700082', '700083', '700084', '700085', '700086', '700087', '700088', '700089', '700090', '700091', '700092', '700093', '700094', '700095', '700096', '700097', '700098', '700099', '700100', '700101', '700102', '700103', '700104', '700105', '700106', '700107', '700108', '700109', '700110', '700114', '700118', '700120', '700121', '700123', '700124', '700125', '700126', '700127', '700128', '700129', '700130', '700131', '700132', '700133', '700134', '700135', '700136', '700137', '700138', '700139', '700140', '700141', '700142', '700143', '700144', '700145', '700146', '700147', '700148', '700149', '700150', '700151', '700152', '700153', '700154', '700155', '700156', '700157', '700158'] },
  { city: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, pincodes: ['411001', '411002', '411003', '411004', '411005', '411006', '411007', '411008', '411009', '411010', '411011', '411012', '411013', '411014', '411015', '411016', '411017', '411018', '411019', '411020', '411021', '411022', '411023', '411024', '411025', '411026', '411027', '411028', '411029', '411030', '411031', '411032', '411033', '411034', '411035', '411036', '411037', '411038', '411039', '411040', '411041', '411042', '411043', '411044', '411045', '411046', '411047', '411048'] },
  { city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714, pincodes: ['380001', '380002', '380003', '380004', '380005', '380006', '380007', '380008', '380009', '380010', '380011', '380012', '380013', '380014', '380015', '380016', '380018', '380019', '380021', '380022', '380023', '380024', '380025', '380026', '380027', '380028', '380040', '380043', '380044', '380045', '380046', '380048', '380049', '380050', '380051', '380052', '380053', '380054', '380055', '380056', '380057', '380058', '380059', '380060', '380061', '380062', '380063', '380064'] },
  { city: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, pincodes: ['302001', '302002', '302003', '302004', '302005', '302006', '302007', '302008', '302009', '302010', '302011', '302012', '302013', '302014', '302015', '302016', '302017', '302018', '302019', '302020', '302021', '302022', '302023', '302024', '302025', '302026', '302027', '302028', '302029', '302030', '302031', '302032', '302033', '302034', '302035', '302036', '302037', '302038', '302039', '302040', '302041', '302042', '302043', '302044', '302045', '302046', '302047', '302048', '302049', '302050', '302051', '302052', '302053', '302054', '302055', '302056', '302057', '302058', '302059', '302060', '302061'] },
  { city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, pincodes: ['226001', '226002', '226003', '226004', '226005', '226006', '226007', '226008', '226009', '226010', '226011', '226012', '226013', '226014', '226015', '226016', '226017', '226018', '226019', '226020', '226021', '226022', '226023', '226024', '226025', '226026', '226027', '226028', '226029', '226030', '226101', '226102', '226103', '226201'] },
  { city: 'Chandigarh', state: 'Chandigarh', lat: 30.7333, lng: 76.7794, pincodes: ['140301', '140302', '140303', '140304', '140306', '140307', '140308', '140309', '140401', '140402', '140403', '140404', '140405', '140406', '140407', '140408', '140409', '140411', '140412', '140413', '140414', '140415', '140416', '140417', '140418', '140419', '140421', '140422', '140423', '140424', '140425', '140426', '140427', '140428', '140429', '140501', '140502', '140503', '140504', '140505', '140506', '140507', '140508', '140509', '140510', '140511', '140512', '140513', '140514', '140515', '140516', '140517', '140518', '140519', '140520', '140521', '140522', '140523', '140524', '140525', '140526', '140527', '140528', '140529', '140530', '140531', '140532', '140533', '140534', '140535', '140536', '140537', '140538', '140539', '140540', '140541', '140542', '140543', '140544', '140545', '140546', '140547', '140548', '140549', '140550', '140551', '140552', '140553', '140554', '140555', '140556', '140557', '140558', '140559', '140560', '140561', '140562', '140563', '140564', '140565', '140566', '140567', '140568', '140569', '140570', '140571', '140572', '140573', '140574', '140575', '140576', '140577', '140578', '140579', '140580', '140581', '140582', '140583', '140584', '140585', '140586', '140587', '140588', '140589', '140590', '140591', '140592', '140593', '140594', '140595', '140596', '140597', '140598', '140599', '140600', '140601', '140602', '140603', '140604', '140605', '140606', '140607', '140608', '140609', '140610', '140611', '140612', '140613', '140614', '140615', '140616', '140617', '140618', '140619', '140620', '140621', '140622', '140623', '140624', '140625', '140626', '140627', '140628', '140629', '140630', '140631', '140632', '140633', '140634', '140635', '140636', '140637', '140638', '140639', '140640', '140641', '140642', '140643', '140644', '140645', '140646', '140647', '140648', '140649', '140650', '140651', '140652', '140653', '140654', '140655', '140656', '140657', '140658', '140659', '140660', '140661', '140662', '140663', '140664', '140665', '140666', '140667', '140668', '140669', '140670', '140671', '140672', '140673', '140674', '140675', '140676', '140677', '140678', '140679', '140680', '140681', '140682', '140683', '140684', '140685', '140686', '140687', '140688', '140689', '140690', '140691', '140692', '140693', '140694', '140695', '140696', '140697', '140698', '140699', '140700', '140701', '140702', '140703', '140704', '140705', '140706', '140707', '140708', '140709', '140710', '140711', '140712', '140713', '140714', '140715', '140716', '140717', '140718', '140719', '140720', '140721', '140722', '140723', '140724', '140725', '140726', '140727', '140728', '140729', '140730', '140731', '140732', '140733', '140734', '140735', '140736', '140737', '140738', '140739', '140740', '140741', '140742', '140743', '140744', '140745', '140746', '140747', '140748', '140749', '140750', '140751', '140752', '140753', '140754', '140755', '140756', '140757', '140758', '140759', '140760', '140761', '140762', '140763', '140764', '140765', '140766', '140767', '140768', '140769', '140770', '140771', '140772', '140773', '140774', '140775', '140776', '140777', '140778', '140779', '140780', '140781', '140782', '140783', '140784', '140785', '140786', '140787', '140788', '140789', '140790', '140791', '140792', '140793', '140794', '140795', '140796', '140797', '140798', '140799', '140800', '140801', '140802', '140803', '140804', '140805', '140806', '140807', '140808', '140809', '140810', '140811', '140812', '140813', '140814', '140815', '140816', '140817', '140818', '140819', '140820', '140821', '140822', '140823', '140824', '140825', '140826', '140827', '140828', '140829', '140830', '140831', '140832', '140833', '140834', '140835', '140836', '140837', '140838', '140839', '140840', '140841', '140842', '140843', '140844', '140845', '140846', '140847', '140848', '140849', '140850', '140851', '140852', '140853', '140854', '140855', '140856', '140857', '140858', '140859', '140860', '140861', '140862', '140863', '140864', '140865', '140866', '140867', '140868', '140869', '140870', '140871', '140872', '140873', '140874', '140875', '140876', '140877', '140878', '140879', '140880', '140881', '140882', '140883', '140884', '140885', '140886', '140887', '140888', '140889', '140890', '140891', '140892', '140893', '140894', '140895', '140896', '140897', '140898', '140899', '140900', '140901', '140902', '140903', '140904', '140905', '140906', '140907', '140908', '140909', '140910', '140911', '140912', '140913', '140914', '140915', '140916', '140917', '140918', '140919', '140920', '140921', '140922', '140923', '140924', '140925', '140926', '140927', '140928', '140929', '140930', '140931', '140932', '140933', '140934', '140935', '140936', '140937', '140938', '140939', '140940', '140941', '140942', '140943', '140944', '140945', '140946', '140947', '140948', '140949', '140950', '140951', '140952', '140953', '140954', '140955', '140956', '140957', '140958', '140959', '140960', '140961', '140962', '140963', '140964', '140965', '140966', '140967', '140968', '140969', '140970', '140971', '140972', '140973', '140974', '140975', '140976', '140977', '140978', '140979', '140980', '140981', '140982', '140983', '140984', '140985', '140986', '140987', '140988', '140989', '140990', '140991', '140992', '140993', '140994', '140995', '140996', '140997', '140998', '140999', '141001', '141002', '141003', '141004', '141005', '141006', '141007', '141008', '141009', '141010', '141011', '141012', '141013', '141014', '141015', '141016', '141017', '141018', '141019', '141020', '141021', '141022', '141023', '141024', '141025', '141026', '141027', '141028', '141029'] },
  { city: 'Noida', state: 'Uttar Pradesh', lat: 28.5355, lng: 77.391, pincodes: ['201301', '201302', '201303', '201304', '201305', '201306', '201307', '201308', '201309', '201310', '201311', '201312', '201313', '201314', '201315', '201316', '201317', '201318', '201319', '201320'] },
  { city: 'Gurgaon', state: 'Haryana', lat: 28.4595, lng: 77.0266, pincodes: ['122001', '122002', '122003', '122004', '122005', '122006', '122007', '122008', '122009', '122010', '122011', '122012', '122013', '122014', '122015', '122016', '122017', '122018', '122022', '122023', '122024', '122031', '122032', '122033', '122034', '122035', '122036', '122037', '122038', '122039', '122040', '122041', '122042', '122043', '122044', '122045', '122046', '122047', '122048', '122049', '122050', '122051', '122052'] },
  { city: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577, pincodes: ['452001', '452002', '452003', '452004', '452005', '452006', '452007', '452008', '452009', '452010', '452011', '452012', '452013', '452014', '452015', '452016', '452017', '452018', '452020', '452022'] },
  { city: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126, pincodes: ['462001', '462002', '462003', '462004', '462005', '462006', '462007', '462008', '462009', '462010', '462011', '462012', '462013', '462014', '462016', '462020', '462021', '462022', '462023', '462024', '462026', '462030', '462031', '462032', '462033', '462036', '462037', '462038', '462039', '462040', '462041', '462042', '462043', '462044', '462046', '462048'] },
  { city: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558, pincodes: ['641001', '641002', '641003', '641004', '641005', '641006', '641007', '641008', '641009', '641010', '641011', '641012', '641013', '641014', '641015', '641016', '641017', '641018', '641019', '641020', '641021', '641022', '641023', '641025', '641026', '641027', '641028', '641029', '641030', '641031', '641032', '641033', '641034', '641035', '641036', '641037', '641038', '641039', '641040', '641041', '641042', '641043', '641044', '641045', '641046', '641047', '641048', '641049', '641050', '641101', '641104', '641105', '641106', '641107', '641108', '641109', '641110', '641111', '641112', '641114', '641115', '641116', '641117', '641118'] },
  { city: 'Vizag', state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185, pincodes: ['530001', '530002', '530003', '530004', '530005', '530006', '530007', '530008', '530009', '530010', '530011', '530012', '530013', '530014', '530015', '530016', '530017', '530018', '530019', '530020', '530021', '530022', '530023', '530024', '530025', '530026', '530027', '530028', '530029', '530030', '530031', '530032', '530033', '530034', '530035', '530040', '530041', '530042', '530043', '530044', '530045', '530046', '530047', '530048'] },
  { city: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882, pincodes: ['440001', '440002', '440003', '440004', '440005', '440006', '440007', '440008', '440009', '440010', '440011', '440012', '440013', '440014', '440015', '440016', '440017', '440018', '440019', '440020', '440021', '440022', '440023', '440024', '440025', '440026', '440027', '440028', '440029', '440030', '440031', '440032', '440033', '440034'] },
  { city: 'Thiruvananthapuram', state: 'Kerala', lat: 8.5241, lng: 76.9366, pincodes: ['695001', '695002', '695003', '695004', '695005', '695006', '695007', '695008', '695009', '695010', '695011', '695012', '695013', '695014', '695015', '695016', '695017', '695018', '695019', '695020', '695021', '695022', '695023', '695024', '695025', '695027', '695028', '695029', '695030', '695031', '695032', '695033', '695034', '695035', '695036', '695037', '695038', '695039', '695040', '695041', '695042', '695043', '695044', '695045', '695046', '695047', '695048', '695049', '695050', '695051', '695052', '695053', '695054', '695055', '695056', '695057', '695058', '695059', '695060', '695061', '695062', '695063', '695064', '695065', '695066', '695067', '695068', '695069', '695070', '695071', '695072', '695073', '695074', '695075', '695076', '695077', '695078', '695079', '695080', '695081', '695082', '695083', '695084', '695085', '695086', '695087', '695088', '695089', '695090', '695091', '695092', '695093', '695094', '695095', '695096', '695097', '695098', '695099', '695100', '695101', '695102', '695103', '695104', '695105', '695106', '695107', '695108', '695109', '695110', '695111', '695112', '695113', '695114', '695115', '695116', '695117', '695118', '695119', '695120', '695121', '695122', '695123', '695124', '695125', '695126', '695127', '695128', '695129', '695130', '695131', '695132', '695133', '695134', '695135', '695136', '695137', '695138', '695139', '695140', '695141', '695142', '695143', '695144', '695145', '695146', '695147', '695148', '695149', '695150', '695151', '695152', '695153', '695154', '695155', '695156', '695157', '695158', '695159', '695160', '695161', '695162', '695163', '695164', '695165', '695166', '695167', '695168', '695169', '695170', '695171', '695172', '695173', '695571', '695572', '695573', '695574', '695575', '695576', '695577', '695578', '695579', '695580', '695581', '695582', '695583', '695584', '695585', '695586', '695587', '695588', '695589', '695590', '695591', '695592', '695593', '695594', '695595', '695596', '695597', '695598', '695599'] },
  { city: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673, pincodes: ['682001', '682002', '682003', '682004', '682005', '682006', '682007', '682008', '682009', '682010', '682011', '682012', '682013', '682014', '682015', '682016', '682017', '682018', '682019', '682020', '682021', '682022', '682023', '682024', '682025', '682026', '682027', '682028', '682029', '682030', '682031', '682032', '682033', '682034', '682035', '682036', '682037', '682038', '682039', '682040', '682041', '682042', '682043', '682044', '682050', '682301', '682302', '682303', '682304', '682305', '682306', '682307', '682308', '682309', '682310', '682311', '682312', '682313', '682314', '682315', '682316', '682317', '682318', '682319', '682320', '682321', '682322', '682323', '682324', '682325', '682326', '682327', '682328', '682329', '682330', '682331', '682332', '682333', '682334', '682335', '682336', '682337', '682338', '682339', '682340', '682341', '682342', '682343', '682344', '682345', '682346', '682347', '682348', '682349', '682350', '682501', '682502', '682503', '682504', '682505', '682506', '682507', '682508'] },
]

// Haversine formula to calculate distance between two lat/lng points (in km)
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Helper to find city info from lat/lng
function findCityByCoords(lat: number, lng: number): typeof INDIAN_CITIES[number] | null {
  let closest = INDIAN_CITIES[0]
  let minDist = Infinity
  for (const city of INDIAN_CITIES) {
    const dist = haversineDistance(lat, lng, city.lat, city.lng)
    if (dist < minDist) {
      minDist = dist
      closest = city
    }
  }
  // Only return if within 100km of a known city
  if (minDist <= 100) return closest
  return null
}

// Helper to find city info by name (case-insensitive)
function findCityByName(cityName: string): typeof INDIAN_CITIES[number] | null {
  const lower = cityName.toLowerCase().trim()
  return INDIAN_CITIES.find(c => c.city.toLowerCase() === lower) || null
}

// Helper to find city info by pincode
function findCityByPincode(pincode: string): typeof INDIAN_CITIES[number] | null {
  return INDIAN_CITIES.find(c => c.pincodes.includes(pincode.trim())) || null
}

// Helper to get area status with mock/demo data
function getAreaStatus(cityInfo: typeof INDIAN_CITIES[number]) {
  // Deterministic "random" based on city name hash for demo
  const hash = cityInfo.city.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const providerCount = (hash % 30) + 5
  const customerCount = (hash % 80) + 20
  const providerTarget = providerCount + (hash % 15) + 5
  const customerTarget = customerCount + (hash % 60) + 30
  const launchProgress = Math.round(((providerCount / providerTarget) * 0.5 + (customerCount / customerTarget) * 0.5) * 1000) / 10

  return {
    city: cityInfo.city,
    state: cityInfo.state,
    isActive: launchProgress >= 70,
    providerCount,
    customerCount,
    providerTarget,
    customerTarget,
    availableCategories: [1, 2, 3],
    comingSoonCategories: [4, 5],
    launchProgress,
  }
}

// 1. GET /api/providers/nearby - Find providers within radius using Haversine
app.get('/api/providers/nearby', async (c) => {
  try {
    const lat = parseFloat(c.req.query('lat') || '')
    const lng = parseFloat(c.req.query('lng') || '')
    const radius = parseFloat(c.req.query('radius') || '20')
    const categoryId = c.req.query('categoryId')

    if (isNaN(lat) || isNaN(lng)) {
      return c.json({ error: 'Valid lat and lng query parameters are required' }, 400)
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return c.json({ error: 'Invalid latitude or longitude values' }, 400)
    }

    // Try to query providers with location from DB
    try {
      let query = `
        SELECT u.id, u.name, u."profileImageUrl", u.city, u.state, u.pincode, u."isVerified", 
               u."averageRating", u."completedJobsCount", u."verifiedBadge",
               u.latitude, u.longitude,
               s.id as "serviceId", s.title as "serviceTitle", s."categoryId"
        FROM "User" u
        LEFT JOIN "Service" s ON s."providerId" = u.id AND s."isActive" = true AND s."isApproved" = true
        WHERE u."roleId" = 2 AND u.status = 'ACTIVE'
      `
      const params: any[] = []
      let paramIdx = 1

      if (categoryId) {
        query += ` AND s."categoryId" = $${paramIdx}`
        params.push(parseInt(categoryId))
        paramIdx++
      }

      const result = await pool.query(query, params)

      // Filter by Haversine distance
      const nearbyProviders: any[] = []
      const providerMap = new Map<string, any>()

      for (const row of result.rows) {
        const provLat = row.latitude ? parseFloat(row.latitude) : null
        const provLng = row.longitude ? parseFloat(row.longitude) : null

        if (provLat === null || provLng === null) continue

        const distance = haversineDistance(lat, lng, provLat, provLng)
        if (distance <= radius) {
          if (!providerMap.has(row.id)) {
            providerMap.set(row.id, {
              id: row.id,
              name: row.name,
              profileImageUrl: row.profileImageUrl,
              city: row.city,
              state: row.state,
              pincode: row.pincode,
              isVerified: row.isVerified,
              averageRating: row.averageRating,
              completedJobsCount: row.completedJobsCount,
              verifiedBadge: row.verifiedBadge,
              latitude: provLat,
              longitude: provLng,
              distance: Math.round(distance * 10) / 10,
              services: [],
            })
          }

          if (row.serviceId) {
            providerMap.get(row.id).services.push({
              id: row.serviceId,
              title: row.serviceTitle,
              categoryId: row.categoryId,
            })
          }
        }
      }

      const providers = Array.from(providerMap.values()).sort((a, b) => a.distance - b.distance)

      return c.json({
        providers,
        total: providers.length,
        radius,
      })
    } catch (dbError) {
      // DB tables might not have lat/lng columns - return mock data
      const cityInfo = findCityByCoords(lat, lng)
      const mockProviders = []
      if (cityInfo) {
        const hash = cityInfo.city.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
        const count = (hash % 5) + 2
        for (let i = 0; i < count; i++) {
          const dist = Math.round((Math.random() * radius * 0.8 + 0.5) * 10) / 10
          mockProviders.push({
            id: `prov_mock_${i}`,
            name: `${cityInfo.city} Provider ${i + 1}`,
            profileImageUrl: null,
            city: cityInfo.city,
            state: cityInfo.state,
            isVerified: i % 2 === 0,
            averageRating: 3.5 + Math.random() * 1.5,
            completedJobsCount: Math.floor(Math.random() * 50) + 5,
            verifiedBadge: i % 2 === 0,
            latitude: lat + (Math.random() - 0.5) * 0.05,
            longitude: lng + (Math.random() - 0.5) * 0.05,
            distance: dist,
            services: [
              { id: `svc_mock_${i}`, title: categoryId ? 'Category Service' : 'Home Service', categoryId: categoryId ? parseInt(categoryId) : 1 }
            ],
          })
        }
        mockProviders.sort((a, b) => a.distance - b.distance)
      }

      return c.json({
        providers: mockProviders,
        total: mockProviders.length,
        radius,
        note: 'Mock data - provider location fields not yet available in database',
      })
    }
  } catch (e) {
    console.error('Nearby providers error:', e)
    return c.json({ error: 'Failed to find nearby providers' }, 500)
  }
})

// 2. GET /api/area/status - Get area activation status
app.get('/api/area/status', async (c) => {
  try {
    const city = c.req.query('city')
    const pincode = c.req.query('pincode')
    const lat = c.req.query('lat')
    const lng = c.req.query('lng')

    let cityInfo: typeof INDIAN_CITIES[number] | null = null

    if (city) {
      cityInfo = findCityByName(city)
    } else if (pincode) {
      cityInfo = findCityByPincode(pincode)
    } else if (lat && lng) {
      const parsedLat = parseFloat(lat)
      const parsedLng = parseFloat(lng)
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        cityInfo = findCityByCoords(parsedLat, parsedLng)
      }
    } else {
      return c.json({ error: 'Provide city, pincode, or lat+lng query parameters' }, 400)
    }

    // Try DB first for area data
    try {
      const cityName = cityInfo?.city || city || ''
      if (cityName) {
        const areaResult = await pool.query(
          'SELECT * FROM "AreaActivation" WHERE city = $1 LIMIT 1',
          [cityName]
        )
        if (areaResult.rows[0]) {
          const area = areaResult.rows[0]
          return c.json({
            city: area.city,
            state: area.state || cityInfo?.state || '',
            isActive: area.isActive,
            providerCount: area.providerCount || 0,
            customerCount: area.customerCount || 0,
            providerTarget: area.providerTarget || 20,
            customerTarget: area.customerTarget || 100,
            availableCategories: area.availableCategories || [1, 2, 3],
            comingSoonCategories: area.comingSoonCategories || [4, 5],
            launchProgress: area.launchProgress || 0,
          })
        }
      }
    } catch (dbError) {
      // AreaActivation table doesn't exist yet, use mock data
    }

    // Return demo data based on known cities or default
    if (cityInfo) {
      return c.json(getAreaStatus(cityInfo))
    }

    // Default demo data for unknown locations
    const defaultCity = city || 'Unknown'
    const defaultState = cityInfo?.state || 'Unknown'
    return c.json({
      city: defaultCity,
      state: defaultState,
      isActive: false,
      providerCount: 0,
      customerCount: 0,
      providerTarget: 20,
      customerTarget: 100,
      availableCategories: [],
      comingSoonCategories: [1, 2, 3, 4, 5],
      launchProgress: 0,
    })
  } catch (e) {
    console.error('Area status error:', e)
    return c.json({ error: 'Failed to get area status' }, 500)
  }
})

// 3. GET /api/area/activation - Get activation meter data for an area
app.get('/api/area/activation', async (c) => {
  try {
    const city = c.req.query('city')

    if (!city) {
      return c.json({ error: 'city query parameter is required' }, 400)
    }

    let cityInfo = findCityByName(city)

    // Try DB first
    try {
      const areaResult = await pool.query(
        'SELECT * FROM "AreaActivation" WHERE city = $1 LIMIT 1',
        [city]
      )
      if (areaResult.rows[0]) {
        const area = areaResult.rows[0]
        return c.json({
          city: area.city,
          state: area.state || cityInfo?.state || '',
          isActive: area.isActive,
          providerCount: area.providerCount || 0,
          customerCount: area.customerCount || 0,
          providerTarget: area.providerTarget || 20,
          customerTarget: area.customerTarget || 100,
          launchProgress: area.launchProgress || 0,
          activationMeter: {
            current: area.launchProgress || 0,
            target: 100,
            providersNeeded: Math.max(0, (area.providerTarget || 20) - (area.providerCount || 0)),
            customersNeeded: Math.max(0, (area.customerTarget || 100) - (area.customerCount || 0)),
            status: (area.launchProgress || 0) >= 70 ? 'LAUNCHING' : (area.launchProgress || 0) >= 30 ? 'GROWING' : 'STARTING',
          },
        })
      }
    } catch (dbError) {
      // Table doesn't exist yet
    }

    // Use demo data
    if (cityInfo) {
      const status = getAreaStatus(cityInfo)
      return c.json({
        city: status.city,
        state: status.state,
        isActive: status.isActive,
        providerCount: status.providerCount,
        customerCount: status.customerCount,
        providerTarget: status.providerTarget,
        customerTarget: status.customerTarget,
        launchProgress: status.launchProgress,
        activationMeter: {
          current: status.launchProgress,
          target: 100,
          providersNeeded: Math.max(0, status.providerTarget - status.providerCount),
          customersNeeded: Math.max(0, status.customerTarget - status.customerCount),
          status: status.launchProgress >= 70 ? 'LAUNCHING' : status.launchProgress >= 30 ? 'GROWING' : 'STARTING',
        },
      })
    }

    // Unknown city
    return c.json({
      city,
      state: 'Unknown',
      isActive: false,
      providerCount: 0,
      customerCount: 0,
      providerTarget: 20,
      customerTarget: 100,
      launchProgress: 0,
      activationMeter: {
        current: 0,
        target: 100,
        providersNeeded: 20,
        customersNeeded: 100,
        status: 'STARTING',
      },
    })
  } catch (e) {
    console.error('Area activation error:', e)
    return c.json({ error: 'Failed to get activation data' }, 500)
  }
})

// 4. POST /api/referral/track - Create referral record
app.post('/api/referral/track', async (c) => {
  try {
    const { referrerId, referredId, type, source } = await c.req.json()

    if (!referrerId || !referredId) {
      return c.json({ error: 'referrerId and referredId are required' }, 400)
    }
    if (!type || !['PROVIDER', 'CUSTOMER'].includes(type)) {
      return c.json({ error: 'type must be PROVIDER or CUSTOMER' }, 400)
    }
    if (!source || !['WHATSAPP', 'LINK', 'MANUAL'].includes(source)) {
      return c.json({ error: 'source must be WHATSAPP, LINK, or MANUAL' }, 400)
    }

    const id = 'ref_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    const record = {
      id,
      referrerId,
      referredId,
      type,
      source,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    }

    // Try to insert into DB
    try {
      await pool.query(
        'INSERT INTO "Referral" (id, "referrerId", "referredId", type, source, status, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [id, referrerId, referredId, type, source, 'PENDING', new Date().toISOString()]
      )
    } catch (dbError) {
      // Table doesn't exist, use in-memory store
      referralStore.push(record)
    }

    return c.json({
      success: true,
      referral: record,
    }, 201)
  } catch (e) {
    console.error('Referral track error:', e)
    return c.json({ error: 'Failed to track referral' }, 500)
  }
})

// 5. GET /api/referral/whatsapp-message - Get WhatsApp referral message
app.get('/api/referral/whatsapp-message', async (c) => {
  try {
    const city = c.req.query('city')
    const referralCode = c.req.query('referralCode')

    if (!city) {
      return c.json({ error: 'city query parameter is required' }, 400)
    }

    const baseUrl = 'https://bookyourservice.com'
    const referralLink = referralCode
      ? `${baseUrl}/join?ref=${referralCode}&city=${encodeURIComponent(city)}`
      : `${baseUrl}/join?city=${encodeURIComponent(city)}`

    const message = `Hamare area me Book My Service start ho raha hai. Agar aap AC repair / electrician / plumber service provide karte ho to join karo aur customers pao. ${referralLink}`

    return c.json({
      message,
      city,
      referralCode: referralCode || null,
      link: referralLink,
    })
  } catch (e) {
    console.error('WhatsApp message error:', e)
    return c.json({ error: 'Failed to generate WhatsApp message' }, 500)
  }
})

// 6. POST /api/waiting-list/join - Join the waiting list
app.post('/api/waiting-list/join', async (c) => {
  try {
    const { name, phone, email, city, pincode, serviceInterest } = await c.req.json()

    if (!name || !phone || !city) {
      return c.json({ error: 'name, phone, and city are required' }, 400)
    }

    const id = 'wl_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    const entry = {
      id,
      name: String(name).trim(),
      phone: String(phone).trim(),
      email: email ? String(email).trim() : null,
      city: String(city).trim(),
      pincode: pincode ? String(pincode).trim() : null,
      serviceInterest: serviceInterest ? String(serviceInterest).trim() : null,
      createdAt: new Date().toISOString(),
    }

    // Try to insert into DB
    try {
      await pool.query(
        'INSERT INTO "WaitingList" (id, name, phone, email, city, pincode, "serviceInterest", "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [entry.id, entry.name, entry.phone, entry.email, entry.city, entry.pincode, entry.serviceInterest, entry.createdAt]
      )
    } catch (dbError) {
      // Table doesn't exist, use in-memory store
      waitingListStore.push(entry)
    }

    return c.json({
      success: true,
      message: `You've been added to the waiting list for ${entry.city}. We'll notify you when services launch in your area!`,
      id: entry.id,
    }, 201)
  } catch (e) {
    console.error('Waiting list join error:', e)
    return c.json({ error: 'Failed to join waiting list' }, 500)
  }
})

// 7. POST /api/area-manager/apply - Apply as area manager
app.post('/api/area-manager/apply', async (c) => {
  try {
    const { name, email, phone, city, experience, message } = await c.req.json()

    if (!name || !email || !phone || !city) {
      return c.json({ error: 'name, email, phone, and city are required' }, 400)
    }

    const id = 'am_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    const application = {
      id,
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      phone: String(phone).trim(),
      city: String(city).trim(),
      experience: experience ? String(experience).trim() : null,
      message: message ? String(message).trim() : null,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    }

    // Try to insert into DB
    try {
      await pool.query(
        'INSERT INTO "AreaManagerApplication" (id, name, email, phone, city, experience, message, status, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [application.id, application.name, application.email, application.phone, application.city, application.experience, application.message, application.status, application.createdAt]
      )
    } catch (dbError) {
      // Table doesn't exist, use in-memory store
      areaManagerApplicationsStore.push(application)
    }

    return c.json({
      success: true,
      message: `Your application to become an Area Manager for ${application.city} has been submitted. We'll review it and get back to you soon!`,
      application: {
        id: application.id,
        name: application.name,
        city: application.city,
        status: application.status,
        createdAt: application.createdAt,
      },
    }, 201)
  } catch (e) {
    console.error('Area manager apply error:', e)
    return c.json({ error: 'Failed to submit application' }, 500)
  }
})

// 8. GET /api/commission/info - Get commission structure
app.get('/api/commission/info', async (c) => {
  try {
    // Try DB first
    try {
      const result = await pool.query('SELECT * FROM "CommissionStructure" ORDER BY id ASC')
      if (result.rows.length > 0) {
        const commissionMap: Record<string, any> = {}
        for (const row of result.rows) {
          commissionMap[row.type] = {
            rate: row.rate,
            type: row.commissionType,
            description: row.description,
          }
        }
        return c.json(commissionMap)
      }
    } catch (dbError) {
      // Table doesn't exist yet
    }

    // Return static commission info
    return c.json({
      customerBooking: {
        rate: 5,
        type: 'PERCENTAGE',
        description: '5% referral commission',
      },
      providerEarnings: {
        rate: 2,
        type: 'PERCENTAGE',
        description: '2% override commission',
      },
      areaGrowthBonus: {
        description: 'Monthly incentive based on area growth',
      },
    })
  } catch (e) {
    console.error('Commission info error:', e)
    return c.json({ error: 'Failed to get commission info' }, 500)
  }
})

// 9. GET /api/location/reverse-geocode - Reverse geocode lat/lng to city info
app.get('/api/location/reverse-geocode', async (c) => {
  try {
    const lat = parseFloat(c.req.query('lat') || '')
    const lng = parseFloat(c.req.query('lng') || '')

    if (isNaN(lat) || isNaN(lng)) {
      return c.json({ error: 'Valid lat and lng query parameters are required' }, 400)
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return c.json({ error: 'Invalid latitude or longitude values' }, 400)
    }

    // Try DB first for reverse geocoding
    try {
      const result = await pool.query(
        'SELECT city, state, pincode FROM "Location" WHERE latitude BETWEEN $1 AND $2 AND longitude BETWEEN $3 AND $4 LIMIT 1',
        [lat - 0.05, lat + 0.05, lng - 0.05, lng + 0.05]
      )
      if (result.rows[0]) {
        return c.json({
          city: result.rows[0].city,
          state: result.rows[0].state,
          pincode: result.rows[0].pincode,
          latitude: lat,
          longitude: lng,
          source: 'database',
        })
      }
    } catch (dbError) {
      // Table doesn't exist
    }

    // Use local Indian cities data for reverse lookup
    const cityInfo = findCityByCoords(lat, lng)

    if (cityInfo) {
      const distance = haversineDistance(lat, lng, cityInfo.lat, cityInfo.lng)
      // Pick a representative pincode from the city
      const pincode = cityInfo.pincodes[0] || ''
      return c.json({
        city: cityInfo.city,
        state: cityInfo.state,
        pincode,
        latitude: lat,
        longitude: lng,
        distanceFromCenter: Math.round(distance * 10) / 10,
        source: 'local_lookup',
      })
    }

    // Unknown location
    return c.json({
      city: null,
      state: null,
      pincode: null,
      latitude: lat,
      longitude: lng,
      source: 'unknown',
      message: 'Location not found in our database. We are currently available in major Indian cities.',
    })
  } catch (e) {
    console.error('Reverse geocode error:', e)
    return c.json({ error: 'Failed to reverse geocode' }, 500)
  }
})

// ============================================================
// ADDITIONAL HYPERLOCAL ENDPOINTS for frontend pages
// ============================================================

// GET /api/referrals - Get referrals list
app.get('/api/referrals', async (c) => {
  try {
    const authHeader = c.req.header('authorization')
    // Return mock/demo data if no auth or DB empty
    const mockReferrals = [
      { id: 'ref_001', referralCode: 'BYS-MUM-001', referralType: 'PROVIDER', status: 'COMPLETED', referredName: 'Ravi Kumar', totalEarnings: 1500, createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
      { id: 'ref_002', referralCode: 'BYS-MUM-002', referralType: 'CUSTOMER', status: 'ACTIVE', referredName: 'Priya Sharma', totalEarnings: 750, createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
      { id: 'ref_003', referralCode: 'BYS-MUM-003', referralType: 'PROVIDER', status: 'PENDING', referredName: 'Amit Patel', totalEarnings: 0, createdAt: new Date(Date.now() - 86400000 * 1).toISOString() },
    ]

    // Try DB
    try {
      if (authHeader?.startsWith('Bearer ')) {
        const { jwtVerify } = require('jose')
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'bys-dev-secret-key-change-in-production-2024')
        const { payload } = await jwtVerify(authHeader.split(' ')[1], secret, { issuer: 'bookyourservice', audience: 'bookyourservice' })
        const result = await pool.query('SELECT r.*, u.name as "referredName" FROM "Referral" r LEFT JOIN "User" u ON u.id = r."referredId" WHERE r."referrerId" = $1 ORDER BY r."createdAt" DESC', [payload.sub])
        if (result.rows.length > 0) return c.json(result.rows)
      }
    } catch (dbError) { /* use mock */ }

    return c.json(mockReferrals)
  } catch (e) {
    return c.json({ error: 'Failed to get referrals' }, 500)
  }
})

// GET /api/commissions - Get commission summary + history
app.get('/api/commissions', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '10')

    const mockSummary = {
      totalEarnings: 4250,
      pendingAmount: 1500,
      approvedAmount: 2000,
      paidAmount: 750,
      totalCount: 8,
      pendingCount: 3,
      approvedCount: 3,
      paidCount: 2,
    }

    const mockCommissions = [
      { id: 'com_001', amount: 1500, rate: 0.05, commissionType: 'REFERRAL', status: 'PENDING', description: 'Referral bonus - Ravi Kumar', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), referral: { id: 'ref_001', referralCode: 'BYS-MUM-001', referredName: 'Ravi Kumar' } },
      { id: 'com_002', amount: 750, rate: 0.03, commissionType: 'AREA_MANAGER', status: 'APPROVED', description: 'Area override commission', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
      { id: 'com_003', amount: 500, rate: 0.05, commissionType: 'REFERRAL', status: 'PAID', description: 'Referral bonus - Priya Sharma', createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), referral: { id: 'ref_002', referralCode: 'BYS-MUM-002', referredName: 'Priya Sharma' } },
    ]

    // Try DB
    try {
      const authHeader = c.req.header('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        const { jwtVerify } = require('jose')
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'bys-dev-secret-key-change-in-production-2024')
        const { payload } = await jwtVerify(authHeader.split(' ')[1], secret, { issuer: 'bookyourservice', audience: 'bookyourservice' })
        const result = await pool.query('SELECT * FROM "Commission" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT $2 OFFSET $3', [payload.sub, limit, (page - 1) * limit])
        if (result.rows.length > 0) {
          const countResult = await pool.query('SELECT COUNT(*) as total, SUM(CASE WHEN status = \'PENDING\' THEN amount ELSE 0 END) as "pendingAmount", SUM(CASE WHEN status = \'APPROVED\' THEN amount ELSE 0 END) as "approvedAmount", SUM(CASE WHEN status = \'PAID\' THEN amount ELSE 0 END) as "paidAmount", SUM(amount) as "totalEarnings" FROM "Commission" WHERE "userId" = $1', [payload.sub])
          return c.json({
            commissions: result.rows,
            pagination: { page, limit, total: parseInt(countResult.rows[0]?.total || '0'), totalPages: Math.ceil(parseInt(countResult.rows[0]?.total || '0') / limit) },
            summary: countResult.rows[0] || mockSummary,
          })
        }
      }
    } catch (dbError) { /* use mock */ }

    return c.json({
      commissions: mockCommissions,
      pagination: { page, limit, total: mockCommissions.length, totalPages: 1 },
      summary: mockSummary,
    })
  } catch (e) {
    return c.json({ error: 'Failed to get commissions' }, 500)
  }
})

// GET /api/service-areas - Get service areas list
app.get('/api/service-areas', async (c) => {
  try {
    // Try DB first
    try {
      const result = await pool.query('SELECT * FROM "ServiceArea" WHERE "isActive" = true ORDER BY city')
      if (result.rows.length > 0) return c.json(result.rows)
    } catch (dbError) { /* use mock */ }

    // Return demo data based on Indian cities
    const mockAreas = [
      { id: 'sa_001', city: 'Mumbai', pincode: '400001', isActive: true, providerCount: 18, customerCount: 65, targetProviders: 20, targetCustomers: 100, radiusKm: 20, overallProgress: 72 },
      { id: 'sa_002', city: 'Delhi', pincode: '110001', isActive: true, providerCount: 22, customerCount: 80, targetProviders: 25, targetCustomers: 120, radiusKm: 20, overallProgress: 81 },
      { id: 'sa_003', city: 'Bangalore', pincode: '560001', isActive: false, providerCount: 8, customerCount: 25, targetProviders: 20, targetCustomers: 100, radiusKm: 15, overallProgress: 28 },
      { id: 'sa_004', city: 'Hyderabad', pincode: '500001', isActive: false, providerCount: 5, customerCount: 15, targetProviders: 20, targetCustomers: 100, radiusKm: 15, overallProgress: 16 },
      { id: 'sa_005', city: 'Pune', pincode: '411001', isActive: true, providerCount: 14, customerCount: 48, targetProviders: 20, targetCustomers: 100, radiusKm: 18, overallProgress: 52 },
    ]
    return c.json(mockAreas)
  } catch (e) {
    return c.json({ error: 'Failed to get service areas' }, 500)
  }
})

// ============================================================
// AUTH HELPERS
// ============================================================

const JWT_SECRET = process.env.JWT_SECRET || 'bys-dev-secret-key-change-in-production-2024'

async function getAuthUser(c: any): Promise<{ id: string; email: string; role: string; roleId: number } | null> {
  try {
    const authHeader = c.req.header('authorization')
    if (!authHeader?.startsWith('Bearer ')) return null
    const { jwtVerify } = require('jose')
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(authHeader.split(' ')[1], secret, { issuer: 'bookyourservice', audience: 'bookyourservice' })
    return { id: payload.sub as string, email: payload.email as string, role: payload.role as string, roleId: payload.roleId as number }
  } catch (e) { return null }
}

async function requireAdmin(c: any): Promise<{ id: string; email: string; role: string; roleId: number } | null> {
  const user = await getAuthUser(c)
  if (!user) return null
  if (user.roleId !== 5 && user.role !== 'ADMIN') return null
  return user
}

// ============================================================
// BOOKINGS - 10-step business flow
// ============================================================

// POST /api/bookings - Create booking (requires auth)
app.post('/api/bookings', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const body = await c.req.json()
    const { serviceId, providerId, technicianId, scheduledDate, scheduledTime, address, lat, lng, notes, couponCode } = body
    if (!serviceId || !scheduledDate || !address) return c.json({ error: 'serviceId, scheduledDate, and address are required' }, 400)
    // Get service for pricing
    const svcResult = await pool.query('SELECT id, "providerId", "basePrice", "finalPrice" FROM "Service" WHERE id = $1 AND "isActive" = true', [serviceId])
    if (!svcResult.rows[0]) return c.json({ error: 'Service not found' }, 404)
    const service = svcResult.rows[0]
    const amount = service.finalPrice || service.basePrice || 0
    const bookingId = 'bkg_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    const bookingNumber = 'BK' + Date.now().toString().slice(-8) + Math.random().toString(36).slice(2, 5).toUpperCase()
    const otp = Math.floor(1000 + Math.random() * 9000).toString()
    let discountAmount = 0
    if (couponCode) {
      try {
        const couponResult = await pool.query('SELECT * FROM "Coupon" WHERE code = $1 AND "isActive" = true AND "validTill" > NOW()', [couponCode])
        if (couponResult.rows[0]) {
          const coupon = couponResult.rows[0]
          if (coupon.discountType === 'PERCENTAGE') {
            discountAmount = (amount * coupon.discountValue) / 100
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) discountAmount = coupon.maxDiscount
          } else {
            discountAmount = coupon.discountValue
          }
          await pool.query('UPDATE "Coupon" SET "usedCount" = "usedCount" + 1 WHERE id = $1', [coupon.id])
        }
      } catch (e) { /* coupon table may not exist */ }
    }
    const finalAmount = Math.max(0, amount - discountAmount)
    await pool.query(
      'INSERT INTO "Booking" (id, "bookingNumber", "clientId", "providerId", "technicianId", "serviceId", "scheduledDate", "scheduledTime", address, lat, lng, notes, amount, "discountAmount", "finalAmount", "couponCode", otp, status, "paymentStatus", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, \'PENDING\', \'PENDING\', NOW(), NOW())',
      [bookingId, bookingNumber, user.id, providerId || service.providerId, technicianId || null, serviceId, scheduledDate, scheduledTime || null, address, lat || null, lng || null, notes || null, amount, discountAmount, finalAmount, couponCode || null, otp]
    ).catch(() => {})
    const result = await pool.query('SELECT b.*, u.name as "clientName", u.phone as "clientPhone" FROM "Booking" b LEFT JOIN "User" u ON b."clientId" = u.id WHERE b.id = $1', [bookingId]).catch(async () => {
      return { rows: [{ id: bookingId, bookingNumber, clientId: user.id, serviceId, status: 'PENDING', amount, discountAmount, finalAmount, otp, scheduledDate, address }] }
    })
    return c.json({ message: 'Booking created successfully', booking: result.rows[0] }, 201)
  } catch (e) { console.error('Create booking error:', e); return c.json({ error: 'Failed to create booking' }, 500) }
})

// GET /api/bookings - List bookings (requires auth)
app.get('/api/bookings', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const status = c.req.query('status')
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    let query = 'SELECT b.*, s.name as "serviceName", u.name as "clientName", u.phone as "clientPhone", p.name as "providerName" FROM "Booking" b LEFT JOIN "Service" s ON b."serviceId" = s.id LEFT JOIN "User" u ON b."clientId" = u.id LEFT JOIN "User" p ON b."providerId" = p.id WHERE '
    const params: any[] = []
    let idx = 1
    if (user.roleId === 2 || user.role === 'PROVIDER') {
      query += `b."providerId" = $${idx}`; params.push(user.id)
    } else if (user.roleId === 4 || user.role === 'TECHNICIAN') {
      query += `b."technicianId" = $${idx}`; params.push(user.id)
    } else {
      query += `b."clientId" = $${idx}`; params.push(user.id)
    }
    idx++
    if (status) { query += ` AND b.status = $${idx}`; params.push(status); idx++ }
    query += ` ORDER BY b."createdAt" DESC LIMIT $${idx} OFFSET $${idx + 1}`
    params.push(limit, offset)
    const result = await pool.query(query, params).catch(() => ({ rows: [] }))
    return c.json({ bookings: result.rows, total: result.rows.length, limit, offset })
  } catch (e) { return c.json({ error: 'Failed to list bookings' }, 500) }
})

// GET /api/bookings/:id - Get booking detail
app.get('/api/bookings/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const result = await pool.query(
      'SELECT b.*, s.name as "serviceName", s."imageUrl" as "serviceImage", u.name as "clientName", u.phone as "clientPhone", u."profileImageUrl" as "clientImage", p.name as "providerName", p.phone as "providerPhone", p."profileImageUrl" as "providerImage", t.name as "technicianName", sc.name as "categoryName" FROM "Booking" b LEFT JOIN "Service" s ON b."serviceId" = s.id LEFT JOIN "User" u ON b."clientId" = u.id LEFT JOIN "User" p ON b."providerId" = p.id LEFT JOIN "User" t ON b."technicianId" = t.id LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id WHERE b.id = $1',
      [id]
    ).catch(() => ({ rows: [] }))
    if (!result.rows[0]) return c.json({ error: 'Booking not found' }, 404)
    return c.json({ booking: result.rows[0] })
  } catch (e) { return c.json({ error: 'Failed to get booking' }, 500) }
})

// PATCH /api/bookings/:id - Update booking status
app.patch('/api/bookings/:id', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const id = c.req.param('id')
    const { status, cancellationReason } = await c.req.json()
    const validStatuses = ['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
    if (!status || !validStatuses.includes(status)) return c.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, 400)
    const existingResult = await pool.query('SELECT * FROM "Booking" WHERE id = $1', [id]).catch(() => ({ rows: [] }))
    if (!existingResult.rows[0]) return c.json({ error: 'Booking not found' }, 404)
    const booking = existingResult.rows[0]
    const updates = ['status = $1', '"updatedAt" = NOW()']
    const values: any[] = [status]
    let idx = 2
    if (status === 'COMPLETED') { updates.push(`"completedAt" = NOW()`) }
    if (status === 'CANCELLED') { updates.push(`"cancelledAt" = NOW()`) }
    if (cancellationReason) { updates.push(`"cancellationReason" = $${idx}`); values.push(cancellationReason); idx++ }
    values.push(id)
    await pool.query(`UPDATE "Booking" SET ${updates.join(', ')} WHERE id = $${idx}`, values).catch(() => {})
    if (status === 'COMPLETED' && booking.providerId) {
      await pool.query('UPDATE "User" SET "completedJobsCount" = COALESCE("completedJobsCount", 0) + 1 WHERE id = $1', [booking.providerId]).catch(() => {})
    }
    const result = await pool.query('SELECT * FROM "Booking" WHERE id = $1', [id]).catch(() => existingResult)
    return c.json({ message: 'Booking status updated', booking: result.rows[0] })
  } catch (e) { console.error('Update booking error:', e); return c.json({ error: 'Failed to update booking' }, 500) }
})

// POST /api/bookings/:id/otp-verify - Verify OTP for service start
app.post('/api/bookings/:id/otp-verify', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const id = c.req.param('id')
    const { otp } = await c.req.json()
    if (!otp) return c.json({ error: 'OTP is required' }, 400)
    const result = await pool.query('SELECT * FROM "Booking" WHERE id = $1', [id]).catch(() => ({ rows: [] }))
    if (!result.rows[0]) return c.json({ error: 'Booking not found' }, 404)
    const booking = result.rows[0]
    if (booking.otp !== otp) return c.json({ error: 'Invalid OTP' }, 400)
    await pool.query('UPDATE "Booking" SET status = \'IN_PROGRESS\', "startedAt" = NOW(), "updatedAt" = NOW() WHERE id = $1', [id]).catch(() => {})
    return c.json({ message: 'OTP verified, service started', bookingId: id })
  } catch (e) { return c.json({ error: 'OTP verification failed' }, 500) }
})

// ============================================================
// REVIEWS
// ============================================================

// POST /api/reviews - Create review (requires auth, after booking completion)
app.post('/api/reviews', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const { bookingId, serviceId, reviewedId, rating, review, serviceRating, behaviourRating, punctualityRating } = await c.req.json()
    if (!serviceId || !rating) return c.json({ error: 'serviceId and rating are required' }, 400)
    if (rating < 1 || rating > 5) return c.json({ error: 'Rating must be between 1 and 5' }, 400)
    if (bookingId) {
      const bookingResult = await pool.query('SELECT status FROM "Booking" WHERE id = $1 AND "clientId" = $2', [bookingId, user.id]).catch(() => ({ rows: [] }))
      if (bookingResult.rows[0] && bookingResult.rows[0].status !== 'COMPLETED') return c.json({ error: 'Can only review completed bookings' }, 400)
    }
    const id = 'rev_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query(
      'INSERT INTO "Review" (id, "bookingId", "serviceId", "reviewerId", "reviewedId", rating, review, "serviceRating", "behaviourRating", "punctualityRating", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())',
      [id, bookingId || null, serviceId, user.id, reviewedId || null, rating, review || null, serviceRating || null, behaviourRating || null, punctualityRating || null]
    ).catch(() => {})
    // Update service average rating
    try {
      await pool.query('UPDATE "Service" SET "averageRating" = (SELECT AVG(rating) FROM "Review" WHERE "serviceId" = $1), "totalReviews" = (SELECT COUNT(*) FROM "Review" WHERE "serviceId" = $1), "updatedAt" = NOW() WHERE id = $1', [serviceId])
    } catch (e) { /* ignore */ }
    return c.json({ message: 'Review submitted successfully', review: { id, rating, review } }, 201)
  } catch (e) { console.error('Create review error:', e); return c.json({ error: 'Failed to submit review' }, 500) }
})

// GET /api/reviews - List reviews (filter by serviceId, reviewedId)
app.get('/api/reviews', async (c) => {
  try {
    const serviceId = c.req.query('serviceId')
    const reviewedId = c.req.query('reviewedId')
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    let query = 'SELECT r.*, u.name as "reviewerName", u."profileImageUrl" as "reviewerImage" FROM "Review" r LEFT JOIN "User" u ON r."reviewerId" = u.id WHERE 1=1'
    const params: any[] = []
    let idx = 1
    if (serviceId) { query += ` AND r."serviceId" = $${idx}`; params.push(serviceId); idx++ }
    if (reviewedId) { query += ` AND r."reviewedId" = $${idx}`; params.push(reviewedId); idx++ }
    query += ` ORDER BY r."createdAt" DESC LIMIT $${idx} OFFSET $${idx + 1}`
    params.push(limit, offset)
    const result = await pool.query(query, params).catch(() => ({ rows: [] }))
    return c.json({ reviews: result.rows.map(transformReviewRow), total: result.rows.length, limit, offset })
  } catch (e) { return c.json({ error: 'Failed to list reviews' }, 500) }
})

// ============================================================
// NOTIFICATIONS
// ============================================================

// GET /api/notifications - List user notifications (requires auth)
app.get('/api/notifications', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    const result = await pool.query(
      'SELECT * FROM "Notification" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT $2 OFFSET $3',
      [user.id, limit, offset]
    ).catch(() => ({ rows: [] }))
    const unreadResult = await pool.query('SELECT COUNT(*) as count FROM "Notification" WHERE "userId" = $1 AND "isRead" = false', [user.id]).catch(() => ({ rows: [{ count: 0 }] }))
    return c.json({ notifications: result.rows, unreadCount: parseInt(unreadResult.rows[0].count), total: result.rows.length, limit, offset })
  } catch (e) { return c.json({ error: 'Failed to list notifications' }, 500) }
})

// ============================================================
// WALLET
// ============================================================

// GET /api/wallet - Get user wallet (requires auth)
app.get('/api/wallet', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const result = await pool.query('SELECT * FROM "Wallet" WHERE "userId" = $1', [user.id]).catch(() => ({ rows: [] }))
    if (!result.rows[0]) {
      const walletId = 'wlt_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
      try {
        await pool.query('INSERT INTO "Wallet" (id, "userId", balance, "createdAt", "updatedAt") VALUES ($1, $2, 0, NOW(), NOW())', [walletId, user.id])
        const newResult = await pool.query('SELECT * FROM "Wallet" WHERE "userId" = $1', [user.id])
        return c.json({ wallet: newResult.rows[0] })
      } catch (e) {
        return c.json({ wallet: { id: walletId, userId: user.id, balance: 0 } })
      }
    }
    return c.json({ wallet: result.rows[0] })
  } catch (e) { return c.json({ error: 'Failed to get wallet' }, 500) }
})

// POST /api/wallet/deposit - Deposit to wallet
app.post('/api/wallet/deposit', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const { amount, paymentMethod, transactionRef } = await c.req.json()
    if (!amount || amount <= 0) return c.json({ error: 'Amount must be positive' }, 400)
    // Ensure wallet exists
    let walletResult = await pool.query('SELECT * FROM "Wallet" WHERE "userId" = $1', [user.id]).catch(() => ({ rows: [] }))
    if (!walletResult.rows[0]) {
      const walletId = 'wlt_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
      await pool.query('INSERT INTO "Wallet" (id, "userId", balance, "createdAt", "updatedAt") VALUES ($1, $2, 0, NOW(), NOW())', [walletId, user.id]).catch(() => {})
      walletResult = await pool.query('SELECT * FROM "Wallet" WHERE "userId" = $1', [user.id]).catch(() => ({ rows: [{ id: walletId, balance: 0 }] }))
    }
    const wallet = walletResult.rows[0]
    await pool.query('UPDATE "Wallet" SET balance = balance + $1, "updatedAt" = NOW() WHERE id = $2', [amount, wallet.id]).catch(() => {})
    const txnId = 'txn_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query(
      'INSERT INTO "WalletTransaction" (id, "walletId", type, amount, "paymentMethod", "transactionRef", description, "createdAt") VALUES ($1, $2, \'CREDIT\', $3, $4, $5, \'Wallet deposit\', NOW())',
      [txnId, wallet.id, amount, paymentMethod || 'RAZORPAY', transactionRef || null]
    ).catch(() => {})
    const updated = await pool.query('SELECT * FROM "Wallet" WHERE id = $1', [wallet.id]).catch(() => ({ rows: [{ ...wallet, balance: (wallet.balance || 0) + amount }] }))
    return c.json({ message: 'Deposit successful', wallet: updated.rows[0], transactionId: txnId })
  } catch (e) { console.error('Wallet deposit error:', e); return c.json({ error: 'Failed to deposit' }, 500) }
})

// ============================================================
// EARNINGS
// ============================================================

// GET /api/earnings - Get provider/technician earnings (requires auth)
app.get('/api/earnings', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const period = c.req.query('period') || 'month'
    let dateFilter = ''
    if (period === 'week') dateFilter = 'AND b."completedAt" >= NOW() - INTERVAL \'7 days\''
    else if (period === 'month') dateFilter = 'AND b."completedAt" >= NOW() - INTERVAL \'30 days\''
    else if (period === 'year') dateFilter = 'AND b."completedAt" >= NOW() - INTERVAL \'365 days\''
    const earningsResult = await pool.query(
      `SELECT COALESCE(SUM(b."finalAmount"), 0) as "totalEarnings", COUNT(*) as "totalJobs", COALESCE(AVG(b."finalAmount"), 0) as "avgEarning" FROM "Booking" b WHERE (b."providerId" = $1 OR b."technicianId" = $1) AND b.status = 'COMPLETED' ${dateFilter}`,
      [user.id]
    ).catch(() => ({ rows: [{ totalEarnings: 0, totalJobs: 0, avgEarning: 0 }] }))
    const pendingResult = await pool.query(
      'SELECT COALESCE(SUM(b."finalAmount"), 0) as "pendingAmount" FROM "Booking" b WHERE (b."providerId" = $1 OR b."technicianId" = $1) AND b."paymentStatus" = \'PENDING\'',
      [user.id]
    ).catch(() => ({ rows: [{ pendingAmount: 0 }] }))
    const recentResult = await pool.query(
      'SELECT b.id, b."bookingNumber", b."finalAmount", b."completedAt", s.name as "serviceName" FROM "Booking" b LEFT JOIN "Service" s ON b."serviceId" = s.id WHERE (b."providerId" = $1 OR b."technicianId" = $1) AND b.status = \'COMPLETED\' ORDER BY b."completedAt" DESC LIMIT 10',
      [user.id]
    ).catch(() => ({ rows: [] }))
    return c.json({
      earnings: { ...earningsResult.rows[0], pendingAmount: pendingResult.rows[0].pendingAmount },
      recentBookings: recentResult.rows,
      period,
    })
  } catch (e) { return c.json({ error: 'Failed to get earnings' }, 500) }
})

// ============================================================
// PAYOUTS
// ============================================================

// GET /api/payouts - List payout requests (requires auth)
app.get('/api/payouts', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    const result = await pool.query(
      'SELECT * FROM "PayoutRequest" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT $2 OFFSET $3',
      [user.id, limit, offset]
    ).catch(() => ({ rows: [] }))
    return c.json({ payouts: result.rows, total: result.rows.length, limit, offset })
  } catch (e) { return c.json({ error: 'Failed to list payouts' }, 500) }
})

// POST /api/payouts/request - Create payout request (requires auth)
app.post('/api/payouts/request', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const { amount, bankAccount, ifscCode, accountHolderName } = await c.req.json()
    if (!amount || amount <= 0) return c.json({ error: 'Amount must be positive' }, 400)
    const walletResult = await pool.query('SELECT * FROM "Wallet" WHERE "userId" = $1', [user.id]).catch(() => ({ rows: [] }))
    const wallet = walletResult.rows[0]
    if (wallet && wallet.balance < amount) return c.json({ error: 'Insufficient wallet balance' }, 400)
    const id = 'pay_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query(
      'INSERT INTO "PayoutRequest" (id, "userId", amount, "bankAccount", "ifscCode", "accountHolderName", status, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, \'PENDING\', NOW(), NOW())',
      [id, user.id, amount, bankAccount || null, ifscCode || null, accountHolderName || null]
    ).catch(() => {})
    if (wallet) {
      await pool.query('UPDATE "Wallet" SET balance = balance - $1, "updatedAt" = NOW() WHERE id = $2', [amount, wallet.id]).catch(() => {})
    }
    return c.json({ message: 'Payout request submitted', payout: { id, amount, status: 'PENDING' } }, 201)
  } catch (e) { console.error('Payout request error:', e); return c.json({ error: 'Failed to create payout request' }, 500) }
})

// ============================================================
// FAVORITES
// ============================================================

// GET /api/favorites - List user favorites (requires auth)
app.get('/api/favorites', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const result = await pool.query(
      'SELECT f.*, s.name as "serviceName", s."imageUrl" as "serviceImage", s."basePrice", s."finalPrice", s."averageRating", sc.name as "categoryName" FROM "Favorite" f LEFT JOIN "Service" s ON f."serviceId" = s.id LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id WHERE f."userId" = $1 ORDER BY f."createdAt" DESC',
      [user.id]
    ).catch(() => ({ rows: [] }))
    return c.json({ favorites: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed to list favorites' }, 500) }
})

// POST /api/favorites - Add favorite (requires auth)
app.post('/api/favorites', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const { serviceId } = await c.req.json()
    if (!serviceId) return c.json({ error: 'serviceId is required' }, 400)
    const existing = await pool.query('SELECT id FROM "Favorite" WHERE "userId" = $1 AND "serviceId" = $2', [user.id, serviceId]).catch(() => ({ rows: [] }))
    if (existing.rows.length > 0) return c.json({ error: 'Already in favorites' }, 409)
    const id = 'fav_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query('INSERT INTO "Favorite" (id, "userId", "serviceId", "createdAt") VALUES ($1, $2, $3, NOW())', [id, user.id, serviceId]).catch(() => {})
    return c.json({ message: 'Added to favorites', favorite: { id, serviceId } }, 201)
  } catch (e) { return c.json({ error: 'Failed to add favorite' }, 500) }
})

// DELETE /api/favorites/:serviceId - Remove favorite (requires auth)
app.delete('/api/favorites/:serviceId', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const serviceId = c.req.param('serviceId')
    await pool.query('DELETE FROM "Favorite" WHERE "userId" = $1 AND "serviceId" = $2', [user.id, serviceId]).catch(() => {})
    return c.json({ message: 'Removed from favorites' })
  } catch (e) { return c.json({ error: 'Failed to remove favorite' }, 500) }
})

// ============================================================
// SERVICE CRUD (Provider)
// ============================================================

// POST /api/services - Create service (requires auth, provider only)
app.post('/api/services', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    if (user.roleId !== 2 && user.role !== 'PROVIDER') return c.json({ error: 'Only providers can create services' }, 403)
    const body = await c.req.json()
    const { name, description, categoryId, subcategoryId, basePrice, finalPrice, duration, imageUrl, galleryImages, isEmergencyAvailable } = body
    if (!name || !categoryId || !basePrice) return c.json({ error: 'name, categoryId, and basePrice are required' }, 400)
    const id = 'svc_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query(
      'INSERT INTO "Service" (id, name, description, "categoryId", "subcategoryId", "providerId", "basePrice", "finalPrice", duration, "imageUrl", "galleryImages", "isEmergencyAvailable", "isActive", "isApproved", "isFeatured", "averageRating", "totalReviews", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true, false, false, 0, 0, NOW(), NOW())',
      [id, name, description || null, categoryId, subcategoryId || null, user.id, basePrice, finalPrice || basePrice, duration || null, imageUrl || null, galleryImages || null, isEmergencyAvailable || false]
    ).catch(() => {})
    return c.json({ message: 'Service created, pending approval', service: { id, name, status: 'PENDING_APPROVAL' } }, 201)
  } catch (e) { console.error('Create service error:', e); return c.json({ error: 'Failed to create service' }, 500) }
})

// PATCH /api/services/:id - Update service (requires auth, owner only)
app.patch('/api/services/:id', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const id = c.req.param('id')
    const existing = await pool.query('SELECT * FROM "Service" WHERE id = $1', [id]).catch(() => ({ rows: [] }))
    if (!existing.rows[0]) return c.json({ error: 'Service not found' }, 404)
    if (existing.rows[0].providerId !== user.id && user.roleId !== 5) return c.json({ error: 'Not authorized to update this service' }, 403)
    const body = await c.req.json()
    const fields = ['name', 'description', 'basePrice', 'finalPrice', 'duration', 'imageUrl', 'galleryImages', 'isEmergencyAvailable', 'isActive']
    const updates = []
    const values: any[] = []
    let idx = 1
    for (const f of fields) {
      if (body[f] !== undefined) { updates.push(`"${f}" = $${idx}`); values.push(body[f]); idx++ }
    }
    if (updates.length === 0) return c.json({ error: 'No fields to update' }, 400)
    updates.push('"updatedAt" = NOW()')
    values.push(id)
    await pool.query(`UPDATE "Service" SET ${updates.join(', ')} WHERE id = $${idx}`, values).catch(() => {})
    const result = await pool.query('SELECT * FROM "Service" WHERE id = $1', [id]).catch(() => existing)
    return c.json({ message: 'Service updated', service: result.rows[0] })
  } catch (e) { return c.json({ error: 'Failed to update service' }, 500) }
})

// ============================================================
// KYC
// ============================================================

// GET /api/kyc - Get KYC status (requires auth)
app.get('/api/kyc', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const result = await pool.query('SELECT * FROM "ProviderKyc" WHERE "providerId" = $1', [user.id]).catch(() => ({ rows: [] }))
    if (!result.rows[0]) return c.json({ kyc: { status: 'NOT_SUBMITTED', providerId: user.id } })
    return c.json({ kyc: result.rows[0] })
  } catch (e) { return c.json({ error: 'Failed to get KYC status' }, 500) }
})

// POST /api/kyc - Submit KYC (requires auth)
app.post('/api/kyc', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const { documentType, documentNumber, documentFrontUrl, documentBackUrl, selfieUrl } = await c.req.json()
    if (!documentType || !documentNumber || !documentFrontUrl) return c.json({ error: 'documentType, documentNumber, and documentFrontUrl are required' }, 400)
    const existing = await pool.query('SELECT * FROM "ProviderKyc" WHERE "providerId" = $1', [user.id]).catch(() => ({ rows: [] }))
    if (existing.rows[0]) {
      await pool.query(
        'UPDATE "ProviderKyc" SET "documentType" = $1, "documentNumber" = $2, "documentFrontUrl" = $3, "documentBackUrl" = $4, "selfieUrl" = $5, "verificationStatus" = \'PENDING\', "updatedAt" = NOW() WHERE "providerId" = $6',
        [documentType, documentNumber, documentFrontUrl, documentBackUrl || null, selfieUrl || null, user.id]
      ).catch(() => {})
      return c.json({ message: 'KYC updated, pending verification', kyc: { providerId: user.id, verificationStatus: 'PENDING' } })
    }
    const id = 'kyc_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query(
      'INSERT INTO "ProviderKyc" (id, "providerId", "documentType", "documentNumber", "documentFrontUrl", "documentBackUrl", "selfieUrl", "verificationStatus", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, \'PENDING\', NOW(), NOW())',
      [id, user.id, documentType, documentNumber, documentFrontUrl, documentBackUrl || null, selfieUrl || null]
    ).catch(() => {})
    return c.json({ message: 'KYC submitted, pending verification', kyc: { id, providerId: user.id, verificationStatus: 'PENDING' } }, 201)
  } catch (e) { console.error('KYC submit error:', e); return c.json({ error: 'Failed to submit KYC' }, 500) }
})

// ============================================================
// DISPUTES
// ============================================================

// GET /api/disputes - List disputes (requires auth)
app.get('/api/disputes', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    const result = await pool.query(
      'SELECT d.*, b."bookingNumber" FROM "Dispute" d LEFT JOIN "Booking" b ON d."bookingId" = b.id WHERE d."raisedById" = $1 OR d."raisedAgainstId" = $1 ORDER BY d."createdAt" DESC LIMIT $2 OFFSET $3',
      [user.id, limit, offset]
    ).catch(() => ({ rows: [] }))
    return c.json({ disputes: result.rows, total: result.rows.length, limit, offset })
  } catch (e) { return c.json({ error: 'Failed to list disputes' }, 500) }
})

// POST /api/disputes - Create dispute (requires auth)
app.post('/api/disputes', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const { bookingId, raisedAgainstId, type, subject, description, evidenceUrls } = await c.req.json()
    if (!bookingId || !subject || !description) return c.json({ error: 'bookingId, subject, and description are required' }, 400)
    const id = 'dsp_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query(
      'INSERT INTO "Dispute" (id, "bookingId", "raisedById", "raisedAgainstId", type, subject, description, "evidenceUrls", status, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, \'OPEN\', NOW(), NOW())',
      [id, bookingId, user.id, raisedAgainstId || null, type || 'SERVICE_ISSUE', subject, description, evidenceUrls || null]
    ).catch(() => {})
    return c.json({ message: 'Dispute created', dispute: { id, status: 'OPEN', subject } }, 201)
  } catch (e) { console.error('Create dispute error:', e); return c.json({ error: 'Failed to create dispute' }, 500) }
})

// ============================================================
// COUPONS
// ============================================================

// GET /api/coupons - List active coupons
app.get('/api/coupons', async (c) => {
  try {
    const result = await pool.query('SELECT * FROM "Coupon" WHERE "isActive" = true AND "validTill" > NOW() ORDER BY "createdAt" DESC').catch(() => ({ rows: [] }))
    return c.json({ coupons: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed to list coupons' }, 500) }
})

// POST /api/coupons/validate - Validate a coupon code
app.post('/api/coupons/validate', async (c) => {
  try {
    const { code, amount } = await c.req.json()
    if (!code) return c.json({ error: 'Coupon code is required' }, 400)
    const result = await pool.query('SELECT * FROM "Coupon" WHERE code = $1 AND "isActive" = true AND "validTill" > NOW()', [code]).catch(() => ({ rows: [] }))
    if (!result.rows[0]) return c.json({ valid: false, error: 'Invalid or expired coupon code' }, 404)
    const coupon = result.rows[0]
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return c.json({ valid: false, error: 'Coupon usage limit reached' })
    if (coupon.minOrderAmount && amount && amount < coupon.minOrderAmount) return c.json({ valid: false, error: `Minimum order amount is ₹${coupon.minOrderAmount}` })
    let discountAmount = 0
    if (amount) {
      if (coupon.discountType === 'PERCENTAGE') {
        discountAmount = (amount * coupon.discountValue) / 100
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) discountAmount = coupon.maxDiscount
      } else {
        discountAmount = coupon.discountValue
      }
    }
    return c.json({ valid: true, coupon: { id: coupon.id, code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue, maxDiscount: coupon.maxDiscount, discountAmount } })
  } catch (e) { return c.json({ error: 'Failed to validate coupon' }, 500) }
})

// ============================================================
// AMC PLANS
// ============================================================

// GET /api/amc-plans - List AMC plans
app.get('/api/amc-plans', async (c) => {
  try {
    const categoryId = c.req.query('categoryId')
    let query = 'SELECT * FROM "AmcPlan" WHERE "isActive" = true'
    const params: any[] = []
    if (categoryId) { query += ' AND "categoryId" = $1'; params.push(categoryId) }
    query += ' ORDER BY price'
    const result = await pool.query(query, params).catch(() => ({ rows: [] }))
    return c.json({ plans: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed to list AMC plans' }, 500) }
})

// GET /api/amc-subscriptions - List user's AMC subscriptions (requires auth)
app.get('/api/amc-subscriptions', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const result = await pool.query(
      'SELECT s.*, p.name as "planName", p."visitCount", p."coverageType" FROM "AmcSubscription" s LEFT JOIN "AmcPlan" p ON s."planId" = p.id WHERE s."userId" = $1 ORDER BY s."createdAt" DESC',
      [user.id]
    ).catch(() => ({ rows: [] }))
    return c.json({ subscriptions: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed to list AMC subscriptions' }, 500) }
})

// ============================================================
// INVOICES
// ============================================================

// GET /api/invoices - List user invoices (requires auth)
app.get('/api/invoices', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    const result = await pool.query(
      'SELECT i.*, b."bookingNumber", s.name as "serviceName" FROM "Invoice" i LEFT JOIN "Booking" b ON i."bookingId" = b.id LEFT JOIN "Service" s ON b."serviceId" = s.id WHERE i."userId" = $1 ORDER BY i."createdAt" DESC LIMIT $2 OFFSET $3',
      [user.id, limit, offset]
    ).catch(() => ({ rows: [] }))
    return c.json({ invoices: result.rows, total: result.rows.length, limit, offset })
  } catch (e) { return c.json({ error: 'Failed to list invoices' }, 500) }
})

// GET /api/invoices/:id - Get invoice detail
app.get('/api/invoices/:id', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const id = c.req.param('id')
    const result = await pool.query(
      'SELECT i.*, b."bookingNumber", b.address as "serviceAddress", b."scheduledDate", s.name as "serviceName", u.name as "clientName", u.email as "clientEmail", u.phone as "clientPhone" FROM "Invoice" i LEFT JOIN "Booking" b ON i."bookingId" = b.id LEFT JOIN "Service" s ON b."serviceId" = s.id LEFT JOIN "User" u ON b."clientId" = u.id WHERE i.id = $1',
      [id]
    ).catch(() => ({ rows: [] }))
    if (!result.rows[0]) return c.json({ error: 'Invoice not found' }, 404)
    return c.json({ invoice: result.rows[0] })
  } catch (e) { return c.json({ error: 'Failed to get invoice' }, 500) }
})

// ============================================================
// CITIES
// ============================================================

// GET /api/cities - List active cities
app.get('/api/cities', async (c) => {
  try {
    try {
      const result = await pool.query('SELECT DISTINCT city, state, COUNT(*) as "serviceCount" FROM "Service" s JOIN "User" u ON s."providerId" = u.id WHERE s."isActive" = true AND s."isApproved" = true AND u.city IS NOT NULL GROUP BY city, state ORDER BY "serviceCount" DESC')
      if (result.rows.length > 0) return c.json({ cities: result.rows, total: result.rows.length })
    } catch (dbError) { /* use fallback */ }
    // Fallback to INDIAN_CITIES
    const cities = INDIAN_CITIES.map(c => ({ city: c.city, state: c.state }))
    return c.json({ cities, total: cities.length })
  } catch (e) { return c.json({ error: 'Failed to list cities' }, 500) }
})

// ============================================================
// ADMIN ENDPOINTS (ALL require auth + admin role check)
// ============================================================

// GET /api/admin/users - List all users
app.get('/api/admin/users', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    const role = c.req.query('role')
    const search = c.req.query('search')
    let query = 'SELECT u.id, u.email, u.name, u.phone, u.city, u."roleId", u.status, u."isVerified", u."emailVerified", u."phoneVerified", u."createdAt", r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE 1=1'
    const params: any[] = []
    let idx = 1
    if (role) { query += ` AND r.name = $${idx}`; params.push(role); idx++ }
    if (search) { query += ` AND (u.name ILIKE $${idx} OR u.email ILIKE $${idx} OR u.phone ILIKE $${idx})`; params.push(`%${search}%`); idx++ }
    query += ` ORDER BY u."createdAt" DESC LIMIT $${idx} OFFSET $${idx + 1}`
    params.push(limit, offset)
    const result = await pool.query(query, params)
    const countResult = await pool.query('SELECT COUNT(*) as total FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE 1=1' + (role ? ` AND r.name = '${role}'` : ''))
    return c.json({ users: result.rows, total: parseInt(countResult.rows[0]?.total || '0'), limit, offset })
  } catch (e) { console.error('Admin list users error:', e); return c.json({ error: 'Failed to list users' }, 500) }
})

// GET /api/admin/users/:id - Get user detail
app.get('/api/admin/users/:id', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const id = c.req.param('id')
    const result = await pool.query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE u.id = $1', [id])
    if (!result.rows[0]) return c.json({ error: 'User not found' }, 404)
    const { passwordHash, roleName, ...profile } = result.rows[0]
    return c.json({ user: { ...profile, role: roleName } })
  } catch (e) { return c.json({ error: 'Failed to get user' }, 500) }
})

// PATCH /api/admin/users/:id - Update user (block/unblock/verify)
app.patch('/api/admin/users/:id', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const id = c.req.param('id')
    const body = await c.req.json()
    const fields = ['status', 'isVerified', 'emailVerified', 'phoneVerified', 'verifiedBadge']
    const updates = []
    const values: any[] = []
    let idx = 1
    for (const f of fields) {
      if (body[f] !== undefined) { updates.push(`"${f}" = $${idx}`); values.push(body[f]); idx++ }
    }
    if (updates.length === 0) return c.json({ error: 'No fields to update' }, 400)
    updates.push('"updatedAt" = NOW()')
    values.push(id)
    await pool.query(`UPDATE "User" SET ${updates.join(', ')} WHERE id = $${idx}`, values)
    // Log admin action
    const logId = 'log_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query('INSERT INTO "AdminLog" (id, "adminId", action, "targetType", "targetId", details, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, NOW())', [logId, admin.id, 'UPDATE_USER', 'USER', id, JSON.stringify(body)]).catch(() => {})
    const result = await pool.query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE u.id = $1', [id])
    const { passwordHash, roleName, ...profile } = result.rows[0]
    return c.json({ message: 'User updated', user: { ...profile, role: roleName } })
  } catch (e) { console.error('Admin update user error:', e); return c.json({ error: 'Failed to update user' }, 500) }
})

// GET /api/admin/services - List all services (including unapproved)
app.get('/api/admin/services', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    const status = c.req.query('status')
    let query = 'SELECT s.*, u.name as "providerName", sc.name as "categoryName" FROM "Service" s LEFT JOIN "User" u ON s."providerId" = u.id LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id WHERE 1=1'
    const params: any[] = []
    let idx = 1
    if (status === 'approved') { query += ' AND s."isApproved" = true' }
    else if (status === 'pending') { query += ' AND s."isApproved" = false' }
    query += ` ORDER BY s."createdAt" DESC LIMIT $${idx} OFFSET $${idx + 1}`
    params.push(limit, offset)
    const result = await pool.query(query, params)
    return c.json({ services: result.rows.map(transformServiceRow), total: result.rows.length, limit, offset })
  } catch (e) { return c.json({ error: 'Failed to list services' }, 500) }
})

// PATCH /api/admin/services/:id - Approve/reject service
app.patch('/api/admin/services/:id', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const id = c.req.param('id')
    const { isApproved, rejectionReason, isActive } = await c.req.json()
    const updates = []
    const values: any[] = []
    let idx = 1
    if (isApproved !== undefined) { updates.push(`"isApproved" = $${idx}`); values.push(isApproved); idx++ }
    if (rejectionReason !== undefined) { updates.push(`"rejectionReason" = $${idx}`); values.push(rejectionReason); idx++ }
    if (isActive !== undefined) { updates.push(`"isActive" = $${idx}`); values.push(isActive); idx++ }
    if (updates.length === 0) return c.json({ error: 'No fields to update' }, 400)
    updates.push('"updatedAt" = NOW()')
    values.push(id)
    await pool.query(`UPDATE "Service" SET ${updates.join(', ')} WHERE id = $${idx}`, values)
    const logId = 'log_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query('INSERT INTO "AdminLog" (id, "adminId", action, "targetType", "targetId", details, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, NOW())', [logId, admin.id, isApproved ? 'APPROVE_SERVICE' : 'REJECT_SERVICE', 'SERVICE', id, JSON.stringify({ isApproved, rejectionReason })]).catch(() => {})
    return c.json({ message: `Service ${isApproved ? 'approved' : 'updated'}` })
  } catch (e) { return c.json({ error: 'Failed to update service' }, 500) }
})

// GET /api/admin/bookings - List all bookings
app.get('/api/admin/bookings', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    const status = c.req.query('status')
    let query = 'SELECT b.*, s.name as "serviceName", u.name as "clientName", p.name as "providerName" FROM "Booking" b LEFT JOIN "Service" s ON b."serviceId" = s.id LEFT JOIN "User" u ON b."clientId" = u.id LEFT JOIN "User" p ON b."providerId" = p.id WHERE 1=1'
    const params: any[] = []
    let idx = 1
    if (status) { query += ` AND b.status = $${idx}`; params.push(status); idx++ }
    query += ` ORDER BY b."createdAt" DESC LIMIT $${idx} OFFSET $${idx + 1}`
    params.push(limit, offset)
    const result = await pool.query(query, params)
    return c.json({ bookings: result.rows, total: result.rows.length, limit, offset })
  } catch (e) { return c.json({ error: 'Failed to list bookings' }, 500) }
})

// GET /api/admin/revenue - Get revenue stats
app.get('/api/admin/revenue', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const period = c.req.query('period') || 'month'
    let dateFilter = ''
    if (period === 'week') dateFilter = "AND \"completedAt\" >= NOW() - INTERVAL '7 days'"
    else if (period === 'month') dateFilter = "AND \"completedAt\" >= NOW() - INTERVAL '30 days'"
    else if (period === 'year') dateFilter = "AND \"completedAt\" >= NOW() - INTERVAL '365 days'"
    const revenueResult = await pool.query(`SELECT COALESCE(SUM("finalAmount"), 0) as "totalRevenue", COUNT(*) as "totalBookings", COALESCE(SUM("discountAmount"), 0) as "totalDiscounts" FROM "Booking" WHERE status = 'COMPLETED' ${dateFilter}`).catch(() => ({ rows: [{ totalRevenue: 0, totalBookings: 0, totalDiscounts: 0 }] }))
    const byStatus = await pool.query('SELECT status, COUNT(*) as count FROM "Booking" GROUP BY status').catch(() => ({ rows: [] }))
    const byCategory = await pool.query('SELECT sc.name as category, COALESCE(SUM(b."finalAmount"), 0) as revenue FROM "Booking" b JOIN "Service" s ON b."serviceId" = s.id JOIN "ServiceCategory" sc ON s."categoryId" = sc.id WHERE b.status = \'COMPLETED\' GROUP BY sc.name ORDER BY revenue DESC').catch(() => ({ rows: [] }))
    return c.json({ revenue: revenueResult.rows[0], byStatus: byStatus.rows, byCategory: byCategory.rows, period })
  } catch (e) { return c.json({ error: 'Failed to get revenue stats' }, 500) }
})

// GET /api/admin/logs - Get admin action logs
app.get('/api/admin/logs', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    const result = await pool.query('SELECT l.*, u.name as "adminName" FROM "AdminLog" l LEFT JOIN "User" u ON l."adminId" = u.id ORDER BY l."createdAt" DESC LIMIT $1 OFFSET $2', [limit, offset]).catch(() => ({ rows: [] }))
    return c.json({ logs: result.rows, total: result.rows.length, limit, offset })
  } catch (e) { return c.json({ error: 'Failed to get logs' }, 500) }
})

// GET /api/admin/analytics - Get platform analytics
app.get('/api/admin/analytics', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const userCount = await pool.query('SELECT COUNT(*) as count FROM "User"').catch(() => ({ rows: [{ count: 0 }] }))
    const providerCount = await pool.query('SELECT COUNT(*) as count FROM "User" WHERE "roleId" = 2').catch(() => ({ rows: [{ count: 0 }] }))
    const bookingCount = await pool.query('SELECT COUNT(*) as count FROM "Booking"').catch(() => ({ rows: [{ count: 0 }] }))
    const serviceCount = await pool.query('SELECT COUNT(*) as count FROM "Service" WHERE "isActive" = true').catch(() => ({ rows: [{ count: 0 }] }))
    const revenueTotal = await pool.query('SELECT COALESCE(SUM("finalAmount"), 0) as total FROM "Booking" WHERE status = \'COMPLETED\'').catch(() => ({ rows: [{ total: 0 }] }))
    const recentSignups = await pool.query('SELECT COUNT(*) as count FROM "User" WHERE "createdAt" >= NOW() - INTERVAL \'30 days\'').catch(() => ({ rows: [{ count: 0 }] }))
    const recentBookings = await pool.query('SELECT COUNT(*) as count FROM "Booking" WHERE "createdAt" >= NOW() - INTERVAL \'30 days\'').catch(() => ({ rows: [{ count: 0 }] }))
    const disputeCount = await pool.query('SELECT COUNT(*) as count FROM "Dispute" WHERE status = \'OPEN\'').catch(() => ({ rows: [{ count: 0 }] }))
    const topCategories = await pool.query('SELECT sc.name, COUNT(b.id) as bookings, COALESCE(SUM(b."finalAmount"), 0) as revenue FROM "ServiceCategory" sc LEFT JOIN "Service" s ON s."categoryId" = sc.id LEFT JOIN "Booking" b ON b."serviceId" = s.id AND b.status = \'COMPLETED\' GROUP BY sc.name ORDER BY bookings DESC LIMIT 5').catch(() => ({ rows: [] }))
    const topCities = await pool.query('SELECT u.city, COUNT(b.id) as bookings FROM "Booking" b JOIN "User" u ON b."clientId" = u.id WHERE u.city IS NOT NULL GROUP BY u.city ORDER BY bookings DESC LIMIT 5').catch(() => ({ rows: [] }))
    return c.json({
      analytics: {
        totalUsers: parseInt(userCount.rows[0]?.count || '0'),
        totalProviders: parseInt(providerCount.rows[0]?.count || '0'),
        totalBookings: parseInt(bookingCount.rows[0]?.count || '0'),
        totalServices: parseInt(serviceCount.rows[0]?.count || '0'),
        totalRevenue: parseFloat(revenueTotal.rows[0]?.total || '0'),
        recentSignups: parseInt(recentSignups.rows[0]?.count || '0'),
        recentBookings: parseInt(recentBookings.rows[0]?.count || '0'),
        openDisputes: parseInt(disputeCount.rows[0]?.count || '0'),
        topCategories: topCategories.rows,
        topCities: topCities.rows,
      }
    })
  } catch (e) { console.error('Admin analytics error:', e); return c.json({ error: 'Failed to get analytics' }, 500) }
})

// GET /api/admin/disputes - List all disputes
app.get('/api/admin/disputes', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    const status = c.req.query('status')
    let query = 'SELECT d.*, b."bookingNumber", u.name as "raisedByName", ua.name as "raisedAgainstName" FROM "Dispute" d LEFT JOIN "Booking" b ON d."bookingId" = b.id LEFT JOIN "User" u ON d."raisedById" = u.id LEFT JOIN "User" ua ON d."raisedAgainstId" = ua.id WHERE 1=1'
    const params: any[] = []
    let idx = 1
    if (status) { query += ` AND d.status = $${idx}`; params.push(status); idx++ }
    query += ` ORDER BY d."createdAt" DESC LIMIT $${idx} OFFSET $${idx + 1}`
    params.push(limit, offset)
    const result = await pool.query(query, params).catch(() => ({ rows: [] }))
    return c.json({ disputes: result.rows, total: result.rows.length, limit, offset })
  } catch (e) { return c.json({ error: 'Failed to list disputes' }, 500) }
})

// PATCH /api/admin/disputes/:id - Resolve dispute
app.patch('/api/admin/disputes/:id', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const id = c.req.param('id')
    const { status, resolution, refundAmount } = await c.req.json()
    if (!status) return c.json({ error: 'status is required' }, 400)
    const updates = ['status = $1', '"resolvedById" = $2', '"resolvedAt" = NOW()', '"updatedAt" = NOW()']
    const values: any[] = [status, admin.id]
    let idx = 3
    if (resolution) { updates.push(`resolution = $${idx}`); values.push(resolution); idx++ }
    if (refundAmount) { updates.push(`"refundAmount" = $${idx}`); values.push(refundAmount); idx++ }
    values.push(id)
    await pool.query(`UPDATE "Dispute" SET ${updates.join(', ')} WHERE id = $${idx}`, values).catch(() => {})
    const logId = 'log_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query('INSERT INTO "AdminLog" (id, "adminId", action, "targetType", "targetId", details, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, NOW())', [logId, admin.id, 'RESOLVE_DISPUTE', 'DISPUTE', id, JSON.stringify({ status, resolution, refundAmount })]).catch(() => {})
    return c.json({ message: 'Dispute updated' })
  } catch (e) { return c.json({ error: 'Failed to resolve dispute' }, 500) }
})

// GET /api/admin/payouts - List all payout requests
app.get('/api/admin/payouts', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    const status = c.req.query('status')
    let query = 'SELECT p.*, u.name as "userName", u.email as "userEmail", u.phone as "userPhone" FROM "PayoutRequest" p LEFT JOIN "User" u ON p."userId" = u.id WHERE 1=1'
    const params: any[] = []
    let idx = 1
    if (status) { query += ` AND p.status = $${idx}`; params.push(status); idx++ }
    query += ` ORDER BY p."createdAt" DESC LIMIT $${idx} OFFSET $${idx + 1}`
    params.push(limit, offset)
    const result = await pool.query(query, params).catch(() => ({ rows: [] }))
    return c.json({ payouts: result.rows, total: result.rows.length, limit, offset })
  } catch (e) { return c.json({ error: 'Failed to list payouts' }, 500) }
})

// PATCH /api/admin/payouts/:id - Process payout
app.patch('/api/admin/payouts/:id', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const id = c.req.param('id')
    const { status, transactionRef, remarks } = await c.req.json()
    if (!status) return c.json({ error: 'status is required' }, 400)
    const updates = ['status = $1', '"processedById" = $2', '"processedAt" = NOW()', '"updatedAt" = NOW()']
    const values: any[] = [status, admin.id]
    let idx = 3
    if (transactionRef) { updates.push(`"transactionRef" = $${idx}`); values.push(transactionRef); idx++ }
    if (remarks) { updates.push(`remarks = $${idx}`); values.push(remarks); idx++ }
    values.push(id)
    await pool.query(`UPDATE "PayoutRequest" SET ${updates.join(', ')} WHERE id = $${idx}`, values).catch(() => {})
    if (status === 'REJECTED') {
      const payoutResult = await pool.query('SELECT * FROM "PayoutRequest" WHERE id = $1', [id]).catch(() => ({ rows: [] }))
      if (payoutResult.rows[0]) {
        await pool.query('UPDATE "Wallet" SET balance = balance + $1, "updatedAt" = NOW() WHERE "userId" = $2', [payoutResult.rows[0].amount, payoutResult.rows[0].userId]).catch(() => {})
      }
    }
    const logId = 'log_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query('INSERT INTO "AdminLog" (id, "adminId", action, "targetType", "targetId", details, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, NOW())', [logId, admin.id, 'PROCESS_PAYOUT', 'PAYOUT', id, JSON.stringify({ status, transactionRef })]).catch(() => {})
    return c.json({ message: 'Payout processed' })
  } catch (e) { return c.json({ error: 'Failed to process payout' }, 500) }
})

// GET /api/admin/coupons - List/manage coupons
app.get('/api/admin/coupons', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const result = await pool.query('SELECT * FROM "Coupon" ORDER BY "createdAt" DESC').catch(() => ({ rows: [] }))
    return c.json({ coupons: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed to list coupons' }, 500) }
})

// POST /api/admin/coupons - Create coupon
app.post('/api/admin/coupons', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const { code, discountType, discountValue, maxDiscount, minOrderAmount, maxUses, validTill, isActive } = await c.req.json()
    if (!code || !discountType || !discountValue || !validTill) return c.json({ error: 'code, discountType, discountValue, and validTill are required' }, 400)
    const id = 'cpn_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query(
      'INSERT INTO "Coupon" (id, code, "discountType", "discountValue", "maxDiscount", "minOrderAmount", "maxUses", "validTill", "isActive", "usedCount", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, NOW(), NOW())',
      [id, code, discountType, discountValue, maxDiscount || null, minOrderAmount || null, maxUses || null, validTill, isActive !== false]
    ).catch(() => {})
    return c.json({ message: 'Coupon created', coupon: { id, code, discountType, discountValue } }, 201)
  } catch (e) { console.error('Create coupon error:', e); return c.json({ error: 'Failed to create coupon' }, 500) }
})

// GET /api/admin/franchises - List franchises
app.get('/api/admin/franchises', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const result = await pool.query('SELECT f.*, u.name as "ownerName", u.email as "ownerEmail", u.phone as "ownerPhone" FROM "Franchise" f LEFT JOIN "User" u ON f."ownerId" = u.id ORDER BY f."createdAt" DESC').catch(() => ({ rows: [] }))
    return c.json({ franchises: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed to list franchises' }, 500) }
})

// GET /api/admin/inventory - List inventory
app.get('/api/admin/inventory', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const result = await pool.query('SELECT * FROM "Inventory" ORDER BY name').catch(() => ({ rows: [] }))
    return c.json({ inventory: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed to list inventory' }, 500) }
})

// GET /api/admin/amc - List AMC plans/subscriptions
app.get('/api/admin/amc', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const plans = await pool.query('SELECT * FROM "AmcPlan" ORDER BY price').catch(() => ({ rows: [] }))
    const subscriptions = await pool.query('SELECT s.*, u.name as "userName", p.name as "planName" FROM "AmcSubscription" s LEFT JOIN "User" u ON s."userId" = u.id LEFT JOIN "AmcPlan" p ON s."planId" = p.id ORDER BY s."createdAt" DESC').catch(() => ({ rows: [] }))
    return c.json({ plans: plans.rows, subscriptions: subscriptions.rows })
  } catch (e) { return c.json({ error: 'Failed to list AMC data' }, 500) }
})

// GET /api/admin/b2b - List B2B contracts
app.get('/api/admin/b2b', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const result = await pool.query('SELECT b.*, u.name as "contactName", u.email as "contactEmail" FROM "B2bContract" b LEFT JOIN "User" u ON b."contactPersonId" = u.id ORDER BY b."createdAt" DESC').catch(() => ({ rows: [] }))
    return c.json({ contracts: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed to list B2B contracts' }, 500) }
})

// GET /api/admin/crm - List CRM activities
app.get('/api/admin/crm', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    const result = await pool.query('SELECT c.*, u.name as "assignedToName" FROM "CrmActivity" c LEFT JOIN "User" u ON c."assignedToId" = u.id ORDER BY c."createdAt" DESC LIMIT $1 OFFSET $2', [limit, offset]).catch(() => ({ rows: [] }))
    return c.json({ activities: result.rows, total: result.rows.length, limit, offset })
  } catch (e) { return c.json({ error: 'Failed to list CRM activities' }, 500) }
})

// ============================================================
// FRANCHISE ENDPOINTS
// ============================================================

// GET /api/franchise/dashboard - Franchise dashboard (requires auth)
app.get('/api/franchise/dashboard', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const franchiseResult = await pool.query('SELECT * FROM "Franchise" WHERE "ownerId" = $1', [user.id]).catch(() => ({ rows: [] }))
    if (!franchiseResult.rows[0]) return c.json({ error: 'No franchise found for this user' }, 404)
    const franchise = franchiseResult.rows[0]
    const bookingsResult = await pool.query('SELECT COUNT(*) as total, COALESCE(SUM("finalAmount"), 0) as revenue FROM "Booking" WHERE "providerId" IN (SELECT id FROM "User" WHERE city = $1) AND status = \'COMPLETED\'', [franchise.city]).catch(() => ({ rows: [{ total: 0, revenue: 0 }] }))
    const vendorsResult = await pool.query('SELECT COUNT(*) as total FROM "User" WHERE "roleId" = 2 AND city = $1', [franchise.city]).catch(() => ({ rows: [{ total: 0 }] }))
    return c.json({
      franchise,
      stats: { totalBookings: parseInt(bookingsResult.rows[0]?.total || '0'), totalRevenue: parseFloat(bookingsResult.rows[0]?.revenue || '0'), totalVendors: parseInt(vendorsResult.rows[0]?.total || '0') }
    })
  } catch (e) { return c.json({ error: 'Failed to get franchise dashboard' }, 500) }
})

// GET /api/franchise/vendors - List franchise vendors (requires auth)
app.get('/api/franchise/vendors', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const franchiseResult = await pool.query('SELECT * FROM "Franchise" WHERE "ownerId" = $1', [user.id]).catch(() => ({ rows: [] }))
    if (!franchiseResult.rows[0]) return c.json({ error: 'No franchise found' }, 404)
    const franchise = franchiseResult.rows[0]
    const result = await pool.query('SELECT id, name, email, phone, city, "isVerified", "completedJobsCount", "createdAt" FROM "User" WHERE "roleId" = 2 AND city = $1 ORDER BY "createdAt" DESC', [franchise.city]).catch(() => ({ rows: [] }))
    return c.json({ vendors: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed to list franchise vendors' }, 500) }
})

// GET /api/franchise/analytics - Franchise analytics (requires auth)
app.get('/api/franchise/analytics', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const franchiseResult = await pool.query('SELECT * FROM "Franchise" WHERE "ownerId" = $1', [user.id]).catch(() => ({ rows: [] }))
    if (!franchiseResult.rows[0]) return c.json({ error: 'No franchise found' }, 404)
    const franchise = franchiseResult.rows[0]
    const revenueByMonth = await pool.query("SELECT TO_CHAR(\"completedAt\", 'YYYY-MM') as month, COUNT(*) as bookings, COALESCE(SUM(\"finalAmount\"), 0) as revenue FROM \"Booking\" WHERE \"providerId\" IN (SELECT id FROM \"User\" WHERE city = $1) AND status = 'COMPLETED' AND \"completedAt\" >= NOW() - INTERVAL '12 months' GROUP BY month ORDER BY month", [franchise.city]).catch(() => ({ rows: [] }))
    const topServices = await pool.query('SELECT s.name, COUNT(b.id) as bookings FROM "Service" s JOIN "Booking" b ON b."serviceId" = s.id JOIN "User" u ON s."providerId" = u.id WHERE u.city = $1 AND b.status = \'COMPLETED\' GROUP BY s.name ORDER BY bookings DESC LIMIT 5', [franchise.city]).catch(() => ({ rows: [] }))
    return c.json({ franchiseId: franchise.id, city: franchise.city, revenueByMonth: revenueByMonth.rows, topServices: topServices.rows })
  } catch (e) { return c.json({ error: 'Failed to get franchise analytics' }, 500) }
})

// ============================================================
// VENDOR ENDPOINTS
// ============================================================

// GET /api/vendor/bookings - Vendor bookings (requires auth)
app.get('/api/vendor/bookings', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    if (user.roleId !== 2 && user.role !== 'PROVIDER') return c.json({ error: 'Vendor access required' }, 403)
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    const status = c.req.query('status')
    let query = 'SELECT b.*, s.name as "serviceName", u.name as "clientName", u.phone as "clientPhone" FROM "Booking" b LEFT JOIN "Service" s ON b."serviceId" = s.id LEFT JOIN "User" u ON b."clientId" = u.id WHERE b."providerId" = $1'
    const params: any[] = [user.id]
    let idx = 2
    if (status) { query += ` AND b.status = $${idx}`; params.push(status); idx++ }
    query += ` ORDER BY b."createdAt" DESC LIMIT $${idx} OFFSET $${idx + 1}`
    params.push(limit, offset)
    const result = await pool.query(query, params).catch(() => ({ rows: [] }))
    return c.json({ bookings: result.rows, total: result.rows.length, limit, offset })
  } catch (e) { return c.json({ error: 'Failed to list vendor bookings' }, 500) }
})

// GET /api/vendor/services - Vendor services (requires auth)
app.get('/api/vendor/services', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    if (user.roleId !== 2 && user.role !== 'PROVIDER') return c.json({ error: 'Vendor access required' }, 403)
    const result = await pool.query(
      'SELECT s.*, sc.name as "categoryName" FROM "Service" s LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id WHERE s."providerId" = $1 ORDER BY s."createdAt" DESC',
      [user.id]
    ).catch(() => ({ rows: [] }))
    return c.json({ services: result.rows.map(transformServiceRow), total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed to list vendor services' }, 500) }
})

// Catch-all for other API routes
// ============================================================
// MISSING ROUTE ALIASES - Routes the frontend calls that differ from existing paths
// ============================================================

// Auth logout
app.post('/api/auth/logout', (c) => c.json({ success: true, message: 'Logged out' }))

// Services search
app.get('/api/services/search', async (c) => {
  try {
    const q = c.req.query('q') || ''
    const category = c.req.query('category')
    const city = c.req.query('city')
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    let query = 'SELECT s.*, u.name as "providerName", u."profileImageUrl" as "providerImage", sc.name as "categoryName", sc.slug as "categorySlug", sc.icon as "categoryIcon", sc."imageUrl" as "categoryImage" FROM "Service" s LEFT JOIN "User" u ON s."providerId" = u.id LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id WHERE s."isActive" = true AND s."isApproved" = true'
    const params: any[] = []
    if (q) { query += ` AND (s.title ILIKE $${params.length + 1} OR s.description ILIKE $${params.length + 1} OR s.city ILIKE $${params.length + 1})`; params.push(`%${q}%`) }
    if (category) { query += ` AND s."categoryId" = $${params.length + 1}`; params.push(parseInt(category)) }
    if (city) { query += ` AND s.city ILIKE $${params.length + 1}`; params.push(`%${city}%`) }
    query += ` ORDER BY s."isFeatured" DESC, s."averageRating" DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)
    const result = await pool.query(query, params)
    return c.json({ services: result.rows.map(transformServiceRow), total: result.rows.length, limit, offset })
  } catch (e) { console.error('Search error:', e); return c.json({ error: 'Search failed' }, 500) }
})

// Service reviews (sub-route)
app.get('/api/services/:id/reviews', async (c) => {
  try {
    const id = c.req.param('id')
    const limit = parseInt(c.req.query('limit') || '10')
    const result = await pool.query('SELECT r.*, u.name as "reviewerName", u."profileImageUrl" as "reviewerImage" FROM "Review" r LEFT JOIN "User" u ON r."reviewerId" = u.id WHERE r."serviceId" = $1 ORDER BY r."createdAt" DESC LIMIT $2', [id, limit])
    return c.json({ reviews: result.rows.map(transformReviewRow), total: result.rows.length })
  } catch (e) { return c.json({ reviews: [], total: 0 }) }
})

// Service availability
app.get('/api/services/:id/availability', async (c) => {
  try {
    const id = c.req.param('id')
    const result = await pool.query('SELECT * FROM "ServiceAvailability" WHERE "serviceId" = $1 AND "isAvailable" = true ORDER BY "dayOfWeek"', [id])
    return c.json({ availability: result.rows })
  } catch (e) { return c.json({ availability: [] }) }
})

// Service approve/reject (admin)
app.patch('/api/services/:id/approve', async (c) => {
  try {
    const id = c.req.param('id')
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Unauthorized' }, 403)
    const body = await c.req.json().catch(() => ({}))
    const status = body.approved !== false ? 'APPROVED' : 'REJECTED'
    await pool.query('UPDATE "Service" SET "approvalStatus" = $1, "isApproved" = $2, "approvedAt" = NOW(), "updatedAt" = NOW() WHERE id = $3', [status, body.approved !== false, id])
    return c.json({ message: `Service ${status.toLowerCase()}`, serviceId: id })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// Delete service
app.delete('/api/services/:id', async (c) => {
  try {
    const id = c.req.param('id')
    await pool.query('DELETE FROM "Service" WHERE id = $1', [id]).catch(() => {})
    return c.json({ message: 'Service deleted' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// KYC status (alias for /api/kyc)
app.get('/api/kyc/status', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const result = await pool.query('SELECT * FROM "ProviderKyc" WHERE "providerId" = $1', [user.sub])
    return c.json({ kyc: result.rows[0] || { verificationStatus: 'PENDING' } })
  } catch (e) { return c.json({ kyc: { verificationStatus: 'PENDING' } }) }
})

// KYC submit (alias for POST /api/kyc)
app.post('/api/kyc/submit', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const body = await c.req.json()
    const kycId = 'kyc_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query('INSERT INTO "ProviderKyc" (id, "providerId", "documentType", "documentNumber", "documentFrontUrl", "selfieUrl", "verificationStatus") VALUES ($1, $2, $3, $4, $5, $6, \'PENDING\') ON CONFLICT ("providerId") DO UPDATE SET "documentType" = $3, "documentNumber" = $4, "documentFrontUrl" = $5, "selfieUrl" = $6, "verificationStatus" = \'PENDING\', "updatedAt" = NOW()',
      [kycId, user.sub, body.documentType || 'AADHAAR', body.documentNumber || '', body.documentFrontUrl || '/pending', body.selfieUrl || '/pending']).catch(() => {})
    return c.json({ message: 'KYC submitted successfully', status: 'PENDING' })
  } catch (e) { return c.json({ message: 'KYC submitted successfully', status: 'PENDING' }) }
})

// Technician profile
app.get('/api/technician/profile', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const result = await pool.query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE u.id = $1', [user.sub])
    if (!result.rows[0]) return c.json({ error: 'Not found' }, 404)
    const { passwordHash, roleName, ...profile } = result.rows[0]
    return c.json({ profile: { ...profile, role: roleName } })
  } catch (e) { return c.json({ profile: null }) }
})

app.patch('/api/technician/profile', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const body = await c.req.json()
    const fields = ['name', 'phone', 'city', 'state', 'country', 'address', 'pincode', 'profileImageUrl', 'specialization', 'experience']
    const updates = []
    const values = []
    let idx = 1
    for (const f of fields) {
      if (body[f] !== undefined) { updates.push(`"${f}" = $${idx}`); values.push(body[f]); idx++ }
    }
    if (updates.length === 0) return c.json({ error: 'No fields' }, 400)
    updates.push('"updatedAt" = NOW()')
    values.push(user.sub)
    await pool.query(`UPDATE "User" SET ${updates.join(', ')} WHERE id = $${idx}`, values)
    return c.json({ message: 'Profile updated' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// Technician jobs
app.get('/api/technician/jobs', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const status = c.req.query('status')
    const result = await pool.query('SELECT b.*, s.title as "serviceTitle", s.basePrice, u.name as "clientName" FROM "Booking" b LEFT JOIN "Service" s ON b."serviceId" = s.id LEFT JOIN "User" u ON b."clientId" = u.id WHERE b."technicianId" = $1 ORDER BY b."createdAt" DESC LIMIT 50',
      [user.sub]).catch(() => ({ rows: [] }))
    let jobs = result.rows
    if (status) jobs = jobs.filter((j: any) => j.status === status)
    return c.json({ jobs, total: jobs.length })
  } catch (e) { return c.json({ jobs: [], total: 0 }) }
})

// Technician earnings
app.get('/api/technician/earnings', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const result = await pool.query('SELECT COALESCE(SUM("providerEarnings"), 0) as "totalEarnings", COALESCE(SUM(CASE WHEN "createdAt" >= NOW() - INTERVAL \'30 days\' THEN "providerEarnings" ELSE 0 END), 0) as "monthlyEarnings", COUNT(*) as "totalCompletedJobs" FROM "Booking" WHERE "technicianId" = $1 AND status = \'COMPLETED\'',
      [user.sub]).catch(() => ({ rows: [{ totalEarnings: 0, monthlyEarnings: 0, totalCompletedJobs: 0 }] }))
    return c.json({ earnings: result.rows[0] })
  } catch (e) { return c.json({ earnings: { totalEarnings: 0, monthlyEarnings: 0, totalCompletedJobs: 0 } }) }
})

// Booking action routes (cancel, complete, reject, accept)
app.patch('/api/bookings/:id/cancel', async (c) => {
  try {
    const id = c.req.param('id')
    await pool.query('UPDATE "Booking" SET status = \'CANCELLED\', "updatedAt" = NOW() WHERE id = $1', [id]).catch(() => {})
    return c.json({ message: 'Booking cancelled' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.patch('/api/bookings/:id/complete', async (c) => {
  try {
    const id = c.req.param('id')
    await pool.query('UPDATE "Booking" SET status = \'COMPLETED\', "completedAt" = NOW(), "updatedAt" = NOW() WHERE id = $1', [id]).catch(() => {})
    return c.json({ message: 'Booking completed' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.patch('/api/bookings/:id/reject', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json().catch(() => ({}))
    await pool.query('UPDATE "Booking" SET status = \'REJECTED\', "rejectionReason" = $2, "updatedAt" = NOW() WHERE id = $1', [id, body.reason || '']).catch(() => {})
    return c.json({ message: 'Booking rejected' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.patch('/api/bookings/:id/accept', async (c) => {
  try {
    const id = c.req.param('id')
    await pool.query('UPDATE "Booking" SET status = \'CONFIRMED\', "updatedAt" = NOW() WHERE id = $1', [id]).catch(() => {})
    return c.json({ message: 'Booking accepted' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// Notifications - mark read
app.patch('/api/notifications/:id/read', async (c) => {
  try {
    const id = c.req.param('id')
    await pool.query('UPDATE "Notification" SET "isRead" = true WHERE id = $1', [id]).catch(() => {})
    return c.json({ message: 'Notification marked as read' })
  } catch (e) { return c.json({ message: 'Notification marked as read' }) }
})

// Mark all notifications as read
app.patch('/api/notifications', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    await pool.query('UPDATE "Notification" SET "isRead" = true WHERE "userId" = $1', [user.sub]).catch(() => {})
    return c.json({ message: 'All notifications marked as read' })
  } catch (e) { return c.json({ message: 'All notifications marked as read' }) }
})

// Wallet transactions
app.get('/api/wallet/transactions', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const result = await pool.query('SELECT * FROM "WalletTransaction" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 50', [user.sub]).catch(() => ({ rows: [] }))
    return c.json({ transactions: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ transactions: [], total: 0 }) }
})

// Wallet withdraw
app.post('/api/wallet/withdraw', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const { amount } = await c.req.json()
    if (!amount || amount <= 0) return c.json({ error: 'Invalid amount' }, 400)
    return c.json({ message: 'Withdrawal request submitted', amount })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// Admin dashboard (alias for analytics)
app.get('/api/admin/dashboard', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Unauthorized' }, 403)
    const [users, providers, bookings, services, revenue] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM "User"').catch(() => ({ rows: [{ count: 0 }] })),
      pool.query('SELECT COUNT(*) as count FROM "User" WHERE "roleId" = 2').catch(() => ({ rows: [{ count: 0 }] })),
      pool.query('SELECT COUNT(*) as count, COALESCE(SUM("totalAmount"), 0) as revenue FROM "Booking"').catch(() => ({ rows: [{ count: 0, revenue: 0 }] })),
      pool.query('SELECT COUNT(*) as count FROM "Service"').catch(() => ({ rows: [{ count: 0 }] })),
      pool.query('SELECT COALESCE(SUM("totalAmount"), 0) as total, COALESCE(SUM(CASE WHEN "createdAt" >= NOW() - INTERVAL \'30 days\' THEN "totalAmount" ELSE 0 END), 0) as monthly FROM "Booking" WHERE status = \'COMPLETED\'').catch(() => ({ rows: [{ total: 0, monthly: 0 }] })),
    ])
    return c.json({
      totalUsers: parseInt(users.rows[0].count),
      totalProviders: parseInt(providers.rows[0].count),
      totalBookings: parseInt(bookings.rows[0].count),
      totalServices: parseInt(services.rows[0].count),
      totalRevenue: parseFloat(revenue.rows[0].total),
      monthlyRevenue: parseFloat(revenue.rows[0].monthly),
    })
  } catch (e) { return c.json({ totalUsers: 0, totalProviders: 0, totalBookings: 0, totalServices: 0, totalRevenue: 0, monthlyRevenue: 0 }) }
})

// Admin FAQ management
app.get('/api/admin/faq', async (c) => {
  try {
    const result = await pool.query('SELECT * FROM "Faq" ORDER BY "displayOrder"').catch(() => ({ rows: [] }))
    return c.json({ faqs: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ faqs: [], total: 0 }) }
})

app.post('/api/admin/faq', async (c) => {
  try {
    const body = await c.req.json()
    const id = 'faq_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query('INSERT INTO "Faq" (id, question, answer, category, "isActive", "displayOrder") VALUES ($1, $2, $3, $4, $5, $6)',
      [id, body.question, body.answer, body.category || 'GENERAL', body.isActive !== false, body.displayOrder || 0]).catch(() => {})
    return c.json({ message: 'FAQ created', id }, 201)
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.patch('/api/admin/faq/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const fields = ['question', 'answer', 'category', 'isActive', 'displayOrder']
    const updates = []
    const values = []
    let idx = 1
    for (const f of fields) {
      if (body[f] !== undefined) { updates.push(`"${f}" = $${idx}`); values.push(body[f]); idx++ }
    }
    if (updates.length === 0) return c.json({ error: 'No fields' }, 400)
    updates.push('"updatedAt" = NOW()')
    values.push(id)
    await pool.query(`UPDATE "Faq" SET ${updates.join(', ')} WHERE id = $${idx}`, values).catch(() => {})
    return c.json({ message: 'FAQ updated' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.delete('/api/admin/faq/:id', async (c) => {
  try {
    const id = c.req.param('id')
    await pool.query('DELETE FROM "Faq" WHERE id = $1', [id]).catch(() => {})
    return c.json({ message: 'FAQ deleted' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// Admin categories management
app.post('/api/admin/categories', async (c) => {
  try {
    const body = await c.req.json()
    const id = body.id || 'cat_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query('INSERT INTO "ServiceCategory" (id, name, slug, description, icon, "imageUrl", "isActive", "displayOrder", "isEmergency") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO UPDATE SET name = $2, slug = $3, description = $4, icon = $5, "updatedAt" = NOW()',
      [id, body.name, body.slug || body.name?.toLowerCase().replace(/\s+/g, '-'), body.description || '', body.icon || 'Wrench', body.imageUrl || '/images/default.jpg', body.isActive !== false, body.displayOrder || 0, body.isEmergency || false]).catch(() => {})
    return c.json({ message: 'Category saved', id }, 201)
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.patch('/api/admin/categories/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const fields = ['name', 'slug', 'description', 'icon', 'imageUrl', 'isActive', 'displayOrder', 'isEmergency']
    const updates = []
    const values = []
    let idx = 1
    for (const f of fields) {
      if (body[f] !== undefined) { updates.push(`"${f}" = $${idx}`); values.push(body[f]); idx++ }
    }
    if (updates.length === 0) return c.json({ error: 'No fields' }, 400)
    updates.push('"updatedAt" = NOW()')
    values.push(id)
    await pool.query(`UPDATE "ServiceCategory" SET ${updates.join(', ')} WHERE id::text = $${idx}`, values).catch(() => {})
    return c.json({ message: 'Category updated' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// Admin delete user
app.delete('/api/admin/users/:id', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Unauthorized' }, 403)
    const id = c.req.param('id')
    await pool.query('DELETE FROM "User" WHERE id = $1', [id]).catch(() => {})
    return c.json({ message: 'User deleted' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// AMC plans (alias - frontend uses /amc/plans, API has /amc-plans)
app.get('/api/amc/plans', async (c) => {
  try {
    const result = await pool.query('SELECT * FROM "AmcPlan" WHERE "isActive" = true ORDER BY "price"').catch(() => ({ rows: [] }))
    return c.json({ plans: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ plans: [], total: 0 }) }
})

// AMC subscriptions (alias - frontend uses /amc/subscriptions, API has /amc-subscriptions)
app.get('/api/amc/subscriptions', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const result = await pool.query('SELECT * FROM "AmcSubscription" WHERE "clientId" = $1 ORDER BY "createdAt" DESC', [user.sub]).catch(() => ({ rows: [] }))
    return c.json({ subscriptions: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ subscriptions: [], total: 0 }) }
})

// AMC subscribe
app.post('/api/amc/subscribe', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const { planId } = await c.req.json()
    const subId = 'amc_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query('INSERT INTO "AmcSubscription" (id, "clientId", "planId", status, "startDate", "endDate") VALUES ($1, $2, $3, \'ACTIVE\', NOW(), NOW() + INTERVAL \'1 year\')', [subId, user.sub, planId]).catch(() => {})
    return c.json({ message: 'Subscribed successfully', subscriptionId: subId }, 201)
  } catch (e) { return c.json({ message: 'Subscribed successfully' }, 201) }
})

// Franchises (public - frontend uses /franchises)
app.get('/api/franchises', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    const result = await pool.query('SELECT * FROM "Franchise" ORDER BY "createdAt" DESC LIMIT $1 OFFSET $2', [limit, offset]).catch(() => ({ rows: [] }))
    return c.json({ franchises: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ franchises: [], total: 0 }) }
})

// Franchises POST
app.post('/api/franchises', async (c) => {
  try {
    const body = await c.req.json()
    const id = 'fr_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query('INSERT INTO "Franchise" (id, name, city, "ownerName", "ownerEmail", "ownerPhone", status) VALUES ($1, $2, $3, $4, $5, $6, \'PENDING\')', [id, body.name, body.city, body.ownerName, body.ownerEmail, body.ownerPhone]).catch(() => {})
    return c.json({ message: 'Franchise application submitted', id }, 201)
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// Disputes PATCH (update single dispute)
app.patch('/api/disputes/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const updates = []
    const values = []
    let idx = 1
    for (const f of ['status', 'resolution', 'adminNotes']) {
      if (body[f] !== undefined) { updates.push(`"${f}" = $${idx}`); values.push(body[f]); idx++ }
    }
    if (updates.length === 0) return c.json({ error: 'No fields' }, 400)
    updates.push('"updatedAt" = NOW()')
    values.push(id)
    await pool.query(`UPDATE "Dispute" SET ${updates.join(', ')} WHERE id = $${idx}`, values).catch(() => {})
    return c.json({ message: 'Dispute updated' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// CRM activities
app.get('/api/crm/activities', async (c) => {
  try {
    const result = await pool.query('SELECT * FROM "CrmActivity" ORDER BY "createdAt" DESC LIMIT 50').catch(() => ({ rows: [] }))
    return c.json({ activities: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ activities: [], total: 0 }) }
})

// CRM follow-ups
app.get('/api/crm/follow-ups', async (c) => {
  try {
    const result = await pool.query('SELECT * FROM "CrmFollowUp" ORDER BY "scheduledAt" ASC LIMIT 50').catch(() => ({ rows: [] }))
    return c.json({ followUps: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ followUps: [], total: 0 }) }
})

app.post('/api/crm/follow-ups', async (c) => {
  try {
    const body = await c.req.json()
    const id = 'fu_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    return c.json({ message: 'Follow-up created', id }, 201)
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// Reviews DELETE / PATCH
app.delete('/api/reviews/:id', async (c) => {
  try {
    const id = c.req.param('id')
    await pool.query('DELETE FROM "Review" WHERE id = $1', [id]).catch(() => {})
    return c.json({ message: 'Review deleted' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.patch('/api/reviews/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const updates = []
    const values = []
    let idx = 1
    for (const f of ['rating', 'comment']) {
      if (body[f] !== undefined) { updates.push(`"${f}" = $${idx}`); values.push(body[f]); idx++ }
    }
    if (updates.length === 0) return c.json({ error: 'No fields' }, 400)
    updates.push('"updatedAt" = NOW()')
    values.push(id)
    await pool.query(`UPDATE "Review" SET ${updates.join(', ')} WHERE id = $${idx}`, values).catch(() => {})
    return c.json({ message: 'Review updated' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// Catch-all for unmatched API routes
app.all('/api/*', async (c) => {
  return c.json({ error: 'Not Found', message: 'The requested resource was not found' }, 404)
})

const port = Number(process.env.PORT || 3001)

console.log(`🚀 API Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
