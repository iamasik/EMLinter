import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
    UploadIcon,
    CopyIcon,
    DownloadIcon,
    CheckCircleIcon,
    CloseIcon,
    ArrowUturnRightIcon,
} from '../Icons';
import PageHero from '../PageHero';
import SeoFaq from '../SeoFaq';

const faqs = [
    {
        question: 'What is an SVG viewer and how does this online tool work?',
        answer: 'This SVG viewer is a free, browser-based tool that lets you paste SVG code or upload an SVG file and instantly see a live preview. It doubles as an SVG editor — you can resize, flip, rotate, and recolor the graphic — and as an SVG to PNG converter that exports your artwork as a raster image. Everything runs locally in your browser; nothing is uploaded to a server.',
    },
    {
        question: 'How do I convert an SVG file to PNG?',
        answer: 'Paste your SVG markup or upload a .svg file into the editor on the left. The preview on the right renders your graphic immediately. When you are ready, pick a resolution — 1x, 2x, 3x, or 4x — and click download. The tool draws your SVG onto a canvas at the chosen scale and saves a crisp PNG. This is the fastest way to convert SVG to PNG without installing software.',
    },
    {
        question: 'Can I edit the colors used in my SVG?',
        answer: 'Yes. This SVG editor online scans your markup for every fill, stroke, and stop-color value and lists each unique color at the bottom of the preview. Click any swatch to open a dedicated color picker with a hex input field, type a new value, and every matching color in your SVG updates live. If there are more colors than fit, a "more" control reveals the rest.',
    },
    {
        question: 'Why would I convert SVG to PNG instead of keeping it as SVG?',
        answer: 'SVG is perfect for the web because it scales without losing quality, but many platforms need a raster image. Email clients strip SVG, most social networks reject it, and some design tools only accept PNG. Converting your SVG file to PNG at 2x–4x gives you a high-resolution image that works everywhere while keeping edges sharp.',
    },
    {
        question: 'What are the Data URI formats and when should I use them?',
        answer: 'A Data URI embeds your SVG directly in HTML or CSS so it loads without a separate file request. This SVG viewer online generates three formats: a minified data URI (URL-encoded, smallest for CSS backgrounds), a base64 data URI (widely compatible), and an encodeURIComponent version (readable and safe for inline src attributes). Copy whichever fits your use case.',
    },
    {
        question: 'Is this SVG to PNG converter free and private?',
        answer: 'Completely free, no signup, and fully private. The SVG viewer, editor, and PNG export all run client-side in your browser using the canvas API. Your SVG code and images never leave your device, which makes it safe for confidential logos, icons, and brand assets.',
    },
];

const DEFAULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 128 128" fill="none">
  <rect width="128" height="128" rx="28" fill="#EC4899"/>
  <rect x="26" y="40" width="76" height="52" rx="8" fill="white"/>
  <path d="M30 46L64 70L98 46" stroke="#EC4899" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M30 92L54 68M98 92L74 68" stroke="#EC4899" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="98" cy="38" r="14" fill="#8B5CF6" stroke="#EC4899" stroke-width="4"/>
