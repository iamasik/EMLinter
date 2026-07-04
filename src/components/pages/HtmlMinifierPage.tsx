import React, { useState, useCallback } from 'react';
import { UploadIcon, CopyIcon, DownloadIcon, SpinnerIcon, WandIcon, CodeIcon } from '../Icons';
import UploadHtmlModal from '../modals/UploadHtmlModal';
import { minifyHtml } from '../../services/htmlMinifier';
import type { MinifyOptions } from '../../types';
import PageHero from '../PageHero';
import SeoFaq from '../SeoFaq';

const faqs = [
    {
        question: 'What is an HTML email minifier and why do I need one?',
        answer: 'An HTML email minifier compresses your email\'s HTML by removing comments, line breaks, and unnecessary whitespace — without changing how the email renders. You need one because Gmail clips any email over 102KB, and a typical hand-coded template can easily exceed that. Minifying brings you under the limit and improves load time on mobile.',
    },
    {
        question: 'Will minifying HTML break my email rendering?',
        answer: 'No — a properly built HTML email minifier strips only what is safe (comments, redundant whitespace, line breaks) and preserves the structural HTML, conditional Outlook comments, inline styles, and table layout. Our tool is tuned specifically for email HTML, so VML blocks and MSO conditionals stay intact.',
    },
    {
        question: 'How much smaller will my email be after I minify HTML?',
        answer: 'Typical savings are 20–45%, depending on how indented and commented your source is. A 130KB template often compresses to 75–90KB after minification — well under Gmail\'s 102KB clipping threshold. The exact reduction is shown in the stats panel after each run.',
    },
    {
        question: 'Is this minify html online tool free and safe to use?',
        answer: 'Yes — completely free, no signup, no upload to a server. The minifier runs entirely in your browser, so your HTML never leaves your device. It is a pure client-side minify code utility.',
    },
    {
        question: 'Can I compress HTML for non-email use too?',
        answer: 'Yes. While EMLinter is built for email, the underlying html minifier engine works on any well-formed HTML — landing pages, embedded snippets, transactional templates. Paste in your HTML, click minify, copy the compressed output.',
    },
    {
        question: 'Should I keep <head> and <style> tags un-minified?',
        answer: 'Sometimes. If you have media queries or pseudo-class CSS in <style>, keeping line breaks makes future debugging easier. Our tool offers two checkboxes — "Don\'t minify <head>" and "Don\'t minify <style>" — so you can compress html selectively without losing readability where it matters.',
    },
];

