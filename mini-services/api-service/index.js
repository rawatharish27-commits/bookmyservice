const { serve } = require('@hono/node-server')
const { Hono } = require('hono')
const { cors } = require('hono/cors')
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')
const { SignJWT, jwtVerify } = require('jose')

const DB_URL = (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql')) 
  ? process.env.DATABASE_URL 
  : 'postgresql://postgres.oblhyxdjwrqtdycvnoky:x6fpra3VPHUwsoqn@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres'
const pool = new Pool({
  connectionString: DB_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'bys-dev-secret-key-change-in-production-2024')
const ISSUER = 'bookyourservice'
const AUDIENCE = 'bookyourservice'

// Helper functions
async function createToken(user) {
  return new SignJWT({ sub: user.id, email: user.email, role: user.roleName || user.role, roleId: user.roleId })
    .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d')
    .setIssuer(ISSUER).setAudience(AUDIENCE).sign(JWT_SECRET)
}

async function getUser(c) {
  const authHeader = c.req.header('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  try {
    const { payload } = await jwtVerify(authHeader.split(' ')[1], JWT_SECRET, { issuer: ISSUER, audience: AUDIENCE })
    const result = await pool.query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE u.id = $1', [payload.sub])
    return result.rows[0] || null
  } catch { return null }
}

function safeUser(user) {
  if (!user) return null
  const { passwordHash, roleName, ...rest } = user
  return { ...rest, role: roleName || user.role }
}

function genId(prefix = 'id') { return prefix + '_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20) }

function genBookingNumber() { return 'BYS' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase() }

function genInvoiceNumber() { return 'INV' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase() }

function genOTP() { return Math.floor(1000 + Math.random() * 9000).toString() }

// Haversine distance in km
function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const app = new Hono()

app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
}))

// ============================================================================
// HEALTH CHECK
// ============================================================================
app.get('/health', (c) => c.json({ status: 'ok', version: '2.0.0', timestamp: new Date().toISOString() }))

// ============================================================================
// AUTH ROUTES
// ============================================================================
app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json()
    if (!email || !password) return c.json({ error: 'Email and password are required' }, 400)
    const result = await pool.query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE LOWER(u.email) = LOWER($1)', [String(email).toLowerCase().trim()])
    if (!result.rows[0]) return c.json({ error: 'Invalid email or password' }, 401)
    const user = result.rows[0]
    const isValid = await bcrypt.compare(String(password), user.passwordHash)
    if (!isValid) return c.json({ error: 'Invalid email or password' }, 401)
    if (user.status !== 'ACTIVE') return c.json({ error: 'Account is ' + user.status.toLowerCase() }, 403)
    await pool.query('UPDATE "User" SET "lastLoginAt" = NOW() WHERE id = $1', [user.id])
    // Create wallet if not exists
    await pool.query('INSERT INTO "Wallet" (id, "userId") VALUES ($1, $2) ON CONFLICT ("userId") DO NOTHING', [genId('wlt'), user.id])
    const token = await createToken(user)
    return c.json({ message: 'Login successful', user: safeUser(user), accessToken: token })
  } catch (e) { console.error('Login error:', e); return c.json({ error: 'Login failed' }, 500) }
})

