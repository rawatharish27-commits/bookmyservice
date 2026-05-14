import type { Plugin } from 'vite';

let pool: any = null;

async function getPool() {
  if (!pool) {
    const { Pool } = await import('pg');
    pool = new Pool({
      connectionString: 'postgresql://postgres.oblhyxdjwrqtdycvnoky:x6fpra3VPHUwsoqn@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres',
      ssl: { rejectUnauthorized: false },
      max: 2,
      idleTimeoutMillis: 20000,
      connectionTimeoutMillis: 8000,
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

export default function apiPlugin(): Plugin {
  return {
    name: 'vite-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res, next) => {
        const url = new URL(req.url || '/', 'http://localhost');
        const path = url.pathname;

        try {
          // Legal pages
          if (path === '/legal' && req.method === 'GET') {
            const result = await query('SELECT id, "pageType", title, version, "effectiveDate", "updatedAt" FROM "LegalPage" ORDER BY id ASC');
            return jsonResponse(res, { documents: result.rows, total: result.rows.length });
          }

          const legalMatch = path.match(/^\/legal\/(.+)$/);
          if (legalMatch && req.method === 'GET') {
            const typeParam = legalMatch[1];
            const pageType = TYPE_MAP[typeParam] || typeParam.toUpperCase();
            const result = await query('SELECT * FROM "LegalPage" WHERE "pageType" = $1', [pageType]);
            if (!result.rows[0]) return jsonResponse(res, { error: `Not found: ${typeParam}` }, 404);
            return jsonResponse(res, result.rows[0]);
          }

          // Categories
          if (path === '/categories' && req.method === 'GET') {
            const result = await query('SELECT * FROM "ServiceCategory" WHERE "isActive" = true ORDER BY "displayOrder"');
            return jsonResponse(res, { categories: result.rows, total: result.rows.length });
          }

          const catMatch = path.match(/^\/categories\/(.+)$/);
          if (catMatch && req.method === 'GET') {
            const result = await query('SELECT * FROM "ServiceCategory" WHERE id = $1 OR slug = $1', [catMatch[1]]);
            if (!result.rows[0]) return jsonResponse(res, { error: 'Not found' }, 404);
            return jsonResponse(res, result.rows[0]);
          }

          // FAQ
          if (path === '/faq' && req.method === 'GET') {
            const category = url.searchParams.get('category');
            const result = category
              ? await query('SELECT * FROM "Faq" WHERE category = $1 AND "isActive" = true ORDER BY "displayOrder"', [category])
              : await query('SELECT * FROM "Faq" WHERE "isActive" = true ORDER BY "displayOrder"');
            return jsonResponse(res, { faqs: result.rows, total: result.rows.length });
          }

          // Auth routes
          if (path.startsWith('/auth/')) {
            const body = await readBody(req);
            const b = body ? JSON.parse(body) : {};

            if (path === '/auth/login' && req.method === 'POST') {
              const { email, password } = b;
              if (!email || !password) return jsonResponse(res, { error: 'Email and password are required' }, 400);
              const result = await query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE LOWER(u.email) = LOWER($1)', [String(email).toLowerCase().trim()]);
              if (!result.rows[0]) return jsonResponse(res, { error: 'Invalid email or password' }, 401);
              const user = result.rows[0];
              const bcrypt = require('bcryptjs');
              const isValid = await bcrypt.compare(String(password), user.passwordHash);
              if (!isValid) return jsonResponse(res, { error: 'Invalid email or password' }, 401);
              if (user.status !== 'ACTIVE') return jsonResponse(res, { error: 'Account is ' + user.status.toLowerCase() }, 403);
              await query('UPDATE "User" SET "lastLoginAt" = NOW(), "updatedAt" = NOW() WHERE id = $1', [user.id]).catch(() => {});
              const { SignJWT } = require('jose');
              const secret = new TextEncoder().encode('bys-dev-secret-key-change-in-production-2024');
              const token = await new SignJWT({ sub: user.id, email: user.email, role: user.roleName, roleId: user.roleId }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('15m').setIssuer('bookyourservice').setAudience('bookyourservice').sign(secret);
              const { passwordHash, roleName, ...safeUser } = user;
              return jsonResponse(res, { message: 'Login successful', user: { ...safeUser, role: roleName }, accessToken: token });
            }

            if (path === '/auth/register' && req.method === 'POST') {
              const { email, phone, name, password, roleId } = b;
              if (!email || !phone || !name || !password || !roleId) return jsonResponse(res, { error: 'All fields required' }, 400);
              const sanitizedEmail = String(email).toLowerCase().trim();
              const existing = await query('SELECT id FROM "User" WHERE LOWER(email) = LOWER($1)', [sanitizedEmail]);
              if (existing.rows.length > 0) return jsonResponse(res, { error: 'Email already registered' }, 409);
              const existingPhone = await query('SELECT id FROM "User" WHERE phone = $1', [String(phone).trim()]);
              if (existingPhone.rows.length > 0) return jsonResponse(res, { error: 'Phone already registered' }, 409);
              const bcrypt = require('bcryptjs');
              const passwordHash = await bcrypt.hash(String(password), 10);
              const userId = 'usr_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
              const validRoleId = Number(roleId);
              await query('INSERT INTO "User" (id, email, phone, "passwordHash", name, "roleId", status, "emailVerified", "phoneVerified") VALUES ($1, $2, $3, $4, $5, $6, \'ACTIVE\', false, false)', [userId, sanitizedEmail, String(phone).trim(), passwordHash, String(name).trim(), validRoleId]);
              if (validRoleId === 2) {
                const kycId = 'kyc_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
                await query('INSERT INTO "ProviderKyc" (id, "providerId", "documentType", "documentNumber", "documentFrontUrl", "selfieUrl", "verificationStatus") VALUES ($1, $2, \'PENDING\', \'PENDING\', \'/pending\', \'/pending\', \'PENDING\')', [kycId, userId]).catch(() => {});
              }
              const userResult = await query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE u.id = $1', [userId]);
              const user = userResult.rows[0];
              const { SignJWT } = require('jose');
              const secret = new TextEncoder().encode('bys-dev-secret-key-change-in-production-2024');
              const roleName = user?.roleName || (validRoleId === 2 ? 'PROVIDER' : 'CLIENT');
              const token = await new SignJWT({ sub: userId, email: sanitizedEmail, role: roleName, roleId: validRoleId }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('15m').setIssuer('bookyourservice').setAudience('bookyourservice').sign(secret);
              const { passwordHash: _ph, roleName: _rn, ...safeUser } = user || {};
              return jsonResponse(res, { message: 'Registration successful', user: { ...(safeUser || { id: userId, email: sanitizedEmail, name: String(name).trim(), roleId: validRoleId, status: 'ACTIVE' }), role: roleName }, accessToken: token }, 201);
            }

            if (path === '/auth/forgot-password' && req.method === 'POST') {
              return jsonResponse(res, { message: 'If an account with that email exists, a reset token has been generated.', resetToken: crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, ''), expiresAt: new Date(Date.now() + 3600000).toISOString() });
            }

            if (path === '/auth/reset-password' && req.method === 'POST') {
              const { token, newPassword, email } = b;
              if (!token || !newPassword || !email) return jsonResponse(res, { error: 'Token, new password, and email required' }, 400);
              if (newPassword.length < 8) return jsonResponse(res, { error: 'Password must be at least 8 characters' }, 400);
              if (token.length < 32) return jsonResponse(res, { error: 'Invalid token' }, 400);
              const bcrypt = require('bcryptjs');
              const passwordHash = await bcrypt.hash(String(newPassword), 10);
              await query('UPDATE "User" SET "passwordHash" = $1, "updatedAt" = NOW() WHERE LOWER(email) = LOWER($2)', [passwordHash, String(email).toLowerCase().trim()]);
              return jsonResponse(res, { message: 'Password has been reset successfully' });
            }

            if (path === '/auth/change-password' && req.method === 'POST') {
              const authHeader = req.headers.authorization;
              if (!authHeader?.startsWith('Bearer ')) return jsonResponse(res, { error: 'Authentication required' }, 401);
              const { jwtVerify } = require('jose');
              const secret = new TextEncoder().encode('bys-dev-secret-key-change-in-production-2024');
              const { payload } = await jwtVerify(authHeader.split(' ')[1], secret, { issuer: 'bookyourservice', audience: 'bookyourservice' });
              const { currentPassword, newPassword } = b;
              if (!currentPassword || !newPassword) return jsonResponse(res, { error: 'Current and new password required' }, 400);
              const result = await query('SELECT "passwordHash" FROM "User" WHERE id = $1', [payload.sub]);
              if (!result.rows[0]) return jsonResponse(res, { error: 'User not found' }, 404);
              const bcrypt = require('bcryptjs');
              const isValid = await bcrypt.compare(String(currentPassword), result.rows[0].passwordHash);
              if (!isValid) return jsonResponse(res, { error: 'Current password is incorrect' }, 401);
              if (newPassword.length < 8) return jsonResponse(res, { error: 'New password must be at least 8 characters' }, 400);
              const newHash = await bcrypt.hash(String(newPassword), 10);
              await query('UPDATE "User" SET "passwordHash" = $1, "updatedAt" = NOW() WHERE id = $2', [newHash, payload.sub]);
              return jsonResponse(res, { message: 'Password changed successfully' });
            }

            if (path === '/auth/profile' && req.method === 'GET') {
              const authHeader = req.headers.authorization;
              if (!authHeader?.startsWith('Bearer ')) return jsonResponse(res, { error: 'Authentication required' }, 401);
              const { jwtVerify } = require('jose');
              const secret = new TextEncoder().encode('bys-dev-secret-key-change-in-production-2024');
              const { payload } = await jwtVerify(authHeader.split(' ')[1], secret, { issuer: 'bookyourservice', audience: 'bookyourservice' });
              const result = await query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE u.id = $1', [payload.sub]);
              if (!result.rows[0]) return jsonResponse(res, { error: 'User not found' }, 404);
              const { passwordHash, roleName, ...profile } = result.rows[0];
              return jsonResponse(res, { user: { ...profile, role: roleName } });
            }

            if (path === '/auth/profile' && req.method === 'PATCH') {
              const authHeader = req.headers.authorization;
              if (!authHeader?.startsWith('Bearer ')) return jsonResponse(res, { error: 'Authentication required' }, 401);
              const { jwtVerify } = require('jose');
              const secret = new TextEncoder().encode('bys-dev-secret-key-change-in-production-2024');
              const { payload } = await jwtVerify(authHeader.split(' ')[1], secret, { issuer: 'bookyourservice', audience: 'bookyourservice' });
              const updateData: Record<string, any> = {};
              for (const f of ['name', 'phone', 'city', 'state', 'country', 'address', 'pincode', 'profileImageUrl']) {
                if (b[f] !== undefined) updateData[f] = b[f];
              }
              if (Object.keys(updateData).length === 0) return jsonResponse(res, { error: 'No fields to update' }, 400);
              const sets: string[] = []; const values: any[] = []; let idx = 1;
              for (const [k, v] of Object.entries(updateData)) { sets.push(`"${k}" = $${idx}`); values.push(v); idx++; }
              sets.push('"updatedAt" = NOW()'); values.push(payload.sub);
              await query(`UPDATE "User" SET ${sets.join(', ')} WHERE id = $${idx}`, values);
              const result = await query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE u.id = $1', [payload.sub]);
              const { passwordHash, roleName, ...profile } = result.rows[0];
              return jsonResponse(res, { message: 'Profile updated', user: { ...profile, role: roleName } });
            }

            if (path === '/auth/logout' && req.method === 'POST') {
              return jsonResponse(res, { success: true, message: 'Logged out' });
            }
          }

          // Contact
          if (path === '/contact' && req.method === 'POST') {
            const { name, email, subject, message } = b || {};
            if (!name || !email || !subject || !message) return jsonResponse(res, { error: 'All fields required' }, 400);
            const id = 'msg_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
            await query('INSERT INTO "ContactMessage" (id, name, email, subject, message) VALUES ($1, $2, $3, $4, $5)', [id, name, email, subject, message]);
            return jsonResponse(res, { success: true, id }, 201);
          }

          // Stats
          if (path === '/stats/platform' && req.method === 'GET') {
            const result = await query('SELECT * FROM "PlatformStats" ORDER BY id DESC LIMIT 1');
            return jsonResponse(res, result.rows[0] || { totalVisitors: 0, totalUsers: 0, totalProviders: 0, totalBookings: 0, totalServices: 0, activeVisitors: 0 });
          }

          // Services
          if (path === '/services' && req.method === 'GET') {
            const result = await query('SELECT * FROM "Service" WHERE "isActive" = true AND "isApproved" = true LIMIT 20');
            return jsonResponse(res, { services: result.rows, total: result.rows.length });
          }

          // 404
          return jsonResponse(res, { error: 'Not Found' }, 404);
        } catch (e: any) {
          console.error('API error:', e.message);
          return jsonResponse(res, { error: e.message || 'Internal server error' }, 500);
        }
      });
    },
  };
}
