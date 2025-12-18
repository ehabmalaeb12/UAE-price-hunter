const CACHE_NAME = 'uae-hunter-v2.1'; // Change this number to force update
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js'
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
});

self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});

