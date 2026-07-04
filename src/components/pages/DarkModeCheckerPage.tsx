import React, { useState, useEffect, useRef, useMemo } from 'react';
import { UploadIcon, DesktopIcon, MobileIcon, SunIcon, MoonIcon, WandIcon } from '../Icons';
import UploadHtmlModal from '../modals/UploadHtmlModal';
import ColorAnalysisModal from '../modals/ColorAnalysisModal';
import { analyzeHtmlColors, type AnalysisResult } from '../../services/colorAnalyzer';
import PageHero from '../PageHero';
import SeoFaq from '../SeoFaq';

const faqs = [
    {
        question: 'What is a dark mode email tester and why do I need one?',
        answer: 'A dark mode email tester simulates how your HTML email renders in dark-mode inboxes — iOS Mail, Apple Mail, Outlook for Mac, and Gmail mobile. Many clients automatically invert backgrounds and adjust text colors, which can make logos disappear, text become unreadable, or CTAs blend into the background. Dark mode testing lets you catch and fix these issues before you send.',
    },
    {
        question: 'How does dark mode testing work in this tool?',
        answer: 'Upload or paste your HTML, then toggle the dark/light switch. The tool applies the same CSS filter transformation that Outlook for Mac and certain Gmail dark themes use — inverting backgrounds while preserving image colors. You see your email exactly as a subscriber on dark mode would.',
    },
    {
        question: 'Which email clients force dark mode on my emails?',
        answer: 'Three behaviors exist: (1) Apple Mail and iOS preserve your colors but invert white backgrounds; (2) Outlook for Windows/Mac and Outlook.com fully invert your color palette unless you opt out; (3) Gmail (mobile and some web themes) partial-invert mostly white-on-white designs. Our dark mode test simulates the aggressive option so you see worst-case rendering.',
    },
    {
        question: 'How do I prevent dark mode from breaking my email?',
        answer: 'Use the Analyze Colors button to surface every text/background pair that fails WCAG AA contrast in either light or dark mode. The tool suggests universal colors that pass both. You can also add the meta tag <meta name="color-scheme" content="light dark"> and a @media (prefers-color-scheme: dark) block to give clients explicit guidance.',
    },
    {
        question: 'Does dark mode testing affect deliverability?',
        answer: 'No directly — but it affects engagement, which indirectly affects deliverability. Unreadable dark-mode emails get low click-through and high delete-without-open rates, both of which hurt your sender reputation over time. Testing is preventive.',
    },
    {
        question: 'Is this dark mode test free and is my HTML uploaded anywhere?',
        answer: 'Completely free, no signup, no uploads. The simulator runs entirely in your browser using a sandboxed iframe — your HTML is never sent to a server. The color contrast analysis also runs client-side.',
    },
];

