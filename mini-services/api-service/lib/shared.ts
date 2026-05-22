/**
 * Shared Module for BookMyService API
 *
 * SINGLE SOURCE OF TRUTH for all shared state, database pool, JWT config,
 * auth helpers, geo helpers, and utility functions used across all route modules.
 *
 * This module enables:
 * 1. Route modularization (each route file imports from here)
 * 2. JWT_SECRET fail-hard in production (no silent fallback)
 * 3. Database initialization separate from route definitions
 * 4. Shared utility access without circular dependencies
 * 5. Smart SSL configuration for hosted PostgreSQL (Supabase, Render, etc.)
 * 6. Geo helpers for reverse geocoding and city lookups
 */

import { Pool } from 'pg'
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'

// ═══════════════════════════════════════════════════════════════════════
// SSL FIX FOR HOSTED POSTGRESQL (Supabase, Render, etc.)
// ═══════════════════════════════════════════════════════════════════════
// Newer pg (v8.20+) / pg-connection-string treat sslmode=require as verify-full,
// which fails with self-signed certs. Force sslmode=no-verify for compatibility.
// This MUST run before pool creation.

if (process.env.DATABASE_URL) {
  // Remove any existing sslmode param (require, verify-full, etc.) and replace with no-verify
  let url = process.env.DATABASE_URL.replace(/[?&]sslmode=[^&]*/gi, '')
  const separator = url.includes('?') ? '&' : '?'
  process.env.DATABASE_URL = url + `${separator}sslmode=no-verify`
}

// ═══════════════════════════════════════════════════════════════════════
// DATABASE POOL (smarter SSL config)
// ═══════════════════════════════════════════════════════════════════════
// Supabase / Render PostgreSQL requires SSL. Use sslmode=no-verify for
// hosted databases with self-signed certs (Supabase pooler, etc.).

function getPoolSSLConfig(): boolean | { rejectUnauthorized: boolean } {
  const dbUrl = process.env.DATABASE_URL || ''
  // If sslmode is explicitly set in the URL, respect it
  if (dbUrl.includes('sslmode=')) return false // let the URL param handle it
  // Default: enable SSL with relaxed verification for hosted databases
  return { rejectUnauthorized: false }
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: getPoolSSLConfig(),
  max: 3,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

// Prevent idle client errors from crashing the process
pool.on('error', (err) => {
  console.error('⚠️  Idle pool client error:', err.message)
})

// ═══════════════════════════════════════════════════════════════════════
// JWT SECRET — FAIL HARD IN PRODUCTION
// ═══════════════════════════════════════════════════════════════════════
// If JWT_SECRET is not set in production, the server MUST NOT start.
// Using a fallback secret in production is a critical security risk.

const DEV_FALLBACK = 'bys-dev-secret-key-change-in-production-2024'

function resolveJWTSecret(): string {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'FATAL: JWT_SECRET environment variable is required in production. ' +
      'The server cannot start without a secure JWT secret. ' +
      'Set JWT_SECRET in your environment and restart.'
    )
  }
  console.warn('⚠️  JWT_SECRET not set — using development fallback. DO NOT use in production!')
  return DEV_FALLBACK
}

export const JWT_SECRET = resolveJWTSecret()

// ═══════════════════════════════════════════════════════════════════════
// TOKEN BLACKLIST (in-memory, cleared every 20 minutes)
// ═══════════════════════════════════════════════════════════════════════

export const tokenBlacklist = new Set<string>()

// Cleanup expired blacklist entries periodically (tokens are 15min, keep for 20min)
setInterval(() => { tokenBlacklist.clear() }, 20 * 60 * 1000)

// ═══════════════════════════════════════════════════════════════════════
// RATE LIMITING
// ═══════════════════════════════════════════════════════════════════════

export const RATE_LIMIT_WINDOW = 60_000 // 1 minute
export const RATE_LIMIT_MAX = 20 // 20 requests per window

export const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(ip)
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }
  entry.count++
  return entry.count <= RATE_LIMIT_MAX
}

