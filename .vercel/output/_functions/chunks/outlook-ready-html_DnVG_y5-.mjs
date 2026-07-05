import { $ as $$BaseLayout } from './BaseLayout_CLZKUz5E.mjs';
import { c as createComponent } from './astro-component_DyprLGAi.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate } from './entrypoint_BgjnLLDV.mjs';
import { $ as $$SeoFallback } from './SeoFallback_BaCjZX_7.mjs';

const $$OutlookReadyHtml = createComponent(($$result, $$props, $$slots) => {
  const faqSchema = [
    { question: "What does the Outlook HTML Sanitizer do?", answer: "It auto-injects tiny margin and padding values (0.05pt) onto every table, td, and th in your email — a known workaround for Outlook's collapsing-margins and ghost-spacing bugs." },
    { question: "When do I need to sanitize HTML for Outlook?", answer: "Whenever you see mysterious vertical gaps, collapsing rows, or inconsistent padding in Outlook for Windows." },
    { question: "Will this break rendering in Gmail or Apple Mail?", answer: "No. 0.05pt is below the rendering threshold of modern clients, which round to zero and ignore it. Only Outlook reads and applies the styles." },
    { question: "Can I change the spacing value?", answer: "Yes — the Spacing Value field defaults to 0.05pt. Smaller is safer for visual fidelity; larger if Outlook is being especially stubborn." },
    { question: "Does it preserve my existing inline styles?", answer: "Yes. The sanitizer only adds margin/padding where you don't already have them." },
    { question: "Is this safe to run before sending?", answer: "Yes. 100% client-side string transformation that leaves the structure of your HTML intact." }
  ];
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Outlook HTML Sanitizer — Fix Email Spacing | EMLinter", "description": "Free Outlook HTML sanitizer that auto-injects the 0.05pt padding fix on every table cell. Eliminate ghost spacing, collapsing rows & Outlook bugs in one click.", "keywords": "outlook html sanitizer, fix outlook email, outlook email spacing, outlook padding fix, outlook email rendering", "faqSchema": faqSchema }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "OutlookReadyHtmlPage", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/components/pages/OutlookReadyHtmlPage", "client:component-export": "default" }, { "fallback": ($$result3) => renderTemplate`${renderComponent($$result3, "SeoFallback", $$SeoFallback, { "slot": "fallback", "heading": "Fix Outlook's ghost spacing bugs in one click.", "intro": "Auto-inject the legendary 0.05pt margin/padding trick into every table cell so Outlook for Windows stops collapsing rows and adding mystery whitespace. Drop-in fix, fully reversible.", "links": [
    { href: "/solutions/outlook-button-generator", label: "Outlook Button Generator" },
    { href: "/solutions/outlook-background-generator", label: "Outlook Background Generator" },
    { href: "/solutions", label: "All Outlook Solutions" }
  ] })}` })} ` })}`;
}, "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/solutions/outlook-ready-html.astro", void 0);

const $$file = "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/solutions/outlook-ready-html.astro";
const $$url = "/solutions/outlook-ready-html";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$OutlookReadyHtml,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
