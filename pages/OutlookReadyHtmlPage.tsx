import React, { useState, useCallback, useEffect } from 'react';
import { UploadIcon, CopyIcon, DownloadIcon, SpinnerIcon, WandIcon } from '../components/Icons';
import UploadHtmlModal from '../components/modals/UploadHtmlModal';

const OutlookReadyHtmlPage = () => {
    const [inputHtml, setInputHtml] = useState('');
    const [outputHtml, setOutputHtml] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [spacingValue, setSpacingValue] = useState('0.05');

    useEffect(() => {
        const schema = {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "EMLinter - Outlook HTML Sanitizer",
          "applicationCategory": "DeveloperApplication",
          "operatingSystem": "Web/Online",
          "description": "Automatically fix common spacing, padding, and border-collapse issues in Microsoft Outlook. Sanitize your HTML to ensure a consistent, professional look.",
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

    const sanitizeHtmlForOutlook = (html: string, spacing: string): string => {
        if (!html || !spacing) return html;

        const replacer = (match: string, tagName: string, attrs: string): string => {
            const styleRegex = /style\s*=\s*(["'])(.*?)\1/i;
            const styleMatch = attrs.match(styleRegex);

            if (!styleMatch) {
                // No style attribute, add it.
                const newAttrs = `${attrs} style="margin: ${spacing} !important; padding: ${spacing} !important;"`;
                return `<${tagName}${newAttrs}>`;
            } else {
                const quote = styleMatch[1];
                let styleValue = styleMatch[2];
                const originalStyleAttr = styleMatch[0];
                
                const styles = new Map<string, string>();
                styleValue.split(';').forEach(decl => {
                    if (decl.trim()) {
                        const parts = decl.split(':');
                        if (parts.length >= 2) {
                            const prop = parts[0].trim().toLowerCase();
                            const val = parts.slice(1).join(':').trim();
                            if (prop && val) styles.set(prop, val);
                        }
                    }
                });
                
                const isZeroValue = (val: string | undefined): boolean => {
                    if (!val) return false;
                    // This regex checks for one or more zero values with optional units, separated by spaces. e.g., "0", "0px", "0 0", "0px 0pt"
                    return /^\s*(0(px|pt|em|rem|%|in|cm|mm|pc)?\s*)+$/.test(val);
                };

                const hasNonZeroPadding = (styleMap: Map<string, string>): boolean => {
                    if (styleMap.has('padding') && !isZeroValue(styleMap.get('padding'))) {
                        return true;
                    }
                    const longhandPaddings = ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'];
                    for (const prop of longhandPaddings) {
                        if (styleMap.has(prop) && !isZeroValue(styleMap.get(prop))) {
                            return true;
                        }
                    }
                    return false;
                };

                const hasMargin = styles.has('margin');

                // Handle the special override case first: `margin:0; padding:0;`
                if (hasMargin && isZeroValue(styles.get('margin')) && styles.has('padding') && isZeroValue(styles.get('padding'))) {
                    let newStyleValue = styleValue;
                    if (newStyleValue.trim() && !newStyleValue.trim().endsWith(';')) {
                        newStyleValue += ';';
                    }
                    newStyleValue += ` margin: ${spacing} !important; padding: ${spacing} !important;`;
                    const newAttrs = attrs.replace(originalStyleAttr, `style=${quote}${newStyleValue}${quote}`);
                    return `<${tagName}${newAttrs}>`;
                }

                // Standard prepending logic
                const addMargin = !hasMargin;
                const addPadding = !hasNonZeroPadding(styles);

                let stylesToAdd: string[] = [];
                if (addMargin) {
                    stylesToAdd.push(`margin: ${spacing} !important`);
                }
                if (addPadding) {
                    stylesToAdd.push(`padding: ${spacing} !important`);
                }

                if (stylesToAdd.length > 0) {
                    let newStyleValue = stylesToAdd.join('; ');
                    if (styleValue.trim()) {
                        newStyleValue += '; ' + styleValue;
                    }
                    const newAttrs = attrs.replace(originalStyleAttr, `style=${quote}${newStyleValue}${quote}`);
                    return `<${tagName}${newAttrs}>`;
                }
                
                return match;
            }
        };

        const tagRegex = /<(table|td|th)((?:\s+(?:".*?"|'.*?'|[^>])*)?)>/gi;
        return html.replace(tagRegex, replacer);
    };

    const handleSanitize = useCallback(() => {
        if (!inputHtml) {
            setOutputHtml('');
            return;
        }
        setIsProcessing(true);
        setTimeout(() => {
            const bodyRegex = /(<body[^>]*>)([\s\S]*)(<\/body>)/i;
            const bodyMatch = inputHtml.match(bodyRegex);
            const spacing = `${spacingValue}pt`;

            if (bodyMatch && bodyMatch[2]) {
                const sanitizedBody = sanitizeHtmlForOutlook(bodyMatch[2], spacing);
                setOutputHtml(inputHtml.replace(bodyMatch[2], sanitizedBody));
            } else {
                const sanitizedHtml = sanitizeHtmlForOutlook(inputHtml, spacing);
                setOutputHtml(sanitizedHtml);
            }
            setIsProcessing(false);
        }, 300);
    }, [inputHtml, spacingValue]);

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
        link.setAttribute('download', 'outlook-ready-template.html');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <title>Outlook HTML Sanitizer & Fixer | EMLinter</title>
            <meta name="description" content="Automatically fix common spacing, padding, and border-collapse issues in Microsoft Outlook. Sanitize your HTML to ensure a consistent, professional look." />
            <link rel="canonical" href="https://emlinter.app/outlook-ready-html" />
            <UploadHtmlModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={handleUpload}
            />
            <header className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 pb-2">
                    Outlook HTML Sanitizer
                </h1>
                <p className="text-gray-400 mt-2 max-w-3xl mx-auto">
                    Fix common spacing and rendering issues in Outlook by automatically applying essential CSS to your tables and cells.
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
                            placeholder="Paste your email HTML code here..."
                        />
                    </div>

                    {/* Output Column */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="output-html" className="text-lg font-medium text-gray-300">
                                Sanitized HTML
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
                            placeholder="Your Outlook-ready code will appear here..."
                        />
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-700/50 flex flex-col sm:flex-row items-center justify-center gap-6">
                     <div>
                        <label htmlFor="spacing-value" className="block text-sm font-medium text-gray-400 text-center sm:text-left mb-1">Spacing Value</label>
                        <div className="relative w-full sm:w-32">
                             <input
                                id="spacing-value"
                                type="text"
                                value={spacingValue}
                                onChange={(e) => setSpacingValue(e.target.value)}
                                className="w-full px-3 py-2 text-sm text-center text-white bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none pr-9"
                            />
                             <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 text-sm pointer-events-none">pt</span>
                        </div>
                    </div>
                    <button
                        onClick={handleSanitize}
                        disabled={isProcessing || !inputHtml}
                        className="px-8 py-3 w-full sm:w-auto font-semibold text-white bg-gradient-to-r from-pink-600 to-violet-600 rounded-lg hover:from-pink-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition shadow-lg flex items-center justify-center"
                    >
                        {isProcessing ? (
                            <>
                                <SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <WandIcon className="-ml-1 mr-2 h-5 w-5" />
                                Sanitize for Outlook
                            </>
                        )}
                    </button>
                </div>
            </div>
        </>
    );
};

export default OutlookReadyHtmlPage;