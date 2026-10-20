# Local dependency fork

`decode-uri-component` is a direct dependency so `overrides` can point every nested copy at this directory. React Navigation's `query-string` 7 calls `require()` and expects a function. The published 0.5.0 package is ESM-only and breaks that call (`GHSA-vcc3-ghjq-m6fr`).

This copy is the 0.5.0 decoder built as CommonJS. The version `0.5.0+cjs.1` matches the patched release for `npm audit`. When `query-string` or React Navigation can use the published package, delete this directory and the override.

`braces` and `node-forge` stay on their published versions. Their advisories affect Expo and Metro tooling, not the app, and the published fixes are not available yet.

`npm test` checks that React Navigation's query parser still receives a function.