// Clean up expired rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of rateLimitStore) {
    if (now > entry.resetTime) rateLimitStore.delete(ip)
  }
}, 5 * 60_000)

// ═══════════════════════════════════════════════════════════════════════
// INPUT VALIDATION
// ═══════════════════════════════════════════════════════════════════════

export const INPUT_LIMITS: Record<string, number> = {
  email: 254,
  phone: 15,
  name: 100,
  password: 128,
}

export function validateInputLengths(body: Record<string, any>): string | null {
  for (const [field, maxLength] of Object.entries(INPUT_LIMITS)) {
    if (body[field] !== undefined && String(body[field]).length > maxLength) {
      return `${field} exceeds maximum length of ${maxLength} characters`
    }
  }
  return null
}

// ═══════════════════════════════════════════════════════════════════════
// COOKIE HELPERS
// ═══════════════════════════════════════════════════════════════════════

export function getCookie(c: any, name: string): string | undefined {
  const cookieHeader = c.req.header('cookie') || ''
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : undefined
}

export function setCookie(c: any, name: string, value: string, options: {
  httpOnly?: boolean
  secure?: boolean
  sameSite?: string
  path?: string
  maxAge?: number
}) {
  const parts = [`${name}=${encodeURIComponent(value)}`]
  if (options.httpOnly) parts.push('HttpOnly')
  if (options.secure) parts.push('Secure')
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`)
  if (options.path) parts.push(`Path=${options.path}`)
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`)
  c.header('Set-Cookie', parts.join('; '), { append: true })
}

// ═══════════════════════════════════════════════════════════════════════
// AUTH HELPERS
// ═══════════════════════════════════════════════════════════════════════

export async function createAuthSession(
  c: any,
  userId: string,
  roleName: string,
  roleId: number,
  email?: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const secret = new TextEncoder().encode(JWT_SECRET)
  const accessToken = await new SignJWT({ sub: userId, email: email || '', role: roleName, roleId })
    .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('15m')
    .setIssuer('bookyourservice').setAudience('bookyourservice').sign(secret)

  const refreshToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
  const rtId = 'rt_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || c.req.header('x-real-ip') || null
  const userAgent = c.req.header('user-agent')?.slice(0, 200) || null

  await pool.query(
    'INSERT INTO "RefreshToken" (id, token, "userId", "expiresAt", "ipAddress", "deviceInfo", "createdAt") VALUES ($1, $2, $3, NOW() + INTERVAL \'7 days\', $4, $5, NOW())',
    [rtId, refreshToken, userId, ip, userAgent]
  )

  // Set refresh token as HttpOnly cookie
  setCookie(c, 'bys_refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  })

  return { accessToken, refreshToken }
}

export async function getAuthUser(c: any): Promise<{ id: string; email: string; role: string; roleId: number } | null> {
  try {
    const authHeader = c.req.header('authorization')
    if (!authHeader?.startsWith('Bearer ')) return null
    const token = authHeader.split(' ')[1]
    // Check token blacklist
    if (tokenBlacklist.has(token)) return null
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret, { issuer: 'bookyourservice', audience: 'bookyourservice' })
    return { id: payload.sub as string, email: payload.email as string, role: payload.role as string, roleId: payload.roleId as number }
  } catch (e) { return null }
}

export async function requireAdmin(c: any): Promise<{ id: string; email: string; role: string; roleId: number } | null> {
  const user = await getAuthUser(c)
  if (!user) return null
  if (user.roleId !== 3 && user.roleId !== 7 && user.role !== 'ADMIN' && user.role !== 'SUB_ADMIN') return null
  return user
}

// ═══════════════════════════════════════════════════════════════════════
// DATA TRANSFORMERS
// ═══════════════════════════════════════════════════════════════════════

