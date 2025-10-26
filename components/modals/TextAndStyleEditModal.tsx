import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CloseIcon, BoldIcon, ItalicIcon, UnderlineIcon, CodeIcon, LinkIcon } from '../Icons';
import LinkEditModal from './LinkEditModal';

// Web-safe fonts with a display name and the actual CSS font-family value
const emailSafeFonts = [
    { name: 'Sans-Serif', value: 'sans-serif' },
    { name: 'Arial', value: 'Arial, Helvetica, sans-serif' },
    { name: 'Arial Black', value: "'Arial Black', Gadget, sans-serif" },
    { name: 'Comic Sans MS', value: "'Comic Sans MS', cursive, sans-serif" },
    { name: 'Impact', value: 'Impact, Charcoal, sans-serif' },
    { name: 'Lucida Sans', value: "'Lucida Sans Unicode', 'Lucida Grande', sans-serif" },
    { name: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
    { name: 'Trebuchet MS', value: "'Trebuchet MS', Helvetica, sans-serif" },
    { name: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
    { name: 'Serif', value: 'serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Palatino', value: "'Palatino Linotype', 'Book Antiqua', Palatino, serif" },
    { name: 'Times New Roman', value: "'Times New Roman', Times, serif" },
    { name: 'Monospace', value: 'monospace' },
    { name: 'Courier New', value: "'Courier New', Courier, monospace" },
    { name: 'Lucida Console', value: "'Lucida Console', Monaco, monospace" },
];

const defaultFormData = {
    styles: {
        fontFamily: 'sans-serif',
        fontSize: 16,
        lineHeight: 24,
        color: '#000000',
        textAlign: 'left',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textTransform: 'none',
        padding: { top: 0, right: 0, bottom: 0, left: 0 }
    },
    content: ''
};

interface TextAndStyleEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { id: string; style: string; content: string }) => void;
    editData: {
        id: string;
        style: string;
        content: string;
    } | null;
}

