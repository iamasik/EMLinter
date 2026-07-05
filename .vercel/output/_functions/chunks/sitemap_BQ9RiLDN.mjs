import { b as getPosts, c as getTemplates, d as getProducts } from './firebase_BUUn4-_3.mjs';

const prerender = false;
const SITE_URL = "https://emlinter.com";
const STATIC_ROUTES = [
  { path: "/", priority: 1, changefreq: "weekly" },
  { path: "/templates", priority: 0.9, changefreq: "weekly" },
  { path: "/tools", priority: 0.9, changefreq: "monthly" },
  { path: "/tools/code-fix", priority: 0.8, changefreq: "monthly" },
  { path: "/tools/beautify-code", priority: 0.8, changefreq: "monthly" },
  { path: "/tools/html-minifier", priority: 0.8, changefreq: "monthly" },
  { path: "/tools/dark-mode-checker", priority: 0.8, changefreq: "monthly" },
  { path: "/tools/design-copier", priority: 0.8, changefreq: "monthly" },
  { path: "/tools/svg-to-png", priority: 0.8, changefreq: "monthly" },
  { path: "/tools/relative-image-scaler", priority: 0.8, changefreq: "monthly" },
  { path: "/solutions", priority: 0.9, changefreq: "monthly" },
  { path: "/solutions/html-email-test", priority: 0.8, changefreq: "monthly" },
  { path: "/solutions/outlook-button-generator", priority: 0.8, changefreq: "monthly" },
  { path: "/solutions/outlook-background-generator", priority: 0.8, changefreq: "monthly" },
  { path: "/solutions/outlook-ready-html", priority: 0.8, changefreq: "monthly" },
  { path: "/visual-editor", priority: 0.8, changefreq: "monthly" },
  { path: "/resources/blog", priority: 0.7, changefreq: "daily" },
  { path: "/resources/products", priority: 0.7, changefreq: "weekly" },
  { path: "/resources/how-it-works", priority: 0.6, changefreq: "monthly" },
  { path: "/resources/faq", priority: 0.6, changefreq: "monthly" },
  { path: "/contact-us", priority: 0.5, changefreq: "yearly" }
];
const toDate = (createdAt) => {
  try {
    if (createdAt && typeof createdAt.toDate === "function") {
      return createdAt.toDate().toISOString();
    }
  } catch {
  }
  return null;
};
const urlEntry = (loc, opts = {}) => {
  const parts = [`    <loc>${loc}</loc>`];
  if (opts.lastmod) parts.push(`    <lastmod>${opts.lastmod}</lastmod>`);
  if (opts.changefreq) parts.push(`    <changefreq>${opts.changefreq}</changefreq>`);
  if (opts.priority != null) parts.push(`    <priority>${opts.priority.toFixed(1)}</priority>`);
  return `  <url>
${parts.join("\n")}
  </url>`;
};
const GET = async () => {
  const entries = STATIC_ROUTES.map(
    (r) => urlEntry(`${SITE_URL}${r.path}`, { priority: r.priority, changefreq: r.changefreq })
  );
  const [posts, templates, products] = await Promise.all([
    getPosts().catch(() => []),
    getTemplates().catch(() => []),
    getProducts().catch(() => [])
  ]);
  for (const post of posts) {
    if (!post.slug) continue;
    entries.push(urlEntry(`${SITE_URL}/resources/blog/${post.slug}`, {
      lastmod: toDate(post.createdAt),
      priority: 0.6,
      changefreq: "monthly"
    }));
  }
  for (const template of templates) {
    if (!template.slug) continue;
    entries.push(urlEntry(`${SITE_URL}/templates/${template.slug}`, {
      lastmod: toDate(template.createdAt),
      priority: 0.7,
      changefreq: "monthly"
    }));
  }
  for (const product of products) {
    if (!product.slug) continue;
    entries.push(urlEntry(`${SITE_URL}/resources/products/${product.slug}`, {
      lastmod: toDate(product.lastUpdatedAt) ?? toDate(product.createdAt),
      priority: 0.6,
      changefreq: "monthly"
    }));
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    GET,
    prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
