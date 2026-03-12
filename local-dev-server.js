const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const ROOT = __dirname;
const PORT = 8080;
const HOST = '127.0.0.1';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.css': 'text/css; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

function safeFilePath(urlPath) {
  const pathname = decodeURIComponent(urlPath.split('?')[0]);
  const normalized = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.normalize(path.join(ROOT, normalized));
  if (!filePath.startsWith(ROOT)) return null;
  return filePath;
}

async function handleProxy(req, res, parsedUrl) {
  const params = parsedUrl.searchParams;
  let targetUrl;
  const ALLOWED_HOSTS = [
    'evangelizo.org',
    'universalis.com',
    'www.universalis.com',
    'ibreviary.com',
    'www.ibreviary.com',
    'api.mymemory.translated.net',
    'arabic-bible.onrender.com',
  ];

  if (params.get('url')) {
    try {
      const decoded = decodeURIComponent(params.get('url'));
      const parsed = new URL(decoded);
      const allowed = ALLOWED_HOSTS.some((host) =>
        parsed.hostname === host || parsed.hostname.endsWith(`.${host}`)
      );
      if (!allowed) {
        return send(res, 403, 'Forbidden: host not allowed', {
          'Content-Type': 'text/plain; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        });
      }
      targetUrl = decoded;
    } catch {
      return send(res, 400, 'Invalid url parameter', {
        'Content-Type': 'text/plain; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      });
    }
  } else {
    const qs = Array.from(params.entries())
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    targetUrl = `https://feed.evangelizo.org/v2/reader.php?${qs}`;
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PrayfulGenerationBot/1.0)',
        'Accept': 'text/plain, text/html, */*',
      },
      signal: AbortSignal.timeout(15000),
    });

    const text = await response.text();
    return send(res, 200, text, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    });
  } catch (err) {
    return send(res, 502, `Proxy error: ${err.message}`, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    });
  }
}

function handleStatic(req, res, parsedUrl) {
  const filePath = safeFilePath(parsedUrl.pathname);
  if (!filePath) {
    return send(res, 403, 'Forbidden', { 'Content-Type': 'text/plain; charset=utf-8' });
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      return send(res, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache, no-store, must-revalidate' : 'public, max-age=3600',
    });

    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${HOST}:${PORT}`);

  if (req.method === 'HEAD') {
    if (parsedUrl.pathname === '/manifest.json') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end();
    }
  }

  if (parsedUrl.pathname === '/api/evang') {
    return handleProxy(req, res, parsedUrl);
  }

  return handleStatic(req, res, parsedUrl);
});

server.listen(PORT, HOST, () => {
  console.log(`Local dev server running at http://${HOST}:${PORT}/`);
  console.log(`Proxy endpoint available at http://${HOST}:${PORT}/api/evang`);
});
