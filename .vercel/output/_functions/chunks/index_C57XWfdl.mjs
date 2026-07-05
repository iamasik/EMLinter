import { $ as $$BaseLayout } from './BaseLayout_CLZKUz5E.mjs';
import { c as createComponent } from './astro-component_DyprLGAi.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate } from './entrypoint_BgjnLLDV.mjs';
import { $ as $$SeoFallback } from './SeoFallback_BaCjZX_7.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Premium Email Products & Developer Tools | EMLinter", "description": "Discover premium HTML email templates, software, and developer kits built to accelerate your email workflow — from ready-to-ship designs to time-saving tooling." }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "ProductsPage", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/components/pages/ProductsPage", "client:component-export": "default" }, { "fallback": ($$result3) => renderTemplate`${renderComponent($$result3, "SeoFallback", $$SeoFallback, { "slot": "fallback", "heading": "Premium Tools & Products", "intro": "Supercharge your email workflow with our curated collection of professional templates, components, and developer tools.", "links": [
    { href: "/templates", label: "Free Email Templates" },
    { href: "/tools", label: "Developer Tools" },
    { href: "/resources/blog", label: "Blog" }
  ] })}` })} ` })}`;
}, "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/resources/products/index.astro", void 0);

const $$file = "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/resources/products/index.astro";
const $$url = "/resources/products";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
