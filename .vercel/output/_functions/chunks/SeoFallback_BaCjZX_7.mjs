import { c as createComponent } from './astro-component_DyprLGAi.mjs';
import 'piccolore';
import { m as maybeRenderHead, h as addAttribute, k as renderTemplate } from './entrypoint_BgjnLLDV.mjs';
import 'clsx';

const $$SeoFallback = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$SeoFallback;
  const { heading, intro, links = [] } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<section class="relative text-center pt-6 md:pt-10 pb-10 md:pb-14" data-seo-fallback> <div class="absolute inset-0 -z-10 bg-grid-fade pointer-events-none"></div> <div class="flex justify-center"> <span class="chip text-brand-300 border-brand-400/30 bg-brand-500/10 mb-5"> <span class="inline-block w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse"></span>
Loading toolkit…
</span> </div> <h1 class="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-balance mx-auto max-w-4xl"> ${heading} </h1> <p class="mt-5 text-base md:text-lg text-ink-300 text-pretty mx-auto max-w-2xl"> ${intro} </p> ${links.length > 0 && renderTemplate`<nav class="mt-8 flex flex-wrap gap-3 justify-center" aria-label="Related pages"> ${links.map((link) => renderTemplate`<a${addAttribute(link.href, "href")} class="btn-secondary text-sm py-2 px-4"> ${link.label} </a>`)} </nav>`} </section>`;
}, "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/components/SeoFallback.astro", void 0);

export { $$SeoFallback as $ };
