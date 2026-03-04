// PWA Service Worker for Co-op Map Thailand
const CACHE_NAME = 'coop-map-v2.0.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/index.js',
  '/assets/index.css',
  '/companies.csv',
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
];

// API URLs to exclude from caching
const API_URLS = ['/api/', 'localhost:3001'];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Cache failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip API requests
  if (API_URLS.some(apiUrl => url.href.includes(apiUrl))) {
    return;
  }
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Strategy: Network First, then Cache
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
    event.respondWith(
      caches.match(request)
        .then((cached) => {
          // Return cached version immediately
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                const cacheCopy = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => cache.put(request, cacheCopy));
              }
              return networkResponse;
            })
            .catch(() => cached);
          
          return cached || fetchPromise;
        })
    );
  } else {
    // Strategy: Cache First, then Network for HTML
    event.respondWith(
      caches.match(request)
        .then((cached) => {
          if (cached) {
            // Update cache in background
            fetch(request)
              .then((networkResponse) => {
                if (networkResponse.ok) {
                  caches.open(CACHE_NAME)
                    .then((cache) => cache.put(request, networkResponse));
                }
              })
              .catch(() => {});
            return cached;
          }
          
          return fetch(request)
            .then((networkResponse) => {
              if (!networkResponse.ok) return networkResponse;
              
              const cacheCopy = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(request, cacheCopy));
              
              return networkResponse;
            })
            .catch(() => {
              // Return offline page if available
              return caches.match('/offline.html');
            });
        })
    );
  }
});

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-companies') {
    event.waitUntil(syncCompanies());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      data: data.url,
      actions: [
        { action: 'open', title: 'เปิดแอป' },
        { action: 'close', title: 'ปิด' }
      ]
    })
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/')
    );
  }
});

// Message from main thread
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data === 'getVersion') {
    event.ports[0].postMessage(CACHE_NAME);
  }
});

// Periodic background sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-companies') {
    event.waitUntil(updateCompaniesCache());
  }
});

async function syncCompanies() {
  // Implement background sync logic here
  console.log('[SW] Syncing companies...');
}

async function updateCompaniesCache() {
  // Implement periodic update logic here
  console.log('[SW] Updating companies cache...');
}
