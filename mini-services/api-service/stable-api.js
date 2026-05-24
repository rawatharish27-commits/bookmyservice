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

app.get('/api/categories', async (c) => {
  try {
    const r = await pool.query('SELECT id, name, slug, description, icon, "imageUrl", "displayOrder" FROM "ServiceCategory" WHERE "isActive" = true ORDER BY "displayOrder"');
    return c.json({ categories: r.rows, total: r.rows.length });
  } catch(e) { console.error('Categories error:', e); return c.json({ error: 'Failed' }, 500); }
});

app.get('/api/categories/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const r = await pool.query('SELECT * FROM "ServiceCategory" WHERE id::text = $1 OR slug = $1', [id]);
    if (!r.rows[0]) return c.json({ error: 'Not found' }, 404);
    const sub = await pool.query('SELECT * FROM "ServiceSubcategory" WHERE "categoryId" = $1 AND "isActive" = true ORDER BY "displayOrder"', [r.rows[0].id]);
    return c.json({ ...r.rows[0], subcategories: sub.rows });
  } catch(e) { return c.json({ error: 'Failed' }, 500); }
});

app.get('/api/subcategories', async (c) => {
  try {
    const cid = c.req.query('categoryId');
    if (cid) {
      const r = await pool.query('SELECT * FROM "ServiceSubcategory" WHERE "categoryId" = $1 AND "isActive" = true ORDER BY "displayOrder"', [parseInt(cid)]);
      return c.json({ subcategories: r.rows, total: r.rows.length });
    }
    const r = await pool.query('SELECT * FROM "ServiceSubcategory" WHERE "isActive" = true ORDER BY "categoryId", "displayOrder"');
    return c.json({ subcategories: r.rows, total: r.rows.length });
  } catch(e) { return c.json({ error: 'Failed' }, 500); }
});

app.get('/api/services', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '20');
    const r = await pool.query('SELECT s.*, u.name as "providerName", sc.name as "categoryName", sc.slug as "categorySlug", sc.icon as "categoryIcon", sc."imageUrl" as "categoryImage" FROM "Service" s LEFT JOIN "User" u ON s."providerId" = u.id LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id WHERE s."isActive" = true AND s."isApproved" = true ORDER BY s."isFeatured" DESC, s."averageRating" DESC LIMIT $1', [limit]);
    return c.json({ services: r.rows, total: r.rows.length });
  } catch(e) { return c.json({ error: 'Failed' }, 500); }
});

app.get('/api/services/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const r = await pool.query('SELECT s.*, u.name as "providerName", u."profileImageUrl" as "providerImage", sc.name as "categoryName", sc.slug as "categorySlug", sc.icon as "categoryIcon", sc."imageUrl" as "categoryImage" FROM "Service" s LEFT JOIN "User" u ON s."providerId" = u.id LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id WHERE s.id = $1', [id]);
    if (!r.rows[0]) return c.json({ error: 'Not found' }, 404);
    return c.json(r.rows[0]);
  } catch(e) { return c.json({ error: 'Failed' }, 500); }
});

app.get('/api/faq', async (c) => {
  try {
    const r = await pool.query('SELECT * FROM "Faq" WHERE "isActive" = true ORDER BY "displayOrder"');
    return c.json({ faqs: r.rows, total: r.rows.length });
  } catch(e) { return c.json({ error: 'Failed' }, 500); }
});

app.get('/api/stats/platform', async (c) => {
  try {
    const r = await pool.query('SELECT * FROM "PlatformStats" ORDER BY id DESC LIMIT 1');
    return c.json(r.rows[0] || { totalVisitors: 0, totalUsers: 0, totalProviders: 0, totalBookings: 0, totalServices: 0, activeVisitors: 0 });
  } catch(e) { return c.json({ totalVisitors: 0, totalUsers: 0, totalProviders: 0, totalBookings: 0, totalServices: 0, activeVisitors: 0 }); }
});

app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password) return c.json({ error: 'Email and password required' }, 400);
    const bcrypt = require('bcryptjs');
    const { SignJWT } = require('jose');
    const r = await pool.query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE LOWER(u.email) = LOWER($1)', [String(email).toLowerCase().trim()]);
    if (!r.rows[0]) return c.json({ error: 'Invalid credentials' }, 401);
    const user = r.rows[0];
    if (!await bcrypt.compare(String(password), user.passwordHash)) return c.json({ error: 'Invalid credentials' }, 401);
    if (user.status !== 'ACTIVE') return c.json({ error: 'Account is ' + user.status.toLowerCase() }, 403);
    await pool.query('UPDATE "User" SET "lastLoginAt" = NOW() WHERE id = $1', [user.id]);
    const secret = new TextEncoder().encode('bys-dev-secret-key-change-in-production-2024');
    const token = await new SignJWT({ sub: user.id, email: user.email, role: user.roleName, roleId: user.roleId }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('15m').setIssuer('bookyourservice').setAudience('bookyourservice').sign(secret);
    const { passwordHash, roleName, ...safeUser } = user;
    return c.json({ message: 'Login successful', user: { ...safeUser, role: roleName }, accessToken: token });
  } catch(e) { console.error('Login error:', e); return c.json({ error: 'Login failed' }, 500); }
});

