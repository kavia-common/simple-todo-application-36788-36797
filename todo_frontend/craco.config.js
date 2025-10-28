module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Remove Workbox plugin to avoid source-map-generator error in CI
      if (webpackConfig.plugins) {
        webpackConfig.plugins = webpackConfig.plugins.filter(
          (p) => !(p && p.constructor && p.constructor.name && p.constructor.name.includes('WorkboxWebpackPlugin'))
        );
      }
      return webpackConfig;
    },
  },
};
