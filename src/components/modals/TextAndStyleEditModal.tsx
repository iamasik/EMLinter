import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CloseIcon, BoldIcon, ItalicIcon, UnderlineIcon, CodeIcon, LinkIcon, UnlinkIcon, TextColorIcon, EraserIcon, AlignLeftIcon, AlignCenterIcon, AlignRightIcon, AlignJustifyIcon } from '../Icons';
import ColorPickerInput from '../ColorPickerInput';

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

// Normalizes any valid CSS color (rgb/rgba/hsl/named/short-hex) to a 6-digit hex string,
// since the color picker input and the saved email style must always be hex.
const toHexColor = (color: string): string => {
    const trimmed = (color || '').trim();
    const hexMatch = trimmed.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
    if (hexMatch) {
        let hex = hexMatch[1];
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        return `#${hex.toLowerCase()}`;
    }
    try {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1;
        const ctx = canvas.getContext('2d');
        if (!ctx) return '#000000';
        // Flatten onto white first so a translucent color still yields a solid hex swatch.
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 1, 1);
        ctx.fillStyle = trimmed;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
    } catch {
        return '#000000';
    }
};

const defaultFormData = {
    styles: {
        fontFamily: 'sans-serif',
        fontSize: 16,
        lineHeight: 24,
        letterSpacing: 0,
        color: '#000000',
        textAlign: 'left',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textTransform: 'none',
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        border: {
            top: { width: 0, style: 'none', color: '#000000' },
            right: { width: 0, style: 'none', color: '#000000' },
            bottom: { width: 0, style: 'none', color: '#000000' },
            left: { width: 0, style: 'none', color: '#000000' },
        },
    },
    content: ''
};

const defaultActiveFormats = { bold: false, italic: false, underline: false, color: '#000000' };

const BORDER_STYLE_KEYWORDS = ['none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset'];

// Parses a border shorthand value ("1px solid #EE0000") into its width/style/color parts.
// Falls back to a disabled border when the value is missing or unparsable.
const parseBorderSide = (value: string | undefined): { width: number; style: string; color: string } => {
    const empty = { width: 0, style: 'none', color: '#000000' };
    if (!value) return empty;
    const trimmed = value.trim();
    if (!trimmed) return empty;

    const colorMatch = trimmed.match(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/i);
    let remainder = trimmed;
    let color = '#000000';
    if (colorMatch) {
        color = toHexColor(colorMatch[0]);
        remainder = trimmed.replace(colorMatch[0], ' ');
    }

    let style = 'none';
    const styleMatch = remainder.toLowerCase().match(new RegExp(`\\b(${BORDER_STYLE_KEYWORDS.join('|')})\\b`));
    if (styleMatch) {
        style = styleMatch[1];
        remainder = remainder.replace(new RegExp(styleMatch[1], 'i'), ' ');
    }

    if (!colorMatch) {
        const namedColor = remainder.trim().split(/\s+/).filter(tok => tok && !/^-?\d/.test(tok))[0];
        if (namedColor) color = toHexColor(namedColor);
    }

    const widthMatch = remainder.match(/(-?\d+(?:\.\d+)?)/);
    const width = widthMatch ? parseFloat(widthMatch[1]) : (style !== 'none' ? 1 : 0);

    if (style === 'none' || style === 'hidden' || width <= 0) {
        return { width: 0, style: 'none', color };
    }
    return { width, style, color };
};

// Finds the <a> tag enclosing the current selection's anchor point.
function getEnclosingLink(selection: Selection | null): HTMLAnchorElement | null {
    if (!selection || !selection.anchorNode) return null;
    const { anchorNode } = selection;
    if (anchorNode.nodeType === Node.ELEMENT_NODE) {
        return (anchorNode as Element).closest('a');
    }
    return anchorNode.parentElement?.closest('a') ?? null;
}

// Finds the nearest styled <span> enclosing the selection's anchor point, ignoring
// spans that belong to a link (those are handled through the link controls instead).
function getEnclosingStyledSpan(selection: Selection | null, editorEl: HTMLElement | null): HTMLSpanElement | null {
    if (!selection || !selection.anchorNode || !editorEl) return null;
    const { anchorNode } = selection;
    const startEl = anchorNode.nodeType === Node.ELEMENT_NODE ? (anchorNode as Element) : anchorNode.parentElement;
    if (!startEl) return null;
    const span = startEl.closest('span[style]');
    if (!span || !editorEl.contains(span)) return null;
    if (span.closest('a')) return null;
    return span as HTMLSpanElement;
}

