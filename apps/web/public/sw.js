/* KesbYar PWA — network-first navigations; never cache-first Next.js CSS/JS */
const CACHE_VERSION = 'kesbyar-pwa-v4';
const PRECACHE = [
  '/offline',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/brand/logo.svg',
  '/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE).catch(() => undefined))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

function putOk(request, response) {
  if (!response || !response.ok) return response;
  const copy = response.clone();
  caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never intercept APIs, HMR, or Next build assets (CSS/JS) — avoids stale unstyled pages
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/webpack-hmr') ||
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/_next/image')
  ) {
    return;
  }

  const isNavigation = request.mode === 'navigate';
  const isStatic =
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/landing/') ||
    url.pathname.startsWith('/brand/') ||
    url.pathname.startsWith('/fonts/') ||
    url.pathname.endsWith('.webmanifest');

  if (isNavigation) {
    event.respondWith(
      fetch(request)
        .then((response) => putOk(request, response))
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match('/offline');
        }),
    );
    return;
  }

  if (isStatic) {
    // Stale-while-revalidate for immutable public assets
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => putOk(request, response))
          .catch(() => cached);
        return cached || network;
      }),
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('push', (event) => {
  let data = { title: 'کسب‌یار', body: 'اعلان جدید', href: '/dashboard', tag: undefined };
  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch {
    try {
      data.body = event.data ? event.data.text() : data.body;
    } catch {
      /* ignore */
    }
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'کسب‌یار', {
      body: data.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: data.tag || 'kesbyar',
      data: { url: data.href || '/dashboard' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/dashboard';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          if ('navigate' in client) client.navigate(target);
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
      return undefined;
    }),
  );
});
