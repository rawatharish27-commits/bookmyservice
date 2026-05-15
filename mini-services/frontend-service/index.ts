import { serve } from 'bun';

const DIST = '/home/z/my-project/frontend/dist';

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
};

serve({
  port: 5173,
  hostname: '::',
  fetch(req) {
    const url = new URL(req.url);
    let urlPath = url.pathname;
    
    // API proxy
    if (urlPath.startsWith('/api/')) {
      const backendUrl = new URL(req.url);
      backendUrl.hostname = '127.0.0.1';
      backendUrl.port = '3001';
      return fetch(new Request(backendUrl.toString(), {
        method: req.method,
        headers: req.headers,
        body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
      })).catch(() => new Response(JSON.stringify({ error: 'Backend unavailable' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }));
    }
    
    // Static file serving
    let filePath = DIST + (urlPath === '/' ? '/index.html' : urlPath);
    const ext = filePath.substring(filePath.lastIndexOf('.'));
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    try {
      const file = Bun.file(filePath);
      if (file.size > 0) {
        return new Response(file, {
          headers: { 'Content-Type': contentType },
        });
      }
    } catch {}
    
    // SPA fallback
    return new Response(Bun.file(DIST + '/index.html'), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  },
});

console.log('Frontend server running on http://localhost:5173');
