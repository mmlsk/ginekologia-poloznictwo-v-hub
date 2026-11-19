/* Service Worker dla Ginekologia & Położnictwo V Hub */
const CACHE_NAME = 'ginpol-hub-v1';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/hub.css',
  './atlasy/atlas-base.css',
  './atlasy/atlas-mobile.css',
  './atlasy/atlas-hub-sync.js',
  './js/meta.js',
  './js/questions.js',
  './js/questions_zaklad.js',
  './js/logic.js',
  './js/clinical-calc.js',
  './js/clinical-patient.js',
  './js/clinical-osce.js',
  './js/clinical-diagnostics.js',
  './js/app.js',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',

  // Atlas 1: Stany nagłe w położnictwie i ginekologii (moduły 1, 2, 3)
  './atlasy/modul-1-stany-nagle-poloznicze/index.html',
  './atlasy/modul-1-stany-nagle-poloznicze/app.js',
  './atlasy/modul-1-stany-nagle-poloznicze/data.js',
  './atlasy/modul-1-stany-nagle-poloznicze/style.css',

  // Atlas 2: Fizjologia ciąży, porodu i KTG (moduły 4, 5)
  './atlasy/modul-2-fizjologia-ciazy-i-porodu/index.html',
  './atlasy/modul-2-fizjologia-ciazy-i-porodu/app.js',
  './atlasy/modul-2-fizjologia-ciazy-i-porodu/data.js',
  './atlasy/modul-2-fizjologia-ciazy-i-porodu/style.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isFont = url.hostname.includes('fontshare.com') || url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com');

  if (isSameOrigin || isFont) {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        const fetchPromise = fetch(request).then(networkResponse => {
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, responseToCache));
          }
          return networkResponse;
        }).catch(() => {
          if (request.mode === 'navigate') {
            return caches.match('./index.html').then(r => r || Response.error());
          }
          return Response.error();
        });
        return cachedResponse || fetchPromise;
      })
    );
  }
});
