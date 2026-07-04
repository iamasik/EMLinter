import React, { useState, useCallback } from 'react';
import { UploadIcon, CopyIcon, DownloadIcon, SpinnerIcon, WandIcon } from '../Icons';
import UploadHtmlModal from '../modals/UploadHtmlModal';
import { beautifyHtml } from '../../services/htmlBeautifier';
import PageHero from '../PageHero';
import SeoFaq from '../SeoFaq';

const faqs = [
    {
        question: 'What does an HTML email beautifier do?',
        answer: 'An HTML email beautifier (also called a formatter or pretty-printer) takes messy, minified, or compacted HTML and reformats it with proper indentation, line breaks, and spacing. The result is readable code that\'s easy to debug, review, or hand off to a teammate. It does not change the rendering — only the appearance of the source.',
    },
    {
        question: 'When should I beautify versus minify email HTML?',
        answer: 'Beautify when you\'re editing, debugging, or reviewing code. Minify right before you ship — minified HTML is smaller (helping you stay under Gmail\'s 102KB clipping threshold) but unreadable. A common workflow: beautify on import, edit, validate, then minify on export.',
    },
    {
        question: 'Does beautifying break Outlook conditional comments or VML?',
        answer: 'No. The beautifier preserves Outlook conditional comments (<!--[if mso]>), VML blocks, and inline styles exactly as-is. It only adjusts whitespace between tags so the structure becomes visible without changing how anything renders.',
    },
    {
        question: 'Will this work on emails exported from Mailchimp, Klaviyo, or HubSpot?',
        answer: 'Yes. ESP-exported HTML is typically minified or has inconsistent indentation. Paste it in, click Beautify, and you get a clean, debuggable copy. Useful when you need to audit an existing campaign or fix a rendering bug.',
    },
    {
        question: 'Is the beautifier free and does it upload my HTML?',
        answer: 'Free, no signup, no upload. Everything runs in your browser — your HTML code is processed locally and never touches our servers.',
    },
    {
        question: 'Can I beautify partial HTML snippets, or do I need a full document?',
        answer: 'Both work. The beautifier handles full <html>…</html> documents, table fragments, or even single elements. Useful for cleaning up a block you\'re copying between templates.',
    },
];

const BeautifyCodePage: React.FC = () => {
    const [inputHtml, setInputHtml] = useState('');
    const [outputHtml, setOutputHtml] = useState('');
    const [isBeautifying, setIsBeautifying] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const handleBeautify = useCallback(() => {
        if (!inputHtml) { setOutputHtml(''); return; }
        setIsBeautifying(true);
        setTimeout(() => {
            setOutputHtml(beautifyHtml(inputHtml));
            setIsBeautifying(false);
        }, 300);
    }, [inputHtml]);

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
        link.setAttribute('download', 'beautified-template.html');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <UploadHtmlModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUpload={(html) => { setInputHtml(html); setOutputHtml(''); }} />

            <PageHero
                eyebrow="HTML Email Beautifier"
                title={<>Format messy email HTML <span className="gradient-text">in one click</span>.</>}
                subtitle="A free HTML email beautifier that turns minified, copy-pasted, or chaotic email code into clean, indented, debuggable structure. Works on full templates and partial snippets."
            >
                <a href="#editor" className="btn-primary">Open the beautifier</a>
                <a href="/tools/html-minifier" className="btn-secondary">Need to minify?</a>
            </PageHero>

            <section id="editor" className="card p-6 md:p-8 mb-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label htmlFor="input-html" className="text-base font-semibold text-white">Your HTML</label>
                            <button onClick={() => setIsUploadModalOpen(true)} className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-accent-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                                <UploadIcon className="w-4 h-4" /> Upload
                            </button>
                        </div>
                        <textarea id="input-html" value={inputHtml} onChange={(e) => { setInputHtml(e.target.value); setOutputHtml(''); }} className="w-full h-80 p-4 font-mono text-sm bg-ink-950/80 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-transparent transition resize-y custom-scrollbar" placeholder="Paste compact or messy HTML here…" />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label htmlFor="output-html" className="text-base font-semibold text-white">Beautified output</label>
                            {outputHtml && (
                                <div className="flex items-center gap-2">
                                    <button onClick={handleCopy} className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-ink-200 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"><CopyIcon className="w-4 h-4" /> {isCopied ? 'Copied' : 'Copy'}</button>
                                    <button onClick={handleDownload} className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-ink-200 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"><DownloadIcon className="w-4 h-4" /> Download</button>
                                </div>
                            )}
                        </div>
                        <textarea id="output-html" value={outputHtml} readOnly className="w-full h-80 p-4 font-mono text-sm bg-ink-950/80 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-transparent transition resize-y custom-scrollbar" placeholder="Formatted code will appear here…" />
                    </div>
                </div>
                <div className="mt-6 pt-6 border-t border-white/5 text-center">
                    <button onClick={handleBeautify} disabled={isBeautifying || !inputHtml} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                        {isBeautifying ? <><SpinnerIcon className="animate-spin -ml-1 mr-2 h-5 w-5" /> Beautifying…</> : <><WandIcon className="-ml-1 mr-1 h-5 w-5" /> Beautify HTML</>}
                    </button>
                </div>
            </section>

            <section className="card p-8 md:p-12 max-w-5xl mx-auto mb-12">
                <h2 className="section-title mb-5">Why every email developer needs a beautifier</h2>
                <div className="text-ink-300 leading-relaxed space-y-4 text-sm md:text-base">
                    <p>
                        Most HTML email lives a double life. The version you ship is minified — every byte counts, you need to stay under Gmail's 102KB clipping threshold. The version you read is beautified — indented, line-broken, table structure visible at a glance. EMLinter's HTML email beautifier flips between the two without breaking conditional comments, VML, or inline styles.
                    </p>
                    <p>
                        Paste a wall of minified ESP-exported HTML, click Beautify, and instantly see the table structure. Find the broken row. Fix it. Beautify is the first tool you reach for when something looks wrong and you need to read the code before you can debug it.
                    </p>
                </div>
            </section>

            <SeoFaq title="HTML Email Beautifier FAQs" items={faqs} />
        </div>
    );
};

export default BeautifyCodePage;
