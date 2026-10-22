import { useEffect } from 'react';
import { SEO } from '../data/seo.js';

/** Swap <title>, meta tags and JSON-LD to match the current route. */
export function applySeo(route) {
  const d = SEO[route];
  if (!d) return;
  document.title = d.title;
  document.head.querySelectorAll('[data-seo]').forEach((el) => el.remove());
  for (const m of d.metas) {
    const el = document.createElement('meta');
    if (m.name) el.setAttribute('name', m.name);
    if (m.property) el.setAttribute('property', m.property);
    el.setAttribute('content', m.content);
    el.setAttribute('data-seo', '');
    document.head.appendChild(el);
  }
  if (d.jsonLd) {
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.setAttribute('data-seo', '');
    s.textContent = JSON.stringify(d.jsonLd);
    document.head.appendChild(s);
  }
}

export function useSeo(route, enabled = true) {
  useEffect(() => {
    if (enabled) applySeo(route);
  }, [route, enabled]);
}
