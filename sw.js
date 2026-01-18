const CACHE_NAME = 'pack-and-go-v1';
const ASSETS = [
    './',
    './index.html',
    './app.js',
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
    './img/desktop.png',
    'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap',
    'https://unpkg.com/dexie@3.2.4/dist/dexie.min.js'
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

// Fetch
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request)
            .then(response => response || fetch(e.request))
            .catch(() => caches.match('./index.html'))
    );
});
