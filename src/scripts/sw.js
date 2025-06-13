import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";
import {
  NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
} from "workbox-strategies";
import { BASE_URL } from "./config";

// ========================
// Precache assets (build output)
precacheAndRoute(self.__WB_MANIFEST);

// ========================
// Cache HTML pages
registerRoute(
  ({ request }) => request.mode === "navigate",
  new NetworkFirst({
    cacheName: "html-pages",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
      }),
    ],
  })
);

// ========================
// Cache CSS, JS, and Workers
registerRoute(
  ({ request }) =>
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "worker",
  new StaleWhileRevalidate({
    cacheName: "static-resources",
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  })
);

// ========================
// Cache images
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "images",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// ========================
// Cache API responses
registerRoute(
  ({ url }) => url.href.startsWith(BASE_URL + "/stories"),
  new StaleWhileRevalidate({
    cacheName: "stories-cache",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60, // 1 hour
      }),
    ],
  })
);

// ========================
// Push notification
self.addEventListener("push", (event) => {
  console.log("Service worker received a push event");

  const options = {
    body: "Pengguna lain telah menambahkan cerita baru.",
    icon: "/story-app/images/logo.png",
    badge: "/story-app/images/logo.png",
  };

  event.waitUntil(
    self.registration.showNotification("Ada laporan baru untuk Anda!", options)
  );
});
