// Every URL the SPA owns. Clean paths (no .html). Old *.html links still work: they're
// normalised to the clean path (see normalizePath) and redirected.
export const ROUTES = [
  { path: '/', nav: 'home' },
  { path: '/experience', nav: 'experience' },
  { path: '/projects', nav: 'projects' },
  { path: '/certifications', nav: 'certs' },
  { path: '/mian', nav: 'projects' },
  { path: '/bushop-project', nav: 'projects' }, // not /bushop — that's your separate BusHop app repo
  { path: '/banana-shelflife', nav: 'projects' },
  { path: '/aguila', nav: 'projects' },
  { path: '/eeg-exoskeleton', nav: 'projects' },
  { path: '/privacy', nav: 'none' },
  { path: '/terms', nav: 'none' },
];

const BY_PATH = Object.fromEntries(ROUTES.map((r) => [r.path, r]));
const LEGACY = { '/bushop.html': '/bushop-project' };

/** '/projects.html' -> '/projects', '/index.html' -> '/', '/x/' -> '/x' */
export function normalizePath(p) {
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  if (p === '/index.html') return '/';
  if (p.endsWith('.html')) {
    const clean = LEGACY[p] || p.slice(0, -5);
    if (clean in BY_PATH || clean === '/404') return clean;
  }
  return p;
}

/** true if the path is rendered by this app (so we can client-side navigate to it) */
export function isSpaPath(p) {
  const n = normalizePath(p);
  return n in BY_PATH || n === '/404';
}

/** which nav-pill item should be highlighted; 'none' for legal pages / 404 */
export function navIdFor(p) {
  const r = BY_PATH[normalizePath(p)];
  return r ? r.nav : 'none';
}

/** 404 shows no nav pill / Mian (like the original standalone 404 page) */
export function isChromeless(p) {
  return !(normalizePath(p) in BY_PATH);
}
