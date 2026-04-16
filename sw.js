self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
    // Required to be considered a PWA
    e.respondWith(fetch(e.request));
});
