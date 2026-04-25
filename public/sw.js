const CACHE_NAME = "smartmenu-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/offline.html",
];

// Install event - cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate event - clean up old caches
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
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests and API calls
  if (event.request.method !== "GET" || event.request.url.includes("/api/")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request)
        .then((response) => {
          // Don't cache if not a success response
          if (!response || response.status !== 200 || response.type === "error") {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Return offline page if available
          return caches.match("/offline.html");
        });
    })
  );
});

// Background sync for offline orders
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
  // Mock implementation - in real app, retrieve from IndexedDB
  return [];
}

async function clearPendingOrders() {
  // Mock implementation - in real app, clear IndexedDB
}

// Push notifications
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
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === "/" && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })
  );
});