export function transformServiceRow(row: Record<string, any>) {
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

export function transformReviewRow(row: Record<string, any>) {
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

// ═══════════════════════════════════════════════════════════════════════
// DATABASE INITIALIZATION (strict migrations only)
// ═══════════════════════════════════════════════════════════════════════
// Only creates tables that don't have migration support yet.
// In production, use Prisma migrations for schema changes.

export async function initializeDatabase(): Promise<void> {
  console.log('🔧 Initializing database tables...')

  // RefreshToken table (needed for auth flow)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "RefreshToken" (
      id TEXT PRIMARY KEY,
      token TEXT UNIQUE NOT NULL,
      "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      "expiresAt" TIMESTAMP NOT NULL,
      "revokedAt" TIMESTAMP,
      "isRevoked" BOOLEAN DEFAULT false,
      "deviceInfo" TEXT,
      "ipAddress" TEXT,
      "createdAt" TIMESTAMP DEFAULT NOW()
    )
  `).then(() => console.log('✅ RefreshToken table ready')).catch(e => console.warn('⚠️ RefreshToken table creation skipped:', e.message))

  // Create indexes for RefreshToken
  await pool.query('CREATE INDEX IF NOT EXISTS "RefreshToken_userId_idx" ON "RefreshToken"("userId")').catch(() => {})
  await pool.query('CREATE INDEX IF NOT EXISTS "RefreshToken_token_idx" ON "RefreshToken"(token)').catch(() => {})
  await pool.query('CREATE INDEX IF NOT EXISTS "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt")').catch(() => {})

  // Payment table (needed for payment flow)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "Payment" (
      id TEXT PRIMARY KEY,
      "bookingId" TEXT REFERENCES "Booking"(id) ON DELETE SET NULL,
      "razorpayOrderId" TEXT,
      "razorpayPaymentId" TEXT,
      "razorpaySignature" TEXT,
      amount DECIMAL(10,2) NOT NULL,
      currency TEXT DEFAULT 'INR',
      status TEXT DEFAULT 'PENDING',
      method TEXT,
      "providerId" TEXT REFERENCES "User"(id) ON DELETE SET NULL,
      "platformFee" DECIMAL(10,2) DEFAULT 0,
      "gstAmount" DECIMAL(10,2) DEFAULT 0,
      "netAmount" DECIMAL(10,2) DEFAULT 0,
      "refundId" TEXT,
      "refundAmount" DECIMAL(10,2),
      "refundStatus" TEXT,
      metadata JSONB,
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    )
  `).then(() => console.log('✅ Payment table ready')).catch(e => console.warn('⚠️ Payment table creation skipped:', e.message))

  // Create indexes for Payment
  await pool.query('CREATE INDEX IF NOT EXISTS "Payment_bookingId_idx" ON "Payment"("bookingId")').catch(() => {})
  await pool.query('CREATE INDEX IF NOT EXISTS "Payment_providerId_idx" ON "Payment"("providerId")').catch(() => {})
  await pool.query('CREATE INDEX IF NOT EXISTS "Payment_status_idx" ON "Payment"(status)').catch(() => {})

  // Clean up expired refresh tokens every hour
  setInterval(async () => {
    try {
      await pool.query('DELETE FROM "RefreshToken" WHERE "expiresAt" < NOW() OR ("isRevoked" = true AND "revokedAt" < NOW() - INTERVAL \'1 day\')')
    } catch (e) { /* ignore */ }
  }, 60 * 60 * 1000)

  console.log('🔧 Database initialization complete')
}

// ═══════════════════════════════════════════════════════════════════════
// INDIAN CITIES DATA (full 20-city version)
// ═══════════════════════════════════════════════════════════════════════

