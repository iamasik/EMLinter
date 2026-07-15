# Project: EMLinter (Astro)

EMLinter is a free, browser-based HTML email toolkit — linter, beautifier, minifier, dark-mode
checker, bulletproof Outlook VML generators (buttons & backgrounds), a no-code visual editor, plus
content pages (template library, blog, products, FAQ, contact).

This folder (`emlinter-astro/`) is the **live product**: an Astro 6 SSR app that wraps the original
React components verbatim. It was ported from a React + Vite SPA and is structurally complete and
verified — every page, layout, modal, service, and type is present, the production build passes, and
routes serve HTTP 200.

> This CLAUDE.md is self-contained. You do not need any file outside `emlinter-astro/` to work here.
> A sibling `../EMLinter/` React app exists as a **read-only reference** only. Never edit it, and never
> "redo" the conversion. If something is broken, fix it in place here.

## Tech stack

- **Astro 6** (`output: 'server'`) with the **`@astrojs/vercel`** adapter (see `astro.config.mjs`) → the
  build emits a Vercel deployment (`.vercel/output/`). It is **hybrid**, not all-serverless: the static
  Tier-1 shells opt into `export const prerender = true` and are baked to CDN HTML at build time (see the
  "Prerendering" note under Hydration); only dynamic/`[slug]`/`sitemap`/`api` routes stay serverless.
  (An earlier `@astrojs/node` standalone setup was replaced; the `@astrojs/node` package has been removed.)
- **React 19** for all UI (`@astrojs/react`). Astro files are thin route shells; all logic lives in `.tsx`.
- **Tailwind CSS 3** via `@astrojs/tailwind` (compiled — there is no Tailwind CDN script).
- **Firebase 12** (Firestore) for content (templates, posts, products, experts, app settings).
- **react-markdown** + **rehype-raw** for rendering post/product content.
- Node **>= 22.12.0** required.

## Commands

Run from `emlinter-astro/`:

```
npm install
npm run dev       # localhost:4321
npm run build     # outputs Node server bundle to dist/
npm run preview   # serve the built bundle
npm run astro ... # e.g. npm run astro check
```

The Bash tool here is Git Bash (POSIX). Background a long build with `npm run build > build.log 2>&1 &`
and poll the log, then clean up the log file afterward.

## Architecture: SSR shell wrapping React

The port does **not** rewrite logic in `.astro`. Each route is a thin shell that imports a React page
component and mounts it. Understand these three layers:

### 1. `src/layouts/BaseLayout.astro` — the shared shell

A single layout renders `<head>` and the chrome. It is richer than a plain wrapper — it owns **all SEO**:

- Props: `title`, `description` (required); `keywords?`, `ogImage?`, `ogType?` (`'website'|'article'`),
  `canonical?`, `noindex?`, `jsonLd?` (object or array), `faqSchema?` (`{question, answer}[]`).
- Emits canonical URL, full Open Graph + Twitter card tags, robots directives, and JSON-LD. It always
  injects `Organization` + `WebSite` + `BreadcrumbList` schema, merges any page `jsonLd`, and auto-builds
  a `FAQPage` schema from `faqSchema`.
- **`BreadcrumbList` is auto-derived from the URL path** (Home + one crumb per segment, title-cased). You
  do not pass it — every page gets it for free, server-rendered. For a detail route the last crumb is the
  title-cased slug, which is acceptable.
- Default `ogImage` is `${SITE_URL}/og-default.png` — a branded 1200×630 asset that **exists** in `public/`.
  Regenerate it (e.g. via the bundled `sharp` from an SVG) if branding changes; don't point the default at
  a missing file.
- `SITE_URL` is `https://www.emlinter.com` (also set as `site` in `astro.config.mjs` — keep both in sync).
  Update there if the domain changes.
