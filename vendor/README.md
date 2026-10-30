# Local dependency fork

`decode-uri-component` is a direct dependency so `overrides` can point every nested copy at this directory. React Navigation's `query-string` 7 calls `require()` and expects a function. The published package is ESM-only and breaks that call (`GHSA-vcc3-ghjq-m6fr`).

This copy is the 0.5.1 decoder built as CommonJS, including the single-pass percent-run replacement from `GHSA-qr28-fpjm-wq7f`. The version `0.5.1+cjs.1` matches that patched release for `npm audit`. When `query-string` or React Navigation can use the published package, delete this directory and the override.

`deepmerge` 4.3.1 and Expo CLI's `zod` 3.25.76 stay as installed. There is no `deepmerge` release after the affected 4.3.1. Zod's patched line is 4.6.6, and Expo CLI still depends on Zod 3. Both sit in Expo tooling. `npm audit fix --force` would downgrade Expo to 51.

`npm test` checks that React Navigation's query parser still receives a function.
