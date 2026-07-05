import { $ as $$BaseLayout } from './BaseLayout_CLZKUz5E.mjs';
import { c as createComponent } from './astro-component_DyprLGAi.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate } from './entrypoint_BgjnLLDV.mjs';
import { $ as $$SeoFallback } from './SeoFallback_BaCjZX_7.mjs';
import { a as getProductBySlug } from './firebase_BUUn4-_3.mjs';

const prerender = false;
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$slug;
  const { slug } = Astro2.params;
  const SITE_URL = "https://emlinter.com";
  const canonicalUrl = `${SITE_URL}${Astro2.url.pathname.replace(/\/$/, "")}`;
  let product = null;
  try {
    product = await getProductBySlug(slug);
  } catch (e) {
    console.error("Product SSR meta fetch failed:", e);
  }
  const title = product ? `${product.seoTitle || product.name} | EMLinter` : "Product | EMLinter";
  const description = product?.seoMetaDescription || product?.shortDescription || "Explore premium email products and tools built for developers and marketers.";
  const ogImage = product?.thumbnailUrl || void 0;
  const fbHeading = product?.name || "Premium Email Product";
  const fbIntro = product?.seoMetaDescription || product?.shortDescription || "Explore this premium email product built for developers and marketers — templates, software, and developer kits that accelerate your email workflow.";
  const toIso = (v) => {
    try {
      return v?.toDate?.().toISOString();
    } catch {
      return void 0;
    }
  };
  const schemas = [];
  if (product) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": ["Product", "SoftwareApplication"],
      name: product.name,
      description: product.shortDescription,
      image: product.thumbnailUrl || `${SITE_URL}/og-default.png`,
      applicationCategory: product.productType,
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: product.price,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: canonicalUrl
      },
      ...product.averageRating ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: product.averageRating,
          reviewCount: product.reviewCount || 1
        }
      } : {},
      datePublished: toIso(product.createdAt),
      dateModified: toIso(product.lastUpdatedAt)
    });
    if (product.faq?.length) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: product.faq.map((i) => ({
          "@type": "Question",
          name: i.question,
          acceptedAnswer: { "@type": "Answer", text: i.answer }
        }))
      });
    }
  }
  const jsonLd = schemas.length ? schemas : void 0;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": title, "description": description, "ogImage": ogImage, "jsonLd": jsonLd }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "ProductDetailPage", null, { "slug": slug, "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/components/pages/ProductDetailPage", "client:component-export": "default" }, { "fallback": async ($$result3) => renderTemplate`${renderComponent($$result3, "SeoFallback", $$SeoFallback, { "slot": "fallback", "heading": fbHeading, "intro": fbIntro, "links": [
    { href: "/resources/products", label: "All Products" },
    { href: "/templates", label: "Free Email Templates" },
    { href: "/tools", label: "Developer Tools" }
  ] })}` })} ` })}`;
}, "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/resources/products/[slug].astro", void 0);

const $$file = "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/resources/products/[slug].astro";
const $$url = "/resources/products/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