const TextAndStyleEditModal: React.FC<TextAndStyleEditModalProps> = ({ isOpen, onClose, onSave, editData }) => {
    const [formData, setFormData] = useState(defaultFormData);
    const [isSourceMode, setIsSourceMode] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen && editData) {
            const styleObj: { [key: string]: string } = {};
            (editData.style || '').split(';').forEach(decl => {
                const [prop, ...valParts] = decl.split(':');
                if (prop && valParts.length > 0) {
                    styleObj[prop.trim().toLowerCase()] = valParts.join(':').trim();
                }
            });

            const newPadding = { ...defaultFormData.styles.padding };
            const paddingValue = styleObj['padding'];
            if (paddingValue) {
                const parts = paddingValue.replace(/[^0-9\s.-]/g, '').trim().split(/\s+/).map(p => parseFloat(p) || 0);
                if (parts.length === 1) { newPadding.top = newPadding.right = newPadding.bottom = newPadding.left = parts[0]; }
                else if (parts.length === 2) { [newPadding.top, newPadding.right] = parts; newPadding.bottom = parts[0]; newPadding.left = parts[1]; }
                else if (parts.length === 3) { [newPadding.top, newPadding.right, newPadding.bottom] = parts; newPadding.left = parts[1]; }
                else if (parts.length >= 4) { [newPadding.top, newPadding.right, newPadding.bottom, newPadding.left] = parts; }
            } else {
                newPadding.top = parseFloat(styleObj['padding-top']) || 0;
                newPadding.right = parseFloat(styleObj['padding-right']) || 0;
                newPadding.bottom = parseFloat(styleObj['padding-bottom']) || 0;
                newPadding.left = parseFloat(styleObj['padding-left']) || 0;
            }

            const fontFamilyValue = styleObj['font-family'] || defaultFormData.styles.fontFamily;
            const matchedFont = emailSafeFonts.find(font => font.value.toLowerCase() === fontFamilyValue.toLowerCase());

            setFormData({
                styles: {
                    fontFamily: matchedFont ? matchedFont.value : fontFamilyValue,
                    fontSize: parseFloat(styleObj['font-size']) || defaultFormData.styles.fontSize,
                    lineHeight: parseFloat(styleObj['line-height']) || defaultFormData.styles.lineHeight,
                    color: styleObj['color'] || defaultFormData.styles.color,
                    textAlign: styleObj['text-align'] || defaultFormData.styles.textAlign,
                    fontWeight: styleObj['font-weight'] || defaultFormData.styles.fontWeight,
                    fontStyle: styleObj['font-style'] || defaultFormData.styles.fontStyle,
                    textTransform: styleObj['text-transform'] || defaultFormData.styles.textTransform,
                    padding: newPadding,
                },
                content: editData.content
            });

            if (editorRef.current && !isSourceMode) {
                editorRef.current.innerHTML = editData.content;
            }

        } else {
            setFormData(defaultFormData);
            setIsLinkModalOpen(false); // Reset on close
        }
    }, [isOpen, editData]);
    
    useEffect(() => {
      // Only update the innerHTML if it's different from the state.
      // This prevents the cursor from jumping to the start on every input.
      if (editorRef.current && !isSourceMode && editorRef.current.innerHTML !== formData.content) {
        editorRef.current.innerHTML = formData.content;
      }
    }, [isSourceMode, formData.content]);

    const handleSave = () => {
        if (!editData) return;
        
        const finalContent = isSourceMode ? formData.content : editorRef.current?.innerHTML || '';

        const newStyleMap = new Map<string, string>();
        
        let finalFontFamily = formData.styles.fontFamily;
        const genericKeywords = ['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'system-ui'];
        const lastPart = finalFontFamily.split(',').pop()?.trim().toLowerCase();
        if (!lastPart || !genericKeywords.includes(lastPart)) {
            finalFontFamily += ', Arial, sans-serif';
        }

        newStyleMap.set('font-family', finalFontFamily);
        newStyleMap.set('font-size', `${formData.styles.fontSize}px`);
        newStyleMap.set('line-height', `${formData.styles.lineHeight}px`);
        newStyleMap.set('color', formData.styles.color);
        newStyleMap.set('text-align', formData.styles.textAlign);
        newStyleMap.set('font-weight', formData.styles.fontWeight);
        newStyleMap.set('font-style', formData.styles.fontStyle);
        newStyleMap.set('text-transform', formData.styles.textTransform);

        const { top, right, bottom, left } = formData.styles.padding;
        if (top || right || bottom || left) {
             if (top === right && right === bottom && bottom === left) {
                newStyleMap.set('padding', `${top}px`);
            } else {
                newStyleMap.set('padding', `${top}px ${right}px ${bottom}px ${left}px`);
            }
        }

        const declarations = Array.from(newStyleMap.entries())
            .map(([prop, val]) => `${prop}: ${val}`);
        
        const styleString = declarations.join('; ') + (declarations.length > 0 ? ';' : '');

        onSave({ id: editData.id, style: styleString, content: finalContent });
        onClose();
    };
    
    const previewStyle = useMemo(() => ({
        fontFamily: formData.styles.fontFamily,
        fontSize: `${formData.styles.fontSize}px`,
        lineHeight: `${formData.styles.lineHeight}px`,
        color: formData.styles.color,
        textAlign: formData.styles.textAlign as any,
        fontWeight: formData.styles.fontWeight as any,
        fontStyle: formData.styles.fontStyle as any,
        textTransform: formData.styles.textTransform as any,
        paddingTop: `${formData.styles.padding.top}px`,
        paddingRight: `${formData.styles.padding.right}px`,
        paddingBottom: `${formData.styles.padding.bottom}px`,
        paddingLeft: `${formData.styles.padding.left}px`,
    }), [formData.styles]);
    
    const cleanupAndNormalize = () => {
        const editor = editorRef.current;
        if (!editor) return;
        // This function is a direct copy from the old TextEditModal, ensuring functionality is preserved.
        const tagMap: { [key: string]: { style: string; value: string; } } = {
            'B': { style: 'fontWeight', value: 'bold' },
            'I': { style: 'fontStyle', value: 'italic' },
            'U': { style: 'textDecoration', value: 'underline' },
        };
        Object.keys(tagMap).forEach(tag => editor.querySelectorAll(tag).forEach(el => {
            const span = document.createElement('span');
            (span.style as any)[tagMap[tag as keyof typeof tagMap].style] = tagMap[tag as keyof typeof tagMap].value;
            while (el.firstChild) span.appendChild(el.firstChild);
            el.parentNode?.replaceChild(span, el);
        }));
        let changed = true;
        while(changed) {
            changed = false;
            const spans = editor.querySelectorAll('span[style]');
            for (let i = 0; i < spans.length; i++) {
                const current = spans[i] as HTMLElement;
                const next = current.nextElementSibling as HTMLElement;
                if (next && next.tagName === 'SPAN' && current.style.cssText === next.style.cssText) {
                    while (next.firstChild) current.appendChild(next.firstChild);
                    next.remove();
                    changed = true;
                    break; 
                }
            }
            if (changed) continue;
            for (const span of spans) {
                const htmlSpan = span as HTMLElement;
                if (htmlSpan.childNodes.length === 1 && htmlSpan.firstElementChild?.tagName === 'SPAN') {
                    const child = htmlSpan.firstElementChild as HTMLElement;
                    const combined = [...new Set([...htmlSpan.style.cssText.split(';').filter(s=>s.trim()), ...child.style.cssText.split(';').filter(s=>s.trim())])];
                    htmlSpan.style.cssText = combined.join('; ');
                    while(child.firstChild) htmlSpan.appendChild(child.firstChild);
                    htmlSpan.removeChild(child);
                    changed = true;
                    break;
                }
            }
            if (changed) continue;
            const emptySpans = editor.querySelectorAll('span:not([style]), span[style=""]');
            if (emptySpans.length > 0) {
                 emptySpans.forEach(span => {
                    const parent = span.parentNode;
                    while(span.firstChild) parent?.insertBefore(span.firstChild, span);
                    span.remove();
                });
                changed = true;
            }
        }
        editor.normalize();
    };

    const handleStyleCommand = (command: 'bold' | 'italic' | 'underline') => {
        if (isSourceMode || !editorRef.current) return;
        editorRef.current.focus();
        document.execCommand(command, false, null);
        cleanupAndNormalize();
        setFormData(d => ({ ...d, content: editorRef.current?.innerHTML || '' }));
    };

    const handleLinkModalSave = (data: { id: string, content: string }) => {
        setFormData(d => ({...d, content: data.content }));
        setIsLinkModalOpen(false);
    };

    if (!isOpen || !editData) return null;
    
    const inputClass = "w-full px-3 py-2 text-sm text-white bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none";
    const labelClass = "block text-sm font-medium text-gray-400 mb-1";
    const toolbarButtonClass = "p-2 rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

    return (
        <>
            {/* The LinkEditModal is now controlled and rendered by this component */}
            <LinkEditModal
                isOpen={isLinkModalOpen}
                onClose={() => setIsLinkModalOpen(false)}
                onSave={handleLinkModalSave}
                textData={{ id: editData.id, content: formData.content }}
            />
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] overflow-y-auto p-4" onClick={onClose}>
                <div className="flex min-h-full items-start sm:items-center justify-center">
                    <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] flex flex-col p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4 flex-shrink-0">
                            <h2 className="text-xl sm:text-2xl font-semibold text-gray-200">Edit Text & Style</h2>
                            <button onClick={onClose} className="text-gray-500 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                        </div>
                        
                        <div className="flex-grow overflow-y-auto pr-2 space-y-6">
                            {/* Style Controls */}
                            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-gray-300 mb-2 text-center">Live Style Preview</h3>
                                <div className="bg-white rounded min-h-[60px] flex items-center p-2">
                                    <div style={previewStyle} dangerouslySetInnerHTML={{ __html: formData.content }} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-700/40 p-4 rounded-lg space-y-4">
                                    <h3 className="font-semibold text-gray-200">Typography</h3>
                                    <div>
                                        <label className={labelClass}>Font Family</label>
                                        <select value={formData.styles.fontFamily} onChange={e => setFormData(d => ({ ...d, styles: { ...d.styles, fontFamily: e.target.value }}))} className={inputClass}>
                                            {emailSafeFonts.map(font => <option key={font.name} value={font.value} style={{ fontFamily: font.value }}>{font.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Font Size (px)</label>
                                            <input type="number" value={formData.styles.fontSize} onChange={e => setFormData(d => ({...d, styles: {...d.styles, fontSize: parseFloat(e.target.value) || 0}}))} className={inputClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Line Height (px)</label>
                                            <input type="number" value={formData.styles.lineHeight} onChange={e => setFormData(d => ({...d, styles: {...d.styles, lineHeight: parseFloat(e.target.value) || 0}}))} className={inputClass} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Font Weight</label>
                                            <select value={formData.styles.fontWeight} onChange={e => setFormData(d => ({...d, styles: {...d.styles, fontWeight: e.target.value}}))} className={inputClass}>
                                                <option value="normal">Normal</option><option value="bold">Bold</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Font Style</label>
                                            <select value={formData.styles.fontStyle} onChange={e => setFormData(d => ({...d, styles: {...d.styles, fontStyle: e.target.value}}))} className={inputClass}>
                                                <option value="normal">Normal</option><option value="italic">Italic</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Text Transform</label>
                                        <select value={formData.styles.textTransform} onChange={e => setFormData(d => ({...d, styles: {...d.styles, textTransform: e.target.value}}))} className={inputClass}>
                                            <option value="none">None</option>
                                            <option value="uppercase">Uppercase</option>
                                            <option value="capitalize">Capitalize</option>
                                            <option value="lowercase">Lowercase</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="bg-gray-700/40 p-4 rounded-lg space-y-4">
                                    <h3 className="font-semibold text-gray-200">Color & Alignment</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Text Color</label>
                                            <div className="flex items-center bg-gray-900 border border-gray-600 rounded-md focus-within:ring-2 focus-within:ring-pink-500">
                                                <input type="color" value={formData.styles.color} onChange={e => setFormData(d => ({ ...d, styles: { ...d.styles, color: e.target.value }}))} className="w-10 h-10 p-1 bg-transparent border-0 cursor-pointer" />
                                                <input type="text" value={formData.styles.color} onChange={e => setFormData(d => ({...d, styles: {...d.styles, color: e.target.value}}))} className="w-full px-3 text-sm text-white bg-transparent focus:outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Text Align</label>
                                            <select value={formData.styles.textAlign} onChange={e => setFormData(d => ({...d, styles: {...d.styles, textAlign: e.target.value}}))} className={inputClass}>
                                                <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option><option value="justify">Justify</option>
                                            </select>
                                        </div>
                                    </div>
                                    <h3 className="font-semibold text-gray-200 pt-2">Spacing (Padding)</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {(['top', 'right', 'bottom', 'left'] as const).map(side => (
                                            <div key={side}>
                                                <label className={labelClass}>{side.charAt(0).toUpperCase() + side.slice(1)} (px)</label>
                                                <input type="number" value={formData.styles.padding[side]} onChange={e => setFormData(d => ({...d, styles: {...d.styles, padding: {...d.styles.padding, [side]: parseFloat(e.target.value) || 0 }}}))} className={inputClass} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Content Editor */}
                            <div>
                                <div className="bg-gray-900 border-t border-l border-r border-gray-600 rounded-t-md p-2 flex flex-wrap items-center justify-center sm:justify-between gap-x-4 gap-y-2 text-gray-300">
                                    {/* Left Toolbar */}
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleStyleCommand('bold')} className={toolbarButtonClass} disabled={isSourceMode} title="Bold"><BoldIcon className="w-5 h-5 fill-current" /></button>
                                        <button onClick={() => handleStyleCommand('italic')} className={toolbarButtonClass} disabled={isSourceMode} title="Italic"><ItalicIcon className="w-5 h-5 fill-current" /></button>
                                        <button onClick={() => handleStyleCommand('underline')} className={toolbarButtonClass} disabled={isSourceMode} title="Underline"><UnderlineIcon className="w-5 h-5 fill-current" /></button>
                                        <div className="w-px h-5 bg-gray-600 mx-1"></div>
                                        <button onClick={() => {
                                                if (!isSourceMode && editorRef.current) {
                                                    setFormData(d => ({ ...d, content: editorRef.current?.innerHTML || '' }));
                                                }
                                                setIsSourceMode(!isSourceMode);
                                            }} className={(isSourceMode ? 'bg-violet-600 text-white' : '') + " " + toolbarButtonClass.replace(' disabled:cursor-not-allowed','')} title="View Source"><CodeIcon className="w-5 h-5" /></button>
                                    </div>
                                    
                                    {/* Right Toolbar */}
                                    <div className="flex items-center gap-3">
                                        <p className="text-xs text-gray-400 hidden sm:block">To add or edit links, use the button &rarr;</p>
                                        <button 
                                            onClick={() => setIsLinkModalOpen(true)} 
                                            className="flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                                            disabled={isSourceMode} 
                                            title="Edit Link"
                                        >
                                            <LinkIcon className="w-4 h-4" />
                                            <span className="hidden sm:inline">Edit Link</span>
                                        </button>
                                    </div>
                                </div>
                                {isSourceMode ? (
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) => setFormData(d => ({ ...d, content: e.target.value }))}
                                        className="w-full h-48 p-3 text-sm text-white bg-gray-900 border border-gray-600 rounded-b-md focus:ring-2 focus:ring-pink-500 focus:outline-none font-mono"
                                    />
                                ) : (
                                    <div
                                        ref={editorRef}
                                        contentEditable={true}
                                        onInput={e => setFormData(d => ({ ...d, content: (e.target as HTMLDivElement).innerHTML }))}
                                        onBlur={cleanupAndNormalize}
                                        className="w-full h-48 p-3 text-black bg-white rounded-b-md focus:ring-2 focus:ring-pink-500 focus:outline-none overflow-y-auto"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-4 flex-shrink-0">
                            <button onClick={onClose} className="px-6 py-2 font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Cancel</button>
                            <button onClick={handleSave} className="px-6 py-2 font-semibold text-white bg-gradient-to-r from-pink-600 to-violet-600 rounded-lg hover:from-pink-700 hover:to-violet-700">Apply Changes</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
export default TextAndStyleEditModal;