- Mounts `AnnouncementBar` (`client:only`) plus `Header`, `Breadcrumbs`, `Footer` (`client:load`, so their
  nav/link markup is server-rendered and crawlable — see Hydration) and `<slot />`s page content into
  `<main class="container-wide ...">`. Also preloads two same-origin, LCP-critical fonts (see Styling).

### 2. `src/pages/**/*.astro` — one shell per route

Each shell imports its React page from `src/components/pages/`, sets per-route SEO props on `BaseLayout`,
and mounts the component — `client:load` if the page is SSR-safe (preferred; server-renders the body) or
`client:only="react"` + a `<SeoFallback slot="fallback">` if it isn't (see Hydration for the two tiers).
Pages carry their own page-specific `faqSchema` and `jsonLd` literals inline in the shell frontmatter (see
`pages/index.astro`, `pages/templates/index.astro`).

### 3. `src/components/` — ported React (source of truth for behavior)

- `pages/` — one component per route.
- `layout/` — `AnnouncementBar`, `Header`, `Breadcrumbs`, `Footer`.
- `modals/` — 21 modal components used by the editor and tools.
- `Icons.tsx` — shared SVG icons.
- `PageHero.tsx`, `SeoFaq.tsx` — Astro-port additions for consistent page heros and on-page FAQ blocks.
- `SeoFallback.astro` — server-rendered, crawlable hero (h1 + intro + internal links) passed to
  every indexable page via `slot="fallback"`. See the SEO section for the copy-parity rule.

### Hydration: two tiers — `client:load` for SSR-safe pages, `client:only` for the rest

Mounts fall into two groups. **Before changing any directive, confirm the component is SSR-safe** (no
`window`/`document`/`localStorage`/`navigator`/Firebase access at module scope, in the render body, or in a
`useState`/`useMemo` initializer — only inside `useEffect`/`useCallback`/event handlers; child modals must
return `null` when closed). A render-time browser-global access throws at request time (500), not at build.

**Tier 1 — `client:load` (server-rendered body, crawlable).** The **chrome** (`Header`, `Breadcrumbs`,
`Footer`) and the **static tool/solution/content pages** mount `client:load`: Astro server-renders their
full markup — hero, SEO copy, **static FAQ answer text**, nav/link graph — into the initial HTML (crawlable
by non-JS crawlers: Bing, social scrapers, AI bots) and then hydrates for interactivity. This is the
higher-SEO path and is the default for any SSR-safe page. Pages currently on `client:load`: `HomePage`,
`ToolsHubPage`, `SolutionsHubPage`, all eight `/tools/*` pages, the three Outlook `/solutions/*` generators,
`EmlFileViewerPage`, `HowItWorksPage`, `ContactUsPage`, and `PixelConverterPage`. These shells are **one-liners with no
`SeoFallback`** — the component's own `PageHero`/header is the server-rendered hero (a fallback would
double the `<h1>`). `Breadcrumbs`/`Header` take a `currentPath` prop from `BaseLayout` so they render the
correct trail/active state without reading `window`.

> **Prerendering (Tier-1 static pages).** Because these shells fetch nothing server-side, each one sets
> `export const prerender = true` in its frontmatter, so `output: 'server'` bakes them to **static CDN HTML
> at build time** (`.vercel/output/static/…/index.html`) instead of invoking a serverless function per hit —
> ~0ms TTFB, better CWV, lower cost. The `client:load` body is still server-rendered (at build), so the
> crawlable hero/FAQ/link graph is preserved. Currently prerendered: `/`, all `/tools/*` (incl. both hubs),
> the three Outlook `/solutions/*` generators, `/solutions/eml-file-viewer`, `/solutions/pixel-converter` hub,
> `/resources/how-it-works`, `/contact-us`. **When you add a new Tier-1 shell, add `export const prerender = true`** as the first
> frontmatter line. Everything that fetches per-request stays serverless (no `prerender`): the four detail
> `[slug]` shells, `visual-editor/[slug]` + `pixel-converter/[slug]` (dynamic slug / per-request 404),
> `sitemap.xml.ts`, and `/api/*`. Tier-2 `client:only` list pages are currently left serverless too.