</svg>`;

type BgKind = 'transparent' | 'white' | 'dark' | 'checker';
type RightTab = 'preview' | 'datauri';

interface ExtractedColor {
    value: string; // the raw color token found in markup, e.g. "#F97316" or "white"
    count: number;
}

// --- color extraction ---------------------------------------------------
// Pull every fill / stroke / stop-color token from the markup (attribute + inline style).
const COLOR_ATTR_RE = /(?:fill|stroke|stop-color|flood-color|lighting-color)\s*[=:]\s*["']?\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|[a-zA-Z]+)/g;

const IGNORED_TOKENS = new Set(['none', 'transparent', 'currentcolor', 'inherit', 'context-fill', 'context-stroke']);

function extractColors(svg: string): ExtractedColor[] {
    const map = new Map<string, number>();
    let m: RegExpExecArray | null;
    COLOR_ATTR_RE.lastIndex = 0;
    while ((m = COLOR_ATTR_RE.exec(svg)) !== null) {
        const raw = m[1].trim();
        if (!raw) continue;
        if (IGNORED_TOKENS.has(raw.toLowerCase())) continue;
        // skip url(#id) gradient references (they slip past the attr regex only rarely)
        if (raw.toLowerCase().startsWith('url')) continue;
        const key = raw;
        map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count);
}

// Convert an arbitrary CSS color token to a #rrggbb hex for the swatch / picker.
function toHex(color: string): string {
    const c = color.trim().toLowerCase();
    if (/^#[0-9a-f]{6}$/i.test(c)) return c;
    if (/^#[0-9a-f]{3}$/i.test(c)) {
        return '#' + c.slice(1).split('').map((ch) => ch + ch).join('');
    }
    if (/^#[0-9a-f]{8}$/i.test(c)) return c.slice(0, 7);
    // named / rgb / hsl → resolve via a canvas
    try {
        const cv = document.createElement('canvas');
        cv.width = cv.height = 1;
        const ctx = cv.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#000';
            ctx.fillStyle = color;
            const resolved = ctx.fillStyle; // browser normalizes to #rrggbb or rgba()
            if (/^#[0-9a-f]{6}$/i.test(resolved)) return resolved;
            const rgb = resolved.match(/\d+/g);
            if (rgb && rgb.length >= 3) {
                return (
                    '#' +
                    rgb
                        .slice(0, 3)
                        .map((n) => Number(n).toString(16).padStart(2, '0'))
                        .join('')
                );
            }
        }
    } catch {
        /* ignore */
    }
    return '#000000';
}

// --- svg utilities -------------------------------------------------------
// Read width / height / viewBox from the markup.
function readDimensions(svg: string): { width: number; height: number } {
    const w = svg.match(/<svg[^>]*\swidth\s*=\s*["']?\s*([\d.]+)/i);
    const h = svg.match(/<svg[^>]*\sheight\s*=\s*["']?\s*([\d.]+)/i);
    if (w && h) return { width: Math.round(+w[1]), height: Math.round(+h[1]) };
    const vb = svg.match(/viewBox\s*=\s*["']\s*[\d.-]+\s+[\d.-]+\s+([\d.]+)\s+([\d.]+)/i);
    if (vb) return { width: Math.round(+vb[1]), height: Math.round(+vb[2]) };
    return { width: 400, height: 400 };
}

// Produce an SVG string with explicit width/height set to the requested size.
function withDimensions(svg: string, width: number, height: number): string {
    let out = svg;
    if (/<svg[^>]*\swidth\s*=/i.test(out)) {
        out = out.replace(/(<svg[^>]*?\swidth\s*=\s*["'])[^"']*(["'])/i, `$1${width}$2`);
    } else {
        out = out.replace(/<svg/i, `<svg width="${width}"`);
    }
    if (/<svg[^>]*\sheight\s*=/i.test(out)) {
        out = out.replace(/(<svg[^>]*?\sheight\s*=\s*["'])[^"']*(["'])/i, `$1${height}$2`);
    } else {
        out = out.replace(/<svg/i, `<svg height="${height}"`);
    }
    return out;
}

function encodeSvgUriComponent(svg: string): string {
    // collapse whitespace, then encode
    const cleaned = svg.replace(/\s+/g, ' ').trim().replace(/"/g, "'");
    return `data:image/svg+xml,${encodeURIComponent(cleaned)}`;
}

function encodeSvgMinified(svg: string): string {
    // URL-encode only the characters that must be escaped in a CSS url() — smallest usable form.
    const cleaned = svg
        .replace(/>\s+</g, '><')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/"/g, "'");
    const encoded = cleaned
        .replace(/%/g, '%25')
        .replace(/#/g, '%23')
        .replace(/</g, '%3C')
        .replace(/>/g, '%3E')
        .replace(/\{/g, '%7B')
        .replace(/\}/g, '%7D')
        .replace(/&/g, '%26');
    return `data:image/svg+xml,${encoded}`;
}

function encodeSvgBase64(svg: string): string {
    const cleaned = svg.replace(/\s+/g, ' ').trim();
    try {
        // handle unicode safely
        const b64 = btoa(unescape(encodeURIComponent(cleaned)));
        return `data:image/svg+xml;base64,${b64}`;
    } catch {
        return '';
    }
}

// =========================================================================

const SvgToPngPage: React.FC = () => {
    const [svgCode, setSvgCode] = useState<string>(DEFAULT_SVG);
    const [width, setWidth] = useState<number>(400);
    const [height, setHeight] = useState<number>(400);
    const [lockAspect, setLockAspect] = useState<boolean>(true);
    const [flipX, setFlipX] = useState(false);
    const [flipY, setFlipY] = useState(false);
    const [rotation, setRotation] = useState(0); // degrees, multiples of 90
    const [zoom, setZoom] = useState(100);
    const [bg, setBg] = useState<BgKind>('transparent');
    const [tab, setTab] = useState<RightTab>('preview');

    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [editingColor, setEditingColor] = useState<string | null>(null);
    const [showAllColors, setShowAllColors] = useState(false);
    const [renderError, setRenderError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const aspectRef = useRef<number>(1);

    // keep dimensions in sync when the code changes (only if user pastes fresh svg)
    useEffect(() => {
        const dims = readDimensions(svgCode);
        aspectRef.current = dims.height ? dims.width / dims.height : 1;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const colors = useMemo(() => extractColors(svgCode), [svgCode]);

    // validate svg for the preview
    const previewMarkup = useMemo(() => {
        if (!svgCode.trim()) {
            setRenderError(null);
            return '';
        }
        if (!/<svg[\s>]/i.test(svgCode)) {
            setRenderError('No <svg> element found. Paste valid SVG markup.');
            return '';
        }
        setRenderError(null);
        return svgCode;
    }, [svgCode]);

    const flash = (key: string) => {
        setCopiedKey(key);
        window.setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 2000);
    };

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const text = String(reader.result ?? '');
            setSvgCode(text);
            const dims = readDimensions(text);
            setWidth(dims.width);
            setHeight(dims.height);
            aspectRef.current = dims.height ? dims.width / dims.height : 1;
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleCopyCode = () => {
        if (!svgCode) return;
        navigator.clipboard.writeText(svgCode);
        flash('code');
    };

    const handleDownloadSvg = () => {
        if (!svgCode) return;
        const blob = new Blob([withDimensions(svgCode, width, height)], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'image.svg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const applyWidth = (val: number) => {
        const w = Math.max(1, Math.round(val || 0));
        const h = lockAspect ? Math.max(1, Math.round(w / (aspectRef.current || 1))) : height;
        setWidth(w);
        if (lockAspect) setHeight(h);
        // reflect the new size in the actual markup so the code + exports stay in sync
        setSvgCode((prev) => withDimensions(prev, w, h));
    };
    const applyHeight = (val: number) => {
        const h = Math.max(1, Math.round(val || 0));
        const w = lockAspect ? Math.max(1, Math.round(h * (aspectRef.current || 1))) : width;
        setHeight(h);
        if (lockAspect) setWidth(w);
        setSvgCode((prev) => withDimensions(prev, w, h));
    };

    // replace every occurrence of an exact color token in the markup
    const handleColorChange = (oldColor: string, newColor: string) => {
        setSvgCode((prev) => {
            // word-ish boundary: match the color token when preceded by =, :, quote, or whitespace
            const escaped = oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const re = new RegExp(`(["':=\\s])(${escaped})(["'\\s;>)])`, 'g');
            const once = prev.replace(re, `$1${newColor}$3`);
            if (once !== prev) return once;
            // fallback: plain global replace
            return prev.split(oldColor).join(newColor);
        });
    };

    // --- PNG export ---
    const exportPng = useCallback(
        (scale: number) => {
            const source = withDimensions(previewMarkup || svgCode, width, height);
            if (!source) return;
            const img = new Image();
            const swap = rotation % 180 !== 0;
            const outW = (swap ? height : width) * scale;
            const outH = (swap ? width : height) * scale;

            img.onload = () => {
                const canvas = canvasRef.current ?? document.createElement('canvas');
                canvas.width = outW;
                canvas.height = outH;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                ctx.clearRect(0, 0, outW, outH);
                if (bg === 'white') {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, outW, outH);
                } else if (bg === 'dark') {
                    ctx.fillStyle = '#0e1126';
                    ctx.fillRect(0, 0, outW, outH);
                }
                ctx.save();
                ctx.translate(outW / 2, outH / 2);
                if (rotation) ctx.rotate((rotation * Math.PI) / 180);
                ctx.scale(flipX ? -scale : scale, flipY ? -scale : scale);
                ctx.drawImage(img, -width / 2, -height / 2, width, height);
                ctx.restore();
                canvas.toBlob((blob) => {
                    if (!blob) return;
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `image@${scale}x.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 'image/png');
            };
            img.onerror = () => setRenderError('Could not render SVG to PNG. Check that the markup is valid.');
            img.src = encodeSvgBase64(source);
        },
        [previewMarkup, svgCode, width, height, rotation, flipX, flipY, bg]
    );

    const dataUris = useMemo(() => {
        const src = withDimensions(previewMarkup || svgCode, width, height);
        return {
            minified: encodeSvgMinified(src),
            base64: encodeSvgBase64(src),
            component: encodeSvgUriComponent(src),
        };
    }, [previewMarkup, svgCode, width, height]);

    const transformStyle: React.CSSProperties = {
        transform: `scale(${zoom / 100}) rotate(${rotation}deg) scaleX(${flipX ? -1 : 1}) scaleY(${flipY ? -1 : 1})`,
        transition: 'transform 0.2s ease',
    };

    const bgClass =
        bg === 'white'
            ? 'bg-white'
            : bg === 'dark'
              ? 'bg-ink-950'
              : bg === 'checker'
                ? 'bg-checker'
                : '';

    const visibleColors = showAllColors ? colors : colors.slice(0, 6);
    const hiddenCount = colors.length - visibleColors.length;

    const iconBtn =
        'inline-flex items-center justify-center w-9 h-9 rounded-lg text-ink-200 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-colors';

    return (
        <div>
            <PageHero
                eyebrow="SVG Viewer & Converter"
                title={
                    <>
                        The free <span className="gradient-text">SVG viewer</span>, editor &amp; SVG&nbsp;to&nbsp;PNG converter.
                    </>
                }
                subtitle="Paste SVG code or upload a file to preview it live, resize, flip, rotate, and recolor it, then export a crisp PNG at up to 4x — all in your browser, nothing uploaded."
            >
                <a href="#svg-tool" className="btn-primary">Open the SVG viewer</a>
                <a href="/tools/html-minifier" className="btn-secondary">Minify HTML</a>
            </PageHero>

            <section id="svg-tool" className="card overflow-hidden mb-16">
                <div className="flex flex-col lg:flex-row min-h-[640px]">
                    {/* ============ LEFT: editor ============ */}
                    <div className="flex flex-col lg:w-1/2 border-b lg:border-b-0 lg:border-r border-white/10 min-w-0">
                        {/* toolbar */}
                        <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-white/10 bg-ink-950/40">
                            <button
                                type="button"
                                onClick={() => setRotation((r) => (r + 90) % 360)}
                                className={iconBtn}
                                title="Rotate 90°"
                                aria-label="Rotate 90 degrees"
                            >
                                <ArrowUturnRightIcon className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setFlipX((v) => !v)}
                                className={`${iconBtn} ${flipX ? 'ring-1 ring-brand-400 text-brand-300' : ''}`}
                                title="Flip horizontal"
                                aria-label="Flip horizontal"
                            >
                                <span className="text-sm font-semibold">⇋</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFlipY((v) => !v)}
                                className={`${iconBtn} ${flipY ? 'ring-1 ring-brand-400 text-brand-300' : ''}`}
                                title="Flip vertical"
                                aria-label="Flip vertical"
                            >
                                <span className="text-sm font-semibold rotate-90 inline-block">⇋</span>
                            </button>

                            <div className="flex items-center gap-1.5 ml-1">
                                <input
                                    type="number"
                                    value={width}
                                    min={1}
                                    onChange={(e) => applyWidth(+e.target.value)}
                                    className="w-16 px-2 py-1.5 text-xs text-center font-mono bg-ink-950/80 border border-white/10 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
                                    aria-label="Width in pixels"
                                />
                                <button
                                    type="button"
                                    onClick={() => setLockAspect((v) => !v)}
                                    className={`text-xs px-1 ${lockAspect ? 'text-brand-300' : 'text-ink-400'}`}
                                    title={lockAspect ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
                                    aria-label="Toggle aspect ratio lock"
                                >
                                    {lockAspect ? '🔒' : '🔓'}
                                </button>
                                <input
                                    type="number"
                                    value={height}
                                    min={1}
                                    onChange={(e) => applyHeight(+e.target.value)}
                                    className="w-16 px-2 py-1.5 text-xs text-center font-mono bg-ink-950/80 border border-white/10 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
                                    aria-label="Height in pixels"
                                />
                                <span className="text-xs text-ink-400">px</span>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSvgCode('')}
                                className="ml-auto text-xs font-semibold text-ink-300 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                            >
                                Clear
                            </button>
                        </div>

                        {/* code editor */}
                        <div className="relative flex-grow min-h-[280px]">
                            <textarea
                                value={svgCode}
                                onChange={(e) => setSvgCode(e.target.value)}
                                spellCheck={false}
                                placeholder="Paste your SVG code here, or upload a .svg file…"
                                className="absolute inset-0 w-full h-full p-4 font-mono text-xs md:text-sm bg-ink-950/60 text-ink-100 border-0 focus:ring-0 focus:outline-none resize-none custom-scrollbar leading-relaxed"
                            />
                        </div>

                        {/* editor footer actions */}
                        <div className="flex items-center gap-2 px-4 py-3 border-t border-white/10 bg-ink-950/40">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-accent-500 rounded-lg hover:brightness-110 transition-all"
                            >
                                <UploadIcon className="w-4 h-4" /> Upload
                            </button>
                            <input ref={fileInputRef} type="file" accept=".svg,image/svg+xml" onChange={handleUpload} className="hidden" />
                            <button
                                type="button"
                                onClick={handleCopyCode}
                                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-ink-200 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors ml-auto"
                            >
                                {copiedKey === 'code' ? <CheckCircleIcon className="w-4 h-4 text-emerald-400" /> : <CopyIcon className="w-4 h-4" />}
                                {copiedKey === 'code' ? 'Copied' : 'Copy'}
                            </button>
                            <button
                                type="button"
                                onClick={handleDownloadSvg}
                                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-ink-200 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <DownloadIcon className="w-4 h-4" /> SVG
                            </button>
                        </div>
                    </div>

                    {/* ============ RIGHT: preview / data uri ============ */}
                    <div className="flex flex-col lg:w-1/2 min-w-0">
                        {/* tabs */}
                        <div className="flex items-center gap-1 px-4 py-3 border-b border-white/10 bg-ink-950/40">
                            <button
                                type="button"
                                onClick={() => setTab('preview')}
                                className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                                    tab === 'preview' ? 'bg-white/10 text-white' : 'text-ink-300 hover:text-white'
                                }`}
                            >
                                Preview
                            </button>
                            <button
                                type="button"
                                onClick={() => setTab('datauri')}
                                className={`ml-auto px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                                    tab === 'datauri' ? 'bg-white/10 text-white' : 'text-ink-300 hover:text-white'
                                }`}
                            >
                                Data URI
                            </button>
                        </div>

                        {tab === 'preview' ? (
                            <>
                                {/* preview canvas area */}
                                <div className="relative flex-grow min-h-[280px] flex items-center justify-center p-6 overflow-auto custom-scrollbar">
                                    <div className={`absolute inset-4 rounded-xl border border-dashed border-white/10 ${bgClass}`} />
                                    {renderError ? (
                                        <p className="relative text-sm text-amber-300 text-center max-w-xs">{renderError}</p>
                                    ) : previewMarkup ? (
                                        <div
                                            className="relative max-w-full max-h-full [&>svg]:max-w-full [&>svg]:max-h-[420px] [&>svg]:h-auto [&>svg]:w-auto"
                                            style={transformStyle}
                                            dangerouslySetInnerHTML={{ __html: previewMarkup }}
                                        />
                                    ) : (
                                        <p className="relative text-sm text-ink-400 text-center">Your SVG preview will appear here.</p>
                                    )}
                                </div>

                                {/* bottom bar: zoom + colors */}
                                <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-t border-white/10 bg-ink-950/40">
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setZoom((z) => Math.max(10, z - 10))}
                                            className={iconBtn}
                                            aria-label="Zoom out"
                                        >
                                            <span className="text-lg leading-none">−</span>
                                        </button>
                                        <span className="w-14 text-center text-xs font-mono text-ink-200 tabular-nums">{zoom}%</span>
                                        <button
                                            type="button"
                                            onClick={() => setZoom((z) => Math.min(400, z + 10))}
                                            className={iconBtn}
                                            aria-label="Zoom in"
                                        >
                                            <span className="text-lg leading-none">+</span>
                                        </button>
                                    </div>

                                    {/* background swatches */}
                                    <div className="flex items-center gap-1.5">
                                        {(['transparent', 'white', 'dark', 'checker'] as BgKind[]).map((k) => (
                                            <button
                                                key={k}
                                                type="button"
                                                onClick={() => setBg(k)}
                                                title={`${k} background`}
                                                aria-label={`${k} background`}
                                                className={`w-7 h-7 rounded-md border transition-all ${
                                                    bg === k ? 'ring-2 ring-brand-400 border-transparent' : 'border-white/20'
                                                } ${
                                                    k === 'white'
                                                        ? 'bg-white'
                                                        : k === 'dark'
                                                          ? 'bg-ink-950'
                                                          : k === 'checker'
                                                            ? 'bg-checker'
                                                            : 'bg-transparent'
                                                }`}
                                            />
                                        ))}
                                    </div>

                                    {/* color chips */}
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        {visibleColors.map((c) => (
                                            <div key={c.value} className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingColor((v) => (v === c.value ? null : c.value))}
                                                    title={`Edit ${c.value}`}
                                                    aria-label={`Edit color ${c.value}`}
                                                    className={`w-7 h-7 rounded-md border border-white/20 hover:scale-110 transition-transform ${
                                                        editingColor === c.value ? 'ring-2 ring-brand-400' : ''
                                                    }`}
                                                    style={{ backgroundColor: toHex(c.value) }}
                                                />
                                                {editingColor === c.value && (
                                                    <ColorEditor
                                                        color={c.value}
                                                        onChange={(next) => handleColorChange(c.value, next)}
                                                        onClose={() => setEditingColor(null)}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                        {hiddenCount > 0 && !showAllColors && (
                                            <button
                                                type="button"
                                                onClick={() => setShowAllColors(true)}
                                                className="w-7 h-7 rounded-md border border-white/20 text-ink-200 hover:bg-white/10 text-xs font-bold"
                                                title={`Show ${hiddenCount} more colors`}
                                                aria-label={`Show ${hiddenCount} more colors`}
                                            >
                                                …
                                            </button>
                                        )}
                                        {showAllColors && colors.length > 6 && (
                                            <button
                                                type="button"
                                                onClick={() => setShowAllColors(false)}
                                                className="text-xs text-ink-400 hover:text-white px-1"
                                            >
                                                less
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* export row */}
                                <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-t border-white/10 bg-ink-950/40">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs text-ink-400 mr-1">PNG</span>
                                        {[1, 2, 3, 4].map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => exportPng(s)}
                                                className="px-3 py-1.5 text-xs font-semibold text-ink-100 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-brand-400/40 transition-colors"
                                                title={`Download PNG at ${s}x (${width * s}×${height * s})`}
                                            >
                                                {s}x
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => exportPng(1)}
                                        className="ml-auto inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-accent-500 rounded-lg hover:brightness-110 transition-all"
                                    >
                                        <DownloadIcon className="w-4 h-4" /> Download PNG
                                    </button>
                                </div>
                            </>
                        ) : (
                            /* ============ DATA URI tab ============ */
                            <div className="flex-grow p-4 md:p-6 space-y-5 overflow-auto custom-scrollbar">
                                <DataUriBlock
                                    label="Minified Data URI"
                                    hint="URL-encoded — smallest, ideal for CSS background-image"
                                    value={dataUris.minified}
                                    copied={copiedKey === 'uri-min'}
                                    onCopy={() => {
                                        navigator.clipboard.writeText(dataUris.minified);
                                        flash('uri-min');
                                    }}
                                />
                                <DataUriBlock
                                    label="Base64"
                                    hint="Widely compatible across email and browsers"
                                    value={dataUris.base64}
                                    copied={copiedKey === 'uri-b64'}
                                    onCopy={() => {
                                        navigator.clipboard.writeText(dataUris.base64);
                                        flash('uri-b64');
                                    }}
                                />
                                <DataUriBlock
                                    label="encodeURIComponent"
                                    hint="Readable, safe for inline img src attributes"
                                    value={dataUris.component}
                                    copied={copiedKey === 'uri-cmp'}
                                    onCopy={() => {
                                        navigator.clipboard.writeText(dataUris.component);
                                        flash('uri-cmp');
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
                <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
            </section>

            {/* SEO prose */}
            <section className="card p-8 md:p-12 max-w-5xl mx-auto mb-12">
                <h2 className="section-title mb-5">A complete SVG viewer, editor, and SVG&nbsp;to&nbsp;PNG converter</h2>
                <div className="text-ink-300 leading-relaxed space-y-4 text-sm md:text-base">
                    <p>
                        SVG is the format of choice for logos, icons, and illustrations because it scales to any size without
                        losing a single pixel of sharpness. But working with raw SVG markup is awkward without the right tools.
                        This SVG viewer online gives you a live preview the instant you paste code or upload a file, so you can
                        see exactly what your graphic looks like — no guesswork, no local software.
                    </p>
                    <p>
                        As an SVG editor, it does the everyday jobs you actually need: resize with an optional locked aspect ratio,
                        flip horizontally or vertically, rotate in 90° steps, and recolor every fill and stroke through a dedicated
                        hex color picker. When you need a raster image, the built-in SVG to PNG converter renders your artwork onto a
                        canvas at 1x, 2x, 3x, or 4x, so you get a high-resolution PNG that drops cleanly into email, social posts, and
                        design tools that reject SVG. Need to inline the graphic instead? Grab a minified, base64, or
                        encodeURIComponent data URI in one click.
                    </p>
                </div>
            </section>

            <SeoFaq title="SVG Viewer & SVG to PNG FAQs" items={faqs} />
        </div>
    );
};

// ------------------------------------------------------------------------
// Dedicated color editor popover (NO native color input) — hex field + presets.
const PRESETS = ['#000000', '#ffffff', '#F97316', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280'];

const ColorEditor: React.FC<{ color: string; onChange: (c: string) => void; onClose: () => void }> = ({ color, onChange, onClose }) => {
    const [hex, setHex] = useState(toHex(color));
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onDoc = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, [onClose]);

    const commit = (val: string) => {
        let v = val.trim();
        if (v && !v.startsWith('#')) v = '#' + v;
        setHex(v);
        if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v)) onChange(v);
    };

    return (
        <div
            ref={ref}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 w-56 p-3 rounded-xl border border-white/10 bg-ink-900/95 backdrop-blur-xl shadow-2xl ring-1 ring-black/40"
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-ink-200">Edit color</span>
                <button type="button" onClick={onClose} className="text-ink-400 hover:text-white" aria-label="Close color editor">
                    <CloseIcon className="w-4 h-4" />
                </button>
            </div>
            <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-lg border border-white/20 flex-shrink-0" style={{ backgroundColor: hex }} />
                <div className="flex items-center flex-grow bg-ink-950/80 border border-white/10 rounded-lg focus-within:ring-2 focus-within:ring-brand-400">
                    <span className="pl-2 text-ink-400 text-sm">#</span>
                    <input
                        autoFocus
                        value={hex.replace(/^#/, '')}
                        onChange={(e) => commit(e.target.value)}
                        maxLength={6}
                        spellCheck={false}
                        className="w-full px-1 py-2 text-sm font-mono bg-transparent text-white focus:outline-none uppercase"
                        aria-label="Hex color value"
                    />
                </div>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
                {PRESETS.map((p) => (
                    <button
                        key={p}
                        type="button"
                        onClick={() => commit(p)}
                        className="w-full aspect-square rounded-md border border-white/20 hover:scale-110 transition-transform"
                        style={{ backgroundColor: p }}
                        title={p}
                        aria-label={`Set color to ${p}`}
                    />
                ))}
            </div>
        </div>
    );
};

// ------------------------------------------------------------------------
const DataUriBlock: React.FC<{ label: string; hint: string; value: string; copied: boolean; onCopy: () => void }> = ({
    label,
    hint,
    value,
    copied,
    onCopy,
}) => (
    <div>
        <div className="flex items-center justify-between mb-2">
            <div>
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs text-ink-400">{hint}</p>
            </div>
            <button
                type="button"
                onClick={onCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-accent-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
            >
                {copied ? <CheckCircleIcon className="w-4 h-4 text-emerald-400" /> : <CopyIcon className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
            </button>
        </div>
        <textarea
            readOnly
            value={value}
            onFocus={(e) => e.target.select()}
            className="w-full h-28 p-3 font-mono text-xs bg-ink-950/80 text-ink-200 border border-white/10 rounded-xl resize-none custom-scrollbar break-all focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
        />
    </div>
);

export default SvgToPngPage;
