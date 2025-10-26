import React, { useState, useMemo, useEffect } from 'react';
import { CopyIcon, SpinnerIcon } from '../components/Icons';

const DEFAULT_INNER_HTML = `<table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
        <td class="btxt" style="color:#ffffff; font-family:'Arial,sans-serif; font-size:32px; line-height:38px; font-style: italic; text-align:center;">
            Welcome to EMLinter
        </td>
    </tr>
</table>`;

// FIX: Renamed component to match file name and fix import error.
const OutlookBackgroundGeneratorPage: React.FC = () => {
    // State for all inputs
    const [backgroundColor, setBackgroundColor] = useState('#1b1d3d');
    const [backgroundImageUrl, setBackgroundImageUrl] = useState('https://mcusercontent.com/d626ff05627d1d76774c4c926/images/3f1a206a-5f93-4a1d-a9c8-04f7f63f5383.jpg');
    const [vmlImageUrl, setVmlImageUrl] = useState('https://mcusercontent.com/d626ff05627d1d76774c4c926/images/3f1a206a-5f93-4a1d-a9c8-04f7f63f5383.jpg');
    const [useSameUrl, setUseSameUrl] = useState(true);
    const [width, setWidth] = useState(600);
    const [height, setHeight] = useState(243);
    const [sidePadding, setSidePadding] = useState(30);
    const [innerHtml, setInnerHtml] = useState(DEFAULT_INNER_HTML);
    const [isCopied, setIsCopied] = useState(false);
    const [isCalculatingHeight, setIsCalculatingHeight] = useState(false);
    
    useEffect(() => {
        const schema = {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "EMLinter - Outlook Background Image Generator",
          "applicationCategory": "DeveloperApplication",
          "operatingSystem": "Web/Online",
          "description": "Generate VML-based background images that work flawlessly in Outlook. Our tool creates the necessary code to ensure your designs look stunning everywhere.",
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

    // Effect to sync VML image URL if checkbox is ticked
    useEffect(() => {
        if (useSameUrl) {
            setVmlImageUrl(backgroundImageUrl);
        }
    }, [backgroundImageUrl, useSameUrl]);

    // Memoized generated code
    const generatedCode = useMemo(() => {
        const finalVmlUrl = vmlImageUrl || backgroundImageUrl; // Fallback for VML
        return `<table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
        <td bgcolor="${backgroundColor}" background="${backgroundImageUrl}" valign="middle" style="background-color: ${backgroundColor}; background: url('${backgroundImageUrl}'); background-repeat: no-repeat; background-position: center; background-size: cover;">
            <!--[if gte mso 9]>
            <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:${width}px; height: ${height}px;">
            <v:fill type="frame" src="${finalVmlUrl}" color="${backgroundColor}" />
            <v:textbox inset="0,0,0,0">
            <![endif]-->
            <div>
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                        <td class="content-spacing" height="${height}" width="${sidePadding}" style="font-size:0pt; line-height:0pt; text-align:left;"></td>
                        <td valign="middle">
                            ${innerHtml.trim()}
                        </td>
                        <td class="content-spacing" height="${height}" width="${sidePadding}" style="font-size:0pt; line-height:0pt; text-align:left;"></td>
                    </tr>
                </table>
            </div>
            <!--[if gte mso 9]>
            </v:textbox>
            </v:rect>
            <![endif]-->
        </td>
    </tr>
</table>`;
    }, [backgroundColor, backgroundImageUrl, vmlImageUrl, width, height, sidePadding, innerHtml]);
    
    const handleAutoHeight = () => {
        if (!backgroundImageUrl || !width || width <= 0) {
            alert("Please provide a valid background image URL and a positive width first.");
            return;
        }
        setIsCalculatingHeight(true);
        const img = new Image();
        img.onload = () => {
            if (img.naturalWidth > 0) {
                const aspectRatio = img.naturalHeight / img.naturalWidth;
                const newHeight = Math.round(width * aspectRatio);
                setHeight(newHeight);
            }
            setIsCalculatingHeight(false);
        };
        img.onerror = () => {
            alert("Could not load the image to calculate height. Please check the URL and ensure it's accessible.");
            setIsCalculatingHeight(false);
        };
        img.src = backgroundImageUrl;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedCode);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <>
            <title>Bulletproof VML Background Image Generator for Outlook | EMLinter</title>
            <meta name="description" content="Generate VML-based background images that work flawlessly in Outlook. Our tool creates the necessary code to ensure your designs look stunning everywhere." />
            <link rel="canonical" href="https://emlinter.app/outlook-background-generator" />
            <div>
                <header className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 pb-2">
                        Bulletproof Outlook Background Image Generator
                    </h1>
                    <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
                        Effortlessly create VML-based background images that render perfectly in all versions of Microsoft Outlook, ensuring your designs look stunning everywhere.
                    </p>
                </header>
                
                 <div className="bg-gray-800/50 rounded-xl shadow-2xl p-6 border border-gray-700 mb-8">
                    <h3 className="text-lg font-semibold text-gray-300 mb-4 text-center">Live Preview</h3>
                    <div className="flex-grow bg-white p-4 rounded-md flex items-center justify-center min-h-[200px] overflow-x-auto">
                        <div dangerouslySetInnerHTML={{ __html: generatedCode }} style={{width: `${width}px`, flexShrink: 0}} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Controls */}
                    <div className="lg:col-span-3 bg-gray-800/50 rounded-xl shadow-2xl p-6 border border-gray-700 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Fallback background color</label>
                                <div className="flex items-center bg-gray-900 border border-gray-600 rounded-md focus-within:ring-2 focus-within:ring-pink-500">
                                    <input type="color" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} className="w-10 h-10 p-1 bg-transparent border-0 cursor-pointer" />
                                    <input type="text" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} className="w-full px-3 py-2 text-sm text-white bg-transparent focus:outline-none" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Background image URL</label>
                            <input type="text" value={backgroundImageUrl} onChange={e => setBackgroundImageUrl(e.target.value)} className="w-full px-3 py-2 text-sm text-white bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none" />
                            <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-xs text-gray-400 mt-2 space-y-1">
                                <p><strong>Note:</strong> Direct image uploading is disabled for privacy reasons.</p>
                                <p>Please upload your image to a service like <a href="https://imgbb.com/" target="_blank" rel="noopener noreferrer" className="text-pink-400 underline hover:text-pink-300">ImgBB</a> or <a href="https://postimages.org/" target="_blank" rel="noopener noreferrer" className="text-pink-400 underline hover:text-pink-300">Postimages</a> and paste the direct image URL.</p>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <input id="same-url" type="checkbox" checked={useSameUrl} onChange={e => setUseSameUrl(e.target.checked)} className="h-4 w-4 rounded border-gray-500 text-pink-600 focus:ring-pink-500 bg-gray-700" />
                                <label htmlFor="same-url" className="block text-sm font-medium text-gray-300">Use same image for VML</label>
                            </div>
                            <input type="text" value={vmlImageUrl} onChange={e => setVmlImageUrl(e.target.value)} disabled={useSameUrl} className="w-full px-3 py-2 text-sm text-white bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Width</label>
                                <div className="relative">
                                    <input type="number" value={width} onChange={e => setWidth(parseInt(e.target.value, 10))} className="w-full px-3 py-2 text-sm text-white bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none" />
                                    <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 text-sm">px</span>
                                </div>
                            </div>
                             <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label htmlFor="height-input" className="block text-sm font-medium text-gray-300">Height</label>
                                    <button 
                                        onClick={handleAutoHeight} 
                                        disabled={isCalculatingHeight || !backgroundImageUrl || !width || width <= 0} 
                                        className="text-xs text-violet-400 hover:text-violet-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                        title="Calculate height based on image aspect ratio and current width"
                                    >
                                        {isCalculatingHeight ? (
                                            <>
                                                <SpinnerIcon className="w-3 h-3 animate-spin"/>
                                                <span>Calculating...</span>
                                            </>
                                        ) : (
                                            'Auto-height from image'
                                        )}
                                    </button>
                                </div>
                                <div className="relative">
                                    <input id="height-input" type="number" value={height} onChange={e => setHeight(parseInt(e.target.value, 10))} className="w-full px-3 py-2 text-sm text-white bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none" />
                                    <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 text-sm">px</span>
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Side Padding</label>
                                <div className="relative">
                                    <input type="number" value={sidePadding} onChange={e => setSidePadding(parseInt(e.target.value, 10))} className="w-full px-3 py-2 text-sm text-white bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none" />
                                    <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 text-sm">px</span>
                                </div>
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Inner HTML Content</label>
                            <textarea
                                value={innerHtml}
                                onChange={(e) => setInnerHtml(e.target.value)}
                                className="w-full h-32 p-3 font-mono text-xs bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition resize-y"
                                placeholder="<p>Your content here...</p>"
                            />
                        </div>
                    </div>

                    {/* Generated Code */}
                    <div className="lg:col-span-2">
                        <div className="bg-gray-800/50 rounded-xl shadow-2xl p-6 border border-gray-700 flex flex-col h-full">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-300">Generated Code</h3>
                                <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">
                                    <CopyIcon className="w-4 h-4" />
                                    <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                                </button>
                            </div>
                            <pre className="bg-gray-900 p-3 rounded-lg text-xs text-gray-300 font-mono overflow-x-auto flex-grow h-48">
                                <code>{generatedCode}</code>
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
export default OutlookBackgroundGeneratorPage;