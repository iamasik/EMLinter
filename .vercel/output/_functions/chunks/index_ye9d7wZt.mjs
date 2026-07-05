import { $ as $$BaseLayout } from './BaseLayout_CLZKUz5E.mjs';
import { c as createComponent } from './astro-component_DyprLGAi.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate } from './entrypoint_BgjnLLDV.mjs';
import { $ as $$SeoFallback } from './SeoFallback_BaCjZX_7.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  const faqSchema = [
    { question: "Are these HTML email templates free to use?", answer: "Yes — every template in the EMLinter library is free to download, edit, and use in commercial campaigns. No attribution required, no hidden tiers, no signup." },
    { question: "How do I use these templates in Mailchimp, Klaviyo, or HubSpot?", answer: "Open the template in our free html email editor online, customize content, click Export, copy the HTML, then paste it into your ESP's custom-HTML editor." },
    { question: "Do the templates render correctly in Outlook?", answer: "Yes — every template is bulletproof, with VML fallbacks for CTAs and background images so Outlook for Windows displays the design identically to Gmail and Apple Mail." },
    { question: "Can I edit the templates without coding?", answer: "Absolutely. Click any template, open it in our no-code Visual Editor — the html email builder built into EMLinter — and click any block to update text, swap images, change colors, or update links." },
    { question: "Are the templates mobile responsive?", answer: "Yes. Every template uses fluid hybrid responsive design and adapts cleanly from 320px mobile screens up to 600px desktop preview panes." },
    { question: "What is the difference between an html email editor online and a traditional code editor?", answer: "A traditional code editor shows raw HTML. An online html email editor gives you a visual preview where you click blocks and edit content, then exports clean HTML behind the scenes." }
  ];
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Free HTML Email Templates",
    description: "A free library of responsive HTML email templates, editable in EMLinter's online html email editor and exportable to any ESP.",
    url: "https://emlinter.com/templates"
  };
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Free Responsive HTML Email Templates | EMLinter", "description": "Browse & customize 100+ responsive HTML email templates in a free no-code editor, then export clean HTML for Mailchimp, Klaviyo, and HubSpot.", "keywords": "html email editor, email html editor, online html email editor, html email editor online free, html editor email, email designer, html email template, html email builder", "jsonLd": collectionLd, "faqSchema": faqSchema }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "TemplatesPage", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/components/pages/TemplatesPage", "client:component-export": "default" }, { "fallback": ($$result3) => renderTemplate`${renderComponent($$result3, "SeoFallback", $$SeoFallback, { "slot": "fallback", "heading": "Free responsive HTML email templates — edit online, export anywhere.", "intro": "The fastest free HTML email editor online: pick a fully responsive template, edit text and images in our no-code HTML email builder, then export clean HTML for Mailchimp, Klaviyo, HubSpot, and every major ESP.", "links": [
    { href: "/visual-editor", label: "Visual Editor" },
    { href: "/tools/code-fix", label: "HTML Email Linter" },
    { href: "/resources/how-it-works", label: "How It Works" }
  ] })}` })} ` })}`;
}, "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/templates/index.astro", void 0);

const $$file = "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/templates/index.astro";
const $$url = "/templates";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
