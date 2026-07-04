import React, { useState, useRef } from 'react';
import { UploadIcon, CopyIcon, CodeIcon, CursorClickIcon, CheckCircleIcon } from '../Icons';
import UploadHtmlModal from '../modals/UploadHtmlModal';
import PageHero from '../PageHero';
import SeoFaq from '../SeoFaq';

const faqs = [
    { question: 'What is the email Design Copier?', answer: 'It copies a rendered HTML email design — including formatting, images, and links — as rich content you can paste directly into Gmail or Outlook\'s compose window. Useful for quickly resending or repurposing a template without re-uploading HTML.' },
    { question: 'When would I use this instead of pasting HTML?', answer: 'When you want to forward a designed email from a one-off Gmail draft, when your ESP does not accept full HTML, or when you need a quick visual paste into a chat or doc.' },
    { question: 'Does the paste preserve images and links?', answer: 'Yes — images load from their original URLs and links remain clickable. Formatting (fonts, colors, spacing) is preserved by the email client\'s rich-text engine.' },
    { question: 'Why does Outlook sometimes change the formatting?', answer: 'Outlook\'s compose engine applies its own paragraph and font defaults. For pixel-perfect Outlook rendering, use our bulletproof button generator and the Outlook HTML sanitizer instead.' },
    { question: 'Can I edit the HTML before copying?', answer: 'Yes. Toggle View/Edit Code to open a side-by-side editor; changes update the live preview instantly.' },
    { question: 'Is anything uploaded?', answer: 'No. The preview iframe runs locally and the copy uses your browser\'s clipboard. No HTML is uploaded.' },
];

