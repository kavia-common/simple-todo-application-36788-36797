module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Remove all Workbox-related plugins to avoid source-map-generator error in CI
      if (Array.isArray(webpackConfig.plugins)) {
        webpackConfig.plugins = webpackConfig.plugins.filter((p) => {
          const name = p && p.constructor && p.constructor.name ? p.constructor.name : '';
          return !/Workbox/i.test(name);
        });
      }

      // Also guard against plugins added under optimization or other nested configs (defensive)
      if (webpackConfig.optimization && Array.isArray(webpackConfig.optimization.minimizer)) {
        webpackConfig.optimization.minimizer = webpackConfig.optimization.minimizer.filter((m) => {
          const name = m && m.constructor && m.constructor.name ? m.constructor.name : '';
          return !/Workbox/i.test(name);
        });
      }

      return webpackConfig;
    },
  },
};
