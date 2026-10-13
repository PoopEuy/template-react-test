const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_URL = process.env.VITE_SERVER_DATA || 'http://192.168.100.223';

// Serve static files from build folder
app.use(express.static(path.join(__dirname, 'build')));

// Proxy API requests to backend
app.use('/api', createProxyMiddleware({
  target: API_URL,
  changeOrigin: true,
  secure: false,
  logLevel: 'info',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Proxy] ${req.method} ${req.path} -> ${API_URL}${req.path}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    // Add CORS headers
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  },
}));

// Handle client-side routing (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  console.log(`✅ API Proxy: /api/* -> ${API_URL}/api/*`);
});

