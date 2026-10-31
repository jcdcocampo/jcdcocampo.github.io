# Portfolio revision — squircle and editorial refinement

- Removed the verification check mark from the landing-page name.
- Expanded the portrait to the left viewport edge and feathered its right edge into the hero background, eliminating the hard vertical crop seen in the supplied screenshot.
- Kept the black gradient transition from the landing page into Experience.
- Added the Accenture and Converge logo marks above their employer pills; Accenture uses its violet brand color.
- Updated organization pills: Mapúa Cardinal One red, IECEP-MUSC light blue, IEEE-MUSB dark blue.
- Removed the Aguila project and arrow glyphs; the Research pill is red.
- Converted View All and See Credential into consistent non-lifting pill controls. View All remains an inactive placeholder.
- Replaced the certificate controls with a seamless, edge-to-edge, right-to-left continuous marquee. Credential cards have no visible borders; their issuer marks are larger.
- Moved Credential & Learning Profiles below View All and reduced the entries to clickable logo images only. Hover scales the logo gently without lifting the item.
- Removed the organization website text link; only the affiliation photograph is clickable.
- Standardized the editorial content width to 960px and the shared fixed corner measurement to 28px.
- Added progressive native CSS superellipse corners (`corner-shape: superellipse(2)`) with a 28px rounded fallback for browsers that do not yet support the property.
- All custom visual styling remains in `src/styles/index.css`; no additional stylesheet was added.
- Retained credential and external links from the prior repository.

## Squircle reference

