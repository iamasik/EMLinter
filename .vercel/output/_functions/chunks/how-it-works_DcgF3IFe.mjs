import { $ as $$BaseLayout } from './BaseLayout_CLZKUz5E.mjs';
import { c as createComponent } from './astro-component_DyprLGAi.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate } from './entrypoint_BgjnLLDV.mjs';
import { $ as $$SeoFallback } from './SeoFallback_BaCjZX_7.mjs';

const $$HowItWorks = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "How It Works — Guides & Video Tutorials | EMLinter", "description": "Step-by-step guides and video tutorials for EMLinter's HTML email workflow — linting, beautifying, minifying, dark-mode testing, and Outlook generators." }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "HowItWorksPage", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/components/pages/HowItWorksPage", "client:component-export": "default" }, { "fallback": ($$result3) => renderTemplate`${renderComponent($$result3, "SeoFallback", $$SeoFallback, { "slot": "fallback", "heading": "How It Works", "intro": "Watch our video guides to learn how to use EMLinter's powerful toolkit to validate, fix, and visually edit your HTML emails.", "links": [
    { href: "/tools", label: "Developer Tools" },
    { href: "/solutions", label: "Outlook Solutions" },
    { href: "/visual-editor", label: "Visual Editor" }
  ] })}` })} ` })}`;
}, "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/resources/how-it-works.astro", void 0);

const $$file = "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/resources/how-it-works.astro";
const $$url = "/resources/how-it-works";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$HowItWorks,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
