import { $ as $$BaseLayout } from './BaseLayout_CLZKUz5E.mjs';
import { c as createComponent } from './astro-component_DyprLGAi.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate } from './entrypoint_BgjnLLDV.mjs';
import { $ as $$SeoFallback } from './SeoFallback_BaCjZX_7.mjs';
import { g as getPostBySlug } from './firebase_BUUn4-_3.mjs';

const prerender = false;
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$slug;
  const { slug } = Astro2.params;
  const SITE_URL = "https://emlinter.com";
  const canonicalUrl = `${SITE_URL}${Astro2.url.pathname.replace(/\/$/, "")}`;
  let post = null;
  try {
    post = await getPostBySlug(slug);
  } catch (e) {
    console.error("Blog SSR meta fetch failed:", e);
  }
  const title = post ? `${post.title} | EMLinter` : "Blog Post | EMLinter";
  const description = post?.seoMetaDescription || "Read this article on HTML email development, deliverability, and design.";
  const ogImage = post?.thumbnailUrl || void 0;
  const fbHeading = post?.title || "HTML Email Development Article";
  const fbIntro = post?.seoMetaDescription || "Read this article on HTML email development, deliverability, and design — practical tips for coding bulletproof, responsive campaigns that render everywhere.";
  let toIso = (v) => {
    try {
      return v?.toDate?.().toISOString();
    } catch {
      return void 0;
    }
  };
  const jsonLd = post ? {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    headline: post.title,
    description: post.seoMetaDescription,
    image: post.thumbnailUrl || `${SITE_URL}/og-default.png`,
    author: { "@type": "Person", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "EMLinter",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.svg` }
    },
    datePublished: toIso(post.createdAt),
    dateModified: toIso(post.createdAt),
    keywords: post.tags?.join(", ")
  } : void 0;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": title, "description": description, "ogType": "article", "ogImage": ogImage, "jsonLd": jsonLd }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "BlogPostPage", null, { "slug": slug, "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/components/pages/BlogPostPage", "client:component-export": "default" }, { "fallback": async ($$result3) => renderTemplate`${renderComponent($$result3, "SeoFallback", $$SeoFallback, { "slot": "fallback", "heading": fbHeading, "intro": fbIntro, "links": [
    { href: "/resources/blog", label: "All Blog Posts" },
    { href: "/tools", label: "Developer Tools" },
    { href: "/templates", label: "Email Templates" }
  ] })}` })} ` })}`;
}, "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/resources/blog/[slug].astro", void 0);

const $$file = "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/resources/blog/[slug].astro";
const $$url = "/resources/blog/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
