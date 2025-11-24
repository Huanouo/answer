// Service Worker for offline support
const CACHE_NAME = 'mistake-collection-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles/main.css',
    '/styles/components.css',
    '/scripts/app.js',
    '/scripts/storage.js',
    '/scripts/photo-list.js',
    '/scripts/filters.js',
    '/components/upload-button.js',
    '/components/photo-card.js',
    '/components/filter-panel.js'
];

// Install event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching files');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.log('Service Worker: Cache failed', error);
            })
    );
});

// Activate event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Clearing old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - cache-first strategy
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                return response || fetch(event.request)
                    .then((fetchResponse) => {
                        // Cache new responses
                        return caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, fetchResponse.clone());
                            return fetchResponse;
                        });
                    });
            })
            .catch(() => {
                // Offline fallback
                console.log('Service Worker: Fetch failed, offline mode');
            })
    );
});
