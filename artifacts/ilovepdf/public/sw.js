// ILovePDF Service Worker — Offline App Shell Cache
const CACHE_VERSION = 'v1';
const CACHE_NAME = 'ilovepdf-' + CACHE_VERSION;

// App shell assets to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
];

// ─── Install ─────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ─── Activate ────────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name.startsWith('ilovepdf-') && name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch ───────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin CDN requests (pdf-lib, pdfjs, etc. load fresh)
  if (request.method !== 'GET') return;
  if (url.origin !== location.origin) return;
  // Skip browser extension requests
  if (!url.protocol.startsWith('http')) return;

  // Navigation requests (page loads): Network first, fall back to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() =>
          caches.match('/index.html').then(cached => {
            if (cached) return cached;
            return new Response('<h1>ILovePDF — Offline</h1><p>The app shell is loading. Please check your connection.</p>', {
              headers: { 'Content-Type': 'text/html' }
            });
          })
        )
    );
    return;
  }

  // Static JS/CSS/font assets: Cache first, then network (long-lived assets)
  if (
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.ico') ||
    url.pathname === '/manifest.json' ||
    url.pathname === '/robots.txt'
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        const networkFetch = fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        });
        return cached || networkFetch;
      })
    );
    return;
  }

  // Everything else: Network only (API calls, etc.)
  // (currency rates, translation API should always be fresh)
});

// ─── Message handler ─────────────────────────────────────────────────────────
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION, cache: CACHE_NAME });
  }
});
