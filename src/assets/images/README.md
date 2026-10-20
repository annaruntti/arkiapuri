# Images

This is the **single directory for app image files**.

- Put new UI images here (PNG/JPG/WebP).
- Register them in `src/constants/images.js` and import from that module in screens/components.
- Do not hardcode Contentful CDN URLs or `require(...)` paths in feature code.

Expo shell assets (icon, splash, favicon) also point here via `app.json`.
The root `assets/` folder is kept only as a thin compatibility shim for older paths.
