const CACHE_NAME = 'maria-irene-v1';
const urlsToCache = [
    '/maria-irene/',
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
    if (event.request.method !== 'GET') return;

    // Prima la rete, per tutto. È questo che fa arrivare una modifica al
    // caricamento in cui viene pubblicata, invece che a quello dopo: con la
    // cache davanti, la pagina che si vede è sempre quella della visita
    // precedente, e nemmeno cambiare CACHE_NAME lo evita — il nuovo service
    // worker si installa mentre la pagina vecchia è già a schermo.
    // La cache resta sotto e risponde solo quando la rete non c'è.
    event.respondWith(
        fetch(event.request)
        .then(risposta => {
            // La copia offline si aggiorna a ogni visita riuscita. Solo roba
            // nostra: le risposte di terzi (i widget del meteo) sono opache,
            // non se ne può leggere l'esito e riempirebbero la cache di
            // pacchetti ciechi.
            const nostra = new URL(event.request.url).origin === location.origin;
            if (nostra && risposta.ok) {
                const copia = risposta.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, copia));
            }
            return risposta;
        })
        .catch(() => caches.match(event.request))
    );
});
