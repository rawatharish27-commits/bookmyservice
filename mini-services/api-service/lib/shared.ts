/**
 * Shared Module for BookMyService API
 * 
 * Centralizes shared state, database pool, JWT config, auth helpers,
 * and utility functions used across all route modules.
 * 
 * This module enables:
 * 1. Future route modularization (each route file imports from here)
 * 2. JWT_SECRET fail-hard in production (no silent fallback)
 * 3. Database initialization separate from route definitions
 * 4. Shared utility access without circular dependencies
 */

import { Pool } from 'pg'
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'

// ═══════════════════════════════════════════════════════════════════════
// DATABASE POOL
// ═══════════════════════════════════════════════════════════════════════

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
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
// INDIAN CITIES DATA
// ═══════════════════════════════════════════════════════════════════════

export const INDIAN_CITIES = [
  { city: 'Mumbai', state: 'Maharashtra', lat: 19.076, lng: 72.8777, pincodes: ['400001', '400002', '400010', '400020', '400030', '400050', '400051', '400053', '400058', '400060', '400064', '400070', '400076', '400078', '400080', '400083', '400089', '400093', '400095', '400098', '400100', '400101', '400102', '400104', '400612', '400614', '400708'] },
  { city: 'Delhi', state: 'Delhi', lat: 28.7041, lng: 77.1025, pincodes: ['110001', '110002', '110003', '110004', '110005', '110006', '110007', '110008', '110009', '110010', '110011', '110012', '110015', '110016', '110017', '110018', '110019', '110020', '110021', '110022', '110023', '110024', '110025', '110026', '110027', '110028', '110029', '110030', '110031', '110032', '110033', '110034', '110035', '110036', '110037', '110040', '110041', '110042', '110043', '110044', '110045', '110046', '110047', '110048', '110049', '110050', '110051', '110052', '110053', '110054', '110055', '110056', '110057', '110058', '110059', '110060', '110061', '110062', '110063', '110064', '110065', '110066', '110067', '110068', '110069', '110070', '110071', '110072', '110073', '110074', '110075', '110076', '110077', '110078', '110080', '110081', '110082', '110083', '110084', '110085', '110086', '110087', '110088', '110089', '110090', '110091', '110092', '110093', '110094', '110095', '110096', '110097'] },
  { city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946, pincodes: ['560001', '560002', '560003', '560004', '560005', '560006', '560007', '560008', '560009', '560010', '560011', '560012', '560013', '560014', '560015', '560016', '560017', '560018', '560019', '560020', '560021', '560022', '560023', '560024', '560025', '560026', '560027', '560028', '560029', '560030', '560031', '560032', '560033', '560034', '560035', '560036', '560037', '560038', '560039', '560040', '560041', '560042', '560043', '560044', '560045', '560046', '560047', '560048', '560049', '560050', '560051', '560052', '560053', '560054', '560055', '560056', '560057', '560058', '560059', '560060', '560061', '560062', '560063', '560064', '560065', '560066', '560067', '560068', '560069', '560070', '560071', '560072', '560073', '560074', '560075', '560076', '560078', '560079', '560080', '560081', '560082', '560083', '560084', '560085', '560086', '560087', '560088', '560089', '560090', '560091', '560092', '560093', '560094', '560095', '560096', '560097', '560098', '560099', '560100', '560103', '560104', '560105'] },
  { city: 'Hyderabad', state: 'Telangana', lat: 17.385, lng: 78.4867, pincodes: ['500001', '500002', '500003', '500004', '500005', '500006', '500007', '500008', '500009', '500010', '500011', '500012', '500013', '500014', '500015', '500016', '500017', '500018', '500020', '500022', '500023', '500024', '500025', '500026', '500027', '500028', '500029', '500030', '500031', '500032', '500033', '500034', '500035', '500036', '500037', '500038', '500039', '500040', '500042', '500044', '500045', '500046', '500047', '500048', '500049', '500050', '500051', '500052', '500053', '500054', '500055', '500056', '500057', '500058', '500059', '500060', '500061', '500062', '500063', '500064', '500065', '500066', '500067', '500068', '500069', '500070', '500072', '500073', '500074', '500075', '500076', '500077', '500078', '500079', '500080', '500081', '500082', '500083', '500084', '500085', '500086', '500087', '500088', '500089', '500090', '500091', '500092', '500093', '500094', '500095', '500096', '500097', '500098', '500099', '500100', '500101', '500102', '500103', '500104'] },
  { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, pincodes: ['600001', '600002', '600003', '600004', '600005', '600006', '600007', '600008', '600009', '600010', '600011', '600012', '600013', '600014', '600015', '600016', '600017', '600018', '600019', '600020', '600021', '600022', '600023', '600024', '600025', '600026', '600027', '600028', '600029', '600040', '600041', '600042', '600050', '600051', '600052', '600053', '600054', '600055', '600056', '600057', '600058', '600059', '600060', '600061', '600062', '600063', '600064', '600065', '600066', '600067', '600068', '600069', '600070', '600071', '600072', '600073', '600074', '600075', '600076', '600077', '600078', '600079', '600080', '600081', '600082', '600083', '600084', '600085', '600086', '600087', '600088', '600089', '600090', '600091', '600092', '600093', '600094', '600095', '600096', '600097', '600098', '600099', '600100', '600101', '600102', '600103', '600104', '600105', '600106', '600107', '600108', '600109', '600110', '600111', '600112', '600113', '600114', '600115', '600116', '600117'] },
]

// ═══════════════════════════════════════════════════════════════════════
// CRASH PROTECTION
// ═══════════════════════════════════════════════════════════════════════

process.on('uncaughtException', (err) => {
  console.error('⚠️  Uncaught Exception (non-fatal):', err.message || err)
})

process.on('unhandledRejection', (reason) => {
  console.error('⚠️  Unhandled Rejection (non-fatal):', reason)
})
