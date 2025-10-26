import React, { useState, useEffect, useRef } from 'react';
import { CodeIcon, UnlinkIcon, LinkIcon, InfoIcon, UnlockIcon } from '../Icons';

interface LinkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { id: string; content: string }) => void;
  textData: { id: string; content: string } | null;
}

// Helper to convert browser's RGB output back to HEX
function rgbToHex(rgb: string): string {
    if (!rgb || !rgb.startsWith('rgb')) return rgb;
    const sep = rgb.includes(",") ? "," : " ";
    const rgbValues = rgb.substr(4).split(")")[0].split(sep);

    let r = (+rgbValues[0]).toString(16),
        g = (+rgbValues[1]).toString(16),
        b = (+rgbValues[2]).toString(16);

    if (r.length === 1) r = "0" + r;
    if (g.length === 1) g = "0" + g;
    if (b.length === 1) b = "0" + b;

    if (isNaN(parseInt(r, 16)) || isNaN(parseInt(g, 16)) || isNaN(parseInt(b, 16))) return rgb;

    return "#" + r + g + b;
}

const defaultStyles = {
    color: '#000000',
    textDecoration: 'none',
    textTransform: 'none',
    fontWeight: 'normal',
};
const prefixOptions = ['https://', 'http://', 'mailto:', 'tel:', 'Other (Variable)'];

// Helper to find the anchor tag enclosing the current selection
function getEnclosingLink(selection: Selection | null): HTMLAnchorElement | null {
    if (!selection || !selection.anchorNode) return null;
    const { anchorNode } = selection;
    if (anchorNode.nodeType === Node.ELEMENT_NODE) {
        return (anchorNode as Element).closest('a');
    }
    return anchorNode.parentElement?.closest('a') ?? null;
}

