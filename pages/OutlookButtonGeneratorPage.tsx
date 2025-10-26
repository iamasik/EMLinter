import React, { useState, useMemo, useEffect } from 'react';
import { CopyIcon } from '../components/Icons';

const defaultSettings = {
    buttonText: 'Show me the button!',
    buttonUrl: 'http://',
    backgroundColor: '#556270',
    textColor: '#ffffff',
    buttonWidth: 200,
    buttonHeight: 40,
    useBorder: true,
    borderColor: '#1e3650',
    useBorderRadius: true,
    borderRadius: 4,
    fontFamily: 'sans-serif',
    fontSize: 13,
    fontWeight: 'bold',
    useBackgroundImage: false,
    backgroundImageUrl: '',
};

const emailSafeFonts = [
    'sans-serif',
    'Arial, Helvetica, sans-serif',
    '\'Arial Black\', Gadget, sans-serif',
    '\'Comic Sans MS\', cursive, sans-serif',
    'Impact, Charcoal, sans-serif',
    '\'Lucida Sans Unicode\', \'Lucida Grande\', sans-serif',
    'Tahoma, Geneva, sans-serif',
    '\'Trebuchet MS\', Helvetica, sans-serif',
    'Verdana, Geneva, sans-serif',
    'serif',
    'Georgia, serif',
    '\'Palatino Linotype\', \'Book Antiqua\', Palatino, serif',
    '\'Times New Roman\', Times, serif',
    'monospace',
    '\'Courier New\', Courier, monospace',
    '\'Lucida Console\', Monaco, monospace',
];


