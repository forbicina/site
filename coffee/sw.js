const CACHE_NAME = 'coffee-v';
const urlsToCache = [
    '/index.html',
'/css/ciessesse.css',
'/assets/ico.ico',
'/coffee.json',
'/icon-192.png',
'/icon-512.png',
'/fonts/static/HelveticaNeue-Light.otf',
'/fonts/static/HelveticaNeue-Bold.otf',
'/fonts/static/HelveticaNeue-Italic.otf',
'/fonts/static/Faustina-Regular.ttf',
'/fonts/static/Faustina-Bold.ttf'
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
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            if (response) {
                return response;
            }
            return fetch(event.request);
        })
    );
});
