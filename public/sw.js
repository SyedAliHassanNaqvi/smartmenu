const CACHE_NAME = "smartmenu-v3";
const urlsToCache = [
  "/",
  "/offline.html",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch(err => {
        console.warn('Failed to cache some files:', err);
        return undefined;
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || event.request.url.includes("/api/")) {
    return;
  }

  const url = new URL(event.request.url);

  // Never cache ANY HTML page — always fetch from network
  const isHtmlPage =
    event.request.destination === "document" ||
    url.pathname.endsWith(".html") ||
    // Catch all app routes — if it has no file extension, it's a page
    (!url.pathname.includes(".") && url.pathname !== "/");

  if (isHtmlPage) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/offline.html"))
    );
    return;
  }

  // Only cache true static assets: JS, CSS, images, fonts, icons
  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/_next/image/") ||
    /\.(js|css|png|jpg|jpeg|svg|gif|webp|woff|woff2|ico)$/.test(url.pathname);

  if (!isStaticAsset) {
    // Unknown request type — just fetch, don't cache
    event.respondWith(fetch(event.request));
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type === "error") {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => caches.match("/offline.html"));
    })
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-orders") {
    event.waitUntil(syncOrders());
  }
});

async function syncOrders() {
  try {
    const pendingOrders = await getPendingOrders();
    for (const order of pendingOrders) {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
    }
    await clearPendingOrders();
  } catch (error) {
    console.error("Background sync failed:", error);
  }
}

async function getPendingOrders() {
  return [];
}

async function clearPendingOrders() {}

self.addEventListener("push", (event) => {
  const options = {
    body: event.data?.text() || "New notification from SmartMenu",
    icon: "/icon-192x192.png",
    badge: "/badge-72x72.png",
    tag: "smartmenu-notification",
  };

  event.waitUntil(
    self.registration.showNotification("SmartMenu", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === "/" && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow("/");
    })
  );
});