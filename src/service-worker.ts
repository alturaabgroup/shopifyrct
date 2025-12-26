/// <reference lib="webworker" />

import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';

declare let self: ServiceWorkerGlobalScope;

// Take control immediately
clientsClaim();
self.skipWaiting();

// Injected by workbox during build, if using injectManifest or similar setup
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

// SPA app-shell routing for navigations
const handler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(handler, {
  denylist: [/^\/api\//, /^\/admin\//]
});
registerRoute(navigationRoute);

// Static assets: JS/CSS/fonts/images
registerRoute(
  ({ request }) =>
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'assets-v1'
  })
);

// Shopify Storefront API (read operations) – optional NetworkFirst
registerRoute(
  ({ url, request }) =>
    url.hostname.endsWith('.myshopify.com') &&
    url.pathname.includes('/api/2025-10/graphql.json') &&
    request.method === 'POST',
  new NetworkFirst({
    cacheName: 'shopify-storefront-v1',
    networkTimeoutSeconds: 5
  }),
  'POST'
);

console.log('[Service Worker] Workbox initialized');