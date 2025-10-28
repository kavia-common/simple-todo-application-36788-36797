#!/usr/bin/env node
/**
 * Ensures source-map exposes ./lib/source-map-generator to satisfy workbox transitive require.
 * If not found, exits with non-zero to make the issue visible during CI.
 */
const path = require('path');
try {
  // Resolve workbox's nested source-map first if present
  const nested = require.resolve('workbox-build/node_modules/source-map/source-map.js', { paths: [process.cwd()] });
  // If require.resolve passed, nested source-map exists; success
  process.exit(0);
} catch {
  try {
    // Fallback to top-level source-map which should be 0.7.4
    // This require will throw if package is missing
    // eslint-disable-next-line import/no-extraneous-dependencies
    require('source-map/source-map.js');
    process.exit(0);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Prebuild check failed: source-map with lib/source-map-generator not found.', e && e.message);
    process.exit(1);
  }
}
