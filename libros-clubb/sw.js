const CACHE_NAME = 'libros-race-v6';
const STATIC_ASSETS = [
  '/libros-clubb/',
  '/libros-clubb/index.html',
  '/libros-clubb/voto.html',
  '/libros-clubb/icon-512.png',
  '/fonts/static/PTSerif-Regular.ttf',
  '/fonts/static/PTSerif-Bold.ttf',
  '/fonts/static/PTSerif-Italic.ttf',
  '/fonts/static/Faustina-Regular.ttf',
  '/fonts/static/Faustina-Bold.ttf',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (url.hostname === 'libros-club.stompet.workers.dev') {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
