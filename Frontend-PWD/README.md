# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Service worker cache

The service worker (`sw.js`) precaches built assets using the `asset-manifest.json`
file emitted during `npm run build`. Cache names include a version string (see
`CACHE_VERSION` in `sw.js`) and old caches are purged on activation.

### Updating cached assets

1. Build the app: `npm run build` – this generates `dist/asset-manifest.json`.
2. Deploy the contents of `dist/` (including `asset-manifest.json`) to your
   hosting environment.
3. Bump `CACHE_VERSION` in `sw.js` whenever you need to force clients to refresh
   cached resources.

External CDN resources are cached at runtime and refreshed whenever a network
response is available, preventing stale third‑party assets.