export const INDIAN_CITIES = [
  { city: 'Mumbai', state: 'Maharashtra', lat: 19.076, lng: 72.8777, pincodes: ['400001', '400002', '400010', '400020', '400030', '400050', '400051', '400053', '400058', '400060', '400064', '400070', '400076', '400078', '400080', '400083', '400089', '400093', '400095', '400098', '400100', '400101', '400102', '400104', '400612', '400614', '400708'] },
  { city: 'Delhi', state: 'Delhi', lat: 28.7041, lng: 77.1025, pincodes: ['110001', '110002', '110003', '110004', '110005', '110006', '110007', '110008', '110009', '110010', '110011', '110012', '110015', '110016', '110017', '110018', '110019', '110020', '110021', '110022', '110023', '110024', '110025', '110026', '110027', '110028', '110029', '110030', '110031', '110032', '110033', '110034', '110035', '110036', '110037', '110040', '110041', '110042', '110043', '110044', '110045', '110046', '110047', '110048', '110049', '110050', '110051', '110052', '110053', '110054', '110055', '110056', '110057', '110058', '110059', '110060', '110061', '110062', '110063', '110064', '110065', '110066', '110067', '110068', '110069', '110070', '110071', '110072', '110073', '110074', '110075', '110076', '110077', '110078', '110080', '110081', '110082', '110083', '110084', '110085', '110086', '110087', '110088', '110089', '110090', '110091', '110092', '110093', '110094', '110095', '110096', '110097'] },
  { city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946, pincodes: ['560001', '560002', '560003', '560004', '560005', '560006', '560007', '560008', '560009', '560010', '560011', '560012', '560013', '560014', '560015', '560016', '560017', '560018', '560019', '560020', '560021', '560022', '560023', '560024', '560025', '560026', '560027', '560028', '560029', '560030', '560031', '560032', '560033', '560034', '560035', '560036', '560037', '560038', '560039', '560040', '560041', '560042', '560043', '560044', '560045', '560046', '560047', '560048', '560049', '560050', '560051', '560052', '560053', '560054', '560055', '560056', '560057', '560058', '560059', '560060', '560061', '560062', '560063', '560064', '560065', '560066', '560067', '560068', '560069', '560070', '560071', '560072', '560073', '560074', '560075', '560076', '560078', '560079', '560080', '560081', '560082', '560083', '560084', '560085', '560086', '560087', '560088', '560089', '560090', '560091', '560092', '560093', '560094', '560095', '560096', '560097', '560098', '560099', '560100', '560103', '560104', '560105'] },
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

// ═══════════════════════════════════════════════════════════════════════
// GEO HELPERS
// ═══════════════════════════════════════════════════════════════════════

/**
 * Calculate the haversine distance between two lat/lng points (in km).
 */
export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
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

/**
 * Find the closest city by coordinates.
 * Returns null if the nearest city is more than 100km away.
 */
export function findCityByCoords(lat: number, lng: number): typeof INDIAN_CITIES[number] | null {
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
  return minDist < 100 ? closest : null
}

/**
 * Find a city by exact name match (case-insensitive).
 */
export function findCityByName(cityName: string): typeof INDIAN_CITIES[number] | null {
  const lower = cityName.toLowerCase().trim()
  return INDIAN_CITIES.find(c => c.city.toLowerCase() === lower) || null
}

/**
 * Find a city by matching a pincode against its pincode list.
 */
export function findCityByPincode(pincode: string): typeof INDIAN_CITIES[number] | null {
  return INDIAN_CITIES.find(c => c.pincodes.includes(pincode.trim())) || null
}

// ═══════════════════════════════════════════════════════════════════════
// LEGAL PAGE TYPE MAP
// ═══════════════════════════════════════════════════════════════════════

export const LEGAL_TYPE_MAP: Record<string, string> = {
  'TERMS': 'TERMS', 'PRIVACY': 'PRIVACY', 'REFUND': 'REFUND',
  'COOKIES': 'COOKIES', 'AUP': 'AUP', 'PROVIDER_AGREEMENT': 'PROVIDER_AGREEMENT',
  'COMMUNITY_GUIDELINES': 'COMMUNITY_GUIDELINES',
  'terms': 'TERMS', 'privacy': 'PRIVACY', 'refund-policy': 'REFUND',
  'cookies': 'COOKIES', 'aup': 'AUP', 'provider-agreement': 'PROVIDER_AGREEMENT',
  'community-guidelines': 'COMMUNITY_GUIDELINES',
}

// ═══════════════════════════════════════════════════════════════════════
// CRASH PROTECTION
// ═══════════════════════════════════════════════════════════════════════

process.on('uncaughtException', (err) => {
  console.error('⚠️  Uncaught Exception (non-fatal):', err.message || err)
})

process.on('unhandledRejection', (reason) => {
  console.error('⚠️  Unhandled Rejection (non-fatal):', reason)
})
