import React, { useState, useCallback, useEffect } from 'react';
import { UploadIcon, CopyIcon, DownloadIcon, SpinnerIcon } from '../components/Icons';
import UploadHtmlModal from '../components/modals/UploadHtmlModal';
import { beautifyHtml } from '../services/htmlBeautifier';

const BeautifyCodePage = () => {
    const [inputHtml, setInputHtml] = useState('');
    const [outputHtml, setOutputHtml] = useState('');
    const [isBeautifying, setIsBeautifying] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    useEffect(() => {
        const schema = {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "EMLinter - HTML Email Beautifier",
          "applicationCategory": "DeveloperApplication",
          "operatingSystem": "Web/Online",
          "description": "Instantly clean up messy or minified email code. Our free online formatter makes your HTML readable and perfectly indented for easy debugging.",
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

    const handleBeautify = useCallback(() => {
        if (!inputHtml) {
            setOutputHtml('');
            return;
        }
        setIsBeautifying(true);
        // Simulate a short delay for better UX
        setTimeout(() => {
            const formattedHtml = beautifyHtml(inputHtml);
            setOutputHtml(formattedHtml);
            setIsBeautifying(false);
        }, 300);
    }, [inputHtml]);

    const handleUpload = (html: string) => {
        setInputHtml(html);
        setOutputHtml('');
    };

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
        <>
            <title>HTML Email Beautifier & Formatter | EMLinter</title>
            <meta name="description" content="Instantly clean up messy or minified email code. Our free online formatter makes your HTML readable and perfectly indented for easy debugging." />
            <link rel="canonical" href="https://emlinter.app/beautify-code" />
            <UploadHtmlModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={handleUpload}
            />
            <header className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 pb-2">
                    HTML Email Beautifier
                </h1>
                <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
                    Clean up, format, and indent your messy or minified HTML code to make it readable and easy to maintain.
                </p>
            </header>
            
            <div className="bg-gray-800/50 rounded-xl shadow-2xl p-6 border border-gray-700">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Input Column */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="input-html" className="text-lg font-medium text-gray-300">
                                Your HTML
                            </label>
                            <button
                                onClick={() => setIsUploadModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-violet-300 bg-violet-800/30 rounded-lg hover:bg-violet-800/60 transition-colors"
                            >
                                <UploadIcon className="w-4 h-4" />
                                <span>Upload</span>
                            </button>
                        </div>
                        <textarea
                            id="input-html"
                            value={inputHtml}
                            onChange={(e) => { setInputHtml(e.target.value); setOutputHtml(''); }}
                            className="w-full h-80 p-4 font-mono text-sm bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition resize-y"
                            placeholder="Paste your compact or messy HTML here..."
                        />
                    </div>

                    {/* Output Column */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="output-html" className="text-lg font-medium text-gray-300">
                                Beautified HTML
                            </label>
                            {outputHtml && (
                                <div className="flex items-center gap-2">
                                    <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                                        <CopyIcon className="w-4 h-4" />
                                        <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                                    </button>
                                    <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                                        <DownloadIcon className="w-4 h-4" />
                                        <span>Download</span>
                                    </button>
                                </div>
                            )}
                        </div>
                        <textarea
                            id="output-html"
                            value={outputHtml}
                            readOnly
                            className="w-full h-80 p-4 font-mono text-sm bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition resize-y"
                            placeholder="Formatted code will appear here..."
                        />
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-700/50 text-center">
                    <button
                        onClick={handleBeautify}
                        disabled={isBeautifying || !inputHtml}
                        className="px-8 py-3 font-semibold text-white bg-gradient-to-r from-pink-600 to-violet-600 rounded-lg hover:from-pink-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition shadow-lg flex items-center justify-center mx-auto"
                    >
                        {isBeautifying ? (
                            <>
                                <SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5" />
                                Beautifying...
                            </>
                        ) : (
                            'Beautify HTML'
                        )}
                    </button>
                </div>
            </div>
        </>
    );
};

export default BeautifyCodePage;