const DarkModeCheckerPage: React.FC = () => {
    const [templateHtml, setTemplateHtml] = useState<string | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [isDarkMode, setIsDarkMode] = useState(false);

    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [scale, setScale] = useState(1);
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const previewWidth = useMemo(() => (viewMode === 'mobile' ? 375 : 800), [viewMode]);

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResults, setAnalysisResults] = useState<AnalysisResult[] | null>(null);
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);

    useEffect(() => {
        const previewContainer = previewContainerRef.current;
        if (!previewContainer) return;
        const calculateScale = () => {
            const containerPadding = 32;
            const availableWidth = previewContainer.offsetWidth - containerPadding;
            setScale(previewWidth > availableWidth ? availableWidth / previewWidth : 1);
        };
        const ro = new ResizeObserver(calculateScale);
        ro.observe(previewContainer);
        calculateScale();
        return () => ro.disconnect();
    }, [previewWidth]);

    const handleUpload = (html: string) => { setTemplateHtml(html); setAnalysisResults(null); };

    const handleAnalyzeColors = async () => {
        if (!iframeRef.current?.contentDocument) return;
        setIsAnalyzing(true);
        setIsAnalysisModalOpen(true);
        setAnalysisResults(null);
        setTimeout(async () => {
            try {
                const results = await analyzeHtmlColors(iframeRef.current!.contentDocument!);
                setAnalysisResults(results);
            } catch (error) {
                console.error('Color analysis failed:', error);
            } finally {
                setIsAnalyzing(false);
            }
        }, 100);
    };

    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe?.contentDocument?.head || !templateHtml) return;
        const doc = iframe.contentDocument;
        const styleId = 'vibe-dark-mode-style';
        let styleElement = doc.getElementById(styleId);
        if (isDarkMode) {
            if (!styleElement) {
                styleElement = doc.createElement('style');
                styleElement.id = styleId;
                styleElement.textContent = `
                    html { filter: invert(1) hue-rotate(180deg); background-color: #fff; height: 100%; }
                    img, video, picture, svg, [style*="background-image"] { filter: invert(1) hue-rotate(180deg); }
                `;
                doc.head.appendChild(styleElement);
            }
        } else if (styleElement) {
            doc.head.removeChild(styleElement);
        }
    }, [isDarkMode, templateHtml]);

    return (
        <div>
            <UploadHtmlModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUpload={handleUpload} />
            <ColorAnalysisModal isOpen={isAnalysisModalOpen} onClose={() => setIsAnalysisModalOpen(false)} results={analysisResults} isLoading={isAnalyzing} />

            <PageHero
                eyebrow="Dark Mode Email Tester"
                title={
                    <>
                        Catch <span className="gradient-text">dark mode rendering bugs</span> before subscribers do.
                    </>
                }
                subtitle="A free dark mode email tester that simulates how Apple Mail, Outlook, and Gmail invert your colors. Run a dark mode test on any HTML email and auto-flag contrast failures — no signup, browser-based."
            >
                {!templateHtml && (
                    <button onClick={() => setIsUploadModalOpen(true)} className="btn-primary">
                        <UploadIcon className="w-5 h-5" /> Upload HTML to test
                    </button>
                )}
                {templateHtml && (
                    <button onClick={() => setIsUploadModalOpen(true)} className="btn-secondary">
                        <UploadIcon className="w-5 h-5" /> Upload new HTML
                    </button>
                )}
            </PageHero>

            {!templateHtml && (
                <section className="card p-10 text-center mb-16">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-brand-500/20 to-accent-500/20 grid place-items-center mb-4">
                        <MoonIcon className="w-8 h-8 text-accent-300" />
                    </div>
                    <h2 className="text-xl font-display font-bold text-white mb-2">Ready to run a dark mode test</h2>
                    <p className="text-ink-300 mb-6 max-w-md mx-auto text-sm">Upload your HTML email or paste it in to simulate how it renders in dark mode across Apple Mail, Outlook, and Gmail.</p>
                    <button onClick={() => setIsUploadModalOpen(true)} className="btn-primary">
                        <UploadIcon className="w-5 h-5" /> Upload HTML
                    </button>
                </section>
            )}

            {templateHtml && (
                <section className="card overflow-hidden flex flex-col mb-16">
                    <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-white/5 bg-ink-900/40">
                        <div className="flex items-center gap-1 bg-ink-950/70 border border-white/10 p-1 rounded-xl">
                            <button onClick={() => setViewMode('desktop')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${viewMode === 'desktop' ? 'bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-glow' : 'text-ink-300 hover:bg-white/5'}`}>
                                <DesktopIcon className="w-4 h-4" /> <span className="hidden sm:inline">Desktop</span>
                            </button>
                            <button onClick={() => setViewMode('mobile')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${viewMode === 'mobile' ? 'bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-glow' : 'text-ink-300 hover:bg-white/5'}`}>
                                <MobileIcon className="w-4 h-4" /> <span className="hidden sm:inline">Mobile</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <button onClick={handleAnalyzeColors} disabled={isAnalyzing} className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-sky-300 bg-sky-500/10 border border-sky-400/20 rounded-lg hover:bg-sky-500/20 transition-colors disabled:opacity-50">
                                <WandIcon className="w-4 h-4" /> Analyze Colors
                            </button>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-ink-300 uppercase tracking-wider">Mode</span>
                                <button onClick={() => setIsDarkMode(!isDarkMode)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isDarkMode ? 'bg-gradient-to-r from-brand-500 to-accent-500' : 'bg-ink-700'}`}>
                                    <span className={`${isDarkMode ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform flex items-center justify-center`}>
                                        {isDarkMode ? <MoonIcon className="w-3 h-3 text-ink-800" /> : <SunIcon className="w-3 h-3 text-ink-800" />}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div ref={previewContainerRef} className="h-[1400px] relative bg-ink-950/50 flex justify-center items-start p-4 overflow-auto custom-scrollbar">
                        <div className="flex-shrink-0 transition-all duration-300 ease-in-out" style={{ height: '100%', width: `${previewWidth * scale}px` }}>
                            <div className="shadow-2xl bg-white rounded-md" style={{ width: `${previewWidth}px`, height: `${100 / scale}%`, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                                <iframe ref={iframeRef} srcDoc={templateHtml} title="Email Preview" className="w-full h-full border-0" sandbox="allow-scripts allow-same-origin" />
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <section className="card p-8 md:p-12 max-w-5xl mx-auto mb-12">
                <h2 className="section-title mb-5">Dark mode is no longer optional — and most emails fail it</h2>
                <div className="text-ink-300 leading-relaxed space-y-4 text-sm md:text-base">
                    <p>
                        More than <strong className="text-white">50% of email opens</strong> happen on devices with dark mode enabled. Apple Mail, Outlook for Mac, Outlook.com, and Gmail (mobile + select web themes) all force some flavor of color inversion on the emails they show. Without dark mode testing, the white logo you spent hours perfecting can disappear into a now-white background, your CTA can blend into its container, and dark grey body text can become unreadable on a near-black background.
                    </p>
                    <p>
                        EMLinter's dark mode email tester runs an aggressive simulation — the same inversion math Outlook for Mac applies — so you see worst-case rendering up front. The Analyze Colors feature walks every text node in your email, calculates light-mode and dark-mode contrast ratios, and flags any pair that fails WCAG AA in either state. Then it suggests a universal color that passes both.
                    </p>
                </div>
            </section>

            <SeoFaq title="Dark Mode Email Tester FAQs" items={faqs} />
        </div>
    );
};

export default DarkModeCheckerPage;
