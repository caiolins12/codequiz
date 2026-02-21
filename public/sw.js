const CACHE_VERSION = 'codequiz-runtime-v41';
const STATIC_CACHE = `${CACHE_VERSION}-static`;

const PRECACHE_ASSETS = [
  './index.html',
  './manifest.webmanifest',
  './version.json',
  './build-meta.js',
  './favicon.ico',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .catch(() => null)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key !== STATIC_CACHE)
        .map((key) => caches.delete(key))
    );
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    clients.forEach((client) => {
      client.postMessage({ type: 'SW_ACTIVATED', cacheVersion: CACHE_VERSION });
    });
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(new Request(request, { cache: 'no-store' })).catch(async () => {
        return (await caches.match('./index.html')) || Response.error();
      })
    );
    return;
  }

  event.respondWith(
    fetch(new Request(request, { cache: 'no-store' }))
      .catch(async () => (await caches.match(request)) || Response.error())
  );
});

self.addEventListener('message', (event) => {
  if (event?.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
