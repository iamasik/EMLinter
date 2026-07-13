import type { APIRoute } from 'astro';
import dns from 'node:dns/promises';
import ipaddr from 'ipaddr.js';

export const prerender = false;

// Ranges an SSRF must never be allowed to reach: loopback, RFC1918 private,
// link-local (incl. cloud metadata 169.254.169.254), CGNAT, unique-local/ULA
// (IPv6 equivalent of private), reserved, multicast, and unspecified.
const BLOCKED_RANGES = new Set([
    'loopback',
    'private',
    'linkLocal',
    'uniqueLocal',
    'carrierGradeNat',
    'reserved',
    'multicast',
    'broadcast',
    'unspecified',
]);

// Checks the actual IP an address resolves to, not just its textual form —
// this is what stops DNS-based bypasses (a public hostname that resolves to
// a private IP) and IPv6 forms (fc00::/7, fe80::/10, IPv4-mapped ::ffff:127.0.0.1)
// that a hostname-string regex can't see.
function isBlockedAddress(address: string): boolean {
    let addr;
    try {
        addr = ipaddr.parse(address);
    } catch {
        return true; // fail closed on anything unparsable
    }
    if (addr.kind() === 'ipv6' && typeof (addr as any).isIPv4MappedAddress === 'function' && (addr as any).isIPv4MappedAddress()) {
        addr = (addr as any).toIPv4Address();
    }
    return BLOCKED_RANGES.has(addr.range());
}

// Resolves a hostname (or passes through an IP literal) and rejects if any
// resolved address is in a blocked range. Called both for the initial URL and
// for every redirect hop, since a redirect target is just as attacker-controlled
// as the original URL.
async function assertHostIsAllowed(hostname: string): Promise<void> {
    const bare = hostname.replace(/^\[|\]$/g, '');
    let addresses: string[];
    try {
        const records = await dns.lookup(bare, { all: true, verbatim: true });
        addresses = records.map((r) => r.address);
    } catch {
        throw new Error('DNS resolution failed');
    }
    if (addresses.length === 0 || addresses.some(isBlockedAddress)) {
        throw new Error('Host not allowed');
    }
}

async function assertUrlIsAllowed(parsed: URL): Promise<void> {
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error('Only http(s) URLs are allowed');
    }
    await assertHostIsAllowed(parsed.hostname);
}

const MAX_BYTES = 15 * 1024 * 1024; // 15 MB cap
const MAX_REDIRECTS = 5;

// Raster types only. image/svg+xml is deliberately excluded: SVG can embed
// <script>/event handlers, and this endpoint would otherwise serve attacker-
// controlled markup from our own origin (same-origin XSS).
const ALLOWED_CONTENT_TYPES = new Set([
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'image/avif',
    'image/bmp',
    'image/x-icon',
    'image/vnd.microsoft.icon',
]);

// This endpoint is only ever called via same-origin fetch() from
// HtmlToImagePage.tsx. Requiring that signal stops other sites from
// embedding it as a free, anonymous image proxy. It's not a hard security
// boundary (a direct HTTP client can forge these headers), just an
// abuse-reduction gate against browser-driven cross-site usage.
function isSameOriginRequest(request: Request, selfOrigin: string): boolean {
    const secFetchSite = request.headers.get('sec-fetch-site');
    if (secFetchSite) return secFetchSite === 'same-origin';

    const origin = request.headers.get('origin');
    if (origin) return origin === selfOrigin;

    const referer = request.headers.get('referer');
    if (referer) {
        try {
            return new URL(referer).origin === selfOrigin;
        } catch {
            return false;
        }
    }
    return false;
}

export const GET: APIRoute = async ({ url, request }) => {
    if (!isSameOriginRequest(request, url.origin)) {
        return new Response('Forbidden', { status: 403 });
    }

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

    try {
        await assertUrlIsAllowed(parsed);
    } catch {
        return new Response('Host not allowed', { status: 403 });
    }

    try {
        let currentUrl = parsed;
        let upstream: Response;

        // Follow redirects manually so every hop is re-validated against the
        // same SSRF checks as the original URL (redirect targets are just as
        // attacker-controlled as the input).
        for (let hop = 0; ; hop++) {
            if (hop > MAX_REDIRECTS) {
                return new Response('Too many redirects', { status: 502 });
            }

            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 12000);
            try {
                upstream = await fetch(currentUrl.toString(), {
                    signal: controller.signal,
                    redirect: 'manual',
                    headers: {
                        // Some CDNs 403 requests without a browser-like UA / Accept.
                        'User-Agent': 'Mozilla/5.0 (compatible; EMLinter/1.0; +https://emlinter.com)',
                        Accept: 'image/*,*/*;q=0.8',
                    },
                });
            } finally {
                clearTimeout(timer);
            }

            if (upstream.status >= 300 && upstream.status < 400 && upstream.headers.get('location')) {
                const nextUrl = new URL(upstream.headers.get('location')!, currentUrl);
                try {
                    await assertUrlIsAllowed(nextUrl);
                } catch {
                    return new Response('Redirect target not allowed', { status: 403 });
                }
                currentUrl = nextUrl;
                continue;
            }
            break;
        }

        if (!upstream.ok) {
            return new Response(`Upstream responded ${upstream.status}`, { status: 502 });
        }

        const contentType = (upstream.headers.get('content-type') || '').toLowerCase().split(';')[0].trim();
        if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
            return new Response('Not an allowed image type', { status: 415 });
        }

        const declaredLength = Number(upstream.headers.get('content-length') || '0');
        if (declaredLength > MAX_BYTES) {
            return new Response('Image too large', { status: 413 });
        }

        // Enforce the cap while streaming rather than after buffering, since a
        // missing/lying Content-Length would otherwise let a single request
        // pull an unbounded amount into memory before the size check runs.
        const reader = upstream.body?.getReader();
        if (!reader) {
            return new Response('Failed to fetch image', { status: 502 });
        }
        const chunks: Uint8Array[] = [];
        let total = 0;
        for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            total += value.byteLength;
            if (total > MAX_BYTES) {
                await reader.cancel();
                return new Response('Image too large', { status: 413 });
            }
            chunks.push(value);
        }

        return new Response(new Blob(chunks), {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400',
                'Access-Control-Allow-Origin': '*',
                'X-Content-Type-Options': 'nosniff',
                'Content-Security-Policy': 'sandbox',
                'Content-Disposition': 'inline',
            },
        });
    } catch {
        return new Response('Failed to fetch image', { status: 502 });
    }
};
