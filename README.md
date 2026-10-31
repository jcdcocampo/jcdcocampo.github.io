# JC Ocampo Portfolio

React and Vite portfolio site for Engr. Jose Carlo David Ocampo.

## Local development

```sh
npm ci
npm run dev
```

Build and preview the production site with:

```sh
npm run build
npm run preview
```

Static site assets live in `public/`. Project, legal, and credentials pages are handled by the React app using query-string routes. The custom GitHub Pages 404 document is `public/404.html`.

## Security notes

This is a browser app, so any value bundled into `src/` or `public/` is public. Do not add provider API keys or private credentials here. Mian sends requests to a separately hosted Cloudflare Worker; keep model credentials in that Worker’s server-side environment and protect its endpoint with server-side validation and abuse controls.
