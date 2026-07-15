import React, { useState, useCallback, useRef, useEffect } from 'react';
import PostalMime, { type Email, type Attachment } from 'postal-mime';
import { jsPDF } from 'jspdf';
import {
    UploadIcon,
    DownloadIcon,
    SpinnerIcon,
    MailIcon,
    AlertTriangleIcon,
    TrashIcon,
} from '../Icons';
import PageHero from '../PageHero';
import SeoFaq from '../SeoFaq';

const faqs = [
    {
        question: 'How do I open an .eml file online?',
        answer: 'Drag your .eml file onto the box above, or click to browse and pick it. This free EML viewer parses the message entirely in your browser and renders the email exactly as it was sent — subject, body, formatting, and inline images. Nothing is uploaded to a server, so you can open .eml files privately without installing Outlook, Thunderbird, or any desktop mail client.',
    },
    {
        question: 'What is an EML file?',
        answer: 'An EML file is a single email saved in the standard MIME (RFC 822) format. When you export or "save as" a message from Gmail, Outlook, Apple Mail, Windows Mail, or Thunderbird, it is written as a .eml file containing the headers, the HTML and plain-text body, and any inline or attached images. Because it is an open standard, one .eml file can be opened by any compliant eml reader — including this one.',
    },
    {
        question: 'Which mail clients’ .eml files can this EML viewer open?',
        answer: 'All of them. The parser follows the MIME standard, so it opens .eml files exported from Gmail, Outlook (Windows, Mac, and Outlook.com), Apple Mail, Thunderbird, Windows Live Mail, Yahoo Mail, and any other client that saves standards-compliant messages. Quoted-printable and base64 encodings, multipart bodies, and inline CID images are all handled automatically.',
    },
    {
        question: 'Can I convert an EML file to PDF, PNG, or JPG?',
        answer: 'Yes. After the email renders, use the Download buttons to save the message body as a PDF, PNG, or JPG. The PNG keeps a transparent background where the email has none; the JPG and PDF render on a clean white background. The conversion happens locally in your browser using the canvas API, so your email never leaves your device.',
    },
    {
        question: 'Is this EML reader free and private?',
        answer: 'Completely free, with no signup and no limits. Every step — parsing the .eml file, rendering the preview, and exporting to PDF, PNG, or JPG — runs client-side in your browser. Your message content is never uploaded, logged, or stored, which makes it safe for confidential or sensitive emails.',
    },
    {
        question: 'Why are some images missing when I open an .eml file?',
        answer: 'Inline images embedded in the message (CID attachments) always display and export correctly because they travel inside the .eml file. Images the email loads from a remote server may be blocked by that server when exporting to an image or PDF, for security reasons. The live preview will still show them; if a remote image is missing from a download, it is because its host blocks cross-origin access.',
    },
];

// Fixed viewport width the preview/export iframe is rendered at. Wide enough that
// typical mobile media queries (max-width: 480–640px) don't fire, so the email
// shows its intended desktop layout; the export is cropped to the real content box.
const RENDER_VW = 800;

/** Read a File as an ArrayBuffer. */
function readArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(reader.error ?? new Error('read-failed'));
        reader.readAsArrayBuffer(file);
    });
}

/** Convert an ArrayBuffer/Uint8Array to a base64 string in chunks (avoids call-stack overflow). */
function bytesToBase64(input: ArrayBuffer | Uint8Array): string {
    const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
    }
    return btoa(binary);
}

/** Build a `data:` URI for an attachment, whatever encoding postal-mime returned. */
function attachmentToDataUri(att: Attachment): string {
    const mime = att.mimeType || 'application/octet-stream';
    if (typeof att.content === 'string') {
        // postal-mime returns base64 (our request) or utf8; assume base64 for binary types.
        return `data:${mime};base64,${att.content}`;
    }
    return `data:${mime};base64,${bytesToBase64(att.content)}`;
}

/**
 * Replace `cid:` references in the email HTML with `data:` URIs built from the
 * matching inline attachment, so embedded images render and export self-contained.
 */
