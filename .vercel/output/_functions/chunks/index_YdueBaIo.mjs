import { $ as $$BaseLayout } from './BaseLayout_CLZKUz5E.mjs';
import { c as createComponent } from './astro-component_DyprLGAi.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate } from './entrypoint_BgjnLLDV.mjs';
import { $ as $$SeoFallback } from './SeoFallback_BaCjZX_7.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Visual HTML Email Editor — Drag & Drop, No Code | EMLinter", "description": "Edit responsive HTML email templates visually in your browser. Drag, drop, and export production-ready code for Gmail, Outlook, and Apple Mail." }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "VisualEditorPage", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/components/pages/VisualEditorPage", "client:component-export": "default" }, { "fallback": ($$result3) => renderTemplate`${renderComponent($$result3, "SeoFallback", $$SeoFallback, { "slot": "fallback", "heading": "Unlock Code-Free Control Over Your Email Templates", "intro": "Empower your entire team with Vibe, our revolutionary visual editor. Seamlessly modify text, swap images, and update links on any HTML email template through an intuitive, click-to-edit interface—no coding expertise required.", "links": [
    { href: "/templates", label: "Email Templates" },
    { href: "/tools/code-fix", label: "HTML Email Linter" },
    { href: "/solutions", label: "Outlook Solutions" }
  ] })}` })} ` })}`;
}, "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/visual-editor/index.astro", void 0);

const $$file = "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/visual-editor/index.astro";
const $$url = "/visual-editor";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
