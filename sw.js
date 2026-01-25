const CACHE_NAME = 'pack-and-go-v1';
const ASSETS = [
    './',
    './index.html',
    './app.js',
    './dexie.min.js',
    './mobile.css',
    './desktop.css',
    './site.webmanifest',
    './favicon.ico',
    './img/logo_pack_and_go.png',
    './img/apple-touch-icon.png',
    './img/icon-192x192.png',
    './img/icon-512x512.png',
    './img/car.png',
    './img/europe.png',
    './img/world.png',
    './img/desktop.png'
];

// Install
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch - Network first for external, cache first for local
self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);
    
    // External resources (fonts, CDN) - network first
    if (url.origin !== location.origin) {
        e.respondWith(
            fetch(e.request)
                .then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
                    return response;
                })
                .catch(() => caches.match(e.request))
        );
        return;
    }
    
    // Local resources - cache first
    e.respondWith(
        caches.match(e.request)
            .then(response => response || fetch(e.request))
            .catch(() => caches.match('./index.html'))
    );
});
