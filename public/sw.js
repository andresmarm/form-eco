// Service worker escrito a mano (sin Workbox) para el formulario público /reportar.
// Turbopack (motor por defecto de Next.js 16) no soporta plugins de webpack como
// workbox-webpack-plugin, así que se implementa una estrategia mínima manualmente:
// - App shell de /reportar disponible offline tras la primera visita (NetworkFirst).
// - Assets estáticos (_next/static, iconos) en CacheFirst.
// - /api y /backoffice nunca se interceptan: siempre van directo a la red.

const CACHE_VERSION = "v1";
const SHELL_CACHE = `eco-shell-${CACHE_VERSION}`;
const ASSET_CACHE = `eco-assets-${CACHE_VERSION}`;
const SHELL_URLS = ["/reportar", "/manifest.json", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== ASSET_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isApiOrBackoffice(url) {
  return url.pathname.startsWith("/api/") || url.pathname.startsWith("/backoffice");
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    /\.(?:png|jpg|jpeg|svg|gif|ico|webp)$/.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isApiOrBackoffice(url)) return;

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(ASSET_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      })
    );
    return;
  }

  if (url.pathname.startsWith("/reportar")) {
    event.respondWith(
      caches.open(SHELL_CACHE).then(async (cache) => {
        try {
          const response = await fetch(request);
          if (response.ok) cache.put(request, response.clone());
          return response;
        } catch {
          const cached = await cache.match(request);
          return cached || cache.match("/reportar");
        }
      })
    );
  }
});
