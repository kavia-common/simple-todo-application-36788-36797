module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Remove all Workbox-related plugins to avoid source-map-generator error in CI
      if (Array.isArray(webpackConfig.plugins)) {
        webpackConfig.plugins = webpackConfig.plugins.filter((p) => {
          const name = p && p.constructor && p.constructor.name ? p.constructor.name : '';
          return !/Workbox|InjectManifest|GenerateSW/i.test(name);
        });
      }

      // Ensure service worker generation is completely disabled in production
      if (webpackConfig.optimization && Array.isArray(webpackConfig.optimization.minimizer)) {
        webpackConfig.optimization.minimizer = webpackConfig.optimization.minimizer.filter((m) => {
          const name = m && m.constructor && m.constructor.name ? m.constructor.name : '';
          return !/Workbox|InjectManifest|GenerateSW/i.test(name);
        });
      }

      // Guard against CRA injecting Workbox plugin by manipulating the config's 'serviceWorker' flag if present
      if (webpackConfig.serviceWorker !== undefined) {
        webpackConfig.serviceWorker = false;
      }

      // Additional defensive check: remove any plugin that references workbox paths in its toString or options
      if (Array.isArray(webpackConfig.plugins)) {
        webpackConfig.plugins = webpackConfig.plugins.filter((p) => {
          try {
            const s = (p && p.toString && p.toString()) || '';
            return !/workbox/i.test(s);
          } catch {
            return true;
          }
        });
      }

      // FINAL DEFENSE: alias workbox modules to a no-op module so CRA can't load them
      webpackConfig.resolve = webpackConfig.resolve || {};
      webpackConfig.resolve.alias = Object.assign({}, webpackConfig.resolve.alias, {
        'workbox-webpack-plugin': false,
        'workbox-build': false,
        'workbox-window': false,
        'workbox-core': false,
        'workbox-precaching': false,
        'workbox-routing': false,
        'workbox-strategies': false,
        'workbox-expiration': false,
        'workbox-cacheable-response': false,
      });

      return webpackConfig;
    },
  },
};