const OutlookButtonGeneratorPage: React.FC = () => {
    const [settings, setSettings] = useState(defaultSettings);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        const schema = {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "EMLinter - Outlook VML Button Generator",
          "applicationCategory": "DeveloperApplication",
          "operatingSystem": "Web/Online",
          "description": "Create beautiful, bulletproof VML buttons that render perfectly in every version of Microsoft Outlook. Customize the style, color, and size, and copy the code.",
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

    const {
        buttonText, buttonUrl, backgroundColor, textColor, buttonWidth, buttonHeight,
        useBorder, borderColor, useBorderRadius, borderRadius, fontFamily, fontSize, fontWeight,
        useBackgroundImage, backgroundImageUrl
    } = settings;

    const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        // FIX: Use a more explicit check for checkboxes to avoid misidentifying other input types.
        const isCheckbox = type === 'checkbox';
        const isNumeric = type === 'number';

        setSettings(prev => ({
            ...prev,
            [name]: isCheckbox 
                ? (e.target as HTMLInputElement).checked 
                : (isNumeric ? parseInt(value, 10) || 0 : value)
        }));
    };

    const handleReset = () => {
        setSettings(defaultSettings);
    };

    const generatedCode = useMemo(() => {
        const vmlArcSize = useBorderRadius ? `${Math.round((borderRadius / Math.min(buttonWidth, buttonHeight)) * 500)}%` : '0%';
        const htmlBorderRadius = useBorderRadius ? `${borderRadius}px` : '0px';
        const hasBgImage = useBackgroundImage && backgroundImageUrl;

        // The logic forks here. The "with border" structure is also used for background images for robustness.
        if (useBorder || hasBgImage) {
            // --- BORDER / BACKGROUND IMAGE PATH (HYBRID METHOD) ---

            const vmlStroke = useBorder ? `strokecolor="${borderColor}"` : 'stroke="f"';
            const vmlFill = hasBgImage
                ? `fill="t"><v:fill type="tile" src="${backgroundImageUrl}" color="${backgroundColor}" />`
                : `fillcolor="${backgroundColor}"`;

            const htmlStyles = [
                `background-color:${backgroundColor}`,
                hasBgImage ? `background-image:url(${backgroundImageUrl})` : null,
                useBorder ? `border:1px solid ${borderColor}` : null,
                `border-radius:${htmlBorderRadius}`,
                `color:${textColor}`,
                'display:inline-block',
                `font-family:${fontFamily}`,
                `font-size:${fontSize}px`,
                `font-weight:${fontWeight}`,
                `line-height:${buttonHeight}px`,
                'text-align:center',
                'text-decoration:none',
                `width:${buttonWidth}px`,
                '-webkit-text-size-adjust:none',
                'mso-hide:all'
            ].filter(Boolean).join(';');

            return `<div><!--[if mso]>
  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${buttonUrl}" style="height:${buttonHeight}px;v-text-anchor:middle;width:${buttonWidth}px;" arcsize="${vmlArcSize}" ${vmlStroke} ${vmlFill}>
    <w:anchorlock/>
    <center style="color:${textColor};font-family:${fontFamily};font-size:${fontSize}px;font-weight:${fontWeight};">${buttonText}</center>
  </v:roundrect>
<![endif]--><a href="${buttonUrl}"
style="${htmlStyles}">${buttonText}</a></div>`;

        } else {
            // --- NO BORDER / NO BACKGROUND IMAGE PATH (NESTED LINK METHOD) ---

            const htmlStyles = [
                `background-color:${backgroundColor}`,
                `border-radius:${htmlBorderRadius}`,
                `color:${textColor}`,
                'display:inline-block',
                `font-family:${fontFamily}`,
                `font-size:${fontSize}px`,
                `font-weight:${fontWeight}`,
                `line-height:${buttonHeight}px`,
                'text-align:center',
                'text-decoration:none',
                `width:${buttonWidth}px`,
                '-webkit-text-size-adjust:none'
            ].filter(Boolean).join(';');

            return `<div><!--[if mso]>
  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${buttonUrl}" style="height:${buttonHeight}px;v-text-anchor:middle;width:${buttonWidth}px;" arcsize="${vmlArcSize}" stroke="f" fillcolor="${backgroundColor}">
    <w:anchorlock/>
    <center>
  <![endif]-->
      <a href="${buttonUrl}"
style="${htmlStyles}">${buttonText}</a>
  <!--[if mso]>
    </center>
  </v:roundrect>
<![endif]--></div>`;
        }
    }, [settings]);


    const fallbackHtml = useMemo(() => {
        const htmlBorderRadius = useBorderRadius ? `${borderRadius}px` : '0px';

        const htmlStyles = [
            `background-color:${backgroundColor}`,
            (useBackgroundImage && backgroundImageUrl) ? `background-image:url(${backgroundImageUrl})` : null,
            useBorder ? `border:1px solid ${borderColor}` : null,
            `border-radius:${htmlBorderRadius}`,
            `color:${textColor}`,
            'display:inline-block',
            `font-family:${fontFamily}`,
            `font-size:${fontSize}px`,
            `font-weight:${fontWeight}`,
            `line-height:${buttonHeight}px`,
            'text-align:center',
            'text-decoration:none',
            `width:${buttonWidth}px`,
        ].filter(Boolean).join(';');

        return `<a href="${buttonUrl}" style="${htmlStyles}">${buttonText}</a>`;
    }, [settings]);
    
    const handleCopy = () => {
        navigator.clipboard.writeText(generatedCode);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <>
            <title>Bulletproof VML Button Generator for Outlook | EMLinter</title>
            <meta name="description" content="Create beautiful, bulletproof VML buttons that render perfectly in every version of Microsoft Outlook. Customize the style, color, and size, and copy the code." />
            <link rel="canonical" href="https://emlinter.app/outlook-button-generator" />
            <div>
                <header className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 pb-2">
                        Outlook VML Button Generator
                    </h1>
                    <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
                        Create beautiful, bulletproof VML buttons that render perfectly in all versions of Microsoft Outlook.
                    </p>
                </header>
                
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Controls */}
                    <div className="lg:col-span-3 bg-gray-800/50 rounded-xl shadow-2xl p-6 border border-gray-700 space-y-6">
                        {/* Group: Content */}
                        <div className="bg-gray-700/40 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-200 mb-3">Content</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Button text</label>
                                    <input type="text" name="buttonText" value={buttonText} onChange={handleSettingChange} className="w-full px-3 py-2 text-sm text-white bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none" />
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Button URL</label>
                                    <input type="url" name="buttonUrl" value={buttonUrl} onChange={handleSettingChange} className="w-full px-3 py-2 text-sm text-white bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none" />
                                </div>
                            </div>
                        </div>
                        
                        {/* Group: Appearance */}
                         <div className="bg-gray-700/40 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-200 mb-3">Appearance</h3>
                             <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Background color</label>
                                        <div className="flex items-center bg-gray-900 border border-gray-600 rounded-md focus-within:ring-2 focus-within:ring-pink-500">
                                            <input type="color" name="backgroundColor" value={backgroundColor} onChange={handleSettingChange} className="w-10 h-10 p-1 bg-transparent border-0 cursor-pointer" />
                                            <input type="text" name="backgroundColor" value={backgroundColor} onChange={handleSettingChange} className="w-full px-3 py-2 text-sm text-white bg-transparent focus:outline-none" />
                                        </div>
                                    </div>
                                     <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Text color</label>
                                        <div className="flex items-center bg-gray-900 border border-gray-600 rounded-md focus-within:ring-2 focus-within:ring-pink-500">
                                            <input type="color" name="textColor" value={textColor} onChange={handleSettingChange} className="w-10 h-10 p-1 bg-transparent border-0 cursor-pointer" />
                                            <input type="text" name="textColor" value={textColor} onChange={handleSettingChange} className="w-full px-3 py-2 text-sm text-white bg-transparent focus:outline-none" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center mb-1">
                                        <input id="use-border" name="useBorder" type="checkbox" checked={useBorder} onChange={handleSettingChange} className="h-4 w-4 rounded border-gray-500 text-pink-600 focus:ring-pink-500 bg-gray-700" />
                                        <label htmlFor="use-border" className="ml-2 block text-sm font-medium text-gray-300">Border</label>
                                    </div>
                                    <div className={`flex items-center bg-gray-900 border border-gray-600 rounded-md transition-opacity ${useBorder ? 'opacity-100' : 'opacity-50'}`}>
                                        <input type="color" name="borderColor" value={borderColor} onChange={handleSettingChange} disabled={!useBorder} className="w-10 h-10 p-1 bg-transparent border-0 cursor-pointer disabled:cursor-not-allowed" />
                                        <input type="text" name="borderColor" value={borderColor} onChange={handleSettingChange} disabled={!useBorder} className="w-full px-3 py-2 text-sm text-white bg-transparent focus:outline-none disabled:cursor-not-allowed" />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center mb-2">
                                        <input id="use-background-image" name="useBackgroundImage" type="checkbox" checked={useBackgroundImage} onChange={handleSettingChange} className="h-4 w-4 rounded border-gray-500 text-pink-600 focus:ring-pink-500 bg-gray-700" />
                                        <label htmlFor="use-background-image" className="ml-2 block text-sm font-medium text-gray-300">Background Image</label>
                                    </div>
                                    <div className={`transition-opacity space-y-2 ${useBackgroundImage ? 'opacity-100' : 'opacity-50'}`}>
                                        <input type="url" name="backgroundImageUrl" value={backgroundImageUrl} onChange={handleSettingChange} disabled={!useBackgroundImage} placeholder="https://example.com/image.png" className="w-full px-3 py-2 text-sm text-white bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:cursor-not-allowed" />
                                        <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-xs text-gray-400 space-y-1">
                                            <p><strong>Note:</strong> Direct image uploading is disabled for privacy reasons.</p>
                                            <p>Please upload your image to a service like <a href="https://imgbb.com/" target="_blank" rel="noopener noreferrer" className="text-pink-400 underline hover:text-pink-300">ImgBB</a> or <a href="https://postimages.org/" target="_blank" rel="noopener noreferrer" className="text-pink-400 underline hover:text-pink-300">Postimages</a> and paste the direct image URL.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Group: Typography */}
                        <div className="bg-gray-700/40 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-200 mb-3">Typography</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Font family</label>
                                    <select name="fontFamily" value={fontFamily} onChange={handleSettingChange} className="w-full px-3 py-2 text-sm text-white bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none">
                                        {emailSafeFonts.map(font => (
                                            <option key={font} value={font}>{font.split(',')[0].replace(/'/g, '')}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Font size</label>
                                        <div className="relative">
                                            <input type="number" name="fontSize" value={fontSize} onChange={handleSettingChange} className="w-full px-3 py-2 text-sm text-white bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none" />
                                            <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 text-sm">px</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Font weight</label>
                                        <select name="fontWeight" value={fontWeight} onChange={handleSettingChange} className="w-full px-3 py-2 text-sm text-white bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none">
                                            <option value="normal">Normal</option>
                                            <option value="bold">Bold</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Group: Sizing */}
                         <div className="bg-gray-700/40 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-200 mb-3">Sizing</h3>
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Width</label>
                                    <div className="relative">
                                        <input type="number" name="buttonWidth" value={buttonWidth} onChange={handleSettingChange} className="w-full px-3 py-2 text-sm text-white bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none" />
                                        <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 text-sm">px</span>
                                    </div>
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Height</label>
                                    <div className="relative">
                                        <input type="number" name="buttonHeight" value={buttonHeight} onChange={handleSettingChange} className="w-full px-3 py-2 text-sm text-white bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none" />
                                        <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 text-sm">px</span>
                                    </div>
                                </div>
                                 <div>
                                    <div className="flex items-center mb-1">
                                        <input id="use-radius" name="useBorderRadius" type="checkbox" checked={useBorderRadius} onChange={handleSettingChange} className="h-4 w-4 rounded border-gray-500 text-pink-600 focus:ring-pink-500 bg-gray-700" />
                                        <label htmlFor="use-radius" className="ml-2 block text-sm font-medium text-gray-300">Radius</label>
                                    </div>
                                    <div className={`relative transition-opacity ${useBorderRadius ? 'opacity-100' : 'opacity-50'}`}>
                                        <input type="number" name="borderRadius" value={borderRadius} onChange={handleSettingChange} disabled={!useBorderRadius} className="w-full px-3 py-2 text-sm text-white bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:cursor-not-allowed" />
                                        <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 text-sm">px</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                         <div className="pt-2">
                            <button onClick={handleReset} className="w-full px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                                Reset to Defaults
                            </button>
                        </div>
                    </div>

                    {/* Preview and Code */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-gray-800/50 rounded-xl shadow-2xl p-6 border border-gray-700 h-40 flex flex-col">
                            <h3 className="text-lg font-semibold text-gray-300 mb-4">Preview</h3>
                            <div className="flex-grow bg-white p-4 rounded-md flex items-center justify-center overflow-hidden">
                                 <div dangerouslySetInnerHTML={{ __html: fallbackHtml }} />
                            </div>
                        </div>
                        <div className="bg-gray-800/50 rounded-xl shadow-2xl p-6 border border-gray-700 flex flex-col">
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
export default OutlookButtonGeneratorPage;