The corner geometry follows the superellipse / continuous-corner approach described by [cornerKit](https://github.com/bejarcode/cornerKit) and the CSS `corner-shape` superellipse model. Native `corner-shape` support is not yet universal, so browsers without it use the shared 28px radius fallback.

## Files

- `src/App.jsx`: revised sections, links, marquees, and image interactions.
- `src/styles/index.css`: the single Tailwind entry stylesheet and all custom styling.
- `public/images/`: retained portfolio photos, logos, and project assets.

Run `npm ci` then `npm run build` to build the site.

## V4 visual revisions
- Restored the centered hero portrait composition and feathered the photo's left and right edges into the hero background.
- Kept Accenture and Converge PNG marks visible directly above their company pills.
- Replaced the automatic certificate marquee with a manually controlled horizontal carousel. Each arrow click advances one certificate card; no automatic movement.
- Increased certificate logo size and matched credential buttons to the light neutral View All treatment.
- Restored six credential-platform cards in a 3-column by 2-row desktop grid; cards contain logo artwork only and only the logos zoom subtly on hover.
- Increased the shared card squircle radius while keeping buttons and colored labels pill-shaped.

## V5 — true Figma-style squircles and final interaction refinements
- Replaced the previous radius-only card treatment with dynamically generated Figma-style SVG clip paths. The path is recalculated with `ResizeObserver` whenever a card's dimensions change, using a shared 42px corner radius and 0.75 smoothing.
- Adapted the equal-corner path construction from `phamfoo/figma-squircle` / `figma-squircle` (MIT); no extra npm dependency is required. Native `corner-shape: squircle` remains as a progressive fallback for browsers where the generated clip path is unavailable.
- Hero portrait is larger and anchored to the far-left edge on desktop/tablet. The text block is unchanged; feathering is applied only along the portrait's right edge so the face remains clear.
- LinkedIn and GitHub marks remain blue, use reduced opacity at rest, and become the full Send Email blue on hover without an icon-fill swap.
- All action buttons and colored category labels use capsule / running-track geometry. Send Email lightens on hover; View All and See Credential darken subtly. No lift or shadow effect is introduced.
- Certificate gallery remains manual: arrow clicks advance exactly one card, and users can also swipe, trackpad-scroll, or drag horizontally with a mouse. The first card aligns with the editorial content edge while the gallery track runs edge-to-edge.
- Credential profile cards remain centered in a compact 3 × 2 desktop grid with larger logos.
- Scroll reveals begin as soon as cards approach the viewport (90px observer lead-in), with no stagger delay. The footer's “Let's Connect” block is excluded from reveal animation and remains static.

## V6 refinements
- Landing hero now fills the viewport without exposing the Experience heading/cards above the fold; removed the photo-derived blurred backdrop and replaced it with a plain solid fill.
- Extended and softened the transition into the black Experience section, moved the feather below the hero, adjusted mobile portrait headroom, and separated the two role lines on mobile.
- Standardized social circles to the email button height, with a light-blue resting state, white brand marks, and the email blue on hover.
- Added a desktop horizontal, center-snapping Experience carousel with arrow controls; it remains a vertical stack on mobile.
- Reduced the mobile Education and Affiliation card heights, stacked the three Education subcards at equal sizes, and linked the Mapúa graduation photo to the university website.
- Reduced the mobile Mian feature-card height and displayed its full image without cropping.
- Center-snapped the certificate gallery on mobile and desktop, added active-position dots, improved mouse dragging to prevent text selection, and retained smooth arrow scrolling.
- Expanded Credential & Learning Profiles to the content margins and increased logo scale; left-aligned its heading.
- Restored the original repository's 700ms `fadeUp` curve (`cubic-bezier(.22, 1, .36, 1)`, 24px rise) for viewport-triggered card entrances, and restored progressive desktop wheel easing from the original `useNavigationScroll` implementation. Mobile scrolling remains native.

## V7 interaction and layout corrections
- Restored the original repository's complete document-wheel easing logic, including line/page wheel normalization, nested-scroll protection, resize synchronization, and interruption handling. Native touch scrolling and horizontal trackpad gestures remain untouched.
- Replaced native `scrollBy({ behavior: 'smooth' })` for the Experience and certificate arrows with a requestAnimationFrame-based eased scroll, so movement remains smooth even when CSS scroll behavior is set to `auto`.
- Added responsive mouse dragging with release momentum to both horizontal rails, while suppressing text selection and accidental clicks after a drag.
- Experience cards now retain the V5 full-width card dimensions in a continuous horizontal desktop rail with position dots; mobile remains vertically stacked.
- Certificate cards start flush with the left edge directly below the desktop heading; mobile retains centered cards and snapping.
- Restored circular light-blue social buttons and added hover image paths for `linkedin-logo-full.png` and `github-logo-full.png` in `public/images/social/`.
- Removed the oversized hero-to-Experience gap and softened the mobile portrait's top edge with a feather mask to hide the hard photo boundary.
- Education subcards on mobile now use the same stacked image-above-copy layout as the Projects cards.
- Expanded the six credential logo cards across the full content width and increased logo display size while retaining squircle card corners.


## V8 — landing portrait, social cross-fades, and responsive carousel corrections
- Social logos retain their supplied original colors; hover now cross-fades directly to the matching `*-logo-full.png` image with no white fill, recoloring, or button background.
- Restored mobile portrait headroom: removed the upward crop and top-edge fade, preserving the head while feathering only the lower photo boundary. Hero text and action icons are layered above the black transition gradient.
- Experience is a true horizontal carousel on desktop and mobile. Accenture and Converge sit side-by-side in the rail; arrows, mouse drag with momentum, and native touch swiping all navigate it.
- Certificates retain the desktop left alignment beneath the title and centered mobile presentation, with wider landscape certificate cards, eased arrow travel, mouse drag momentum, native touch swiping, and smooth certificate-logo hover zoom.
- Mobile document scrolling remains native touch scrolling with platform momentum; smooth behavior is enabled for in-page/programmatic navigation. Desktop retains the original custom eased wheel scrolling.


## V9 revisions
- Social icons retain their original PNG colors; hover cross-fades to the full-logo PNGs without filters or white recoloring.
- Desktop Experience rail uses V6's centered 70%-width cards so the next card is visible to the right; eased arrow navigation and mouse drag remain. Mobile Experience is stacked and hides its arrows/pagination.
- Licenses & Certifications desktop rail begins flush-left beneath its title, uses wider landscape certificate cards, and retains eased arrow navigation, mouse drag, and smooth logo zoom. Mobile keeps the V6 centered 82vw swipe cards.
- Added the supplied favicon as `/favicon.jpg`; browser tab title is exactly `Engr. Jose Carlo David Ocampo`.

## V10 — interaction and card geometry correction
- Experience desktop rail restored to V6 geometry: 620px maximum card width, 70% container width, centered initial card, 18px gap, and symmetric end gutters so both cards can be centered without margin clipping. Mobile remains vertically stacked with no arrows or dots.
- Experience and certificate arrow movement now uses a 900ms symmetric quintic ease-in-out animation. Mouse/pen drag retains momentum with gentler deceleration; touch scrolling remains native.
- Certificate desktop cards now use a landscape 1.414:1 aspect ratio, compact 14px gaps, left-aligned initial rail position, and a two-column composition with logo panel on the left and credential copy on the right. Mobile retains V6's centered card treatment.
- Certificate logo hover zoom uses a smooth 700ms easing transition.
- Social hover is opacity-only cross-fading between the two image layers; no recoloring, white filter, hover background, or hover transform is applied.
- Added a circular transparent PNG favicon generated from the supplied favicon image and updated the browser icon link. Browser title remains exactly "Engr. Jose Carlo David Ocampo".

Asset note: both `linkedin-logo-full.png` and `github-logo-full.png` are present under `public/images/social/` and power the social-icon hover cross-fades.

## V11 — route and repository integrity
- Removed command-palette links to legacy portfolio `.html` pages and routed project, credential, and section results through the current React app.
- Added the current site's PWA manifest and icons, robots policy, sitemap, Open Graph preview image, and custom 404 page.
- Added the seven-click portrait easter egg, which opens the custom 404 page.
- Unknown app routes now display a not-found screen instead of silently showing Home.
- Updated the image asset guide to describe the current public folder structure.
