import type { APIRoute } from 'astro';

export const prerender = false;

// Block obvious SSRF targets. The proxy fetches user-supplied URLs (pulled from
// pasted HTML), so it must not become a door into localhost / private networks
// or cloud metadata endpoints.
function isBlockedHost(hostname: string): boolean {
    const h = hostname.toLowerCase().replace(/^\[|\]$/g, ''); // strip IPv6 brackets
    if (h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal')) return true;
    if (h === '::1' || h === '0.0.0.0') return true;
    if (h === '169.254.169.254') return true; // cloud metadata
    // IPv4 literals in private / loopback / link-local ranges
    const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (m) {
        const [a, b] = [Number(m[1]), Number(m[2])];
        if (a === 127 || a === 10) return true;
        if (a === 192 && b === 168) return true;
        if (a === 172 && b >= 16 && b <= 31) return true;
        if (a === 169 && b === 254) return true;
        if (a === 0) return true;
    }
    return false;
}

const MAX_BYTES = 15 * 1024 * 1024; // 15 MB cap

export const GET: APIRoute = async ({ url }) => {
    const target = url.searchParams.get('url');
    if (!target) {
        return new Response('Missing url parameter', { status: 400 });
    }

    let parsed: URL;
    try {
        parsed = new URL(target);
    } catch {
        return new Response('Invalid url', { status: 400 });
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return new Response('Only http(s) URLs are allowed', { status: 400 });
    }
    if (isBlockedHost(parsed.hostname)) {
        return new Response('Host not allowed', { status: 403 });
    }

    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 12000);
        const upstream = await fetch(parsed.toString(), {
            signal: controller.signal,
            redirect: 'follow',
            headers: {
                // Some CDNs 403 requests without a browser-like UA / Accept.
                'User-Agent': 'Mozilla/5.0 (compatible; EMLinter/1.0; +https://emlinter.com)',
                Accept: 'image/*,*/*;q=0.8',
            },
        });
        clearTimeout(timer);

        if (!upstream.ok) {
            return new Response(`Upstream responded ${upstream.status}`, { status: 502 });
        }

        const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
        if (!contentType.toLowerCase().startsWith('image/')) {
            return new Response('Not an image', { status: 415 });
        }

        const buf = await upstream.arrayBuffer();
        if (buf.byteLength > MAX_BYTES) {
            return new Response('Image too large', { status: 413 });
        }

        return new Response(buf, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch {
        return new Response('Failed to fetch image', { status: 502 });
    }
};
