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

- **Astro 6** (`output: 'server'`) with the **`@astrojs/node`** adapter in `standalone` mode → the build
  emits a Node server bundle at `dist/server/entry.mjs`, not a static site.
- **React 19** for all UI (`@astrojs/react`). Astro files are thin route shells; all logic lives in `.tsx`.
- **Tailwind CSS 3** via `@astrojs/tailwind` (compiled — there is no Tailwind CDN script).
- **Firebase 12** (Firestore) for content (templates, posts, products, experts, app settings).
- **`@google/genai`** (Gemini) for AI error explanations.
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
- `SITE_URL` is `https://emlinter.com` (also set as `site` in `astro.config.mjs` — keep both in sync).
  Update there if the domain changes.
- Mounts `AnnouncementBar`, `Header`, `Breadcrumbs`, `Footer` (all `client:only="react"`) and `<slot />`s
  page content into `<main class="container-wide ...">`.

### 2. `src/pages/**/*.astro` — one shell per route

Each shell imports its React page from `src/components/pages/`, sets per-route SEO props on `BaseLayout`,
and renders the component with `client:only="react"`. Pages carry their own page-specific `faqSchema`
and `jsonLd` literals inline in the shell frontmatter (see `pages/index.astro`, `pages/templates/index.astro`).

### 3. `src/components/` — ported React (source of truth for behavior)

- `pages/` — one component per route.
- `layout/` — `AnnouncementBar`, `Header`, `Breadcrumbs`, `Footer`.
- `modals/` — 21 modal components used by the editor and tools.
- `Icons.tsx` — shared SVG icons.
- `PageHero.tsx`, `SeoFaq.tsx` — Astro-port additions for consistent page heros and on-page FAQ blocks.
- `SeoFallback.astro` — server-rendered, crawlable hero (h1 + intro + internal links) passed to
  every indexable page via `slot="fallback"`. See the SEO section for the copy-parity rule.

### Hydration: always `client:only="react"`

Every React **page/chrome** mount uses `client:only="react"` — **not** `client:load` or `client:visible`.
The components rely on `window`, `localStorage`, the Firebase client SDK, and client-only React state that
does not survive SSR. Do not change a mount directive without first confirming the component is SSR-safe.

**Exception:** `src/pages/404.astro` renders its content as **static Astro markup in the slot** (no
`client:only`), so the 404 is useful without JS. Follow that pattern for any page whose content is static.

**Body content crawlability — `SeoFallback.astro`:** because pages are `client:only`, the server-delivered
`<body>` would otherwise have no headings/text/links until React hydrates (non-JS crawlers — Bing, social
scrapers, AI bots — would see an empty body). Every indexable shell passes a `<SeoFallback slot="fallback">`
to its `client:only` island with a real `heading`, `intro`, and internal `links`. Astro server-renders this
into the initial HTML (crawlable) and **auto-removes it the instant React hydrates** — no client-side hide
hack. It's styled to mirror `PageHero` (grid backdrop, "Loading toolkit…" chip, `.btn-secondary` pill links)
so the brief pre-hydration window reads as an intentional branded hero, not a half-loaded page.

> **CRITICAL — copy parity:** the fallback `heading`/`intro` **must match the React component's real rendered
> h1 and intro verbatim** (including casing, e.g. lowercase `html` where the source uses it as a keyword).
> Any difference visibly rewrites itself on hydration — a jarring flash. Do **not** substitute SEO-richer or
> meta-title copy. For `PageHero` pages, copy the exact `title`/`subtitle`. For custom-header pages
> (`VisualEditorPage`, `BlogPage`, `ProductsPage`, `ContactUsPage`, `OurExpertsPage`, `HowItWorksPage`), read
> the component's own `<header>`/`<h1>`. Detail shells (`[slug]`) build the fallback from the same
> server-fetched entity the meta uses, so they stay in sync automatically.

The `<head>` (all meta + JSON-LD) is also server-rendered, so metadata is always crawlable. See the SEO
section for how detail-page meta is made crawlable despite the `client:only` body.

## Route map

23 route shells (`src/pages/**/*.astro`) ↔ 23 page components (`src/components/pages/*.tsx`).

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
| `/solutions`                                 | `pages/solutions/index.astro`                        | `SolutionsHubPage`               |
| `/solutions/html-email-test`                 | `pages/solutions/html-email-test.astro`              | `HtmlEmailTestPage`              |
| `/solutions/outlook-button-generator`        | `pages/solutions/outlook-button-generator.astro`     | `OutlookButtonGeneratorPage`     |
| `/solutions/outlook-background-generator`    | `pages/solutions/outlook-background-generator.astro` | `OutlookBackgroundGeneratorPage` |
| `/solutions/outlook-ready-html`              | `pages/solutions/outlook-ready-html.astro`           | `OutlookReadyHtmlPage`           |
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

