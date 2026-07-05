import { $ as $$BaseLayout } from './BaseLayout_CLZKUz5E.mjs';
import { c as createComponent } from './astro-component_DyprLGAi.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate } from './entrypoint_BgjnLLDV.mjs';
import { $ as $$SeoFallback } from './SeoFallback_BaCjZX_7.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  const faqSchema = [
    { question: "Which HTML email developer tools do I actually need?", answer: "Every email developer needs a linter to catch errors, a beautifier or minifier to control file size, a dark-mode preview, and an Outlook fallback generator. EMLinter ships all four for free in one browser tab." },
    { question: "How is a free HTML email linter different from a code editor?", answer: "A code editor understands generic HTML; an HTML email linter is rule-tuned for email clients — it knows <div> inside <td> breaks Outlook, that style tags get stripped by Yahoo, and that 102KB triggers Gmail clipping." },
    { question: "Do these tools work offline or require an account?", answer: "All EMLinter developer tools run entirely client-side in your browser. No account, no upload, no server processing." },
    { question: "Can I use these tools alongside Mailchimp, Klaviyo, or HubSpot?", answer: "Yes — the toolkit is ESP-agnostic. Validate and optimize your HTML, then paste the result into any major email platform." },
    { question: "What is the difference between beautifying and minifying email HTML?", answer: "Beautifying adds indentation and line breaks for readability. Minifying strips comments and whitespace to ship the file as small as possible." },
    { question: "How do I test how my email renders in dark mode?", answer: "Upload your HTML to the Dark Mode Email Tester. It simulates the inverted-color treatment Outlook and Gmail apply automatically and flags WCAG AA contrast failures." }
  ];
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Free HTML Email Developer Tools | EMLinter", "description": "Five free HTML email tools in one place: lint, beautify, minify, dark-mode test & design copier. Optimize email code for Gmail, Outlook & Apple Mail.", "keywords": "html email developer tools, html email linter, html email beautifier, html email minifier, dark mode email tester, email design copier", "faqSchema": faqSchema }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "ToolsHubPage", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/components/pages/ToolsHubPage", "client:component-export": "default" }, { "fallback": ($$result3) => renderTemplate`${renderComponent($$result3, "SeoFallback", $$SeoFallback, { "slot": "fallback", "heading": "Five free tools every email developer keeps open in a tab.", "intro": "Lint, beautify, minify, dark-mode test, and copy email designs without leaving the browser. No signups, no uploads — every tool runs locally on your machine.", "links": [
    { href: "/tools/code-fix", label: "HTML Email Linter" },
    { href: "/tools/beautify-code", label: "HTML Email Beautifier" },
    { href: "/tools/html-minifier", label: "HTML Minifier" },
    { href: "/tools/dark-mode-checker", label: "Dark Mode Tester" },
    { href: "/tools/design-copier", label: "Design Copier" }
  ] })}` })} ` })}`;
}, "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/tools/index.astro", void 0);

const $$file = "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/tools/index.astro";
const $$url = "/tools";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
