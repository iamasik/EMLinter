import React, { useState, useEffect, useRef, useMemo } from 'react';
import { UploadIcon, DesktopIcon, MobileIcon, SunIcon, MoonIcon, SpinnerIcon, WandIcon } from '../components/Icons';
import UploadHtmlModal from '../components/modals/UploadHtmlModal';
import ColorAnalysisModal from '../components/modals/ColorAnalysisModal';
import { analyzeHtmlColors, AnalysisResult } from '../services/colorAnalyzer';


const DarkModeCheckerPage: React.FC = () => {
    const [templateHtml, setTemplateHtml] = useState<string | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [isDarkMode, setIsDarkMode] = useState(false);
    
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [scale, setScale] = useState(1);
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const previewWidth = useMemo(() => viewMode === 'mobile' ? 375 : 800, [viewMode]);

    // State for the new analysis feature
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResults, setAnalysisResults] = useState<AnalysisResult[] | null>(null);
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);


    useEffect(() => {
        const schema = {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "EMLinter - HTML Email Dark Mode Simulator",
          "applicationCategory": "DeveloperApplication",
          "operatingSystem": "Web/Online",
          "description": "Simulate and test how your HTML email will render in dark mode. Catch visual bugs before you send your campaign.",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "browserRequirements": "Requires a modern web browser with JavaScript enabled."
        };
    
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'tool-schema';
        script.innerHTML = JSON.stringify(schema);
        document.head.appendChild(script);
    
        return () => {
          const existingScript = document.getElementById('tool-schema');
          if (existingScript) {
            document.head.removeChild(existingScript);
          }
        };
    }, []);

    useEffect(() => {
        const previewContainer = previewContainerRef.current;
        if (!previewContainer) return;

        const calculateScale = () => {
            const containerPadding = 32; // Corresponds to p-4 (1rem on each side, 16px * 2)
            const availableWidth = previewContainer.offsetWidth - containerPadding;
            
            if (previewWidth > availableWidth) {
                setScale(availableWidth / previewWidth);
            } else {
                setScale(1);
            }
        };

        const resizeObserver = new ResizeObserver(calculateScale);
        resizeObserver.observe(previewContainer);
        calculateScale(); // Initial calculation

        return () => resizeObserver.disconnect();
    }, [previewWidth]);

    const handleUpload = (html: string) => {
        setTemplateHtml(html);
        setAnalysisResults(null); // Clear previous results on new upload
    };

    const handleAnalyzeColors = async () => {
        if (!iframeRef.current?.contentDocument) return;

        setIsAnalyzing(true);
        setIsAnalysisModalOpen(true);
        setAnalysisResults(null);
        
        // Use a short timeout to ensure the modal's loading state is visible before the main thread is blocked by analysis
        setTimeout(async () => {
            try {
                const results = await analyzeHtmlColors(iframeRef.current!.contentDocument!);
                setAnalysisResults(results);
            } catch (error) {
                console.error("Color analysis failed:", error);
                // Optionally set an error state to show in the modal
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
                    html {
                        filter: invert(1) hue-rotate(180deg);
                        background-color: #fff; /* Ensures background is white before inverting */
                        height: 100%;
                    }
                    /* Revert filter on images and other media to prevent them from being inverted */
                    img, video, picture, svg, [style*="background-image"] {
                        filter: invert(1) hue-rotate(180deg);
                    }
                `;
                doc.head.appendChild(styleElement);
            }
        } else {
            if (styleElement) {
                doc.head.removeChild(styleElement);
            }
        }
    }, [isDarkMode, templateHtml]);

    return (
        <>
            <title>Dark Mode Email Simulator & Checker | EMLinter</title>
            <meta name="description" content="Simulate and test how your HTML email will render in dark mode. Catch visual bugs and inverted colors before you send your campaign." />
            <link rel="canonical" href="https://emlinter.app/dark-mode-checker" />
            <UploadHtmlModal 
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={handleUpload}
            />
            <ColorAnalysisModal
                isOpen={isAnalysisModalOpen}
                onClose={() => setIsAnalysisModalOpen(false)}
                results={analysisResults}
                isLoading={isAnalyzing}
            />

            <header className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 pb-2">
                    HTML Email Dark Mode Simulator
                </h1>
                <p className="text-gray-400 mt-2 max-w-3xl mx-auto">
                    Preview how your email renders in dark mode. Catch and fix common issues like inverted colors and unreadable text before you send.
                </p>
            </header>

            {!templateHtml && (
                <div className="bg-gray-800/50 rounded-xl shadow-2xl p-6 border border-gray-700 text-center">
                    <h2 className="text-xl font-semibold text-gray-200 mb-4">Get Started</h2>
                    <p className="text-gray-400 mb-6">Upload or paste your email's HTML to start the simulation.</p>
                     <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="px-8 py-3 font-semibold text-white bg-gradient-to-r from-pink-600 to-violet-600 rounded-lg hover:from-pink-700 hover:to-violet-700 transform hover:scale-105 transition-transform duration-200 shadow-lg flex items-center justify-center gap-3 mx-auto"
                    >
                        <UploadIcon className="w-5 h-5" />
                        <span>Upload HTML Template</span>
                    </button>
                </div>
            )}
            
            {templateHtml && (
                 <div className="bg-gray-800/50 rounded-xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col">
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-gray-700 min-h-[68px]">
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-violet-300 bg-violet-800/30 rounded-lg hover:bg-violet-800/60 transition-colors duration-200"
                        >
                            <UploadIcon className="w-4 h-4" />
                            <span>Upload New HTML</span>
                        </button>

                        <div className="flex items-center gap-1 bg-gray-900 p-1 rounded-lg">
                            <button
                                onClick={() => setViewMode('desktop')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${viewMode === 'desktop' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}
                            >
                                <DesktopIcon className="w-5 h-5" />
                                <span className="hidden sm:inline">Desktop</span>
                            </button>
                            <button
                                onClick={() => setViewMode('mobile')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${viewMode === 'mobile' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}
                            >
                                <MobileIcon className="w-5 h-5" />
                                <span className="hidden sm:inline">Mobile</span>
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleAnalyzeColors}
                                disabled={isAnalyzing}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-cyan-300 bg-cyan-800/30 rounded-lg hover:bg-cyan-800/60 transition-colors duration-200 disabled:opacity-50 disabled:cursor-wait"
                            >
                                <WandIcon className="w-4 h-4" />
                                <span>Analyze Colors</span>
                            </button>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-400">Mode:</span>
                                <button
                                    onClick={() => setIsDarkMode(!isDarkMode)}
                                    className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-pink-500"
                                >
                                    <span
                                        className={`${
                                        isDarkMode ? 'translate-x-6' : 'translate-x-1'
                                        } inline-block w-4 h-4 transform bg-white rounded-full transition-transform flex items-center justify-center`}
                                    >
                                        {isDarkMode ? <MoonIcon className="w-3 h-3 text-gray-800"/> : <SunIcon className="w-3 h-3 text-gray-800"/>}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div ref={previewContainerRef} className="h-[1400px] relative bg-gray-900/50 flex justify-center items-start p-4 overflow-auto">
                        <div
                            className="flex-shrink-0 transition-all duration-300 ease-in-out"
                            style={{
                                height: '100%',
                                width: `${previewWidth * scale}px`,
                            }}
                        >
                            <div 
                                className="shadow-lg bg-white"
                                style={{ 
                                    width: `${previewWidth}px`,
                                    height: `${100 / scale}%`,
                                    transform: `scale(${scale})`,
                                    transformOrigin: 'top left',
                                }}
                            >
                                <iframe
                                    ref={iframeRef}
                                    srcDoc={templateHtml}
                                    title="Email Preview"
                                    className="w-full h-full border-0"
                                    sandbox="allow-scripts allow-same-origin"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
export default DarkModeCheckerPage;