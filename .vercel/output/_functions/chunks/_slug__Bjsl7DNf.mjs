import { $ as $$BaseLayout } from './BaseLayout_CLZKUz5E.mjs';
import { c as createComponent } from './astro-component_DyprLGAi.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate } from './entrypoint_BgjnLLDV.mjs';
import { $ as $$SeoFallback } from './SeoFallback_BaCjZX_7.mjs';
import { e as getTemplateBySlug } from './firebase_BUUn4-_3.mjs';

const prerender = false;
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$slug;
  const { slug } = Astro2.params;
  const SITE_URL = "https://emlinter.com";
  let template = null;
  try {
    template = await getTemplateBySlug(slug);
  } catch (e) {
    console.error("Template SSR meta fetch failed:", e);
  }
  const title = template ? `${template.title} | EMLinter` : "Free HTML Email Template | EMLinter";
  const description = template?.seoMetaDescription || "View, edit, and download this responsive HTML email template — tested across Gmail, Outlook, and Apple Mail.";
  const ogImage = template?.desktopPreviewUrl || void 0;
  const fbHeading = template?.title || "Free HTML Email Template";
  const fbIntro = template?.seoMetaDescription || template?.fullDescription || "View, edit, and download this responsive HTML email template — tested across Gmail, Outlook, and Apple Mail. Open it in the free visual editor and export clean HTML for any ESP.";
  const jsonLd = template ? {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: template.title,
    description: template.seoMetaDescription || template.fullDescription,
    image: template.desktopPreviewUrl || `${SITE_URL}/og-default.png`,
    creator: { "@type": "Person", name: template.designer },
    keywords: template.tags?.join(", "),
    ...template.averageRating && template.numberOfRatings ? {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: template.averageRating,
        ratingCount: template.numberOfRatings
      }
    } : {}
  } : void 0;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": title, "description": description, "ogImage": ogImage, "jsonLd": jsonLd }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "TemplateDetailPage", null, { "slug": slug, "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/components/pages/TemplateDetailPage", "client:component-export": "default" }, { "fallback": async ($$result3) => renderTemplate`${renderComponent($$result3, "SeoFallback", $$SeoFallback, { "slot": "fallback", "heading": fbHeading, "intro": fbIntro, "links": [
    { href: "/templates", label: "All Email Templates" },
    { href: "/visual-editor", label: "Visual Editor" },
    { href: "/tools/code-fix", label: "HTML Email Linter" }
  ] })}` })} ` })}`;
}, "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/templates/[slug].astro", void 0);

const $$file = "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/templates/[slug].astro";
const $$url = "/templates/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