**Tier 2 — `client:only` + `SeoFallback` (dynamic/stateful pages).** Pages that read `localStorage`, query
params, or Firebase during their initial render — `VisualEditorPage`, `TemplatesPage`/`TemplateDetailPage`,
`BlogPage`/`BlogPostPage`, `ProductsPage`/`ProductDetailPage`, `HtmlEmailTestPage`, and the FAQ page
(`OurExpertsPage`, whose Q&A is Firebase-fetched so `client:load` wouldn't expose it) — stay `client:only`.
Their body can't survive SSR, so each passes a `<SeoFallback slot="fallback">` island with a real `heading`,
`intro`, and internal `links`. `AnnouncementBar` also stays `client:only`.

**`SeoFallback.astro`** renders a crawlable hero (mirrors `PageHero`: grid backdrop, "Loading toolkit…"
chip, `.btn-secondary` pills) into the initial HTML; Astro keeps a second inert copy inside a
`<template data-astro-template>` and swaps in the real component the instant React hydrates — no client-side
hide hack. (That inert `<template>` copy is why a `client:only` page shows two `<h1>` in raw HTML — one
real, one inert; not a duplicate-heading bug.)

> **CRITICAL — copy parity (Tier 2 only):** the fallback `heading`/`intro` **must match the React
> component's real rendered h1 and intro verbatim** (including casing, e.g. lowercase `html` where the source
> uses it as a keyword). Any difference visibly rewrites itself on hydration — a jarring flash. Do **not**
> substitute SEO-richer or meta-title copy. For custom-header pages (`VisualEditorPage`, `BlogPage`,
> `ProductsPage`, `OurExpertsPage`), read the component's own `<header>`/`<h1>`. Detail shells (`[slug]`)
> build the fallback from the same server-fetched entity the meta uses, so they stay in sync automatically.

**404 / legal exception:** `src/pages/404.astro` and the three legal pages (`privacy-policy`,
`cookie-policy`, `terms`, via `LegalDoc.astro`) render their content as **static Astro markup in the slot**
(no React island at all). Follow that pattern for any purely static page.

The `<head>` (all meta + JSON-LD) is always server-rendered regardless of tier, so metadata is always
crawlable. See the SEO section for how Tier-2 detail-page meta is made crawlable despite the `client:only` body.

## Route map

25 route shells (`src/pages/**/*.astro`) ↔ 25 page components (`src/components/pages/*.tsx`). The
`pixel-converter/[slug]` shell reuses one component (`PixelConverterPage`) across 18 config-driven
conversions (see `src/lib/pixelConverters.ts`).

