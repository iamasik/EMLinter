import React, { useState, useMemo, useEffect } from 'react';
import { CopyIcon, SpinnerIcon } from '../Icons';
import PageHero from '../PageHero';
import SeoFaq from '../SeoFaq';

const DEFAULT_INNER_HTML = `<table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
        <td class="btxt" style="color:#ffffff; font-family:'Arial,sans-serif; font-size:32px; line-height:38px; font-style: italic; text-align:center;">
            Welcome to EMLinter
        </td>
    </tr>
</table>`;

const faqs = [
    {
        question: 'What is a bulletproof Outlook background and why do I need one?',
        answer: 'A bulletproof Outlook background is an email background that renders identically across every Microsoft Outlook version — including the Word-rendered Outlook 2007–2024 for Windows that ignores standard CSS background-image. The technique wraps your image in VML so Outlook reads it, while every other client uses the regular CSS path. Without it, your hero banner shows as a solid fallback color in 8–15% of B2B opens.',
    },
    {
        question: 'How does the html email background image trick work?',
        answer: 'You set both a CSS background and a VML <v:rect> with type="frame" that points to the same image. Modern clients (Gmail, Apple Mail, Yahoo) render the CSS; Outlook for Windows reads the VML inside <!--[if gte mso 9]> conditional comments. Our bulletproof background generator builds both halves automatically so you do not have to memorize VML syntax.',
    },
    {
        question: 'Does this work for both full-width and contained backgrounds?',
        answer: 'Yes. Set the width to 600 (or your content width) for a contained background. For a full-width hero, set width to 700+ and let your outer container clip — the VML still renders correctly. The generator handles both layouts.',
    },
    {
        question: 'Can I overlay text or a CTA on the email background image?',
        answer: 'Yes — the Inner HTML Content field is exactly for that. Drop in any HTML, including text, buttons, or nested tables. The VML <v:textbox> wraps the same content for Outlook so overlays appear in every client.',
    },
    {
        question: 'What image format and size should I use for an email background?',
        answer: 'JPG for photos (smaller file size), PNG for graphics with transparency or sharp edges. Keep the file under 1MB and host on a reliable CDN — Outlook will not load images that take more than a few seconds. Use the Auto-height from image button to match the VML rectangle to the natural aspect ratio.',
    },
    {
        question: 'Will the bulletproof background still render if images are blocked?',
        answer: 'When images are blocked, the fallback background color shows in every client. That is why our generator includes a "Fallback background color" field — choose a brand color close to your image\'s dominant tone so the email still feels intentional when images do not load.',
    },
];

