const CACHE_NAME = 'libros-club-v3';
const STATIC_ASSETS = [
  '/libros-club/',
  '/libros-club/index.html',
  '/fonts/static/PTSerif-Regular.ttf',
  '/fonts/static/PTSerif-Bold.ttf',
  '/fonts/static/Faustina-Regular.ttf',
  '/fonts/static/Faustina-Bold.ttf'
];

// Installazione: cache risorse statiche
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Attivazione: pulizia vecchie cache
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: network-first per API, cache-first per assets statici
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // API calls: sempre network (dati freschi)
  if (url.hostname === 'libros-club.stompet.workers.dev') {
    event.respondWith(fetch(event.request));
    return;
  }

  // Assets statici: cache-first con fallback network
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;
        return fetch(event.request)
          .then(response => {
            // Cache solo risposte valide
            if (response.ok && event.request.method === 'GET') {
              const clone = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, clone));
            }
            return response;
          });
      })
  );
});
