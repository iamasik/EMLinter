import { $ as $$BaseLayout } from './BaseLayout_CLZKUz5E.mjs';
import { c as createComponent } from './astro-component_DyprLGAi.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate, m as maybeRenderHead, h as addAttribute } from './entrypoint_BgjnLLDV.mjs';

const $$404 = createComponent(($$result, $$props, $$slots) => {
  const links = [
    { href: "/templates", label: "Email Templates" },
    { href: "/tools", label: "Developer Tools" },
    { href: "/solutions", label: "Outlook Solutions" },
    { href: "/visual-editor", label: "Visual Editor" },
    { href: "/resources/blog", label: "Blog" },
    { href: "/contact-us", label: "Contact Us" }
  ];
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Page Not Found (404) | EMLinter", "description": "The page you're looking for doesn't exist. Explore EMLinter's free HTML email tools, templates, and guides instead.", "noindex": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="text-center py-16 md:py-24"> <p class="gradient-text font-display text-7xl md:text-8xl font-extrabold">404</p> <h1 class="mt-4 text-3xl md:text-4xl font-display font-bold text-gray-50">
This page took a wrong turn
</h1> <p class="mt-4 max-w-xl mx-auto text-gray-400">
The page you're looking for doesn't exist or may have moved. Try one of these
      instead, or head back to the homepage.
</p> <div class="mt-8 flex flex-wrap justify-center gap-3"> ${links.map((l) => renderTemplate`<a${addAttribute(l.href, "href")} class="chip hover:text-pink-300 transition-colors">${l.label}</a>`)} </div> <div class="mt-10"> <a href="/" class="btn-primary inline-block">Back to Homepage</a> </div> </section> ` })}`;
}, "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/404.astro", void 0);

const $$file = "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/404.astro";
const $$url = "/404";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$404,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
