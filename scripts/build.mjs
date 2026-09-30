import { cp, mkdir, rm, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const output = join(process.cwd(), 'dist');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(join(process.cwd(), 'site'), output, {
  recursive: true,
  filter: path => !/\.md$|(?:^|\/)\.DS_Store$/.test(path),
});

if (process.env.SITE_URL) {
  const base = new URL(process.env.SITE_URL.replace(/\/?$/, '/'));
  if (!['http:', 'https:'].includes(base.protocol)) throw new Error('SITE_URL must be an HTTP(S) URL');
  for (const route of ['index.html', ...['about', 'products', 'partners', 'videos', 'contact'].map(page => `${page}/index.html`)]) {
    const path = join(output, route);
    const pageUrl = new URL(route.replace('index.html', ''), base);
    const source = await readFile(path, 'utf8');
    const html = source.replace(/(<meta (?:property="og:image"|name="twitter:image") content=")([^"]+)(")/g,
      (_, before, image, after) => before + new URL(image, pageUrl).href + after)
      .replace('</head>', `  <meta property="og:url" content="${pageUrl.href}">\n</head>`);
    await writeFile(path, html);
  }
}
console.log('Built the approved website in dist/; archive and development files are excluded.');
