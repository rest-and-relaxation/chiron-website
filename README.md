# Chiron Global Tech website

The approved website is on `main`. The selected homepage is the default `index.html`.

- `site/` — website source, page folders, shared components and production assets.
- `scripts/` — local preview and delivery build.
- `archive/` — local design originals, earlier concepts, wireframes, research and former staging copies. Excluded from Git and delivery.
- `dist/` — generated, self-contained delivery pack. Excluded from Git.

## Local preview

Run `npm run dev` and open http://localhost:4173/. Old `/site/` links redirect to the equivalent page; `/site/v2/` redirects to the approved homepage.

## Delivery

Run `npm run build`. Upload the contents of `dist/` to the hosting document root. It contains `index.html`, page folders, shared components, assets and animation libraries. Archives, design source files and development dependencies are excluded.

Set `SITE_URL` to the final deployment URL when building to generate absolute social-preview URLs, for example `SITE_URL=https://example.com/ npm run build`.

Enquiry buttons use `mailto:`; the final recipient address still needs to be supplied. Video playback uses the existing Vimeo embeds.
