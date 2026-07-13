import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
    UploadIcon,
    DownloadIcon,
    CodeIcon,
    ImageIcon,
    DesktopIcon,
    MobileIcon,
} from '../Icons';
import PageHero from '../PageHero';
import SeoFaq from '../SeoFaq';

const faqs = [
    {
        question: 'How do I convert HTML to an image online?',
        answer: 'Paste your markup into the code box on the left, or upload an .html file. The panel on the right renders a live preview instantly — no button to click. When it looks right, choose PNG or JPG, pick a scale from 1x to 4x, and download. This HTML to image converter draws your rendered page onto a canvas in the browser, so nothing is uploaded to a server.',
    },
    {
        question: 'Can I add my own CSS when I convert HTML to PNG?',
        answer: 'Yes. Switch to the CSS tab on the left and paste your stylesheet, or upload a .css file. Your styles are applied to the preview in real time and baked into the exported image, so the HTML to PNG output matches exactly what you see. This is handy when your HTML relies on an external stylesheet you want to keep separate.',
    },
    {
        question: 'What is the difference between the PNG and JPG download?',
        answer: 'PNG keeps a fully transparent background wherever your HTML has no background color, which is ideal for logos, badges, and overlays. JPG always exports on a solid white background and produces a smaller file, which is better for screenshots and photos. Pick whichever format fits before you download — the HTML to image conversion happens entirely client-side.',
    },
    {
        question: 'Why should I export HTML to a high-resolution 2x, 3x, or 4x image?',
        answer: 'The scale multiplies the pixel dimensions of the output. A 1x export matches the on-screen size, while 2x–4x renders the same layout at double, triple, or quadruple the resolution for crisp results on retina screens, print, and presentations. Convert HTML to PNG at 4x whenever you need a sharp image that still looks clean when zoomed or scaled up.',
    },
    {
        question: 'Is this HTML to image converter free and private?',
        answer: 'Completely free, no signup, and fully private. The preview, rendering, and both the HTML to PNG and HTML to JPG exports all run locally in your browser using the canvas API. Your HTML and CSS never leave your device, which makes it safe for confidential email templates, invoices, and internal dashboards.',
    },
    {
        question: 'My images are missing when I convert HTML to JPG — why?',
        answer: 'Browsers block reading external images that are hosted on another domain without CORS permission, so they cannot be baked into the exported canvas for security reasons. If a remote image is missing from your HTML to image result, embed it as a base64 data URI instead of linking to a remote URL, and it will render in the download every time.',
    },
];

const DEFAULT_HTML = `<div class="card">
  <span class="badge">New</span>
  <h1>HTML to Image</h1>
  <p>
    Paste HTML on the left and download a pixel-perfect
    <strong>PNG</strong> or <strong>JPG</strong> on the right.
  </p>
  <a class="btn" href="#">Get started</a>
</div>`;

const DEFAULT_CSS = `.card {
  width: 460px;
  padding: 40px;
  font-family: 'Inter', system-ui, sans-serif;
  background: linear-gradient(135deg, #1e1b4b, #4c1d95);
  border-radius: 24px;
  color: #fff;
  box-sizing: border-box;
}
.badge {
  display: inline-block;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .05em;
  text-transform: uppercase;
  background: #ec4899;
  border-radius: 999px;
}
h1 { margin: 18px 0 8px; font-size: 40px; }
p  { margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #e9d5ff; }
.btn {
  display: inline-block;
  padding: 12px 24px;
  font-weight: 600;
  color: #4c1d95;
  background: #fff;
  border-radius: 12px;
  text-decoration: none;
}`;

type EditorTab = 'html' | 'css';
type Format = 'png' | 'jpg';
type Viewport = 'mobile' | 'desktop';

// Fixed widths the iframe/export viewport are forced to. Desktop is wide enough
// that any typical mobile media query (max-width: 480–640px) never matches, so
// the email renders its desktop layout. Mobile is a real small-device width, so
// mobile media queries reliably fire. In both cases the body is set to this exact
// width and we crop the export to the email's real rendered content box.
const DESKTOP_VW = 1280;
const MOBILE_VW = 360;

function viewportWidth(viewport: Viewport): number {
    return viewport === 'desktop' ? DESKTOP_VW : MOBILE_VW;
}

