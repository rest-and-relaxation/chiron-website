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

writeFileSync(join(output, 'index.html'), `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#0b0b0a">
    <title>Chiron Global Tech — Homepage Concepts</title>
    <style>
      @font-face{font-family:Aspekta;src:url('design/AspektaVF.ttf') format('truetype');font-display:swap}
      :root{color-scheme:dark;--ink:#0b0b0a;--paper:#f2f0ec;--muted:#9e9c97;--line:rgba(242,240,236,.22);--green:#2cc956}
      *{box-sizing:border-box}body{min-height:100svh;margin:0;display:grid;place-items:center;background:var(--ink);color:var(--paper);font-family:Aspekta,Arial,sans-serif}
      main{width:min(100%,1000px);padding:clamp(2rem,6vw,5rem) clamp(1.25rem,4vw,3rem)}
      .eyebrow{margin:0 0 1rem;font:400 .68rem/1.2 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
      .eyebrow i{display:inline-block;width:.55rem;height:.55rem;margin-right:.7rem;background:var(--green)}
      h1{max-width:12ch;margin:0;font-size:clamp(3rem,7.5vw,6.5rem);font-weight:540;letter-spacing:-.07em;line-height:.86}
      .intro{max-width:39rem;margin:2.4rem 0 4rem;color:var(--muted);font-size:clamp(1rem,1.6vw,1.2rem);line-height:1.55}
      .concepts{border-top:1px solid var(--line)}
      .concept{display:grid;grid-template-columns:5rem minmax(0,1fr) auto;gap:1.5rem;align-items:center;padding:2.1rem 0;border-bottom:1px solid var(--line);color:inherit;text-decoration:none;transition:padding .25s ease,background .25s ease}
      .concept:hover,.concept:focus-visible{padding-inline:1rem;background:rgba(255,255,255,.035);outline:none}.number,.concept span{font:400 .68rem/1.2 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.12em;text-transform:uppercase}.number{color:var(--muted)}
      h2{margin:0;font-size:clamp(1.8rem,3.3vw,3rem);font-weight:560;letter-spacing:-.05em}.concept p{margin:.45rem 0 0;color:var(--muted);line-height:1.45}.concept span{white-space:nowrap}.concept:hover span,.concept:focus-visible span{color:var(--green)}
      footer{display:flex;justify-content:space-between;gap:1rem;margin-top:4rem;color:var(--muted);font:400 .62rem/1.3 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.11em;text-transform:uppercase}
      @media(max-width:620px){.concept{grid-template-columns:2.8rem 1fr;gap:1rem}.concept span{grid-column:2}.concept{padding-block:1.6rem}.concept:hover,.concept:focus-visible{padding-inline:.55rem}footer{display:block;line-height:1.9}}
    </style>
  </head>
  <body>
    <main>
      <p class="eyebrow"><i></i>Chiron Global Tech / Client Review</p>
      <h1>Choose a homepage concept.</h1>
      <p class="intro">Two directions for the Chiron Global Tech homepage. Open either concept to explore its content, interaction and visual system.</p>
      <nav class="concepts" aria-label="Homepage concepts">
        <a class="concept" href="site/v1/"><b class="number">01</b><div><h2>Homepage V1</h2><p>A cinematic, image-led direction with a tactical product focus.</p></div><span>View concept ↗</span></a>
        <a class="concept" href="site/v2/"><b class="number">02</b><div><h2>Homepage V2</h2><p>A more typographic direction organised around pathways and product systems.</p></div><span>View concept ↗</span></a>
      </nav>
      <footer><span>Chiron Global Tech</span><span>Concept review / 2026</span></footer>
    </main>
  </body>
</html>`);
