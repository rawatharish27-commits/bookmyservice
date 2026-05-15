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

// Catch-all for other API routes
app.all('/api/*', async (c) => {
  return c.json({ error: 'Not Found', message: 'The requested resource was not found' }, 404)
})

const port = 3001
console.log(`🚀 API Server is running on http://localhost:${port}`)
serve({ fetch: app.fetch, port })
