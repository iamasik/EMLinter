import { $ as $$BaseLayout } from './BaseLayout_CLZKUz5E.mjs';
import { c as createComponent } from './astro-component_DyprLGAi.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate } from './entrypoint_BgjnLLDV.mjs';
import { $ as $$SeoFallback } from './SeoFallback_BaCjZX_7.mjs';

const $$DesignCopier = createComponent(($$result, $$props, $$slots) => {
  const faqSchema = [
    { question: "What is the email Design Copier?", answer: "It copies a rendered HTML email design — including formatting, images, and links — as rich content you can paste directly into Gmail or Outlook's compose window." },
    { question: "When would I use this instead of pasting HTML?", answer: "When you want to forward a designed email from a Gmail draft, when your ESP does not accept full HTML, or when you need a quick visual paste into a chat or doc." },
    { question: "Does the paste preserve images and links?", answer: "Yes — images load from their original URLs and links remain clickable." },
    { question: "Why does Outlook sometimes change the formatting?", answer: "Outlook's compose engine applies its own paragraph and font defaults. For pixel-perfect rendering, use our bulletproof generators." },
    { question: "Can I edit the HTML before copying?", answer: "Yes. Toggle View/Edit Code to open a side-by-side editor." },
    { question: "Is anything uploaded?", answer: "No. Everything runs in your browser." }
  ];
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "HTML Email Design Copier for Gmail & Outlook | EMLinter", "description": "Copy a rendered HTML email as rich content and paste it into Gmail or Outlook. Free design copier for quick one-off sends without re-exporting HTML.", "keywords": "email design copier, copy html email to gmail, paste html into outlook, rich content email paste", "faqSchema": faqSchema }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "DesignCopierPage", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/components/pages/DesignCopierPage", "client:component-export": "default" }, { "fallback": ($$result3) => renderTemplate`${renderComponent($$result3, "SeoFallback", $$SeoFallback, { "slot": "fallback", "heading": "Copy email designs straight to Gmail or Outlook.", "intro": "Paste your HTML, click Copy Design, then paste the rich-content output directly into a Gmail or Outlook compose window. Skip the export step when you need a one-off send.", "links": [
    { href: "/tools/dark-mode-checker", label: "Dark Mode Tester" },
    { href: "/tools/code-fix", label: "HTML Email Linter" },
    { href: "/tools", label: "All Developer Tools" }
  ] })}` })} ` })}`;
}, "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/tools/design-copier.astro", void 0);

const $$file = "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/tools/design-copier.astro";
const $$url = "/tools/design-copier";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$DesignCopier,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
