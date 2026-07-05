import { $ as $$BaseLayout } from './BaseLayout_CLZKUz5E.mjs';
import { c as createComponent } from './astro-component_DyprLGAi.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate } from './entrypoint_BgjnLLDV.mjs';
import { $ as $$SeoFallback } from './SeoFallback_BaCjZX_7.mjs';

const $$OutlookBackgroundGenerator = createComponent(($$result, $$props, $$slots) => {
  const faqSchema = [
    { question: "What is a bulletproof Outlook background and why do I need one?", answer: "A bulletproof Outlook background renders identically across every Microsoft Outlook version, including the Word-rendered Outlook 2007–2024 for Windows that ignores standard CSS background-image. The technique wraps your image in VML so Outlook reads it, while every other client uses the regular CSS path." },
    { question: "How does the html email background image trick work?", answer: 'You set both a CSS background and a VML <v:rect> with type="frame" pointing to the same image. Modern clients render the CSS; Outlook for Windows reads the VML inside conditional comments.' },
    { question: "Does this work for both full-width and contained backgrounds?", answer: "Yes. Set width to 600 for a contained background, or 700+ for a full-width hero. The generator handles both layouts." },
    { question: "Can I overlay text or a CTA on the email background image?", answer: "Yes — the Inner HTML Content field is for that. Drop in any HTML; the VML <v:textbox> wraps the same content for Outlook so overlays appear in every client." },
    { question: "What image format and size should I use for an email background?", answer: "JPG for photos, PNG for graphics with transparency. Keep the file under 1MB on a reliable CDN." },
    { question: "Will the bulletproof background still render if images are blocked?", answer: "When images are blocked, the fallback background color shows in every client. Choose a brand color close to your image's dominant tone." }
  ];
  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "EMLinter Bulletproof Outlook Background Generator",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    description: "Free generator for bulletproof Outlook background images with VML fallback. Renders identically across Outlook 2007–2024, Gmail, and Apple Mail.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
  };
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Bulletproof Outlook Background Generator | EMLinter", "description": "Free VML background generator. Build email background images that render identically in Outlook 2007–2024, Gmail & Apple Mail — copy code in one click.", "keywords": "bulletproof outlook background, bulletproof background, email background, background image in email, html email background image, background for email", "jsonLd": softwareLd, "faqSchema": faqSchema }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "OutlookBackgroundGeneratorPage", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/components/pages/OutlookBackgroundGeneratorPage", "client:component-export": "default" }, { "fallback": ($$result3) => renderTemplate`${renderComponent($$result3, "SeoFallback", $$SeoFallback, { "slot": "fallback", "heading": "Generate a bulletproof Outlook background in seconds.", "intro": "Free generator for bulletproof email backgrounds with VML fallback. Drop in an html email background image, get production-ready code that renders identically in Outlook 2007–2024, Gmail, Apple Mail, and every other client.", "links": [
    { href: "/solutions/outlook-button-generator", label: "Outlook Button Generator" },
    { href: "/solutions/outlook-ready-html", label: "Outlook HTML Sanitizer" },
    { href: "/solutions", label: "All Outlook Solutions" }
  ] })}` })} ` })}`;
}, "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/solutions/outlook-background-generator.astro", void 0);

const $$file = "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/solutions/outlook-background-generator.astro";
const $$url = "/solutions/outlook-background-generator";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$OutlookBackgroundGenerator,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
