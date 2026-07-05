import { $ as $$BaseLayout } from './BaseLayout_CLZKUz5E.mjs';
import { c as createComponent } from './astro-component_DyprLGAi.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate } from './entrypoint_BgjnLLDV.mjs';
import { $ as $$SeoFallback } from './SeoFallback_BaCjZX_7.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  const faqSchema = [
    { question: "What is EMLinter and who is it for?", answer: "EMLinter is a free, browser-based HTML email toolkit for email developers, marketers, and designers. It bundles a linter, beautifier, minifier, dark-mode tester, visual editor, and bulletproof Outlook generators so you can validate, debug, and ship pixel-perfect campaigns from one workflow." },
    { question: "Is EMLinter really free? Do I need to sign up?", answer: "Yes — every tool on EMLinter is 100% free with no signup required. Paste your HTML, click a button, copy the result. We do not gate features behind a login and we do not store your code or personal data." },
    { question: "Is my HTML code safe?", answer: "All processing happens locally in your browser. Your HTML never touches our servers — the linter, minifier, beautifier, dark-mode tester, and Outlook generators all run client-side. Nothing is uploaded, logged, or stored." },
    { question: "Which email clients does EMLinter optimize for?", answer: "The toolkit targets every major client: Gmail (web, iOS, Android), Apple Mail, Outlook 2007–2024 (Word + WebView), Outlook.com, Yahoo Mail, Samsung Mail, Thunderbird, ProtonMail, and HEY. Our Outlook tools specifically generate VML fallbacks." },
    { question: "How is EMLinter different from Litmus, Email on Acid, or Stripo?", answer: "Litmus and Email on Acid are paid rendering-preview platforms. Stripo and BEE are drag-and-drop builders. EMLinter sits between them — a free, code-first toolkit for people who already write or maintain HTML email and need fast, focused utilities." },
    { question: "Can I use templates from EMLinter in Mailchimp, Klaviyo, or HubSpot?", answer: "Yes. Every template in our library is plain, responsive HTML compatible with major ESPs — Mailchimp, Klaviyo, HubSpot, Constant Contact, Salesforce Marketing Cloud, Campaign Monitor, ActiveCampaign, and more." }
  ];
  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "EMLinter",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    description: "Free HTML email toolkit — linter, beautifier, minifier, dark-mode tester, visual editor, and bulletproof Outlook button & background generators.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", ratingCount: "128" }
  };
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Free HTML Email Toolkit — Linter, Editor, Outlook | EMLinter", "description": "Free HTML email toolkit: linter, dark-mode tester, minifier, visual editor & bulletproof Outlook VML generators. No signup, runs in your browser.", "keywords": "html email editor, html email builder, html email linter, html email validator, bulletproof outlook buttons, vml background email, dark mode email tester, html email minifier", "jsonLd": softwareLd, "faqSchema": faqSchema }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "HomePage", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/components/pages/HomePage", "client:component-export": "default" }, { "fallback": ($$result3) => renderTemplate`${renderComponent($$result3, "SeoFallback", $$SeoFallback, { "slot": "fallback", "heading": "Build, lint, and ship flawless HTML emails in every inbox.", "intro": "EMLinter is the free, browser-based toolkit email developers actually use. Validate HTML, simulate dark mode, generate bulletproof Outlook code, and edit templates visually — all without a signup.", "links": [
    { href: "/tools/code-fix", label: "HTML Email Linter" },
    { href: "/tools/html-minifier", label: "HTML Minifier" },
    { href: "/tools/dark-mode-checker", label: "Dark Mode Tester" },
    { href: "/solutions/outlook-button-generator", label: "Outlook Button Generator" },
    { href: "/visual-editor", label: "Visual Editor" },
    { href: "/templates", label: "Email Templates" }
  ] })}` })} ` })}`;
}, "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/index.astro", void 0);

const $$file = "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
