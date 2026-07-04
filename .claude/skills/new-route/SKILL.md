---
name: new-route
description: Scaffold a new EMLinter route in emlinter-astro — creates the React page component in src/components/pages/ and the thin .astro shell in src/pages/ wired to BaseLayout with client:only="react", handles dynamic [slug] routes, and reminds you to update the route map in CLAUDE.md. Use when adding any new page/URL to the Astro app.
---

# Add a new route to emlinter-astro

This app is an Astro 6 SSR shell wrapping React. Every route is two files: a React page component
(the behavior) and a thin `.astro` shell (the URL + SEO). Follow this recipe exactly.

## 1. Decide the route

- URL path, e.g. `/tools/spam-checker`.
- React component name in PascalCase, e.g. `SpamCheckerPage`.
- Static or dynamic? Dynamic = the URL has a `<slug>` segment (`[slug].astro`).

## 2. Create the React page component

Path: `src/components/pages/<ComponentName>.tsx`

- Use relative imports only — the `@/*` alias is NOT configured.
- It hydrates client-side, so `window`, `localStorage`, Firebase, and Gemini are all available.
- For links, use `<a href="...">` (map home to `/`, else `/<page>`). Use `navigate()` from
  `src/lib/navigate.ts` only for imperative navigation from an event handler.
- Reuse styling classes from `global.css` (`.card`, `.btn-primary`, `.container-wide`, `.gradient-text`,
  `.section-title`, etc.) and `PageHero` / `SeoFaq` for consistency with other pages.
- A dynamic page receives its slug as a prop: `export default function FooPage({ slug }: { slug: string })`.

## 3. Create the .astro shell

Path mirrors the URL under `src/pages/`.

Static route (`src/pages/tools/spam-checker.astro`):

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import SpamCheckerPage from '../../components/pages/SpamCheckerPage';

const faqSchema = [
  { question: '...', answer: '...' },
];
---
<BaseLayout
  title="Spam Checker | Tools Silo — EMLinter"
  description="One-sentence, keyword-rich description under ~160 chars."
  keywords="optional, comma, separated"
  faqSchema={faqSchema}
>
  <SpamCheckerPage client:only="react" />
</BaseLayout>
```

Dynamic route (`src/pages/tools/[slug].astro`) — MUST set `prerender = false` in SSR mode:

```astro
---
export const prerender = false;
import BaseLayout from '../../layouts/BaseLayout.astro';
import SpamCheckerPage from '../../components/pages/SpamCheckerPage';

const { slug } = Astro.params;
---
<BaseLayout title="..." description="...">
  <SpamCheckerPage slug={slug!} client:only="react" />
</BaseLayout>
```

Rules that must not be broken:
- Relative import depth must match the folder (`../` per level below `src/pages/`).
- Always mount the component with `client:only="react"` — never `client:load`/`client:visible`.
- `title` + `description` are required BaseLayout props. Add `faqSchema` / `jsonLd` when the page has
  FAQ content or a specific schema.type (see `pages/index.astro`, `pages/templates/index.astro`).
- Dynamic `[slug].astro` without `getStaticPaths` requires `export const prerender = false`.

## 4. Update docs

Add a row to the route-map table in `CLAUDE.md` (URL | Astro shell | React component).

## 5. Verify

Run `npm run build` (must exit 0 and print `Complete!`). Then `npm run dev` and open the new URL —
expect HTTP 200. If the page uses Firebase or Gemini, note that those need network / `PUBLIC_GEMINI_API_KEY`.
