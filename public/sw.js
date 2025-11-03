// Service Worker for AI Park
// Provides offline support and caching strategies

const CACHE_VERSION = 'v1';
const CACHE_NAME = `smarttuter-${CACHE_VERSION}`;

// Static assets to cache immediately
const STATIC_CACHE = [
  '/',
  '/offline',
  '/manifest.json',
];

// Routes that should be cached on first visit
const CACHE_ON_REQUEST = [
  '/dashboard',
  '/tutor/math',
  '/tutor/english',
];

// API routes that should use network-first strategy
const NETWORK_FIRST = [
  '/api/chat',
  '/api/progress',
  '/api/difficulty',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - handle requests with appropriate strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Network-first strategy for API routes
  if (NETWORK_FIRST.some((route) => url.pathname.startsWith(route))) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache-first strategy for static assets
  if (url.pathname.startsWith('/icons') || url.pathname.startsWith('/images')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Stale-while-revalidate for pages
  event.respondWith(staleWhileRevalidate(request));
});

// Network-first strategy (for API calls)
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Offline - data not available', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

// Cache-first strategy (for static assets)
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    return new Response('Offline - asset not available', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

// Stale-while-revalidate strategy (for pages)
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);

  const fetchPromise = fetch(request).then((response) => {
    const cache = caches.open(CACHE_NAME);
    cache.then((c) => c.put(request, response.clone()));
    return response;
  });

  return cachedResponse || fetchPromise;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-learning-progress') {
    event.waitUntil(syncLearningProgress());
  }
});

async function syncLearningProgress() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();

    // Filter pending learning events
    const pendingEvents = requests.filter((req) =>
      req.url.includes('/api/progress') && req.method === 'POST'
    );

    // Retry sending pending events
    for (const request of pendingEvents) {
      await fetch(request);
      await cache.delete(request);
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notification handler (for future use)
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'AI Park Notification';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: data.url,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.notification.data) {
    event.waitUntil(clients.openWindow(event.notification.data));
  }
});
