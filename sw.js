// Service worker for offline support — caches the app shell so the game opens
// without internet. AI calls always go through the network (no caching).

// Bump this when shipping JS/CSS changes so stale caches are evicted on next load.
const CACHE_NAME = 'esq-shell-v25-highlight-sync-audio-start';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './styles/base.css',
  './styles/components.css',
  './styles/animations.css',
  './scripts/pets-svg.js',
  './scripts/state.js',
  './scripts/pets-pool.js',
  './scripts/ui.js',
  './scripts/audio.js',
  './scripts/hatching.js',
  './scripts/pet-system.js',
  './scripts/screens.js',
  './scripts/quests-rewards.js',
  './scripts/parent.js',
  './scripts/ai.js',
  './scripts/math-tutor.js',
  './scripts/app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never cache AI / API calls — they must always hit the live Worker.
  if (url.pathname.startsWith('/api') || /\/(chat|health)$/.test(url.pathname)) {
    return;
  }

  // Network-first for HTML so updates show up immediately when online.
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(event.request).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // Network-first for JS/CSS too — so kids and parent both see updates immediately
  // after we ship. Falls back to cache when offline. Slightly slower than
  // cache-first but avoids the "why is my old code still running" footgun.
  if (/\.(js|css)$/.test(url.pathname)) {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          if (res.ok && event.request.url.startsWith(self.registration.scope)) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(event.request, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for other static assets (images, manifest) — fast load, network fallback.
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(res => {
        if (res.ok && (event.request.url.startsWith(self.registration.scope))) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, copy)).catch(() => {});
        }
        return res;
      }).catch(() => cached);
    })
  );
});