const HtmlMinifierPage: React.FC = () => {
    const [inputHtml, setInputHtml] = useState('');
    const [outputHtml, setOutputHtml] = useState('');
    const [isMinifying, setIsMinifying] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [minifyOptions, setMinifyOptions] = useState<MinifyOptions>({ keepHead: false, keepStyles: false });
    const [stats, setStats] = useState<{ originalSize: number; minifiedSize: number; savedBytes: number; reductionPercent: string } | null>(null);

    const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setMinifyOptions((prev) => ({ ...prev, [name]: checked }));
        setOutputHtml('');
        setStats(null);
    };

    const handleMinify = useCallback(() => {
        if (!inputHtml) { setOutputHtml(''); setStats(null); return; }
        setIsMinifying(true);
        setTimeout(() => {
            const minified = minifyHtml(inputHtml, minifyOptions);
            setOutputHtml(minified);
            const originalSize = new Blob([inputHtml]).size;
            const minifiedSize = new Blob([minified]).size;
            const savedBytes = originalSize - minifiedSize;
            const reductionPercent = originalSize > 0 ? ((savedBytes / originalSize) * 100).toFixed(2) : '0.00';
            setStats({ originalSize, minifiedSize, savedBytes, reductionPercent });
            setIsMinifying(false);
        }, 300);
    }, [inputHtml, minifyOptions]);

    const handleUpload = (html: string) => { setInputHtml(html); setOutputHtml(''); setStats(null); };

    const handleCopy = () => {
        if (!outputHtml) return;
        navigator.clipboard.writeText(outputHtml);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!outputHtml) return;
        const blob = new Blob([outputHtml], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'minified-template.html');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div>
            <UploadHtmlModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUpload={handleUpload} />

            <PageHero
                eyebrow="HTML Email Minifier"
                title={
                    <>
                        Compress HTML to slip under <span className="gradient-text">Gmail's 102KB clip</span>.
                    </>
                }
                subtitle="A free online html email minifier built for email developers. Minify html, compress html, and shrink your campaign 20–45% in one click — without breaking Outlook fallbacks or inline styles."
            >
                <a href="#minifier" className="btn-primary">Open the minifier</a>
                <a href="/tools/beautify-code" className="btn-secondary">Or beautify first</a>
            </PageHero>

            <section id="minifier" className="card p-6 md:p-8 mb-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label htmlFor="input-html" className="text-base font-semibold text-white">Original HTML</label>
                            <button onClick={() => setIsUploadModalOpen(true)} className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-accent-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                                <UploadIcon className="w-4 h-4" /> Upload
                            </button>
                        </div>
                        <textarea
                            id="input-html"
                            value={inputHtml}
                            onChange={(e) => { setInputHtml(e.target.value); setOutputHtml(''); setStats(null); }}
                            className="w-full h-80 p-4 font-mono text-sm bg-ink-950/80 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-transparent transition resize-y custom-scrollbar"
                            placeholder="Paste your HTML code here…"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label htmlFor="output-html" className="text-base font-semibold text-white">Minified HTML</label>
                            {outputHtml && (
                                <div className="flex items-center gap-2">
                                    <button onClick={handleCopy} className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-ink-200 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                                        <CopyIcon className="w-4 h-4" /> {isCopied ? 'Copied' : 'Copy'}
                                    </button>
                                    <button onClick={handleDownload} className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-ink-200 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                                        <DownloadIcon className="w-4 h-4" /> Download
                                    </button>
                                </div>
                            )}
                        </div>
                        <textarea
                            id="output-html"
                            value={outputHtml}
                            readOnly
                            className="w-full h-80 p-4 font-mono text-sm bg-ink-950/80 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-transparent transition resize-y custom-scrollbar"
                            placeholder="Compressed code will appear here…"
                        />
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-center gap-6">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <p className="text-xs font-semibold text-ink-200 mb-2 text-center uppercase tracking-wider">Minification Options</p>
                        <div className="flex flex-col sm:flex-row gap-x-6 gap-y-2">
                            <label className="flex items-center text-sm text-ink-200 cursor-pointer">
                                <input type="checkbox" name="keepHead" checked={minifyOptions.keepHead} onChange={handleOptionChange} className="h-4 w-4 rounded-sm border-white/20 text-brand-500 focus:ring-brand-400 bg-ink-900 mr-2" />
                                Keep &lt;head&gt; un-minified
                            </label>
                            <label className="flex items-center text-sm text-ink-200 cursor-pointer">
                                <input type="checkbox" name="keepStyles" checked={minifyOptions.keepStyles} onChange={handleOptionChange} className="h-4 w-4 rounded-sm border-white/20 text-brand-500 focus:ring-brand-400 bg-ink-900 mr-2" />
                                Keep &lt;style&gt; un-minified
                            </label>
                        </div>
                    </div>
                    <button onClick={handleMinify} disabled={isMinifying || !inputHtml} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                        {isMinifying ? <><SpinnerIcon className="animate-spin -ml-1 mr-2 h-5 w-5" /> Minifying…</> : <><WandIcon className="-ml-1 mr-1 h-5 w-5" /> Minify HTML</>}
                    </button>
                </div>

                {stats && (
                    <div className="mt-6 pt-6 border-t border-white/5">
                        <h3 className="text-sm font-semibold text-center text-ink-200 mb-4 uppercase tracking-wider">Compression Results</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <p className="text-xs text-ink-400 mb-1">Original</p>
                                <p className="text-xl font-bold text-white">{formatBytes(stats.originalSize)}</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <p className="text-xs text-ink-400 mb-1">Minified</p>
                                <p className="text-xl font-bold text-sky-300">{formatBytes(stats.minifiedSize)}</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <p className="text-xs text-ink-400 mb-1">Saved</p>
                                <p className="text-xl font-bold text-emerald-300">{formatBytes(stats.savedBytes)}</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <p className="text-xs text-ink-400 mb-1">Reduction</p>
                                <p className="text-xl font-bold text-brand-300">{stats.reductionPercent}%</p>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* SEO content block */}
            <section className="card p-8 md:p-12 max-w-5xl mx-auto mb-12">
                <h2 className="section-title mb-5">Why every email needs an HTML email minifier</h2>
                <div className="text-ink-300 leading-relaxed space-y-4 text-sm md:text-base">
                    <p>
                        Gmail clips any HTML email over <strong className="text-white">102KB</strong> — and clipped emails hurt deliverability, engagement, and click-through rates. A hand-coded responsive template with media queries, Outlook VML fallbacks, and inline styles can easily hit 120–150KB before you've added a single image. That's why minifying html is no longer optional for email developers.
                    </p>
                    <p>
                        EMLinter's html minifier is purpose-built for email. Unlike generic minify code tools that aggressively strip everything, ours preserves the things email actually needs: Outlook conditional comments (<code>&lt;!--[if mso]&gt;</code>), inline styles, VML blocks, and structural table layout. The result is a 20–45% smaller file that renders identically in Gmail, Outlook, Apple Mail, and every other client.
                    </p>
                    <p>
                        Whether you're trying to compress html for a Mailchimp send, minify html online before pushing to Klaviyo, or shrink a transactional template for HubSpot — this is the tool. Paste, click, copy.
                    </p>
                </div>
            </section>

            <SeoFaq title="HTML Email Minifier FAQs" items={faqs} />
        </div>
    );
};

export default HtmlMinifierPage;