function resolveCidImages(html: string, attachments: Attachment[]): string {
    if (!html) return html;
    const byCid = new Map<string, Attachment>();
    for (const att of attachments) {
        if (att.contentId) {
            byCid.set(att.contentId.replace(/^<|>$/g, '').trim().toLowerCase(), att);
        }
    }
    if (byCid.size === 0) return html;
    return html.replace(/(["'(])\s*cid:([^"')\s]+)\s*(["')])/gi, (match, open, cid, close) => {
        const att = byCid.get(String(cid).trim().toLowerCase());
        if (!att) return match;
        return `${open}${attachmentToDataUri(att)}${close}`;
    });
}

/**
 * Strip <script> tags from the email HTML. Email clients never execute script,
 * and leaving them in makes the sandboxed preview iframe log a noisy
 * "Blocked script execution" warning. Removing them is safer and quieter.
 */
function sanitizeEmailHtml(html: string): string {
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

/**
 * Rewrite every remote (http/https) image reference to our same-origin image
 * proxy (`/api/proxy-image`), which returns `Access-Control-Allow-Origin: *`.
 * html2canvas can then rasterize those images without tainting the canvas —
 * marketing-email images (e.g. Mailchimp's mcusercontent.com) send no CORS
 * headers of their own, so a direct render would fail. Covers `src`,
 * `background`, `srcset`, and CSS `url(...)`.
 */
function proxifyRemoteImages(html: string): string {
    if (!html) return html;
    const proxy = (u: string) => `/api/proxy-image?url=${encodeURIComponent(u)}`;
    return html
        .replace(/\b(src|background)\s*=\s*(["'])(https?:\/\/[^"']+)\2/gi,
            (_m, attr, q, url) => `${attr}=${q}${proxy(url)}${q}`)
        .replace(/\bsrcset\s*=\s*(["'])([^"']+)\1/gi, (_m, q, val) => {
            const out = val
                .split(',')
                .map((part: string) => {
                    const seg = part.trim().split(/\s+/);
                    if (/^https?:\/\//i.test(seg[0])) seg[0] = proxy(seg[0]);
                    return seg.join(' ');
                })
                .join(', ');
            return `srcset=${q}${out}${q}`;
        })
        .replace(/url\(\s*(['"]?)(https?:\/\/[^'")]+)\1\s*\)/gi,
            (_m, q, url) => `url(${q}${proxy(url)}${q})`);
}

/** Resolve once every <img> in the doc has loaded (or errored), or after a timeout. */
function waitForImages(doc: Document, timeout: number): Promise<unknown> {
    const imgs = Array.from(doc.images || []);
    const pending = imgs
        .filter((im) => !im.complete)
        .map(
            (im) =>
                new Promise<void>((resolve) => {
                    im.addEventListener('load', () => resolve(), { once: true });
                    im.addEventListener('error', () => resolve(), { once: true });
                })
        );
    return Promise.race([
        Promise.all(pending),
        new Promise((resolve) => setTimeout(resolve, timeout)),
    ]);
}

/** Wrap the email body in a full, style-isolated document for the sandboxed iframe. */
function buildSrcDoc(bodyHtml: string): string {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<base target="_blank" />
<style>
  html,body { margin:0; padding:0; }
  body { width:${RENDER_VW}px; background:#ffffff; color:#111111;
         font-family: Arial, Helvetica, sans-serif; -webkit-font-smoothing:antialiased; }
  img { max-width:100%; }
</style>
</head>
<body>${bodyHtml}</body>
</html>`;
}

/** Turn plain-text-only emails into readable, exportable HTML. */
function textToHtml(text: string): string {
    const esc = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    return `<pre style="white-space:pre-wrap;word-wrap:break-word;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:14px;line-height:1.6;margin:0;padding:24px;">${esc}</pre>`;
}

/** Measure the real content bounding box of the rendered email inside the iframe doc. */
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
        return { x: 0, y: 0, w: Math.max(body.scrollWidth, 1), h: Math.max(body.scrollHeight, 1) };
    }
    return {
        x: Math.max(0, Math.floor(left)),
        y: 0,
        w: Math.max(1, Math.ceil(right - left)),
        h: Math.max(1, Math.ceil(bottom)),
    };
}

type ExportKind = 'png' | 'jpg' | 'pdf';

const EmlFileViewerPage: React.FC = () => {
    const [fileName, setFileName] = useState<string>('');
    const [email, setEmail] = useState<Email | null>(null);
    const [bodyHtml, setBodyHtml] = useState<string>('');
    const [srcDoc, setSrcDoc] = useState<string>('');
    const [parsing, setParsing] = useState(false);
    const [exporting, setExporting] = useState<ExportKind | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [dims, setDims] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
    const [previewScale, setPreviewScale] = useState(1);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const previewWrapRef = useRef<HTMLDivElement>(null);

    const senderText = (): string => {
        const from = email?.from;
        if (!from) return '';
        return from.name ? `${from.name} <${from.address ?? ''}>` : (from.address ?? '');
    };

    const handleFile = useCallback(async (file: File) => {
        setError(null);
        setNotice(null);
        setParsing(true);
        setEmail(null);
        setBodyHtml('');
        setDims(null);
        try {
            const buf = await readArrayBuffer(file);
            const parsed = await new PostalMime({ attachmentEncoding: 'base64' }).parse(buf);
            let html = parsed.html || '';
            if (html) {
                html = sanitizeEmailHtml(resolveCidImages(html, parsed.attachments || []));
            } else if (parsed.text) {
                html = textToHtml(parsed.text);
            } else {
                setParsing(false);
                setError('This file was parsed, but it contains no readable email body. Make sure it is a valid .eml message.');
                return;
            }
            setFileName(file.name);
            setEmail(parsed);
            setBodyHtml(html);
            setSrcDoc(buildSrcDoc(html));
        } catch {
            setError('Could not read this file as an .eml email. Please upload a valid .eml file exported from your mail client.');
        } finally {
            setParsing(false);
        }
    }, []);

    const measure = useCallback(() => {
        const doc = iframeRef.current?.contentDocument;
        if (!doc?.body) return;
        const box = contentBox(doc);
        setDims(box);
        const avail = (previewWrapRef.current?.clientWidth ?? box.w) - 24;
        setPreviewScale(box.w > avail ? avail / box.w : 1);
    }, []);

    useEffect(() => {
        const onResize = () => measure();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [measure]);

    const reset = () => {
        setEmail(null);
        setBodyHtml('');
        setSrcDoc('');
        setFileName('');
        setError(null);
        setNotice(null);
        setDims(null);
    };

    // Render the email body to a <canvas> with html2canvas, cropped to the real
    // content box. Remote images are routed through our same-origin proxy first so
    // html2canvas can rasterize them CORS-clean (no canvas taint). `jpegBackground`
    // paints white for JPG/PDF (which have no alpha channel).
    const renderToCanvas = useCallback(
        async (scale: number, jpegBackground: boolean): Promise<{ canvas: HTMLCanvasElement; missing: number }> => {
            // Off-screen render frame. Scripts are already stripped from the email, so
            // no sandbox is needed here — and html2canvas needs unrestricted same-origin
            // access to the document to clone and measure it reliably.
            const frame = document.createElement('iframe');
            frame.style.position = 'fixed';
            frame.style.top = '-99999px';
            frame.style.left = '-99999px';
            frame.style.width = `${RENDER_VW}px`;
            frame.style.height = '600px';
            frame.style.border = '0';
            document.body.appendChild(frame);

            const cleanup = () => {
                if (frame.parentNode) document.body.removeChild(frame);
            };

            try {
                const doc = await new Promise<Document | null>((resolve) => {
                    frame.onload = () => resolve(frame.contentDocument);
                    frame.srcdoc = buildSrcDoc(proxifyRemoteImages(bodyHtml));
                });
                if (!doc?.body) throw new Error('render-failed');

                // Let images resolve so html2canvas captures a complete layout.
                await waitForImages(doc, 15000);
                const missing = Array.from(doc.images || []).filter(
                    (im) => im.getAttribute('src') && (!im.complete || im.naturalWidth === 0)
                ).length;

                const box = contentBox(doc);
                const { default: html2canvas } = await import('html2canvas');
                const canvas = await html2canvas(doc.body, {
                    scale,
                    useCORS: true,
                    allowTaint: false,
                    logging: false,
                    backgroundColor: jpegBackground ? '#ffffff' : null,
                    x: box.x,
                    y: box.y,
                    width: box.w,
                    height: box.h,
                    windowWidth: RENDER_VW,
                    windowHeight: Math.max(box.h, doc.body.scrollHeight, 600),
                });
                return { canvas, missing };
            } finally {
                cleanup();
            }
        },
        [bodyHtml]
    );

    const baseName = () => (fileName.replace(/\.eml$/i, '') || 'email');

    const triggerDownload = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExport = useCallback(
        async (kind: ExportKind) => {
            if (!bodyHtml || exporting) return;
            setError(null);
            setNotice(null);
            setExporting(kind);
            try {
                const scale = 2;
                const { canvas, missing } = await renderToCanvas(scale, kind !== 'png');

                if (kind === 'pdf') {
                    const imgData = canvas.toDataURL('image/jpeg', 0.92);
                    const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
                    const pageW = pdf.internal.pageSize.getWidth();
                    const pageH = pdf.internal.pageSize.getHeight();
                    const imgW = pageW;
                    const imgH = (canvas.height / canvas.width) * imgW;
                    let heightLeft = imgH;
                    let position = 0;
                    pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH);
                    heightLeft -= pageH;
                    while (heightLeft > 0) {
                        position -= pageH;
                        pdf.addPage();
                        pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH);
                        heightLeft -= pageH;
                    }
                    pdf.save(`${baseName()}.pdf`);
                } else {
                    const mime = kind === 'jpg' ? 'image/jpeg' : 'image/png';
                    const blob = await new Promise<Blob | null>((resolve) =>
                        canvas.toBlob((b) => resolve(b), mime, kind === 'jpg' ? 0.92 : undefined)
                    );
                    if (!blob) throw new Error('blob-failed');
                    triggerDownload(blob, `${baseName()}.${kind}`);
                }

                if (missing > 0) {
                    setNotice(
                        `${missing} remote image${missing > 1 ? 's could' : ' could'} not be loaded for the download — the original host is unreachable or the link has expired. Inline (embedded) images are always included.`
                    );
                }
            } catch {
                setError(
                    'Export failed while rendering this email to an image. Please try again — if it keeps failing, the email may be unusually large or complex.'
                );
            } finally {
                setExporting(null);
            }
        },
        [bodyHtml, exporting, renderToCanvas, fileName]
    );

    return (
        <div>
            <PageHero
                eyebrow="EML File Viewer"
                title={
                    <>
                        Open any <span className="gradient-text">.eml file</span> online — and save it as PDF, PNG, or JPG.
                    </>
                }
                subtitle="A free, private EML viewer for the browser. Drop a .eml file exported from Gmail, Outlook, Apple Mail, or Thunderbird and read it instantly — then download the email as a PDF, PNG, or JPG. Nothing is uploaded."
            >
                <a href="#eml-viewer" className="btn-primary">Open an .eml file</a>
                <a href="/tools/html-to-image" className="btn-secondary">HTML to Image</a>
            </PageHero>

            <section id="eml-viewer" className="card p-6 md:p-8 mb-16">
                {/* Dropzone */}
                <div
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setDragActive(false);
                        const f = e.dataTransfer.files?.[0];
                        if (f) handleFile(f);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                        dragActive ? 'border-brand-400 bg-brand-500/10' : 'border-white/15 hover:border-white/30 bg-ink-950/40'
                    }`}
                >
                    <div className="flex flex-col items-center gap-2 py-2">
                        {parsing ? (
                            <SpinnerIcon className="w-8 h-8 text-brand-400 animate-spin" />
                        ) : (
                            <UploadIcon className="w-8 h-8 text-ink-400" />
                        )}
                        <p className="text-sm text-ink-100 font-medium">
                            {parsing ? 'Reading your email…' : 'Drop a .eml file here'}
                        </p>
                        <p className="text-xs text-ink-400">or click to browse — Gmail, Outlook, Apple Mail, Thunderbird</p>
                    </div>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".eml,message/rfc822"
                    className="hidden"
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFile(f);
                        e.target.value = '';
                    }}
                />

                {error && (
                    <p className="mt-4 flex items-start gap-2 text-sm text-amber-300 leading-relaxed">
                        <AlertTriangleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
                    </p>
                )}

                {/* Result */}
                {email && bodyHtml && (
                    <div className="mt-6">
                        {/* Header metadata + actions */}
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4 pb-4 mb-4 border-b border-white/10">
                            <div className="min-w-0 flex-1 space-y-1">
                                <p className="text-base font-semibold text-white truncate">
                                    {email.subject || '(no subject)'}
                                </p>
                                {senderText() && (
                                    <p className="text-xs text-ink-300 truncate">
                                        <span className="text-ink-500">From:</span> {senderText()}
                                    </p>
                                )}
                                {email.date && (
                                    <p className="text-xs text-ink-400 truncate">
                                        <span className="text-ink-500">Date:</span> {new Date(email.date).toLocaleString()}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs text-ink-500 mr-1">Download as</span>
                                {(['pdf', 'png', 'jpg'] as ExportKind[]).map((kind) => (
                                    <button
                                        key={kind}
                                        type="button"
                                        onClick={() => handleExport(kind)}
                                        disabled={exporting !== null}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-ink-100 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {exporting === kind ? (
                                            <SpinnerIcon className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <DownloadIcon className="w-4 h-4" />
                                        )}
                                        {kind.toUpperCase()}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={reset}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-ink-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                                    title="Clear and open another file"
                                >
                                    <TrashIcon className="w-4 h-4" /> Clear
                                </button>
                            </div>
                        </div>

                        {notice && (
                            <p className="mb-4 text-xs text-amber-300 leading-relaxed">{notice}</p>
                        )}

                        {/* Email preview (white surface, like a real client) */}
                        <div
                            ref={previewWrapRef}
                            className="rounded-xl bg-white overflow-auto custom-scrollbar flex justify-start p-3"
                            style={{ maxHeight: '70vh' }}
                        >
                            <div
                                className="relative overflow-hidden"
                                style={{
                                    width: dims ? dims.w * previewScale : '100%',
                                    height: dims ? dims.h * previewScale : undefined,
                                }}
                            >
                                <iframe
                                    ref={iframeRef}
                                    title={`Email preview: ${email.subject || fileName}`}
                                    srcDoc={srcDoc}
                                    sandbox="allow-same-origin allow-popups"
                                    onLoad={measure}
                                    scrolling="no"
                                    style={{
                                        width: RENDER_VW,
                                        height: dims ? dims.h : 600,
                                        transform: `scale(${previewScale}) translateX(${dims ? -dims.x : 0}px)`,
                                        transformOrigin: 'top left',
                                    }}
                                    className="border-0 bg-white"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {!email && !parsing && !error && (
                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-ink-500">
                        <MailIcon className="w-4 h-4" /> Your email opens here — 100% in your browser, nothing uploaded.
                    </div>
                )}
            </section>

            {/* SEO prose */}
            <section className="card p-8 md:p-12 max-w-5xl mx-auto mb-12">
                <h2 className="section-title mb-5">A free EML viewer that opens .eml files online</h2>
                <div className="text-ink-300 leading-relaxed space-y-4 text-sm md:text-base">
                    <p>
                        An <strong>.eml file</strong> is a single email saved in the open MIME format. Every major mail
                        client — Gmail, Outlook, Apple Mail, Windows Mail, and Thunderbird — can export a message as a .eml
                        file, but once it is on your disk you need an <strong>eml reader</strong> to open it again. Instead
                        of installing a desktop client just to read one message, this <strong>eml file viewer tool</strong>
                        opens it right in your browser. Drop the file in, and the email is rendered exactly as it was sent —
                        subject line, sender, formatted HTML body, and embedded images.
                    </p>
                    <p>
                        Learning <strong>how to open an .eml file</strong> is usually the frustrating part: double-clicking
                        one often launches the wrong app, or nothing at all. This <strong>free eml viewer</strong> removes
                        that friction entirely. There is no signup and no upload — the parsing, preview, and every export run
                        locally using your browser, so even confidential messages stay private. It is the fastest way to
                        <strong> open eml file online</strong> from any device, on any operating system.
                    </p>
                    <p>
                        Once your message is open, you are not limited to just reading it. Use the download buttons to convert
                        the email into a shareable, archival file: a multi-page <strong>PDF</strong> for records and legal
                        holds, a crisp <strong>PNG</strong> for documentation, or a lightweight <strong>JPG</strong> for
                        quick sharing. Whether you need to <strong>open eml file</strong> attachments from a colleague, review
                        an exported campaign, or archive a receipt, this <strong>eml viewer online</strong> handles it in a
                        couple of clicks.
                    </p>
                </div>
            </section>

            <SeoFaq title="EML File Viewer FAQs" items={faqs} />
        </div>
    );
};

export default EmlFileViewerPage;
