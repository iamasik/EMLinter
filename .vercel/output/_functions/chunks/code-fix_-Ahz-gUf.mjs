import { $ as $$BaseLayout } from './BaseLayout_CLZKUz5E.mjs';
import { c as createComponent } from './astro-component_DyprLGAi.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate } from './entrypoint_BgjnLLDV.mjs';
import { $ as $$SeoFallback } from './SeoFallback_BaCjZX_7.mjs';

const $$CodeFix = createComponent(($$result, $$props, $$slots) => {
  const faqSchema = [
    { question: "What does an HTML email linter check for?", answer: 'A purpose-built HTML email linter checks for unclosed and mismatched tags, broken table nesting, missing alt attributes on images, missing role="presentation" on layout tables, and Outlook-specific bugs like div inside td or unsupported CSS.' },
    { question: "How is this different from a regular HTML validator?", answer: "A regular HTML validator enforces HTML5 spec compliance — useful for websites, mostly irrelevant for email. Email clients use 1999-era rendering engines and break on patterns modern browsers accept." },
    { question: "Will fixing the errors guarantee my email renders perfectly?", answer: "It eliminates the most common rendering bugs. For a true render guarantee, also use the dark-mode tester, Outlook generators, and send a real test." },
    { question: "Can I beautify the code while validating?", answer: "Yes. The Beautify & Validate button runs both steps in sequence: format the code into clean indentation, then run the validator on the cleaned version." },
    { question: "Does the linter handle Outlook VML and conditional comments?", answer: "Yes. Conditional comments and VML blocks are recognized and excluded from standard tag-pair validation." },
    { question: "Is my HTML code uploaded to a server when I lint it?", answer: "Never. The linter runs 100% in your browser. Your code never leaves your device." }
  ];
  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "EMLinter HTML Email Linter",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    description: "Free HTML email linter that catches unclosed tags, broken table nesting, and Outlook-specific rendering bugs.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
  };
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Free HTML Email Linter & Code Validator | EMLinter", "description": "Free HTML email linter built for inboxes, not browsers. Catch unclosed tags, broken table nesting & Outlook rendering bugs in one click.", "keywords": "html email linter, html email validator, email html validator, html email code validator, outlook html validator", "jsonLd": softwareLd, "faqSchema": faqSchema }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "CodeFixPage", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/components/pages/CodeFixPage", "client:component-export": "default" }, { "fallback": ($$result3) => renderTemplate`${renderComponent($$result3, "SeoFallback", $$SeoFallback, { "slot": "fallback", "heading": "Find broken tags before Outlook does.", "intro": "A free HTML email linter that catches the bugs only email clients care about — unclosed tags, broken table nesting, and Outlook-specific rendering traps. Paste your HTML, get a line-by-line breakdown.", "links": [
    { href: "/tools/beautify-code", label: "HTML Email Beautifier" },
    { href: "/tools/html-minifier", label: "HTML Minifier" },
    { href: "/tools/dark-mode-checker", label: "Dark Mode Tester" },
    { href: "/tools", label: "All Developer Tools" }
  ] })}` })} ` })}`;
}, "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/tools/code-fix.astro", void 0);

const $$file = "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/tools/code-fix.astro";
const $$url = "/tools/code-fix";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$CodeFix,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
