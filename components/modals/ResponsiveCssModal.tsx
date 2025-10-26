import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CloseIcon, SaveIcon, ChevronDownIcon } from '../Icons';

interface CssProperty {
    value: string;
    important: boolean;
}

interface CssRule {
    selector: string;
    properties: { [key: string]: CssProperty };
    originalRuleText: string;
}

interface MediaQuery {
    mediaText: string;
    rules: CssRule[];
    originalBlock: string;
}

interface ResponsiveCssModalProps {
    isOpen: boolean;
    onClose: () => void;
    htmlContent: string | null;
    onSave: (newHtml: string) => void;
}

const ResponsiveCssModal: React.FC<ResponsiveCssModalProps> = ({ isOpen, onClose, htmlContent, onSave }) => {
    const [parsedQueries, setParsedQueries] = useState<MediaQuery[]>([]);
    const [activeAccordions, setActiveAccordions] = useState<string[]>([]);
    const [hoveredSelector, setHoveredSelector] = useState<string | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [iframeLoaded, setIframeLoaded] = useState(false);
    
    // Use a ref to hold the latest parsedQueries for the message handler to avoid stale closures
    const parsedQueriesRef = useRef(parsedQueries);
    parsedQueriesRef.current = parsedQueries;


    // Step 1: Parse CSS from HTML content when the modal is opened
    useEffect(() => {
        if (!isOpen || !htmlContent) {
            setParsedQueries([]);
            return;
        }

        const newMediaQueries: MediaQuery[] = [];
        const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
        let cssContent = '';
        let styleMatch;
        while ((styleMatch = styleRegex.exec(htmlContent)) !== null) {
            cssContent += styleMatch[1];
        }

        // Remove comments before parsing
        cssContent = cssContent.replace(/\/\*[\s\S]*?\*\//g, '');

        const mediaRegex = /(@media[^{]+)\s*\{/g;
        let mediaMatch;
        while ((mediaMatch = mediaRegex.exec(cssContent)) !== null) {
            const mediaText = mediaMatch[1].trim();
            const startIndex = mediaMatch.index + mediaMatch[0].length;
            
            let braceCount = 1;
            let endIndex = startIndex;
            
            while (braceCount > 0 && endIndex < cssContent.length) {
                if (cssContent[endIndex] === '{') braceCount++;
                else if (cssContent[endIndex] === '}') braceCount--;
                endIndex++;
            }

            if (braceCount === 0) {
                const mediaBlockContent = cssContent.substring(startIndex, endIndex - 1);
                const originalBlock = mediaMatch[0] + mediaBlockContent + '}';
                const rules: CssRule[] = [];
                
                const ruleRegex = /([^{}]+?)\s*\{([^}]+)\}/g;
                let ruleMatch;
                while ((ruleMatch = ruleRegex.exec(mediaBlockContent)) !== null) {
                    const selector = ruleMatch[1].trim();
                    const declarations = ruleMatch[2].trim();
                    const properties: { [key: string]: CssProperty } = {};

                    declarations.split(';').forEach(decl => {
                        if (decl.trim()) {
                            const [prop, ...valParts] = decl.split(':');
                            if (prop && valParts.length > 0) {
                                const val = valParts.join(':');
                                const isImportant = /!important/i.test(val);
                                properties[prop.trim()] = {
                                    value: val.replace(/!important/i, '').trim(),
                                    important: isImportant
                                };
                            }
                        }
                    });

                    if (Object.keys(properties).length > 0) {
                        rules.push({ selector, properties, originalRuleText: ruleMatch[0] });
                    }
                }
                if (rules.length > 0) {
                    newMediaQueries.push({ mediaText, rules, originalBlock });
                }
            }
        }
        setParsedQueries(newMediaQueries);
        setActiveAccordions([]);
        setHoveredSelector(null);
    }, [isOpen, htmlContent]);

    const handlePropertyChange = (mqIndex: number, ruleIndex: number, propName: string, propValue: Partial<CssProperty>) => {
        setParsedQueries(prevQueries => {
            const newQueries = JSON.parse(JSON.stringify(prevQueries));
            // FIX: Using `|| {}` would create an empty object if the property is new,
            // causing destructuring `({ value, important })` to fail.
            // This now provides a complete default object to ensure type safety.
            const currentProps = newQueries[mqIndex].rules[ruleIndex].properties[propName] || { value: '', important: false };
            const newProps = { ...currentProps, ...propValue };
            newQueries[mqIndex].rules[ruleIndex].properties[propName] = newProps;
            return newQueries;
        });
    };

    // Generate the live styles to be injected into the iframe
    const liveStyles = useMemo(() => {
        return parsedQueries.map(mq => {
            const rulesString = mq.rules.map(rule => {
                const declsString = Object.entries(rule.properties)
                    .map(([prop, { value, important }]) => `  ${prop}: ${value}${important ? ' !important' : ''};`)
                    .join('\n');
                return `${rule.selector} {\n${declsString}\n}`;
            }).join('\n');
            return `${mq.mediaText} {\n${rulesString}\n}`;
        }).join('\n');
    }, [parsedQueries]);

    // Effect 2: Manage iframe load state and message listeners
    useEffect(() => {
        if (!isOpen) {
            setIframeLoaded(false);
            return;
        }
        const iframe = iframeRef.current;
        if (!iframe) return;

        const handleLoad = () => setIframeLoaded(true);

        const handleMessage = (event: MessageEvent) => {
            const latestQueries = parsedQueriesRef.current;
            if (event.data?.type === 'vibe-mq-hover') {
                setHoveredSelector(event.data.selector);
            } else if (event.data?.type === 'vibe-mq-click') {
                const clickedSelectors = event.data.selectors || [];
                const newActiveIds = new Set<string>(activeAccordions);
                latestQueries.forEach((mq, mqIndex) => {
                    mq.rules.forEach((rule, ruleIndex) => {
                        if (clickedSelectors.includes(rule.selector)) {
                            newActiveIds.add(`${mqIndex}-${ruleIndex}`);
                        }
                    });
                });
                setActiveAccordions(Array.from(newActiveIds));
            }
        };

        iframe.addEventListener('load', handleLoad);
        window.addEventListener('message', handleMessage);
        return () => {
            iframe.removeEventListener('load', handleLoad);
            window.removeEventListener('message', handleMessage);
        };
    }, [isOpen, activeAccordions]); // Re-runs when modal opens/closes, and activeAccordions changes

    // Effect 3: Update iframe with styles and scripts when ready and when styles change
    useEffect(() => {
        if (!isOpen || !iframeLoaded || !htmlContent) return;
        const iframe = iframeRef.current;
        const doc = iframe?.contentDocument;
        if (!doc?.head) return;

        // Inject or update live styles
        const overrideStyleId = 'vibe-responsive-override';
        let overrideStyleEl = doc.getElementById(overrideStyleId);
        if (!overrideStyleEl) {
            overrideStyleEl = doc.createElement('style');
            overrideStyleEl.id = overrideStyleId;
            doc.head.appendChild(overrideStyleEl);
        }
        overrideStyleEl.textContent = liveStyles;

        // Inject highlighter styles
        const highlighterStyleId = 'vibe-mq-highlighter-style';
        if (!doc.getElementById(highlighterStyleId)) {
             const highlighterStyleEl = doc.createElement('style');
             highlighterStyleEl.id = highlighterStyleId;
             highlighterStyleEl.textContent = '.vibe-mq-highlight { outline: 2px dashed #EC4899 !important; outline-offset: -4px; box-shadow: 0 0 10px #EC4899; transition: outline .1s ease; cursor: pointer; }';
             doc.head.appendChild(highlighterStyleEl);
        }
        
        // Inject or update interactive script
        const highlighterScriptId = 'vibe-mq-highlighter-script';
        doc.getElementById(highlighterScriptId)?.remove();
        
        const script = doc.createElement('script');
        script.id = highlighterScriptId;
        const allSelectors = parsedQueries.flatMap(mq => mq.rules.map(r => r.selector));
        
        script.textContent = `
            (function() {
                const allKnownSelectors = ${JSON.stringify(allSelectors)};
                let currentlyHighlightedElement = null;

                function getElementAndMatchingSelectors(startNode) {
                    let currentElement = startNode.nodeType === 3 ? startNode.parentElement : startNode;
                    while (currentElement && typeof currentElement.matches === 'function') {
                        const matchingSelectors = allKnownSelectors.filter(selectorGroup => {
                            try {
                                return currentElement.matches(selectorGroup);
                            } catch (e) {
                                return false;
                            }
                        });

                        if (matchingSelectors.length > 0) {
                            return { element: currentElement, selectors: matchingSelectors };
                        }
                        currentElement = currentElement.parentElement;
                    }
                    return { element: null, selectors: [] };
                }

                document.body.addEventListener('mouseover', (e) => {
                    const { element, selectors } = getElementAndMatchingSelectors(e.target);
                    if (element === currentlyHighlightedElement) return;

                    if (currentlyHighlightedElement) {
                        currentlyHighlightedElement.classList.remove('vibe-mq-highlight');
                    }
                    
                    if (element) {
                        element.classList.add('vibe-mq-highlight');
                        currentlyHighlightedElement = element;
                        window.parent.postMessage({ type: 'vibe-mq-hover', selector: selectors[0] }, '*');
                    } else {
                        currentlyHighlightedElement = null;
                        window.parent.postMessage({ type: 'vibe-mq-hover', selector: null }, '*');
                    }
                });

                document.body.addEventListener('mouseout', (e) => {
                    if (currentlyHighlightedElement && !document.body.contains(e.relatedTarget)) {
                        currentlyHighlightedElement.classList.remove('vibe-mq-highlight');
                        currentlyHighlightedElement = null;
                        window.parent.postMessage({ type: 'vibe-mq-hover', selector: null }, '*');
                    }
                });

                document.body.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const { selectors } = getElementAndMatchingSelectors(e.target);
                    if (selectors.length > 0) {
                        window.parent.postMessage({ type: 'vibe-mq-click', selectors }, '*');
                    }
                }, true);
            })();
        `;
        doc.head.appendChild(script);

    }, [isOpen, iframeLoaded, htmlContent, parsedQueries, liveStyles]);

    const handleSave = () => {
        if (!htmlContent) return;
        let newHtml = htmlContent;

        const styleRegex = /(<style[^>]*>)([\s\S]*?)(<\/style>)/gi;
        newHtml = newHtml.replace(styleRegex, (styleMatch, openTag, styleContent, closeTag) => {
            let newStyleContent = styleContent;
            parsedQueries.forEach(mq => {
                // IMPORTANT: Check if the original media query belongs to THIS specific style block
                if (styleContent.includes(mq.originalBlock)) {
                    // If it does, build the new version of this specific media query
                    const newRulesString = mq.rules.map(rule => {
                        const declsString = Object.entries(rule.properties)
                            .map(([prop, { value, important }]) => `${prop}: ${value}${important ? ' !important' : ''};`)
                            .join(' '); // This creates the single-line declarations the user wants.

                        // This handles multi-line selectors, preserving them but indenting correctly.
                        const indentedSelector = rule.selector
                            .split('\n')
                            .map(line => '\t' + line.trim())
                            .join('\n');
                        
                        return `${indentedSelector} { ${declsString} }`;
                    }).join('\n');
                    
                    const newMqBlock = `${mq.mediaText} {\n${newRulesString}\n}`;

                    // And replace it in its own style block. Use newStyleContent which might have been modified by a previous MQ in the same block.
                    newStyleContent = newStyleContent.replace(mq.originalBlock, newMqBlock);
                }
                // If the original block is not in this style tag, do nothing. This is the fix.
            });
            
            return openTag + newStyleContent + closeTag;
        });

        onSave(newHtml);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[80] p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full h-full flex flex-col p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <h2 className="text-2xl font-semibold text-gray-200">Edit Mobile Styles</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                </div>
                
                <div className="flex-grow flex flex-col lg:flex-row gap-6 min-h-0">
                    {/* Controls Panel */}
                    <div className="w-full lg:w-1/3 flex flex-col flex-shrink-0">
                        <h3 className="text-lg font-semibold text-gray-300 mb-2 px-2">Detected Media Queries</h3>
                        <div className="flex-grow bg-gray-900/50 border border-gray-700 rounded-lg p-2 space-y-2 overflow-y-auto">
                            {parsedQueries.length === 0 && <p className="text-gray-500 p-4 text-center">No media queries found in this template.</p>}
                            {parsedQueries.map((mq, mqIndex) => (
                                <div key={mqIndex} className="bg-gray-800 rounded">
                                    <div className="text-xs font-mono p-2 text-cyan-300 bg-gray-900 rounded-t">{mq.mediaText}</div>
                                    <div className="p-2 space-y-1">
                                        {mq.rules.map((rule, ruleIndex) => {
                                            const accordionId = `${mqIndex}-${ruleIndex}`;
                                            const isActive = activeAccordions.includes(accordionId);
                                            const isHovered = rule.selector === hoveredSelector || (Array.isArray(hoveredSelector) && hoveredSelector.includes(rule.selector));
                                            return (
                                                <div key={ruleIndex} className={`rounded transition-all duration-200 ${isHovered ? 'bg-pink-600/20' : ''}`}>
                                                    <button onClick={() => setActiveAccordions(prev => prev.includes(accordionId) ? prev.filter(id => id !== accordionId) : [...prev, accordionId])} className="w-full flex justify-between items-center text-left p-2 bg-gray-700/50 hover:bg-gray-700 rounded-t">
                                                        <code className="text-sm text-gray-200">{rule.selector}</code>
                                                        <ChevronDownIcon className={`w-5 h-5 text-gray-400 transform transition-transform ${isActive ? 'rotate-180' : ''}`} />
                                                    </button>
                                                    {isActive && (
                                                        <div className="p-3 bg-gray-700/20 rounded-b space-y-2">
                                                            {Object.entries(rule.properties).map(([prop, { value, important }]) => (
                                                                <div key={prop} className="grid grid-cols-12 gap-2 items-center">
                                                                    <label className="col-span-4 text-xs text-gray-400 truncate">{prop}</label>
                                                                    <input 
                                                                        type="text"
                                                                        value={value}
                                                                        onChange={e => handlePropertyChange(mqIndex, ruleIndex, prop, { value: e.target.value })}
                                                                        className="col-span-6 bg-gray-900 text-white text-xs px-2 py-1 rounded border border-gray-600 focus:ring-1 focus:ring-pink-500 focus:outline-none"
                                                                    />
                                                                    <label className="col-span-2 flex items-center text-xs text-gray-400 gap-1 cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={important}
                                                                            onChange={e => handlePropertyChange(mqIndex, ruleIndex, prop, { important: e.target.checked })}
                                                                            className="h-3.5 w-3.5 rounded-sm border-gray-500 text-pink-600 focus:ring-pink-500 bg-gray-700"
                                                                        />
                                                                        !
                                                                    </label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Preview Panel */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <h3 className="text-lg font-semibold text-gray-300 mb-2 px-2">Live Mobile Preview</h3>
                        <div className="flex-grow bg-gray-900/50 border border-gray-700 rounded-lg p-8 flex justify-center items-start overflow-auto">
                            <div className="w-[385px] h-[677px] p-[5px] box-border flex-shrink-0 bg-gray-700 shadow-2xl rounded-xl overflow-hidden border-4 border-gray-700">
                                <iframe ref={iframeRef} srcDoc={htmlContent || ''} title="Mobile Preview" className="w-full h-full border-0 bg-white" sandbox="allow-scripts allow-same-origin"/>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-4 flex-shrink-0">
                    <button onClick={onClose} className="px-6 py-2 font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Cancel</button>
                    <button onClick={handleSave} className="px-6 py-2 font-semibold text-white bg-gradient-to-r from-pink-600 to-violet-600 rounded-lg hover:from-pink-700 hover:to-violet-700 flex items-center gap-2">
                        <SaveIcon className="w-5 h-5"/>
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
export default ResponsiveCssModal;