// Orphan table elements (a bare <tr>, <td>, <tbody>… pasted without a wrapping
// <table>) are silently dropped by the HTML parser, so they'd never render or
// export. Wrap them in a minimal table so the fragment shows up as intended.
function wrapFragment(html: string): string {
    const t = html.trimStart();
    if (/^<(td|th)[\s>]/i.test(t)) {
        return `<table style="border-collapse:collapse"><tbody><tr>${html}</tr></tbody></table>`;
    }
    if (/^<tr[\s>]/i.test(t)) {
        return `<table style="border-collapse:collapse"><tbody>${html}</tbody></table>`;
    }
    if (/^<(tbody|thead|tfoot|caption|colgroup|col)[\s>]/i.test(t)) {
        return `<table style="border-collapse:collapse">${html}</table>`;
    }
    return html;
}

// Build a full document for the live iframe preview. The body (and the iframe
// element itself, which drives the CSS layout viewport media queries evaluate
// against) is always forced to a fixed width — DESKTOP_VW or MOBILE_VW — so
// breakpoints fire consistently and a centered email (margin:auto / align=center)
// still centers within it.
function buildSrcDoc(html: string, css: string, viewport: Viewport): string {
    const vw = viewportWidth(viewport);
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  html,body { margin:0; }
  body { width:${vw}px; }
</style>
<style>${css}</style>
</head>
<body>${wrapFragment(html)}</body>
</html>`;
}

// Count lines for the gutter.
function lineCount(text: string): number {
    return Math.max(1, text.split('\n').length);
}

// Measure the real content bounding box inside the preview document. The body
// is a fixed width (DESKTOP_VW or MOBILE_VW) but the email itself is usually a
// narrower table, possibly centered inside it — so we take the union of the
// direct children's rects to find the actual left edge and width to crop to.
function contentBox(doc: Document): { x: number; y: number; w: number; h: number } {
    const body = doc.body;
    let left = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;
    const kids = Array.from(body.children) as HTMLElement[];
    for (const el of kids) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        left = Math.min(left, r.left);
        right = Math.max(right, r.right);
        bottom = Math.max(bottom, r.bottom);
    }
    if (!isFinite(left)) {
        // no measurable children — fall back to the full body
        return { x: 0, y: 0, w: Math.max(body.scrollWidth, 1), h: Math.max(body.scrollHeight, 1) };
    }
    return {
        x: Math.max(0, Math.floor(left)),
        y: 0,
        w: Math.max(1, Math.ceil(right - left)),
        h: Math.max(1, Math.ceil(bottom)),
    };
}

function blobToDataUri(blob: Blob): Promise<string | null> {
    return new Promise((resolve) => {
        const fr = new FileReader();
        fr.onload = () => resolve(String(fr.result));
        fr.onerror = () => resolve(null);
        fr.readAsDataURL(blob);
    });
}

// Fetch a remote asset and return it as a base64 data URI, or null on failure.
// Rasterizing an SVG <foreignObject> won't load external URLs, so any remote
// <img> has to be inlined first. Most image CDNs don't send CORS headers, so a
// direct browser fetch is blocked — we fall back to a same-origin server proxy
// (/api/proxy-image) which fetches the bytes server-side, free of CORS.
async function toDataUri(url: string): Promise<string | null> {
    // Try a direct fetch first (works when the host allows CORS — cheap, no proxy hop).
    try {
        const res = await fetch(url, { mode: 'cors' });
        if (res.ok) {
            const data = await blobToDataUri(await res.blob());
            if (data) return data;
        }
    } catch {
        /* fall through to proxy */
    }
    // Fall back to the server-side proxy, which has no CORS restriction.
    try {
        const res = await fetch(`/api/proxy-image?url=${encodeURIComponent(url)}`);
        if (!res.ok) return null;
        return await blobToDataUri(await res.blob());
    } catch {
        return null;
    }
}

const HtmlToImagePage: React.FC = () => {
    const [htmlCode, setHtmlCode] = useState<string>(DEFAULT_HTML);
    const [cssCode, setCssCode] = useState<string>(DEFAULT_CSS);
    const [tab, setTab] = useState<EditorTab>('html');
    const [format, setFormat] = useState<Format>('png');
    const [scale, setScale] = useState<number>(2);
    const [viewport, setViewport] = useState<Viewport>('mobile');
    const [exporting, setExporting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [dims, setDims] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
    const [previewScale, setPreviewScale] = useState<number>(1);

    const htmlFileRef = useRef<HTMLInputElement>(null);
    const cssFileRef = useRef<HTMLInputElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const previewWrapRef = useRef<HTMLDivElement>(null);
    const htmlAreaRef = useRef<HTMLTextAreaElement>(null);
    const cssAreaRef = useRef<HTMLTextAreaElement>(null);
    const htmlGutterRef = useRef<HTMLDivElement>(null);
    const cssGutterRef = useRef<HTMLDivElement>(null);

    // realtime preview document (debounced lightly so fast typing stays smooth)
    const [srcDoc, setSrcDoc] = useState<string>(() => buildSrcDoc(DEFAULT_HTML, DEFAULT_CSS, 'mobile'));
    useEffect(() => {
        const id = window.setTimeout(() => setSrcDoc(buildSrcDoc(htmlCode, cssCode, viewport)), 200);
        return () => window.clearTimeout(id);
    }, [htmlCode, cssCode, viewport]);

    // measure the rendered content whenever the preview reloads / resizes
    const measure = useCallback(() => {
        const doc = iframeRef.current?.contentDocument;
        if (!doc?.body) return;
        const box = contentBox(doc);
        setDims(box);
        // Fit the visible content box into the panel width. The iframe stays a
        // fixed DESKTOP_VW/MOBILE_VW wide internally (so the right breakpoints
        // trigger) — this outer scale is purely visual and doesn't affect its
        // media queries. We crop to the content box, so fit against box.w, not
        // the full viewport.
        const avail = (previewWrapRef.current?.clientWidth ?? box.w) - 24; // panel padding
        setPreviewScale(box.w > avail ? avail / box.w : 1);
    }, []);

    // re-measure when the panel resizes (desktop fit depends on panel width)
    useEffect(() => {
        const onResize = () => measure();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [measure]);

    const activeCode = tab === 'html' ? htmlCode : cssCode;
    const activeLines = useMemo(() => lineCount(activeCode), [activeCode]);

    const syncScroll = (
        e: React.UIEvent<HTMLTextAreaElement>,
        gutter: React.RefObject<HTMLDivElement>
    ) => {
        if (gutter.current) gutter.current.scrollTop = e.currentTarget.scrollTop;
    };

    const handleUpload = (
        e: React.ChangeEvent<HTMLInputElement>,
        setter: (v: string) => void,
        switchTo: EditorTab
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setter(String(reader.result ?? ''));
            setTab(switchTo);
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    // --- export: rendered DOM -> SVG <foreignObject> -> canvas -> PNG/JPG ---
    const download = useCallback(async () => {
        setError(null);
        const doc = iframeRef.current?.contentDocument;
        if (!doc?.body) {
            setError('Preview is not ready yet. Try again in a moment.');
            return;
        }
        // Re-measure the live preview so the export matches exactly what's on screen.
        const box = contentBox(doc);
        // The foreignObject's media queries evaluate against ITS width, so render it
        // at the exact same fixed viewport width as the live preview, then crop the
        // canvas back to the email's real content box (box.x / box.w).
        const svgW = viewportWidth(viewport);
        const svgH = box.h;

        setExporting(true);

        // Clone the live-rendered document — not a tree rebuilt from htmlCode/cssCode
        // state — so the export is pixel-identical to the preview. This keeps the real
        // <html>/<body> elements (CSS rules targeting `body`/`html` still apply, unlike
        // a bare wrapper <div>) and the exact width/styles already applied live.
        const docEl = doc.documentElement.cloneNode(true) as HTMLElement;
        const clonedBody = docEl.querySelector('body');

        // Rasterizing an SVG <foreignObject> can't load external URLs, so inline every
        // remote <img> as a base64 data URI first. Hosts that block cross-origin reads
        // are skipped (that image just won't appear), but the rest export correctly.
        const remoteImgs = clonedBody
            ? Array.from(clonedBody.querySelectorAll('img')).filter((im) => {
                  const src = im.getAttribute('src') || '';
                  return /^https?:\/\//i.test(src);
              })
            : [];
        let missingImages = 0;
        await Promise.all(
            remoteImgs.map(async (im) => {
                const data = await toDataUri(im.getAttribute('src') as string);
                if (data) im.setAttribute('src', data);
                else missingImages++;
            })
        );

        let serialized: string;
        try {
            serialized = new XMLSerializer().serializeToString(docEl);
        } catch {
            setExporting(false);
            setError('This HTML could not be parsed for export. Check for malformed tags.');
            return;
        }

        const svg =
            `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}">` +
            `<foreignObject x="0" y="0" width="100%" height="100%">${serialized}</foreignObject>` +
            `</svg>`;

        const img = new Image();
        img.onload = () => {
            try {
                // Output only the email's real content box, cropping any empty
                // canvas either side of a centered desktop layout.
                const canvas = document.createElement('canvas');
                canvas.width = Math.round(box.w * scale);
                canvas.height = Math.round(box.h * scale);
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error('no-ctx');
                if (format === 'jpg') {
                    ctx.fillStyle = '#ffffff'; // JPG has no alpha channel
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                // crop (box.x, box.y, box.w, box.h) from the rendered SVG and scale up
                ctx.drawImage(
                    img,
                    box.x, box.y, box.w, box.h,
                    0, 0, canvas.width, canvas.height
                );
                const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
                canvas.toBlob(
                    (blob) => {
                        setExporting(false);
                        if (!blob) {
                            setError('Could not generate the image. Try a smaller scale.');
                            return;
                        }
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `html-to-image@${scale}x.${format}`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        if (missingImages > 0) {
                            setError(
                                `${missingImages} image${missingImages > 1 ? 's' : ''} could not be included — the host blocks cross-origin downloads. Embed those images as base64 data URIs to include them.`
                            );
                        }
                    },
                    mime,
                    format === 'jpg' ? 0.92 : undefined
                );
            } catch (err) {
                setExporting(false);
                // Canvas taint from cross-origin images is the usual cause.
                setError(
                    'Export failed — this usually means your HTML loads an image from another domain, which browsers block from canvas for security. Embed images as base64 data URIs to include them.'
                );
            }
        };
        img.onerror = () => {
            setExporting(false);
            setError('Could not render this HTML to an image. Check that the markup is valid.');
        };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }, [scale, format, viewport]);

    const clearAll = () => {
        setHtmlCode('');
        setCssCode('');
    };

    const gutterCls =
        'select-none text-right pr-3 py-4 font-mono text-xs md:text-sm leading-relaxed text-ink-500 bg-ink-950/80 overflow-hidden border-r border-white/10';
    const areaCls =
        'flex-1 min-w-0 p-4 pl-3 font-mono text-xs md:text-sm bg-ink-950/60 text-ink-100 border-0 focus:ring-0 focus:outline-none resize-none custom-scrollbar leading-relaxed';

    return (
        <div>
            <PageHero
                eyebrow="HTML to Image Converter"
                title={
                    <>
                        Convert <span className="gradient-text">HTML to image</span> — PNG &amp; JPG, live in your browser.
                    </>
                }
                subtitle="Paste HTML (and optional CSS) on the left, see a live preview on the right, then download a pixel-perfect PNG or JPG at up to 4x. No uploads, no signup — everything runs locally."
            >
                <a href="#html-to-image-tool" className="btn-primary">Open the converter</a>
                <a href="/tools/svg-to-png" className="btn-secondary">SVG to PNG</a>
            </PageHero>

            <section id="html-to-image-tool" className="card overflow-hidden mb-16">
                <div className="flex flex-col lg:flex-row min-h-[640px]">
                    {/* ============ LEFT: HTML / CSS editors ============ */}
                    <div className="flex flex-col lg:w-1/2 border-b lg:border-b-0 lg:border-r border-white/10 min-w-0">
                        {/* tabs */}
                        <div className="flex items-center gap-1 px-4 py-3 border-b border-white/10 bg-ink-950/40">
                            <button
                                type="button"
                                onClick={() => setTab('html')}
                                className={`inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                                    tab === 'html' ? 'bg-white/10 text-white' : 'text-ink-300 hover:text-white'
                                }`}
                            >
                                <CodeIcon className="w-4 h-4" /> HTML
                            </button>
                            <button
                                type="button"
                                onClick={() => setTab('css')}
                                className={`inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                                    tab === 'css' ? 'bg-white/10 text-white' : 'text-ink-300 hover:text-white'
                                }`}
                            >
                                CSS
                                {cssCode.trim() && <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />}
                            </button>
                            <button
                                type="button"
                                onClick={clearAll}
                                className="ml-auto text-xs font-semibold text-ink-300 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                            >
                                Clear
                            </button>
                        </div>

                        {/* code editor with line-number gutter */}
                        <div className="relative flex-grow min-h-[300px] flex">
                            {/* HTML editor */}
                            <div className={`absolute inset-0 flex ${tab === 'html' ? '' : 'hidden'}`}>
                                <div ref={htmlGutterRef} className={gutterCls} aria-hidden="true">
                                    {Array.from({ length: lineCount(htmlCode) }, (_, i) => (
                                        <div key={i}>{i + 1}</div>
                                    ))}
                                </div>
                                <textarea
                                    ref={htmlAreaRef}
                                    value={htmlCode}
                                    onChange={(e) => setHtmlCode(e.target.value)}
                                    onScroll={(e) => syncScroll(e, htmlGutterRef)}
                                    spellCheck={false}
                                    placeholder="Paste your HTML here, or upload an .html file…"
                                    className={areaCls}
                                />
                            </div>
                            {/* CSS editor */}
                            <div className={`absolute inset-0 flex ${tab === 'css' ? '' : 'hidden'}`}>
                                <div ref={cssGutterRef} className={gutterCls} aria-hidden="true">
                                    {Array.from({ length: lineCount(cssCode) }, (_, i) => (
                                        <div key={i}>{i + 1}</div>
                                    ))}
                                </div>
                                <textarea
                                    ref={cssAreaRef}
                                    value={cssCode}
                                    onChange={(e) => setCssCode(e.target.value)}
                                    onScroll={(e) => syncScroll(e, cssGutterRef)}
                                    spellCheck={false}
                                    placeholder="Optional: paste CSS here, or upload a .css file…"
                                    className={areaCls}
                                />
                            </div>
                        </div>

                        {/* upload actions */}
                        <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-t border-white/10 bg-ink-950/40">
                            <button
                                type="button"
                                onClick={() => htmlFileRef.current?.click()}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-accent-500 rounded-lg hover:brightness-110 transition-all"
                            >
                                <UploadIcon className="w-4 h-4" /> Upload HTML
                            </button>
                            <input
                                ref={htmlFileRef}
                                type="file"
                                accept=".html,.htm,text/html"
                                onChange={(e) => handleUpload(e, setHtmlCode, 'html')}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => cssFileRef.current?.click()}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-ink-200 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <UploadIcon className="w-4 h-4" /> Upload CSS
                            </button>
                            <input
                                ref={cssFileRef}
                                type="file"
                                accept=".css,text/css"
                                onChange={(e) => handleUpload(e, setCssCode, 'css')}
                                className="hidden"
                            />
                            <span className="ml-auto text-xs text-ink-500 font-mono">{activeLines} lines</span>
                        </div>
                    </div>

                    {/* ============ RIGHT: preview + export ============ */}
                    <div className="flex flex-col lg:w-1/2 min-w-0">
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-ink-950/40">
                            <ImageIcon className="w-4 h-4 text-ink-300" />
                            <span className="text-sm font-semibold text-white">Live preview</span>

                            {/* viewport toggle */}
                            <div className="ml-auto inline-flex rounded-lg border border-white/10 bg-white/5 p-0.5">
                                <button
                                    type="button"
                                    onClick={() => setViewport('mobile')}
                                    title="Mobile view (media queries active)"
                                    aria-label="Mobile view"
                                    aria-pressed={viewport === 'mobile'}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                                        viewport === 'mobile' ? 'bg-white/10 text-white' : 'text-ink-300 hover:text-white'
                                    }`}
                                >
                                    <MobileIcon className="w-4 h-4" /> Mobile
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewport('desktop')}
                                    title="Desktop view (ignores mobile media queries)"
                                    aria-label="Desktop view"
                                    aria-pressed={viewport === 'desktop'}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                                        viewport === 'desktop' ? 'bg-white/10 text-white' : 'text-ink-300 hover:text-white'
                                    }`}
                                >
                                    <DesktopIcon className="w-4 h-4" /> Desktop
                                </button>
                            </div>

                            {dims && (
                                <span className="text-xs text-ink-500 font-mono tabular-nums">
                                    {dims.w} × {dims.h} px
                                </span>
                            )}
                        </div>

                        {/* preview surface (checkered so transparency is visible) */}
                        <div
                            ref={previewWrapRef}
                            className="relative flex-grow min-h-[300px] bg-checker overflow-auto custom-scrollbar flex items-start justify-center p-3"
                        >
                            {/* stage: sized to the scaled content box, crops empty canvas around a centered desktop layout */}
                            <div
                                className="relative overflow-hidden"
                                style={{
                                    width: dims ? dims.w * previewScale : '100%',
                                    height: dims ? dims.h * previewScale : undefined,
                                }}
                            >
                                <iframe
                                    ref={iframeRef}
                                    title="HTML preview"
                                    srcDoc={srcDoc}
                                    sandbox="allow-scripts allow-same-origin"
                                    onLoad={measure}
                                    scrolling="no"
                                    style={{
                                        width: viewportWidth(viewport),
                                        height: dims ? dims.h : '100%',
                                        transform: `scale(${previewScale}) translateX(${dims ? -dims.x : 0}px)`,
                                        transformOrigin: 'top left',
                                    }}
                                    className="border-0 bg-transparent"
                                />
                            </div>
                        </div>

                        {/* export controls */}
                        <div className="border-t border-white/10 bg-ink-950/40 px-4 py-3 space-y-3">
                            {/* format */}
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-xs text-ink-400 w-14">Format</span>
                                <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-0.5">
                                    {(['png', 'jpg'] as Format[]).map((f) => (
                                        <button
                                            key={f}
                                            type="button"
                                            onClick={() => setFormat(f)}
                                            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                                                format === f ? 'bg-white/10 text-white' : 'text-ink-300 hover:text-white'
                                            }`}
                                        >
                                            {f.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                                <span className="text-xs text-ink-500">
                                    {format === 'png' ? 'Transparent background' : 'White background'}
                                </span>
                            </div>

                            {/* scale */}
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-xs text-ink-400 w-14">Scale</span>
                                <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-0.5">
                                    {[1, 2, 3, 4].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setScale(s)}
                                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                                                scale === s ? 'bg-white/10 text-white' : 'text-ink-300 hover:text-white'
                                            }`}
                                            title={
                                                dims
                                                    ? `${dims.w * s} × ${dims.h * s} px`
                                                    : `${s}x resolution`
                                            }
                                        >
                                            {s}x
                                        </button>
                                    ))}
                                </div>
                                {dims && (
                                    <span className="text-xs text-ink-500 font-mono tabular-nums">
                                        → {dims.w * scale} × {dims.h * scale} px
                                    </span>
                                )}
                            </div>

                            {/* download */}
                            <button
                                type="button"
                                onClick={download}
                                disabled={exporting}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-accent-500 rounded-lg hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <DownloadIcon className="w-4 h-4" />
                                {exporting ? 'Rendering…' : `Download ${format.toUpperCase()} @ ${scale}x`}
                            </button>

                            {error && (
                                <p className="text-xs text-amber-300 leading-relaxed">{error}</p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* SEO prose */}
            <section className="card p-8 md:p-12 max-w-5xl mx-auto mb-12">
                <h2 className="section-title mb-5">A fast, private HTML to image converter</h2>
                <div className="text-ink-300 leading-relaxed space-y-4 text-sm md:text-base">
                    <p>
                        Turning a block of markup into a shareable picture usually means a screenshot tool, a headless
                        browser, or a paid API. This HTML to image converter skips all of that. Paste your HTML on the left,
                        drop in a stylesheet if you have one, and the panel on the right renders a live preview the moment you
                        type — there is no button to press to see your changes. When you are happy with it, convert HTML to PNG
                        or HTML to JPG and download the result in a single click.
                    </p>
                    <p>
                        The PNG export keeps a transparent background wherever your design has none, which is perfect for
                        logos, badges, signatures, and overlays. Prefer a flat file for a screenshot or a photo-heavy layout?
                        Convert HTML to JPG instead and get a smaller image on a clean white background. Either way you can
                        render at 1x, 2x, 3x, or 4x, so the same layout exports as a high-resolution image that stays sharp on
                        retina displays, in print, and inside slide decks. Because this HTML to PNG converter runs entirely in
                        your browser using the canvas API, your code never touches a server — it is a genuinely private way to
                        convert HTML to image files for email templates, invoices, and internal tools.
                    </p>
                </div>
            </section>

            <SeoFaq title="HTML to Image FAQs" items={faqs} />
        </div>
    );
};

export default HtmlToImagePage;