| URL                                          | Astro shell                                          | React component                  |
| -------------------------------------------- | ---------------------------------------------------- | -------------------------------- |
| `/`                                          | `pages/index.astro`                                  | `HomePage`                       |
| `/templates`                                 | `pages/templates/index.astro`                        | `TemplatesPage`                  |
| `/templates/<slug>`                          | `pages/templates/[slug].astro`                       | `TemplateDetailPage`             |
| `/tools`                                     | `pages/tools/index.astro`                            | `ToolsHubPage`                   |
| `/tools/code-fix`                            | `pages/tools/code-fix.astro`                         | `CodeFixPage`                    |
| `/tools/beautify-code`                       | `pages/tools/beautify-code.astro`                    | `BeautifyCodePage`               |
| `/tools/html-minifier`                       | `pages/tools/html-minifier.astro`                    | `HtmlMinifierPage`               |
| `/tools/dark-mode-checker`                   | `pages/tools/dark-mode-checker.astro`                | `DarkModeCheckerPage`            |
| `/tools/design-copier`                       | `pages/tools/design-copier.astro`                    | `DesignCopierPage`               |
| `/tools/svg-to-png`                          | `pages/tools/svg-to-png.astro`                       | `SvgToPngPage`                   |
| `/tools/relative-image-scaler`               | `pages/tools/relative-image-scaler.astro`            | `RelativeImageScalerPage`        |
| `/tools/html-to-image`                       | `pages/tools/html-to-image.astro`                    | `HtmlToImagePage`                |
| `/solutions`                                 | `pages/solutions/index.astro`                        | `SolutionsHubPage`               |
| `/solutions/html-email-test`                 | `pages/solutions/html-email-test.astro`              | `HtmlEmailTestPage`              |
| `/solutions/outlook-button-generator`        | `pages/solutions/outlook-button-generator.astro`     | `OutlookButtonGeneratorPage`     |
| `/solutions/outlook-background-generator`    | `pages/solutions/outlook-background-generator.astro` | `OutlookBackgroundGeneratorPage` |
| `/solutions/outlook-ready-html`              | `pages/solutions/outlook-ready-html.astro`           | `OutlookReadyHtmlPage`           |
| `/solutions/eml-file-viewer`                 | `pages/solutions/eml-file-viewer.astro`              | `EmlFileViewerPage`              |
| `/solutions/pixel-converter`                 | `pages/solutions/pixel-converter/index.astro`        | `PixelConverterHubPage`          |
| `/solutions/pixel-converter/<slug>`          | `pages/solutions/pixel-converter/[slug].astro`       | `PixelConverterPage`             |
| `/visual-editor`                             | `pages/visual-editor/index.astro`                    | `VisualEditorPage`               |
| `/visual-editor/<slug>`                      | `pages/visual-editor/[slug].astro`                   | `VisualEditorPage`               |
| `/resources/blog`                            | `pages/resources/blog/index.astro`                   | `BlogPage`                       |
| `/resources/blog/<slug>`                     | `pages/resources/blog/[slug].astro`                  | `BlogPostPage`                   |
| `/resources/products`                        | `pages/resources/products/index.astro`               | `ProductsPage`                   |
| `/resources/products/<slug>`                 | `pages/resources/products/[slug].astro`              | `ProductDetailPage`              |
| `/resources/how-it-works`                    | `pages/resources/how-it-works.astro`                 | `HowItWorksPage`                 |
| `/resources/faq`                             | `pages/resources/faq.astro`                          | `OurExpertsPage` (component name)|
| `/contact-us`                                | `pages/contact-us.astro`                             | `ContactUsPage`                  |

Plus a dynamic sitemap endpoint and a custom 404 (not React pages):

| URL             | File                        | Notes                                                        |
| --------------- | --------------------------- | ------------------------------------------------------------ |
| `/sitemap.xml`  | `pages/sitemap.xml.ts`      | API route; static routes + live Firebase URLs (see SEO below)|
| `/404`          | `pages/404.astro`           | Static server-rendered content, `noindex` (no `client:only`) |
| `/privacy-policy` | `pages/privacy-policy.astro` | Static, crawlable legal page via `LegalDoc.astro`          |
| `/cookie-policy`  | `pages/cookie-policy.astro`  | Static, crawlable legal page via `LegalDoc.astro`          |
| `/terms`          | `pages/terms.astro`          | Static, crawlable Terms of Service via `LegalDoc.astro`    |

Notes:
- The original React `HubPage.tsx` was split into concrete `ToolsHubPage` and `SolutionsHubPage`
  components so each shell stays a one-liner.
- The FAQ route (`/resources/faq`) renders a component still named `OurExpertsPage`.
- `VisualEditorPage` backs both `/visual-editor` and `/visual-editor/<slug>`. The `[slug]` shell sets
  `canonical="https://www.emlinter.com/visual-editor"` so the deep-link variants don't compete as duplicates.
- The four **detail shells** (`templates/[slug]`, `resources/blog/[slug]`, `resources/products/[slug]`)
  are **not** one-liners — they fetch from Firebase server-side to emit real per-entity meta (see SEO below).

## Navigation

There is no client-side router and no `onNavigate` prop (both from the old SPA are gone). Navigation is
plain full-page loads:

