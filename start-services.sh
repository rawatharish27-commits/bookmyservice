#!/bin/bash

# Kill existing processes
pkill -f "next dev" 2>/dev/null
pkill -f "hono" 2>/dev/null
pkill -f "port 3001" 2>/dev/null
sleep 2

# Start API service on port 3001
cd /home/z/my-project/mini-services/api-service
node -e "
const { serve } = require('@hono/node-server');
const { Hono } = require('hono');
const { cors } = require('hono/cors');
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.oblhyxdjwrqtdycvnoky:x6fpra3VPHUwsoqn@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }, max: 3, idleTimeoutMillis: 30000, connectionTimeoutMillis: 10000
});
const app = new Hono();
app.use('*', cors({ origin: '*', allowHeaders: ['Content-Type', 'Authorization'], allowMethods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'] }));
app.get('/health', (c) => c.json({ status: 'ok' }));
app.get('/api/categories', async (c) => { try { const r = await pool.query('SELECT id, name, slug, description, icon, \"imageUrl\", \"displayOrder\" FROM \"ServiceCategory\" WHERE \"isActive\" = true ORDER BY \"displayOrder\"'); return c.json({ categories: r.rows, total: r.rows.length }); } catch(e) { console.error(e); return c.json({ error: 'Failed' }, 500); } });
app.get('/api/categories/:id', async (c) => { try { const id = c.req.param('id'); const r = await pool.query('SELECT * FROM \"ServiceCategory\" WHERE id::text = \$1 OR slug = \$1', [id]); if (!r.rows[0]) return c.json({ error: 'Not found' }, 404); const sub = await pool.query('SELECT * FROM \"ServiceSubcategory\" WHERE \"categoryId\" = \$1 AND \"isActive\" = true ORDER BY \"displayOrder\"', [r.rows[0].id]); return c.json({ ...r.rows[0], subcategories: sub.rows }); } catch(e) { return c.json({ error: 'Failed' }, 500); } });
app.get('/api/subcategories', async (c) => { try { const cid = c.req.query('categoryId'); if (cid) { const r = await pool.query('SELECT * FROM \"ServiceSubcategory\" WHERE \"categoryId\" = \$1 AND \"isActive\" = true ORDER BY \"displayOrder\"', [parseInt(cid)]); return c.json({ subcategories: r.rows, total: r.rows.length }); } const r = await pool.query('SELECT * FROM \"ServiceSubcategory\" WHERE \"isActive\" = true ORDER BY \"categoryId\", \"displayOrder\"'); return c.json({ subcategories: r.rows, total: r.rows.length }); } catch(e) { return c.json({ error: 'Failed' }, 500); } });
app.get('/api/services', async (c) => { try { const limit = parseInt(c.req.query('limit') || '20'); const r = await pool.query('SELECT s.*, u.name as \"providerName\", sc.name as \"categoryName\", sc.slug as \"categorySlug\", sc.icon as \"categoryIcon\", sc.\"imageUrl\" as \"categoryImage\" FROM \"Service\" s LEFT JOIN \"User\" u ON s.\"providerId\" = u.id LEFT JOIN \"ServiceCategory\" sc ON s.\"categoryId\" = sc.id WHERE s.\"isActive\" = true AND s.\"isApproved\" = true ORDER BY s.\"isFeatured\" DESC, s.\"averageRating\" DESC LIMIT \$1', [limit]); return c.json({ services: r.rows, total: r.rows.length }); } catch(e) { return c.json({ error: 'Failed' }, 500); } });
app.get('/api/services/:id', async (c) => { try { const id = c.req.param('id'); const r = await pool.query('SELECT s.*, u.name as \"providerName\", u.\"profileImageUrl\" as \"providerImage\", sc.name as \"categoryName\", sc.slug as \"categorySlug\", sc.icon as \"categoryIcon\", sc.\"imageUrl\" as \"categoryImage\" FROM \"Service\" s LEFT JOIN \"User\" u ON s.\"providerId\" = u.id LEFT JOIN \"ServiceCategory\" sc ON s.\"categoryId\" = sc.id WHERE s.id = \$1', [id]); if (!r.rows[0]) return c.json({ error: 'Not found' }, 404); return c.json(r.rows[0]); } catch(e) { return c.json({ error: 'Failed' }, 500); } });
app.get('/api/faq', async (c) => { try { const r = await pool.query('SELECT * FROM \"Faq\" WHERE \"isActive\" = true ORDER BY \"displayOrder\"'); return c.json({ faqs: r.rows, total: r.rows.length }); } catch(e) { return c.json({ error: 'Failed' }, 500); } });
app.get('/api/stats/platform', async (c) => { try { const r = await pool.query('SELECT * FROM \"PlatformStats\" ORDER BY id DESC LIMIT 1'); return c.json(r.rows[0] || { totalVisitors: 0, totalUsers: 0, totalProviders: 0, totalBookings: 0, totalServices: 0, activeVisitors: 0 }); } catch(e) { return c.json({ totalVisitors: 0, totalUsers: 0, totalProviders: 0, totalBookings: 0, totalServices: 0, activeVisitors: 0 }); } });
app.post('/api/auth/login', async (c) => { try { const { email, password } = await c.req.json(); if (!email || !password) return c.json({ error: 'Email and password are required' }, 400); const bcrypt = require('bcryptjs'); const { SignJWT } = require('jose'); const r = await pool.query('SELECT u.*, r.name as \"roleName\" FROM \"User\" u JOIN \"Role\" r ON r.id = u.\"roleId\" WHERE LOWER(u.email) = LOWER(\$1)', [String(email).toLowerCase().trim()]); if (!r.rows[0]) return c.json({ error: 'Invalid email or password' }, 401); const user = r.rows[0]; const isValid = await bcrypt.compare(String(password), user.passwordHash); if (!isValid) return c.json({ error: 'Invalid email or password' }, 401); if (user.status !== 'ACTIVE') return c.json({ error: 'Account is ' + user.status.toLowerCase() }, 403); await pool.query('UPDATE \"User\" SET \"lastLoginAt\" = NOW() WHERE id = \$1', [user.id]); const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'bys-dev-secret-key-change-in-production-2024'); const token = await new SignJWT({ sub: user.id, email: user.email, role: user.roleName, roleId: user.roleId }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('15m').setIssuer('bookyourservice').setAudience('bookyourservice').sign(secret); const { passwordHash, roleName, ...safeUser } = user; return c.json({ message: 'Login successful', user: { ...safeUser, role: roleName }, accessToken: token }); } catch(e) { console.error('Login error:', e); return c.json({ error: 'Login failed' }, 500); } });
app.post('/api/auth/register', async (c) => { try { const { email, phone, name, password, roleId } = await c.req.json(); if (!email || !phone || !name || !password || !roleId) return c.json({ error: 'All fields required' }, 400); const bcrypt = require('bcryptjs'); const { SignJWT } = require('jose'); const existing = await pool.query('SELECT id FROM \"User\" WHERE LOWER(email) = LOWER(\$1)', [String(email).toLowerCase().trim()]); if (existing.rows.length > 0) return c.json({ error: 'Email already registered' }, 409); const passwordHash = await bcrypt.hash(String(password), 10); const userId = 'usr_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20); await pool.query('INSERT INTO \"User\" (id, email, phone, \"passwordHash\", name, \"roleId\", status, \"emailVerified\", \"phoneVerified\") VALUES (\$1, \$2, \$3, \$4, \$5, \$6, \\'ACTIVE\\', false, false)', [userId, String(email).toLowerCase().trim(), String(phone).trim(), passwordHash, String(name).trim(), Number(roleId)]); const userResult = await pool.query('SELECT u.*, r.name as \"roleName\" FROM \"User\" u JOIN \"Role\" r ON r.id = u.\"roleId\" WHERE u.id = \$1', [userId]); const user = userResult.rows[0]; const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'bys-dev-secret-key-change-in-production-2024'); const token = await new SignJWT({ sub: user.id, email: user.email, role: user.roleName, roleId: user.roleId }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('15m').setIssuer('bookyourservice').setAudience('bookyourservice').sign(secret); const { passwordHash: _ph, roleName: _rn, ...safeUser } = user; return c.json({ message: 'Registration successful', user: { ...safeUser, role: user.roleName }, accessToken: token }, 201); } catch(e) { console.error('Register error:', e); return c.json({ error: 'Registration failed' }, 500); } });
app.post('/api/contact', async (c) => { try { const { name, email, subject, message } = await c.req.json(); if (!name || !email || !subject || !message) return c.json({ error: 'All fields required' }, 400); const id = 'msg_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20); await pool.query('INSERT INTO \"ContactMessage\" (id, name, email, subject, message) VALUES (\$1, \$2, \$3, \$4, \$5)', [id, name, email, subject, message]); return c.json({ success: true, id }, 201); } catch(e) { return c.json({ error: 'Failed' }, 500); } });
app.all('/api/*', async (c) => { return c.json({ error: 'Not Found' }, 404); });
serve({ fetch: app.fetch, port: 3001 });
console.log('API Server running on port 3001');
" >> /home/z/my-project/api.log 2>&1 &
echo "API started on 3001"

# Wait for API to start
sleep 3

# Start Next.js on port 3000
cd /home/z/my-project
npx next dev --port 3000 >> /home/z/my-project/next.log 2>&1 &
echo "Next.js started on 3000"

sleep 5
echo "=== Status ==="
echo "API:" $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health 2>/dev/null)
echo "Next:" $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
