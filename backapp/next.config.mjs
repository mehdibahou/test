import withPWA from 'next-pwa';

const config = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    // Cache the menu API endpoint
    {
      urlPattern: "/api/caisse",
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // Cache the menu page route (adjust if needed)
    {
      urlPattern: "/caisse",  // Replace with the correct path if different
      handler: "NetworkFirst",
      options: {
        cacheName: "menu-page-cache",
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 24 * 60 * 60,
        },
      },
    },
    // Cache static assets (images, CSS, JS files)
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|css|js)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "static-assets",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60, // Cache for 1 week
        },
      },
    },
  ],
});

export default config;
