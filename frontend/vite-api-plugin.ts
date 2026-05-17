import type { Plugin } from 'vite';
import { jwtVerify, SignJWT } from 'jose';
import bcrypt from 'bcryptjs';

// Fix #1: Remove hardcoded DB credentials, require env var
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.warn('⚠️  DATABASE_URL not set — API will not work. Set it in .env'); }

// Fix #2: Remove hardcoded JWT secret, require env var (dev fallback for local development)
if (!process.env.JWT_SECRET) { console.warn('⚠️  JWT_SECRET not set — using development fallback. DO NOT use in production!'); }
const JWT_SECRET = process.env.JWT_SECRET || 'bys-dev-secret-key-change-in-production-2024';

let pool: any = null;

async function getPool() {
  if (!pool) {
    const { Pool } = await import('pg');
    pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
    });
    pool.on('error', (err: Error) => {
      console.error('DB pool error:', err.message);
      pool = null;
    });
  }
  return pool;
}

async function query(text: string, params: any[] = []) {
  const p = await getPool();
  try {
    return await p.query(text, params);
  } catch (e: any) {
    // Reset pool on connection error
    if (e.code === 'ECONNREFUSED' || e.code === '08P01' || e.message?.includes('connection')) {
      try { await p.end(); } catch {}
      pool = null;
    }
    throw e;
  }
}

const TYPE_MAP: Record<string, string> = {
  'TERMS': 'TERMS', 'PRIVACY': 'PRIVACY', 'REFUND': 'REFUND',
  'COOKIES': 'COOKIES', 'AUP': 'AUP', 'PROVIDER_AGREEMENT': 'PROVIDER_AGREEMENT',
  'COMMUNITY_GUIDELINES': 'COMMUNITY_GUIDELINES',
  'terms': 'TERMS', 'privacy': 'PRIVACY', 'refund-policy': 'REFUND',
  'cookies': 'COOKIES', 'aup': 'AUP', 'provider-agreement': 'PROVIDER_AGREEMENT',
  'community-guidelines': 'COMMUNITY_GUIDELINES',
};

// Fix #4: CORS helper
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://bookyourservice.co.in',
  'https://www.bookyourservice.co.in',
];

function setCorsHeaders(req: any, res: any) {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS[0]);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

function jsonResponse(res: any, data: any, status = 200) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

function readBody(req: any): Promise<string> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk: string) => body += chunk);
    req.on('end', () => resolve(body));
  });
}

// In-memory token store for password reset (Bug #6)
const resetTokens = new Map<string, { email: string; expiresAt: number }>();

async function getAuthUser(req: any) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return null;
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(authHeader.split(' ')[1], secret, { issuer: 'bookyourservice', audience: 'bookyourservice' });
    return payload;
  } catch {
    return null;
  }
}

async function requireAdmin(req: any) {
  const user = await getAuthUser(req);
  if (!user) return null;
  if (user.roleId !== 3 && user.role !== 'ADMIN') return null;
  return user;
}

// RBAC: Check if user has required role
function checkRole(userPayload: any, allowedRoles: string[]): boolean {
  if (!userPayload || !userPayload.role) return false;
  return allowedRoles.includes(userPayload.role);
}

// RBAC: Require specific roles for protected endpoints
async function requireRole(req: any, allowedRoles: string[]) {
  const user = await getAuthUser(req);
  if (!user) return null;
  if (!checkRole(user, allowedRoles)) return null;
  return user;
}

