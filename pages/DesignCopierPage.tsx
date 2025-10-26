import React, { useState, useEffect, useRef } from 'react';
import { UploadIcon, CopyIcon, CodeIcon, CursorClickIcon, CheckCircleIcon } from '../components/Icons';
import UploadHtmlModal from '../components/modals/UploadHtmlModal';

const DesignCopierPage = () => {
    const [htmlContent, setHtmlContent] = useState<string | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isCodeViewVisible, setIsCodeViewVisible] = useState(false);
    const [isDesignCopied, setIsDesignCopied] = useState(false);
    const [isCodeCopied, setIsCodeCopied] = useState(false);

    const iframeRef = useRef<HTMLIFrameElement>(null);
    const lineNumbersRef = useRef<HTMLDivElement>(null);
    const codeTextAreaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const schema = {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "EMLinter - HTML Email Design Copier",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Web/Online",
            "description": "Easily copy the visual design of any HTML email directly to your clipboard. Paste it into Gmail or Outlook's compose window. Our tool also lets you view and edit the source code live.",
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

    const handleUpload = (html: string) => {
        setHtmlContent(html);
    };

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
            const success = iframe.contentDocument.execCommand('copy');
            if (success) {
                setIsDesignCopied(true);
                setTimeout(() => setIsDesignCopied(false), 2000);
            } else {
                throw new Error();
            }
        } catch (err) {
            alert('Failed to copy the design. Your browser might not support this action or the content is protected.');
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
        <>
            <title>Copy Email Design to Clipboard | EMLinter</title>
            <meta name="description" content="Easily copy the visual design of any HTML email directly to your clipboard. Paste it into Gmail or Outlook's compose window. Our tool also lets you view and edit the source code live." />
            <link rel="canonical" href="https://emlinter.app/design-copier" />
            <UploadHtmlModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={handleUpload}
            />
            <header className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 pb-2">
                    HTML Email Design Copier
                </h1>
                <p className="text-gray-400 mt-2 max-w-3xl mx-auto">
                    Visually copy any HTML email design and paste it directly into Gmail or Outlook's compose window.
                </p>
            </header>
            
            <div className="bg-gray-800/50 rounded-xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col h-[1400px]">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-gray-700">
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-violet-300 bg-violet-800/30 rounded-lg hover:bg-violet-800/60 transition-colors duration-200"
                    >
                        <UploadIcon className="w-4 h-4" />
                        <span>{htmlContent ? 'Upload New HTML' : 'Upload HTML'}</span>
                    </button>
                    {htmlContent && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleCopyDesign}
                                className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-pink-600 to-violet-600 rounded-lg hover:from-pink-700 hover:to-violet-700 transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                {isDesignCopied ? <><CheckCircleIcon className="w-5 h-5"/> Copied!</> : <><CursorClickIcon className="w-5 h-5"/> Copy Design</>}
                            </button>
                            <button
                                onClick={() => setIsCodeViewVisible(!isCodeViewVisible)}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${isCodeViewVisible ? 'bg-gray-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                            >
                                <CodeIcon className="w-5 h-5" />
                                <span>{isCodeViewVisible ? 'Hide Code' : 'View/Edit Code'}</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                {!htmlContent ? (
                    <div className="flex flex-col items-center justify-center flex-grow p-8 text-center text-gray-500">
                        <CursorClickIcon className="w-16 h-16 mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-300">Start by Uploading Your Template</h2>
                        <p className="mt-2 max-w-md">Upload or paste your email's HTML code to generate a live preview that you can copy and paste into any email client.</p>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row flex-grow min-h-0">
                        {/* Code Editor Panel (now first for mobile layout) */}
                        {isCodeViewVisible && (
                            <div className="lg:order-last w-full h-1/2 lg:h-full lg:w-1/2 flex flex-col bg-gray-900 border-b lg:border-b-0 lg:border-l border-gray-700">
                                <div className="flex justify-between items-center p-2 border-b border-gray-700 flex-shrink-0">
                                    <h3 className="text-sm font-semibold text-gray-400 px-2">HTML Code Editor</h3>
                                    <button onClick={handleCopyCode} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">
                                        <CopyIcon className="w-4 h-4" />
                                        <span>{isCodeCopied ? 'Copied!' : 'Copy Code'}</span>
                                    </button>
                                </div>
                                <div className="flex-grow relative overflow-hidden">
                                    <style>{`
                                        .code-editor-lines { scrollbar-width: none; } /* Firefox */
                                        .code-editor-lines::-webkit-scrollbar { display: none; } /* WebKit */
                                    `}</style>
                                    <div ref={lineNumbersRef} className="absolute left-0 top-0 h-full p-3 font-mono text-sm text-right text-gray-500 bg-gray-800/50 select-none overflow-y-scroll code-editor-lines">
                                        <pre className='leading-6'>{lineNumbers}</pre>
                                    </div>
                                    <textarea
                                        ref={codeTextAreaRef}
                                        value={htmlContent}
                                        onChange={e => setHtmlContent(e.target.value)}
                                        onScroll={syncScroll}
                                        spellCheck="false"
                                        className="w-full h-full p-3 pl-16 font-mono text-sm text-gray-300 bg-transparent resize-none border-0 focus:ring-0 leading-6"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Preview Panel */}
                        <div className={`transition-all duration-300 ease-in-out ${isCodeViewVisible ? 'w-full h-1/2 lg:h-full lg:w-1/2' : 'w-full h-full'}`}>
                            <iframe
                                ref={iframeRef}
                                srcDoc={htmlContent}
                                title="Email Design Preview"
                                className="w-full h-full border-0 bg-white"
                                sandbox="allow-scripts allow-same-origin"
                            />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default DesignCopierPage;