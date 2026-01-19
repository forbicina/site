const CACHE_NAME = 'maria-irenev0';
const urlsToCache = [
    '/maria-irene/index.html',
    '/maria-irene/coffee.json',
    '/maria-irene/icon-192.png',
    '/maria-irene/icon-512.png',
    '/css/ciessesse.css',
    '/assets/ico.ico'
    ];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Per risorse esterne: network-first
    if (!url.origin.includes(location.origin)) {
        event.respondWith(
            fetch(event.request)
            .catch(() => caches.match(event.request))
        );
        return;
    }

    // Per risorse locali: cache-first
    event.respondWith(
        caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
});
