import React, { useState, useCallback, useEffect } from 'react';
import { UploadIcon, CopyIcon, DownloadIcon, SpinnerIcon, WandIcon } from '../components/Icons';
import UploadHtmlModal from '../components/modals/UploadHtmlModal';
import { minifyHtml } from '../services/htmlMinifier';
import type { MinifyOptions } from '../types';

const HtmlMinifierPage = () => {
    const [inputHtml, setInputHtml] = useState('');
    const [outputHtml, setOutputHtml] = useState('');
    const [isMinifying, setIsMinifying] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [minifyOptions, setMinifyOptions] = useState<MinifyOptions>({
        keepHead: false,
        keepStyles: false,
    });
    const [stats, setStats] = useState<{
        originalSize: number;
        minifiedSize: number;
        savedBytes: number;
        reductionPercent: string;
    } | null>(null);

    useEffect(() => {
        const schema = {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "EMLinter - HTML Minifier Tool",
          "applicationCategory": "DeveloperApplication",
          "operatingSystem": "Web/Online",
          "description": "Reduce your email's file size and improve loading speed. Our free HTML minifier removes comments and whitespace without breaking your code.",
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

    const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setMinifyOptions(prev => ({ ...prev, [name]: checked }));
        setOutputHtml('');
        setStats(null);
    };

    const handleMinify = useCallback(() => {
        if (!inputHtml) {
            setOutputHtml('');
            setStats(null);
            return;
        }
        setIsMinifying(true);
        setTimeout(() => {
            const minified = minifyHtml(inputHtml, minifyOptions);
            setOutputHtml(minified);

            const originalSize = new Blob([inputHtml]).size;
            const minifiedSize = new Blob([minified]).size;
            const savedBytes = originalSize - minifiedSize;
            const reductionPercent = originalSize > 0 ? ((savedBytes / originalSize) * 100).toFixed(2) : '0.00';
            
            setStats({
                originalSize,
                minifiedSize,
                savedBytes,
                reductionPercent
            });

            setIsMinifying(false);
        }, 300);
    }, [inputHtml, minifyOptions]);

    const handleUpload = (html: string) => {
        setInputHtml(html);
        setOutputHtml('');
        setStats(null);
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
        <>
            <title>HTML Email Minifier | Compress Your Code | EMLinter</title>
            <meta name="description" content="Reduce your email's file size and improve loading speed. Our free HTML minifier removes comments and whitespace without breaking your code." />
            <link rel="canonical" href="https://emlinter.app/html-minifier" />
            <UploadHtmlModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={handleUpload}
            />
            <header className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 pb-2">
                    HTML Minifier Tool
                </h1>
                <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
                    Compress your HTML code by removing comments, line breaks, and whitespace to reduce file size.
                </p>
            </header>
            
            <div className="bg-gray-800/50 rounded-xl shadow-2xl p-6 border border-gray-700">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Input Column */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="input-html" className="text-lg font-medium text-gray-300">
                                Original HTML
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
                            onChange={(e) => { setInputHtml(e.target.value); setOutputHtml(''); setStats(null); }}
                            className="w-full h-80 p-4 font-mono text-sm bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition resize-y"
                            placeholder="Paste your HTML code here..."
                        />
                    </div>

                    {/* Output Column */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="output-html" className="text-lg font-medium text-gray-300">
                                Minified HTML
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
                            placeholder="Compressed code will appear here..."
                        />
                    </div>
                </div>

                 <div className="mt-6 pt-6 border-t border-gray-700/50">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                        {/* Options */}
                        <div className="bg-gray-700/50 p-4 rounded-lg">
                             <h3 className="font-semibold text-gray-200 mb-2 text-center">Minification Options</h3>
                             <div className="flex flex-col sm:flex-row gap-x-6 gap-y-2">
                                <label className="flex items-center text-sm text-gray-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="keepHead"
                                        checked={minifyOptions.keepHead}
                                        onChange={handleOptionChange}
                                        className="h-4 w-4 rounded-sm border-gray-500 text-pink-600 focus:ring-pink-500 bg-gray-700 mr-2"
                                    />
                                    Don't minify &lt;head&gt;
                                </label>
                                 <label className="flex items-center text-sm text-gray-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="keepStyles"
                                        checked={minifyOptions.keepStyles}
                                        onChange={handleOptionChange}
                                        className="h-4 w-4 rounded-sm border-gray-500 text-pink-600 focus:ring-pink-500 bg-gray-700 mr-2"
                                    />
                                    Don't minify &lt;style&gt;
                                </label>
                            </div>
                        </div>
                        {/* Action Button */}
                        <button
                            onClick={handleMinify}
                            disabled={isMinifying || !inputHtml}
                            className="px-8 py-3 w-full sm:w-auto font-semibold text-white bg-gradient-to-r from-pink-600 to-violet-600 rounded-lg hover:from-pink-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition shadow-lg flex items-center justify-center"
                        >
                            {isMinifying ? (
                                <>
                                    <SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5" />
                                    Minifying...
                                </>
                            ) : (
                                <>
                                    <WandIcon className="-ml-1 mr-2 h-5 w-5" />
                                    Minify HTML
                                </>
                            )}
                        </button>
                    </div>
                </div>
                
                {stats && (
                    <div className="mt-6 pt-6 border-t border-gray-700/50">
                        <h3 className="text-lg font-semibold text-center text-gray-200 mb-4">Compression Statistics</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <p className="text-sm text-gray-400">Original Size</p>
                                <p className="text-xl font-bold text-gray-100">{formatBytes(stats.originalSize)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Minified Size</p>
                                <p className="text-xl font-bold text-cyan-400">{formatBytes(stats.minifiedSize)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Bytes Saved</p>
                                <p className="text-xl font-bold text-green-400">{formatBytes(stats.savedBytes)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Reduction</p>
                                <p className="text-xl font-bold text-pink-400">{stats.reductionPercent}%</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default HtmlMinifierPage;