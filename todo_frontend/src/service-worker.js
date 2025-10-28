/* noop custom service worker to avoid build-time inject mismatch in certain environments.
   CRA will use workbox-webpack-plugin; having this file present can stabilize build behavior. */
self.addEventListener('install', () => {
  // skip waiting to activate immediately on fresh builds
  self.skipWaiting && self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil && event.waitUntil(self.clients && self.clients.claim && self.clients.claim());
});