app.post('/api/auth/register', async (c) => {
  try {
    const { email, phone, name, password, roleId } = await c.req.json()
    if (!email || !phone || !name || !password || !roleId) return c.json({ error: 'All fields required' }, 400)
    const sanitizedEmail = String(email).toLowerCase().trim()
    const sanitizedPhone = String(phone).trim()
    const sanitizedName = String(name).trim()
    const validRoleId = Number(roleId)
    if (!sanitizedEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return c.json({ error: 'Invalid email' }, 400)
    if (!sanitizedPhone.match(/^[6-9]\d{9}$/)) return c.json({ error: 'Invalid phone' }, 400)
    if (sanitizedName.length < 2) return c.json({ error: 'Name too short' }, 400)
    if (String(password).length < 8) return c.json({ error: 'Password must be at least 8 characters' }, 400)
    if (![1, 2, 3, 4, 5, 6, 7, 8].includes(validRoleId)) return c.json({ error: 'Invalid role' }, 400)
    const existing = await pool.query('SELECT id FROM "User" WHERE LOWER(email) = LOWER($1)', [sanitizedEmail])
    if (existing.rows.length > 0) return c.json({ error: 'Email already registered' }, 409)
    const existingPhone = await pool.query('SELECT id FROM "User" WHERE phone = $1', [sanitizedPhone])
    if (existingPhone.rows.length > 0) return c.json({ error: 'Phone already registered' }, 409)
    const passwordHash = await bcrypt.hash(String(password), 10)
    const userId = genId('usr')
    const referralCode = sanitizedName.substring(0, 3).toUpperCase() + Math.random().toString(36).substring(2, 8).toUpperCase()
    await pool.query('INSERT INTO "User" (id, email, phone, "passwordHash", name, "roleId", status, "emailVerified", "phoneVerified", "referralCode") VALUES ($1, $2, $3, $4, $5, $6, \'ACTIVE\', false, false, $7)', [userId, sanitizedEmail, sanitizedPhone, passwordHash, sanitizedName, validRoleId, referralCode])
    // Create wallet
    await pool.query('INSERT INTO "Wallet" (id, "userId") VALUES ($1, $2) ON CONFLICT ("userId") DO NOTHING', [genId('wlt'), userId])
    // For PROVIDER/TECHNICIAN/VENDOR, create KYC placeholder
    if ([2, 4, 5].includes(validRoleId)) {
      await pool.query('INSERT INTO "ProviderKyc" (id, "providerId", "documentType", "documentNumber", "documentFrontUrl", "selfieUrl", "verificationStatus") VALUES ($1, $2, \'PENDING\', \'PENDING\', \'/pending\', \'/pending\', \'PENDING\')', [genId('kyc'), userId]).catch(() => {})
    }
    // For TECHNICIAN, create technician profile
    if (validRoleId === 4) {
      await pool.query('INSERT INTO "TechnicianProfile" (id, "userId", skills) VALUES ($1, $2, \'[]\')', [genId('tech'), userId]).catch(() => {})
    }
    const userResult = await pool.query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE u.id = $1', [userId])
    const user = userResult.rows[0]
    const token = await createToken(user)
    // Handle referral
    const { referralCode: usedReferral } = await c.req.json()
    if (usedReferral) {
      const referrer = await pool.query('SELECT id FROM "User" WHERE "referralCode" = $1', [usedReferral])
      if (referrer.rows[0]) {
        await pool.query('INSERT INTO "Referral" (id, "referrerId", "refereeId", "referrerReward", "refereeReward") VALUES ($1, $2, $3, 50, 50)', [genId('ref'), referrer.rows[0].id, userId])
        await pool.query('UPDATE "User" SET "referredBy" = $1 WHERE id = $2', [referrer.rows[0].id, userId])
      }
    }
    return c.json({ message: 'Registration successful', user: safeUser(user), accessToken: token }, 201)
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
    const passwordHash = await bcrypt.hash(String(newPassword), 10)
    await pool.query('UPDATE "User" SET "passwordHash" = $1, "updatedAt" = NOW() WHERE LOWER(email) = LOWER($2)', [passwordHash, String(email).toLowerCase().trim()])
    return c.json({ message: 'Password has been reset successfully' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.post('/api/auth/change-password', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const { currentPassword, newPassword } = await c.req.json()
    if (!currentPassword || !newPassword) return c.json({ error: 'Current and new password required' }, 400)
    const isValid = await bcrypt.compare(String(currentPassword), user.passwordHash)
    if (!isValid) return c.json({ error: 'Current password is incorrect' }, 401)
    if (newPassword.length < 8) return c.json({ error: 'New password must be at least 8 characters' }, 400)
    const newHash = await bcrypt.hash(String(newPassword), 10)
    await pool.query('UPDATE "User" SET "passwordHash" = $1, "updatedAt" = NOW() WHERE id = $2', [newHash, user.id])
    return c.json({ message: 'Password changed successfully' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.get('/api/auth/profile', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const profile = safeUser(user)
    // Add KYC status for providers
    if ([2, 4, 5].includes(user.roleId)) {
      const kyc = await pool.query('SELECT "verificationStatus" FROM "ProviderKyc" WHERE "providerId" = $1', [user.id])
      profile.kycStatus = kyc.rows[0]?.verificationStatus || null
    }
    // Add technician profile
    if (user.roleId === 4) {
      const tech = await pool.query('SELECT * FROM "TechnicianProfile" WHERE "userId" = $1', [user.id])
      profile.technicianProfile = tech.rows[0] || null
    }
    // Add wallet balance
    const wallet = await pool.query('SELECT balance, "cashbackBalance", "promoBalance" FROM "Wallet" WHERE "userId" = $1', [user.id])
    profile.walletBalance = wallet.rows[0]?.balance || 0
    return c.json({ user: profile })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.patch('/api/auth/profile', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const body = await c.req.json()
    const fields = ['name', 'phone', 'city', 'state', 'country', 'address', 'pincode', 'profileImageUrl', 'latitude', 'longitude']
    const updates = []
    const values = []
    let idx = 1
    for (const f of fields) {
      if (body[f] !== undefined) { updates.push(`"${f}" = $${idx}`); values.push(body[f]); idx++ }
    }
    if (updates.length === 0) return c.json({ error: 'No fields to update' }, 400)
    updates.push('"updatedAt" = NOW()')
    values.push(user.id)
    await pool.query(`UPDATE "User" SET ${updates.join(', ')} WHERE id = $${idx}`, values)
    const result = await pool.query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE u.id = $1', [user.id])
    return c.json({ message: 'Profile updated', user: safeUser(result.rows[0]) })
  } catch (e) { console.error(e); return c.json({ error: 'Failed' }, 500) }
})

// ============================================================================
// CATEGORIES
// ============================================================================
app.get('/api/categories', async (c) => {
  try {
    const result = await pool.query('SELECT * FROM "ServiceCategory" WHERE "isActive" = true ORDER BY "displayOrder"')
    return c.json({ categories: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.get('/api/categories/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const result = await pool.query('SELECT * FROM "ServiceCategory" WHERE id = $1 OR slug = $1', [id])
    if (!result.rows[0]) return c.json({ error: 'Not found' }, 404)
    // Get subcategories
    const subs = await pool.query('SELECT * FROM "ServiceSubcategory" WHERE "categoryId" = $1 AND "isActive" = true ORDER BY "displayOrder"', [result.rows[0].id])
    // Get pricing rules
    const pricing = await pool.query('SELECT * FROM "PricingRule" WHERE "categoryId" = $1 AND "isActive" = true ORDER BY priority', [result.rows[0].id])
    // Get AMC plans
    const amc = await pool.query('SELECT * FROM "AMCPlan" WHERE "categoryId" = $1 AND "isActive" = true ORDER BY "displayOrder"', [result.rows[0].id])
    return c.json({ ...result.rows[0], subcategories: subs.rows, pricingRules: pricing.rows, amcPlans: amc.rows })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// ============================================================================
// SERVICES
// ============================================================================
app.get('/api/services', async (c) => {
  try {
    const category = c.req.query('category')
    const city = c.req.query('city')
    const search = c.req.query('search')
    const emergency = c.req.query('emergency')
    let query = 'SELECT s.*, u.name as "providerName", u.phone as "providerPhone", u."averageRating" as "providerRating", c.name as "categoryName", c.slug as "categorySlug" FROM "Service" s JOIN "User" u ON s."providerId" = u.id JOIN "ServiceCategory" c ON s."categoryId" = c.id WHERE s."isActive" = true AND s."isApproved" = true'
    const params = []
    let idx = 1
    if (category) { query += ` AND (c.slug = $${idx} OR c.id::text = $${idx})`; params.push(category); idx++ }
    if (city) { query += ` AND (s.city ILIKE $${idx} OR u.city ILIKE $${idx})`; params.push(`%${city}%`); idx++ }
    if (search) { query += ` AND (s.title ILIKE $${idx} OR s.description ILIKE $${idx})`; params.push(`%${search}%`); idx++ }
    if (emergency === 'true') { query += ' AND s."isEmergencyAvailable" = true' }
    query += ' ORDER BY s."isFeatured" DESC, s."averageRating" DESC LIMIT 50'
    const result = await pool.query(query, params)
    return c.json({ services: result.rows, total: result.rows.length })
  } catch (e) { console.error(e); return c.json({ error: 'Failed' }, 500) }
})

app.get('/api/services/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const result = await pool.query('SELECT s.*, u.name as "providerName", u.phone as "providerPhone", u."profileImageUrl" as "providerImage", u."averageRating" as "providerRating", u."completedJobsCount", u."verifiedBadge", c.name as "categoryName" FROM "Service" s JOIN "User" u ON s."providerId" = u.id JOIN "ServiceCategory" c ON s."categoryId" = c.id WHERE s.id = $1', [id])
    if (!result.rows[0]) return c.json({ error: 'Not found' }, 404)
    const service = result.rows[0]
    // Get availability
    const avail = await pool.query('SELECT * FROM "ServiceAvailability" WHERE "serviceId" = $1 AND "isAvailable" = true ORDER BY "dayOfWeek"', [id])
    service.availability = avail.rows
    // Get service areas
    const areas = await pool.query('SELECT * FROM "ServiceArea" WHERE "serviceId" = $1 AND "isActive" = true', [id])
    service.serviceAreas = areas.rows
    // Get reviews
    const reviews = await pool.query('SELECT r.*, u.name as "reviewerName", u."profileImageUrl" as "reviewerImage" FROM "Review" r JOIN "User" u ON r."reviewerId" = u.id WHERE r."serviceId" = $1 ORDER BY r."createdAt" DESC LIMIT 10', [id])
    service.reviews = reviews.rows
    return c.json(service)
  } catch (e) { console.error(e); return c.json({ error: 'Failed' }, 500) }
})

app.post('/api/services', async (c) => {
  try {
    const user = await getUser(c)
    if (!user || ![2, 4, 5].includes(user.roleId)) return c.json({ error: 'Only providers/technicians/vendors can create services' }, 403)
    const body = await c.req.json()
    const id = genId('svc')
    await pool.query(`INSERT INTO "Service" (id, "providerId", "categoryId", "subcategoryId", title, description, "basePrice", "priceNegotiable", "serviceDurationMinutes", "serviceAreaRadiusKm", latitude, longitude, address, city, state, country, pincode, images, "isEmergencyAvailable", "isActive", "isApproved", "approvalStatus") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,false,'PENDING')`,
      [id, user.id, body.categoryId, body.subcategoryId || null, body.title, body.description, body.basePrice, body.priceNegotiable || false, body.serviceDurationMinutes || null, body.serviceAreaRadiusKm || 10, body.latitude || null, body.longitude || null, body.address || null, body.city || null, body.state || null, body.country || 'India', body.pincode || null, body.images ? JSON.stringify(body.images) : null, body.isEmergencyAvailable || false])
    return c.json({ message: 'Service created, pending approval', service: { id } }, 201)
  } catch (e) { console.error(e); return c.json({ error: 'Failed' }, 500) }
})

app.get('/api/services/search', async (c) => {
  try {
    const q = c.req.query('q') || ''
    const lat = parseFloat(c.req.query('lat') || '0')
    const lng = parseFloat(c.req.query('lng') || '0')
    const result = await pool.query('SELECT s.*, u.name as "providerName", c.name as "categoryName" FROM "Service" s JOIN "User" u ON s."providerId" = u.id JOIN "ServiceCategory" c ON s."categoryId" = c.id WHERE s."isActive" = true AND s."isApproved" = true AND (s.title ILIKE $1 OR s.description ILIKE $1 OR c.name ILIKE $1) ORDER BY s."averageRating" DESC LIMIT 20', [`%${q}%`])
    return c.json({ services: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// ============================================================================
// BOOKINGS - Complete with Auto Assignment, Tracking, OTP
// ============================================================================
app.post('/api/bookings', async (c) => {
  const client_conn = await pool.connect()
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    if (user.roleId !== 1 && user.roleId !== 6) return c.json({ error: 'Only clients can book services' }, 403)
    const body = await c.req.json()
    await client_conn.query('BEGIN')
    // Get service details
    const svcResult = await client_conn.query('SELECT s.*, u.name as "providerName", u.phone as "providerPhone", u.id as "providerUserId" FROM "Service" s JOIN "User" u ON s."providerId" = u.id WHERE s.id = $1 AND s."isActive" = true', [body.serviceId])
    if (!svcResult.rows[0]) { await client_conn.query('ROLLBACK'); return c.json({ error: 'Service not found' }, 404) }
    const svc = svcResult.rows[0]
    // Calculate dynamic pricing
    let emergencyCharge = 0, weekendCharge = 0, distanceCharge = 0, timeSlotCharge = 0
    const bookingType = body.bookingType || 'NORMAL'
    if (bookingType === 'EMERGENCY') {
      const emRule = await client_conn.query('SELECT * FROM "PricingRule" WHERE "categoryId" = $1 AND "ruleType" = \'EMERGENCY\' AND "isActive" = true LIMIT 1', [svc.categoryId])
      if (emRule.rows[0]) emergencyCharge = emRule.rows[0].chargeType === 'PERCENTAGE' ? svc.basePrice * emRule.rows[0].chargeValue / 100 : emRule.rows[0].chargeValue
    }
    // Weekend check
    const schedDate = new Date(body.scheduledDate)
    if (schedDate.getDay() === 0 || schedDate.getDay() === 6) {
      const wkRule = await client_conn.query('SELECT * FROM "PricingRule" WHERE "categoryId" = $1 AND "ruleType" = \'WEEKEND\' AND "isActive" = true LIMIT 1', [svc.categoryId])
      if (wkRule.rows[0]) weekendCharge = wkRule.rows[0].chargeType === 'PERCENTAGE' ? svc.basePrice * wkRule.rows[0].chargeValue / 100 : wkRule.rows[0].chargeValue
    }
    // Distance charge
    if (body.latitude && body.longitude && svc.latitude && svc.longitude) {
      const dist = distanceKm(body.latitude, body.longitude, svc.latitude, svc.longitude)
      if (dist > svc.serviceAreaRadiusKm) {
        distanceCharge = Math.ceil(dist - svc.serviceAreaRadiusKm) * 10
      }
    }
    // Coupon discount
    let couponDiscount = 0
    let couponId = null
    if (body.couponCode) {
      const coupon = await client_conn.query('SELECT * FROM "Coupon" WHERE code = $1 AND "isActive" = true AND "validFrom" <= NOW() AND "validTo" >= NOW()', [body.couponCode])
      if (coupon.rows[0]) {
        const cpn = coupon.rows[0]
        if (cpn.usageLimit === null || cpn.usageCount < cpn.usageLimit) {
          const userUsage = await client_conn.query('SELECT COUNT(*) as cnt FROM "CouponUsage" WHERE "couponId" = $1 AND "userId" = $2', [cpn.id, user.id])
          if (parseInt(userUsage.rows[0].cnt) < cpn.perUserLimit) {
            couponDiscount = cpn.discountType === 'PERCENTAGE' ? Math.min(svc.basePrice * cpn.discountValue / 100, cpn.maxDiscount || Infinity) : cpn.discountValue
            couponId = cpn.id
            couponDiscount = Math.min(couponDiscount, svc.basePrice)
          }
        }
      }
    }
    const platformFee = Math.max(5, svc.basePrice * 0.05)
    const basePrice = svc.basePrice
    const finalPrice = basePrice + emergencyCharge + weekendCharge + distanceCharge + timeSlotCharge + platformFee - couponDiscount
    const bookingNumber = genBookingNumber()
    const otpCode = genOTP()
    const bookingId = genId('bkg')
    // Auto-assign nearest technician
    let technicianId = null
    if (body.latitude && body.longitude) {
      const nearestTech = await client_conn.query(`SELECT tp."userId", tp."currentLocationLat", tp."currentLocationLng", tp.skills FROM "TechnicianProfile" tp JOIN "User" u ON tp."userId" = u.id WHERE tp."isAvailable" = true AND u.status = 'ACTIVE' ORDER BY tp."averageRating" DESC LIMIT 10`)
      for (const tech of nearestTech.rows) {
        const techSkills = JSON.parse(tech.skills || '[]')
        if (tech.currentLocationLat && tech.currentLocationLng) {
          const dist = distanceKm(body.latitude, body.longitude, tech.currentLocationLat, tech.currentLocationLng)
          if (dist <= 30 && (techSkills.length === 0 || techSkills.includes(String(svc.categoryId)))) {
            technicianId = tech.userId
            break
          }
        }
      }
    }
    // Insert booking
    await client_conn.query(`INSERT INTO "Booking" (id, "bookingNumber", "clientId", "providerId", "technicianId", "serviceId", status, "bookingType", "scheduledDate", "scheduledTime", "serviceAddress", "serviceCity", "servicePincode", "serviceLatitude", "serviceLongitude", "distanceKm", "basePrice", "emergencyCharge", "weekendCharge", "distanceCharge", "timeSlotCharge", "finalPrice", "platformFee", "providerEarnings", "specialInstructions", "otpCode", "contactShared", "couponId", "couponDiscount", "warrantyDays", "warrantyExpiresAt", "paymentStatus") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32)`,
      [bookingId, bookingNumber, user.id, svc.providerUserId, technicianId, body.serviceId, technicianId ? 'ASSIGNED' : 'PENDING', bookingType, body.scheduledDate, body.scheduledTime, body.serviceAddress || body.address, body.city || null, body.pincode || null, body.latitude || null, body.longitude || null, null, basePrice, emergencyCharge, weekendCharge, distanceCharge, timeSlotCharge, finalPrice, platformFee, finalPrice - platformFee - emergencyCharge, body.specialInstructions || null, otpCode, false, couponId, couponDiscount, 7, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'PENDING'])
    // Update coupon usage
    if (couponId) {
      await client_conn.query('UPDATE "Coupon" SET "usageCount" = "usageCount" + 1 WHERE id = $1', [couponId])
      await client_conn.query('INSERT INTO "CouponUsage" (id, "couponId", "userId", "bookingId", "discountApplied") VALUES ($1, $2, $3, $4, $5)', [genId('cpu'), couponId, user.id, bookingId, couponDiscount])
    }
    // Create timeline entry
    await client_conn.query('INSERT INTO "BookingTimeline" (id, "bookingId", status, description, "performedBy") VALUES ($1, $2, $3, $4, $5)',
      [genId('tl'), bookingId, technicianId ? 'ASSIGNED' : 'PENDING', technicianId ? 'Technician auto-assigned' : 'Booking created, awaiting assignment', user.id])
    // Create payment record
    await client_conn.query('INSERT INTO "Payment" (id, "bookingId", amount, status, "escrowStatus") VALUES ($1, $2, $3, $4, $5)',
      [genId('pay'), bookingId, finalPrice, 'CREATED', 'HELD'])
    // Create notifications
    await client_conn.query('INSERT INTO "Notification" (id, "userId", type, channel, title, message, "actionUrl") VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [genId('ntf'), user.id, 'BOOKING', 'IN_APP', 'Booking Created', `Your booking #${bookingNumber} has been created`, `/bookings/${bookingId}`])
    if (technicianId) {
      await client_conn.query('INSERT INTO "Notification" (id, "userId", type, channel, title, message, "actionUrl") VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [genId('ntf'), technicianId, 'BOOKING', 'IN_APP', 'New Job Assigned', `You have a new booking #${bookingNumber}`, `/bookings/${bookingId}`])
    }
    await client_conn.query('COMMIT')
    return c.json({ message: 'Booking created', booking: { id: bookingId, bookingNumber, otpCode, status: technicianId ? 'ASSIGNED' : 'PENDING', finalPrice, technicianAssigned: !!technicianId } }, 201)
  } catch (e) { await client_conn.query('ROLLBACK'); console.error('Booking error:', e); return c.json({ error: 'Booking failed: ' + e.message }, 500) } finally { client_conn.release() }
})

app.get('/api/bookings', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const status = c.req.query('status')
    let query, params
    if (user.roleId === 1) { // Client
      query = 'SELECT b.*, s.title as "serviceTitle", s."basePrice", u.name as "providerName", u.phone as "providerPhone", u."profileImageUrl" as "providerImage", c.name as "categoryName" FROM "Booking" b JOIN "Service" s ON b."serviceId" = s.id JOIN "User" u ON b."providerId" = u.id JOIN "ServiceCategory" c ON s."categoryId" = c.id WHERE b."clientId" = $1'
      params = [user.id]
    } else if (user.roleId === 4) { // Technician
      query = 'SELECT b.*, s.title as "serviceTitle", s."basePrice", u.name as "clientName", u.phone as "clientPhone", u."profileImageUrl" as "clientImage", c.name as "categoryName" FROM "Booking" b JOIN "Service" s ON b."serviceId" = s.id JOIN "User" u ON b."clientId" = u.id JOIN "ServiceCategory" c ON s."categoryId" = c.id WHERE b."technicianId" = $1 OR b."providerId" = $1'
      params = [user.id]
    } else if ([2, 5].includes(user.roleId)) { // Provider/Vendor
      query = 'SELECT b.*, s.title as "serviceTitle", s."basePrice", u.name as "clientName", u.phone as "clientPhone", u."profileImageUrl" as "clientImage", c.name as "categoryName" FROM "Booking" b JOIN "Service" s ON b."serviceId" = s.id JOIN "User" u ON b."clientId" = u.id JOIN "ServiceCategory" c ON s."categoryId" = c.id WHERE b."providerId" = $1'
      params = [user.id]
    } else { // Admin
      query = 'SELECT b.*, s.title as "serviceTitle", u.name as "clientName", u2.name as "providerName", c.name as "categoryName" FROM "Booking" b JOIN "Service" s ON b."serviceId" = s.id JOIN "User" u ON b."clientId" = u.id JOIN "User" u2 ON b."providerId" = u2.id JOIN "ServiceCategory" c ON s."categoryId" = c.id WHERE 1=1'
      params = []
    }
    let idx = params.length + 1
    if (status) { query += ` AND b.status = $${idx}`; params.push(status); idx++ }
    query += ' ORDER BY b."createdAt" DESC LIMIT 50'
    const result = await pool.query(query, params)
    // Contact sharing: only show phone if booking accepted and contact shared
    for (const booking of result.rows) {
      if (!['ACCEPTED', 'ASSIGNED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'].includes(booking.status)) {
        if (user.roleId === 1) { delete booking.clientPhone; delete booking.providerPhone }
      }
    }
    return c.json({ bookings: result.rows, total: result.rows.length })
  } catch (e) { console.error(e); return c.json({ error: 'Failed' }, 500) }
})

app.get('/api/bookings/:id', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const id = c.req.param('id')
    const result = await pool.query('SELECT b.*, s.title as "serviceTitle", s.description as "serviceDescription", s."basePrice", s."images" as "serviceImages", c.name as "categoryName", c.slug as "categorySlug" FROM "Booking" b JOIN "Service" s ON b."serviceId" = s.id JOIN "ServiceCategory" c ON s."categoryId" = c.id WHERE b.id = $1', [id])
    if (!result.rows[0]) return c.json({ error: 'Not found' }, 404)
    const booking = result.rows[0]
    // Get client details
    const clientResult = await pool.query('SELECT id, name, phone, email, "profileImageUrl", city FROM "User" WHERE id = $1', [booking.clientId])
    booking.client = clientResult.rows[0] || {}
    // Get provider details
    const providerResult = await pool.query('SELECT id, name, phone, email, "profileImageUrl", city, "verifiedBadge", "completedJobsCount" FROM "User" WHERE id = $1', [booking.providerId])
    booking.provider = providerResult.rows[0] || {}
    // Get technician details
    if (booking.technicianId) {
      const techResult = await pool.query('SELECT id, name, phone, email, "profileImageUrl", "verifiedBadge" FROM "User" WHERE id = $1', [booking.technicianId])
      booking.technician = techResult.rows[0] || null
    }
    // Contact sharing logic
    if (['ACCEPTED', 'ASSIGNED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'].includes(booking.status)) {
      await pool.query('UPDATE "Booking" SET "contactShared" = true WHERE id = $1', [id])
      booking.contactShared = true
    } else {
      // Hide phone numbers
      if (booking.client) booking.client.phone = undefined
      if (booking.provider) booking.provider.phone = undefined
      if (booking.technician) booking.technician.phone = undefined
    }
    // Get timeline
    const timeline = await pool.query('SELECT * FROM "BookingTimeline" WHERE "bookingId" = $1 ORDER BY "createdAt" ASC', [id])
    booking.timeline = timeline.rows
    // Get payment
    const payment = await pool.query('SELECT * FROM "Payment" WHERE "bookingId" = $1', [id])
    booking.payment = payment.rows[0] || null
    // Get invoice
    const invoice = await pool.query('SELECT * FROM "Invoice" WHERE "bookingId" = $1', [id])
    booking.invoice = invoice.rows[0] || null
    return c.json(booking)
  } catch (e) { console.error(e); return c.json({ error: 'Failed' }, 500) }
})

// Booking status transitions
app.patch('/api/bookings/:id/accept', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const id = c.req.param('id')
    const booking = await pool.query('SELECT * FROM "Booking" WHERE id = $1', [id])
    if (!booking.rows[0]) return c.json({ error: 'Not found' }, 404)
    if (![booking.rows[0].providerId, booking.rows[0].technicianId].includes(user.id)) return c.json({ error: 'Not authorized' }, 403)
    await pool.query('UPDATE "Booking" SET status = \'ACCEPTED\', "acceptedAt" = NOW(), "contactShared" = true, "updatedAt" = NOW() WHERE id = $1', [id])
    await pool.query('INSERT INTO "BookingTimeline" (id, "bookingId", status, description, "performedBy") VALUES ($1, $2, $3, $4, $5)', [genId('tl'), id, 'ACCEPTED', 'Booking accepted by service provider', user.id])
    await pool.query('INSERT INTO "Notification" (id, "userId", type, channel, title, message) VALUES ($1, $2, $3, $4, $5, $6)', [genId('ntf'), booking.rows[0].clientId, 'BOOKING', 'IN_APP', 'Booking Accepted', 'Your booking has been accepted by the service provider'])
    return c.json({ message: 'Booking accepted', status: 'ACCEPTED' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.patch('/api/bookings/:id/reject', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const { reason } = await c.req.json()
    const id = c.req.param('id')
    const booking = await pool.query('SELECT * FROM "Booking" WHERE id = $1', [id])
    if (!booking.rows[0]) return c.json({ error: 'Not found' }, 404)
    await pool.query('UPDATE "Booking" SET status = \'CANCELLED\', "cancellationReason" = $1, "cancelledBy" = $2, "cancelledAt" = NOW(), "updatedAt" = NOW() WHERE id = $3', [reason || 'Rejected by provider', user.id, id])
    await pool.query('INSERT INTO "BookingTimeline" (id, "bookingId", status, description, "performedBy") VALUES ($1, $2, $3, $4, $5)', [genId('tl'), id, 'CANCELLED', reason || 'Rejected by provider', user.id])
    return c.json({ message: 'Booking rejected' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.patch('/api/bookings/:id/start-travel', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const id = c.req.param('id')
    await pool.query('UPDATE "Booking" SET status = \'ON_THE_WAY\', "onTheWayAt" = NOW(), "updatedAt" = NOW() WHERE id = $1', [id])
    await pool.query('INSERT INTO "BookingTimeline" (id, "bookingId", status, description, "performedBy") VALUES ($1, $2, $3, $4, $5)', [genId('tl'), id, 'ON_THE_WAY', 'Technician is on the way', user.id])
    const booking = await pool.query('SELECT "clientId" FROM "Booking" WHERE id = $1', [id])
    if (booking.rows[0]) await pool.query('INSERT INTO "Notification" (id, "userId", type, channel, title, message) VALUES ($1, $2, $3, $4, $5, $6)', [genId('ntf'), booking.rows[0].clientId, 'BOOKING', 'IN_APP', 'Technician On The Way', 'Your service provider is on the way to your location'])
    return c.json({ message: 'Status updated', status: 'ON_THE_WAY' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.patch('/api/bookings/:id/arrive', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const id = c.req.param('id')
    await pool.query('UPDATE "Booking" SET status = \'ARRIVED\', "arrivedAt" = NOW(), "updatedAt" = NOW() WHERE id = $1', [id])
    await pool.query('INSERT INTO "BookingTimeline" (id, "bookingId", status, description, "performedBy") VALUES ($1, $2, $3, $4, $5)', [genId('tl'), id, 'ARRIVED', 'Technician has arrived at the location', user.id])
    return c.json({ message: 'Status updated', status: 'ARRIVED' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.patch('/api/bookings/:id/start', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const id = c.req.param('id')
    await pool.query('UPDATE "Booking" SET status = \'IN_PROGRESS\', "startedAt" = NOW(), "updatedAt" = NOW() WHERE id = $1', [id])
    await pool.query('INSERT INTO "BookingTimeline" (id, "bookingId", status, description, "performedBy") VALUES ($1, $2, $3, $4, $5)', [genId('tl'), id, 'IN_PROGRESS', 'Work has started', user.id])
    return c.json({ message: 'Status updated', status: 'IN_PROGRESS' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.patch('/api/bookings/:id/complete', async (c) => {
  const client_conn = await pool.connect()
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const id = c.req.param('id')
    const { otp } = await c.req.json()
    const booking = await client_conn.query('SELECT * FROM "Booking" WHERE id = $1', [id])
    if (!booking.rows[0]) return c.json({ error: 'Not found' }, 404)
    // OTP verification
    if (otp && booking.rows[0].otpCode !== otp) return c.json({ error: 'Invalid OTP code' }, 400)
    await client_conn.query('BEGIN')
    await client_conn.query('UPDATE "Booking" SET status = \'COMPLETED\', "completedAt" = NOW(), "otpVerified" = true, "otpVerifiedAt" = NOW(), "updatedAt" = NOW() WHERE id = $1', [id])
    await client_conn.query('INSERT INTO "BookingTimeline" (id, "bookingId", status, description, "performedBy") VALUES ($1, $2, $3, $4, $5)', [genId('tl'), id, 'COMPLETED', 'Service completed and OTP verified', user.id])
    // Release escrow payment
    await client_conn.query('UPDATE "Payment" SET status = \'SUCCESS\', "escrowStatus" = \'RELEASED\', "updatedAt" = NOW() WHERE "bookingId" = $1', [id])
    // Credit provider wallet
    const providerEarnings = booking.rows[0].providerEarnings || booking.rows[0].finalPrice - booking.rows[0].platformFee
    await client_conn.query('UPDATE "Wallet" SET balance = balance + $1, "totalEarned" = "totalEarned" + $1, "updatedAt" = NOW() WHERE "userId" = $2', [providerEarnings, booking.rows[0].providerId])
    await client_conn.query('INSERT INTO "WalletTransaction" (id, "walletId", "userId", type, category, amount, description, "referenceId", "referenceType") SELECT id, w.id, $2, \'CREDIT\', \'EARNING\', $3, $4, $5, \'BOOKING\' FROM "Wallet" w WHERE w."userId" = $2', [genId('wtx'), booking.rows[0].providerId, providerEarnings, `Earnings for booking #${booking.rows[0].bookingNumber}`, id])
    // Update stats
    await client_conn.query('UPDATE "User" SET "completedJobsCount" = "completedJobsCount" + 1 WHERE id = $1', [booking.rows[0].providerId])
    await client_conn.query('UPDATE "Service" SET "totalBookings" = "totalBookings" + 1 WHERE id = $1', [booking.rows[0].serviceId])
    // Generate invoice
    const invNum = genInvoiceNumber()
    await client_conn.query('INSERT INTO "Invoice" (id, "bookingId", "invoiceNumber", "clientId", "providerId", subtotal, "gstAmount", "gstRate", "discountAmount", "totalAmount", status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
      [genId('inv'), id, invNum, booking.rows[0].clientId, booking.rows[0].providerId, booking.rows[0].basePrice, booking.rows[0].finalPrice * 0.18, 18, booking.rows[0].couponDiscount, booking.rows[0].finalPrice, 'GENERATED'])
    // Notify client
    await client_conn.query('INSERT INTO "Notification" (id, "userId", type, channel, title, message) VALUES ($1, $2, $3, $4, $5, $6)', [genId('ntf'), booking.rows[0].clientId, 'BOOKING', 'IN_APP', 'Service Completed', `Your booking #${booking.rows[0].bookingNumber} has been completed. Please leave a review!`])
    await client_conn.query('COMMIT')
    return c.json({ message: 'Booking completed', status: 'COMPLETED', invoiceNumber: invNum })
  } catch (e) { await client_conn.query('ROLLBACK'); console.error(e); return c.json({ error: 'Failed' }, 500) } finally { client_conn.release() }
})

app.patch('/api/bookings/:id/cancel', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const { reason } = await c.req.json()
    const id = c.req.param('id')
    await pool.query('UPDATE "Booking" SET status = \'CANCELLED\', "cancellationReason" = $1, "cancelledBy" = $2, "cancelledAt" = NOW(), "updatedAt" = NOW() WHERE id = $3', [reason || 'Cancelled', user.id, id])
    await pool.query('INSERT INTO "BookingTimeline" (id, "bookingId", status, description, "performedBy") VALUES ($1, $2, $3, $4, $5)', [genId('tl'), id, 'CANCELLED', reason || 'Booking cancelled', user.id])
    return c.json({ message: 'Booking cancelled' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// ============================================================================
// REVIEWS
// ============================================================================
app.post('/api/reviews', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const body = await c.req.json()
    const existing = await pool.query('SELECT id FROM "Review" WHERE "bookingId" = $1 AND "reviewerId" = $2', [body.bookingId, user.id])
    if (existing.rows[0]) return c.json({ error: 'Review already exists' }, 409)
    const booking = await pool.query('SELECT * FROM "Booking" WHERE id = $1 AND "clientId" = $2 AND status = \'COMPLETED\'', [body.bookingId, user.id])
    if (!booking.rows[0]) return c.json({ error: 'Booking not found or not completed' }, 400)
    const id = genId('rev')
    await pool.query('INSERT INTO "Review" (id, "bookingId", "reviewerId", "reviewedId", "serviceId", rating, comment, images, "isVerified") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true)',
      [id, body.bookingId, user.id, booking.rows[0].providerId, booking.rows[0].serviceId, body.rating, body.comment || null, body.images ? JSON.stringify(body.images) : null])
    // Update service rating
    await pool.query('UPDATE "Service" SET "totalReviews" = "totalReviews" + 1, "averageRating" = (SELECT AVG(rating) FROM "Review" WHERE "serviceId" = $1) WHERE id = $1', [booking.rows[0].serviceId])
    // Update provider rating
    await pool.query('UPDATE "User" SET "averageRating" = (SELECT AVG(rating) FROM "Review" WHERE "reviewedId" = $1) WHERE id = $1', [booking.rows[0].providerId])
    return c.json({ message: 'Review submitted', review: { id } }, 201)
  } catch (e) { console.error(e); return c.json({ error: 'Failed' }, 500) }
})

app.get('/api/reviews', async (c) => {
  try {
    const serviceId = c.req.query('serviceId')
    const userId = c.req.query('userId')
    let query = 'SELECT r.*, u.name as "reviewerName", u."profileImageUrl" as "reviewerImage" FROM "Review" r JOIN "User" u ON r."reviewerId" = u.id WHERE 1=1'
    const params = []
    let idx = 1
    if (serviceId) { query += ` AND r."serviceId" = $${idx}`; params.push(serviceId); idx++ }
    if (userId) { query += ` AND r."reviewedId" = $${idx}`; params.push(userId); idx++ }
    query += ' ORDER BY r."createdAt" DESC LIMIT 20'
    const result = await pool.query(query, params)
    return c.json({ reviews: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// ============================================================================
// WALLET
// ============================================================================
app.get('/api/wallet', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const wallet = await pool.query('SELECT * FROM "Wallet" WHERE "userId" = $1', [user.id])
    if (!wallet.rows[0]) {
      await pool.query('INSERT INTO "Wallet" (id, "userId") VALUES ($1, $2) ON CONFLICT ("userId") DO NOTHING', [genId('wlt'), user.id])
      const newWallet = await pool.query('SELECT * FROM "Wallet" WHERE "userId" = $1', [user.id])
      return c.json(newWallet.rows[0])
    }
    return c.json(wallet.rows[0])
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.get('/api/wallet/transactions', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const result = await pool.query('SELECT * FROM "WalletTransaction" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 50', [user.id])
    return c.json({ transactions: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.post('/api/wallet/withdraw', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const { amount, method } = await c.req.json()
    if (!amount || amount < 100) return c.json({ error: 'Minimum withdrawal is ₹100' }, 400)
    const wallet = await pool.query('SELECT * FROM "Wallet" WHERE "userId" = $1', [user.id])
    if (!wallet.rows[0] || wallet.rows[0].balance < amount) return c.json({ error: 'Insufficient balance' }, 400)
    // Create payout request
    const id = genId('pay')
    await pool.query('INSERT INTO "PayoutRequest" (id, "userId", amount, method) VALUES ($1, $2, $3, $4)', [id, user.id, amount, method || 'BANK_TRANSFER'])
    // Debit wallet
    await pool.query('UPDATE "Wallet" SET balance = balance - $1, "totalWithdrawn" = "totalWithdrawn" + $1 WHERE "userId" = $2', [amount, user.id])
    await pool.query('INSERT INTO "WalletTransaction" (id, "walletId", "userId", type, category, amount, description, "referenceId", "referenceType") SELECT $1, w.id, $2, \'DEBIT\', \'WITHDRAWAL\', $3, $4, $5, \'PAYOUT\' FROM "Wallet" w WHERE w."userId" = $2', [genId('wtx'), user.id, amount, `Withdrawal request #${id}`, id])
    return c.json({ message: 'Withdrawal request submitted', payoutId: id })
  } catch (e) { console.error(e); return c.json({ error: 'Failed' }, 500) }
})

// ============================================================================
// AMC PLANS & SUBSCRIPTIONS
// ============================================================================
app.get('/api/amc/plans', async (c) => {
  try {
    const categoryId = c.req.query('categoryId')
    let query = 'SELECT p.*, c.name as "categoryName" FROM "AMCPlan" p JOIN "ServiceCategory" c ON p."categoryId" = c.id WHERE p."isActive" = true'
    const params = []
    if (categoryId) { query += ' AND p."categoryId" = $1'; params.push(categoryId) }
    query += ' ORDER BY p."displayOrder"'
    const result = await pool.query(query, params)
    return c.json({ plans: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.post('/api/amc/subscribe', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const { planId } = await c.req.json()
    const plan = await pool.query('SELECT * FROM "AMCPlan" WHERE id = $1 AND "isActive" = true', [planId])
    if (!plan.rows[0]) return c.json({ error: 'Plan not found' }, 404)
    const id = genId('amc')
    await pool.query('INSERT INTO "AMCSubscription" (id, "planId", "clientId", "startDate", "endDate", "visitsRemaining") VALUES ($1, $2, $3, NOW(), NOW() + INTERVAL \'1 year\' * $4, $5)',
      [id, planId, user.id, plan.rows[0].durationMonths, plan.rows[0].visitsIncluded])
    return c.json({ message: 'AMC subscription created', subscription: { id } }, 201)
  } catch (e) { console.error(e); return c.json({ error: 'Failed' }, 500) }
})

app.get('/api/amc/subscriptions', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const result = await pool.query('SELECT s.*, p.name as "planName", p.description as "planDescription", p.price, p."visitsIncluded", p."durationMonths", c.name as "categoryName" FROM "AMCSubscription" s JOIN "AMCPlan" p ON s."planId" = p.id JOIN "ServiceCategory" c ON p."categoryId" = c.id WHERE s."clientId" = $1 ORDER BY s."createdAt" DESC', [user.id])
    return c.json({ subscriptions: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// ============================================================================
// COUPONS
// ============================================================================
app.get('/api/coupons', async (c) => {
  try {
    const result = await pool.query('SELECT * FROM "Coupon" WHERE "isActive" = true AND "validTo" >= NOW() ORDER BY "createdAt" DESC')
    return c.json({ coupons: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.post('/api/coupons/validate', async (c) => {
  try {
    const { code, amount } = await c.req.json()
    if (!code) return c.json({ error: 'Coupon code required' }, 400)
    const user = await getUser(c)
    const coupon = await pool.query('SELECT * FROM "Coupon" WHERE code = $1 AND "isActive" = true AND "validFrom" <= NOW() AND "validTo" >= NOW()', [code])
    if (!coupon.rows[0]) return c.json({ error: 'Invalid or expired coupon' }, 404)
    const cpn = coupon.rows[0]
    if (cpn.usageLimit !== null && cpn.usageCount >= cpn.usageLimit) return c.json({ error: 'Coupon usage limit reached' }, 400)
    if (user && cpn.perUserLimit) {
      const userUsage = await pool.query('SELECT COUNT(*) as cnt FROM "CouponUsage" WHERE "couponId" = $1 AND "userId" = $2', [cpn.id, user.id])
      if (parseInt(userUsage.rows[0].cnt) >= cpn.perUserLimit) return c.json({ error: 'You have already used this coupon' }, 400)
    }
    if (amount && amount < cpn.minOrderAmount) return c.json({ error: `Minimum order amount is ₹${cpn.minOrderAmount}` }, 400)
    let discount = cpn.discountType === 'PERCENTAGE' ? (amount || 0) * cpn.discountValue / 100 : cpn.discountValue
    if (cpn.maxDiscount) discount = Math.min(discount, cpn.maxDiscount)
    return c.json({ valid: true, coupon: cpn, discount: Math.round(discount * 100) / 100 })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// ============================================================================
// FRANCHISE
// ============================================================================
app.get('/api/franchises', async (c) => {
  try {
    const result = await pool.query('SELECT f.*, u.name as "ownerName", u.email as "ownerEmail" FROM "Franchise" f JOIN "User" u ON f."ownerId" = u.id ORDER BY f."createdAt" DESC')
    return c.json({ franchises: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.post('/api/franchises', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const body = await c.req.json()
    const id = genId('frn')
    const slug = body.city.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString(36)
    await pool.query('INSERT INTO "Franchise" (id, "ownerId", name, slug, city, state, country, pincode, address, latitude, longitude, "contactPhone", "contactEmail", "commissionRate") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)',
      [id, user.id, body.name, slug, body.city, body.state, body.country || 'India', body.pincode, body.address, body.latitude, body.longitude, body.contactPhone, body.contactEmail, body.commissionRate || 10])
    return c.json({ message: 'Franchise application submitted', franchise: { id } }, 201)
  } catch (e) { console.error(e); return c.json({ error: 'Failed' }, 500) }
})

app.get('/api/franchises/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const result = await pool.query('SELECT f.*, u.name as "ownerName", u.email as "ownerEmail" FROM "Franchise" f JOIN "User" u ON f."ownerId" = u.id WHERE f.id = $1', [id])
    if (!result.rows[0]) return c.json({ error: 'Not found' }, 404)
    // Get analytics
    const analytics = await pool.query('SELECT * FROM "FranchiseAnalytics" WHERE "franchiseId" = $1 ORDER BY date DESC LIMIT 30', [id])
    result.rows[0].analytics = analytics.rows
    // Get vendors
    const vendors = await pool.query('SELECT fv.*, u.name as "vendorName", u.email FROM "FranchiseVendor" fv JOIN "User" u ON fv."vendorId" = u.id WHERE fv."franchiseId" = $1', [id])
    result.rows[0].vendors = vendors.rows
    return c.json(result.rows[0])
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// ============================================================================
// NOTIFICATIONS
// ============================================================================
app.get('/api/notifications', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const result = await pool.query('SELECT * FROM "Notification" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 50', [user.id])
    return c.json({ notifications: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.patch('/api/notifications/:id/read', async (c) => {
  try {
    const id = c.req.param('id')
    await pool.query('UPDATE "Notification" SET "isRead" = true, "readAt" = NOW() WHERE id = $1', [id])
    return c.json({ message: 'Marked as read' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.post('/api/notifications/read-all', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    await pool.query('UPDATE "Notification" SET "isRead" = true, "readAt" = NOW() WHERE "userId" = $1 AND "isRead" = false', [user.id])
    return c.json({ message: 'All notifications marked as read' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// ============================================================================
// TECHNICIAN PROFILE
// ============================================================================
app.get('/api/technician/profile', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const result = await pool.query('SELECT * FROM "TechnicianProfile" WHERE "userId" = $1', [user.id])
    return c.json(result.rows[0] || {})
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.patch('/api/technician/profile', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const body = await c.req.json()
    const fields = ['skills', 'isAvailable', 'serviceAreaRadiusKm', 'serviceAreaPincodes', 'currentLocationLat', 'currentLocationLng', 'bankAccountName', 'bankAccountNumber', 'bankIfsc', 'bankName', 'upiId']
    const updates = []
    const values = []
    let idx = 1
    for (const f of fields) {
      if (body[f] !== undefined) { updates.push(`"${f}" = $${idx}`); values.push(typeof body[f] === 'object' ? JSON.stringify(body[f]) : body[f]); idx++ }
    }
    if (body.currentLocationLat || body.currentLocationLng) updates.push('"locationUpdatedAt" = NOW()')
    updates.push('"updatedAt" = NOW()')
    values.push(user.id)
    await pool.query(`UPDATE "TechnicianProfile" SET ${updates.join(', ')} WHERE "userId" = $${idx}`, values)
    return c.json({ message: 'Profile updated' })
  } catch (e) { console.error(e); return c.json({ error: 'Failed' }, 500) }
})

app.get('/api/technician/jobs', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const status = c.req.query('status')
    let query = 'SELECT b.*, s.title as "serviceTitle", u.name as "clientName", u.phone as "clientPhone", u."profileImageUrl" as "clientImage", c.name as "categoryName" FROM "Booking" b JOIN "Service" s ON b."serviceId" = s.id JOIN "User" u ON b."clientId" = u.id JOIN "ServiceCategory" c ON s."categoryId" = c.id WHERE (b."technicianId" = $1 OR b."providerId" = $1)'
    const params = [user.id]
    if (status) { query += ' AND b.status = $2'; params.push(status) }
    query += ' ORDER BY b."createdAt" DESC LIMIT 50'
    const result = await pool.query(query, params)
    return c.json({ jobs: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.get('/api/technician/earnings', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const profile = await pool.query('SELECT * FROM "TechnicianProfile" WHERE "userId" = $1', [user.id])
    const wallet = await pool.query('SELECT * FROM "Wallet" WHERE "userId" = $1', [user.id])
    const recentTx = await pool.query('SELECT * FROM "WalletTransaction" WHERE "userId" = $1 AND category = \'EARNING\' ORDER BY "createdAt" DESC LIMIT 20', [user.id])
    return c.json({
      profile: profile.rows[0] || {},
      wallet: wallet.rows[0] || { balance: 0 },
      recentEarnings: recentTx.rows,
    })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// ============================================================================
// REFERRAL
// ============================================================================
app.get('/api/referrals', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const referrals = await pool.query('SELECT r.*, u.name as "refereeName" FROM "Referral" r JOIN "User" u ON r."refereeId" = u.id WHERE r."referrerId" = $1 ORDER BY r."createdAt" DESC', [user.id])
    const userResult = await pool.query('SELECT "referralCode" FROM "User" WHERE id = $1', [user.id])
    return c.json({ referralCode: userResult.rows[0]?.referralCode, referrals: referrals.rows, total: referrals.rows.length })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// ============================================================================
// INVOICES
// ============================================================================
app.get('/api/invoices/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const result = await pool.query('SELECT i.*, b."bookingNumber", b."scheduledDate", b."scheduledTime", b."serviceAddress", s.title as "serviceTitle", c.name as "clientName", c.email as "clientEmail", c.phone as "clientPhone", p.name as "providerName", p.email as "providerEmail" FROM "Invoice" i JOIN "Booking" b ON i."bookingId" = b.id JOIN "Service" s ON b."serviceId" = s.id JOIN "User" c ON i."clientId" = c.id JOIN "User" p ON i."providerId" = p.id WHERE i.id = $1', [id])
    if (!result.rows[0]) return c.json({ error: 'Not found' }, 404)
    return c.json(result.rows[0])
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.get('/api/invoices', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    let query, params
    if (user.roleId === 1) {
      query = 'SELECT i.*, b."bookingNumber", s.title as "serviceTitle" FROM "Invoice" i JOIN "Booking" b ON i."bookingId" = b.id JOIN "Service" s ON b."serviceId" = s.id WHERE i."clientId" = $1 ORDER BY i."createdAt" DESC'
      params = [user.id]
    } else {
      query = 'SELECT i.*, b."bookingNumber", s.title as "serviceTitle" FROM "Invoice" i JOIN "Booking" b ON i."bookingId" = b.id JOIN "Service" s ON b."serviceId" = s.id WHERE i."providerId" = $1 ORDER BY i."createdAt" DESC'
      params = [user.id]
    }
    const result = await pool.query(query, params)
    return c.json({ invoices: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// ============================================================================
// CRM & FOLLOW-UPS (Admin)
// ============================================================================
app.get('/api/crm/activities', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    if (user.roleId < 3) return c.json({ error: 'Admin access required' }, 403)
    const result = await pool.query('SELECT ca.*, u.name as "userName", u.email, u.phone FROM "CRMActivity" ca JOIN "User" u ON ca."userId" = u.id ORDER BY ca."createdAt" DESC LIMIT 50')
    return c.json({ activities: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.get('/api/crm/follow-ups', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    if (user.roleId < 3) return c.json({ error: 'Admin access required' }, 403)
    const result = await pool.query('SELECT f.*, u.name as "userName", u.email, u.phone, a.name as "assigneeName" FROM "FollowUp" f JOIN "User" u ON f."userId" = u.id JOIN "User" a ON f."assignedTo" = a.id ORDER BY f."dueDate" ASC LIMIT 50')
    return c.json({ followUps: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.post('/api/crm/follow-ups', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const body = await c.req.json()
    const id = genId('fu')
    await pool.query('INSERT INTO "FollowUp" (id, "userId", "assignedTo", type, title, notes, priority, "dueDate") VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [id, body.userId, user.id, body.type, body.title, body.notes, body.priority || 'MEDIUM', body.dueDate])
    return c.json({ message: 'Follow-up created', followUp: { id } }, 201)
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// ============================================================================
// ADMIN DASHBOARD & ANALYTICS
// ============================================================================
app.get('/api/admin/dashboard', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    if (user.roleId < 3) return c.json({ error: 'Admin access required' }, 403)
    const totalUsers = await pool.query('SELECT COUNT(*) as cnt FROM "User"')
    const totalProviders = await pool.query('SELECT COUNT(*) as cnt FROM "User" WHERE "roleId" IN (2, 4, 5)')
    const totalBookings = await pool.query('SELECT COUNT(*) as cnt FROM "Booking"')
    const activeBookings = await pool.query('SELECT COUNT(*) as cnt FROM "Booking" WHERE status IN (\'PENDING\', \'ASSIGNED\', \'ACCEPTED\', \'ON_THE_WAY\', \'ARRIVED\', \'IN_PROGRESS\')')
    const totalRevenue = await pool.query('SELECT COALESCE(SUM("finalPrice"), 0) as total FROM "Booking" WHERE status = \'COMPLETED\'')
    const totalServices = await pool.query('SELECT COUNT(*) as cnt FROM "Service"')
    const totalFranchises = await pool.query('SELECT COUNT(*) as cnt FROM "Franchise"')
    const totalAMCSubs = await pool.query('SELECT COUNT(*) as cnt FROM "AMCSubscription" WHERE status = \'ACTIVE\'')
    const cancellationRate = await pool.query('SELECT CASE WHEN COUNT(*) > 0 THEN ROUND(COUNT(CASE WHEN status = \'CANCELLED\' THEN 1 END) * 100.0 / COUNT(*), 2) ELSE 0 END as rate FROM "Booking"')
    const topCategories = await pool.query('SELECT c.name, COUNT(b.id) as bookings, COALESCE(SUM(b."finalPrice"), 0) as revenue FROM "ServiceCategory" c LEFT JOIN "Service" s ON s."categoryId" = c.id LEFT JOIN "Booking" b ON b."serviceId" = s.id GROUP BY c.name ORDER BY bookings DESC LIMIT 5')
    const recentBookings = await pool.query('SELECT b.*, u.name as "clientName", s.title as "serviceTitle" FROM "Booking" b JOIN "User" u ON b."clientId" = u.id JOIN "Service" s ON b."serviceId" = s.id ORDER BY b."createdAt" DESC LIMIT 10')
    const monthlyRevenue = await pool.query('SELECT TO_CHAR("createdAt", \'YYYY-MM\') as month, COALESCE(SUM("finalPrice"), 0) as revenue, COUNT(*) as bookings FROM "Booking" WHERE status = \'COMPLETED\' GROUP BY month ORDER BY month DESC LIMIT 12')

    return c.json({
      stats: {
        totalUsers: parseInt(totalUsers.rows[0]?.cnt || 0),
        totalProviders: parseInt(totalProviders.rows[0]?.cnt || 0),
        totalBookings: parseInt(totalBookings.rows[0]?.cnt || 0),
        activeBookings: parseInt(activeBookings.rows[0]?.cnt || 0),
        totalRevenue: parseFloat(totalRevenue.rows[0]?.total || 0),
        totalServices: parseInt(totalServices.rows[0]?.cnt || 0),
        totalFranchises: parseInt(totalFranchises.rows[0]?.cnt || 0),
        totalAMCSubscriptions: parseInt(totalAMCSubs.rows[0]?.cnt || 0),
        cancellationRate: parseFloat(cancellationRate.rows[0]?.rate || 0),
      },
      topCategories: topCategories.rows,
      recentBookings: recentBookings.rows,
      monthlyRevenue: monthlyRevenue.rows,
    })
  } catch (e) { console.error(e); return c.json({ error: 'Failed' }, 500) }
})

app.get('/api/admin/users', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    if (user.roleId < 3) return c.json({ error: 'Admin access required' }, 403)
    const role = c.req.query('role')
    const search = c.req.query('search')
    let query = 'SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON u."roleId" = r.id WHERE 1=1'
    const params = []
    let idx = 1
    if (role) { query += ` AND r.name = $${idx}`; params.push(role); idx++ }
    if (search) { query += ` AND (u.name ILIKE $${idx} OR u.email ILIKE $${idx} OR u.phone ILIKE $${idx})`; params.push(`%${search}%`); idx++ }
    query += ' ORDER BY u."createdAt" DESC LIMIT 50'
    const result = await pool.query(query, params)
    return c.json({ users: result.rows.map(u => safeUser(u)), total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.patch('/api/admin/users/:id', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    if (user.roleId < 3) return c.json({ error: 'Admin access required' }, 403)
    const id = c.req.param('id')
    const body = await c.req.json()
    const updates = []
    const values = []
    let idx = 1
    for (const f of ['status', 'isVerified', 'verifiedBadge']) {
      if (body[f] !== undefined) { updates.push(`"${f}" = $${idx}`); values.push(body[f]); idx++ }
    }
    if (updates.length === 0) return c.json({ error: 'No fields to update' }, 400)
    updates.push('"updatedAt" = NOW()')
    values.push(id)
    await pool.query(`UPDATE "User" SET ${updates.join(', ')} WHERE id = $${idx}`, values)
    await pool.query('INSERT INTO "AdminLog" (id, "adminId", action, "targetType", "targetId") VALUES ($1, $2, $3, $4, $5)', [genId('log'), user.id, 'UPDATE_USER', 'USER', id])
    return c.json({ message: 'User updated' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.get('/api/admin/bookings', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    if (user.roleId < 3) return c.json({ error: 'Admin access required' }, 403)
    const status = c.req.query('status')
    let query = 'SELECT b.*, s.title as "serviceTitle", u.name as "clientName", u2.name as "providerName", c.name as "categoryName" FROM "Booking" b JOIN "Service" s ON b."serviceId" = s.id JOIN "User" u ON b."clientId" = u.id JOIN "User" u2 ON b."providerId" = u2.id JOIN "ServiceCategory" c ON s."categoryId" = c.id WHERE 1=1'
    const params = []
    if (status) { query += ' AND b.status = $1'; params.push(status) }
    query += ' ORDER BY b."createdAt" DESC LIMIT 50'
    const result = await pool.query(query, params)
    return c.json({ bookings: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.get('/api/admin/revenue', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    if (user.roleId < 3) return c.json({ error: 'Admin access required' }, 403)
    const totalRevenue = await pool.query('SELECT COALESCE(SUM("finalPrice"), 0) as total FROM "Booking" WHERE status = \'COMPLETED\'')
    const platformFees = await pool.query('SELECT COALESCE(SUM("platformFee"), 0) as total FROM "Booking" WHERE status = \'COMPLETED\'')
    const escrowHeld = await pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM "Payment" WHERE "escrowStatus" = \'HELD\'')
    const pendingPayouts = await pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM "PayoutRequest" WHERE status = \'PENDING\'')
    const dailyRevenue = await pool.query('SELECT TO_CHAR("createdAt", \'YYYY-MM-DD\') as date, COALESCE(SUM("finalPrice"), 0) as revenue, COUNT(*) as bookings FROM "Booking" WHERE status = \'COMPLETED\' GROUP BY date ORDER BY date DESC LIMIT 30')
    return c.json({
      totalRevenue: parseFloat(totalRevenue.rows[0]?.total || 0),
      platformFees: parseFloat(platformFees.rows[0]?.total || 0),
      escrowHeld: parseFloat(escrowHeld.rows[0]?.total || 0),
      pendingPayouts: parseFloat(pendingPayouts.rows[0]?.total || 0),
      dailyRevenue: dailyRevenue.rows,
    })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.get('/api/admin/payouts', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    if (user.roleId < 3) return c.json({ error: 'Admin access required' }, 403)
    const result = await pool.query('SELECT p.*, u.name as "userName", u.email FROM "PayoutRequest" p JOIN "User" u ON p."userId" = u.id ORDER BY p."createdAt" DESC LIMIT 50')
    return c.json({ payouts: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.patch('/api/admin/payouts/:id', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    if (user.roleId < 3) return c.json({ error: 'Admin access required' }, 403)
    const id = c.req.param('id')
    const body = await c.req.json()
    if (body.action === 'approve') {
      await pool.query('UPDATE "PayoutRequest" SET status = \'APPROVED\', "processedBy" = $1, "processedAt" = NOW() WHERE id = $2', [user.id, id])
    } else if (body.action === 'reject') {
      await pool.query('UPDATE "PayoutRequest" SET status = \'REJECTED\', "processedBy" = $1, "processedAt" = NOW(), "rejectionReason" = $2 WHERE id = $3', [user.id, body.reason || 'Rejected', id])
    }
    return c.json({ message: 'Payout updated' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.get('/api/admin/disputes', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    if (user.roleId < 3) return c.json({ error: 'Admin access required' }, 403)
    const result = await pool.query('SELECT d.*, b."bookingNumber", u.name as "raiserName" FROM "Dispute" d JOIN "Booking" b ON d."bookingId" = b.id JOIN "User" u ON d."raisedBy" = u.id ORDER BY d."createdAt" DESC LIMIT 50')
    return c.json({ disputes: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.get('/api/admin/logs', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    if (user.roleId < 3) return c.json({ error: 'Admin access required' }, 403)
    const result = await pool.query('SELECT al.*, u.name as "adminName" FROM "AdminLog" al JOIN "User" u ON al."adminId" = u.id ORDER BY al."createdAt" DESC LIMIT 50')
    return c.json({ logs: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// ============================================================================
// CITIES
// ============================================================================
app.get('/api/cities', async (c) => {
  try {
    const result = await pool.query('SELECT * FROM "City" WHERE "isActive" = true ORDER BY "displayOrder"')
    return c.json({ cities: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// ============================================================================
// PRICING RULES
// ============================================================================
app.get('/api/pricing-rules', async (c) => {
  try {
    const categoryId = c.req.query('categoryId')
    let query = 'SELECT * FROM "PricingRule" WHERE "isActive" = true'
    const params = []
    if (categoryId) { query += ' AND "categoryId" = $1'; params.push(categoryId) }
    query += ' ORDER BY priority'
    const result = await pool.query(query, params)
    return c.json({ rules: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// ============================================================================
// LEGAL PAGES
// ============================================================================
app.get('/api/legal', async (c) => {
  try {
    const result = await pool.query('SELECT id, "pageType", title, version, "effectiveDate", "updatedAt" FROM "LegalPage" ORDER BY id ASC')
    return c.json({ documents: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.get('/api/legal/:type', async (c) => {
  try {
    const typeParam = c.req.param('type')
    const TYPE_MAP = { 'terms': 'TERMS', 'privacy': 'PRIVACY', 'refund-policy': 'REFUND', 'cookies': 'COOKIES', 'aup': 'AUP', 'provider-agreement': 'PROVIDER_AGREEMENT', 'community-guidelines': 'COMMUNITY_GUIDELINES' }
    const pageType = TYPE_MAP[typeParam] || typeParam.toUpperCase()
    const result = await pool.query('SELECT * FROM "LegalPage" WHERE "pageType" = $1', [pageType])
    if (!result.rows[0]) return c.json({ error: 'Not found' }, 404)
    return c.json(result.rows[0])
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// ============================================================================
// FAQ
// ============================================================================
app.get('/api/faq', async (c) => {
  try {
    const category = c.req.query('category')
    const result = category
      ? await pool.query('SELECT * FROM "Faq" WHERE category = $1 AND "isActive" = true ORDER BY "displayOrder"', [category])
      : await pool.query('SELECT * FROM "Faq" WHERE "isActive" = true ORDER BY "displayOrder"')
    return c.json({ faqs: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// ============================================================================
// CONTACT
// ============================================================================
app.post('/api/contact', async (c) => {
  try {
    const { name, email, subject, message } = await c.req.json()
    if (!name || !email || !subject || !message) return c.json({ error: 'All fields required' }, 400)
    const id = genId('msg')
    await pool.query('INSERT INTO "ContactMessage" (id, name, email, subject, message) VALUES ($1, $2, $3, $4, $5)', [id, name, email, subject, message])
    return c.json({ success: true, id }, 201)
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// ============================================================================
// STATS
// ============================================================================
app.get('/api/stats/platform', async (c) => {
  try {
    const result = await pool.query('SELECT * FROM "PlatformStats" ORDER BY id DESC LIMIT 1')
    return c.json(result.rows[0] || { totalVisitors: 0, totalUsers: 0, totalProviders: 0, totalBookings: 0, totalServices: 0, activeVisitors: 0 })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// ============================================================================
// FAVORITES
// ============================================================================
app.get('/api/favorites', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const result = await pool.query('SELECT f.*, s.title, s."basePrice", s."averageRating", s."images", u.name as "providerName" FROM "Favorite" f JOIN "Service" s ON f."serviceId" = s.id JOIN "User" u ON s."providerId" = u.id WHERE f."userId" = $1 ORDER BY f."createdAt" DESC', [user.id])
    return c.json({ favorites: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.post('/api/favorites', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const { serviceId } = await c.req.json()
    await pool.query('INSERT INTO "Favorite" (id, "userId", "serviceId") VALUES ($1, $2, $3) ON CONFLICT ("userId", "serviceId") DO NOTHING', [genId('fav'), user.id, serviceId])
    return c.json({ message: 'Added to favorites' }, 201)
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.delete('/api/favorites/:serviceId', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    await pool.query('DELETE FROM "Favorite" WHERE "userId" = $1 AND "serviceId" = $2', [user.id, c.req.param('serviceId')])
    return c.json({ message: 'Removed from favorites' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// ============================================================================
// NEARBY PROVIDERS
// ============================================================================
app.get('/api/providers/nearby', async (c) => {
  try {
    const lat = parseFloat(c.req.query('lat') || '0')
    const lng = parseFloat(c.req.query('lng') || '0')
    const categoryId = c.req.query('categoryId')
    if (!lat || !lng) return c.json({ error: 'Latitude and longitude required' }, 400)
    // Find providers with services in the area
    let query = `SELECT s.*, u.name as "providerName", u.phone as "providerPhone", u."verifiedBadge", u."completedJobsCount", u."averageRating" as "providerRating", c.name as "categoryName", 
      (6371 * acos(least(greatest(cos(radians($1)) * cos(radians(s.latitude)) * cos(radians(s.longitude) - radians($2)) + sin(radians($1)) * sin(radians(s.latitude)), -1), 1))) as distance
      FROM "Service" s JOIN "User" u ON s."providerId" = u.id JOIN "ServiceCategory" c ON s."categoryId" = c.id 
      WHERE s."isActive" = true AND s."isApproved" = true AND s.latitude IS NOT NULL AND s.longitude IS NOT NULL`
    const params = [lat, lng]
    let idx = 3
    if (categoryId) { query += ` AND (c.slug = $${idx} OR c.id::text = $${idx})`; params.push(categoryId); idx++ }
    query += ' ORDER BY distance ASC LIMIT 20'
    const result = await pool.query(query, params)
    return c.json({ providers: result.rows, total: result.rows.length })
  } catch (e) { console.error(e); return c.json({ error: 'Failed' }, 500) }
})

// ============================================================================
// B2B CONTRACTS
// ============================================================================
app.get('/api/b2b/contracts', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const result = await pool.query('SELECT * FROM "B2BContract" WHERE "clientId" = $1 ORDER BY "createdAt" DESC', [user.id])
    return c.json({ contracts: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

app.post('/api/b2b/contracts', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const body = await c.req.json()
    const id = genId('b2b')
    await pool.query('INSERT INTO "B2BContract" (id, "clientId", "companyName", "contactPerson", "contactPhone", "contactEmail", address, city, "contractType", description, "monthlyAmount", "startDate", "endDate") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)',
      [id, user.id, body.companyName, body.contactPerson, body.contactPhone, body.contactEmail, body.address, body.city, body.contractType, body.description, body.monthlyAmount, body.startDate, body.endDate])
    return c.json({ message: 'B2B contract created', contract: { id } }, 201)
  } catch (e) { console.error(e); return c.json({ error: 'Failed' }, 500) }
})

// ============================================================================
// INVENTORY (Admin)
// ============================================================================
app.get('/api/admin/inventory', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    if (user.roleId < 3) return c.json({ error: 'Admin access required' }, 403)
    const result = await pool.query('SELECT * FROM "InventoryItem" WHERE "isActive" = true ORDER BY name')
    return c.json({ items: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// ============================================================================
// KYC (Provider)
// ============================================================================
app.post('/api/kyc/submit', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const body = await c.req.json()
    await pool.query(`UPDATE "ProviderKyc" SET "documentType" = $1, "documentNumber" = $2, "documentFrontUrl" = $3, "documentBackUrl" = $4, "selfieUrl" = $5, "verificationStatus" = 'PENDING', "bankAccountName" = $6, "bankAccountNumber" = $7, "bankIfsc" = $8, "bankName" = $9, "upiId" = $10, "serviceAreaPincodes" = $11, "serviceAreaCity" = $12, "updatedAt" = NOW() WHERE "providerId" = $13`,
      [body.documentType, body.documentNumber, body.documentFrontUrl, body.documentBackUrl || null, body.selfieUrl, body.bankAccountName, body.bankAccountNumber, body.bankIfsc, body.bankName, body.upiId, body.serviceAreaPincodes ? JSON.stringify(body.serviceAreaPincodes) : null, body.serviceAreaCity, user.id])
    return c.json({ message: 'KYC submitted for verification' })
  } catch (e) { console.error(e); return c.json({ error: 'Failed' }, 500) }
})

app.get('/api/kyc/status', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const result = await pool.query('SELECT * FROM "ProviderKyc" WHERE "providerId" = $1', [user.id])
    return c.json(result.rows[0] || {})
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// ============================================================================
// 404 & ERROR HANDLERS
// ============================================================================
app.all('/api/*', (c) => c.json({ error: 'Not Found', message: 'The requested resource was not found' }, 404))

app.notFound((c) => c.json({ error: 'Not Found' }, 404))

app.onError((err, c) => {
  console.error('Server error:', err)
  return c.json({ error: 'Internal Server Error', message: 'Something went wrong' }, 500)
})

const port = process.env.PORT || 3001
console.log(`🚀 BookYourService API Server v2.0 running on http://localhost:${port}`)
serve({ fetch: app.fetch, port: Number(port) })
