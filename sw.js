const CACHE_NAME = 'uae-hunter-2030-v4.0';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => {
    return Promise.all(keys.map(k => {
      if (k !== CACHE_NAME) return caches.delete(k);
    }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});

