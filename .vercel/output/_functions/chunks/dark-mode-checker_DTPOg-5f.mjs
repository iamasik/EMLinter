import { $ as $$BaseLayout } from './BaseLayout_CLZKUz5E.mjs';
import { c as createComponent } from './astro-component_DyprLGAi.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate } from './entrypoint_BgjnLLDV.mjs';
import { $ as $$SeoFallback } from './SeoFallback_BaCjZX_7.mjs';

const $$DarkModeChecker = createComponent(($$result, $$props, $$slots) => {
  const faqSchema = [
    { question: "What is a dark mode email tester and why do I need one?", answer: "A dark mode email tester simulates how your HTML email renders in dark-mode inboxes — iOS Mail, Apple Mail, Outlook for Mac, and Gmail mobile. Dark mode testing lets you catch and fix invisible logos, unreadable text, and broken CTAs before you send." },
    { question: "How does dark mode testing work in this tool?", answer: "Upload or paste your HTML, then toggle the dark/light switch. The tool applies the same CSS filter transformation that Outlook for Mac and certain Gmail dark themes use — inverting backgrounds while preserving image colors." },
    { question: "Which email clients force dark mode on my emails?", answer: "Apple Mail and iOS preserve colors but invert white backgrounds; Outlook for Windows/Mac and Outlook.com fully invert palettes; Gmail mobile partial-inverts white-on-white designs." },
    { question: "How do I prevent dark mode from breaking my email?", answer: "Use the Analyze Colors button to surface every text/background pair that fails WCAG AA contrast in either light or dark mode. Also add the meta tag color-scheme and a prefers-color-scheme media query for explicit guidance." },
    { question: "Does dark mode testing affect deliverability?", answer: "Not directly — but unreadable dark-mode emails get low click-through and high delete-without-open rates, both of which hurt sender reputation over time." },
    { question: "Is this dark mode test free and is my HTML uploaded anywhere?", answer: "Completely free, no signup, no uploads. The simulator runs entirely in your browser using a sandboxed iframe — your HTML is never sent to a server." }
  ];
  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "EMLinter Dark Mode Email Tester",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    description: "Free dark mode email tester. Simulate Apple Mail, Outlook, and Gmail dark-mode rendering and auto-flag WCAG AA contrast failures.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
  };
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Free Dark Mode Email Tester for HTML Email | EMLinter", "description": "Free dark mode email tester. Simulate Apple Mail, Outlook & Gmail dark-mode rendering, flag WCAG contrast failures, and fix issues before you send.", "keywords": "dark mode email tester, dark mode testing, dark mode test, dark mode email, email dark mode, html email dark mode", "jsonLd": softwareLd, "faqSchema": faqSchema }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "DarkModeCheckerPage", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/components/pages/DarkModeCheckerPage", "client:component-export": "default" }, { "fallback": ($$result3) => renderTemplate`${renderComponent($$result3, "SeoFallback", $$SeoFallback, { "slot": "fallback", "heading": "Catch dark mode rendering bugs before subscribers do.", "intro": "A free dark mode email tester that simulates how Apple Mail, Outlook, and Gmail invert your colors. Run a dark mode test on any HTML email and auto-flag contrast failures — no signup, browser-based.", "links": [
    { href: "/tools/code-fix", label: "HTML Email Linter" },
    { href: "/tools/design-copier", label: "Design Copier" },
    { href: "/tools", label: "All Developer Tools" }
  ] })}` })} ` })}`;
}, "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/tools/dark-mode-checker.astro", void 0);

const $$file = "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/tools/dark-mode-checker.astro";
const $$url = "/tools/dark-mode-checker";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$DarkModeChecker,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
