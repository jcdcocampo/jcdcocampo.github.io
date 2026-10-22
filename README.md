# jcdcocampo.github.io — React version

Clean URLs (`/projects`, `/mian`, …) and navigation that no longer reloads the page.
Old `.html` links (`/projects.html`) redirect to the new ones. The BusHop article is `/bushop-project`
(`/bushop/` stays your separate BusHop app).
The nav pill, Mian chatbot and ⌘K palette live in a persistent layout and never remount.

## Setup

The repository already includes its assets under `public/assets/`; no separate assets folder needs to be copied.

1. `npm ci` — install the locked dependencies
2. `npm run dev` — start the local development server
3. `npm run build` — build to `dist/` and write one entry file per old URL (see Deploying)

## Learning platform logos

Logos for the "Credentials & Learning" card go in `public/assets/profiles/` (PNG, about 360×120 px, transparent background, normal colours; shown on white pills, no captions):
`credly.png`, `skillsoft.png`, `google-skills.png`, `microsoft-learn.png`, `aws-skill-builder.png`, `oracle-university.png`.
Names, links and file paths live in `src/data/platforms.js` (used by both the home page and the Certifications page).

## Deploying (GitHub Pages)

- Replace the contents of your `jcdcocampo.github.io` repo with this project (keep your `bushop/` sub-site repo as is).
- In the repo: **Settings → Pages → Source: GitHub Actions**. Pushing to `main` runs `.github/workflows/deploy.yml`.
- `scripts/postbuild.mjs` copies the built `index.html` to `projects.html`, `mian.html`, etc. (GitHub Pages serves those at `/projects`, `/mian`) with each page's own
  `<title>`, description, Open Graph/Twitter tags (so link previews and Google keep working). `404.html` shows the dino game.

## Layout

```
public/nav.js               liquid-glass nav + Mian + ⌘K (your original, patched to use client-side routing)
public/assets/              ← put your images here
src/App.jsx                 routes
src/components/Layout.jsx   persistent shell: nav, scroll restoration, hash links, nav highlight sync
src/pages/*.jsx + *.css     one component + scoped stylesheet per page
src/hooks/                  weighted scroll, profile theme video, sticky header, timeline line, dino game, …
src/data/seo.js             per-page title/meta (used at runtime and by postbuild)
```

Page text lives in `src/pages/*.jsx`. Each page's CSS is scoped under `.page-<name>` so styles don't leak between pages.
