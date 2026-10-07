# Chiron Global Tech — IT handover

Approved website, packaged 7 October 2026. This is a static HTML/CSS/JavaScript site. No application server, database, CMS, npm dependencies or API keys are required to host it.

## Deploy

Upload the **contents of `site/`** into the web server's document root. Keep the directory structure unchanged. Configure directory index files as `index.html`, so `/about/`, `/products/`, `/videos/`, `/partners/` and `/contact/` work directly. Do not rewrite every route to the homepage.

Serve over HTTPS with standard MIME types for HTML, CSS, JavaScript, WebP, SVG, PNG, ICO and TTF. Enable Brotli or gzip for text files. Use revalidation for HTML and avoid long immutable caching on assets whose filenames remain unchanged between releases. Query-string versions are used for some asset updates.

The packaged site is ready to upload. To rebuild, run `npm run build` from the package root with a current Node.js installation. This creates `dist/`; upload its contents instead. There are no npm packages to install.

For final-domain social previews, set the real public site URL during the build:

```sh
SITE_URL=https://your-final-domain.example/ npm run build
```

This generates absolute Open Graph/Twitter image URLs and page URLs. Replace the example with the real domain. Without this setting the provided image URLs are relative. Host at the domain root; deployment under a subdirectory needs separate verification.

`vercel.json` is included for optional Vercel hosting. For another host, configure the equivalent permanent redirects if old links need support: `/site/v1/*` and `/site/v2/*` to `/`, and `/site/*` to `/*`.

## Preview and maintain

Run `npm run dev` with Python 3 installed, then open `http://localhost:4173/`. Preview using HTTP rather than opening HTML as local files, because the shared navigation and interactive features use browser URL handling.

- Page copy is in each `site/*/index.html`; homepage copy is in `site/index.html`.
- Shared header, footer and enquiry banner are in `site/shared/site-shell.js`.
- Contact actions use `mailto:enquiries@chironglobal.tech`. The visible email address provides a fallback for visitors without a configured email application.
- The video titles, posters and Vimeo IDs are in `site/videos/index.html`. Homepage titles/posters are in `site/index.html` and should be kept in sync.
- Video playback loads Vimeo's player and optional API only when requested. Allow `player.vimeo.com` and Vimeo's media services through any hosting/content-security or corporate network restrictions. Video availability depends on the existing Vimeo account and embed permissions.
- The 360 viewer uses 18 local WebP frames in `site/products/assets/x1-360/`; retain all frames and their filenames.
- Fonts, animation libraries, logos and website images are bundled locally. Retain the notices in vendor library files.

## Included and excluded

`site/` contains only deployable website files. `scripts/`, package metadata, this handover, the audit report and checksum manifest are for maintenance and verification; they do not need to be uploaded into the public document root.

Git history, design originals, archive/exploration files, node_modules, credentials, macOS metadata and duplicate build output are excluded. Optimisation source originals remain in the local archive outside this delivery package.

See `AUDIT.md` for the checks performed and their limits. After deployment, check all page routes, contact links, partner links, Vimeo playback, the rotation viewer and social previews on the actual hosting domain.
