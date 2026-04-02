// ============================================================
//  Fleet Maintenance Pro — Service Worker
//  HABATECH · v8.0
//  Stratégie:
//    - Cache-first  : assets statiques (CSS, JS CDN, fonts)
//    - Network-first: Supabase API (données temps réel)
//    - Network-first: tuiles carte Leaflet (online préféré)
//    - Cache-only   : fallback offline si réseau absent
// ============================================================

const CACHE_NAME     = 'fleet-pro-v8';
const CACHE_STATIC   = 'fleet-static-v8';
const CACHE_TILES    = 'fleet-tiles-v8';

// Assets à précacher au moment de l'installation
const PRECACHE_URLS = [
  './index.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js',
  'https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap'
];

// ---- INSTALL ----
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_STATIC).then(cache => {
      return Promise.allSettled(
        PRECACHE_URLS.map(url =>
          cache.add(url).catch(err => console.warn('[SW] Précache échec:', url, err))
        )
      );
    })
  );
});

// ---- ACTIVATE ----
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== CACHE_STATIC && k !== CACHE_TILES)
          .map(k => {
            console.log('[SW] Suppression ancien cache:', k);
            return caches.delete(k);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ---- FETCH ----
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') return;

  // ── Supabase API → Network-first (données fraîches) ──
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(networkFirst(request, CACHE_NAME, 5000));
    return;
  }

  // ── Tuiles Leaflet/CartoDB → Cache-first avec réseau ──
  if (
    url.hostname.includes('cartocdn.com') ||
    url.hostname.includes('tile.openstreetmap.org') ||
    url.pathname.match(/\/\d+\/\d+\/\d+\.png$/)
  ) {
    event.respondWith(cacheFirstWithNetwork(request, CACHE_TILES));
    return;
  }

  // ── Google Fonts ──
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(cacheFirstWithNetwork(request, CACHE_STATIC));
    return;
  }

  // ── Assets CDN (Leaflet, Chart.js, Supabase lib) ──
  if (
    url.hostname.includes('cdn.jsdelivr.net') ||
    url.hostname.includes('unpkg.com') ||
    url.hostname.includes('cdnjs.cloudflare.com')
  ) {
    event.respondWith(cacheFirstWithNetwork(request, CACHE_STATIC));
    return;
  }

  // ── App shell (index.html + icônes) → Network-first ──
  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(request, CACHE_STATIC, 4000));
    return;
  }
});

// ============================================================
//  STRATÉGIES
// ============================================================

// Cache-first : retourne le cache, sinon réseau + mise en cache
async function cacheFirstWithNetwork(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Ressource non disponible hors ligne', { status: 503 });
  }
}

// Network-first : essaie le réseau, fallback cache si timeout ou erreur
async function networkFirst(request, cacheName, timeout = 4000) {
  const cache = await caches.open(cacheName);
  try {
    const networkPromise = fetch(request).then(response => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    });
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), timeout)
    );
    return await Promise.race([networkPromise, timeoutPromise]);
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    // Fallback HTML offline pour navigation
    if (request.headers.get('accept')?.includes('text/html')) {
      const appShell = await cache.match('./index.html');
      if (appShell) return appShell;
    }
    return new Response(JSON.stringify({ error: 'Hors ligne', offline: true }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ---- MESSAGE (forcer mise à jour) ----
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