// A link's dedicated inner <span> is what carries its per-run style (see the vibe-text
// blueprint: <a style="..."><span style="...">text</span></a>). Creates it if missing.
function ensureInnerSpan(link: HTMLAnchorElement): HTMLSpanElement {
    const existing = link.querySelector(':scope > span') as HTMLSpanElement | null;
    if (existing) return existing;
    const span = document.createElement('span');
    while (link.firstChild) span.appendChild(link.firstChild);
    link.appendChild(span);
    return span;
}

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
    const savedRange = useRef<Range | null>(null);
    const [activeBorderSide, setActiveBorderSide] = useState<'top' | 'right' | 'bottom' | 'left'>('top');

    // Inline "run" formatting state for whatever is currently selected inside the content editor.
    const [activeFormats, setActiveFormats] = useState(defaultActiveFormats);
    const [isLinkActive, setIsLinkActive] = useState(false);
    const [canClearStyle, setCanClearStyle] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkTarget, setLinkTarget] = useState('_blank');

    const activeBorder = formData.styles.border[activeBorderSide];
    const updateActiveBorder = (patch: Partial<typeof activeBorder>) => setFormData(d => ({
        ...d,
        styles: { ...d.styles, border: { ...d.styles.border, [activeBorderSide]: { ...d.styles.border[activeBorderSide], ...patch } } }
    }));

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

            const newBorder = {
                top: parseBorderSide(styleObj['border-top'] || styleObj['border']),
                right: parseBorderSide(styleObj['border-right'] || styleObj['border']),
                bottom: parseBorderSide(styleObj['border-bottom'] || styleObj['border']),
                left: parseBorderSide(styleObj['border-left'] || styleObj['border']),
            };

            setFormData({
                styles: {
                    fontFamily: matchedFont ? matchedFont.value : fontFamilyValue,
                    fontSize: parseFloat(styleObj['font-size']) || defaultFormData.styles.fontSize,
                    lineHeight: parseFloat(styleObj['line-height']) || defaultFormData.styles.lineHeight,
                    letterSpacing: parseFloat(styleObj['letter-spacing']) || defaultFormData.styles.letterSpacing,
                    color: toHexColor(styleObj['color'] || defaultFormData.styles.color),
                    textAlign: styleObj['text-align'] || defaultFormData.styles.textAlign,
                    fontWeight: styleObj['font-weight'] || defaultFormData.styles.fontWeight,
                    fontStyle: styleObj['font-style'] || defaultFormData.styles.fontStyle,
                    textTransform: styleObj['text-transform'] || defaultFormData.styles.textTransform,
                    padding: newPadding,
                    border: newBorder,
                },
                content: editData.content
            });
            setActiveBorderSide('top');
            setActiveFormats(defaultActiveFormats);
            setIsLinkActive(false);
            setCanClearStyle(false);
            setLinkUrl('');
            setLinkTarget('_blank');
            savedRange.current = null;

            if (editorRef.current && !isSourceMode) {
                editorRef.current.innerHTML = editData.content;
            }

        } else {
            setFormData(defaultFormData);
            setActiveFormats(defaultActiveFormats);
            setIsLinkActive(false);
            setCanClearStyle(false);
            setLinkUrl('');
            setLinkTarget('_blank');
            savedRange.current = null;
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
        if (formData.styles.letterSpacing) {
            newStyleMap.set('letter-spacing', `${formData.styles.letterSpacing}px`);
        }
        newStyleMap.set('color', toHexColor(formData.styles.color));
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

        (['top', 'right', 'bottom', 'left'] as const).forEach(side => {
            const b = formData.styles.border[side];
            if (b.style !== 'none' && b.width > 0) {
                newStyleMap.set(`border-${side}`, `${b.width}px ${b.style} ${toHexColor(b.color)}`);
            }
        });

        const declarations = Array.from(newStyleMap.entries())
            .map(([prop, val]) => `${prop}: ${val}`);

        const styleString = declarations.join('; ') + (declarations.length > 0 ? ';' : '');

        onSave({ id: editData.id, style: styleString, content: finalContent });
        onClose();
    };

    // Live preview needs a background that contrasts with the chosen text color —
    // a fixed white swatch makes white/light text invisible in the preview.
    const previewBg = useMemo(() => {
        const clean = formData.styles.color.replace('#', '');
        if (!/^[0-9a-fA-F]{6}$/.test(clean)) return '#ffffff';
        const r = parseInt(clean.slice(0, 2), 16);
        const g = parseInt(clean.slice(2, 4), 16);
        const b = parseInt(clean.slice(4, 6), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 150 ? '#1f2937' : '#ffffff';
    }, [formData.styles.color]);

    const previewStyle = useMemo(() => ({
        fontFamily: formData.styles.fontFamily,
        fontSize: `${formData.styles.fontSize}px`,
        lineHeight: `${formData.styles.lineHeight}px`,
        letterSpacing: `${formData.styles.letterSpacing}px`,
        color: formData.styles.color,
        textAlign: formData.styles.textAlign as any,
        fontWeight: formData.styles.fontWeight as any,
        fontStyle: formData.styles.fontStyle as any,
        textTransform: formData.styles.textTransform as any,
        paddingTop: `${formData.styles.padding.top}px`,
        paddingRight: `${formData.styles.padding.right}px`,
        paddingBottom: `${formData.styles.padding.bottom}px`,
        paddingLeft: `${formData.styles.padding.left}px`,
        borderTop: formData.styles.border.top.style !== 'none' ? `${formData.styles.border.top.width}px ${formData.styles.border.top.style} ${formData.styles.border.top.color}` : 'none',
        borderRight: formData.styles.border.right.style !== 'none' ? `${formData.styles.border.right.width}px ${formData.styles.border.right.style} ${formData.styles.border.right.color}` : 'none',
        borderBottom: formData.styles.border.bottom.style !== 'none' ? `${formData.styles.border.bottom.width}px ${formData.styles.border.bottom.style} ${formData.styles.border.bottom.color}` : 'none',
        borderLeft: formData.styles.border.left.style !== 'none' ? `${formData.styles.border.left.width}px ${formData.styles.border.left.style} ${formData.styles.border.left.color}` : 'none',
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
            // A link's dedicated inner span (<a><span>text</span></a>) is kept even when it
            // carries no style of its own — it's the anchor point for future run styling.
            const emptySpans = Array.from(editor.querySelectorAll('span:not([style]), span[style=""]')).filter(span => {
                const parent = span.parentElement;
                return !(parent && parent.tagName === 'A' && parent.children.length === 1 && parent.firstElementChild === span);
            });
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

    const syncContentFromEditor = () => {
        if (editorRef.current) {
            const html = editorRef.current.innerHTML;
            setFormData(d => ({ ...d, content: html }));
        }
    };

    const saveSelection = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
                savedRange.current = range.cloneRange();
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

    // Re-reads the current selection to sync the toolbar's active states (bold/italic/
    // underline/color, whether it's inside a link, whether it can be "cleared").
    const refreshToolbarState = () => {
        if (isSourceMode || !editorRef.current) return;
        saveSelection();
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || !editorRef.current.contains(selection.getRangeAt(0).commonAncestorContainer)) {
            return;
        }

        const link = getEnclosingLink(selection);
        setIsLinkActive(!!link);
        if (link) {
            setLinkUrl(link.getAttribute('href') || '');
            setLinkTarget(link.getAttribute('target') || '_blank');
        }
        setCanClearStyle(!link && !!getEnclosingStyledSpan(selection, editorRef.current));

        const range = selection.getRangeAt(0);
        const node = range.commonAncestorContainer;
        const el = (node.nodeType === Node.ELEMENT_NODE ? node as Element : node.parentElement) || editorRef.current;
        const computed = window.getComputedStyle(el);
        const fw = computed.fontWeight;
        setActiveFormats({
            bold: fw === 'bold' || parseInt(fw, 10) >= 700,
            italic: computed.fontStyle === 'italic',
            underline: computed.textDecorationLine.includes('underline'),
            color: toHexColor(computed.color),
        });
    };

    // Core handler behind Bold/Italic/Underline/Color. Updates in place when the selection
    // exactly matches an existing link or styled span, otherwise wraps the selection in a
    // new <span> carrying the property (letting cleanupAndNormalize merge/split runs).
    const applyFormat = (prop: string, value: string | null) => {
        if (isSourceMode || !editorRef.current) return;
        restoreSelection();
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);
        const enclosingLink = getEnclosingLink(selection);
        const selectedText = selection.toString();

        const setProp = (el: HTMLElement) => {
            if (value === null) el.style.removeProperty(prop);
            else el.style.setProperty(prop, value);
        };

        if (enclosingLink && (selection.isCollapsed || selectedText.trim() === (enclosingLink.textContent || '').trim())) {
            setProp(enclosingLink);
            setProp(ensureInnerSpan(enclosingLink));
        } else if (!selection.isCollapsed) {
            const enclosingSpan = getEnclosingStyledSpan(selection, editorRef.current);
            if (enclosingSpan && selectedText.trim() === (enclosingSpan.textContent || '').trim()) {
                setProp(enclosingSpan);
            } else {
                const fragment = range.extractContents();
                const span = document.createElement('span');
                setProp(span);
                span.appendChild(fragment);
                range.insertNode(span);
                const newRange = document.createRange();
                newRange.selectNodeContents(span);
                selection.removeAllRanges();
                selection.addRange(newRange);
            }
        } else {
            return;
        }

        cleanupAndNormalize();
        syncContentFromEditor();
        refreshToolbarState();
    };

    const toggleBold = () => applyFormat('font-weight', activeFormats.bold ? null : 'bold');
    const toggleItalic = () => applyFormat('font-style', activeFormats.italic ? null : 'italic');
    const toggleUnderline = () => applyFormat('text-decoration', activeFormats.underline ? null : 'underline');
    const handleColorChange = (hex: string) => applyFormat('color', hex);

    const handleApplyLink = () => {
        if (isSourceMode || !editorRef.current) return;
        const url = linkUrl.trim();
        if (!url) return;
        restoreSelection();
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        let finalUrl = url;
        if (!/^[a-z][a-z0-9+.-]*:/i.test(finalUrl)) {
            finalUrl = `https://${finalUrl}`;
        }

        const enclosingLink = getEnclosingLink(selection);
        const selectedText = selection.toString();

        if (enclosingLink && (selection.isCollapsed || selectedText.trim() === (enclosingLink.textContent || '').trim())) {
            // Case: selection is (or sits inside) an existing link — update it in place.
            enclosingLink.setAttribute('href', finalUrl);
            if (linkTarget) enclosingLink.setAttribute('target', linkTarget); else enclosingLink.removeAttribute('target');
            ensureInnerSpan(enclosingLink);
        } else if (!selection.isCollapsed) {
            // Case: fresh selection — wrap it in a new <a><span>...</span></a>, un-linking
            // first in case the selection straddles part of an existing link.
            document.execCommand('unlink', false, undefined);
            const freshRange = selection.getRangeAt(0);
            const fragment = freshRange.extractContents();
            const link = document.createElement('a');
            link.setAttribute('href', finalUrl);
            if (linkTarget) link.setAttribute('target', linkTarget);
            const span = document.createElement('span');
            span.appendChild(fragment);
            link.appendChild(span);
            freshRange.insertNode(link);
            const newRange = document.createRange();
            newRange.selectNodeContents(link);
            selection.removeAllRanges();
            selection.addRange(newRange);
        } else {
            return;
        }

        savedRange.current = null;
        cleanupAndNormalize();
        syncContentFromEditor();
        refreshToolbarState();
    };

    const handleUnlink = () => {
        if (isSourceMode || !editorRef.current) return;
        restoreSelection();
        const selection = window.getSelection();
        if (!selection || !selection.anchorNode) return;
        const link = getEnclosingLink(selection);
        if (!link) return;

        // Our structure is <a><span>...</span></a> — drop both tags, keep only the text.
        const innerSpan = link.querySelector(':scope > span');
        const contentToPreserve = innerSpan ? innerSpan.innerHTML : link.innerHTML;
        const fragment = document.createRange().createContextualFragment(contentToPreserve);
        link.parentNode?.replaceChild(fragment, link);

        selection.removeAllRanges();
        savedRange.current = null;
        cleanupAndNormalize();
        syncContentFromEditor();
        refreshToolbarState();
    };

    const handleClearStyle = () => {
        if (isSourceMode || !editorRef.current) return;
        restoreSelection();
        const selection = window.getSelection();
        if (!selection || !selection.anchorNode) return;
        const span = getEnclosingStyledSpan(selection, editorRef.current);
        if (!span) return;

        const fragment = document.createRange().createContextualFragment(span.innerHTML);
        span.parentNode?.replaceChild(fragment, span);

        selection.removeAllRanges();
        savedRange.current = null;
        cleanupAndNormalize();
        syncContentFromEditor();
        refreshToolbarState();
    };

    if (!isOpen || !editData) return null;

    const inputClass = "w-full px-2.5 py-1.5 text-sm text-white bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none";
    const labelClass = "block text-[11px] font-medium text-gray-500 mb-1";
    const sectionLabelClass = "text-[11px] font-bold uppercase tracking-wider text-gray-500";
    const toggleBtnClass = (active: boolean) => `w-full py-1.5 rounded-md border text-sm transition-colors ${active ? 'bg-violet-600 border-violet-500 text-white' : 'bg-gray-900 border-gray-600 text-gray-300 hover:bg-gray-700'}`;
    const ribbonBtnClass = (active: boolean) => `p-1.5 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${active ? 'bg-violet-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`;

    return (
        <>
            <style>{`
                .tase-editor a { background-color: rgba(250, 204, 21, 0.25); border-radius: 2px; }
                .tase-editor a:hover { background-color: rgba(250, 204, 21, 0.4); }
            `}</style>
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
                                <div className="rounded min-h-[60px] flex items-center p-2" style={{ backgroundColor: previewBg }}>
                                    <div style={previewStyle} dangerouslySetInnerHTML={{ __html: formData.content }} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-700/40 p-3.5 rounded-lg space-y-3">
                                    <h3 className={sectionLabelClass}>Typography</h3>
                                    <div>
                                        <label className={labelClass}>Font Family</label>
                                        <select value={formData.styles.fontFamily} onChange={e => setFormData(d => ({ ...d, styles: { ...d.styles, fontFamily: e.target.value }}))} className={inputClass}>
                                            {emailSafeFonts.map(font => <option key={font.name} value={font.value} style={{ fontFamily: font.value }}>{font.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className={labelClass}>Size (px)</label>
                                            <input type="number" value={formData.styles.fontSize} onChange={e => setFormData(d => ({...d, styles: {...d.styles, fontSize: parseFloat(e.target.value) || 0}}))} className={inputClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Line (px)</label>
                                            <input type="number" value={formData.styles.lineHeight} onChange={e => setFormData(d => ({...d, styles: {...d.styles, lineHeight: parseFloat(e.target.value) || 0}}))} className={inputClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Spacing (px)</label>
                                            <input type="number" step="0.1" value={formData.styles.letterSpacing} onChange={e => setFormData(d => ({...d, styles: {...d.styles, letterSpacing: parseFloat(e.target.value) || 0}}))} className={inputClass} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className={labelClass}>Weight</label>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(d => ({...d, styles: {...d.styles, fontWeight: d.styles.fontWeight === 'bold' ? 'normal' : 'bold'}}))}
                                                className={toggleBtnClass(formData.styles.fontWeight === 'bold') + ' font-bold'}
                                                title="Toggle bold"
                                            >
                                                B
                                            </button>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Style</label>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(d => ({...d, styles: {...d.styles, fontStyle: d.styles.fontStyle === 'italic' ? 'normal' : 'italic'}}))}
                                                className={toggleBtnClass(formData.styles.fontStyle === 'italic') + ' italic'}
                                                title="Toggle italic"
                                            >
                                                I
                                            </button>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Transform</label>
                                            <select value={formData.styles.textTransform} onChange={e => setFormData(d => ({...d, styles: {...d.styles, textTransform: e.target.value}}))} className={inputClass}>
                                                <option value="none">None</option>
                                                <option value="uppercase">UPPER</option>
                                                <option value="capitalize">Capitalize</option>
                                                <option value="lowercase">lower</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-700/40 p-3.5 rounded-lg space-y-3">
                                    <h3 className={sectionLabelClass}>Color & Alignment</h3>
                                    <div className="grid grid-cols-[1fr_auto] gap-2">
                                        <div>
                                            <label className={labelClass}>Text Color</label>
                                            <ColorPickerInput
                                                value={formData.styles.color}
                                                onChange={hex => setFormData(d => ({ ...d, styles: { ...d.styles, color: hex } }))}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Align</label>
                                            <div className="grid grid-cols-4 gap-0.5 bg-gray-900 border border-gray-600 rounded-md p-1">
                                                {([
                                                    { value: 'left', Icon: AlignLeftIcon },
                                                    { value: 'center', Icon: AlignCenterIcon },
                                                    { value: 'right', Icon: AlignRightIcon },
                                                    { value: 'justify', Icon: AlignJustifyIcon },
                                                ] as const).map(({ value, Icon }) => (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        title={value.charAt(0).toUpperCase() + value.slice(1)}
                                                        onClick={() => setFormData(d => ({ ...d, styles: { ...d.styles, textAlign: value } }))}
                                                        className={`flex items-center justify-center w-7 h-7 rounded transition-colors ${formData.styles.textAlign === value ? 'bg-violet-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                                                    >
                                                        <Icon className="w-4 h-4" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Padding (px)</label>
                                        <div className="grid grid-cols-4 gap-1.5">
                                            {(['top', 'right', 'bottom', 'left'] as const).map(side => (
                                                <div key={side} className="flex items-center bg-gray-900 border border-gray-600 rounded-md focus-within:ring-2 focus-within:ring-pink-500 pl-1.5">
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase flex-shrink-0" title={side}>{side[0]}</span>
                                                    <input
                                                        type="number"
                                                        value={formData.styles.padding[side]}
                                                        onChange={e => setFormData(d => ({...d, styles: {...d.styles, padding: {...d.styles.padding, [side]: parseFloat(e.target.value) || 0 }}}))}
                                                        className="w-full min-w-0 py-1.5 pl-1 pr-1.5 text-sm text-white bg-transparent focus:outline-none"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className={labelClass + ' mb-0'}>Border</label>
                                            <div className="flex gap-1">
                                                {(['top', 'right', 'bottom', 'left'] as const).map(side => {
                                                    const active = activeBorderSide === side;
                                                    const hasBorder = formData.styles.border[side].style !== 'none';
                                                    return (
                                                        <button
                                                            key={side}
                                                            type="button"
                                                            title={side.charAt(0).toUpperCase() + side.slice(1)}
                                                            onClick={() => setActiveBorderSide(side)}
                                                            className={`relative w-7 h-7 text-[11px] font-bold uppercase rounded-md border transition-colors ${active ? 'bg-violet-600 border-violet-500 text-white' : 'bg-gray-900 border-gray-600 text-gray-300 hover:bg-gray-700'}`}
                                                        >
                                                            {side[0]}
                                                            {hasBorder && (
                                                                <span
                                                                    className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ring-1 ring-gray-800"
                                                                    style={{ backgroundColor: formData.styles.border[side].color }}
                                                                />
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-[3rem_1fr_7.5rem] gap-1.5 items-center">
                                            <input
                                                type="number"
                                                min="0"
                                                title="Width (px)"
                                                value={activeBorder.width}
                                                onChange={e => updateActiveBorder({ width: parseFloat(e.target.value) || 0 })}
                                                className="w-full px-2 py-1.5 text-sm text-white bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none"
                                            />
                                            <select
                                                value={activeBorder.style}
                                                onChange={e => {
                                                    const newStyle = e.target.value;
                                                    updateActiveBorder({ style: newStyle, width: newStyle !== 'none' && activeBorder.width === 0 ? 1 : activeBorder.width });
                                                }}
                                                className="w-full px-2 py-1.5 text-sm text-white bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none"
                                            >
                                                <option value="none">None</option>
                                                <option value="solid">Solid</option>
                                                <option value="dashed">Dashed</option>
                                                <option value="dotted">Dotted</option>
                                                <option value="double">Double</option>
                                            </select>
                                            <ColorPickerInput value={activeBorder.color} onChange={hex => updateActiveBorder({ color: hex })} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content Editor */}
                            <div>
                                <div className={`bg-gray-900 border-t border-l border-r border-gray-600 rounded-t-md text-gray-300 ${isSourceMode ? 'opacity-70' : ''}`}>
                                    {/* Ribbon row 1: run-level text formatting */}
                                    <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-gray-700/70">
                                        <div className="flex items-center gap-0.5">
                                            <button type="button" onClick={toggleBold} disabled={isSourceMode} className={ribbonBtnClass(activeFormats.bold)} title="Bold selected text">
                                                <BoldIcon className="w-4 h-4 fill-current" />
                                            </button>
                                            <button type="button" onClick={toggleItalic} disabled={isSourceMode} className={ribbonBtnClass(activeFormats.italic)} title="Italicize selected text">
                                                <ItalicIcon className="w-4 h-4 fill-current" />
                                            </button>
                                            <button type="button" onClick={toggleUnderline} disabled={isSourceMode} className={ribbonBtnClass(activeFormats.underline)} title="Underline selected text">
                                                <UnderlineIcon className="w-4 h-4 fill-current" />
                                            </button>
                                        </div>

                                        <div className="w-px h-5 bg-gray-700 mx-1.5" />

                                        <div className="flex items-center gap-1.5" title="Text color for selected text">
                                            <TextColorIcon className="w-4 h-4 text-gray-400 flex-shrink-0" barColor={activeFormats.color} />
                                            <div className="w-32">
                                                <ColorPickerInput value={activeFormats.color} onChange={handleColorChange} />
                                            </div>
                                        </div>

                                        <div className="w-px h-5 bg-gray-700 mx-1.5" />

                                        <button type="button" onClick={handleClearStyle} disabled={isSourceMode || !canClearStyle} className={ribbonBtnClass(false)} title="Clear style on selected text">
                                            <EraserIcon className="w-4 h-4" />
                                        </button>

                                        <div className="flex-1" />

                                        <button type="button" onClick={() => setIsSourceMode(!isSourceMode)} className={ribbonBtnClass(isSourceMode)} title="View Source">
                                            <CodeIcon className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Ribbon row 2: link controls (replaces the old separate Edit Link modal) */}
                                    <div className={`flex flex-wrap items-center gap-2 px-2 py-1.5 ${isSourceMode ? 'pointer-events-none opacity-50' : ''}`}>
                                        <LinkIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                        <input
                                            type="text"
                                            value={linkUrl}
                                            onChange={e => setLinkUrl(e.target.value)}
                                            onFocus={saveSelection}
                                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleApplyLink(); } }}
                                            placeholder="Select text, then type or paste a URL…"
                                            className="flex-1 min-w-[10rem] px-2.5 py-1 text-sm text-white bg-gray-950/60 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none"
                                        />
                                        <select
                                            value={linkTarget}
                                            onChange={e => setLinkTarget(e.target.value)}
                                            onFocus={saveSelection}
                                            className="px-2 py-1 text-sm text-white bg-gray-950/60 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none"
                                        >
                                            <option value="_blank">New Tab</option>
                                            <option value="_self">Same Tab</option>
                                        </select>
                                        <button
                                            type="button"
                                            onClick={handleApplyLink}
                                            disabled={!linkUrl.trim()}
                                            className="flex items-center gap-1.5 px-3 py-1 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <LinkIcon className="w-3.5 h-3.5" />
                                            {isLinkActive ? 'Update' : 'Apply'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleUnlink}
                                            disabled={!isLinkActive}
                                            className="flex items-center gap-1.5 px-3 py-1 text-sm font-semibold text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <UnlinkIcon className="w-3.5 h-3.5" />
                                            Unlink
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
                                        onBlur={() => { cleanupAndNormalize(); saveSelection(); }}
                                        onMouseUp={refreshToolbarState}
                                        onKeyUp={refreshToolbarState}
                                        onFocus={refreshToolbarState}
                                        className="tase-editor w-full h-48 p-3 text-black bg-white rounded-b-md focus:ring-2 focus:ring-pink-500 focus:outline-none overflow-y-auto"
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