- **Preferred: `<a href="...">`.** `Header`, `Footer`, and `Breadcrumbs` all use anchor tags. Map a page
  key to a path as `page === 'home' ? '/' : '/' + page`.
- A helper exists at `src/lib/navigate.ts` (`navigate(page)` → sets `window.location.href`), but **no
  component currently imports it**. Prefer `<a href>` for new links; reach for the helper only when you
  need to navigate imperatively from an event handler.
- Because every navigation is a full reload, per-page `<title>`/meta (set via `BaseLayout` props) always
  applies correctly — there is no SPA history-push that could stale the title.

### Passing state between pages

The old SPA passed a second `state` arg through `onNavigate(page, state)` (e.g. `TemplatesPage`'s
`initialFilter`). That channel no longer exists. To pass state across a navigation, use **query params**
(`/templates?filter=...`) and read them client-side via `window.location.search` (or in a shell via
`Astro.url.searchParams`).

## SEO (read before touching meta, shells, or routing)

The `<head>` is fully server-rendered on every page; the `<body>` is server-rendered for Tier-1
`client:load` pages and `client:only` (with a `SeoFallback` hero) for Tier-2 pages (see Hydration above). The setup:

- **`BaseLayout.astro` owns all head SEO** — see the BaseLayout section for props and the always-on
  `Organization` + `WebSite` + `BreadcrumbList` schema. Pass page-specific `jsonLd` / `faqSchema` from the
  shell.
- **Static shell meta rules:** titles ≤ 60 chars, descriptions ≤ 160 (and ≥ ~120, not thin). Brand suffix
  is **always `| EMLinter`** (a previous audit found stray `| Resource Silo` suffixes — don't reintroduce
  them). Every shell already complies; keep new ones in range.
- **Dynamic detail pages fetch server-side for crawlable meta.** `templates/[slug]`, `resources/blog/[slug]`,
  and `resources/products/[slug]` call the Firebase getter **in the `.astro` frontmatter** (wrapped in
  try/catch, degrading to a generic title on failure) and pass real per-entity `title`, `description`,
  `ogImage`, `ogType`, and `jsonLd` to `BaseLayout`. This is why those shells aren't one-liners. The React
  component still fetches again client-side to render the body — that duplication is intentional. **Do not
  re-add client-side JSON-LD injection** for Product/BlogPosting schema; it now lives server-side in the
  shell (the `VideoObject` schema in `ProductDetailPage` stays client-side because it depends on the embed).
  Blog posts use `ogType="article"`; `BlogPostPage` remaps markdown `#` → `<h2>` (`components={{ h1: 'h2' }}`)
  so the post-title `<h1>` stays unique.
- **Sitemap:** `src/pages/sitemap.xml.ts` (API route, `prerender = false`) emits static routes from an inline
  `STATIC_ROUTES` list **plus live blog/template/product URLs** fetched from Firebase (each getter wrapped in
  `.catch(() => [])` so a Firebase outage degrades to the static set). **Add new static routes to
  `STATIC_ROUTES`.** `public/robots.txt` references it.
