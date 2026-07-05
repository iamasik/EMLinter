import { $ as $$BaseLayout } from './BaseLayout_CLZKUz5E.mjs';
import { c as createComponent } from './astro-component_DyprLGAi.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate } from './entrypoint_BgjnLLDV.mjs';
import { $ as $$SeoFallback } from './SeoFallback_BaCjZX_7.mjs';

const $$BeautifyCode = createComponent(($$result, $$props, $$slots) => {
  const faqSchema = [
    { question: "What does an HTML email beautifier do?", answer: "It takes messy, minified, or compacted HTML and reformats it with proper indentation, line breaks, and spacing — readable code that's easy to debug, review, or hand off." },
    { question: "When should I beautify versus minify email HTML?", answer: "Beautify when editing, debugging, or reviewing. Minify right before you ship — minified HTML is smaller but unreadable." },
    { question: "Does beautifying break Outlook conditional comments or VML?", answer: "No. The beautifier preserves Outlook conditional comments, VML blocks, and inline styles exactly as-is." },
    { question: "Will this work on emails exported from Mailchimp, Klaviyo, or HubSpot?", answer: "Yes. Paste exported HTML in, click Beautify, get a clean debuggable copy." },
    { question: "Is the beautifier free and does it upload my HTML?", answer: "Free, no signup, no upload. Everything runs in your browser." },
    { question: "Can I beautify partial HTML snippets, or do I need a full document?", answer: "Both work — full documents, table fragments, or single elements." }
  ];
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "HTML Email Beautifier — Free Code Formatter | EMLinter", "description": "Free HTML email beautifier. Turn minified or messy email HTML into clean, indented, debuggable code without breaking Outlook comments or inline styles.", "keywords": "html email beautifier, html beautifier, html formatter, format html email, pretty print html email", "faqSchema": faqSchema }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "BeautifyCodePage", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/components/pages/BeautifyCodePage", "client:component-export": "default" }, { "fallback": ($$result3) => renderTemplate`${renderComponent($$result3, "SeoFallback", $$SeoFallback, { "slot": "fallback", "heading": "Format messy email HTML in one click.", "intro": "A free HTML email beautifier that turns minified, copy-pasted, or chaotic email code into clean, indented, debuggable structure. Works on full templates and partial snippets.", "links": [
    { href: "/tools/html-minifier", label: "HTML Minifier" },
    { href: "/tools/code-fix", label: "HTML Email Linter" },
    { href: "/tools", label: "All Developer Tools" }
  ] })}` })} ` })}`;
}, "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/tools/beautify-code.astro", void 0);

const $$file = "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/tools/beautify-code.astro";
const $$url = "/tools/beautify-code";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$BeautifyCode,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
