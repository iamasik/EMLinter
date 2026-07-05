import { $ as $$BaseLayout } from './BaseLayout_CLZKUz5E.mjs';
import { c as createComponent } from './astro-component_DyprLGAi.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate } from './entrypoint_BgjnLLDV.mjs';
import { $ as $$SeoFallback } from './SeoFallback_BaCjZX_7.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  const faqSchema = [
    { question: "Why do I need bulletproof Outlook code?", answer: "Microsoft Outlook for Windows (2007–2024) uses the Word rendering engine, so CSS3 properties like border-radius and modern fonts are ignored. Bulletproof code uses VML as a conditional fallback so the design still renders pixel-perfect." },
    { question: "What is VML and is it still relevant in 2026?", answer: "VML is Microsoft's vector XML format, wrapped in conditional comments so only Outlook reads it. It is still the only reliable way to get rounded-corner buttons and full-bleed backgrounds in Outlook for Windows." },
    { question: "Will bulletproof code make my email heavier?", answer: "Slightly — usually under 200 bytes per VML block. Outlook represents 8–15% of B2B opens, so it is worth the trade-off. Minify afterward to reclaim the size." },
    { question: "Do these solutions work in Outlook for Mac and Outlook.com?", answer: "Yes. Outlook for Mac and Outlook.com use WebKit and render modern CSS fine, so the VML fallback is invisible there. Our generators degrade cleanly." },
    { question: "Can I preview my Outlook fixes without installing Windows?", answer: "Send a test email to an Outlook.com address with our HTML Email Test tool. For Outlook for Windows specifically you need a Windows VM or a paid render-preview service." },
    { question: "Is the visual editor ESP-compatible?", answer: "Yes. Edit your template, copy the HTML, and paste it directly into Mailchimp, Klaviyo, HubSpot, Campaign Monitor, Salesforce Marketing Cloud, ActiveCampaign, or Brevo." }
  ];
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Bulletproof Outlook Email Solutions | EMLinter", "description": "Free generators for bulletproof Outlook buttons, VML backgrounds & HTML sanitizers. Fix Outlook 2007–2024 rendering without breaking Gmail or Apple Mail.", "keywords": "bulletproof outlook buttons, bulletproof outlook background, vml email, outlook email fix, email rendering issues, outlook compatibility", "faqSchema": faqSchema }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "SolutionsHubPage", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/components/pages/SolutionsHubPage", "client:component-export": "default" }, { "fallback": ($$result3) => renderTemplate`${renderComponent($$result3, "SeoFallback", $$SeoFallback, { "slot": "fallback", "heading": "Bulletproof Outlook fixes for the email clients that refuse to play nice.", "intro": "Outlook for Windows still uses Microsoft Word as its rendering engine. Our solutions generate VML fallback code so your buttons, backgrounds, and layouts render identically — in Outlook, Gmail, Apple Mail, and everywhere else.", "links": [
    { href: "/solutions/outlook-button-generator", label: "Outlook Button Generator" },
    { href: "/solutions/outlook-background-generator", label: "Outlook Background Generator" },
    { href: "/solutions/outlook-ready-html", label: "Outlook HTML Sanitizer" },
    { href: "/solutions/html-email-test", label: "HTML Email Test" }
  ] })}` })} ` })}`;
}, "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/solutions/index.astro", void 0);

const $$file = "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/solutions/index.astro";
const $$url = "/solutions";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
