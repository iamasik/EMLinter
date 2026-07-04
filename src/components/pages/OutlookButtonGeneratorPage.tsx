import React, { useState, useMemo } from 'react';
import { CopyIcon } from '../Icons';
import PageHero from '../PageHero';
import SeoFaq from '../SeoFaq';

const defaultSettings = {
    buttonText: 'Show me the button',
    buttonUrl: 'https://example.com',
    backgroundColor: '#ec4899',
    textColor: '#ffffff',
    buttonWidth: 220,
    buttonHeight: 48,
    useBorder: false,
    borderColor: '#1e3650',
    useBorderRadius: true,
    borderRadius: 8,
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: 14,
    fontWeight: 'bold',
    useBackgroundImage: false,
    backgroundImageUrl: '',
};

const emailSafeFonts = [
    'Arial, Helvetica, sans-serif',
    "'Arial Black', Gadget, sans-serif",
    "'Comic Sans MS', cursive, sans-serif",
    'Impact, Charcoal, sans-serif',
    "'Lucida Sans Unicode', 'Lucida Grande', sans-serif",
    'Tahoma, Geneva, sans-serif',
    "'Trebuchet MS', Helvetica, sans-serif",
    'Verdana, Geneva, sans-serif',
    'Georgia, serif',
    "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
    "'Times New Roman', Times, serif",
    "'Courier New', Courier, monospace",
];

const faqs = [
    {
        question: 'What is a bulletproof button in HTML email?',
        answer: 'A bulletproof button is an email CTA that renders identically across every email client, including Microsoft Outlook for Windows. Outlook does not support CSS padding on anchor tags or CSS border-radius, so a normal HTML button collapses or loses its rounded corners. Bulletproof buttons wrap the CTA in VML <v:roundrect> code so Outlook reads it as a vector shape — same colors, same dimensions, same rounded corners as every other client.',
    },
    {
        question: 'How does this html email button generator work?',
        answer: 'You set the text, URL, colors, dimensions, and corner radius for your email button, and the generator emits a single block of HTML that contains both the modern CSS path and the VML fallback path. Outlook clients use the VML; everyone else uses the CSS. You copy and paste — no manual VML editing.',
    },
    {
        question: 'Do bulletproof email buttons work in Gmail and Apple Mail?',
        answer: 'Yes. The VML block is wrapped in <!--[if mso]> conditional comments, which only Outlook reads. Every other client — Gmail, Apple Mail, Yahoo, ProtonMail — sees the conditional as a regular HTML comment and ignores it, falling through to the modern <a> tag with inline CSS.',
    },
    {
        question: 'Why not just use a normal HTML button or image button?',
        answer: 'A normal <button> element is ignored or restyled by most email clients. An image button works but kills your CTA if images are blocked (which Outlook does by default). A bulletproof email button using VML is the only option that is text-based (loads instantly, accessible, image-block-safe) and visually identical across clients.',
    },
    {
        question: 'Can I add background images to bulletproof buttons?',
        answer: 'Yes. The generator supports VML <v:fill type="tile"> for buttons with tiled background images. Useful for textured CTAs and gradient effects that need to survive Outlook\'s VML renderer. Note: gradients in Outlook only support two-color tiles, so keep it simple.',
    },
    {
        question: 'Are these bulletproof email buttons accessible?',
        answer: 'Yes. The output is plain text inside a real anchor tag, which means screen readers announce the link, the button text is selectable, and color-contrast tools can verify it. The VML version is hidden from accessibility tools by default — only the visual rendering uses it.',
    },
];