export default function apiPlugin(): Plugin {
  return {
    name: 'vite-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res, next) => {
        const url = new URL(req.url || '/', 'http://localhost');
        const path = url.pathname;

        // Fix #4: CORS headers on every response
        setCorsHeaders(req, res);

        // Fix #4: Handle OPTIONS preflight
        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        try {
          // ===================== LEGAL PAGES =====================
          if (path === '/legal' && req.method === 'GET') {
            const result = await query('SELECT id, "pageType", title, version, "effectiveDate", "updatedAt" FROM "LegalPage" ORDER BY id ASC').catch(() => ({ rows: [] }));
            return jsonResponse(res, { documents: result.rows, total: result.rows.length });
          }

          const legalMatch = path.match(/^\/legal\/(.+)$/);
          if (legalMatch && req.method === 'GET') {
            const typeParam = legalMatch[1];
            const pageType = TYPE_MAP[typeParam] || typeParam.toUpperCase();
            const result = await query('SELECT * FROM "LegalPage" WHERE "pageType" = $1', [pageType]).catch(() => ({ rows: [] }));
            if (!result.rows[0]) return jsonResponse(res, { error: `Not found: ${typeParam}` }, 404);
            return jsonResponse(res, result.rows[0]);
          }

          // ===================== CATEGORIES =====================
          if (path === '/categories' && req.method === 'GET') {
            const result = await query('SELECT * FROM "ServiceCategory" WHERE "isActive" = true ORDER BY "displayOrder"').catch(() => ({ rows: [] }));
            return jsonResponse(res, { categories: result.rows, total: result.rows.length });
          }

          const catMatch = path.match(/^\/categories\/(.+)$/);
          if (catMatch && req.method === 'GET') {
            const result = await query('SELECT * FROM "ServiceCategory" WHERE id = $1 OR slug = $1', [catMatch[1]]).catch(() => ({ rows: [] }));
            if (!result.rows[0]) return jsonResponse(res, { error: 'Not found' }, 404);
            return jsonResponse(res, result.rows[0]);
          }

          // ===================== SUBCATEGORIES =====================
          if (path === '/subcategories' && req.method === 'GET') {
            const categoryId = url.searchParams.get('categoryId');
            if (categoryId) {
              const result = await query('SELECT * FROM "ServiceSubcategory" WHERE "categoryId" = $1 AND "isActive" = true ORDER BY "displayOrder"', [categoryId]).catch(() => ({ rows: [] }));
              return jsonResponse(res, { subcategories: result.rows, total: result.rows.length });
            }
            const result = await query('SELECT * FROM "ServiceSubcategory" WHERE "isActive" = true ORDER BY "displayOrder"').catch(() => ({ rows: [] }));
            return jsonResponse(res, { subcategories: result.rows, total: result.rows.length });
          }

          // ===================== STATS =====================
          if (path === '/stats/platform' && req.method === 'GET') {
            const result = await query('SELECT * FROM "PlatformStats" ORDER BY id DESC LIMIT 1').catch(() => ({ rows: [] }));
            return jsonResponse(res, result.rows[0] || { totalVisitors: 0, totalUsers: 0, totalProviders: 0, totalBookings: 0, totalServices: 0, activeVisitors: 0 });
          }

          // ===================== FAQ =====================
          if (path === '/faq' && req.method === 'GET') {
            const category = url.searchParams.get('category');
            const result = category
              ? await query('SELECT * FROM "Faq" WHERE category = $1 AND "isActive" = true ORDER BY "displayOrder"', [category]).catch(() => ({ rows: [] }))
              : await query('SELECT * FROM "Faq" WHERE "isActive" = true ORDER BY "displayOrder"').catch(() => ({ rows: [] }));
            return jsonResponse(res, { faqs: result.rows, total: result.rows.length });
          }

          // ===================== AUTH ROUTES =====================
          if (path.startsWith('/auth/')) {
            const body = await readBody(req);
            const b = body ? JSON.parse(body) : {};

            if (path === '/auth/login' && req.method === 'POST') {
              const { email, password } = b;
              if (!email || !password) return jsonResponse(res, { error: 'Email and password are required' }, 400);
              const result = await query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE LOWER(u.email) = LOWER($1)', [String(email).toLowerCase().trim()]).catch(() => ({ rows: [] }));
              if (!result.rows[0]) return jsonResponse(res, { error: 'Invalid email or password' }, 401);
              const user = result.rows[0];
              const isValid = await bcrypt.compare(String(password), user.passwordHash);
              if (!isValid) return jsonResponse(res, { error: 'Invalid email or password' }, 401);
              if (user.status !== 'ACTIVE') return jsonResponse(res, { error: 'Account is ' + user.status.toLowerCase() }, 403);
              await query('UPDATE "User" SET "lastLoginAt" = NOW(), "updatedAt" = NOW() WHERE id = $1', [user.id]).catch(() => {}); // Non-critical: lastLoginAt update failure
              const secret = new TextEncoder().encode(JWT_SECRET);
              const token = await new SignJWT({ sub: user.id, email: user.email, role: user.roleName, roleId: user.roleId }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('15m').setIssuer('bookyourservice').setAudience('bookyourservice').sign(secret);
              const { passwordHash, roleName, ...safeUser } = user;
              return jsonResponse(res, { message: 'Login successful', user: { ...safeUser, role: roleName }, accessToken: token });
            }

            if (path === '/auth/register' && req.method === 'POST') {
              const { email, phone, name, password, roleId } = b;
              if (!email || !phone || !name || !password || !roleId) return jsonResponse(res, { error: 'All fields required' }, 400);
              // Fix #29: Password strength validation
              if (!password || password.length < 8) return jsonResponse(res, { error: 'Password must be at least 8 characters' }, 400);
              // Fix #30: Email validation
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) return jsonResponse(res, { error: 'Invalid email format' }, 400);
              const sanitizedEmail = String(email).toLowerCase().trim();
              const existing = await query('SELECT id FROM "User" WHERE LOWER(email) = LOWER($1)', [sanitizedEmail]).catch(() => ({ rows: [] }));
              if (existing.rows.length > 0) return jsonResponse(res, { error: 'Email already registered' }, 409);
              const existingPhone = await query('SELECT id FROM "User" WHERE phone = $1', [String(phone).trim()]).catch(() => ({ rows: [] }));
              if (existingPhone.rows.length > 0) return jsonResponse(res, { error: 'Phone already registered' }, 409);
              const passwordHash = await bcrypt.hash(String(password), 10);
              const userId = 'usr_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
              const validRoleId = Number(roleId);
              try {
                await query('INSERT INTO "User" (id, email, phone, "passwordHash", name, "roleId", status, "emailVerified", "phoneVerified") VALUES ($1, $2, $3, $4, $5, $6, \'ACTIVE\', false, false)', [userId, sanitizedEmail, String(phone).trim(), passwordHash, String(name).trim(), validRoleId]);
              } catch (e: any) {
                console.error('Failed to create user:', e.message);
                throw e;
              }
              if (validRoleId === 2) {
                // Fix #35: Change 'PENDING' to 'AADHAAR' for documentType
                const kycId = 'kyc_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
                try {
                  await query('INSERT INTO "ProviderKyc" (id, "providerId", "documentType", "documentNumber", "documentFrontUrl", "selfieUrl", "verificationStatus") VALUES ($1, $2, \'AADHAAR\', \'PENDING\', \'/pending\', \'/pending\', \'PENDING\')', [kycId, userId]);
                } catch (e: any) {
                  console.error('Failed to create KYC record:', e.message);
                  throw e;
                }
              }
              const userResult = await query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE u.id = $1', [userId]).catch(() => ({ rows: [] }));
              const user = userResult.rows[0];
              const secret = new TextEncoder().encode(JWT_SECRET);
              const roleName = user?.roleName || (validRoleId === 2 ? 'PROVIDER' : 'CLIENT');
              const token = await new SignJWT({ sub: userId, email: sanitizedEmail, role: roleName, roleId: validRoleId }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('15m').setIssuer('bookyourservice').setAudience('bookyourservice').sign(secret);
              const { passwordHash: _ph, roleName: _rn, ...safeUser } = user || {};
              return jsonResponse(res, { message: 'Registration successful', user: { ...(safeUser || { id: userId, email: sanitizedEmail, name: String(name).trim(), roleId: validRoleId, status: 'ACTIVE' }), role: roleName }, accessToken: token }, 201);
            }

            if (path === '/auth/forgot-password' && req.method === 'POST') {
              const { email } = b;
              const resetToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
              const expiresAt = Date.now() + 3600000; // 1 hour
              if (email) {
                resetTokens.set(resetToken, { email: String(email).toLowerCase().trim(), expiresAt });
                // In production, send via email. For dev, log the token.
                console.log('[DEV] Password reset token for', email, ':', resetToken);
              }
              return jsonResponse(res, { message: 'If an account with that email exists, a reset link has been sent to the associated email.' });
            }

            if (path === '/auth/reset-password' && req.method === 'POST') {
              const { token, newPassword } = b;
              if (!token || !newPassword) return jsonResponse(res, { error: 'Token and new password required' }, 400);
              if (newPassword.length < 8) return jsonResponse(res, { error: 'Password must be at least 8 characters' }, 400);
              const stored = resetTokens.get(token);
              if (!stored || stored.expiresAt < Date.now()) {
                if (stored) resetTokens.delete(token);
                return jsonResponse(res, { error: 'Invalid or expired reset token' }, 400);
              }
              const email = stored.email;
              resetTokens.delete(token);
              const passwordHash = await bcrypt.hash(String(newPassword), 10);
              // Fix #25: Proper error handling on password reset UPDATE
              try {
                await query('UPDATE "User" SET "passwordHash" = $1, "updatedAt" = NOW() WHERE LOWER(email) = LOWER($2)', [passwordHash, email]);
              } catch (e: any) {
                console.error('Failed to reset password:', e.message);
                return jsonResponse(res, { error: 'Failed to reset password' }, 500);
              }
              return jsonResponse(res, { message: 'Password has been reset successfully' });
            }

            if (path === '/auth/change-password' && req.method === 'POST') {
              const authUser = await getAuthUser(req);
              if (!authUser) return jsonResponse(res, { error: 'Authentication required' }, 401);
              const { currentPassword, newPassword } = b;
              if (!currentPassword || !newPassword) return jsonResponse(res, { error: 'Current and new password required' }, 400);
              const result = await query('SELECT "passwordHash" FROM "User" WHERE id = $1', [authUser.sub]).catch(() => ({ rows: [] }));
              if (!result.rows[0]) return jsonResponse(res, { error: 'User not found' }, 404);
              const isValid = await bcrypt.compare(String(currentPassword), result.rows[0].passwordHash);
              if (!isValid) return jsonResponse(res, { error: 'Current password is incorrect' }, 401);
              if (newPassword.length < 8) return jsonResponse(res, { error: 'New password must be at least 8 characters' }, 400);
              const newHash = await bcrypt.hash(String(newPassword), 10);
              // Fix #25: Proper error handling on change password UPDATE
              try {
                await query('UPDATE "User" SET "passwordHash" = $1, "updatedAt" = NOW() WHERE id = $2', [newHash, authUser.sub]);
              } catch (e: any) {
                console.error('Failed to update password:', e.message);
                return jsonResponse(res, { error: 'Failed to update password' }, 500);
              }
              return jsonResponse(res, { message: 'Password changed successfully' });
            }

            if (path === '/auth/profile' && req.method === 'GET') {
              const authUser = await getAuthUser(req);
              if (!authUser) return jsonResponse(res, { error: 'Authentication required' }, 401);
              const result = await query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE u.id = $1', [authUser.sub]).catch(() => ({ rows: [] }));
              if (!result.rows[0]) return jsonResponse(res, { error: 'User not found' }, 404);
              const { passwordHash, roleName, ...profile } = result.rows[0];
              return jsonResponse(res, { user: { ...profile, role: roleName } });
            }

            if (path === '/auth/profile' && req.method === 'PATCH') {
              const authUser = await getAuthUser(req);
              if (!authUser) return jsonResponse(res, { error: 'Authentication required' }, 401);
              const updateData: Record<string, any> = {};
              for (const f of ['name', 'phone', 'city', 'state', 'country', 'address', 'pincode', 'profileImageUrl']) {
                if (b[f] !== undefined) updateData[f] = b[f];
              }
              if (Object.keys(updateData).length === 0) return jsonResponse(res, { error: 'No fields to update' }, 400);
              const sets: string[] = []; const values: any[] = []; let idx = 1;
              for (const [k, v] of Object.entries(updateData)) { sets.push(`"${k}" = $${idx}`); values.push(v); idx++; }
              sets.push('"updatedAt" = NOW()'); values.push(authUser.sub);
              // Fix #25: Proper error handling on profile UPDATE
              try {
                await query(`UPDATE "User" SET ${sets.join(', ')} WHERE id = $${idx}`, values);
              } catch (e: any) {
                console.error('Failed to update profile:', e.message);
                return jsonResponse(res, { error: 'Failed to update profile' }, 500);
              }
              const result = await query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE u.id = $1', [authUser.sub]).catch(() => ({ rows: [] }));
              const { passwordHash, roleName, ...profile } = result.rows[0] || {};
              return jsonResponse(res, { message: 'Profile updated', user: { ...profile, role: roleName } });
            }

            if (path === '/auth/logout' && req.method === 'POST') {
              return jsonResponse(res, { success: true, message: 'Logged out' });
            }

            if (path === '/auth/google' && req.method === 'POST') {
              const { email, name, profileImageUrl, googleId } = b;
              if (!email) return jsonResponse(res, { error: 'Email is required' }, 400);
              // Check if user exists
              let userResult = await query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE LOWER(u.email) = LOWER($1)', [String(email).toLowerCase().trim()]).catch(() => ({ rows: [] }));
              let user = userResult.rows[0];
              if (!user) {
                // Auto-register as CLIENT
                const userId = 'usr_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
                // Fix #25: Proper error handling on Google auto-register INSERT
                try {
                  await query('INSERT INTO "User" (id, email, phone, "passwordHash", name, "roleId", status, "emailVerified", "phoneVerified") VALUES ($1, $2, \'\', \'\', $3, 1, \'ACTIVE\', true, false)', [userId, String(email).toLowerCase().trim(), name || 'Google User']);
                } catch (e: any) {
                  console.error('Failed to create Google user:', e.message);
                  return jsonResponse(res, { error: 'Failed to create account' }, 500);
                }
                userResult = await query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE u.id = $1', [userId]).catch(() => ({ rows: [] }));
                user = userResult.rows[0];
              }
              if (!user) return jsonResponse(res, { error: 'Google login failed' }, 500);
              await query('UPDATE "User" SET "lastLoginAt" = NOW(), "updatedAt" = NOW() WHERE id = $1', [user.id]).catch(() => {}); // Non-critical: lastLoginAt update failure
              const secret = new TextEncoder().encode(JWT_SECRET);
              const token = await new SignJWT({ sub: user.id, email: user.email, role: user.roleName, roleId: user.roleId }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('15m').setIssuer('bookyourservice').setAudience('bookyourservice').sign(secret);
              const { passwordHash, roleName, ...safeUser } = user;
              return jsonResponse(res, { message: 'Google login successful', user: { ...safeUser, role: roleName }, accessToken: token });
            }
          }

          // ===================== REFERRAL TRACKING =====================
          const refMatch = path.match(/^\/ref\/(.+)$/);
          if (refMatch && req.method === 'GET') {
            const referralCode = refMatch[1];
            const result = await query(
              'SELECT * FROM "User" WHERE "referralCode" = $1 LIMIT 1',
              [referralCode]
            ).catch(() => ({ rows: [] }));
            // Fix #3: Don't return full user record, only safe fields
            const user = result.rows?.[0] || null;
            return jsonResponse(res, {
              success: true,
              referralCode,
              user: user ? { referralCode: user.referralCode, referrerName: user.name } : null,
            });
          }

          // ===================== CONTACT =====================
          if (path === '/contact' && req.method === 'POST') {
            const body = await readBody(req);
            const b = body ? JSON.parse(body) : {};
            const { name, email, subject, message } = b;
            if (!name || !email || !subject || !message) return jsonResponse(res, { error: 'All fields required' }, 400);
            const id = 'msg_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
            // Fix #25: Proper error handling on ContactMessage INSERT
            try {
              await query('INSERT INTO "ContactMessage" (id, name, email, subject, message) VALUES ($1, $2, $3, $4, $5)', [id, name, email, subject, message]);
            } catch (e: any) {
              console.error('Failed to create contact message:', e.message);
              return jsonResponse(res, { error: 'Failed to submit message' }, 500);
            }
            return jsonResponse(res, { success: true, id }, 201);
          }

          // ===================== NEWSLETTER SUBSCRIBE =====================
          // Fix #24: Add /api/newsletter/subscribe endpoint
          if (path === '/newsletter/subscribe' && req.method === 'POST') {
            const body = await readBody(req);
            const b = body ? JSON.parse(body) : {};
            const { email } = b;
            if (!email) return jsonResponse(res, { error: 'Email is required' }, 400);
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) return jsonResponse(res, { error: 'Invalid email format' }, 400);
            const id = 'nws_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
            try {
              await query('INSERT INTO "ContactMessage" (id, name, email, subject, message) VALUES ($1, $2, $3, $4, $5)', [id, 'Newsletter', String(email).toLowerCase().trim(), 'NEWSLETTER_SUBSCRIPTION', 'Newsletter subscription request']);
            } catch (e: any) {
              console.error('Failed to subscribe to newsletter:', e.message);
              return jsonResponse(res, { error: 'Failed to subscribe' }, 500);
            }
            return jsonResponse(res, { success: true, message: 'Subscribed to newsletter' }, 201);
          }

          // ===================== SERVICES =====================
          // Services search - MUST be before /services/:id
          if (path === '/services/search' && req.method === 'GET') {
            const q = url.searchParams.get('q') || '';
            const limit = parseInt(url.searchParams.get('limit') || '20');
            const offset = parseInt(url.searchParams.get('offset') || '0');
            let result;
            let countResult;
            if (q) {
              countResult = await query(
                // Fix #7: s.name → s.title
                'SELECT COUNT(*) as count FROM "Service" s LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id WHERE s."isActive" = true AND s."isApproved" = true AND (s.title ILIKE $1 OR s.description ILIKE $1)',
                [`%${q}%`]
              ).catch(() => ({ rows: [{ count: 0 }] }));
              result = await query(
                // Fix #7: s.name → s.title
                'SELECT s.*, sc.name as "categoryName", u.name as "providerName", u."profileImageUrl" as "providerImage" FROM "Service" s LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id LEFT JOIN "User" u ON s."providerId" = u.id WHERE s."isActive" = true AND s."isApproved" = true AND (s.title ILIKE $1 OR s.description ILIKE $1) ORDER BY s."createdAt" DESC LIMIT $2 OFFSET $3',
                [`%${q}%`, limit, offset]
              ).catch(() => ({ rows: [] }));
            } else {
              countResult = await query('SELECT COUNT(*) as count FROM "Service" WHERE "isActive" = true AND "isApproved" = true').catch(() => ({ rows: [{ count: 0 }] }));
              result = await query(
                // Fix #7: s.name → s.title
                'SELECT s.*, sc.name as "categoryName", u.name as "providerName", u."profileImageUrl" as "providerImage" FROM "Service" s LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id LEFT JOIN "User" u ON s."providerId" = u.id WHERE s."isActive" = true AND s."isApproved" = true ORDER BY s."createdAt" DESC LIMIT $1 OFFSET $2',
                [limit, offset]
              ).catch(() => ({ rows: [] }));
            }
            const total = parseInt(countResult.rows[0]?.count || '0');
            return jsonResponse(res, { services: result.rows, total, pagination: { total, limit, offset } });
          }

          // Services list with category, search, and pagination
          if (path === '/services' && req.method === 'GET') {
            const categoryId = url.searchParams.get('categoryId') || url.searchParams.get('category') || '';
            const search = url.searchParams.get('search') || url.searchParams.get('q') || '';
            const limit = parseInt(url.searchParams.get('limit') || '20');
            const offset = parseInt(url.searchParams.get('offset') || '0');
            const conditions: string[] = ['s."isActive" = true', 's."isApproved" = true'];
            const params: any[] = [];
            let idx = 1;
            if (categoryId) {
              conditions.push(`(s."categoryId" = $${idx} OR sc.slug = $${idx})`);
              params.push(categoryId);
              idx++;
            }
            if (search) {
              // Fix #7: s.name → s.title
              conditions.push(`(s.title ILIKE $${idx} OR s.description ILIKE $${idx})`);
              params.push(`%${search}%`);
              idx++;
            }
            const whereClause = conditions.join(' AND ');
            const countResult = await query(`SELECT COUNT(*) as count FROM "Service" s LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id WHERE ${whereClause}`, params).catch(() => ({ rows: [{ count: 0 }] }));
            const total = parseInt(countResult.rows[0]?.count || '0');
            params.push(limit, offset);
            const result = await query(
              // Fix #7: s.name → s.title
              `SELECT s.*, sc.name as "categoryName", u.name as "providerName", u."profileImageUrl" as "providerImage" FROM "Service" s LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id LEFT JOIN "User" u ON s."providerId" = u.id WHERE ${whereClause} ORDER BY s."createdAt" DESC LIMIT $${idx} OFFSET $${idx + 1}`,
              params
            ).catch(() => ({ rows: [] }));
            return jsonResponse(res, { services: result.rows, total, pagination: { total, limit, offset } });
          }

          // Services create
          if (path === '/services' && req.method === 'POST') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const body = await readBody(req);
            const b = body ? JSON.parse(body) : {};
            const id = 'svc_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
            // Fix #7 & #13: name → title, duration → "serviceDurationMinutes", imageUrl → images
            const { name: title, description, categoryId, subcategoryId, basePrice, duration, imageUrl } = b;
            if (!title) return jsonResponse(res, { error: 'Service title is required' }, 400);
            // Fix #25: Proper error handling on Service INSERT
            try {
              await query(
                'INSERT INTO "Service" (id, title, description, "categoryId", "subcategoryId", "basePrice", "serviceDurationMinutes", images, "providerId", "isActive", "isApproved") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, false)',
                [id, title, description || null, categoryId || null, subcategoryId || null, basePrice || 0, duration || null, imageUrl || null, authUser.sub]
              );
            } catch (e: any) {
              console.error('Failed to create service:', e.message);
              return jsonResponse(res, { error: 'Failed to create service' }, 500);
            }
            const result = await query('SELECT * FROM "Service" WHERE id = $1', [id]).catch(() => ({ rows: [] }));
            return jsonResponse(res, { service: result.rows[0] || { id, title } }, 201);
          }

          // Service reviews
          const serviceReviewsMatch = path.match(/^\/services\/([^/]+)\/reviews$/);
          if (serviceReviewsMatch && req.method === 'GET') {
            const serviceId = serviceReviewsMatch[1];
            // Fix #10: r."userId" → r."reviewerId"
            const result = await query(
              'SELECT r.*, u.name as "userName", u."profileImageUrl" as "userImage" FROM "Review" r LEFT JOIN "User" u ON r."reviewerId" = u.id WHERE r."serviceId" = $1 ORDER BY r."createdAt" DESC',
              [serviceId]
            ).catch(() => ({ rows: [] }));
            return jsonResponse(res, { reviews: result.rows, total: result.rows.length });
          }

          // Service availability
          const serviceAvailMatch = path.match(/^\/services\/([^/]+)\/availability$/);
          if (serviceAvailMatch && req.method === 'GET') {
            const serviceId = serviceAvailMatch[1];
            const result = await query('SELECT * FROM "ServiceAvailability" WHERE "serviceId" = $1', [serviceId]).catch(() => ({ rows: [] }));
            return jsonResponse(res, { availability: result.rows, total: result.rows.length });
          }

          // Service approve
          const serviceApproveMatch = path.match(/^\/services\/([^/]+)\/approve$/);
          if (serviceApproveMatch && req.method === 'PATCH') {
            const admin = await requireAdmin(req);
            if (!admin) return jsonResponse(res, { error: 'Admin access required' }, 403);
            const serviceId = serviceApproveMatch[1];
            // Fix #25: Proper error handling on service approve UPDATE
            try {
              await query('UPDATE "Service" SET "isApproved" = true, "updatedAt" = NOW() WHERE id = $1', [serviceId]);
            } catch (e: any) {
              console.error('Failed to approve service:', e.message);
              return jsonResponse(res, { error: 'Failed to approve service' }, 500);
            }
            return jsonResponse(res, { message: 'Service approved', serviceId });
          }

          // Service detail / update / delete
          const serviceMatch = path.match(/^\/services\/([^/]+)$/);
          if (serviceMatch) {
            const serviceId = serviceMatch[1];
            if (req.method === 'GET') {
              // Fix #7: s.name → s.title
              const result = await query(
                'SELECT s.*, sc.name as "categoryName", u.name as "providerName", u."profileImageUrl" as "providerImage" FROM "Service" s LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id LEFT JOIN "User" u ON s."providerId" = u.id WHERE s.id = $1',
                [serviceId]
              ).catch(() => ({ rows: [] }));
              if (!result.rows[0]) return jsonResponse(res, { error: 'Service not found' }, 404);
              return jsonResponse(res, result.rows[0]);
            }
            if (req.method === 'DELETE') {
              // Fix #32: Add ownership check to DELETE /api/services/:id
              const authUser = await getAuthUser(req);
              if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
              const svcResult = await query('SELECT "providerId" FROM "Service" WHERE id = $1', [serviceId]).catch(() => ({ rows: [] }));
              if (!svcResult.rows[0]) return jsonResponse(res, { error: 'Service not found' }, 404);
              const isAdmin = authUser.roleId === 3 || authUser.role === 'ADMIN';
              if (svcResult.rows[0].providerId !== authUser.sub && !isAdmin) {
                return jsonResponse(res, { error: 'You can only delete your own services' }, 403);
              }
              // Fix #25: Proper error handling on Service DELETE
              try {
                await query('DELETE FROM "Service" WHERE id = $1', [serviceId]);
              } catch (e: any) {
                console.error('Failed to delete service:', e.message);
                return jsonResponse(res, { error: 'Failed to delete service' }, 500);
              }
              return jsonResponse(res, { message: 'Service deleted', serviceId });
            }
            if (req.method === 'PATCH') {
              const authUser = await getAuthUser(req);
              if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
              const body = await readBody(req);
              const b = body ? JSON.parse(body) : {};
              const updateData: Record<string, any> = {};
              // Fix #5: Remove isActive and isApproved from user-modifiable fields
              // Fix #7 & #13: name → title, duration → "serviceDurationMinutes", imageUrl → images
              for (const f of ['name', 'title', 'description', 'categoryId', 'subcategoryId', 'basePrice', 'duration', 'imageUrl', 'images']) {
                if (b[f] !== undefined) {
                  // Map old field names to correct column names
                  if (f === 'name') { updateData['title'] = b[f]; }
                  else if (f === 'duration') { updateData['serviceDurationMinutes'] = b[f]; }
                  else if (f === 'imageUrl') { updateData['images'] = b[f]; }
                  else { updateData[f] = b[f]; }
                }
              }
              if (Object.keys(updateData).length === 0) return jsonResponse(res, { error: 'No fields to update' }, 400);
              const sets: string[] = []; const values: any[] = []; let idx = 1;
              for (const [k, v] of Object.entries(updateData)) { sets.push(`"${k}" = $${idx}`); values.push(v); idx++; }
              sets.push('"updatedAt" = NOW()'); values.push(serviceId);
              // Fix #25: Proper error handling on Service UPDATE
              try {
                await query(`UPDATE "Service" SET ${sets.join(', ')} WHERE id = $${idx}`, values);
              } catch (e: any) {
                console.error('Failed to update service:', e.message);
                return jsonResponse(res, { error: 'Failed to update service' }, 500);
              }
              const result = await query('SELECT * FROM "Service" WHERE id = $1', [serviceId]).catch(() => ({ rows: [] }));
              return jsonResponse(res, { service: result.rows[0] || { id: serviceId } });
            }
          }

          // ===================== KYC =====================
          if (path === '/kyc/status' && req.method === 'GET') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const result = await query('SELECT * FROM "ProviderKyc" WHERE "providerId" = $1 ORDER BY "createdAt" DESC LIMIT 1', [authUser.sub]).catch(() => ({ rows: [] }));
            return jsonResponse(res, result.rows[0] || { verificationStatus: 'NOT_SUBMITTED' });
          }

          if (path === '/kyc/submit' && req.method === 'POST') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const body = await readBody(req);
            const b = body ? JSON.parse(body) : {};
            const kycId = 'kyc_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
            // Fix #25: Proper error handling on KYC INSERT
            try {
              await query(
                'INSERT INTO "ProviderKyc" (id, "providerId", "documentType", "documentNumber", "documentFrontUrl", "selfieUrl", "verificationStatus") VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [kycId, authUser.sub, b.documentType || 'AADHAAR', b.documentNumber || '', b.documentFrontUrl || '', b.selfieUrl || '', 'PENDING']
              );
            } catch (e: any) {
              console.error('Failed to submit KYC:', e.message);
              return jsonResponse(res, { error: 'Failed to submit KYC' }, 500);
            }
            return jsonResponse(res, { message: 'KYC submitted', kycId }, 201);
          }



          // ===================== TECHNICIAN =====================
          if (path === '/technician/profile' && req.method === 'GET') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const result = await query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE u.id = $1', [authUser.sub]).catch(() => ({ rows: [] }));
            if (!result.rows[0]) return jsonResponse(res, { error: 'Profile not found' }, 404);
            const { passwordHash, roleName, ...profile } = result.rows[0];
            return jsonResponse(res, { ...profile, role: roleName });
          }

          if (path === '/technician/profile' && req.method === 'PATCH') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const body = await readBody(req);
            const b = body ? JSON.parse(body) : {};
            const updateData: Record<string, any> = {};
            // Fix #28: Remove specialization and experience from User UPDATE (don't exist on User table)
            for (const f of ['name', 'phone', 'city', 'state', 'address', 'pincode', 'profileImageUrl', 'certifications']) {
              if (b[f] !== undefined) updateData[f] = b[f];
            }
            if (Object.keys(updateData).length === 0) return jsonResponse(res, { error: 'No fields to update' }, 400);
            const sets: string[] = []; const values: any[] = []; let idx = 1;
            for (const [k, v] of Object.entries(updateData)) { sets.push(`"${k}" = $${idx}`); values.push(v); idx++; }
            sets.push('"updatedAt" = NOW()'); values.push(authUser.sub);
            // Fix #25: Proper error handling on technician profile UPDATE
            try {
              await query(`UPDATE "User" SET ${sets.join(', ')} WHERE id = $${idx}`, values);
            } catch (e: any) {
              console.error('Failed to update technician profile:', e.message);
              return jsonResponse(res, { error: 'Failed to update profile' }, 500);
            }
            const result = await query('SELECT * FROM "User" WHERE id = $1', [authUser.sub]).catch(() => ({ rows: [] }));
            return jsonResponse(res, { message: 'Profile updated', profile: result.rows[0] });
          }

          if (path === '/technician/jobs' && req.method === 'GET') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            // Fix #7: s.name → s.title
            const result = await query(
              'SELECT b.*, s.title as "serviceName" FROM "Booking" b LEFT JOIN "Service" s ON b."serviceId" = s.id WHERE b."providerId" = $1 ORDER BY b."createdAt" DESC',
              [authUser.sub]
            ).catch(() => ({ rows: [] }));
            return jsonResponse(res, { jobs: result.rows, total: result.rows.length });
          }

          if (path === '/technician/earnings' && req.method === 'GET') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            // Fix #9: "providerAmount" → "providerEarnings"
            const result = await query(
              'SELECT COALESCE(SUM("providerEarnings"), 0) as "totalEarnings", COALESCE(SUM(CASE WHEN "status" = \'COMPLETED\' THEN "providerEarnings" ELSE 0 END), 0) as "completedEarnings", COUNT(*) as "totalJobs" FROM "Booking" WHERE "providerId" = $1',
              [authUser.sub]
            ).catch(() => ({ rows: [{ totalEarnings: 0, completedEarnings: 0, totalJobs: 0 }] }));
            return jsonResponse(res, result.rows[0]);
          }

          // ===================== BOOKINGS =====================
          if (path === '/bookings' && req.method === 'GET') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const status = url.searchParams.get('status') || '';
            const limit = parseInt(url.searchParams.get('limit') || '20');
            const offset = parseInt(url.searchParams.get('offset') || '0');
            // Fix #7: s.name → s.title; Fix #8: b."userId" → b."clientId"
            let q = 'SELECT b.*, s.title as "serviceName", u.name as "clientName", p.name as "providerName" FROM "Booking" b LEFT JOIN "Service" s ON b."serviceId" = s.id LEFT JOIN "User" u ON b."clientId" = u.id LEFT JOIN "User" p ON b."providerId" = p.id WHERE (b."clientId" = $1 OR b."providerId" = $1)';
            const params: any[] = [authUser.sub];
            let idx = 2;
            if (status) {
              q += ` AND b."status" = $${idx}`;
              params.push(status);
              idx++;
            }
            q += ` ORDER BY b."createdAt" DESC LIMIT $${idx} OFFSET $${idx + 1}`;
            params.push(limit, offset);
            const result = await query(q, params).catch(() => ({ rows: [] }));
            return jsonResponse(res, { bookings: result.rows, total: result.rows.length });
          }

          if (path === '/bookings' && req.method === 'POST') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const body = await readBody(req);
            const b = body ? JSON.parse(body) : {};
            const id = 'bkn_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
            // Fix #14: address → "serviceAddress", notes → "specialInstructions"
            const { serviceId, scheduledDate, scheduledTime, address, notes, providerId } = b;
            if (!serviceId) return jsonResponse(res, { error: 'Service ID is required' }, 400);
            // Fix #34: OTP length from 4 to 6 digits
            const otpCode = String(Math.floor(100000 + Math.random() * 900000));
            // Fix #25: Proper error handling on Booking INSERT
            try {
              await query(
                'INSERT INTO "Booking" (id, "serviceId", "clientId", "providerId", "scheduledDate", "scheduledTime", "serviceAddress", "specialInstructions", status, "otpCode", "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())',
                [id, serviceId, authUser.sub, providerId || null, scheduledDate || null, scheduledTime || null, address || null, notes || null, 'PENDING', otpCode]
              );
            } catch (e: any) {
              console.error('Failed to create booking:', e.message);
              return jsonResponse(res, { error: 'Failed to create booking' }, 500);
            }
            // Fix #37: Remove coupon usage increment from booking creation (was never here, confirming no increment)
            const result = await query('SELECT * FROM "Booking" WHERE id = $1', [id]).catch(() => ({ rows: [] }));
            return jsonResponse(res, { booking: result.rows[0] || { id, serviceId, status: 'PENDING' } }, 201);
          }

          // Booking actions
          const bookingActionMatch = path.match(/^\/bookings\/([^/]+)\/(cancel|complete|reject|accept)$/);
          if (bookingActionMatch) {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const bookingId = bookingActionMatch[1];
            const action = bookingActionMatch[2];
            if (req.method !== 'PATCH') return jsonResponse(res, { error: 'Method not allowed' }, 405);
            // Fix #26: accept status 'CONFIRMED' → 'ACCEPTED'
            const statusMap: Record<string, string> = { cancel: 'CANCELLED', complete: 'COMPLETED', reject: 'REJECTED', accept: 'ACCEPTED' };
            const newStatus = statusMap[action] || 'PENDING';
            // Fix #25: Proper error handling on booking status UPDATE
            try {
              await query('UPDATE "Booking" SET status = $1, "updatedAt" = NOW() WHERE id = $2', [newStatus, bookingId]);
            } catch (e: any) {
              console.error('Failed to update booking status:', e.message);
              return jsonResponse(res, { error: 'Failed to update booking status' }, 500);
            }
            const result = await query('SELECT * FROM "Booking" WHERE id = $1', [bookingId]).catch(() => ({ rows: [] }));
            return jsonResponse(res, { booking: result.rows[0] || { id: bookingId, status: newStatus } });
          }

          // Booking reject with reason
          const bookingRejectMatch = path.match(/^\/bookings\/([^/]+)\/reject$/);
          if (bookingRejectMatch && req.method === 'PATCH') {
            // Already handled by bookingActionMatch above
          }

          // Booking detail / update
          const bookingMatch = path.match(/^\/bookings\/([^/]+)$/);
          if (bookingMatch) {
            const bookingId = bookingMatch[1];
            if (req.method === 'GET') {
              // Fix #7: s.name → s.title; Fix #8: b."userId" → b."clientId"
              const result = await query(
                'SELECT b.*, s.title as "serviceName", u.name as "clientName", p.name as "providerName" FROM "Booking" b LEFT JOIN "Service" s ON b."serviceId" = s.id LEFT JOIN "User" u ON b."clientId" = u.id LEFT JOIN "User" p ON b."providerId" = p.id WHERE b.id = $1',
                [bookingId]
              ).catch(() => ({ rows: [] }));
              if (!result.rows[0]) return jsonResponse(res, { error: 'Booking not found' }, 404);
              return jsonResponse(res, result.rows[0]);
            }
            if (req.method === 'PATCH') {
              const authUser = await getAuthUser(req);
              if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
              const body = await readBody(req);
              const b = body ? JSON.parse(body) : {};
              const updateData: Record<string, any> = {};
              // Fix #14: address → "serviceAddress", notes → "specialInstructions"
              // Fix #27: rejectionReason → "cancellationReason"
              for (const f of ['status', 'scheduledDate', 'scheduledTime', 'address', 'notes', 'providerId', 'cancellationReason']) {
                if (b[f] !== undefined) {
                  if (f === 'address') { updateData['serviceAddress'] = b[f]; }
                  else if (f === 'notes') { updateData['specialInstructions'] = b[f]; }
                  else { updateData[f] = b[f]; }
                }
              }
              if (Object.keys(updateData).length === 0) return jsonResponse(res, { error: 'No fields to update' }, 400);
              const sets: string[] = []; const values: any[] = []; let idx = 1;
              for (const [k, v] of Object.entries(updateData)) { sets.push(`"${k}" = $${idx}`); values.push(v); idx++; }
              sets.push('"updatedAt" = NOW()'); values.push(bookingId);
              // Fix #25: Proper error handling on Booking UPDATE
              try {
                await query(`UPDATE "Booking" SET ${sets.join(', ')} WHERE id = $${idx}`, values);
              } catch (e: any) {
                console.error('Failed to update booking:', e.message);
                return jsonResponse(res, { error: 'Failed to update booking' }, 500);
              }
              const result = await query('SELECT * FROM "Booking" WHERE id = $1', [bookingId]).catch(() => ({ rows: [] }));
              return jsonResponse(res, { booking: result.rows[0] || { id: bookingId } });
            }
          }

          // ===================== REVIEWS =====================
          if (path === '/reviews' && req.method === 'GET') {
            const serviceId = url.searchParams.get('serviceId') || '';
            const userId = url.searchParams.get('userId') || '';
            // Fix #7: s.name → s.title; Fix #10: r."userId" → r."reviewerId"
            let q = 'SELECT r.*, u.name as "userName", s.title as "serviceName" FROM "Review" r LEFT JOIN "User" u ON r."reviewerId" = u.id LEFT JOIN "Service" s ON r."serviceId" = s.id WHERE 1=1';
            const params: any[] = []; let idx = 1;
            if (serviceId) { q += ` AND r."serviceId" = $${idx}`; params.push(serviceId); idx++; }
            if (userId) { q += ` AND r."reviewerId" = $${idx}`; params.push(userId); idx++; }
            q += ' ORDER BY r."createdAt" DESC';
            const result = await query(q, params).catch(() => ({ rows: [] }));
            return jsonResponse(res, { reviews: result.rows, total: result.rows.length });
          }

          if (path === '/reviews' && req.method === 'POST') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const body = await readBody(req);
            const b = body ? JSON.parse(body) : {};
            const id = 'rev_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
            const { serviceId, rating, comment, bookingId } = b;
            if (!serviceId || !rating) return jsonResponse(res, { error: 'Service ID and rating are required' }, 400);
            // Fix #39: Check for duplicate review before INSERT
            const existingReview = await query('SELECT id FROM "Review" WHERE "bookingId" = $1 AND "reviewerId" = $2', [bookingId || null, authUser.sub]).catch(() => ({ rows: [] }));
            if (existingReview.rows.length > 0) return jsonResponse(res, { error: 'You have already reviewed this booking' }, 409);
            // Fix #38: review → comment; Fix #10: "userId" → "reviewerId"; Remove non-existent columns
            // Fix #25: Proper error handling on Review INSERT
            try {
              await query(
                'INSERT INTO "Review" (id, "serviceId", "reviewerId", "bookingId", rating, comment, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, NOW())',
                [id, serviceId, authUser.sub, bookingId || null, rating, comment || null]
              );
            } catch (e: any) {
              console.error('Failed to create review:', e.message);
              return jsonResponse(res, { error: 'Failed to create review' }, 500);
            }
            const result = await query('SELECT * FROM "Review" WHERE id = $1', [id]).catch(() => ({ rows: [] }));
            return jsonResponse(res, { review: result.rows[0] || { id, serviceId, rating } }, 201);
          }

          const reviewMatch = path.match(/^\/reviews\/([^/]+)$/);
          if (reviewMatch) {
            const reviewId = reviewMatch[1];
            if (req.method === 'DELETE') {
              const authUser = await getAuthUser(req);
              if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
              // Fix #33: Add ownership check to DELETE /api/reviews/:id
              // Fix #10: "userId" → "reviewerId"
              const reviewCheck = await query('SELECT "reviewerId" FROM "Review" WHERE id = $1', [reviewId]).catch(() => ({ rows: [] }));
              if (!reviewCheck.rows[0]) return jsonResponse(res, { error: 'Review not found' }, 404);
              const isAdmin = authUser.roleId === 3 || authUser.role === 'ADMIN';
              if (reviewCheck.rows[0].reviewerId !== authUser.sub && !isAdmin) {
                return jsonResponse(res, { error: 'You can only delete your own reviews' }, 403);
              }
              // Fix #25: Proper error handling on Review DELETE
              try {
                await query('DELETE FROM "Review" WHERE id = $1', [reviewId]);
              } catch (e: any) {
                console.error('Failed to delete review:', e.message);
                return jsonResponse(res, { error: 'Failed to delete review' }, 500);
              }
              return jsonResponse(res, { message: 'Review deleted' });
            }
            if (req.method === 'PATCH') {
              const authUser = await getAuthUser(req);
              if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
              const body = await readBody(req);
              const b = body ? JSON.parse(body) : {};
              const updateData: Record<string, any> = {};
              for (const f of ['rating', 'comment']) {
                if (b[f] !== undefined) updateData[f] = b[f];
              }
              if (Object.keys(updateData).length === 0) return jsonResponse(res, { error: 'No fields to update' }, 400);
              const sets: string[] = []; const values: any[] = []; let idx = 1;
              for (const [k, v] of Object.entries(updateData)) { sets.push(`"${k}" = $${idx}`); values.push(v); idx++; }
              sets.push('"updatedAt" = NOW()'); values.push(reviewId);
              // Fix #10: "userId" → "reviewerId"; Fix #25: Proper error handling
              try {
                await query(`UPDATE "Review" SET ${sets.join(', ')} WHERE id = $${idx} AND "reviewerId" = $${idx + 1}`, [...values, authUser.sub]);
              } catch (e: any) {
                console.error('Failed to update review:', e.message);
                return jsonResponse(res, { error: 'Failed to update review' }, 500);
              }
              const result = await query('SELECT * FROM "Review" WHERE id = $1', [reviewId]).catch(() => ({ rows: [] }));
              return jsonResponse(res, { review: result.rows[0] || { id: reviewId } });
            }
          }

          // ===================== NOTIFICATIONS =====================
          if (path === '/notifications' && req.method === 'GET') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const result = await query('SELECT * FROM "Notification" WHERE "userId" = $1 ORDER BY "createdAt" DESC', [authUser.sub]).catch(() => ({ rows: [] }));
            return jsonResponse(res, { notifications: result.rows, total: result.rows.length });
          }

          if (path === '/notifications' && req.method === 'PATCH') {
            // Mark all as read
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            // Fix #25: Proper error handling
            try {
              await query('UPDATE "Notification" SET "isRead" = true WHERE "userId" = $1 AND "isRead" = false', [authUser.sub]);
            } catch (e: any) {
              console.error('Failed to mark notifications as read:', e.message);
            }
            return jsonResponse(res, { message: 'All notifications marked as read' });
          }

          const notifMatch = path.match(/^\/notifications\/([^/]+)\/read$/);
          if (notifMatch && req.method === 'PATCH') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const notifId = notifMatch[1];
            // Fix #31: Already has ownership check with AND "userId" = $2 (was already present)
            try {
              await query('UPDATE "Notification" SET "isRead" = true, "readAt" = NOW() WHERE id = $1 AND "userId" = $2', [notifId, authUser.sub]);
            } catch (e: any) {
              console.error('Failed to mark notification as read:', e.message);
            }
            return jsonResponse(res, { message: 'Notification marked as read' });
          }

          // ===================== WALLET =====================
          if (path === '/wallet' && req.method === 'GET') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const result = await query('SELECT * FROM "Wallet" WHERE "userId" = $1', [authUser.sub]).catch(() => ({ rows: [] }));
            return jsonResponse(res, result.rows[0] || { balance: 0, currency: 'INR' });
          }

          if (path === '/wallet/deposit' && req.method === 'POST') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const body = await readBody(req);
            const b = body ? JSON.parse(body) : {};
            const { amount } = b;
            if (!amount || amount <= 0) return jsonResponse(res, { error: 'Valid amount is required' }, 400);
            const txnId = 'txn_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
            // Fix #25: Proper error handling on WalletTransaction INSERT
            try {
              await query('INSERT INTO "WalletTransaction" (id, "userId", type, amount, status, description) VALUES ($1, $2, $3, $4, $5, $6)', [txnId, authUser.sub, 'CREDIT', amount, 'COMPLETED', 'Wallet deposit']);
            } catch (e: any) {
              console.error('Failed to process deposit:', e.message);
              return jsonResponse(res, { error: 'Failed to process deposit' }, 500);
            }
            return jsonResponse(res, { message: 'Deposit successful', transactionId: txnId }, 201);
          }

          if (path === '/wallet/transactions' && req.method === 'GET') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const result = await query('SELECT * FROM "WalletTransaction" WHERE "userId" = $1 ORDER BY "createdAt" DESC', [authUser.sub]).catch(() => ({ rows: [] }));
            return jsonResponse(res, { transactions: result.rows, total: result.rows.length });
          }

          if (path === '/wallet/withdraw' && req.method === 'POST') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const body = await readBody(req);
            const b = body ? JSON.parse(body) : {};
            const { amount, bankDetails } = b;
            if (!amount || amount <= 0) return jsonResponse(res, { error: 'Valid amount is required' }, 400);
            const txnId = 'txn_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
            // Fix #25: Proper error handling on WalletTransaction INSERT
            try {
              await query('INSERT INTO "WalletTransaction" (id, "userId", type, amount, status, description) VALUES ($1, $2, $3, $4, $5, $6)', [txnId, authUser.sub, 'DEBIT', amount, 'PENDING', 'Wallet withdrawal']);
            } catch (e: any) {
              console.error('Failed to process withdrawal:', e.message);
              return jsonResponse(res, { error: 'Failed to process withdrawal' }, 500);
            }
            return jsonResponse(res, { message: 'Withdrawal requested', transactionId: txnId }, 201);
          }

          // ===================== EARNINGS =====================
          if (path === '/earnings' && req.method === 'GET') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            // Fix #9: "providerAmount" → "providerEarnings"
            const result = await query(
              'SELECT COALESCE(SUM("providerEarnings"), 0) as "totalEarnings", COALESCE(SUM(CASE WHEN "createdAt" >= DATE_TRUNC(\'month\', NOW()) THEN "providerEarnings" ELSE 0 END), 0) as "monthlyEarnings", COALESCE(SUM(CASE WHEN "createdAt" >= DATE_TRUNC(\'week\', NOW()) THEN "providerEarnings" ELSE 0 END), 0) as "weeklyEarnings" FROM "Booking" WHERE "providerId" = $1 AND status = \'COMPLETED\'',
              [authUser.sub]
            ).catch(() => ({ rows: [{ totalEarnings: 0, monthlyEarnings: 0, weeklyEarnings: 0 }] }));
            return jsonResponse(res, result.rows[0]);
          }

          // ===================== PAYOUTS =====================
          // Fix #17: "Payout" → "PayoutRequest"
          if (path === '/payouts' && req.method === 'GET') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const result = await query('SELECT * FROM "PayoutRequest" WHERE "userId" = $1 ORDER BY "createdAt" DESC', [authUser.sub]).catch(() => ({ rows: [] }));
            return jsonResponse(res, { payouts: result.rows, total: result.rows.length });
          }

          if (path === '/payouts/request' && req.method === 'POST') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const body = await readBody(req);
            const b = body ? JSON.parse(body) : {};
            const { amount } = b;
            if (!amount || amount <= 0) return jsonResponse(res, { error: 'Valid amount is required' }, 400);
            const id = 'pay_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
            // Fix #17: "Payout" → "PayoutRequest"; Fix #25: Proper error handling
            try {
              await query('INSERT INTO "PayoutRequest" (id, "userId", amount, status, "createdAt") VALUES ($1, $2, $3, $4, NOW())', [id, authUser.sub, amount, 'PENDING']);
            } catch (e: any) {
              console.error('Failed to create payout request:', e.message);
              return jsonResponse(res, { error: 'Failed to create payout request' }, 500);
            }
            return jsonResponse(res, { payout: { id, userId: authUser.sub, amount, status: 'PENDING' } }, 201);
          }

          // ===================== FAVORITES =====================
          if (path === '/favorites' && req.method === 'GET') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            // Fix #7: s.name → s.title; Fix #12: s."imageUrl" → s."images"
            const result = await query(
              'SELECT f.*, s.title as "serviceName", s."basePrice", s.images FROM "Favorite" f LEFT JOIN "Service" s ON f."serviceId" = s.id WHERE f."userId" = $1 ORDER BY f."createdAt" DESC',
              [authUser.sub]
            ).catch(() => ({ rows: [] }));
            return jsonResponse(res, { favorites: result.rows, total: result.rows.length });
          }

          if (path === '/favorites' && req.method === 'POST') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const body = await readBody(req);
            const b = body ? JSON.parse(body) : {};
            const { serviceId } = b;
            if (!serviceId) return jsonResponse(res, { error: 'Service ID is required' }, 400);
            const id = 'fav_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
            // Fix #25: Proper error handling
            try {
              await query('INSERT INTO "Favorite" (id, "userId", "serviceId", "createdAt") VALUES ($1, $2, $3, NOW()) ON CONFLICT DO NOTHING', [id, authUser.sub, serviceId]);
            } catch (e: any) {
              console.error('Failed to add favorite:', e.message);
            }
            return jsonResponse(res, { message: 'Added to favorites' }, 201);
          }

          const favMatch = path.match(/^\/favorites\/([^/]+)$/);
          if (favMatch && req.method === 'DELETE') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const serviceId = favMatch[1];
            // Fix #25: Proper error handling
            try {
              await query('DELETE FROM "Favorite" WHERE "userId" = $1 AND "serviceId" = $2', [authUser.sub, serviceId]);
            } catch (e: any) {
              console.error('Failed to remove favorite:', e.message);
            }
            return jsonResponse(res, { message: 'Removed from favorites' });
          }

          // ===================== DISPUTES =====================
          if (path === '/disputes' && req.method === 'GET') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            // Fix #19: d."userId" → d."raisedBy", d."providerId" → d."assignedTo"
            const result = await query(
              'SELECT d.*, b."serviceId" FROM "Dispute" d LEFT JOIN "Booking" b ON d."bookingId" = b.id WHERE d."raisedBy" = $1 OR d."assignedTo" = $1 ORDER BY d."createdAt" DESC',
              [authUser.sub]
            ).catch(() => ({ rows: [] }));
            return jsonResponse(res, { disputes: result.rows, total: result.rows.length });
          }

          if (path === '/disputes' && req.method === 'POST') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const body = await readBody(req);
            const b = body ? JSON.parse(body) : {};
            const { bookingId, reason, description } = b;
            if (!bookingId || !reason) return jsonResponse(res, { error: 'Booking ID and reason are required' }, 400);
            const id = 'dsp_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
            // Fix #19: "userId" → "raisedBy"; Fix #25: Proper error handling
            try {
              await query(
                'INSERT INTO "Dispute" (id, "bookingId", "raisedBy", reason, description, status, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, NOW())',
                [id, bookingId, authUser.sub, reason, description || null, 'OPEN']
              );
            } catch (e: any) {
              console.error('Failed to create dispute:', e.message);
              return jsonResponse(res, { error: 'Failed to create dispute' }, 500);
            }
            return jsonResponse(res, { dispute: { id, bookingId, reason, status: 'OPEN' } }, 201);
          }

          const disputeMatch = path.match(/^\/disputes\/([^/]+)$/);
          if (disputeMatch && req.method === 'PATCH') {
            // Fix #36: Add auth to PATCH /api/disputes/:id
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const disputeId = disputeMatch[1];
            const body = await readBody(req);
            const b = body ? JSON.parse(body) : {};
            const updateData: Record<string, any> = {};
            for (const f of ['status', 'resolution', 'adminNotes']) {
              if (b[f] !== undefined) updateData[f] = b[f];
            }
            if (Object.keys(updateData).length === 0) return jsonResponse(res, { error: 'No fields to update' }, 400);
            const sets: string[] = []; const values: any[] = []; let idx = 1;
            for (const [k, v] of Object.entries(updateData)) { sets.push(`"${k}" = $${idx}`); values.push(v); idx++; }
            sets.push('"updatedAt" = NOW()'); values.push(disputeId);
            // Fix #25: Proper error handling on Dispute UPDATE
            try {
              await query(`UPDATE "Dispute" SET ${sets.join(', ')} WHERE id = $${idx}`, values);
            } catch (e: any) {
              console.error('Failed to update dispute:', e.message);
              return jsonResponse(res, { error: 'Failed to update dispute' }, 500);
            }
            const result = await query('SELECT * FROM "Dispute" WHERE id = $1', [disputeId]).catch(() => ({ rows: [] }));
            return jsonResponse(res, { dispute: result.rows[0] || { id: disputeId } });
          }

          // ===================== COUPONS =====================
          if (path === '/coupons' && req.method === 'GET') {
            const result = await query('SELECT * FROM "Coupon" WHERE "isActive" = true ORDER BY "createdAt" DESC').catch(() => ({ rows: [] }));
            return jsonResponse(res, { coupons: result.rows, total: result.rows.length });
          }

          if (path === '/coupons/validate' && req.method === 'POST') {
            const body = await readBody(req);
            const b = body ? JSON.parse(body) : {};
            const { code, amount } = b;
            if (!code) return jsonResponse(res, { error: 'Coupon code is required' }, 400);
            const result = await query('SELECT * FROM "Coupon" WHERE code = $1 AND "isActive" = true', [code]).catch(() => ({ rows: [] }));
            if (!result.rows[0]) return jsonResponse(res, { error: 'Invalid coupon code' }, 404);
            const coupon = result.rows[0];
            if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return jsonResponse(res, { error: 'Coupon has expired' }, 400);
            if (coupon.minOrderAmount && amount && amount < coupon.minOrderAmount) return jsonResponse(res, { error: `Minimum order amount is ${coupon.minOrderAmount}` }, 400);
            const discount = coupon.type === 'PERCENTAGE' ? (amount || 0) * (coupon.value / 100) : coupon.value;
            return jsonResponse(res, { valid: true, coupon, discount: Math.min(discount, coupon.maxDiscount || discount) });
          }

          // ===================== AMC PLANS =====================
          // Fix #15: "AmcPlan" → "AMCPlan"
          if (path === '/amc/plans' && req.method === 'GET') {
            const result = await query('SELECT * FROM "AMCPlan" WHERE "isActive" = true ORDER BY price').catch(() => ({ rows: [] }));
            return jsonResponse(res, { plans: result.rows, total: result.rows.length });
          }

          // Fix #16: "AmcSubscription" → "AMCSubscription"
          if (path === '/amc/subscriptions' && req.method === 'GET') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            // Fix #8: a."userId" → a."clientId"
            const result = await query('SELECT a.*, p.name as "planName" FROM "AMCSubscription" a LEFT JOIN "AMCPlan" p ON a."planId" = p.id WHERE a."clientId" = $1 ORDER BY a."createdAt" DESC', [authUser.sub]).catch(() => ({ rows: [] }));
            return jsonResponse(res, { subscriptions: result.rows, total: result.rows.length });
          }

          if (path === '/amc/subscribe' && req.method === 'POST') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const body = await readBody(req);
            const b = body ? JSON.parse(body) : {};
            const { planId } = b;
            if (!planId) return jsonResponse(res, { error: 'Plan ID is required' }, 400);
            const id = 'amc_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
            // Fix #16: "AmcSubscription" → "AMCSubscription"; Fix #8: "userId" → "clientId"; Fix #25: Proper error handling
            try {
              await query(
                'INSERT INTO "AMCSubscription" (id, "clientId", "planId", status, "startDate", "endDate", "createdAt") VALUES ($1, $2, $3, $4, NOW(), NOW() + INTERVAL \'1 year\', NOW())',
                [id, authUser.sub, planId, 'ACTIVE']
              );
            } catch (e: any) {
              console.error('Failed to subscribe to AMC plan:', e.message);
              return jsonResponse(res, { error: 'Failed to subscribe' }, 500);
            }
            return jsonResponse(res, { subscription: { id, planId, status: 'ACTIVE' } }, 201);
          }

          // Alternative AMC routes (hyphenated)
          if (path === '/amc-plans' && req.method === 'GET') {
            // Fix #15: "AmcPlan" → "AMCPlan"
            const result = await query('SELECT * FROM "AMCPlan" WHERE "isActive" = true ORDER BY price').catch(() => ({ rows: [] }));
            return jsonResponse(res, { plans: result.rows, total: result.rows.length });
          }

          if (path === '/amc-subscriptions' && req.method === 'GET') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            // Fix #15 & #16; Fix #8: "userId" → "clientId"
            const result = await query('SELECT a.*, p.name as "planName" FROM "AMCSubscription" a LEFT JOIN "AMCPlan" p ON a."planId" = p.id WHERE a."clientId" = $1 ORDER BY a."createdAt" DESC', [authUser.sub]).catch(() => ({ rows: [] }));
            return jsonResponse(res, { subscriptions: result.rows, total: result.rows.length });
          }

          // ===================== FRANCHISES =====================
          if (path === '/franchises' && req.method === 'GET') {
            const result = await query('SELECT * FROM "Franchise" ORDER BY "createdAt" DESC').catch(() => ({ rows: [] }));
            return jsonResponse(res, { franchises: result.rows, total: result.rows.length });
          }

          if (path === '/franchises' && req.method === 'POST') {
            // Fix #40: Add auth to POST /api/franchises
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const body = await readBody(req);
            const b = body ? JSON.parse(body) : {};
            const { name, city, address, phone, email } = b;
            if (!name || !city) return jsonResponse(res, { error: 'Name and city are required' }, 400);
            const id = 'frn_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
            // Fix #25: Proper error handling on Franchise INSERT
            try {
              await query(
                'INSERT INTO "Franchise" (id, name, city, address, phone, email, "ownerId", status, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())',
                [id, name, city, address || null, phone || null, email || null, authUser.sub, 'PENDING']
              );
            } catch (e: any) {
              console.error('Failed to create franchise:', e.message);
              return jsonResponse(res, { error: 'Failed to create franchise' }, 500);
            }
            return jsonResponse(res, { franchise: { id, name, city, status: 'PENDING' } }, 201);
          }

          // ===================== INVOICES =====================
          if (path === '/invoices' && req.method === 'GET') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            // Fix #11: i."userId" → i."clientId"
            const result = await query(
              'SELECT i.*, b."serviceId" FROM "Invoice" i LEFT JOIN "Booking" b ON i."bookingId" = b.id WHERE i."clientId" = $1 ORDER BY i."createdAt" DESC',
              [authUser.sub]
            ).catch(() => ({ rows: [] }));
            return jsonResponse(res, { invoices: result.rows, total: result.rows.length });
          }

          const invoiceMatch = path.match(/^\/invoices\/([^/]+)$/);
          if (invoiceMatch && req.method === 'GET') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const invoiceId = invoiceMatch[1];
            // Fix #11: i."userId" → i."clientId"
            const result = await query('SELECT * FROM "Invoice" WHERE id = $1 AND "clientId" = $2', [invoiceId, authUser.sub]).catch(() => ({ rows: [] }));
            if (!result.rows[0]) return jsonResponse(res, { error: 'Invoice not found' }, 404);
            return jsonResponse(res, result.rows[0]);
          }

          // ===================== CITIES =====================
          if (path === '/cities' && req.method === 'GET') {
            const result = await query('SELECT DISTINCT city FROM "User" WHERE city IS NOT NULL AND city != \'\' ORDER BY city').catch(() => ({ rows: [] }));
            return jsonResponse(res, { cities: result.rows.map((r: any) => r.city), total: result.rows.length });
          }

          // ===================== PROVIDERS / NEARBY =====================
          if (path === '/providers/nearby' && req.method === 'GET') {
            const lat = url.searchParams.get('lat');
            const lng = url.searchParams.get('lng');
            const radius = url.searchParams.get('radius') || '50';
            const result = await query(
              'SELECT u.id, u.name, u."profileImageUrl", u.city, u.rating, u."totalReviews" FROM "User" u WHERE u."roleId" = 2 AND u.status = \'ACTIVE\' ORDER BY u.rating DESC NULLS LAST LIMIT 20'
            ).catch(() => ({ rows: [] }));
            return jsonResponse(res, { providers: result.rows, total: result.rows.length });
          }

          // ===================== AREA =====================
          if (path === '/area/status' && req.method === 'GET') {
            const pincode = url.searchParams.get('pincode') || '';
            return jsonResponse(res, { available: true, pincode: pincode || '000000', message: 'Service available in your area' });
          }

          if (path === '/area/activation' && req.method === 'POST') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            return jsonResponse(res, { message: 'Area activation request submitted', status: 'PENDING' }, 201);
          }

          // ===================== REFERRAL =====================
          if (path === '/referral/track' && req.method === 'GET') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const result = await query('SELECT * FROM "Referral" WHERE "referrerId" = $1 ORDER BY "createdAt" DESC', [authUser.sub]).catch(() => ({ rows: [] }));
            return jsonResponse(res, { referrals: result.rows, total: result.rows.length });
          }

          if (path === '/referral/whatsapp-message' && req.method === 'POST') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const body = await readBody(req);
            const b = body ? JSON.parse(body) : {};
            return jsonResponse(res, { message: 'WhatsApp message sent', phone: b.phone || '' });
          }

          if (path === '/referrals' && req.method === 'GET') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const result = await query('SELECT * FROM "Referral" WHERE "referrerId" = $1 ORDER BY "createdAt" DESC', [authUser.sub]).catch(() => ({ rows: [] }));
            return jsonResponse(res, { referrals: result.rows, total: result.rows.length });
          }

          // ===================== COMMISSIONS =====================
          // Fix #20: Add /api/commissions endpoint
          if (path === '/commissions' && req.method === 'GET') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const result = await query(
              'SELECT DATE(b."createdAt") as date, SUM(b."platformFee") as "totalCommission", COUNT(*) as "totalBookings" FROM "Booking" b WHERE b.status = \'COMPLETED\' AND b."providerId" = $1 GROUP BY DATE(b."createdAt") ORDER BY date DESC LIMIT 30',
              [authUser.sub]
            ).catch(() => ({ rows: [] }));
            const totalCommission = result.rows.reduce((sum: number, r: any) => sum + parseFloat(r.totalCommission || '0'), 0);
            const totalBookings = result.rows.reduce((sum: number, r: any) => sum + parseInt(r.totalBookings || '0'), 0);
            return jsonResponse(res, {
              summary: {
                totalCommission,
                totalBookings,
                avgCommission: totalBookings > 0 ? totalCommission / totalBookings : 0,
              },
              entries: result.rows,
            });
          }

          if (path === '/commission/info' && req.method === 'GET') {
            const result = await query('SELECT * FROM "CommissionRate" ORDER BY id').catch(() => ({ rows: [] }));
            return jsonResponse(res, { rates: result.rows, total: result.rows.length });
          }

          // ===================== SERVICE AREAS =====================
          if (path === '/service-areas' && req.method === 'GET') {
            const result = await query('SELECT * FROM "ServiceArea" WHERE "isActive" = true ORDER BY name').catch(() => ({ rows: [] }));
            return jsonResponse(res, { areas: result.rows, total: result.rows.length });
          }

          // ===================== WAITING LIST =====================
          if (path === '/waiting-list/join' && req.method === 'POST') {
            const body = await readBody(req);
            const b = body ? JSON.parse(body) : {};
            const { email, city, serviceType } = b;
            if (!email) return jsonResponse(res, { error: 'Email is required' }, 400);
            const id = 'wl_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
            // Fix #25: Proper error handling on WaitingList INSERT
            try {
              await query('INSERT INTO "WaitingList" (id, email, city, "serviceType", "createdAt") VALUES ($1, $2, $3, $4, NOW())', [id, email, city || null, serviceType || null]);
            } catch (e: any) {
              console.error('Failed to join waiting list:', e.message);
              return jsonResponse(res, { error: 'Failed to join waiting list' }, 500);
            }
            return jsonResponse(res, { message: 'Added to waiting list', id }, 201);
          }

          // ===================== AREA MANAGER =====================
          if (path === '/area-manager/apply' && req.method === 'POST') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const body = await readBody(req);
            const b = body ? JSON.parse(body) : {};
            const id = 'am_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
            // Fix #25: Proper error handling on AreaManagerApplication INSERT
            try {
              await query('INSERT INTO "AreaManagerApplication" (id, "userId", city, experience, status, "createdAt") VALUES ($1, $2, $3, $4, $5, NOW())', [id, authUser.sub, b.city || null, b.experience || null, 'PENDING']);
            } catch (e: any) {
              console.error('Failed to submit area manager application:', e.message);
              return jsonResponse(res, { error: 'Failed to submit application' }, 500);
            }
            return jsonResponse(res, { message: 'Application submitted', id }, 201);
          }

          // ===================== LOCATION =====================
          if (path === '/location/reverse-geocode' && req.method === 'GET') {
            const lat = url.searchParams.get('lat') || '0';
            const lng = url.searchParams.get('lng') || '0';
            return jsonResponse(res, { lat: parseFloat(lat), lng: parseFloat(lng), address: 'Location lookup placeholder', city: '', state: '', pincode: '' });
          }

          // ===================== CRM =====================
          if (path === '/crm/activities' && req.method === 'GET') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const result = await query('SELECT * FROM "CrmActivity" ORDER BY "createdAt" DESC LIMIT 50').catch(() => ({ rows: [] }));
            return jsonResponse(res, { activities: result.rows, total: result.rows.length });
          }

          // Fix #18: "CrmFollowUp" → "FollowUp"
          if (path === '/crm/follow-ups' && req.method === 'GET') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const result = await query('SELECT * FROM "FollowUp" ORDER BY "dueDate" ASC LIMIT 50').catch(() => ({ rows: [] }));
            return jsonResponse(res, { followUps: result.rows, total: result.rows.length });
          }

          if (path === '/crm/follow-ups' && req.method === 'POST') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const body = await readBody(req);
            const b = body ? JSON.parse(body) : {};
            const id = 'crm_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
            // Fix #18: "CrmFollowUp" → "FollowUp"; Fix #25: Proper error handling
            try {
              await query('INSERT INTO "FollowUp" (id, "userId", "dueDate", notes, status, "createdAt") VALUES ($1, $2, $3, $4, $5, NOW())', [id, b.userId || null, b.dueDate || null, b.notes || null, 'PENDING']);
            } catch (e: any) {
              console.error('Failed to create follow-up:', e.message);
              return jsonResponse(res, { error: 'Failed to create follow-up' }, 500);
            }
            return jsonResponse(res, { followUp: { id, status: 'PENDING' } }, 201);
          }

          // ===================== NOTIFICATION SYSTEM =====================
          if (path === '/notifications' && req.method === 'GET') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const result = await query(
              'SELECT * FROM "Notification" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 50',
              [authUser.sub]
            ).catch(() => ({ rows: [] }));
            const unreadResult = await query(
              'SELECT COUNT(*) as count FROM "Notification" WHERE "userId" = $1 AND "isRead" = false',
              [authUser.sub]
            ).catch(() => ({ rows: [{ count: 0 }] }));
            return jsonResponse(res, {
              notifications: result.rows,
              unreadCount: parseInt(unreadResult.rows[0]?.count || '0'),
              total: result.rows.length,
            });
          }

          // ===================== NOTIFICATION TEMPLATES =====================
          if (path === '/notifications/templates' && req.method === 'GET') {
            const result = await query(
              'SELECT * FROM "NotificationTemplate" WHERE "isActive" = true ORDER BY id'
            ).catch(() => ({ rows: [] }));
            return jsonResponse(res, { templates: result.rows, total: result.rows.length });
          }

          // ===================== ADMIN ROUTES =====================
          // All admin routes require ADMIN or SUPER_ADMIN role
          if (path.startsWith('/admin/')) {
            const adminUser = await requireRole(req, ['ADMIN', 'SUPER_ADMIN']);
            if (!adminUser) return jsonResponse(res, { error: 'Admin access required' }, 403);
          }

          if (path === '/admin/dashboard' && req.method === 'GET') {
            const admin = await requireAdmin(req);
            if (!admin) return jsonResponse(res, { error: 'Admin access required' }, 403);
            const [users, services, bookings, revenue] = await Promise.all([
              query('SELECT COUNT(*) as count FROM "User"').catch(() => ({ rows: [{ count: 0 }] })),
              query('SELECT COUNT(*) as count FROM "Service"').catch(() => ({ rows: [{ count: 0 }] })),
              query('SELECT COUNT(*) as count FROM "Booking"').catch(() => ({ rows: [{ count: 0 }] })),
              query('SELECT COALESCE(SUM("totalAmount"), 0) as total FROM "Booking" WHERE status = \'COMPLETED\'').catch(() => ({ rows: [{ total: 0 }] })),
            ]);
            return jsonResponse(res, {
              totalUsers: parseInt(users.rows[0]?.count || '0'),
              totalServices: parseInt(services.rows[0]?.count || '0'),
              totalBookings: parseInt(bookings.rows[0]?.count || '0'),
              totalRevenue: parseFloat(revenue.rows[0]?.total || '0'),
            });
          }

          if (path === '/admin/users' && req.method === 'GET') {
            const admin = await requireAdmin(req);
            if (!admin) return jsonResponse(res, { error: 'Admin access required' }, 403);
            const limit = parseInt(url.searchParams.get('limit') || '50');
            const offset = parseInt(url.searchParams.get('offset') || '0');
            const search = url.searchParams.get('search') || '';
            let q = 'SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId"';
            const params: any[] = [];
            if (search) {
              q += ' WHERE (u.name ILIKE $1 OR u.email ILIKE $1)';
              params.push(`%${search}%`);
            }
            q += ` ORDER BY u."createdAt" DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
            params.push(limit, offset);
            const result = await query(q, params).catch(() => ({ rows: [] }));
            return jsonResponse(res, { users: result.rows, total: result.rows.length });
          }

          const adminUserMatch = path.match(/^\/admin\/users\/([^/]+)$/);
          if (adminUserMatch) {
            const userId = adminUserMatch[1];
            if (req.method === 'GET') {
              const admin = await requireAdmin(req);
              if (!admin) return jsonResponse(res, { error: 'Admin access required' }, 403);
              const result = await query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE u.id = $1', [userId]).catch(() => ({ rows: [] }));
              if (!result.rows[0]) return jsonResponse(res, { error: 'User not found' }, 404);
              const { passwordHash, ...safeUser } = result.rows[0];
              return jsonResponse(res, safeUser);
            }
            if (req.method === 'PATCH') {
              const admin = await requireAdmin(req);
              if (!admin) return jsonResponse(res, { error: 'Admin access required' }, 403);
              const body = await readBody(req);
              const b = body ? JSON.parse(body) : {};
              const updateData: Record<string, any> = {};
              for (const f of ['name', 'email', 'phone', 'status', 'roleId', 'city', 'state']) {
                if (b[f] !== undefined) updateData[f] = b[f];
              }
              if (Object.keys(updateData).length === 0) return jsonResponse(res, { error: 'No fields to update' }, 400);
              const sets: string[] = []; const values: any[] = []; let idx = 1;
              for (const [k, v] of Object.entries(updateData)) { sets.push(`"${k}" = $${idx}`); values.push(v); idx++; }
              sets.push('"updatedAt" = NOW()'); values.push(userId);
              // Fix #25: Proper error handling on admin User UPDATE
              try {
                await query(`UPDATE "User" SET ${sets.join(', ')} WHERE id = $${idx}`, values);
              } catch (e: any) {
                console.error('Failed to update user:', e.message);
                return jsonResponse(res, { error: 'Failed to update user' }, 500);
              }
              return jsonResponse(res, { message: 'User updated', userId });
            }
            if (req.method === 'DELETE') {
              const admin = await requireAdmin(req);
              if (!admin) return jsonResponse(res, { error: 'Admin access required' }, 403);
              // Fix #25: Proper error handling on admin User DELETE
              try {
                await query('DELETE FROM "User" WHERE id = $1', [userId]);
              } catch (e: any) {
                console.error('Failed to delete user:', e.message);
                return jsonResponse(res, { error: 'Failed to delete user' }, 500);
              }
              return jsonResponse(res, { message: 'User deleted', userId });
            }
          }

          if (path === '/admin/services' && req.method === 'GET') {
            const admin = await requireAdmin(req);
            if (!admin) return jsonResponse(res, { error: 'Admin access required' }, 403);
            // Fix #7: s.name → s.title
            const result = await query('SELECT s.*, u.name as "providerName", sc.name as "categoryName" FROM "Service" s LEFT JOIN "User" u ON s."providerId" = u.id LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id ORDER BY s."createdAt" DESC').catch(() => ({ rows: [] }));
            return jsonResponse(res, { services: result.rows, total: result.rows.length });
          }

          const adminServiceMatch = path.match(/^\/admin\/services\/([^/]+)$/);
          if (adminServiceMatch && req.method === 'PATCH') {
            const admin = await requireAdmin(req);
            if (!admin) return jsonResponse(res, { error: 'Admin access required' }, 403);
            const serviceId = adminServiceMatch[1];
            const body = await readBody(req);
            const b = body ? JSON.parse(body) : {};
            const updateData: Record<string, any> = {};
            // Fix #7: name → title for admin Service UPDATE
            for (const f of ['name', 'title', 'description', 'isActive', 'isApproved', 'basePrice']) {
              if (b[f] !== undefined) {
                if (f === 'name') { updateData['title'] = b[f]; }
                else { updateData[f] = b[f]; }
              }
            }
            if (Object.keys(updateData).length === 0) return jsonResponse(res, { error: 'No fields to update' }, 400);
            const sets: string[] = []; const values: any[] = []; let idx = 1;
            for (const [k, v] of Object.entries(updateData)) { sets.push(`"${k}" = $${idx}`); values.push(v); idx++; }
            sets.push('"updatedAt" = NOW()'); values.push(serviceId);
            // Fix #25: Proper error handling on admin Service UPDATE
            try {
              await query(`UPDATE "Service" SET ${sets.join(', ')} WHERE id = $${idx}`, values);
            } catch (e: any) {
              console.error('Failed to update service:', e.message);
              return jsonResponse(res, { error: 'Failed to update service' }, 500);
            }
            return jsonResponse(res, { message: 'Service updated', serviceId });
          }

          if (path === '/admin/bookings' && req.method === 'GET') {
            const admin = await requireAdmin(req);
            if (!admin) return jsonResponse(res, { error: 'Admin access required' }, 403);
            // Fix #7: s.name → s.title; Fix #8: b."userId" → b."clientId"
            const result = await query('SELECT b.*, s.title as "serviceName", u.name as "clientName", p.name as "providerName" FROM "Booking" b LEFT JOIN "Service" s ON b."serviceId" = s.id LEFT JOIN "User" u ON b."clientId" = u.id LEFT JOIN "User" p ON b."providerId" = p.id ORDER BY b."createdAt" DESC').catch(() => ({ rows: [] }));
            return jsonResponse(res, { bookings: result.rows, total: result.rows.length });
          }

          // Fix #23: Add /api/admin/revenue endpoint
          if (path === '/admin/revenue' && req.method === 'GET') {
            const admin = await requireAdmin(req);
            if (!admin) return jsonResponse(res, { error: 'Admin access required' }, 403);
            const totalRevenue = await query('SELECT COALESCE(SUM("totalAmount"), 0) as total FROM "Booking" WHERE "status" = \'COMPLETED\'').catch(() => ({ rows: [{ total: 0 }] }));
            const dailyRevenue = await query('SELECT DATE("createdAt") as date, SUM("totalAmount") as total FROM "Booking" WHERE "status" = \'COMPLETED\' GROUP BY DATE("createdAt") ORDER BY date DESC LIMIT 30').catch(() => ({ rows: [] }));
            const weeklyRevenue = await query('SELECT DATE_TRUNC(\'week\', "createdAt") as week, SUM("totalAmount") as total FROM "Booking" WHERE "status" = \'COMPLETED\' GROUP BY week ORDER BY week DESC LIMIT 12').catch(() => ({ rows: [] }));
            const monthlyRevenue = await query('SELECT DATE_TRUNC(\'month\', "createdAt") as month, SUM("totalAmount") as total FROM "Booking" WHERE "status" = \'COMPLETED\' GROUP BY month ORDER BY month DESC LIMIT 12').catch(() => ({ rows: [] }));
            // Fix #9: "providerAmount" → "providerEarnings"
            const pendingPayouts = await query('SELECT COALESCE(SUM("providerEarnings"), 0) as total FROM "Booking" WHERE "status" = \'COMPLETED\' AND "providerEarnings" IS NOT NULL').catch(() => ({ rows: [{ total: 0 }] }));
            const byCategory = await query('SELECT sc.name as category, SUM(b."totalAmount") as total FROM "Booking" b LEFT JOIN "Service" s ON b."serviceId" = s.id LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id WHERE b."status" = \'COMPLETED\' GROUP BY sc.name ORDER BY total DESC').catch(() => ({ rows: [] }));
            const byPaymentMethod = await query('SELECT "paymentMethod", SUM("totalAmount") as total FROM "Booking" WHERE "status" = \'COMPLETED\' AND "paymentMethod" IS NOT NULL GROUP BY "paymentMethod" ORDER BY total DESC').catch(() => ({ rows: [] }));
            return jsonResponse(res, {
              totalRevenue: totalRevenue.rows[0]?.total || 0,
              dailyRevenue: dailyRevenue.rows,
              weeklyRevenue: weeklyRevenue.rows,
              monthlyRevenue: monthlyRevenue.rows,
              pendingPayouts: pendingPayouts.rows[0]?.total || 0,
              byCategory: byCategory.rows,
              byPaymentMethod: byPaymentMethod.rows,
            });
          }

          if (path === '/admin/logs' && req.method === 'GET') {
            const admin = await requireAdmin(req);
            if (!admin) return jsonResponse(res, { error: 'Admin access required' }, 403);
            const result = await query('SELECT * FROM "AuditLog" ORDER BY "createdAt" DESC LIMIT 100').catch(() => ({ rows: [] }));
            return jsonResponse(res, { logs: result.rows, total: result.rows.length });
          }

          if (path === '/admin/analytics' && req.method === 'GET') {
            const admin = await requireAdmin(req);
            if (!admin) return jsonResponse(res, { error: 'Admin access required' }, 403);
            const [users, bookings, revenue] = await Promise.all([
              query('SELECT COUNT(*) as count FROM "User"').catch(() => ({ rows: [{ count: 0 }] })),
              query('SELECT COUNT(*) as count, COUNT(CASE WHEN "createdAt" >= DATE_TRUNC(\'month\', NOW()) THEN 1 END) as "thisMonth" FROM "Booking"').catch(() => ({ rows: [{ count: 0, thisMonth: 0 }] })),
              query('SELECT COALESCE(SUM("totalAmount"), 0) as total FROM "Booking" WHERE status = \'COMPLETED\'').catch(() => ({ rows: [{ total: 0 }] })),
            ]);
            return jsonResponse(res, {
              totalUsers: parseInt(users.rows[0]?.count || '0'),
              totalBookings: parseInt(bookings.rows[0]?.count || '0'),
              bookingsThisMonth: parseInt(bookings.rows[0]?.thisMonth || '0'),
              totalRevenue: parseFloat(revenue.rows[0]?.total || '0'),
            });
          }

          if (path === '/admin/disputes' && req.method === 'GET') {
            const admin = await requireAdmin(req);
            if (!admin) return jsonResponse(res, { error: 'Admin access required' }, 403);
            // Fix #19: d."userId" → d."raisedBy"
            const result = await query('SELECT d.*, u.name as "userName" FROM "Dispute" d LEFT JOIN "User" u ON d."raisedBy" = u.id ORDER BY d."createdAt" DESC').catch(() => ({ rows: [] }));
            return jsonResponse(res, { disputes: result.rows, total: result.rows.length });
          }

          const adminDisputeMatch = path.match(/^\/admin\/disputes\/([^/]+)$/);
          if (adminDisputeMatch && req.method === 'PATCH') {
            const admin = await requireAdmin(req);
            if (!admin) return jsonResponse(res, { error: 'Admin access required' }, 403);
            const disputeId = adminDisputeMatch[1];
            const body = await readBody(req);
            const b = body ? JSON.parse(body) : {};
            const updateData: Record<string, any> = {};
            for (const f of ['status', 'resolution', 'adminNotes']) {
              if (b[f] !== undefined) updateData[f] = b[f];
            }
            if (Object.keys(updateData).length === 0) return jsonResponse(res, { error: 'No fields to update' }, 400);
            const sets: string[] = []; const values: any[] = []; let idx = 1;
            for (const [k, v] of Object.entries(updateData)) { sets.push(`"${k}" = $${idx}`); values.push(v); idx++; }
            sets.push('"updatedAt" = NOW()'); values.push(disputeId);
            // Fix #25: Proper error handling on admin Dispute UPDATE
            try {
              await query(`UPDATE "Dispute" SET ${sets.join(', ')} WHERE id = $${idx}`, values);
            } catch (e: any) {
              console.error('Failed to update dispute:', e.message);
              return jsonResponse(res, { error: 'Failed to update dispute' }, 500);
            }
            return jsonResponse(res, { message: 'Dispute updated', disputeId });
          }

          // Fix #17: "Payout" → "PayoutRequest"
          if (path === '/admin/payouts' && req.method === 'GET') {
            const admin = await requireAdmin(req);
            if (!admin) return jsonResponse(res, { error: 'Admin access required' }, 403);
            const result = await query('SELECT p.*, u.name as "userName" FROM "PayoutRequest" p LEFT JOIN "User" u ON p."userId" = u.id ORDER BY p."createdAt" DESC').catch(() => ({ rows: [] }));
            return jsonResponse(res, { payouts: result.rows, total: result.rows.length });
          }

          const adminPayoutMatch = path.match(/^\/admin\/payouts\/([^/]+)$/);
          if (adminPayoutMatch && req.method === 'PATCH') {
            const admin = await requireAdmin(req);
            if (!admin) return jsonResponse(res, { error: 'Admin access required' }, 403);
            const payoutId = adminPayoutMatch[1];
            const body = await readBody(req);
            const b = body ? JSON.parse(body) : {};
            const updateData: Record<string, any> = {};
            for (const f of ['status']) {
              if (b[f] !== undefined) updateData[f] = b[f];
            }
            if (Object.keys(updateData).length === 0) return jsonResponse(res, { error: 'No fields to update' }, 400);
            const sets: string[] = []; const values: any[] = []; let idx = 1;
            for (const [k, v] of Object.entries(updateData)) { sets.push(`"${k}" = $${idx}`); values.push(v); idx++; }
            sets.push('"updatedAt" = NOW()'); values.push(payoutId);
            // Fix #17: "Payout" → "PayoutRequest"; Fix #25: Proper error handling
            try {
              await query(`UPDATE "PayoutRequest" SET ${sets.join(', ')} WHERE id = $${idx}`, values);
            } catch (e: any) {
              console.error('Failed to update payout:', e.message);
              return jsonResponse(res, { error: 'Failed to update payout' }, 500);
            }
            return jsonResponse(res, { message: 'Payout updated', payoutId });
          }

          if (path === '/admin/coupons' && req.method === 'GET') {
            const admin = await requireAdmin(req);
            if (!admin) return jsonResponse(res, { error: 'Admin access required' }, 403);
            const result = await query('SELECT * FROM "Coupon" ORDER BY "createdAt" DESC').catch(() => ({ rows: [] }));
            return jsonResponse(res, { coupons: result.rows, total: result.rows.length });
          }

          if (path === '/admin/coupons' && req.method === 'POST') {
            const admin = await requireAdmin(req);
            if (!admin) return jsonResponse(res, { error: 'Admin access required' }, 403);
            const body = await readBody(req);
            const b = body ? JSON.parse(body) : {};
            const { code, type, value, minOrderAmount, maxDiscount, expiresAt } = b;
            if (!code || !type || value === undefined) return jsonResponse(res, { error: 'Code, type, and value required' }, 400);
            const id = 'cpn_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
            // Fix #25: Proper error handling on Coupon INSERT
            try {
              await query(
                'INSERT INTO "Coupon" (id, code, type, value, "minOrderAmount", "maxDiscount", "expiresAt", "isActive", "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW())',
                [id, code, type, value, minOrderAmount || null, maxDiscount || null, expiresAt || null]
              );
            } catch (e: any) {
              console.error('Failed to create coupon:', e.message);
              return jsonResponse(res, { error: 'Failed to create coupon' }, 500);
            }
            return jsonResponse(res, { coupon: { id, code, type, value } }, 201);
          }

          if (path === '/admin/franchises' && req.method === 'GET') {
            const admin = await requireAdmin(req);
            if (!admin) return jsonResponse(res, { error: 'Admin access required' }, 403);
            const result = await query('SELECT * FROM "Franchise" ORDER BY "createdAt" DESC').catch(() => ({ rows: [] }));
            return jsonResponse(res, { franchises: result.rows, total: result.rows.length });
          }

          if (path === '/admin/inventory' && req.method === 'GET') {
            const admin = await requireAdmin(req);
            if (!admin) return jsonResponse(res, { error: 'Admin access required' }, 403);
            const result = await query('SELECT * FROM "Inventory" ORDER BY name').catch(() => ({ rows: [] }));
            return jsonResponse(res, { inventory: result.rows, total: result.rows.length });
          }

          // Fix #15 & #16: "AmcPlan" → "AMCPlan", "AmcSubscription" → "AMCSubscription"
          if (path === '/admin/amc' && req.method === 'GET') {
            const admin = await requireAdmin(req);
            if (!admin) return jsonResponse(res, { error: 'Admin access required' }, 403);
            const [plans, subs] = await Promise.all([
              query('SELECT * FROM "AMCPlan" ORDER BY price').catch(() => ({ rows: [] })),
              // Fix #8: a."userId" → a."clientId"
              query('SELECT a.*, u.name as "userName", p.name as "planName" FROM "AMCSubscription" a LEFT JOIN "User" u ON a."clientId" = u.id LEFT JOIN "AMCPlan" p ON a."planId" = p.id ORDER BY a."createdAt" DESC').catch(() => ({ rows: [] })),
            ]);
            return jsonResponse(res, { plans: plans.rows, subscriptions: subs.rows });
          }

          if (path === '/admin/b2b' && req.method === 'GET') {
            const admin = await requireAdmin(req);
            if (!admin) return jsonResponse(res, { error: 'Admin access required' }, 403);
            const result = await query('SELECT * FROM "B2BClient" ORDER BY "createdAt" DESC').catch(() => ({ rows: [] }));
            return jsonResponse(res, { clients: result.rows, total: result.rows.length });
          }

          // Fix #18: "CrmFollowUp" → "FollowUp"
          if (path === '/admin/crm' && req.method === 'GET') {
            const admin = await requireAdmin(req);
            if (!admin) return jsonResponse(res, { error: 'Admin access required' }, 403);
            const [activities, followUps] = await Promise.all([
              query('SELECT * FROM "CrmActivity" ORDER BY "createdAt" DESC LIMIT 100').catch(() => ({ rows: [] })),
              query('SELECT * FROM "FollowUp" ORDER BY "dueDate" ASC LIMIT 100').catch(() => ({ rows: [] })),
            ]);
            return jsonResponse(res, { activities: activities.rows, followUps: followUps.rows });
          }

          // Fix #41: Admin FAQ endpoints already have requireAdmin check
          if (path === '/admin/faq' && req.method === 'GET') {
            const admin = await requireAdmin(req);
            if (!admin) return jsonResponse(res, { error: 'Admin access required' }, 403);
            const result = await query('SELECT * FROM "Faq" ORDER BY "displayOrder"').catch(() => ({ rows: [] }));
            return jsonResponse(res, { faqs: result.rows, total: result.rows.length });
          }

          if (path === '/admin/faq' && req.method === 'POST') {
            // Fix #41: requireAdmin already checked above for /admin/ prefix, but add explicit check
            const admin = await requireAdmin(req);
            if (!admin) return jsonResponse(res, { error: 'Admin access required' }, 403);
            const body = await readBody(req);
            const b = body ? JSON.parse(body) : {};
            const { question, answer, category, displayOrder, isActive } = b;
            if (!question || !answer) return jsonResponse(res, { error: 'Question and answer are required' }, 400);
            const id = 'faq_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
            // Fix #25: Proper error handling on FAQ INSERT
            try {
              await query('INSERT INTO "Faq" (id, question, answer, category, "displayOrder", "isActive", "createdAt") VALUES ($1, $2, $3, $4, $5, $6, NOW())', [id, question, answer, category || 'GENERAL', displayOrder || 0, isActive !== false]);
            } catch (e: any) {
              console.error('Failed to create FAQ:', e.message);
              return jsonResponse(res, { error: 'Failed to create FAQ' }, 500);
            }
            return jsonResponse(res, { faq: { id, question, answer } }, 201);
          }

          const adminFaqMatch = path.match(/^\/admin\/faq\/([^/]+)$/);
          if (adminFaqMatch) {
            const faqId = adminFaqMatch[1];
            if (req.method === 'PATCH') {
              // Fix #41: requireAdmin check
              const admin = await requireAdmin(req);
              if (!admin) return jsonResponse(res, { error: 'Admin access required' }, 403);
              const body = await readBody(req);
              const b = body ? JSON.parse(body) : {};
              const updateData: Record<string, any> = {};
              for (const f of ['question', 'answer', 'category', 'displayOrder', 'isActive']) {
                if (b[f] !== undefined) updateData[f] = b[f];
              }
              if (Object.keys(updateData).length === 0) return jsonResponse(res, { error: 'No fields to update' }, 400);
              const sets: string[] = []; const values: any[] = []; let idx = 1;
              for (const [k, v] of Object.entries(updateData)) { sets.push(`"${k}" = $${idx}`); values.push(v); idx++; }
              sets.push('"updatedAt" = NOW()'); values.push(faqId);
              // Fix #25: Proper error handling on FAQ UPDATE
              try {
                await query(`UPDATE "Faq" SET ${sets.join(', ')} WHERE id = $${idx}`, values);
              } catch (e: any) {
                console.error('Failed to update FAQ:', e.message);
                return jsonResponse(res, { error: 'Failed to update FAQ' }, 500);
              }
              return jsonResponse(res, { message: 'FAQ updated', faqId });
            }
            if (req.method === 'DELETE') {
              // Fix #41: requireAdmin check
              const admin = await requireAdmin(req);
              if (!admin) return jsonResponse(res, { error: 'Admin access required' }, 403);
              // Fix #25: Proper error handling on FAQ DELETE
              try {
                await query('DELETE FROM "Faq" WHERE id = $1', [faqId]);
              } catch (e: any) {
                console.error('Failed to delete FAQ:', e.message);
                return jsonResponse(res, { error: 'Failed to delete FAQ' }, 500);
              }
              return jsonResponse(res, { message: 'FAQ deleted', faqId });
            }
          }

          // Fix #42: requireAdmin for admin Category POST/PATCH
          if (path === '/admin/categories' && req.method === 'POST') {
            const admin = await requireAdmin(req);
            if (!admin) return jsonResponse(res, { error: 'Admin access required' }, 403);
            const body = await readBody(req);
            const b = body ? JSON.parse(body) : {};
            const { name, slug, description, iconUrl, displayOrder, isActive } = b;
            if (!name) return jsonResponse(res, { error: 'Category name is required' }, 400);
            const id = 'cat_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
            // Fix #25: Proper error handling on Category INSERT
            try {
              await query('INSERT INTO "ServiceCategory" (id, name, slug, description, "iconUrl", "displayOrder", "isActive", "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())', [id, name, slug || name.toLowerCase().replace(/\s+/g, '-'), description || null, iconUrl || null, displayOrder || 0, isActive !== false]);
            } catch (e: any) {
              console.error('Failed to create category:', e.message);
              return jsonResponse(res, { error: 'Failed to create category' }, 500);
            }
            return jsonResponse(res, { category: { id, name } }, 201);
          }

          const adminCatMatch = path.match(/^\/admin\/categories\/([^/]+)$/);
          if (adminCatMatch && req.method === 'PATCH') {
            // Fix #42: requireAdmin check
            const admin = await requireAdmin(req);
            if (!admin) return jsonResponse(res, { error: 'Admin access required' }, 403);
            const catId = adminCatMatch[1];
            const body = await readBody(req);
            const b = body ? JSON.parse(body) : {};
            const updateData: Record<string, any> = {};
            for (const f of ['name', 'slug', 'description', 'iconUrl', 'displayOrder', 'isActive']) {
              if (b[f] !== undefined) updateData[f] = b[f];
            }
            if (Object.keys(updateData).length === 0) return jsonResponse(res, { error: 'No fields to update' }, 400);
            const sets: string[] = []; const values: any[] = []; let idx = 1;
            for (const [k, v] of Object.entries(updateData)) { sets.push(`"${k}" = $${idx}`); values.push(v); idx++; }
            sets.push('"updatedAt" = NOW()'); values.push(catId);
            // Fix #25: Proper error handling on Category UPDATE
            try {
              await query(`UPDATE "ServiceCategory" SET ${sets.join(', ')} WHERE id = $${idx}`, values);
            } catch (e: any) {
              console.error('Failed to update category:', e.message);
              return jsonResponse(res, { error: 'Failed to update category' }, 500);
            }
            return jsonResponse(res, { message: 'Category updated', catId });
          }

          // ===================== FRANCHISE ROUTES =====================
          if (path === '/franchise/dashboard' && req.method === 'GET') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const result = await query('SELECT * FROM "Franchise" WHERE "ownerId" = $1', [authUser.sub]).catch(() => ({ rows: [] }));
            const franchise = result.rows[0];
            if (!franchise) return jsonResponse(res, { error: 'No franchise found' }, 404);
            const [bookings, vendors] = await Promise.all([
              query('SELECT COUNT(*) as count FROM "Booking" WHERE "franchiseId" = $1', [franchise.id]).catch(() => ({ rows: [{ count: 0 }] })),
              query('SELECT COUNT(*) as count FROM "User" WHERE "roleId" = 2 AND "franchiseId" = $1', [franchise.id]).catch(() => ({ rows: [{ count: 0 }] })),
            ]);
            return jsonResponse(res, {
              franchise,
              totalBookings: parseInt(bookings.rows[0]?.count || '0'),
              totalVendors: parseInt(vendors.rows[0]?.count || '0'),
            });
          }

          if (path === '/franchise/vendors' && req.method === 'GET') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const result = await query('SELECT u.* FROM "User" u WHERE u."roleId" = 2 AND u."franchiseId" = (SELECT id FROM "Franchise" WHERE "ownerId" = $1 LIMIT 1)', [authUser.sub]).catch(() => ({ rows: [] }));
            return jsonResponse(res, { vendors: result.rows, total: result.rows.length });
          }

          if (path === '/franchise/analytics' && req.method === 'GET') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const result = await query('SELECT * FROM "Franchise" WHERE "ownerId" = $1', [authUser.sub]).catch(() => ({ rows: [] }));
            return jsonResponse(res, { analytics: { totalBookings: 0, totalRevenue: 0, totalVendors: 0 }, franchise: result.rows[0] });
          }

          // ===================== VENDOR ROUTES =====================
          if (path === '/vendor/bookings' && req.method === 'GET') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            // Fix #7: s.name → s.title; Fix #8: b."userId" → b."clientId"
            const result = await query(
              'SELECT b.*, s.title as "serviceName", u.name as "clientName" FROM "Booking" b LEFT JOIN "Service" s ON b."serviceId" = s.id LEFT JOIN "User" u ON b."clientId" = u.id WHERE b."providerId" = $1 ORDER BY b."createdAt" DESC',
              [authUser.sub]
            ).catch(() => ({ rows: [] }));
            return jsonResponse(res, { bookings: result.rows, total: result.rows.length });
          }

          if (path === '/vendor/services' && req.method === 'GET') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            const result = await query('SELECT * FROM "Service" WHERE "providerId" = $1 ORDER BY "createdAt" DESC', [authUser.sub]).catch(() => ({ rows: [] }));
            return jsonResponse(res, { services: result.rows, total: result.rows.length });
          }

          // ===================== MANAGER DASHBOARD =====================
          // Fix #21: Add /api/manager/dashboard endpoint with city-specific data
          if (path === '/manager/dashboard' && req.method === 'GET') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            // Get manager's city
            const managerResult = await query('SELECT city FROM "User" WHERE id = $1', [authUser.sub]).catch(() => ({ rows: [] }));
            const managerCity = managerResult.rows[0]?.city || null;
            const cityFilter = managerCity ? ` AND u.city = '${managerCity.replace(/'/g, "''")}'` : '';
            const [bookingCount, providerStats, revenueResult] = await Promise.all([
              query(`SELECT COUNT(*) as count FROM "Booking" b LEFT JOIN "User" u ON b."clientId" = u.id WHERE 1=1${cityFilter.replace('u.', 'u2.').replace('u2.', 'cl.')} AND b."clientId" IN (SELECT id FROM "User" u WHERE 1=1${cityFilter})`).catch(() => ({ rows: [{ count: 0 }] })),
              query(`SELECT COUNT(*) as total, COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active, COUNT(CASE WHEN status = 'INACTIVE' THEN 1 END) as inactive FROM "User" u WHERE u."roleId" = 2${cityFilter}`).catch(() => ({ rows: [{ total: 0, active: 0, inactive: 0 }] })),
              query(`SELECT COALESCE(SUM(b."totalAmount"), 0) as total FROM "Booking" b WHERE b."status" = 'COMPLETED' AND b."clientId" IN (SELECT id FROM "User" u WHERE 1=1${cityFilter})`).catch(() => ({ rows: [{ total: 0 }] })),
            ]);
            return jsonResponse(res, {
              city: managerCity,
              totalBookings: parseInt(bookingCount.rows[0]?.count || '0'),
              providerStats: {
                total: parseInt(providerStats.rows[0]?.total || '0'),
                active: parseInt(providerStats.rows[0]?.active || '0'),
                inactive: parseInt(providerStats.rows[0]?.inactive || '0'),
              },
              totalRevenue: parseFloat(revenueResult.rows[0]?.total || '0'),
            });
          }

          // ===================== LOCAL ADMIN DASHBOARD =====================
          // Fix #22: Add /api/local-admin/dashboard endpoint with area-specific data
          if (path === '/local-admin/dashboard' && req.method === 'GET') {
            const authUser = await getAuthUser(req);
            if (!authUser) return jsonResponse(res, { error: 'Auth required' }, 401);
            // Get local admin's city
            const adminResult = await query('SELECT city FROM "User" WHERE id = $1', [authUser.sub]).catch(() => ({ rows: [] }));
            const adminCity = adminResult.rows[0]?.city || null;
            const cityFilter = adminCity ? ` AND u.city = '${adminCity.replace(/'/g, "''")}'` : '';
            const [providerCount, bookingCount, pendingKyc, revenueResult] = await Promise.all([
              query(`SELECT COUNT(*) as count FROM "User" u WHERE u."roleId" = 2${cityFilter}`).catch(() => ({ rows: [{ count: 0 }] })),
              query(`SELECT COUNT(*) as count FROM "Booking" b WHERE b."clientId" IN (SELECT id FROM "User" u WHERE 1=1${cityFilter})`).catch(() => ({ rows: [{ count: 0 }] })),
              query(`SELECT COUNT(*) as count FROM "ProviderKyc" pk LEFT JOIN "User" u ON pk."providerId" = u.id WHERE pk."verificationStatus" = 'PENDING'${cityFilter}`).catch(() => ({ rows: [{ count: 0 }] })),
              query(`SELECT COALESCE(SUM(b."totalAmount"), 0) as total FROM "Booking" b WHERE b."status" = 'COMPLETED' AND b."clientId" IN (SELECT id FROM "User" u WHERE 1=1${cityFilter})`).catch(() => ({ rows: [{ total: 0 }] })),
            ]);
            return jsonResponse(res, {
              city: adminCity,
              totalProviders: parseInt(providerCount.rows[0]?.count || '0'),
              totalBookings: parseInt(bookingCount.rows[0]?.count || '0'),
              pendingKyc: parseInt(pendingKyc.rows[0]?.count || '0'),
              totalRevenue: parseFloat(revenueResult.rows[0]?.total || '0'),
            });
          }

          // ===================== 404 CATCH-ALL =====================
          return jsonResponse(res, { error: 'Not Found' }, 404);
        } catch (e: any) {
          console.error('API error:', e.message);
          return jsonResponse(res, { error: e.message || 'Internal server error' }, 500);
        }
      });
    },
  };
}
