import React, { useState, useCallback } from 'react';
import { UploadIcon, CopyIcon, DownloadIcon, SpinnerIcon, WandIcon } from '../Icons';
import UploadHtmlModal from '../modals/UploadHtmlModal';
import PageHero from '../PageHero';
import SeoFaq from '../SeoFaq';

const faqs = [
    { question: 'What does the Outlook HTML Sanitizer do?', answer: 'It auto-injects tiny margin and padding values (e.g. 0.05pt) onto every <table>, <td>, and <th> in your email — a known workaround for Outlook\'s collapsing-margins and ghost-spacing bugs. The fix is invisible visually but eliminates the most common Outlook rendering glitches.' },
    { question: 'When do I need to sanitize HTML for Outlook?', answer: 'Whenever you see mysterious vertical gaps, collapsing rows, or inconsistent padding in Outlook for Windows. The Word renderer ignores normal cell padding rules, and the 0.05pt trick is the cleanest fix the email community has converged on.' },
    { question: 'Will this break rendering in Gmail or Apple Mail?', answer: 'No. 0.05pt is below the rendering threshold of modern email clients, so they round to zero and ignore the styles. Only Outlook reads and applies them.' },
    { question: 'Can I change the spacing value?', answer: 'Yes — the Spacing Value field defaults to 0.05pt. Smaller is safer for visual fidelity; larger if Outlook is being especially stubborn.' },
    { question: 'Does it preserve my existing inline styles?', answer: 'Yes. The sanitizer only adds margin/padding where you don\'t already have them. Existing non-zero padding is left untouched.' },
    { question: 'Is this safe to run before sending?', answer: 'Yes. It is a 100% client-side string transformation that leaves the structure of your HTML intact — only adding tiny style values to specific tags.' },
];

