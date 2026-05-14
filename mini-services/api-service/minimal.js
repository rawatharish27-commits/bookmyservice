const http = require('http');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.oblhyxdjwrqtdycvnoky:x6fpra3VPHUwsoqn@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false },
  max: 2,
  idleTimeoutMillis: 15000,
  connectionTimeoutMillis: 8000,
});

pool.on('error', (err) => console.error('Pool error:', err.message));

process.on('uncaughtException', (err) => console.error('Uncaught:', err.message));
process.on('unhandledRejection', (r) => console.error('Rejected:', r));

const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;

  try {
    if (path === '/health') {
      res.writeHead(200, headers);
      return res.end(JSON.stringify({ status: 'ok', version: '3.0.0' }));
    }

    if (path === '/api/categories' && req.method === 'GET') {
      const result = await pool.query('SELECT * FROM "ServiceCategory" WHERE "isActive" = true ORDER BY "displayOrder"');
      res.writeHead(200, headers);
      return res.end(JSON.stringify({ categories: result.rows, total: result.rows.length }));
    }

    if (path === '/api/subcategories' && req.method === 'GET') {
      const catId = url.searchParams.get('categoryId');
      const q = catId
        ? 'SELECT * FROM "ServiceSubcategory" WHERE "categoryId" = $1 AND "isActive" = true ORDER BY "displayOrder"'
        : 'SELECT * FROM "ServiceSubcategory" WHERE "isActive" = true ORDER BY "displayOrder"';
      const params = catId ? [catId] : [];
      const result = await pool.query(q, params);
      res.writeHead(200, headers);
      return res.end(JSON.stringify({ subcategories: result.rows, total: result.rows.length }));
    }

    if (path === '/api/stats/platform' && req.method === 'GET') {
      const result = await pool.query('SELECT * FROM "PlatformStats" ORDER BY id DESC LIMIT 1');
      res.writeHead(200, headers);
      return res.end(JSON.stringify(result.rows[0] || { totalVisitors: 0, totalUsers: 0, totalProviders: 0, totalBookings: 0, totalServices: 0, activeVisitors: 0 }));
    }

    if (path === '/api/services' && req.method === 'GET') {
      const result = await pool.query('SELECT s.*, u.name as "providerName", u.phone as "providerPhone", s."averageRating" as "providerRating", c.name as "categoryName", c.slug as "categorySlug" FROM "Service" s JOIN "User" u ON s."providerId" = u.id JOIN "ServiceCategory" c ON s."categoryId" = c.id WHERE s."isActive" = true AND s."isApproved" = true ORDER BY s."isFeatured" DESC, s."averageRating" DESC LIMIT 20');
      res.writeHead(200, headers);
      return res.end(JSON.stringify({ services: result.rows, total: result.rows.length }));
    }

    res.writeHead(404, headers);
    res.end(JSON.stringify({ error: 'Not Found' }));
  } catch (e) {
    console.error('Error:', e.message);
    res.writeHead(500, headers);
    res.end(JSON.stringify({ error: e.message }));
  }
});

server.listen(3001, () => console.log('Minimal API on port 3001'));
