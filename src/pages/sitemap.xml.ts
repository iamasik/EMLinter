import type { APIRoute } from 'astro';
import { getPosts, getTemplates, getProducts } from '../services/firebase';

export const prerender = false;

const SITE_URL = 'https://www.emlinter.com';

/** Static routes with per-page crawl priority + change cadence. */
const STATIC_ROUTES: { path: string; priority: number; changefreq: string }[] = [
    { path: '/', priority: 1.0, changefreq: 'weekly' },
    { path: '/tools', priority: 0.9, changefreq: 'monthly' },
    { path: '/tools/code-fix', priority: 0.8, changefreq: 'monthly' },
    { path: '/tools/beautify-code', priority: 0.8, changefreq: 'monthly' },
    { path: '/tools/html-minifier', priority: 0.8, changefreq: 'monthly' },
    { path: '/tools/dark-mode-checker', priority: 0.8, changefreq: 'monthly' },
    { path: '/tools/design-copier', priority: 0.8, changefreq: 'monthly' },
    { path: '/tools/svg-to-png', priority: 0.8, changefreq: 'monthly' },
    { path: '/tools/relative-image-scaler', priority: 0.8, changefreq: 'monthly' },
    { path: '/tools/html-to-image', priority: 0.8, changefreq: 'monthly' },
    { path: '/solutions', priority: 0.9, changefreq: 'monthly' },
    { path: '/solutions/html-email-test', priority: 0.8, changefreq: 'monthly' },
    { path: '/solutions/outlook-button-generator', priority: 0.8, changefreq: 'monthly' },
    { path: '/solutions/outlook-background-generator', priority: 0.8, changefreq: 'monthly' },
    { path: '/solutions/outlook-ready-html', priority: 0.8, changefreq: 'monthly' },
    { path: '/visual-editor', priority: 0.8, changefreq: 'monthly' },
    { path: '/templates', priority: 0.8, changefreq: 'weekly' },
    { path: '/resources/blog', priority: 0.7, changefreq: 'daily' },
    { path: '/resources/products', priority: 0.7, changefreq: 'weekly' },
    { path: '/resources/how-it-works', priority: 0.6, changefreq: 'monthly' },
    { path: '/resources/faq', priority: 0.6, changefreq: 'monthly' },
    { path: '/contact-us', priority: 0.5, changefreq: 'yearly' },
];

const toDate = (createdAt: any): string | null => {
    try {
        if (createdAt && typeof createdAt.toDate === 'function') {
            return createdAt.toDate().toISOString();
        }
    } catch { /* ignore malformed timestamps */ }
    return null;
};

const urlEntry = (loc: string, opts: { lastmod?: string | null; priority?: number; changefreq?: string } = {}): string => {
    const parts = [`    <loc>${loc}</loc>`];
    if (opts.lastmod) parts.push(`    <lastmod>${opts.lastmod}</lastmod>`);
    if (opts.changefreq) parts.push(`    <changefreq>${opts.changefreq}</changefreq>`);
    if (opts.priority != null) parts.push(`    <priority>${opts.priority.toFixed(1)}</priority>`);
    return `  <url>\n${parts.join('\n')}\n  </url>`;
};

export const GET: APIRoute = async () => {
    const entries: string[] = STATIC_ROUTES.map((r) =>
        urlEntry(`${SITE_URL}${r.path}`, { priority: r.priority, changefreq: r.changefreq })
    );

    // Live content URLs from Firestore. Failures degrade gracefully to the static set.
    const [posts, templates, products] = await Promise.all([
        getPosts().catch(() => []),
        getTemplates().catch(() => []),
        getProducts().catch(() => []),
    ]);

    for (const post of posts) {
        if (!post.slug) continue;
        entries.push(urlEntry(`${SITE_URL}/resources/blog/${post.slug}`, {
            lastmod: toDate(post.createdAt), priority: 0.6, changefreq: 'monthly',
        }));
    }
    for (const template of templates) {
        if (!template.slug) continue;
        entries.push(urlEntry(`${SITE_URL}/templates/${template.slug}`, {
            lastmod: toDate(template.createdAt), priority: 0.7, changefreq: 'monthly',
        }));
    }
    for (const product of products) {
        if (!product.slug) continue;
        entries.push(urlEntry(`${SITE_URL}/resources/products/${product.slug}`, {
            lastmod: toDate(product.lastUpdatedAt) ?? toDate(product.createdAt), priority: 0.6, changefreq: 'monthly',
        }));
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
        },
    });
};
