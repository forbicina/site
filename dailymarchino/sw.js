const CACHE_NAME = 'marchino-v1';
const ASSETS = [
    '/dailymarchino/',
    '/dailymarchino/index.html',
    '/dailymarchino/marcoaurelio.json',
    '/css/ciessesse.css',
    '/newtab/js/citazioni.js',
    '/assets/ico.ico',
    '/dailymarchino/icon-192.png',
    '/dailymarchino/icon-512.png',
    ];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(ASSETS))
        .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
        Promise.all(keys
        .filter(k => k !== CACHE_NAME)
        .map(k => caches.delete(k))
        )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request)
        .then(cached => cached || fetch(e.request))
    );
});
