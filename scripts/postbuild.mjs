// After `vite build`: GitHub Pages only serves real files, so emit one copy of index.html per
// page (projects.html is served at /projects, mian.html at /mian, …). Each copy carries that page's own <title>, description,
// Open Graph / Twitter tags and JSON-LD, so search engines and link-preview bots (which don't run
// JS) still see the right metadata. The React app boots on every copy and shows the right route.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEO } from '../src/data/seo.js';

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
if (!template.includes('<!--seo-->')) throw new Error('index.html is missing the <!--seo--> marker');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function headFor(d) {
  const lines = d.metas.map((m) => {
    const key = m.name ? `name="${esc(m.name)}"` : `property="${esc(m.property)}"`;
    return `<meta ${key} content="${esc(m.content)}" data-seo />`;
  });
  if (d.jsonLd) lines.push(`<script type="application/ld+json" data-seo>${JSON.stringify(d.jsonLd).replace(/</g, '\\u003c')}</script>`);
  return lines.join('\n  ');
}

let count = 0;
for (const [route, d] of Object.entries(SEO)) {
  const html = template
    .replace(/<title>.*?<\/title>/s, `<title>${esc(d.title).replace(/&quot;/g, '"')}</title>`)
    .replace('<!--seo-->', headFor(d));
  const file = route === '/' ? 'index.html' : route.slice(1) + '.html';
  fs.writeFileSync(path.join(dist, file), html);
  count++;
  // GitHub Pages serves projects.html at both /projects and /projects.html.
  // The old BusHop article lived at bushop.html, so keep that URL alive too (the app redirects it).
  if (route === '/bushop-project') {
    fs.writeFileSync(path.join(dist, 'bushop.html'), html);
    count++;
  }
}
console.log(`postbuild: wrote ${count} route entry files (${Object.keys(SEO).map((r) => (r === '/' ? 'index.html' : r.slice(1) + '.html')).join(', ')})`);

// List of every image used by the four swipeable tabs; Layout.jsx pre-loads them on touch devices.
const root = path.resolve(dist, '..');
const tabFiles = ['Home', 'Experience', 'Projects', 'Certifications'].flatMap((n) => [`src/pages/${n}.jsx`, `src/pages/${n}.css`]).concat('src/data/platforms.js');
const assets = new Set();
for (const f of tabFiles) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) continue;
  for (const m of fs.readFileSync(p, 'utf8').matchAll(/\/assets\/[^"'`\s)]+?\.(?:png|jpe?g|webp|gif|svg)/gi)) assets.add(m[0]);
}
fs.writeFileSync(path.join(dist, 'tab-assets.json'), JSON.stringify([...assets]));
console.log(`postbuild: tab-assets.json lists ${assets.size} images`);