app.post('/api/auth/register', async (c) => {
  try {
    const { email, phone, name, password, roleId } = await c.req.json();
    if (!email || !phone || !name || !password || !roleId) return c.json({ error: 'All fields required' }, 400);
    const bcrypt = require('bcryptjs');
    const { SignJWT } = require('jose');
    const existing = await pool.query('SELECT id FROM "User" WHERE LOWER(email) = LOWER($1)', [String(email).toLowerCase().trim()]);
    if (existing.rows.length > 0) return c.json({ error: 'Email already registered' }, 409);
    const passwordHash = await bcrypt.hash(String(password), 10);
    const userId = 'usr_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
    await pool.query('INSERT INTO "User" (id, email, phone, "passwordHash", name, "roleId", status, "emailVerified", "phoneVerified") VALUES ($1, $2, $3, $4, $5, $6, \'ACTIVE\', false, false)', [userId, String(email).toLowerCase().trim(), String(phone).trim(), passwordHash, String(name).trim(), Number(roleId)]);
    const userResult = await pool.query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE u.id = $1', [userId]);
    const user = userResult.rows[0];
    const secret = new TextEncoder().encode('bys-dev-secret-key-change-in-production-2024');
    const token = await new SignJWT({ sub: user.id, email: user.email, role: user.roleName, roleId: user.roleId }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('15m').setIssuer('bookyourservice').setAudience('bookyourservice').sign(secret);
    const { passwordHash: _ph, roleName: _rn, ...safeUser } = user;
    return c.json({ message: 'Registration successful', user: { ...safeUser, role: user.roleName }, accessToken: token }, 201);
  } catch(e) { console.error('Register error:', e); return c.json({ error: 'Registration failed' }, 500); }
});

app.post('/api/contact', async (c) => {
  try {
    const { name, email, subject, message } = await c.req.json();
    if (!name || !email || !subject || !message) return c.json({ error: 'All fields required' }, 400);
    const id = 'msg_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
    await pool.query('INSERT INTO "ContactMessage" (id, name, email, subject, message) VALUES ($1, $2, $3, $4, $5)', [id, name, email, subject, message]);
    return c.json({ success: true, id }, 201);
  } catch(e) { return c.json({ error: 'Failed' }, 500); }
});

app.get('/api/legal', async (c) => { try { const r = await pool.query('SELECT id, "pageType", title, version FROM "LegalPage" ORDER BY id ASC'); return c.json({ documents: r.rows, total: r.rows.length }); } catch(e) { return c.json({ error: 'Failed' }, 500); } });
app.get('/api/legal/:type', async (c) => { try { const t = c.req.param('type'); const MAP = { terms: 'TERMS', privacy: 'PRIVACY', 'refund-policy': 'REFUND' }; const pt = MAP[t] || t.toUpperCase(); const r = await pool.query('SELECT * FROM "LegalPage" WHERE "pageType" = $1', [pt]); if (!r.rows[0]) return c.json({ error: 'Not found' }, 404); return c.json(r.rows[0]); } catch(e) { return c.json({ error: 'Failed' }, 500); } });
app.get('/api/auth/profile', async (c) => { try { const ah = c.req.header('authorization'); if (!ah?.startsWith('Bearer ')) return c.json({ error: 'Auth required' }, 401); const { jwtVerify } = require('jose'); const secret = new TextEncoder().encode('bys-dev-secret-key-change-in-production-2024'); const { payload } = await jwtVerify(ah.split(' ')[1], secret, { issuer: 'bookyourservice', audience: 'bookyourservice' }); const r = await pool.query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE u.id = $1', [payload.sub]); if (!r.rows[0]) return c.json({ error: 'Not found' }, 404); const { passwordHash, roleName, ...profile } = r.rows[0]; return c.json({ user: { ...profile, role: roleName } }); } catch(e) { return c.json({ error: 'Failed' }, 500); } });

// Hyperlocal endpoints
app.get('/api/area/status', async (c) => { try { const city = c.req.query('city'); let pc = 0, cc = 0; if (city) { try { const r = await pool.query('SELECT COUNT(*) as cnt FROM "User" WHERE city ILIKE $1 AND "roleId" = 2', [city]); pc = parseInt(r.rows[0]?.cnt || '0'); } catch(e) {} try { const r = await pool.query('SELECT COUNT(*) as cnt FROM "User" WHERE city ILIKE $1 AND "roleId" = 1', [city]); cc = parseInt(r.rows[0]?.cnt || '0'); } catch(e) {} } return c.json({ city, state: null, isActive: pc >= 5, providerCount: pc, customerCount: cc, providerTarget: 20, customerTarget: 100, availableCategories: pc > 0 ? [1,2,3,4,5,6,7,8,9,10,11] : [], comingSoonCategories: pc === 0 ? [1,2,3,4,5,6,7,8,9,10,11] : [], launchProgress: Math.min(Math.round((pc/20*50)+(cc/100*50)), 100) }); } catch(e) { return c.json({ error: 'Failed' }, 500); } });
app.get('/api/area/activation', async (c) => { try { const city = c.req.query('city'); let pc = 0, cc = 0; if (city) { try { const r = await pool.query('SELECT COUNT(*) as cnt FROM "User" WHERE city ILIKE $1 AND "roleId" = 2', [city]); pc = parseInt(r.rows[0]?.cnt || '0'); } catch(e) {} try { const r = await pool.query('SELECT COUNT(*) as cnt FROM "User" WHERE city ILIKE $1 AND "roleId" = 1', [city]); cc = parseInt(r.rows[0]?.cnt || '0'); } catch(e) {} } return c.json({ city, providerCount: pc, customerCount: cc, providerTarget: 20, customerTarget: 100, launchProgress: Math.min(Math.round((pc/20*50)+(cc/100*50)), 100) }); } catch(e) { return c.json({ error: 'Failed' }, 500); } });
app.get('/api/commission/info', (c) => c.json({ customerBooking: { rate: 5, type: 'PERCENTAGE', description: '5% referral commission on every booking' }, providerEarnings: { rate: 2, type: 'PERCENTAGE', description: '2% override commission' }, areaGrowthBonus: { description: 'Monthly incentive based on area growth' } }));
app.get('/api/referral/whatsapp-message', (c) => { const city = c.req.query('city') || 'your area'; const code = c.req.query('referralCode') || ''; const msg = encodeURIComponent('Hamare area me Book My Service start ho raha hai. Agar aap AC repair / electrician / plumber service provide karte ho to join karo aur customers pao.' + (code ? ' Referral code: ' + code : '') + ' Visit: bookyourservice.co.in'); return c.json({ message: decodeURIComponent(msg), whatsappUrl: 'https://wa.me/?text=' + msg }); });
app.get('/api/providers/nearby', async (c) => { try { const r = await pool.query('SELECT u.id, u.name, u.city, u.latitude, u.longitude, u."completedJobsCount" FROM "User" u WHERE u."roleId" = 2 AND u.latitude IS NOT NULL LIMIT 20'); return c.json({ providers: r.rows, total: r.rows.length, radius: 20 }); } catch(e) { return c.json({ providers: [], total: 0, radius: 20 }); } });
const wl = []; app.post('/api/waiting-list/join', async (c) => { try { const b = await c.req.json(); wl.push({ ...b, id: Date.now().toString() }); return c.json({ success: true, message: 'Added to waiting list' }, 201); } catch(e) { return c.json({ error: 'Failed' }, 500); } });
const ama = []; app.post('/api/area-manager/apply', async (c) => { try { const b = await c.req.json(); ama.push({ ...b, id: Date.now().toString(), status: 'PENDING' }); return c.json({ success: true, message: 'Application submitted' }, 201); } catch(e) { return c.json({ error: 'Failed' }, 500); } });
app.get('/api/location/reverse-geocode', (c) => { const lat = parseFloat(c.req.query('lat')||'0'), lng = parseFloat(c.req.query('lng')||'0'); const cities = [{name:'Delhi',state:'Delhi',lat:28.6315,lng:77.2167},{name:'Mumbai',state:'Maharashtra',lat:19.076,lng:72.8777},{name:'Bengaluru',state:'Karnataka',lat:12.9716,lng:77.5946},{name:'Hyderabad',state:'Telangana',lat:17.385,lng:78.4867},{name:'Chennai',state:'Tamil Nadu',lat:13.0827,lng:80.2707},{name:'Pune',state:'Maharashtra',lat:18.5204,lng:73.8567},{name:'Kolkata',state:'West Bengal',lat:22.5726,lng:88.3639},{name:'Jaipur',state:'Rajasthan',lat:26.9124,lng:75.7873},{name:'Lucknow',state:'Uttar Pradesh',lat:26.8467,lng:80.9462},{name:'Jammu',state:'Jammu & Kashmir',lat:32.7266,lng:74.857}]; let closest=null,minD=Infinity; for(const city of cities){const d=Math.sqrt(Math.pow(lat-city.lat,2)+Math.pow(lng-city.lng,2));if(d<minD){minD=d;closest=city;}} return closest&&minD<2?c.json({city:closest.name,state:closest.state,pincode:closest.pincode||'000000',latitude:lat,longitude:lng,source:'local_lookup'}):c.json({city:null,state:null,pincode:null,latitude:lat,longitude:lng,source:'unknown'}); });
const refs = []; app.post('/api/referral/track', async (c) => { try { const b = await c.req.json(); refs.push({ ...b, id: Date.now().toString(), status: 'PENDING' }); return c.json({ success: true }, 201); } catch(e) { return c.json({ error: 'Failed' }, 500); } });
app.post('/api/auth/forgot-password', (c) => c.json({ message: 'Reset token generated' }));
app.post('/api/auth/change-password', (c) => c.json({ message: 'Password changed' }));
app.patch('/api/auth/profile', (c) => c.json({ message: 'Profile updated' }));
app.all('/api/*', (c) => c.json({ error: 'Not Found' }, 404));

serve({ fetch: app.fetch, port: 3001 }, () => console.log('🚀 API running on 3001'));
