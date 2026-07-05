import { $ as $$BaseLayout } from './BaseLayout_CLZKUz5E.mjs';
import { c as createComponent } from './astro-component_DyprLGAi.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate } from './entrypoint_BgjnLLDV.mjs';

const prerender = false;
const $$slug = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$slug;
  const { slug } = Astro2.params;
  return renderTemplate`<!-- Deep-link into the editor with a template preloaded. Canonical points at the
     base editor URL so these functional variants don't compete as duplicate content. -->${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Visual HTML Email Editor — Drag & Drop, No Code | EMLinter", "description": "Edit responsive HTML email templates visually in your browser. Drag, drop, and export production-ready code for Gmail, Outlook, and Apple Mail.", "canonical": "https://emlinter.com/visual-editor" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "VisualEditorPage", null, { "slug": slug, "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/components/pages/VisualEditorPage", "client:component-export": "default" })} ` })}`;
}, "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/visual-editor/[slug].astro", void 0);

const $$file = "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/visual-editor/[slug].astro";
const $$url = "/visual-editor/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
