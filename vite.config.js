import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The site is served from the root of jcdcocampo.github.io, so base is '/'.
// Clean URLs (/projects). Old *.html links are rewritten to index.html in dev/preview and redirected by the app.
function htmlRoutesFallback() {
  const rewrite = (req, _res, next) => {
    const p = (req.url || '').split('?')[0];
    if (/^\/[\w-]+\.html$/.test(p) && p !== '/index.html') req.url = '/index.html' + (req.url.includes('?') ? '?' + req.url.split('?')[1] : '');
    next();
  };
  return {
    name: 'html-routes-fallback',
    configureServer(s) { s.middlewares.use(rewrite); },
    configurePreviewServer(s) { s.middlewares.use(rewrite); },
  };
}

export default defineConfig({
  base: '/',
  build: { assetsDir: 'static' }, // keep Vite's bundles out of your own /assets image folder
  plugins: [react(), htmlRoutesFallback()],
});
