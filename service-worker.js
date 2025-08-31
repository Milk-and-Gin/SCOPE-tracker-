const CACHE_NAME = 'scope-cache-v1';
const urlsToCache = [
  '/',
  './',
  'index.html',
  'style.css',
  'main.js',
  'manifest.json',
  'icon.png'
];

self.addEventListener('install', (event) => {
  // Pre-cache all of the assets so the app works offline.
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', (event) => {
  // Clean up old caches if any exist.
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
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if available or fetch from network
      return response || fetch(event.request);
    })
  );
});