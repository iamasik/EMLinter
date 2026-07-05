import { $ as $$BaseLayout } from './BaseLayout_CLZKUz5E.mjs';
import { c as createComponent } from './astro-component_DyprLGAi.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate } from './entrypoint_BgjnLLDV.mjs';
import { $ as $$SeoFallback } from './SeoFallback_BaCjZX_7.mjs';

const $$HtmlMinifier = createComponent(($$result, $$props, $$slots) => {
  const faqSchema = [
    { question: "What is an HTML email minifier and why do I need one?", answer: "An HTML email minifier compresses your email's HTML by removing comments, line breaks, and unnecessary whitespace without changing how the email renders. Gmail clips any email over 102KB, so minifying brings you under the limit and improves load time." },
    { question: "Will minifying HTML break my email rendering?", answer: "No — a properly built HTML email minifier strips only what is safe (comments, redundant whitespace) and preserves structural HTML, conditional Outlook comments, inline styles, and table layout." },
    { question: "How much smaller will my email be after I minify HTML?", answer: "Typical savings are 20–45%, depending on how indented and commented your source is. A 130KB template often compresses to 75–90KB after minification — well under Gmail's 102KB clipping threshold." },
    { question: "Is this minify html online tool free and safe to use?", answer: "Yes — completely free, no signup, no upload. The minifier runs entirely in your browser, so your HTML never leaves your device." },
    { question: "Can I compress HTML for non-email use too?", answer: "Yes. While EMLinter is built for email, the underlying html minifier works on any well-formed HTML — landing pages, embedded snippets, transactional templates." },
    { question: "Should I keep <head> and <style> tags un-minified?", answer: "Sometimes. If you have media queries or pseudo-class CSS in <style>, keeping line breaks makes debugging easier. Our tool offers two checkboxes to compress html selectively." }
  ];
  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "EMLinter HTML Email Minifier",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    description: "Free HTML email minifier that compresses HTML 20–45% without breaking Outlook fallbacks or inline styles.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
  };
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "HTML Email Minifier — Free Minify HTML Tool | EMLinter", "description": "Free HTML email minifier. Minify and compress HTML 20–45% to slip under Gmail's 102KB clip without breaking Outlook fallbacks or inline styles.", "keywords": "html email minifier, html minifier, minify html, compress html, minify html online, minify code", "jsonLd": softwareLd, "faqSchema": faqSchema }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "HtmlMinifierPage", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/components/pages/HtmlMinifierPage", "client:component-export": "default" }, { "fallback": ($$result3) => renderTemplate`${renderComponent($$result3, "SeoFallback", $$SeoFallback, { "slot": "fallback", "heading": "Compress HTML to slip under Gmail's 102KB clip.", "intro": "A free online html email minifier built for email developers. Minify html, compress html, and shrink your campaign 20–45% in one click — without breaking Outlook fallbacks or inline styles.", "links": [
    { href: "/tools/beautify-code", label: "HTML Email Beautifier" },
    { href: "/tools/code-fix", label: "HTML Email Linter" },
    { href: "/tools", label: "All Developer Tools" }
  ] })}` })} ` })}`;
}, "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/tools/html-minifier.astro", void 0);

const $$file = "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/tools/html-minifier.astro";
const $$url = "/tools/html-minifier";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$HtmlMinifier,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
