"""One-time asset migration. Requires Pillow with WebP support.

Run with the bundled Python runtime. Originals are retained outside delivery.
The reference patch is emitted separately so source edits can be reviewed.
"""
from pathlib import Path
from PIL import Image, ImageOps
import json
import re
import shutil

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'site'
BACKUP = ROOT / 'archive/asset-originals-2026-10-01'
REPORT = ROOT / 'asset-optimization-report.json'
if REPORT.exists():
    raise SystemExit('Migration already completed; originals and report are preserved.')

before = sum(p.stat().st_size for p in SITE.rglob('*') if p.is_file())
mapping, variants, records = {}, {}, []

def backup(path):
    target = BACKUP / path.relative_to(SITE)
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(path, target)

def scaled(image, width):
    if image.width <= width:
        return image.copy()
    return image.resize((width, round(image.height * width / image.width)), Image.Resampling.LANCZOS)

for path in sorted(SITE.rglob('*')):
    if not path.is_file() or path.suffix.lower() not in ('.png', '.jpg', '.webp'):
        continue
    rel = path.relative_to(SITE).as_posix()
    original_bytes = path.stat().st_size
    # Superseded gallery posters are no longer referenced anywhere.
    if rel.startswith('videos/assets/'):
        backup(path)
        path.unlink()
        records.append({'source': rel, 'before': original_bytes, 'after': 0, 'archived_unused': True})
        continue
    image = ImageOps.exif_transpose(Image.open(path))
    if rel.startswith('assets/icons/') or rel.startswith('assets/social/'):
        # Keep conventional favicon/social formats for crawlers and OS support.
        backup(path)
        candidate = path.with_name(path.stem + '.candidate' + path.suffix)
        if path.suffix == '.png':
            image.save(candidate, optimize=True)
        else:
            image.convert('RGB').save(candidate, quality=85, optimize=True, progressive=True)
        if candidate.stat().st_size < original_bytes:
            candidate.replace(path)
        else:
            candidate.unlink()
        records.append({'source': rel, 'before': original_bytes, 'after': path.stat().st_size})
        continue
    is_logo = (rel.startswith('assets/figma/partners-') or rel in ('assets/chiron-logo.png', 'assets/chiron-horse.png'))
    is_hero = rel.startswith('assets/hero/')
    is_spin = '/x1-360/' in rel
    is_thumb = rel.startswith('assets/video-thumbnails/')
    max_width = 800 if is_logo else 2400 if is_hero else 1280 if is_thumb else 2000
    image = scaled(image, max_width)
    if image.mode not in ('RGB', 'RGBA'):
        image = image.convert('RGBA' if 'A' in image.getbands() else 'RGB')
    output = path.with_suffix('.webp')
    backup(path)
    candidate = output.with_name(output.stem + '.candidate.webp')
    # Lossless edges for logos; higher quality for the red layered hero.
    image.save(candidate, format='WEBP', lossless=is_logo, quality=90 if is_hero else 82, method=6, exact=True)
    if is_spin and candidate.stat().st_size >= original_bytes:
        candidate.unlink()
    else:
        candidate.replace(output)
        if output != path:
            path.unlink()
    mapping[rel] = output.relative_to(SITE).as_posix()
    total = output.stat().st_size
    if not is_logo and not is_spin:
        small_width = 480 if is_thumb else 960 if is_hero else 800
        if image.width > small_width:
            small = scaled(image, small_width)
            small_path = output.with_name(output.stem + f'-{small_width}.webp')
            small.save(small_path, format='WEBP', quality=86 if is_hero else 80, method=6, exact=True)
            variants[mapping[rel]] = (small_width, image.width)
            total += small_path.stat().st_size
    records.append({'source': rel, 'output': mapping[rel], 'before': original_bytes, 'after': total})

# Build source patches rather than directly rewriting HTML/JS/CSS.
patch = ['*** Begin Patch']
for path in sorted(SITE.rglob('*')):
    if path.suffix not in ('.html', '.js', '.css'):
        continue
    original = path.read_text()
    updated = original
    for source, output in mapping.items():
        source_relative = Path(__import__('os').path.relpath(SITE / source, path.parent)).as_posix()
        output_relative = Path(__import__('os').path.relpath(SITE / output, path.parent)).as_posix()
        updated = updated.replace(source_relative, output_relative)
        # Shared shell resolves these relative to siteRoot, not its own file.
        if path.name == 'site-shell.js':
            updated = updated.replace(source, output)
    if path.suffix == '.html':
        def responsive(match):
            tag = match.group(0)
            src = re.search(r'\bsrc="([^"]+)"', tag)
            if not src:
                return tag
            asset = (path.parent / src.group(1)).resolve().relative_to(SITE).as_posix()
            if asset not in variants:
                return tag
            small_width, width = variants[asset]
            url = src.group(1)
            small_url = url[:-5] + f'-{small_width}.webp'
            sizes = '(max-width: 560px) calc(100vw - 40px), (max-width: 1100px) 50vw, 25vw' if 'film-thumbnail' in updated[max(0,match.start()-80):match.start()] else '(max-width: 800px) 100vw, 50vw' if 'video-card' in updated[max(0,match.start()-250):match.start()] else '100vw'
            return tag[:-1] + f' srcset="{small_url} {small_width}w, {url} {width}w" sizes="{sizes}">'
        updated = re.sub(r'<img\b[^>]*>', responsive, updated)
    if updated != original:
        patch += [f'*** Update File: {path}', '@@']
        patch += ['-' + line for line in original.splitlines()]
        patch += ['+' + line for line in updated.splitlines()]
patch.append('*** End Patch')
Path('/private/tmp/asset-reference.patch').write_text('\n'.join(patch) + '\n')
after = sum(p.stat().st_size for p in SITE.rglob('*') if p.is_file())
REPORT.write_text(json.dumps({'before_bytes': before, 'after_bytes': after, 'saved_percent': round((1-after/before)*100,1), 'assets': records}, indent=2) + '\n')
print(json.dumps({'before_bytes': before, 'after_bytes': after, 'saved_percent': round((1-after/before)*100,1)}))
