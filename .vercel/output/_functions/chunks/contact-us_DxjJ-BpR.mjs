import { $ as $$BaseLayout } from './BaseLayout_CLZKUz5E.mjs';
import { c as createComponent } from './astro-component_DyprLGAi.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate } from './entrypoint_BgjnLLDV.mjs';
import { $ as $$SeoFallback } from './SeoFallback_BaCjZX_7.mjs';

const $$ContactUs = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Contact Us — HTML Email Help & Projects | EMLinter", "description": "Get in touch with the EMLinter team for custom HTML email projects, tool feedback, bug reports, and partnership inquiries. We reply within one business day." }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "ContactUsPage", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/components/pages/ContactUsPage", "client:component-export": "default" }, { "fallback": ($$result3) => renderTemplate`${renderComponent($$result3, "SeoFallback", $$SeoFallback, { "slot": "fallback", "heading": "Let's Connect", "intro": "Whether you have a question, a project idea, or just want to say hi, I'd love to hear from you.", "links": [
    { href: "/tools", label: "Developer Tools" },
    { href: "/solutions", label: "Outlook Solutions" },
    { href: "/resources/faq", label: "FAQ" }
  ] })}` })} ` })}`;
}, "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/contact-us.astro", void 0);

const $$file = "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/contact-us.astro";
const $$url = "/contact-us";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$ContactUs,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