Notes:
- The original React `HubPage.tsx` was split into concrete `ToolsHubPage` and `SolutionsHubPage`
  components so each shell stays a one-liner.
- The FAQ route (`/resources/faq`) renders a component still named `OurExpertsPage`.
- `VisualEditorPage` backs both `/visual-editor` and `/visual-editor/<slug>`. The `[slug]` shell sets
  `canonical="https://emlinter.com/visual-editor"` so the deep-link variants don't compete as duplicates.
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

The `<head>` is fully server-rendered; the `<body>` is `client:only` (see Hydration above). The setup:

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
- **Known follow-ups (not yet done):** placeholder social URLs in `Footer.tsx` and `sameAs` in
  `BaseLayout.astro` (`twitter.com/emlinter`, `github.com/emlinter`); Privacy/Cookie policies live only as
  React modals with no crawlable URL; body content is not server-rendered (see Hydration limitation).

## Services (`src/services/`)

Ported one-to-one from the React app and verified byte-identical (logic behavior unchanged):

- `firebase.ts` — Firestore reads/writes. Exports: `getTemplates`, `getTemplateBySlug`,
  `updateTemplateRating`, `getVideoGuides`, `getPosts`, `getPostBySlug`, `getRecommendedPosts`,
  `updatePostVoteCount`, `getExperts`, `getAppSettings`, `getProducts`, `getProductBySlug`, plus `db`.
  Firebase web config is inline and public — safe to commit. **These getters are now called both
  client-side (in components) and server-side (in detail shells + `sitemap.xml.ts`)** — the Firebase web
  SDK runs fine in Node, so keep them isomorphic (no `window`/`document` references).
- `geminiService.ts` — `getErrorExplanation(error, fullHtml)` via Gemini `gemini-2.5-flash`.
- `htmlValidator.ts`, `htmlBeautifier.ts`, `htmlMinifier.ts`, `colorAnalyzer.ts` — pure client-side
  logic, no network.

`src/types.ts` is identical to the reference app: `Template`, `VideoGuide`, `Post`, `Expert`,
`AppSettings`, `Product`, `HtmlValidationError`, etc.

## Styling

- `tailwind.config.mjs` defines the design system: color scales `ink` (dark UI base, `ink-950`
  background), `brand` (pink/magenta), `accent` (violet); `display`/`sans`/`mono` font families
  (Inter, Space Grotesk, JetBrains Mono, loaded via Google Fonts `@import` in `global.css`); custom
  `backgroundImage`, `boxShadow` (`glow`, `card`), and animations (`fade-up`, `shimmer`, `pulse-slow`).
- `src/styles/global.css` holds Tailwind directives plus reusable component classes: `.container-wide`,
  `.container-prose`, `.glass`, `.card`, `.gradient-text`, `.btn-primary`, `.btn-secondary`, `.chip`,
  `.section-title`, `.section-subtitle`, `.custom-scrollbar`. Imported once by `BaseLayout.astro`.
- The app is dark-mode only (`color-scheme: dark`). Reuse these classes rather than inventing new ones.

## Environment

- **`PUBLIC_GEMINI_API_KEY`** — read in `geminiService.ts` as `import.meta.env.PUBLIC_GEMINI_API_KEY`.
  It **must** keep the `PUBLIC_` prefix: the Gemini call runs in the browser (components hydrate
  `client:only`), and Astro only exposes `PUBLIC_`-prefixed vars to client code. Set it in `.env`
  (gitignored). Without it, AI explanations return a "not set" message instead of throwing.
- Firebase config is inline in `firebase.ts` (public web keys), not env-driven.

## Conventions when making changes

- **New route** → add a `.astro` shell under `src/pages/` that imports the React page from
  `src/components/pages/`, wraps it in `BaseLayout` with `title` + `description` (and any `faqSchema` /
  `jsonLd`), and mounts it `client:only="react"`. Add a row to the route map above, **and add the URL to
  `STATIC_ROUTES` in `src/pages/sitemap.xml.ts`**. Keep title ≤ 60 / description ≤ 160 chars, suffix
  `| EMLinter` (see SEO section). The `new-route` skill scaffolds this.
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
4. Firebase-backed pages need network + a valid project; Gemini features need `PUBLIC_GEMINI_API_KEY`.
   If either is unavailable, note it rather than claiming the feature was exercised end-to-end.
