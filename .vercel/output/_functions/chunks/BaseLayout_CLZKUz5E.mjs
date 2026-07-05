import { c as createComponent } from './astro-component_DyprLGAi.mjs';
import 'piccolore';
import { h as addAttribute, k as renderTemplate, u as unescapeHTML, q as renderHead, o as renderComponent, v as renderSlot } from './entrypoint_BgjnLLDV.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$BaseLayout;
  const SITE_URL = "https://emlinter.com";
  const SITE_NAME = "EMLinter";
  const DEFAULT_OG = `${SITE_URL}/og-default.png`;
  const {
    title,
    description,
    keywords,
    ogImage = DEFAULT_OG,
    ogType = "website",
    canonical,
    noindex = false,
    jsonLd,
    faqSchema
  } = Astro2.props;
  const currentPath = Astro2.url.pathname;
  const canonicalUrl = canonical ?? `${SITE_URL}${currentPath === "/" ? "" : currentPath.replace(/\/$/, "")}`;
  const baseOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`
    // `sameAs` intentionally omitted until real, verified social profiles exist —
    // linking to unverified/placeholder handles is a weak or misleading entity signal.
  };
  const baseWebsite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: "Free HTML email editor, linter, minifier, dark-mode tester, and bulletproof Outlook generators.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/templates?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
  const userLd = jsonLd ? Array.isArray(jsonLd) ? jsonLd : [jsonLd] : [];
  const humanize = (seg) => decodeURIComponent(seg).replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const segments = currentPath.split("/").filter(Boolean);
  const breadcrumbLd = segments.length > 0 ? [{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      ...segments.map((seg, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: humanize(seg),
        item: `${SITE_URL}/${segments.slice(0, i + 1).join("/")}`
      }))
    ]
  }] : [];
  const faqLd = faqSchema && faqSchema.length > 0 ? [{
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqSchema.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer }
    }))
  }] : [];
  const allLd = [baseOrganization, baseWebsite, ...breadcrumbLd, ...userLd, ...faqLd];
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><!-- Icons --><link rel="icon" href="/favicon.ico" sizes="32x32"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest"><link rel="canonical"${addAttribute(canonicalUrl, "href")}><title>${title}</title><meta name="description"${addAttribute(description, "content")}>${keywords && renderTemplate`<meta name="keywords"${addAttribute(keywords, "content")}>`}<meta name="author" content="EMLinter"><meta name="generator" content="Astro"><meta name="theme-color" content="#0e1126">${noindex ? renderTemplate`<meta name="robots" content="noindex, nofollow">` : renderTemplate`<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">`}<!-- Open Graph --><meta property="og:type"${addAttribute(ogType, "content")}><meta property="og:site_name"${addAttribute(SITE_NAME, "content")}><meta property="og:title"${addAttribute(title, "content")}><meta property="og:description"${addAttribute(description, "content")}><meta property="og:url"${addAttribute(canonicalUrl, "content")}><meta property="og:image"${addAttribute(ogImage, "content")}><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:locale" content="en_US"><!-- Twitter --><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title"${addAttribute(title, "content")}><meta name="twitter:description"${addAttribute(description, "content")}><meta name="twitter:image"${addAttribute(ogImage, "content")}><!-- Preconnect --><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="preconnect" href="https://firestore.googleapis.com"><!-- Structured data -->${allLd.map((schema) => renderTemplate(_a || (_a = __template(['<script type="application/ld+json">', "<\/script>"])), unescapeHTML(JSON.stringify(schema))))}${renderHead()}</head> <body class="min-h-screen flex flex-col overflow-x-hidden"> ${renderComponent($$result, "AnnouncementBar", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/components/layout/AnnouncementBar", "client:component-export": "default" })} ${renderComponent($$result, "Header", null, { "currentPath": currentPath, "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/components/layout/Header", "client:component-export": "default" })} <main class="container-wide py-8 md:py-12 flex-grow w-full"> ${renderComponent($$result, "Breadcrumbs", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/components/layout/Breadcrumbs", "client:component-export": "default" })} ${renderSlot($$result, $$slots["default"])} </main> ${renderComponent($$result, "Footer", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/components/layout/Footer", "client:component-export": "default" })} </body></html>`;
}, "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/layouts/BaseLayout.astro", void 0);

export { $$BaseLayout as $ };
