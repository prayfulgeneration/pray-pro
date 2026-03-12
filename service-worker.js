const CACHE_NAME = 'prayful-gen-v18';

const SHELL_ASSETS = [
  './manifest.json',
  './favicon.ico',
  './icons/icon-32.png',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-192.svg',
  './icons/icon-512.png',
  './icons/icon-512.svg',
];

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .catch((err) => console.warn('[SW] install cache failed:', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch { return; }

  const path = url.pathname;

  if (url.origin !== self.location.origin) return;

  if (path.startsWith('/.netlify/functions/') || path.startsWith('/api/')) return;

  if (path.endsWith('.html') || path === '/' || path === '') {
    event.respondWith(
      fetch(req).catch(() =>
        caches.match('./index.html').then((c) => c || new Response('Offline', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        }))
      )
    );
    return;
  }

  if (path.includes('/data/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(req).then((cached) => {
          if (cached) return cached;
          return fetch(req).then((res) => {
            if (res && res.ok) cache.put(req, res.clone());
            return res;
          }).catch(() => new Response('Not found', {
            status: 404,
            headers: { 'Content-Type': 'text/plain' }
          }));
        })
      ).catch(() => new Response('Cache error', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      }))
    );
    return;
  }

  event.respondWith(
    fetch(req).then((res) => {
      if (res && res.status === 200 && res.type === 'basic') {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(req, clone)).catch(() => {});
      }
      return res;
    }).catch(() =>
      caches.match(req).then((cached) =>
        cached || new Response('Not found', {
          status: 404,
          headers: { 'Content-Type': 'text/plain' }
        })
      ).catch(() => new Response('Cache error', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      }))
    )
  );
});