const OutlookReadyHtmlPage: React.FC = () => {
    const [inputHtml, setInputHtml] = useState('');
    const [outputHtml, setOutputHtml] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [spacingValue, setSpacingValue] = useState('0.05');

    const sanitizeHtmlForOutlook = (html: string, spacing: string): string => {
        if (!html || !spacing) return html;
        const replacer = (match: string, tagName: string, attrs: string): string => {
            const styleRegex = /style\s*=\s*(["'])(.*?)\1/i;
            const styleMatch = attrs.match(styleRegex);
            if (!styleMatch) {
                const newAttrs = `${attrs} style="margin: ${spacing} !important; padding: ${spacing} !important;"`;
                return `<${tagName}${newAttrs}>`;
            }
            const quote = styleMatch[1];
            const styleValue = styleMatch[2];
            const originalStyleAttr = styleMatch[0];
            const styles = new Map<string, string>();
            styleValue.split(';').forEach((decl) => {
                if (decl.trim()) {
                    const parts = decl.split(':');
                    if (parts.length >= 2) {
                        const prop = parts[0].trim().toLowerCase();
                        const val = parts.slice(1).join(':').trim();
                        if (prop && val) styles.set(prop, val);
                    }
                }
            });
            const isZeroValue = (val: string | undefined): boolean => !!val && /^\s*(0(px|pt|em|rem|%|in|cm|mm|pc)?\s*)+$/.test(val);
            const hasNonZeroPadding = (m: Map<string, string>): boolean => {
                if (m.has('padding') && !isZeroValue(m.get('padding'))) return true;
                for (const p of ['padding-top', 'padding-right', 'padding-bottom', 'padding-left']) {
                    if (m.has(p) && !isZeroValue(m.get(p))) return true;
                }
                return false;
            };
            const hasMargin = styles.has('margin');
            if (hasMargin && isZeroValue(styles.get('margin')) && styles.has('padding') && isZeroValue(styles.get('padding'))) {
                let v = styleValue;
                if (v.trim() && !v.trim().endsWith(';')) v += ';';
                v += ` margin: ${spacing} !important; padding: ${spacing} !important;`;
                return `<${tagName}${attrs.replace(originalStyleAttr, `style=${quote}${v}${quote}`)}>`;
            }
            const addMargin = !hasMargin;
            const addPadding = !hasNonZeroPadding(styles);
            const stylesToAdd: string[] = [];
            if (addMargin) stylesToAdd.push(`margin: ${spacing} !important`);
            if (addPadding) stylesToAdd.push(`padding: ${spacing} !important`);
            if (stylesToAdd.length > 0) {
                let v = stylesToAdd.join('; ');
                if (styleValue.trim()) v += '; ' + styleValue;
                return `<${tagName}${attrs.replace(originalStyleAttr, `style=${quote}${v}${quote}`)}>`;
            }
            return match;
        };
        return html.replace(/<(table|td|th)((?:\s+(?:".*?"|'.*?'|[^>])*)?)>/gi, replacer);
    };

    const handleSanitize = useCallback(() => {
        if (!inputHtml) { setOutputHtml(''); return; }
        setIsProcessing(true);
        setTimeout(() => {
            const bodyMatch = inputHtml.match(/(<body[^>]*>)([\s\S]*)(<\/body>)/i);
            const spacing = `${spacingValue}pt`;
            if (bodyMatch && bodyMatch[2]) {
                setOutputHtml(inputHtml.replace(bodyMatch[2], sanitizeHtmlForOutlook(bodyMatch[2], spacing)));
            } else {
                setOutputHtml(sanitizeHtmlForOutlook(inputHtml, spacing));
            }
            setIsProcessing(false);
        }, 300);
    }, [inputHtml, spacingValue]);

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
        link.setAttribute('download', 'outlook-ready-template.html');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <UploadHtmlModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUpload={(html) => { setInputHtml(html); setOutputHtml(''); }} />

            <PageHero
                eyebrow="Outlook HTML Sanitizer"
                title={<>Fix Outlook's <span className="gradient-text">ghost spacing</span> bugs in one click.</>}
                subtitle="Auto-inject the legendary 0.05pt margin/padding trick into every table cell so Outlook for Windows stops collapsing rows and adding mystery whitespace. Drop-in fix, fully reversible."
            >
                <a href="#sanitizer" className="btn-primary">Sanitize HTML</a>
                <a href="/solutions/outlook-button-generator" className="btn-secondary">Generate a button</a>
            </PageHero>

            <section id="sanitizer" className="card p-6 md:p-8 mb-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-base font-semibold text-white">Your HTML</label>
                            <button onClick={() => setIsUploadModalOpen(true)} className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-accent-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                                <UploadIcon className="w-4 h-4" /> Upload
                            </button>
                        </div>
                        <textarea value={inputHtml} onChange={(e) => { setInputHtml(e.target.value); setOutputHtml(''); }} className="w-full h-80 p-4 font-mono text-sm bg-ink-950/80 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-transparent transition resize-y custom-scrollbar" placeholder="Paste email HTML here…" />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-base font-semibold text-white">Outlook-ready output</label>
                            {outputHtml && (
                                <div className="flex items-center gap-2">
                                    <button onClick={handleCopy} className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-ink-200 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"><CopyIcon className="w-4 h-4" /> {isCopied ? 'Copied' : 'Copy'}</button>
                                    <button onClick={handleDownload} className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-ink-200 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"><DownloadIcon className="w-4 h-4" /> Download</button>
                                </div>
                            )}
                        </div>
                        <textarea value={outputHtml} readOnly className="w-full h-80 p-4 font-mono text-sm bg-ink-950/80 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-transparent transition resize-y custom-scrollbar" placeholder="Sanitized code will appear here…" />
                    </div>
                </div>
                <div className="mt-6 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-end justify-center gap-4">
                    <div>
                        <label htmlFor="spacing-value" className="block text-xs font-medium text-ink-300 mb-1 uppercase tracking-wider">Spacing value</label>
                        <div className="relative w-32">
                            <input id="spacing-value" type="text" value={spacingValue} onChange={(e) => setSpacingValue(e.target.value)} className="w-full px-3 py-2 text-sm text-center text-white bg-ink-950/80 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-400 focus:outline-none pr-9" />
                            <span className="absolute inset-y-0 right-3 flex items-center text-ink-400 text-xs pointer-events-none">pt</span>
                        </div>
                    </div>
                    <button onClick={handleSanitize} disabled={isProcessing || !inputHtml} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                        {isProcessing ? <><SpinnerIcon className="animate-spin -ml-1 mr-2 h-5 w-5" /> Processing…</> : <><WandIcon className="-ml-1 mr-1 h-5 w-5" /> Sanitize for Outlook</>}
                    </button>
                </div>
            </section>

            <section className="card p-8 md:p-12 max-w-5xl mx-auto mb-12">
                <h2 className="section-title mb-5">The 0.05pt trick that fixes Outlook</h2>
                <div className="text-ink-300 leading-relaxed space-y-4 text-sm md:text-base">
                    <p>
                        Microsoft Word — the renderer powering Outlook for Windows — collapses margins on table cells and adds phantom vertical whitespace at unpredictable spots. The fix the email community converged on: set a near-zero margin and padding (typically <code>0.05pt</code>) on every <code>&lt;table&gt;</code>, <code>&lt;td&gt;</code>, and <code>&lt;th&gt;</code>. Word respects the declaration and stops collapsing; modern clients round to zero and ignore it entirely.
                    </p>
                    <p>
                        This sanitizer does the rewrite for you. Paste your HTML, click Sanitize, ship the output. If you already have non-zero padding on a cell, it's preserved. If you have <code>margin:0; padding:0;</code> explicitly (the css-reset pattern), the sanitizer overrides with the spacing value because that pattern is what causes the Outlook collapse in the first place.
                    </p>
                </div>
            </section>

            <SeoFaq title="Outlook HTML Sanitizer FAQs" items={faqs} />
        </div>
    );
};

export default OutlookReadyHtmlPage;
