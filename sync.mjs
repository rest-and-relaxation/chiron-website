import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const staging = dirname(fileURLToPath(import.meta.url));
const project = resolve(staging, '../..');
const output = join(staging, 'dist');

function copy(relative) {
  const destination = join(output, relative);
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(join(project, relative), destination);
}

function writeHomepage(version, replacements) {
  const relative = `site/${version}/index.html`;
  let html = readFileSync(join(project, relative), 'utf8');
  for (const [from, to] of replacements) html = html.replaceAll(from, to);
  writeFileSync(join(output, relative), html);
}

[
  'site/v1/styles.css', 'site/v1/script.js', 'site/v1/motion.js',
  'site/v1/assets/xovcO.png',
  'site/v1/assets/optimized/chiron-hero-midshot.jpg',
  'site/v1/assets/optimized/training-preview.webp',
  'site/v1/assets/optimized/x1-elite.webp',
  'site/v1/assets/optimized/force-on-force.webp',
  'site/v1/assets/optimized/nltm.webp',
  'site/v1/assets/optimized/public-order.webp',
  'site/v1/assets/optimized/greatest-hits-clean.jpg',
  'site/v1/assets/optimized/nltm-clean.jpg',
  'site/v1/assets/optimized/benefits-clean.jpg',
  'site/v2/styles.css', 'site/v2/script.js', 'site/v2/glitch.js',
  'site/v2/assets/ThFOD.png', 'site/v2/assets/z5O8xS.png',
  'site/v2/assets/optimized/x1-elite-midshot.jpg',
  'site/v2/assets/optimized/greatest-hits-clean.png',
  'site/v2/assets/optimized/nltm-clean.png',
  'site/v2/assets/optimized/benefits-clean.png',
  'site/vendor/gsap/gsap.min.js', 'site/vendor/gsap/ScrollTrigger.min.js',
  'design/AspektaVF.ttf',
  'design/Unique Benefits Explained Keyframe.png',
  'design/images/chironglobal.tech/dad4004b820b4ec6.png',
].forEach(copy);

// Interior routes are outside this review. Links to sections on each homepage
// remain usable, while unavailable destinations stay visually intact but inert.
const unavailable = (href) => [`href="${href}"`, 'aria-disabled="true" tabindex="-1" data-preview-only'];
writeHomepage('v1', [
  ['href="about/"', 'href="#about"'],
  ['href="products/"', 'href="#products"'],
  ['href="products/#x1-elite"', 'href="#products"'],
  ['href="products/#x1r"', 'href="#products"'],
  ['href="videos/"', 'href="#videos"'],
  ['href="contact/"', 'href="#contact"'],
  unavailable('partners/'),
  unavailable('about/#combatives'),
  unavailable('about/#technical'),
]);
writeHomepage('v2', [
  ['href="../../wireframes/index.html#/products"', 'href="#x1-elite"'],
  ['href="../../wireframes/index.html#/products/x1-elite"', 'href="#x1-elite"'],
  ['href="../../wireframes/index.html#/videos"', 'href="#footage"'],
  ['href="../../wireframes/index.html#/contact"', 'href="#contact"'],
  ['href="../../wireframes/index.html#/about/combatives"', 'href="#pathways"'],
  unavailable('../../wireframes/index.html#/about'),
  unavailable('../../wireframes/index.html#/about/riot'),
  unavailable('../../wireframes/index.html#/about/technical'),
  unavailable('../../wireframes/index.html#/partners'),
]);

const disableLinks = `<script>document.addEventListener('click',event=>{const link=event.target.closest('[data-preview-only]');if(link)event.preventDefault()})</script>`;
for (const version of ['v1', 'v2']) {
  const file = join(output, `site/${version}/index.html`);
  writeFileSync(file, readFileSync(file, 'utf8').replace('</body>', `${disableLinks}\n</body>`));
}

writeFileSync(join(output, 'index.html'), '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="refresh" content="0;url=site/v1/"><title>Chiron homepage concepts</title></head><body><p><a href="site/v1/">View homepage V1</a> · <a href="site/v2/">View homepage V2</a></p></body></html>');
