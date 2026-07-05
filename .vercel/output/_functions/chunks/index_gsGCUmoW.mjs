import { $ as $$BaseLayout } from './BaseLayout_CLZKUz5E.mjs';
import { c as createComponent } from './astro-component_DyprLGAi.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate } from './entrypoint_BgjnLLDV.mjs';
import { $ as $$SeoFallback } from './SeoFallback_BaCjZX_7.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "HTML Email Development Blog & Tips | EMLinter", "description": "Tutorials, tips & insights on HTML email development — coding bulletproof Outlook layouts, dark mode, deliverability, and responsive design best practices." }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "BlogPage", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/components/pages/BlogPage", "client:component-export": "default" }, { "fallback": ($$result3) => renderTemplate`${renderComponent($$result3, "SeoFallback", $$SeoFallback, { "slot": "fallback", "heading": "EMLinter Blog", "intro": "Insights, tutorials, and updates on HTML email development from the EMLinter team.", "links": [
    { href: "/tools", label: "Developer Tools" },
    { href: "/solutions", label: "Outlook Solutions" },
    { href: "/templates", label: "Email Templates" }
  ] })}` })} ` })}`;
}, "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/resources/blog/index.astro", void 0);

const $$file = "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/resources/blog/index.astro";
const $$url = "/resources/blog";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
