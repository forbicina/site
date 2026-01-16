const CACHE_NAME = 'marchino-v5';
const ASSETS = [
    '/marchino/',
    '/marchino/index.html',
    '/marchino/marcoaurelio.json',
    '/css/ciessesse.css',
    '/newtab/js/citazioni.js',
    '/assets/ico.ico',
    '/marchino/icon-192.png?v=5',
    '/marchino/icon-512.png?v=5',
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

self.addEventListener('push', e => {
    const data = e.data?.json() ?? {
        title: 'Daily Marchino',
        body: 'Nuova citazione disponibile'
    };

    e.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: '/dailymarchino/icon-192.png',
            badge: '/dailymarchino/icon-192.png',
            data: { url: data.url || '/dailymarchino/' }
        })
    );
});

// Click sulla notifica
self.addEventListener('notificationclick', e => {
    e.notification.close();
    e.waitUntil(
        clients.openWindow(e.notification.data.url)
    );
});
