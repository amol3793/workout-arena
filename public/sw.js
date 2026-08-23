const CACHE = "ease-workout-shell-v1";
const SHELL = [
  "/",
  "/muscles",
  "/exercises",
  "/manifest.webmanifest",
  "/icon.svg",
  "/brand/ease-your-workout-light.svg",
  "/brand/ease-your-workout-dark.svg",
  "/anatomy/body-front.webp",
  "/anatomy/body-back.webp",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // external licensed media stays network-only

  // Navigation: network first, cached app shell fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match("/"))),
    );
    return;
  }

  // Same-origin static assets: cache first, refresh in background.
  if (/\.(?:svg|webp|png|jpg|css|js|woff2?)$/i.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fresh = fetch(request).then((response) => {
          if (response.ok) caches.open(CACHE).then((cache) => cache.put(request, response.clone()));
          return response;
        });
        return cached || fresh;
      }),
    );
  }
});
