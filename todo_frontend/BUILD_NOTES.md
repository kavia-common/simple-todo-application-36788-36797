Build fix notes:
- Encountered a CRA build error: Cannot find module './lib/source-map-generator' from workbox-build's transitive dependency.
- Resolved by adding dev dependency: source-map@0.7.4, which satisfies workbox-build's expected import path.
- This is a known intermittent issue with some npm resolution states when using react-scripts 5.x.
