const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({
  target: 'http://localhost:5173',
  ws: true,
  changeOrigin: true,
});

const server = http.createServer((req, res) => {
  // API requests go to backend on 3001
  if (req.url.startsWith('/api/')) {
    proxy.web(req, res, { target: 'http://localhost:3001' });
  } else {
    // Everything else goes to Vite on 5173
    proxy.web(req, res);
  }
});

proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err.message);
  if (!res.headersSent) {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
  }
  res.end('Bad Gateway: ' + err.message);
});

server.on('upgrade', (req, socket, head) => {
  // WebSocket for Vite HMR
  proxy.ws(req, socket, head);
});

server.listen(3000, '0.0.0.0', () => {
  console.log('✅ Proxy running on port 3000 → 5173 (frontend) + 3001 (API)');
});
