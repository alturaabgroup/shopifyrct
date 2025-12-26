/* global workbox */
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

// Immediately take control of any open clients
clientsClaim();
self.skipWaiting();

// __WB_MANIFEST will be injected by Workbox build step if/when used
// For now, keep an empty precache; we can extend later.
precacheAndRoute(self.__WB_MANIFEST || []);

// App shell-style routing for SPA navigations
const handler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(handler, {
  // optionally blacklist admin/asset routes
  denylist: [/^\/api\//]
});
registerRoute(navigationRoute);

// Static assets (Vite-built assets typically under /assets)
registerRoute(
  ({ request, url }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    (request.destination === 'image' && url.pathname.startsWith('/assets')),
  new StaleWhileRevalidate({
    cacheName: 'assets-cache',
    plugins: []
  })
);

// Shopify Storefront API runtime cache (optional, for resilience)
registerRoute(
  ({ url }) =>
    url.hostname.endsWith('.myshopify.com') &&
    url.pathname.includes('/api/2025-10/graphql.json'),
  new NetworkFirst({
    cacheName: 'shopify-api-cache',
    networkTimeoutSeconds: 5
  }),
  'POST'
);

console.log('[Service Worker] Initialized with Workbox');