const LinkEditModal: React.FC<LinkEditModalProps> = ({ isOpen, onClose, onSave, textData }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const savedRange = useRef<Range | null>(null);
    const [isSourceMode, setIsSourceMode] = useState(false);
    const [content, setContent] = useState('');
    
    // Form state
    const [url, setUrl] = useState('');
    const [prefix, setPrefix] = useState(prefixOptions[0]);
    const [target, setTarget] = useState('_blank');
    const [linkStyles, setLinkStyles] = useState(defaultStyles);
    const [isUrlLocked, setIsUrlLocked] = useState(false);
    
    useEffect(() => {
        if (isOpen && textData && editorRef.current) {
            editorRef.current.innerHTML = textData.content;
            highlightLinksInEditor();
        }
        if (!isOpen) {
            // Full reset on close
            setIsSourceMode(false);
            setUrl('');
            setPrefix(prefixOptions[0]);
            setTarget('_blank');
            setLinkStyles(defaultStyles);
            savedRange.current = null;
            setIsUrlLocked(false);
        }
    }, [isOpen, textData]);
    
    useEffect(() => {
        if (!isSourceMode && editorRef.current) {
            editorRef.current.innerHTML = content;
            highlightLinksInEditor();
        }
    }, [isSourceMode]);
    
    const saveSelection = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
                savedRange.current = range;
            }
        }
    };
    
    const restoreSelection = () => {
        if (savedRange.current && editorRef.current) {
            editorRef.current.focus();
            const selection = window.getSelection();
            if (selection) {
                selection.removeAllRanges();
                selection.addRange(savedRange.current);
            }
        }
    };

    const highlightLinksInEditor = () => {
        if (!editorRef.current || isSourceMode) return;
        editorRef.current.querySelectorAll('.link-highlight').forEach(el => el.classList.remove('link-highlight'));
        editorRef.current.querySelectorAll('a').forEach(a => a.classList.add('link-highlight'));
    };

    const updateSelectionState = () => {
        saveSelection();
        const selection = window.getSelection();
        if (!selection || !editorRef.current) return;
        
        const linkEl = getEnclosingLink(selection);

        if (linkEl) {
            if (!isUrlLocked) {
                const href = linkEl.getAttribute('href') || '#';
                let foundPrefix = false;
                
                // Intelligent prefix stripping
                let mainUrl = href;
                for (const p of prefixOptions) {
                    if (href.startsWith(p)) {
                        setPrefix(p);
                        mainUrl = href.substring(p.length);
                        foundPrefix = true;
                        break;
                    }
                }
                
                if (!foundPrefix) {
                    setPrefix('Other (Variable)');
                }
                setUrl(mainUrl);
            }
            
            setTarget(linkEl.target || '_blank');
            const computedStyle = window.getComputedStyle(linkEl);
            const fontWeight = computedStyle.fontWeight;
            setLinkStyles({
                color: rgbToHex(computedStyle.color),
                textDecoration: computedStyle.textDecorationLine.includes('underline') ? 'underline' : 'none',
                textTransform: computedStyle.textTransform || 'none',
                fontWeight: fontWeight === 'bold' || parseInt(fontWeight) >= 700 ? 'bold' : 'normal',
            });
        } else {
            if (!isUrlLocked) {
                setUrl('');
                setPrefix(prefixOptions[0]);
                setLinkStyles(defaultStyles);
                setTarget('_blank');
            }
        }
    };

    const handleSave = () => {
        if (!textData) return;
        let finalContent = isSourceMode ? content : editorRef.current?.innerHTML || '';
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = finalContent;
        tempDiv.querySelectorAll('.link-highlight').forEach(el => {
            el.classList.remove('link-highlight');
            if (!el.getAttribute('class') || el.getAttribute('class')?.trim() === '') {
                el.removeAttribute('class');
            }
        });
        finalContent = tempDiv.innerHTML;

        onSave({ id: textData.id, content: finalContent });
        onClose();
    };

    const handleApplyLink = () => {
        if (!editorRef.current || !url.trim() || !isUrlLocked) return;
        restoreSelection();
        
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
        
        const range = selection.getRangeAt(0);
        
        let finalUrl = url.trim();
        const hasProtocol = /^(https?:\/\/|mailto:|tel:)/i.test(finalUrl);

        if (!hasProtocol && prefix !== 'Other (Variable)') {
            finalUrl = prefix + finalUrl;
        }

        const styleString = `color: ${linkStyles.color}; text-decoration: ${linkStyles.textDecoration}; text-transform: ${linkStyles.textTransform}; font-weight: ${linkStyles.fontWeight};`;
        
        const enclosingLink = getEnclosingLink(selection);
        
        // Case 1: The selection exactly matches an existing link's text content. Update in place.
        if (enclosingLink && selection.toString().trim() === enclosingLink.textContent?.trim()) {
            enclosingLink.href = finalUrl;
            enclosingLink.target = target;
            enclosingLink.setAttribute('style', styleString);
            
            let innerSpan = enclosingLink.querySelector('span');
            if (!innerSpan) { 
                const content = enclosingLink.innerHTML;
                enclosingLink.innerHTML = '';
                innerSpan = document.createElement('span');
                innerSpan.innerHTML = content;
                enclosingLink.appendChild(innerSpan);
            }
            innerSpan.setAttribute('style', styleString);
        } else {
            // Case 2: Applying a new link, or applying a link over a *part* of an existing link.
            // Robustly unlink first, then create a new link.
            document.execCommand('unlink', false, null);
            
            const freshRange = selection.getRangeAt(0); // Re-get range after unlink
            const fragment = freshRange.extractContents();
            
            const link = document.createElement('a');
            link.href = finalUrl;
            link.target = target;
            link.setAttribute('style', styleString);
            
            const span = document.createElement('span');
            span.setAttribute('style', styleString);
            span.appendChild(fragment);
            
            link.appendChild(span);
            freshRange.insertNode(link);
        }
        
        selection.removeAllRanges();
        savedRange.current = null;
        highlightLinksInEditor();
    };
    
    const handleUnlink = () => {
        if (isSourceMode || !editorRef.current) return;
        restoreSelection();
        const selection = window.getSelection();
        if (!selection || !selection.anchorNode) return;
        
        const link = getEnclosingLink(selection);
        if (link) {
            // Find the inner span. Our structure is <a><span>...</span></a>
            const innerSpan = link.querySelector('span');
            // Get the content to preserve, prioritizing the span's content.
            const contentToPreserve = innerSpan ? innerSpan.innerHTML : link.innerHTML;

            // Create a document fragment to hold the unwrapped content
            const fragment = document.createRange().createContextualFragment(contentToPreserve);
            
            // Replace the entire link (<a> and its children) with the preserved content.
            link.parentNode?.replaceChild(fragment, link);
        }
        
        highlightLinksInEditor();
    };
    
    const handleUrlBlur = () => {
      if (url.trim() && !isUrlLocked) {
        setIsUrlLocked(true);
      }
    };
    
    const handleUnlockUrl = () => {
        setIsUrlLocked(false);
        setUrl('');
    };

    const toggleSourceMode = () => {
        if (isSourceMode) {
            setIsSourceMode(false);
        } else {
            if (editorRef.current) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = editorRef.current.innerHTML;
                tempDiv.querySelectorAll('.link-highlight').forEach(el => {
                     el.classList.remove('link-highlight');
                     if (!el.getAttribute('class')?.trim()) {
                        el.removeAttribute('class');
                     }
                });
                setContent(tempDiv.innerHTML);
            }
            setIsSourceMode(true);
        }
    };
    
    if (!isOpen || !textData) return null;
    
    return (
      <>
        <style>{`.link-highlight { background-color: rgba(254, 240, 138, 0.5); }`}</style>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-4xl flex flex-col p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-200">Edit Link</h2>
                    <button onClick={toggleSourceMode} className={ (isSourceMode ? 'bg-violet-600 text-white' : '') + " p-2 rounded-md hover:bg-gray-600 transition-colors"} title="View Source">
                        <CodeIcon className="w-5 h-5" />
                    </button>
                </div>
                
                 <div className="bg-gray-700/50 p-3 rounded-md mb-4 text-xs text-gray-400 space-y-2">
                    <div className="flex items-start gap-2">
                        <InfoIcon className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5"/>
                        <p><strong>Workflow:</strong> 1. Enter & lock a URL. 2. Select text in the editor. 3. Adjust styles & click "Apply Link" to create or update.</p>
                    </div>
                     <div className="flex items-start gap-2">
                        <InfoIcon className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5"/>
                        <p><strong>To Remove:</strong> Select any part of a highlighted link and click "Unlink".</p>
                    </div>
                </div>
                
                <div className="flex-grow flex flex-col md:flex-row gap-6 min-h-[400px]">
                    <div className="flex-1 flex flex-col">
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Editor</h3>
                        {isSourceMode ? (
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full flex-grow p-3 text-sm text-white bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none font-mono"
                            />
                        ) : (
                            <div
                                ref={editorRef}
                                contentEditable={true}
                                onMouseUp={updateSelectionState}
                                onKeyUp={updateSelectionState}
                                onFocus={updateSelectionState}
                                onBlur={saveSelection}
                                className="w-full flex-grow p-3 text-sm text-white bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none overflow-y-auto"
                            />
                        )}
                    </div>

                    <div className="w-full md:w-80 flex-shrink-0">
                         <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">URL</label>
                                <div className="flex">
                                    <select value={prefix} onChange={e => setPrefix(e.target.value)} onFocus={saveSelection} disabled={isUrlLocked} className="px-2 py-2 text-sm text-white bg-gray-900 border border-gray-600 rounded-l-md focus:ring-2 focus:ring-pink-500 focus:outline-none appearance-none disabled:opacity-70">
                                        {prefixOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                    <input type="text" value={url} onChange={e => setUrl(e.target.value)} onBlur={handleUrlBlur} onFocus={saveSelection} readOnly={isUrlLocked} className="flex-1 w-full px-3 py-2 text-sm text-white bg-gray-900 border-t border-b border-gray-600 focus:ring-2 focus:ring-pink-500 focus:outline-none read-only:bg-gray-700/50" />
                                    <button onClick={handleUnlockUrl} className={`px-3 py-2 text-sm text-white border-t border-b border-r border-gray-600 rounded-r-md focus:ring-2 focus:ring-pink-500 focus:outline-none ${!isUrlLocked ? 'bg-gray-700/50 text-gray-500' : 'bg-violet-600 hover:bg-violet-700'}`} disabled={!isUrlLocked}>
                                      <UnlockIcon className="w-5 h-5"/>
                                    </button>
                                </div>
                            </div>
                            
                            <div className={`bg-gray-900 border border-gray-600 rounded-md p-4 space-y-4 transition-opacity ${!isUrlLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                                <h4 className="text-sm font-semibold text-gray-300">Link Style</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Color</label>
                                        <div className="flex items-center bg-gray-700 border border-gray-600 rounded-md focus-within:ring-2 focus-within:ring-pink-500">
                                            <input type="color" value={linkStyles.color} onChange={e => setLinkStyles(s => ({ ...s, color: e.target.value }))} onFocus={saveSelection} className="w-10 h-10 p-1 bg-transparent border-0 cursor-pointer" />
                                            <input type="text" value={linkStyles.color} onChange={e => setLinkStyles(s => ({ ...s, color: e.target.value }))} onFocus={saveSelection} className="w-full px-3 text-sm text-white bg-transparent focus:outline-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Decoration</label>
                                        <select value={linkStyles.textDecoration} onChange={e => setLinkStyles(s => ({ ...s, textDecoration: e.target.value }))} onFocus={saveSelection} className="w-full px-3 py-2 text-sm text-white bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none">
                                            <option value="none">None</option>
                                            <option value="underline">Underline</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Font Weight</label>
                                        <select value={linkStyles.fontWeight} onChange={e => setLinkStyles(s => ({ ...s, fontWeight: e.target.value }))} onFocus={saveSelection} className="w-full px-3 py-2 text-sm text-white bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none">
                                            <option value="normal">Normal</option>
                                            <option value="bold">Bold</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Text Transform</label>
                                        <select value={linkStyles.textTransform} onChange={e => setLinkStyles(s => ({ ...s, textTransform: e.target.value }))} onFocus={saveSelection} className="w-full px-3 py-2 text-sm text-white bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none">
                                            <option value="none">None</option>
                                            <option value="uppercase">Uppercase</option>
                                            <option value="capitalize">Capitalize</option>
                                            <option value="lowercase">Lowercase</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Open In</label>
                                    <select value={target} onChange={e => setTarget(e.target.value)} onFocus={saveSelection} className="w-full px-3 py-2 text-sm text-white bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none">
                                        <option value="_blank">New Tab</option>
                                        <option value="_self">Same Tab</option>
                                    </select>
                                </div>
                            </div>

                             <div className="flex gap-4">
                                <button onClick={handleApplyLink} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSourceMode || !isUrlLocked}>
                                    <LinkIcon className="w-5 h-5"/>
                                    Apply Link
                                </button>
                                <button onClick={handleUnlink} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 font-semibold text-white bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50" disabled={isSourceMode}>
                                    <UnlinkIcon className="w-5 h-5"/>
                                    Unlink
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                    <button onClick={onClose} className="px-6 py-2 font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-6 py-2 font-semibold text-white bg-gradient-to-r from-pink-600 to-violet-600 rounded-lg hover:from-pink-700 hover:to-violet-700">
                        Apply Changes
                    </button>
                </div>
            </div>
        </div>
      </>
    );
};
export default LinkEditModal;