- **Images:** grid/list thumbnails use `loading="lazy"`; above-the-fold detail-page hero images use
  `fetchpriority="high"` (they're LCP candidates — never lazy-load them).
- **Legal pages:** `/privacy-policy`, `/cookie-policy`, and `/terms` are **static, crawlable Astro pages**
  (server-rendered via `LegalDoc.astro`, indexable, in `STATIC_ROUTES`). The `Footer` links to them with
  `<a href>` — the old React `PolicyModal` approach is gone (`PolicyModal.tsx` is now unused). Edit the
  copy in the `.astro` pages; `terms.astro` has `[YOUR JURISDICTION]` governing-law placeholders to fill.
- **`llms.txt`:** `public/llms.txt` is a markdown site map for AI crawlers. Keep its link list in sync when
  routes change.
- **Body crawlability:** static tool/solution/content pages now render their full body (hero, SEO copy,
  FAQ answer text) server-side via `client:load` — see Hydration Tier 1. Only the **Tier-2 dynamic pages**
  (editor, templates/blog/products lists + details, html-email-test, faq) remain `client:only` with a
  `SeoFallback` hero, because their bodies depend on `localStorage`/query params/Firebase at render.
- **Known follow-ups (not yet done):** placeholder social URLs in `Footer.tsx` and `sameAs` in
  `BaseLayout.astro` (`twitter.com/emlinter`, `github.com/emlinter`).

## Services (`src/services/`)

Ported one-to-one from the React app and verified byte-identical (logic behavior unchanged):

- `firebase.ts` — Firestore reads/writes. Exports: `getTemplates`, `getTemplateBySlug`,
  `updateTemplateRating`, `getVideoGuides`, `getPosts`, `getPostBySlug`, `getRecommendedPosts`,
  `updatePostVoteCount`, `getExperts`, `getAppSettings`, `getProducts`, `getProductBySlug`, plus `db`.
  Firebase web config is read from `PUBLIC_FIREBASE_*` env vars and public — not secrets. **These getters are now called both
  client-side (in components) and server-side (in detail shells + `sitemap.xml.ts`)** — the Firebase web
  SDK runs fine in Node, so keep them isomorphic (no `window`/`document` references).
- `htmlValidator.ts`, `htmlBeautifier.ts`, `htmlMinifier.ts`, `colorAnalyzer.ts` — pure client-side
  logic, no network.

`src/types.ts` is identical to the reference app: `Template`, `VideoGuide`, `Post`, `Expert`,
`AppSettings`, `Product`, `HtmlValidationError`, etc.

## Styling

- `tailwind.config.mjs` defines the design system: color scales `ink` (dark UI base, `ink-950`
  background), `brand` (pink/magenta), `accent` (violet); `display`/`sans`/`mono` font families
  (Inter, Space Grotesk, JetBrains Mono — **self-hosted** as `woff2` in `public/font/` via `@font-face`
  in `global.css`, `font-display: swap`; the old render-blocking Google Fonts `@import` was removed and
  `BaseLayout` preloads `Inter.woff2` + `SpaceGrotesk-Bold.woff2`. Inter & JetBrains Mono are single
  variable files; Space Grotesk is static instances — there is no 600 cut, so `font-weight:600` maps to
  the Bold file. To add weights/families, drop the `woff2` in `public/font/` and add an `@font-face`);
  custom `backgroundImage`, `boxShadow` (`glow`, `card`), and animations (`fade-up`, `shimmer`, `pulse-slow`).
- `src/styles/global.css` holds Tailwind directives plus reusable component classes: `.container-wide`,
  `.container-prose`, `.glass`, `.card`, `.gradient-text`, `.btn-primary`, `.btn-secondary`, `.chip`,
  `.section-title`, `.section-subtitle`, `.custom-scrollbar`. Imported once by `BaseLayout.astro`.
- The app is dark-mode only (`color-scheme: dark`). Reuse these classes rather than inventing new ones.

## Environment

- Firebase config is read from `PUBLIC_FIREBASE_*` env vars in `firebase.ts` (public web keys, not secrets; see `.env.example`).
- **`FIREBASE_SERVICE_ACCOUNT_KEY`** (server-only, no `PUBLIC_` prefix) — the full JSON contents of a
  Firebase service-account key, read by `src/services/firebaseAdmin.ts` (`firebase-admin`, not the
  client SDK). All Firestore *writes* (`contactMessages`, template ratings, post votes) go through this
  module from server-only API routes (`src/pages/api/contact.ts`, `rate-template.ts`, `vote-post.ts`) so
  they aren't gated only by Firestore Security Rules on a publicly-known web config. `firebase.ts` /
  `firebaseAdmin.ts` no longer export any client-callable write functions — see `firestore.rules` at the
  repo root (paste into the Firebase console; not auto-deployed) for the rules that deny client writes.

## Known npm audit findings (deferred — 2026-07-13)

`npm audit` reports 3 "high" that are a **single** issue counted along one dependency chain:
`path-to-regexp` ReDoS → `@vercel/routing-utils` → `@astrojs/vercel@10`. (`esbuild`'s dev-server
file-read on Windows is a separate **low**, not one of the highs, despite how it's sometimes summarized.)

**Deferred, not fixed, on purpose.** `@vercel/routing-utils` runs `path-to-regexp` at **build time**
against our own route config to generate the Vercel routes manifest — it never processes attacker-supplied
request paths at runtime, so the ReDoS is not reachable in production. The only fix npm offers is
`@astrojs/vercel@11`, which requires **`astro@^7`** — i.e. it forces an Astro 6→7 framework major, far
larger than an adapter bump. Not worth doing reactively for a build-time-only issue. **Revisit this and
clear the audit as part of a deliberate Astro 7 upgrade**, not on its own.

## Conventions when making changes

- **New route** → add a `.astro` shell under `src/pages/` that imports the React page from
  `src/components/pages/`, wraps it in `BaseLayout` with `title` + `description` (and any `faqSchema` /
  `jsonLd`), and mounts it `client:load` if the component is SSR-safe (preferred — server-renders the body;
  omit `SeoFallback`) or `client:only="react"` + `<SeoFallback slot="fallback">` if not (see Hydration's two
  tiers). Add a row to the route map above, **and add the URL to `STATIC_ROUTES` in
  `src/pages/sitemap.xml.ts`**. If the shell fetches nothing server-side (a Tier-1 static page), also add
  `export const prerender = true` as the first frontmatter line so it bakes to CDN HTML (see Hydration's
  Prerendering note). Keep title ≤ 60 / description ≤ 160 chars, suffix `| EMLinter` (see SEO section).
  The `new-route` skill scaffolds this.
- **New dynamic detail route** → fetch its entity from Firebase **server-side in the shell frontmatter**
  (try/catch → generic fallback) to emit real meta + `jsonLd`; don't rely on client-side `document.title`
  patching alone. Mirror `resources/blog/[slug].astro`.
- **New page behavior** → write/edit the React component in `src/components/pages/`, then wire the shell.
- **Dynamic routes** (`[slug].astro`) in SSR mode need `export const prerender = false` unless you supply
  `getStaticPaths`. Read the slug via `const { slug } = Astro.params`.
- **Imports** are relative. The `@/*` path alias is **not** configured (`tsconfig.json` extends
  `astro/tsconfigs/strict` only). Use relative paths, or wire the alias into both `tsconfig.json` and
  `astro.config.mjs` if you want it.
- **Links** → prefer `<a href>`; use `navigate()` from `src/lib/navigate.ts` only for imperative cases.
- **Cross-page state** → query params, not a navigate `state` arg.
- Keep the reference app `../EMLinter/` untouched.

## Verifying a change

1. `npm run build` — must exit 0 and print `Complete!`. This is the fastest way to catch a broken
   import, bad `.astro` frontmatter, or a type error. The build itself is **offline-safe**: Firebase is
   only hit at request time (detail shells + `sitemap.xml.ts`), never during the build.
2. For runtime behavior, `npm run dev` and hit the affected route (expect HTTP 200); for a fuller check,
   `npm run preview` against the built bundle.
3. **To verify SEO output** (server-rendered `<head>`), `curl` the built route and grep the HTML — e.g.
   `curl -s localhost:4321/tools/html-minifier | grep -oE '<title>[^<]*</title>|BreadcrumbList|og:type'`.
   Also spot-check `/sitemap.xml` (URL count), `/robots.txt`, and a bad URL (expect HTTP 404). Detail-page
   meta needs network + Firebase to populate; without it the shell serves the generic fallback title.
4. Firebase-backed pages need network + a valid project. If unavailable, note it rather than claiming
   the feature was exercised end-to-end.