const OutlookBackgroundGeneratorPage: React.FC = () => {
    const [backgroundColor, setBackgroundColor] = useState('#1b1d3d');
    const [backgroundImageUrl, setBackgroundImageUrl] = useState('https://mcusercontent.com/d626ff05627d1d76774c4c926/images/3f1a206a-5f93-4a1d-a9c8-04f7f63f5383.jpg');
    const [vmlImageUrl, setVmlImageUrl] = useState('https://mcusercontent.com/d626ff05627d1d76774c4c926/images/3f1a206a-5f93-4a1d-a9c8-04f7f63f5383.jpg');
    const [useSameUrl, setUseSameUrl] = useState(true);
    const [width, setWidth] = useState(600);
    const [height, setHeight] = useState(243);
    const [sidePadding, setSidePadding] = useState(30);
    const [innerHtml, setInnerHtml] = useState(DEFAULT_INNER_HTML);
    const [isCopied, setIsCopied] = useState(false);
    const [isCalculatingHeight, setIsCalculatingHeight] = useState(false);

    useEffect(() => {
        if (useSameUrl) setVmlImageUrl(backgroundImageUrl);
    }, [backgroundImageUrl, useSameUrl]);

    const generatedCode = useMemo(() => {
        const finalVmlUrl = vmlImageUrl || backgroundImageUrl;
        return `<table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
        <td bgcolor="${backgroundColor}" background="${backgroundImageUrl}" valign="middle" style="background-color: ${backgroundColor}; background: url('${backgroundImageUrl}'); background-repeat: no-repeat; background-position: center; background-size: cover;">
            <!--[if gte mso 9]>
            <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:${width}px; height: ${height}px;">
            <v:fill type="frame" src="${finalVmlUrl}" color="${backgroundColor}" />
            <v:textbox inset="0,0,0,0">
            <![endif]-->
            <div>
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                        <td class="content-spacing" height="${height}" width="${sidePadding}" style="font-size:0pt; line-height:0pt; text-align:left;"></td>
                        <td valign="middle">
                            ${innerHtml.trim()}
                        </td>
                        <td class="content-spacing" height="${height}" width="${sidePadding}" style="font-size:0pt; line-height:0pt; text-align:left;"></td>
                    </tr>
                </table>
            </div>
            <!--[if gte mso 9]>
            </v:textbox>
            </v:rect>
            <![endif]-->
        </td>
    </tr>
</table>`;
    }, [backgroundColor, backgroundImageUrl, vmlImageUrl, width, height, sidePadding, innerHtml]);

    const handleAutoHeight = () => {
        if (!backgroundImageUrl || !width || width <= 0) {
            alert('Please provide a valid background image URL and a positive width first.');
            return;
        }
        setIsCalculatingHeight(true);
        const img = new Image();
        img.onload = () => {
            if (img.naturalWidth > 0) {
                const aspectRatio = img.naturalHeight / img.naturalWidth;
                setHeight(Math.round(width * aspectRatio));
            }
            setIsCalculatingHeight(false);
        };
        img.onerror = () => {
            alert("Could not load the image to calculate height. Please check the URL.");
            setIsCalculatingHeight(false);
        };
        img.src = backgroundImageUrl;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedCode);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div>
            <PageHero
                eyebrow="Bulletproof Outlook Background Generator"
                title={
                    <>
                        Generate a <span className="gradient-text">bulletproof Outlook background</span> in seconds.
                    </>
                }
                subtitle="Free generator for bulletproof email backgrounds with VML fallback. Drop in an html email background image, get production-ready code that renders identically in Outlook 2007–2024, Gmail, Apple Mail, and every other client."
            >
                <a href="#preview" className="btn-primary">Generate code</a>
                <a href="/solutions/outlook-button-generator" className="btn-secondary">Need a button instead?</a>
            </PageHero>

            <section id="preview" className="card p-6 md:p-8 mb-6">
                <h3 className="text-sm font-semibold text-ink-200 mb-4 text-center uppercase tracking-wider">Live preview</h3>
                <div className="bg-white p-4 rounded-xl flex items-center justify-center min-h-[200px] overflow-x-auto custom-scrollbar">
                    <div dangerouslySetInnerHTML={{ __html: generatedCode }} style={{ width: `${width}px`, flexShrink: 0 }} />
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-16">
                <div className="lg:col-span-3 card p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-ink-200 mb-1.5">Fallback background color</label>
                        <div className="flex items-center bg-ink-950/80 border border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-400">
                            <input type="color" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} className="w-10 h-10 p-1 bg-transparent border-0 cursor-pointer" />
                            <input type="text" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} className="w-full px-3 py-2 text-sm text-white bg-transparent focus:outline-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-ink-200 mb-1.5">HTML email background image URL</label>
                        <input type="text" value={backgroundImageUrl} onChange={e => setBackgroundImageUrl(e.target.value)} className="w-full px-3 py-2 text-sm text-white bg-ink-950/80 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-400 focus:outline-none" />
                        <p className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-ink-300 mt-2">
                            <strong>Tip:</strong> Direct uploads are disabled for privacy. Host on a reliable CDN like{' '}
                            <a href="https://imgbb.com/" target="_blank" rel="noopener noreferrer" className="text-brand-300 underline hover:text-brand-200">ImgBB</a> or{' '}
                            <a href="https://postimages.org/" target="_blank" rel="noopener noreferrer" className="text-brand-300 underline hover:text-brand-200">Postimages</a> and paste the direct URL.
                        </p>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <input id="same-url" type="checkbox" checked={useSameUrl} onChange={e => setUseSameUrl(e.target.checked)} className="h-4 w-4 rounded border-white/20 text-brand-500 focus:ring-brand-400 bg-ink-900" />
                            <label htmlFor="same-url" className="text-sm font-medium text-ink-200">Use same image URL for VML fallback</label>
                        </div>
                        <input type="text" value={vmlImageUrl} onChange={e => setVmlImageUrl(e.target.value)} disabled={useSameUrl} className="w-full px-3 py-2 text-sm text-white bg-ink-950/80 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-400 focus:outline-none disabled:opacity-50" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-ink-200 mb-1.5">Width</label>
                            <div className="relative">
                                <input type="number" value={width} onChange={e => setWidth(parseInt(e.target.value, 10) || 0)} className="w-full px-3 py-2 text-sm text-white bg-ink-950/80 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-400 focus:outline-none" />
                                <span className="absolute inset-y-0 right-3 flex items-center text-ink-400 text-xs">px</span>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label htmlFor="height-input" className="text-sm font-medium text-ink-200">Height</label>
                                <button onClick={handleAutoHeight} disabled={isCalculatingHeight || !backgroundImageUrl || !width || width <= 0} className="text-xs text-accent-300 hover:text-accent-200 disabled:opacity-50 flex items-center gap-1">
                                    {isCalculatingHeight ? <><SpinnerIcon className="w-3 h-3 animate-spin" /> Calculating…</> : 'Auto from image'}
                                </button>
                            </div>
                            <div className="relative">
                                <input id="height-input" type="number" value={height} onChange={e => setHeight(parseInt(e.target.value, 10) || 0)} className="w-full px-3 py-2 text-sm text-white bg-ink-950/80 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-400 focus:outline-none" />
                                <span className="absolute inset-y-0 right-3 flex items-center text-ink-400 text-xs">px</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-ink-200 mb-1.5">Side Padding</label>
                            <div className="relative">
                                <input type="number" value={sidePadding} onChange={e => setSidePadding(parseInt(e.target.value, 10) || 0)} className="w-full px-3 py-2 text-sm text-white bg-ink-950/80 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-400 focus:outline-none" />
                                <span className="absolute inset-y-0 right-3 flex items-center text-ink-400 text-xs">px</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-ink-200 mb-1.5">Inner HTML content</label>
                        <textarea value={innerHtml} onChange={e => setInnerHtml(e.target.value)} className="w-full h-32 p-3 font-mono text-xs bg-ink-950/80 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-400 focus:outline-none transition resize-y custom-scrollbar" />
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="card p-6 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-semibold text-ink-200 uppercase tracking-wider">Generated code</h3>
                            <button onClick={handleCopy} className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-ink-200 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                                <CopyIcon className="w-4 h-4" /> {isCopied ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                        <pre className="bg-ink-950/80 border border-white/10 p-3 rounded-xl text-xs text-ink-200 font-mono overflow-x-auto flex-grow min-h-[300px] custom-scrollbar">
                            <code>{generatedCode}</code>
                        </pre>
                    </div>
                </div>
            </div>

            <section className="card p-8 md:p-12 max-w-5xl mx-auto mb-12">
                <h2 className="section-title mb-5">Why Outlook needs a bulletproof background, and the rest of the web doesn't</h2>
                <div className="text-ink-300 leading-relaxed space-y-4 text-sm md:text-base">
                    <p>
                        Every modern email client — Gmail, Apple Mail, Yahoo Mail, Samsung Mail, ProtonMail — uses a real browser engine and supports CSS <code>background-image</code> on a <code>&lt;td&gt;</code>. Then there's Outlook for Windows. Microsoft Outlook 2007 through Outlook 2024 (Windows) uses the <strong className="text-white">Microsoft Word rendering engine</strong> instead of a browser engine, and it flat-out ignores CSS backgrounds. Your beautifully designed hero banner shows up as a solid fallback color.
                    </p>
                    <p>
                        The fix is a 1999-era Microsoft format called <strong className="text-white">VML</strong> (Vector Markup Language). Wrapped inside <code>&lt;!--[if gte mso 9]&gt;</code> conditional comments, a <code>&lt;v:rect&gt;</code> with <code>&lt;v:fill type="frame"&gt;</code> tells Outlook "render this background image here, scaled to frame." Everything else ignores the conditional block. One HTML file, perfect rendering everywhere.
                    </p>
                    <p>
                        This generator builds the bulletproof background email markup for you. You set the URL, dimensions, fallback color, and optional inner content; we emit the CSS + VML hybrid. Copy, paste, send.
                    </p>
                </div>
            </section>

            <SeoFaq title="Bulletproof Outlook Background FAQs" items={faqs} />
        </div>
    );
};

export default OutlookBackgroundGeneratorPage;
