import { $ as $$BaseLayout } from './BaseLayout_CLZKUz5E.mjs';
import { c as createComponent } from './astro-component_DyprLGAi.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate } from './entrypoint_BgjnLLDV.mjs';
import { $ as $$SeoFallback } from './SeoFallback_BaCjZX_7.mjs';

const $$SvgToPng = createComponent(($$result, $$props, $$slots) => {
  const faqSchema = [
    { question: "What is an SVG viewer and how does this online tool work?", answer: "This SVG viewer is a free, browser-based tool that lets you paste SVG code or upload an SVG file and instantly see a live preview. It doubles as an SVG editor for resizing, flipping, rotating, and recoloring, and as an SVG to PNG converter. Everything runs locally in your browser; nothing is uploaded to a server." },
    { question: "How do I convert an SVG file to PNG?", answer: "Paste your SVG markup or upload a .svg file into the editor on the left, then watch the preview render on the right. Pick a resolution — 1x, 2x, 3x, or 4x — and click download. The tool draws your SVG onto a canvas at the chosen scale and saves a crisp PNG, the fastest way to convert SVG to PNG without installing software." },
    { question: "Can I edit the colors used in my SVG?", answer: "Yes. This SVG editor online scans your markup for every fill, stroke, and stop-color and lists each unique color under the preview. Click a swatch to open a dedicated hex color picker, type a new value, and every matching color updates live. If there are more colors than fit, a more control reveals the rest." },
    { question: "Why convert SVG to PNG instead of keeping it as SVG?", answer: "SVG scales without quality loss, but many platforms need a raster image — email clients strip SVG, most social networks reject it, and some tools only accept PNG. Converting your SVG file to PNG at 2x–4x gives a high-resolution image that works everywhere while keeping edges sharp." },
    { question: "What are the Data URI formats and when should I use them?", answer: "A Data URI embeds your SVG directly in HTML or CSS so it loads without a separate request. This SVG viewer online generates three formats: a minified data URI (URL-encoded, smallest for CSS backgrounds), a base64 data URI (widely compatible), and an encodeURIComponent version (readable for inline src attributes). Copy whichever fits." },
    { question: "Is this SVG to PNG converter free and private?", answer: "Completely free, no signup, and fully private. The SVG viewer, editor, and PNG export all run client-side in your browser using the canvas API, so your SVG code and images never leave your device — safe for confidential logos and brand assets." }
  ];
  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "EMLinter SVG Viewer & SVG to PNG Converter",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    description: "Free online SVG viewer and editor that converts SVG to PNG at up to 4x, edits colors, and generates data URIs — all in the browser.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
  };
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "SVG Viewer — Free SVG Editor & SVG to PNG | EMLinter", "description": "Free online SVG viewer and editor. Preview SVG code, resize, flip, rotate, recolor, then convert SVG to PNG at up to 4x or copy a data URI. Runs in your browser.", "keywords": "svg viewer, svg editor, svg code to png, svg editor online, svg viewer online, svg to png, convert svg file to png, svg convert to png", "jsonLd": softwareLd, "faqSchema": faqSchema }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "SvgToPngPage", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/components/pages/SvgToPngPage", "client:component-export": "default" }, { "fallback": ($$result3) => renderTemplate`${renderComponent($$result3, "SeoFallback", $$SeoFallback, { "slot": "fallback", "heading": "The free SVG viewer, editor & SVG to PNG converter.", "intro": "Paste SVG code or upload a file to preview it live, resize, flip, rotate, and recolor it, then export a crisp PNG at up to 4x — all in your browser, nothing uploaded.", "links": [
    { href: "/tools/html-minifier", label: "HTML Minifier" },
    { href: "/tools/beautify-code", label: "HTML Beautifier" },
    { href: "/tools", label: "All Developer Tools" }
  ] })}` })} ` })}`;
}, "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/tools/svg-to-png.astro", void 0);

const $$file = "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/tools/svg-to-png.astro";
const $$url = "/tools/svg-to-png";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$SvgToPng,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