const OutlookButtonGeneratorPage: React.FC = () => {
    const [settings, setSettings] = useState(defaultSettings);
    const [isCopied, setIsCopied] = useState(false);

    const {
        buttonText, buttonUrl, backgroundColor, textColor, buttonWidth, buttonHeight,
        useBorder, borderColor, useBorderRadius, borderRadius, fontFamily, fontSize, fontWeight,
        useBackgroundImage, backgroundImageUrl,
    } = settings;

    const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const isNumeric = type === 'number';
        setSettings((prev) => ({
            ...prev,
            [name]: isCheckbox ? (e.target as HTMLInputElement).checked : isNumeric ? parseInt(value, 10) || 0 : value,
        }));
    };

    const handleReset = () => setSettings(defaultSettings);

    const generatedCode = useMemo(() => {
        const vmlArcSize = useBorderRadius ? `${Math.round((borderRadius / Math.min(buttonWidth, buttonHeight)) * 500)}%` : '0%';
        const htmlBorderRadius = useBorderRadius ? `${borderRadius}px` : '0px';
        const hasBgImage = useBackgroundImage && backgroundImageUrl;

        if (useBorder || hasBgImage) {
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
                'mso-hide:all',
            ].filter(Boolean).join(';');
            return `<div><!--[if mso]>
  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${buttonUrl}" style="height:${buttonHeight}px;v-text-anchor:middle;width:${buttonWidth}px;" arcsize="${vmlArcSize}" ${vmlStroke} ${vmlFill}>
    <w:anchorlock/>
    <center style="color:${textColor};font-family:${fontFamily};font-size:${fontSize}px;font-weight:${fontWeight};">${buttonText}</center>
  </v:roundrect>
<![endif]--><a href="${buttonUrl}"
style="${htmlStyles}">${buttonText}</a></div>`;
        }

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
            '-webkit-text-size-adjust:none',
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
    }, [settings]);

    const fallbackHtml = useMemo(() => {
        const htmlBorderRadius = useBorderRadius ? `${borderRadius}px` : '0px';
        const htmlStyles = [
            `background-color:${backgroundColor}`,
            useBackgroundImage && backgroundImageUrl ? `background-image:url(${backgroundImageUrl})` : null,
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

    const inputCls = 'w-full px-3 py-2 text-sm text-white bg-ink-950/80 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-400 focus:outline-none';
    const colorWrap = 'flex items-center bg-ink-950/80 border border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-400';

    return (
        <div>
            <PageHero
                eyebrow="Bulletproof Outlook Button Generator"
                title={
                    <>
                        Make a <span className="gradient-text">bulletproof button</span> that survives every version of Outlook.
                    </>
                }
                subtitle="Free html email button generator that emits VML + CSS hybrid code. Customize colors, size, font, and corners — get production-ready bulletproof email buttons that render identically in Outlook, Gmail, and Apple Mail."
            >
                <a href="#preview" className="btn-primary">Generate a button</a>
                <a href="/solutions/outlook-background-generator" className="btn-secondary">Outlook backgrounds</a>
            </PageHero>

            <div id="preview" className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-16">
                <div className="lg:col-span-3 card p-6 space-y-5">
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                        <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Content</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-ink-200 mb-1.5">Button text</label>
                                <input type="text" name="buttonText" value={buttonText} onChange={handleSettingChange} className={inputCls} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-ink-200 mb-1.5">Button URL</label>
                                <input type="url" name="buttonUrl" value={buttonUrl} onChange={handleSettingChange} className={inputCls} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                        <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Appearance</h3>
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-ink-200 mb-1.5">Background</label>
                                    <div className={colorWrap}>
                                        <input type="color" name="backgroundColor" value={backgroundColor} onChange={handleSettingChange} className="w-10 h-10 p-1 bg-transparent border-0 cursor-pointer" />
                                        <input type="text" name="backgroundColor" value={backgroundColor} onChange={handleSettingChange} className="w-full px-3 py-2 text-sm text-white bg-transparent focus:outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-ink-200 mb-1.5">Text color</label>
                                    <div className={colorWrap}>
                                        <input type="color" name="textColor" value={textColor} onChange={handleSettingChange} className="w-10 h-10 p-1 bg-transparent border-0 cursor-pointer" />
                                        <input type="text" name="textColor" value={textColor} onChange={handleSettingChange} className="w-full px-3 py-2 text-sm text-white bg-transparent focus:outline-none" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center mb-1.5">
                                    <input id="use-border" name="useBorder" type="checkbox" checked={useBorder} onChange={handleSettingChange} className="h-4 w-4 rounded border-white/20 text-brand-500 focus:ring-brand-400 bg-ink-900" />
                                    <label htmlFor="use-border" className="ml-2 text-sm font-medium text-ink-200">Border</label>
                                </div>
                                <div className={`${colorWrap} ${useBorder ? '' : 'opacity-50'}`}>
                                    <input type="color" name="borderColor" value={borderColor} onChange={handleSettingChange} disabled={!useBorder} className="w-10 h-10 p-1 bg-transparent border-0 cursor-pointer disabled:cursor-not-allowed" />
                                    <input type="text" name="borderColor" value={borderColor} onChange={handleSettingChange} disabled={!useBorder} className="w-full px-3 py-2 text-sm text-white bg-transparent focus:outline-none" />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center mb-1.5">
                                    <input id="use-bg-image" name="useBackgroundImage" type="checkbox" checked={useBackgroundImage} onChange={handleSettingChange} className="h-4 w-4 rounded border-white/20 text-brand-500 focus:ring-brand-400 bg-ink-900" />
                                    <label htmlFor="use-bg-image" className="ml-2 text-sm font-medium text-ink-200">Background image</label>
                                </div>
                                <input type="url" name="backgroundImageUrl" value={backgroundImageUrl} onChange={handleSettingChange} disabled={!useBackgroundImage} placeholder="https://example.com/texture.png" className={`${inputCls} ${useBackgroundImage ? '' : 'opacity-50'}`} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                        <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Typography</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-ink-200 mb-1.5">Font family</label>
                                <select name="fontFamily" value={fontFamily} onChange={handleSettingChange} className={inputCls}>
                                    {emailSafeFonts.map((font) => (<option key={font} value={font}>{font.split(',')[0].replace(/'/g, '')}</option>))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-ink-200 mb-1.5">Font size (px)</label>
                                    <input type="number" name="fontSize" value={fontSize} onChange={handleSettingChange} className={inputCls} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-ink-200 mb-1.5">Weight</label>
                                    <select name="fontWeight" value={fontWeight} onChange={handleSettingChange} className={inputCls}>
                                        <option value="normal">Normal</option>
                                        <option value="bold">Bold</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                        <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Sizing</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-ink-200 mb-1.5">Width (px)</label>
                                <input type="number" name="buttonWidth" value={buttonWidth} onChange={handleSettingChange} className={inputCls} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-ink-200 mb-1.5">Height (px)</label>
                                <input type="number" name="buttonHeight" value={buttonHeight} onChange={handleSettingChange} className={inputCls} />
                            </div>
                            <div>
                                <div className="flex items-center mb-1.5">
                                    <input id="use-radius" name="useBorderRadius" type="checkbox" checked={useBorderRadius} onChange={handleSettingChange} className="h-4 w-4 rounded border-white/20 text-brand-500 focus:ring-brand-400 bg-ink-900" />
                                    <label htmlFor="use-radius" className="ml-2 text-sm font-medium text-ink-200">Radius (px)</label>
                                </div>
                                <input type="number" name="borderRadius" value={borderRadius} onChange={handleSettingChange} disabled={!useBorderRadius} className={`${inputCls} ${useBorderRadius ? '' : 'opacity-50'}`} />
                            </div>
                        </div>
                    </div>

                    <button onClick={handleReset} className="btn-secondary w-full text-sm">Reset to defaults</button>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="card p-6">
                        <h3 className="text-sm font-semibold text-ink-200 uppercase tracking-wider mb-4">Preview</h3>
                        <div className="bg-white p-6 rounded-xl flex items-center justify-center min-h-[120px]">
                            <div dangerouslySetInnerHTML={{ __html: fallbackHtml }} />
                        </div>
                    </div>
                    <div className="card p-6 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-semibold text-ink-200 uppercase tracking-wider">Generated code</h3>
                            <button onClick={handleCopy} className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-ink-200 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                                <CopyIcon className="w-4 h-4" /> {isCopied ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                        <pre className="bg-ink-950/80 border border-white/10 p-3 rounded-xl text-xs text-ink-200 font-mono overflow-x-auto custom-scrollbar h-64">
                            <code>{generatedCode}</code>
                        </pre>
                    </div>
                </div>
            </div>

            <section className="card p-8 md:p-12 max-w-5xl mx-auto mb-12">
                <h2 className="section-title mb-5">Bulletproof buttons solve the single biggest CTA problem in email</h2>
                <div className="text-ink-300 leading-relaxed space-y-4 text-sm md:text-base">
                    <p>
                        Outlook for Windows uses the Microsoft Word rendering engine. That sentence is the cause of basically every email design bug. Word does not understand modern CSS — no <code>padding</code> on <code>&lt;a&gt;</code>, no <code>border-radius</code>, no <code>background-image</code> on links. So your designer's beautiful 220×48px rounded pink CTA collapses in Outlook into a tiny underlined link the user will never click.
                    </p>
                    <p>
                        A bulletproof button fixes this with a tiny block of VML — Microsoft's own vector format — wrapped in <code>&lt;!--[if mso]&gt;</code> conditional comments. Outlook reads the VML and draws a proper rounded rectangle at the exact dimensions you specified. Every other client ignores the conditional and renders the standard CSS button below it. One HTML file. Perfect rendering everywhere. That's "bulletproof."
                    </p>
                    <p>
                        This generator does the VML math for you. Set the dimensions, colors, and corner radius. Copy the code. Paste into your template. Ship.
                    </p>
                </div>
            </section>

            <SeoFaq title="Bulletproof Email Button FAQs" items={faqs} />
        </div>
    );
};

export default OutlookButtonGeneratorPage;