const DesignCopierPage: React.FC = () => {
    const [htmlContent, setHtmlContent] = useState<string | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isCodeViewVisible, setIsCodeViewVisible] = useState(false);
    const [isDesignCopied, setIsDesignCopied] = useState(false);
    const [isCodeCopied, setIsCodeCopied] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const lineNumbersRef = useRef<HTMLDivElement>(null);
    const codeTextAreaRef = useRef<HTMLTextAreaElement>(null);

    const handleCopyDesign = () => {
        const iframe = iframeRef.current;
        if (!iframe?.contentDocument?.body || !iframe.contentWindow) {
            alert('Preview is not available to copy.');
            return;
        }
        iframe.contentWindow.focus();
        const range = iframe.contentDocument.createRange();
        range.selectNode(iframe.contentDocument.body);
        iframe.contentWindow.getSelection()?.removeAllRanges();
        iframe.contentWindow.getSelection()?.addRange(range);
        try {
            if (iframe.contentDocument.execCommand('copy')) {
                setIsDesignCopied(true);
                setTimeout(() => setIsDesignCopied(false), 2000);
            } else throw new Error();
        } catch {
            alert('Failed to copy the design. Your browser may not support this action.');
        }
        iframe.contentWindow.getSelection()?.removeAllRanges();
    };

    const handleCopyCode = () => {
        if (!htmlContent) return;
        navigator.clipboard.writeText(htmlContent);
        setIsCodeCopied(true);
        setTimeout(() => setIsCodeCopied(false), 2000);
    };

    const syncScroll = () => {
        if (lineNumbersRef.current && codeTextAreaRef.current) {
            lineNumbersRef.current.scrollTop = codeTextAreaRef.current.scrollTop;
        }
    };

    const lineCount = htmlContent ? htmlContent.split('\n').length : 1;
    const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');

    return (
        <div>
            <UploadHtmlModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUpload={setHtmlContent} />

            <PageHero
                eyebrow="HTML Email Design Copier"
                title={<>Copy email designs straight to <span className="gradient-text">Gmail or Outlook</span>.</>}
                subtitle="Paste your HTML, click Copy Design, then paste the rich-content output directly into a Gmail or Outlook compose window. Skip the export step when you need a one-off send."
            >
                {!htmlContent && (
                    <button onClick={() => setIsUploadModalOpen(true)} className="btn-primary"><UploadIcon className="w-5 h-5" /> Upload HTML</button>
                )}
            </PageHero>

            <section className="card overflow-hidden flex flex-col h-[1200px] mb-16">
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-white/5 bg-ink-900/40">
                    <button onClick={() => setIsUploadModalOpen(true)} className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-accent-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                        <UploadIcon className="w-4 h-4" /> {htmlContent ? 'Upload new' : 'Upload HTML'}
                    </button>
                    {htmlContent && (
                        <div className="flex items-center gap-2">
                            <button onClick={handleCopyDesign} className="btn-primary text-sm py-2 px-4">
                                {isDesignCopied ? <><CheckCircleIcon className="w-4 h-4" /> Copied</> : <><CursorClickIcon className="w-4 h-4" /> Copy design</>}
                            </button>
                            <button onClick={() => setIsCodeViewVisible(!isCodeViewVisible)} className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${isCodeViewVisible ? 'bg-white/10 text-white' : 'bg-white/5 border border-white/10 text-ink-200 hover:bg-white/10'}`}>
                                <CodeIcon className="w-4 h-4" /> {isCodeViewVisible ? 'Hide code' : 'View/edit code'}
                            </button>
                        </div>
                    )}
                </div>

                {!htmlContent ? (
                    <div className="flex flex-col items-center justify-center flex-grow p-8 text-center text-ink-400">
                        <div className="w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-brand-500/20 to-accent-500/20 grid place-items-center">
                            <CursorClickIcon className="w-8 h-8 text-accent-300" />
                        </div>
                        <h2 className="text-xl font-display font-bold text-white mb-2">Start by uploading your template</h2>
                        <p className="max-w-md text-sm">Drop your HTML in to generate a live preview you can copy and paste into Gmail, Outlook, Slack, or any rich-text editor.</p>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row flex-grow min-h-0">
                        {isCodeViewVisible && (
                            <div className="lg:order-last w-full h-1/2 lg:h-full lg:w-1/2 flex flex-col bg-ink-950/80 border-b lg:border-b-0 lg:border-l border-white/5">
                                <div className="flex justify-between items-center p-2 border-b border-white/5 flex-shrink-0">
                                    <h3 className="text-xs font-semibold text-ink-300 px-2 uppercase tracking-wider">HTML editor</h3>
                                    <button onClick={handleCopyCode} className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-ink-200 bg-white/5 border border-white/10 rounded-md hover:bg-white/10 transition-colors">
                                        <CopyIcon className="w-4 h-4" /> {isCodeCopied ? 'Copied' : 'Copy'}
                                    </button>
                                </div>
                                <div className="flex-grow relative overflow-hidden">
                                    <style>{`.cel{scrollbar-width:none}.cel::-webkit-scrollbar{display:none}`}</style>
                                    <div ref={lineNumbersRef} className="absolute left-0 top-0 h-full p-3 font-mono text-sm text-right text-ink-500 bg-ink-900/50 select-none overflow-y-scroll cel"><pre className="leading-6">{lineNumbers}</pre></div>
                                    <textarea ref={codeTextAreaRef} value={htmlContent} onChange={(e) => setHtmlContent(e.target.value)} onScroll={syncScroll} spellCheck="false" className="w-full h-full p-3 pl-16 font-mono text-sm text-ink-100 bg-transparent resize-none border-0 focus:ring-0 leading-6" />
                                </div>
                            </div>
                        )}
                        <div className={`transition-all duration-300 ease-in-out ${isCodeViewVisible ? 'w-full h-1/2 lg:h-full lg:w-1/2' : 'w-full h-full'}`}>
                            <iframe ref={iframeRef} srcDoc={htmlContent} title="Email Design Preview" className="w-full h-full border-0 bg-white" sandbox="allow-scripts allow-same-origin" />
                        </div>
                    </div>
                )}
            </section>

            <SeoFaq title="Design Copier FAQs" items={faqs} />
        </div>
    );
};

export default DesignCopierPage;
