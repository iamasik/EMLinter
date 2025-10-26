import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { InfoIcon, CodeIcon, DownloadIcon, AlertTriangleIcon, SaveIcon, SpinnerIcon, CheckCircleIcon, TrashIcon, DesktopIcon, MobileIcon, ImageIcon, BriefcaseIcon, CloseIcon, UploadIcon, ChevronUpIcon, ChevronDownIcon, CopyIcon, SunIcon, MoonIcon, MobileCssIcon, ChatAltIcon } from '../components/Icons';
import UploadHtmlModal from '../components/modals/UploadHtmlModal';
import InstructionsModal from '../components/modals/InstructionsModal';
import CodeViewModal from '../components/modals/CodeViewModal';
import ImageEditModal from '../components/modals/ImageEditModal';
import TextAndStyleEditModal from '../components/modals/TextAndStyleEditModal';
import BackgroundEditModal from '../components/modals/BackgroundEditModal';
import ResponsiveCssModal from '../components/modals/ResponsiveCssModal';
import PreviewTextModal from '../components/modals/PreviewTextModal';
import { getTemplateBySlug } from '../services/firebase';
import ActionInfoModal from '../components/modals/ActionInfoModal';

/**
 * Converts an RGB color string to a HEX string.
 * This is crucial because browsers often serialize computed styles to RGB.
 * @param rgb The RGB color string (e.g., "rgb(255, 0, 0)").
 * @returns The HEX color string (e.g., "#ff0000") or the original string if conversion fails.
 */
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

const PrivacyInfoModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-2xl p-6 relative" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-yellow-300 flex items-center gap-3"><AlertTriangleIcon className="w-6 h-6" /> Important Note on Data & Privacy</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                </div>
                <p className="text-yellow-400/80 text-sm">
                    This website operates entirely in your browser. No HTML data is stored on our servers. When using image URLs from third-party services, you are responsible for the content you link to. You must ensure you have the rights to use them and that they are legal and non-infringing. We accept no liability for linked images.
                </p>
            </div>
        </div>
    );
};

const VisualEditorPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
    const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isTextAndStyleModalOpen, setIsTextAndStyleModalOpen] = useState(false);
    const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false);
    const [isResponsiveCssModalOpen, setIsResponsiveCssModalOpen] = useState(false);
    const [isPreviewTextModalOpen, setIsPreviewTextModalOpen] = useState(false);
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
    const [isFiverrModalOpen, setIsFiverrModalOpen] = useState(false);
    
    const [editingImage, setEditingImage] = useState<any | null>(null);
    const [editingTextAndStyle, setEditingTextAndStyle] = useState<any | null>(null);
    const [editingBackground, setEditingBackground] = useState<any | null>(null);

    const [templateHtml, setTemplateHtml] = useState<string | null>(null);
    const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const scrollPosRef = useRef<number>(0);
    const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Additions for responsive scaling
    const [scale, setScale] = useState(1);
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const previewWidth = useMemo(() => viewMode === 'mobile' ? 375 : 800, [viewMode]);

    useEffect(() => {
        const schema = {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "EMLinter - Vibe Visual Editor",
          "applicationCategory": "DeveloperApplication",
          "operatingSystem": "Web/Online",
          "description": "Edit your coded HTML emails visually without writing code. Vibe lets your team update text, images, and links in real-time. Empower your marketers to make changes safely.",
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

    useEffect(() => {
        const previewContainer = previewContainerRef.current;
        if (!previewContainer) return;

        const calculateScale = () => {
            const containerPadding = 32; // Corresponds to p-4 (1rem on each side, 16px * 2)
            const availableWidth = previewContainer.offsetWidth - containerPadding;
            
            if (previewWidth > availableWidth) {
                setScale(availableWidth / previewWidth);
            } else {
                setScale(1);
            }
        };

        const resizeObserver = new ResizeObserver(calculateScale);
        resizeObserver.observe(previewContainer);
        calculateScale(); // Initial calculation

        return () => resizeObserver.disconnect();
    }, [previewWidth]);


    // Load from slug or localStorage on initial mount
    useEffect(() => {
        const loadTemplate = async () => {
            if (slug) {
                setIsLoadingTemplate(true);
                setTemplateHtml(null); // Clear previous template
                try {
                    const templateData = await getTemplateBySlug(slug);
                    if (templateData && templateData.htmlFileUrl) {
                        const response = await fetch(templateData.htmlFileUrl);
                        if (!response.ok) {
                            throw new Error(`Failed to fetch template HTML: ${response.statusText}`);
                        }
                        const htmlContent = await response.text();
                        setTemplateHtml(htmlContent);
                    } else {
                        console.error("Template with slug not found:", slug);
                    }
                } catch (error) {
                    console.error("Could not load template from slug:", error);
                } finally {
                    setIsLoadingTemplate(false);
                }
            } else {
                try {
                    const savedHtml = localStorage.getItem('emlinter-visual-editor-template');
                    if (savedHtml) {
                        setTemplateHtml(savedHtml);
                    }
                } catch (error) {
                    console.error("Could not load template from local storage:", error);
                }
            }
        };

        loadTemplate();
    }, [slug]);

    const handleSaveToLocal = () => {
        if (!templateHtml) return;
        setSaveState('saving');
        try {
            localStorage.setItem('emlinter-visual-editor-template', templateHtml);
            setTimeout(() => {
                setSaveState('saved');
                setTimeout(() => setSaveState('idle'), 1500);
            }, 500);
        } catch (error) {
            console.error("Could not save template to local storage:", error);
            setSaveState('idle'); // Reset on error
        }
    };

    const handleClearLocal = () => {
        try {
            localStorage.removeItem('emlinter-visual-editor-template');
            setTemplateHtml(null);
        } catch (error) {
            console.error("Could not clear template from local storage:", error);
        }
    };

    const handleUpload = (html: string) => {
        setTemplateHtml(html);
    };
    
    const handleDownloadHtml = () => {
      if (!templateHtml) return;
      const blob = new Blob([templateHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Template.html');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    const handleImageSave = (updatedData: any) => {
        iframeRef.current?.contentWindow?.postMessage({
            type: 'vibe-image-update',
            ...updatedData,
        }, '*');
        setIsImageModalOpen(false);
    };

    const handleTextAndStyleSave = (updatedData: { id: string; content: string; style: string; }) => {
        iframeRef.current?.contentWindow?.postMessage({
            type: 'vibe-text-style-update',
            ...updatedData
        }, '*');
        setIsTextAndStyleModalOpen(false);
    };
    
    const handleBackgroundSave = (updatedData: any) => {
        iframeRef.current?.contentWindow?.postMessage({
            type: 'vibe-bg-update',
            ...updatedData,
        }, '*');
        setIsBackgroundModalOpen(false);
    };

    const handleResponsiveCssSave = (newHtml: string) => {
        setTemplateHtml(newHtml);
        setIsResponsiveCssModalOpen(false);
    };
    
    const handlePreviewTextSave = (newHtml: string) => {
        setTemplateHtml(newHtml);
        setIsPreviewTextModalOpen(false);
    };

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'vibe-html-update' && event.data.html) {
                if (typeof event.data.scrollTop === 'number') {
                    scrollPosRef.current = event.data.scrollTop;
                }
                let finalHtml = event.data.html;
                // BUG FIX: The browser's .outerHTML property serializes colors as RGB.
                // We must convert them back to HEX for better email client compatibility.
                finalHtml = finalHtml.replace(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g, (match) => {
                    return rgbToHex(match);
                });
                setTemplateHtml(finalHtml);
            }
            if (event.data.type === 'vibe-image-click') {
                setEditingImage(event.data.imageData);
                setIsImageModalOpen(true);
            }
            if (event.data.type === 'vibe-text-click') {
                setEditingTextAndStyle(event.data.textData);
                setIsTextAndStyleModalOpen(true); // Directly open the main editor
            }
            if (event.data.type === 'vibe-bg-click') {
                setEditingBackground(event.data.bgData);
                setIsBackgroundModalOpen(true);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe || !templateHtml) return;

        const handleLoad = () => {
            const doc = iframe.contentDocument;
            if (!doc || !iframe.contentWindow) return;

            const style = doc.createElement('style');
            style.dataset.vibeEditor = 'style';
            style.textContent = `
                .vibe-section-hover { outline: 2px solid #8B5CF6 !important; outline-offset: 2px; }
                .vibe-controls { 
                    position: absolute; z-index: 9999; display: none;
                    background-color: rgba(76, 29, 149, 0.8); /* a bit transparent */
                    backdrop-filter: blur(4px);
                    -webkit-backdrop-filter: blur(4px);
                    border-radius: 6px; 
                    padding: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    gap: 4px;
                }
                
                .vibe-section-controls { top: 4px; left: 4px; }
                .vibe-text-controls { top: 4px; right: 4px; left: auto; }
                
                .vibe-section-hover .vibe-section-controls,
                .vibe-text-row-hover .vibe-text-controls { 
                    display: flex; 
                }
                
                .vibe-control-btn { background-color: #8B5CF6; color: white; border: none; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 4px; cursor: pointer; transition: background-color 0.2s; font-size: 16px; font-weight: bold; line-height: 1; }
                .vibe-control-btn:hover { background-color: #A78BFA; }
                .vibe-control-btn:disabled { background-color: #4B5563; cursor: not-allowed; }
                .vibe-control-btn svg { width: 16px; height: 16px; }

                .vibe-img, .vibe-text { cursor: pointer; transition: outline 0.2s; }
                .vibe-img:hover, .vibe-text:hover { outline: 2px dashed #8B5CF6; outline-offset: 2px; }
                .vibe-bg { position: relative; }
                .vibe-bg-hover { outline: 2px dashed #8B5CF6 !important; outline-offset: -2px; }
                .vibe-bg-control { position: absolute; top: 10px; right: 10px; z-index: 9998; background-color: #4C1D95; border-radius: 6px; display: none; padding: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); cursor: pointer; }
                .vibe-bg-hover .vibe-bg-control { display: block; }
                .vibe-bg-control-btn { background-color: #8B5CF6; color: white; border: none; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 4px; }
                .vibe-bg-control-btn:hover { background-color: #A78BFA; }
                .vibe-bg-control-btn svg { width: 16px; height: 16px; }
            `;
            doc.head.appendChild(style);

            const script = doc.createElement('script');
            script.dataset.vibeEditor = 'script';
            
            const arrowUpIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" /></svg>`;
            const arrowDownIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>`;
            const copyIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>`;
            const deleteIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>`;
            const bgIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1-1m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;

            const fullControlsHtml = 
                `<button class="vibe-control-btn" data-action="move-up" title="Move Up">${arrowUpIconSvg}</button>` +
                `<button class="vibe-control-btn" data-action="move-down" title="Move Down">${arrowDownIconSvg}</button>` +
                `<button class="vibe-control-btn" data-action="duplicate" title="Duplicate">${copyIconSvg}</button>` +
                `<button class="vibe-control-btn" data-action="delete" title="Delete">${deleteIconSvg}</button>`;

            script.textContent = `
                function syncHtml() {
                    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                    const cleanDoc = document.cloneNode(true);
                    cleanDoc.querySelectorAll('[data-vibe-editor="style"], [data-vibe-editor="script"], .vibe-controls, .vibe-bg-control').forEach(el => el.remove());
                    cleanDoc.querySelectorAll('[data-vibe-initialized], [data-vibe-img-id], [data-vibe-link-id], [data-vibe-text-id], [data-vibe-bg-id]').forEach(el => {
                        el.classList.remove('vibe-section-hover', 'vibe-text-row-hover', 'vibe-bg-hover');
                        el.removeAttribute('data-vibe-initialized');
                        el.removeAttribute('data-vibe-img-id');
                        el.removeAttribute('data-vibe-link-id');
                        el.removeAttribute('data-vibe-text-id');
                        el.removeAttribute('data-vibe-bg-id');
                    });
                    cleanDoc.querySelectorAll('td[style*="position: relative"], th[style*="position: relative"]').forEach(cell => {
                        cell.style.removeProperty('position');
                        if (cell.getAttribute('style') && cell.getAttribute('style').trim() === '') {
                            cell.removeAttribute('style');
                        }
                    });
                    cleanDoc.querySelectorAll('[class=""]').forEach(el => el.removeAttribute('class'));
                    
                    // Remove all TBODY tags but keep their children
                    cleanDoc.querySelectorAll('tbody').forEach(tbody => {
                        const parent = tbody.parentNode;
                        if (parent) {
                            while (tbody.firstChild) {
                                parent.insertBefore(tbody.firstChild, tbody);
                            }
                            parent.removeChild(tbody);
                        }
                    });

                    const doctype = document.doctype ? new XMLSerializer().serializeToString(document.doctype) : '';
                    const updatedHtml = doctype + cleanDoc.documentElement.outerHTML;
                    window.parent.postMessage({ type: 'vibe-html-update', html: updatedHtml, scrollTop: scrollTop }, '*');
                }

                function initRowControls(row, type) {
                    if (!row || row.dataset.vibeInitialized) return;
                    row.dataset.vibeInitialized = 'true';

                    const firstCell = row.querySelector('td, th');
                    if (!firstCell) return;
                    
                    if (window.getComputedStyle(firstCell).position === 'static') {
                        firstCell.style.position = 'relative';
                    }

                    const controls = document.createElement('div');
                    controls.className = 'vibe-controls';
                    controls.classList.add(type === 'section' ? 'vibe-section-controls' : 'vibe-text-controls');
                    controls.innerHTML = \`${fullControlsHtml}\`;
                    
                    firstCell.prepend(controls);
                    
                    row.addEventListener('mouseenter', () => {
                        row.classList.add(type === 'section' ? 'vibe-section-hover' : 'vibe-text-row-hover');
                        const activeControls = firstCell.querySelector('.vibe-controls');
                        if (!activeControls) return;

                        const moveUpBtn = activeControls.querySelector('[data-action="move-up"]');
                        const moveDownBtn = activeControls.querySelector('[data-action="move-down"]');

                        if (moveUpBtn) {
                            const prevSibling = row.previousElementSibling;
                            moveUpBtn.disabled = !prevSibling || prevSibling.tagName !== 'TR';
                        }
                        if (moveDownBtn) {
                            const nextSibling = row.nextElementSibling;
                            moveDownBtn.disabled = !nextSibling || nextSibling.tagName !== 'TR';
                        }
                    });
                    
                    row.addEventListener('mouseleave', () => row.classList.remove('vibe-section-hover', 'vibe-text-row-hover'));
                    
                    row.addEventListener('click', (e) => {
                        const actionTarget = e.target.closest('[data-action]');
                        if (actionTarget) {
                            e.stopPropagation(); e.preventDefault();
                            const action = actionTarget.getAttribute('data-action');
                            
                            if (action === 'duplicate') {
                                const clone = row.cloneNode(true);
                                clone.removeAttribute('data-vibe-initialized');
                                clone.querySelectorAll('.vibe-controls').forEach(el => el.remove());
                                const attrsToRemove = ['data-vibe-initialized', 'data-vibe-img-id', 'data-vibe-link-id', 'data-vibe-text-id', 'data-vibe-bg-id'];
                                clone.querySelectorAll('*').forEach(el => {
                                    attrsToRemove.forEach(attr => el.removeAttribute(attr));
                                });
                                
                                row.parentNode.insertBefore(clone, row.nextSibling);
                                initVibeElements();
                            } else if (action === 'delete') {
                                row.remove();
                            } else if (action === 'move-up') {
                                const prevSibling = row.previousElementSibling;
                                if (prevSibling && prevSibling.tagName === 'TR') {
                                    row.parentNode.insertBefore(row, prevSibling);
                                }
                            } else if (action === 'move-down') {
                                const nextSibling = row.nextElementSibling;
                                if (nextSibling && nextSibling.tagName === 'TR') {
                                    row.parentNode.insertBefore(nextSibling, row);
                                }
                            }
                            syncHtml();
                            return; // Stop processing to prevent text modal from opening
                        }
                        
                        // Check for the vibe-text element itself, but only trigger if no control was clicked.
                        const textTarget = e.target.closest('.vibe-text');
                        if (type === 'text' && textTarget && !e.target.closest('.vibe-controls')) {
                             e.preventDefault(); e.stopPropagation();
                            window.parent.postMessage({ type: 'vibe-text-click', textData: {
                                id: textTarget.dataset.vibeTextId,
                                content: textTarget.innerHTML,
                                style: textTarget.getAttribute('style') || ''
                            }}, '*');
                        }
                    });
                };
                
                function initImage(img, id) {
                    img.dataset.vibeImgId = id;
                    const parentLink = img.closest('a');
                    if (parentLink && !parentLink.dataset.vibeLinkId) {
                        parentLink.dataset.vibeLinkId = 'vibe-link-' + id;
                    }

                    img.addEventListener('click', (e) => {
                        e.preventDefault(); e.stopPropagation();
                        const currentParentLink = img.closest('a');
                        window.parent.postMessage({ type: 'vibe-image-click', imageData: {
                            id: img.dataset.vibeImgId,
                            src: img.getAttribute('src'), alt: img.getAttribute('alt'),
                            width: img.getAttribute('width'), height: img.getAttribute('height'),
                            linkId: currentParentLink ? currentParentLink.dataset.vibeLinkId : null,
                            href: currentParentLink ? currentParentLink.getAttribute('href') : null,
                            target: currentParentLink ? currentParentLink.getAttribute('target') : null,
                        }}, '*');
                    });
                }
                
                function initText(el, id) {
                   el.dataset.vibeTextId = id;
                   // The click listener is now handled by initRowControls to prevent conflicts.
                }

                function initBackground(el, id) {
                    if (el.dataset.vibeBgId) return;
                    el.dataset.vibeBgId = id;

                    const control = document.createElement('div');
                    control.className = 'vibe-bg-control';
                    control.title = 'Edit Background';
                    control.innerHTML = \`<button class="vibe-bg-control-btn">${bgIconSvg}</button>\`;
                    el.appendChild(control);

                    el.addEventListener('mouseenter', () => el.classList.add('vibe-bg-hover'));
                    el.addEventListener('mouseleave', () => el.classList.remove('vibe-bg-hover'));
                    
                    control.addEventListener('click', e => {
                        e.preventDefault(); e.stopPropagation();
                        let vmlSrc = null;
                        // Find the VML comment node INSIDE the element
                        for (const child of el.childNodes) {
                            if (child.nodeType === 8 && child.textContent && child.textContent.includes('gte mso 9')) {
                                const vmlContent = child.textContent;
                                const srcMatch = vmlContent.match(/<v:fill[^>]*src="([^"]*)"/i);
                                if(srcMatch && srcMatch[1]) {
                                    vmlSrc = srcMatch[1];
                                }
                                break;
                            }
                        }
                        
                        window.parent.postMessage({ type: 'vibe-bg-click', bgData: {
                           id: el.dataset.vibeBgId,
                           inlineStyle: el.getAttribute('style') || '',
                           backgroundAttr: el.getAttribute('background') || '',
                           bgColorAttr: el.getAttribute('bgcolor') || '',
                           vmlSrc: vmlSrc,
                        }}, '*');
                    });
                }

                function initVibeElements() {
                    document.querySelectorAll('.vibe-section:not([data-vibe-initialized])').forEach(row => initRowControls(row, 'section'));
                    
                    document.querySelectorAll('.vibe-text').forEach(textEl => {
                        const parentRow = textEl.closest('tr');
                        if (parentRow && !parentRow.dataset.vibeInitialized) {
                            initRowControls(parentRow, 'text');
                        }
                    });

                    let idCounter = 0;
                    const generateId = () => 'vibe-element-' + Date.now() + '-' + (idCounter++);
                    document.querySelectorAll('.vibe-img:not([data-vibe-img-id])').forEach(img => initImage(img, generateId()));
                    document.querySelectorAll('.vibe-text:not([data-vibe-text-id])').forEach(el => initText(el, generateId()));
                    document.querySelectorAll('.vibe-bg:not([data-vibe-bg-id])').forEach(el => initBackground(el, generateId()));
                }
                
                window.addEventListener('message', (event) => {
                    const data = event.data;
                    if (data.type === 'vibe-image-update') {
                        const { id, src, alt, width, height, linkId, href, content, style, hasLink, target } = data;
                        const imgToUpdate = document.querySelector('[data-vibe-img-id="' + id + '"]');
                        if (imgToUpdate) {
                            if (src !== undefined) imgToUpdate.setAttribute('src', src);
                            if (alt !== undefined) imgToUpdate.setAttribute('alt', alt);
                            if (width !== undefined && imgToUpdate.hasAttribute('width')) imgToUpdate.setAttribute('width', width);
                            if (height !== undefined && imgToUpdate.hasAttribute('height')) imgToUpdate.setAttribute('height', height);
                            let imgStyle = imgToUpdate.getAttribute('style') || '';
                            if (width !== undefined && /max-width:/.test(imgStyle)) imgStyle = imgStyle.replace(/max-width:\\s*[^;]+/, 'max-width: ' + width + 'px');
                            if (height !== undefined && /height:/.test(imgStyle)) imgStyle = imgStyle.replace(/height:\\s*[^;]+/, 'height: ' + height + 'px');
                            imgToUpdate.setAttribute('style', imgStyle);
                            
                            const currentParentLink = imgToUpdate.closest('a');
                            if (hasLink) {
                                const linkUrl = href || '#';
                                if (currentParentLink) {
                                    currentParentLink.href = linkUrl;
                                    if (target) { currentParentLink.target = target; } else { currentParentLink.removeAttribute('target'); }
                                } else {
                                    const newLink = document.createElement('a');
                                    newLink.href = linkUrl;
                                    if (target) newLink.target = target;
                                    newLink.dataset.vibeLinkId = linkId || ('vibe-link-' + id);
                                    if (imgToUpdate.parentNode) {
                                       imgToUpdate.parentNode.insertBefore(newLink, imgToUpdate);
                                       newLink.appendChild(imgToUpdate);
                                    }
                                }
                            } else {
                                if (currentParentLink) {
                                    if (currentParentLink.parentNode) {
                                        currentParentLink.parentNode.insertBefore(imgToUpdate, currentParentLink);
                                    }
                                    currentParentLink.remove();
                                }
                            }
                        }
                    } else if (data.type === 'vibe-text-style-update') {
                         const el = document.querySelector('[data-vibe-text-id="' + data.id + '"]');
                         if (el) {
                            el.innerHTML = data.content;
                            el.setAttribute('style', data.style);
                         }
                    } else if (data.type === 'vibe-bg-update') {
                        const el = document.querySelector('[data-vibe-bg-id="' + data.id + '"]');
                        if (el) {
                            el.setAttribute('background', data.imageUrl);
                            el.setAttribute('bgcolor', data.bgColor);
                            let style = el.getAttribute('style') || '';
                            const styleMap = new Map();
                            style.split(';').forEach(decl => {
                                if(decl.trim()){
                                    const parts = decl.split(':');
                                    const prop = parts[0].trim().toLowerCase();
                                    const val = parts.slice(1).join(':').trim();
                                    styleMap.set(prop, val);
                                }
                            });
                            let hasUrl = false;
                            ['background', 'background-image'].forEach(prop => {
                                if (styleMap.has(prop)) {
                                    let val = styleMap.get(prop);
                                    if (val.includes('url(')) {
                                        val = val.replace(/url\\((['"]?).*?\\1\\)/, "url('" + data.imageUrl + "')");
                                        styleMap.set(prop, val);
                                        hasUrl = true;
                                    }
                                }
                            });
                            if (!hasUrl) { styleMap.set('background', "url('" + data.imageUrl + "')"); }
                            styleMap.set('background-color', data.bgColor);
                            const newStyleString = Array.from(styleMap.entries()).map(([prop, val]) => \`\${prop}: \${val}\`).join('; ');
                            el.setAttribute('style', newStyleString + ';');
                            const finalVmlUrl = data.useSameUrl ? data.imageUrl : data.vmlImageUrl;
                            
                            // Find the VML comment node INSIDE the element
                            for (const child of el.childNodes) {
                                if (child.nodeType === 8 && child.textContent && child.textContent.includes('gte mso 9')) {
                                    let vmlContent = child.textContent;
                                    const srcRegex = /(<v:fill[^>]*src=")([^"]*)(")/i;
                                    const colorRegex = /(<v:fill[^>]*color=")([^"]*)(")/i;

                                    if (srcRegex.test(vmlContent)) {
                                        vmlContent = vmlContent.replace(srcRegex, '$1' + finalVmlUrl + '$3');
                                    }
                                    if (colorRegex.test(vmlContent)) {
                                        vmlContent = vmlContent.replace(colorRegex, '$1' + data.bgColor + '$3');
                                    }
                                    
                                    child.textContent = vmlContent;
                                    break;
                                }
                            }
                        }
                    }
                    
                    if(data.type.startsWith('vibe-')) syncHtml();
                });

                initVibeElements();
            `;
            doc.head.appendChild(script);

            if (scrollPosRef.current > 0) {
                doc.documentElement.scrollTop = scrollPosRef.current;
                doc.body.scrollTop = scrollPosRef.current; // for older browsers
            }
        };
        
        iframe.addEventListener('load', handleLoad, { once: true });
        
        return () => {};

    }, [templateHtml]);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe?.contentDocument?.head) return;

        const doc = iframe.contentDocument;
        const styleId = 'vibe-dark-mode-style';
        let styleElement = doc.getElementById(styleId);

        if (isDarkMode) {
            if (!styleElement) {
                styleElement = doc.createElement('style');
                styleElement.id = styleId;
                styleElement.textContent = `
                    html {
                        filter: invert(1) hue-rotate(180deg);
                        background-color: #fff; /* Ensures background is white before inverting */
                        height: 100%;
                    }
                    /* Revert filter on images and other media to prevent them from being inverted */
                    img, video, picture, svg, [style*="background-image"] {
                        filter: invert(1) hue-rotate(180deg);
                    }
                `;
                doc.head.appendChild(styleElement);
            }
        } else {
            if (styleElement) {
                doc.head.removeChild(styleElement);
            }
        }
    }, [isDarkMode, templateHtml]); // Rerun when dark mode is toggled OR when iframe content reloads
    
    return (
        <>
            <UploadHtmlModal 
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={handleUpload}
            />
            <InstructionsModal
                isOpen={isInstructionsModalOpen}
                onClose={() => setIsInstructionsModalOpen(false)}
            />
            <CodeViewModal
                isOpen={isCodeModalOpen}
                onClose={() => setIsCodeModalOpen(false)}
                htmlContent={templateHtml}
            />
            <ImageEditModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                onSave={handleImageSave}
                imageData={editingImage}
            />
            <TextAndStyleEditModal
                isOpen={isTextAndStyleModalOpen}
                onClose={() => setIsTextAndStyleModalOpen(false)}
                onSave={handleTextAndStyleSave}
                editData={editingTextAndStyle}
            />
            <BackgroundEditModal
                isOpen={isBackgroundModalOpen}
                onClose={() => setIsBackgroundModalOpen(false)}
                onSave={handleBackgroundSave}
                bgData={editingBackground}
            />
            <ResponsiveCssModal
                isOpen={isResponsiveCssModalOpen}
                onClose={() => setIsResponsiveCssModalOpen(false)}
                htmlContent={templateHtml}
                onSave={handleResponsiveCssSave}
            />
             <PreviewTextModal
                isOpen={isPreviewTextModalOpen}
                onClose={() => setIsPreviewTextModalOpen(false)}
                htmlContent={templateHtml}
                onSave={handlePreviewTextSave}
            />
             <PrivacyInfoModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} />
             <ActionInfoModal
                isOpen={isFiverrModalOpen}
                onClose={() => setIsFiverrModalOpen(false)}
                actionType="hireMe"
            />

            <header className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 pb-2">
                    Unlock Code-Free Control Over Your Email Templates
                </h1>
                <p className="text-gray-400 mt-2 max-w-3xl mx-auto">
                    Empower your entire team with Vibe, our revolutionary visual editor. Seamlessly modify text, swap images, and update links on any HTML email template through an intuitive, click-to-edit interface—no coding expertise required.
                </p>
            </header>
            <div className="flex flex-col gap-8">
                <div className="bg-gray-800/50 rounded-xl shadow-2xl p-6 border border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 text-center md:text-left">
                        {/* Item 1: Instructions */}
                        <div className="flex flex-col items-center md:items-start">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-violet-900/50 p-2 rounded-full"><InfoIcon className="w-5 h-5 text-violet-400" /></div>
                                <h4 className="font-semibold text-gray-200">Editable Templates</h4>
                            </div>
                            <p className="text-sm text-gray-400 flex-grow mb-3">Learn how to add classes to make your HTML editable.</p>
                            <button onClick={() => setIsInstructionsModalOpen(true)} className="text-sm text-pink-400 hover:underline font-semibold mt-auto">View Instructions &rarr;</button>
                        </div>

                        {/* Item 2: Privacy */}
                        <div className="flex flex-col items-center md:items-start">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-yellow-900/50 p-2 rounded-full"><AlertTriangleIcon className="w-5 h-5 text-yellow-400" /></div>
                                <h4 className="font-semibold text-gray-200">Data & Privacy</h4>
                            </div>
                            <p className="text-sm text-gray-400 flex-grow mb-3">This tool runs in-browser. We don't store your code.</p>
                            <button onClick={() => setIsPrivacyModalOpen(true)} className="text-sm text-pink-400 hover:underline font-semibold mt-auto">View Note &rarr;</button>
                        </div>

                        {/* Item 3: Pro Help */}
                        <div className="flex flex-col items-center md:items-start">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-green-900/50 p-2 rounded-full"><BriefcaseIcon className="w-5 h-5 text-green-400" /></div>
                                <h4 className="font-semibold text-gray-200">Need Pro Help?</h4>
                            </div>
                            <p className="text-sm text-gray-400 flex-grow mb-3">Hire a professional to make your email fully compatible.</p>
                            <button onClick={() => setIsFiverrModalOpen(true)} className="text-sm text-pink-400 hover:underline font-semibold mt-auto">View Offer &rarr;</button>
                        </div>
                    </div>
                    <div className="border-t border-gray-700/50 pt-6">
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="w-full px-5 py-3 font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors duration-200 shadow-lg flex items-center justify-center gap-3"
                        >
                            <UploadIcon className="w-5 h-5" />
                            <span>Upload HTML Template</span>
                        </button>
                    </div>
                </div>

                <div className="bg-gray-800/50 rounded-xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col">
                    {/* Editor Actions Header */}
                    <div className="flex flex-wrap items-center justify-center md:justify-between gap-4 p-4 border-b border-gray-700 min-h-[68px]">
                        <div className="flex items-center gap-3">
                            {templateHtml && (
                                <>
                                    <button
                                        onClick={() => setIsPreviewTextModalOpen(true)}
                                        className="bg-gray-700 rounded-md px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-600 transition-colors flex items-center gap-2"
                                        title="Set Preview Text"
                                    >
                                        <ChatAltIcon className="w-5 h-5"/>
                                        <span className="hidden sm:inline">Preview Text</span>
                                    </button>
                                    <button
                                        onClick={() => setIsResponsiveCssModalOpen(true)}
                                        className="bg-gray-700 rounded-md px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-600 transition-colors flex items-center gap-2"
                                        title="Edit Mobile Styles"
                                    >
                                        <MobileCssIcon className="w-5 h-5"/>
                                        <span className="hidden sm:inline">Mobile Styles</span>
                                    </button>
                                    <button
                                        onClick={() => setIsCodeModalOpen(true)}
                                        className="bg-gray-700 rounded-md px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-600 transition-colors flex items-center gap-2"
                                    >
                                        <CodeIcon className="w-5 h-5"/>
                                        <span className="hidden sm:inline">View Code</span>
                                    </button>
                                    <button 
                                        onClick={handleDownloadHtml}
                                        className="bg-gray-700 rounded-md px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-600 transition-colors flex items-center gap-2"
                                    >
                                        <DownloadIcon className="w-5 h-5"/>
                                        <span className="hidden sm:inline">Download</span>
                                    </button>
                                </>
                            )}
                        </div>
                        
                        {templateHtml && (
                            <div className="flex items-center gap-1 bg-gray-900 p-1 rounded-lg">
                                <button
                                    onClick={() => setViewMode('desktop')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${viewMode === 'desktop' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}
                                >
                                    <DesktopIcon className="w-5 h-5" />
                                    <span className="hidden sm:inline">Desktop</span>
                                </button>
                                <button
                                    onClick={() => setViewMode('mobile')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${viewMode === 'mobile' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}
                                >
                                    <MobileIcon className="w-5 h-5" />
                                    <span className="hidden sm:inline">Mobile</span>
                                </button>
                                <div className="w-px h-5 bg-gray-700 mx-1"></div>
                                <button
                                    onClick={() => setIsDarkMode(!isDarkMode)}
                                    className="p-2 rounded-md text-sm font-semibold transition-colors text-gray-400 hover:bg-gray-700/50"
                                    title={isDarkMode ? "Switch to Light Mode Preview" : "Simulate Dark Mode Preview"}
                                >
                                    {isDarkMode ? <SunIcon className="w-5 h-5 text-yellow-400" /> : <MoonIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            {templateHtml && (
                                <>
                                    <button
                                        onClick={handleSaveToLocal}
                                        disabled={saveState !== 'idle'}
                                        className={`rounded-md px-4 py-2 text-sm font-semibold text-white transition-all flex items-center gap-2 disabled:cursor-not-allowed ${saveState === 'saved' ? 'bg-green-600' : 'bg-violet-600 hover:bg-violet-700 disabled:opacity-70'}`}
                                    >
                                        {saveState === 'idle' && <><SaveIcon className="w-5 h-5" /><span className="hidden sm:inline">Save</span></>}
                                        {saveState === 'saving' && <><SpinnerIcon className="animate-spin w-5 h-5" /><span className="hidden sm:inline">Saving...</span></>}
                                        {saveState === 'saved' && <><CheckCircleIcon className="w-5 h-5" /><span className="hidden sm:inline">Saved!</span></>}
                                    </button>
                                    <button
                                        onClick={handleClearLocal}
                                        className="bg-gray-700 rounded-md px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-red-600/50 hover:text-red-300 transition-colors flex items-center gap-2"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                        <span className="hidden sm:inline">Clear</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div ref={previewContainerRef} className="h-[1400px] relative bg-gray-900/50 flex justify-center items-start p-4 overflow-auto">
                         {isLoadingTemplate ? (
                            <div className="flex items-center justify-center h-full">
                                <SpinnerIcon className="animate-spin h-10 w-10 text-pink-500" />
                            </div>
                         ) : templateHtml ? (
                            <div
                                className="flex-shrink-0 transition-all duration-300 ease-in-out"
                                style={{
                                    height: '100%',
                                    width: `${previewWidth * scale}px`,
                                }}
                            >
                                <div 
                                    className="shadow-lg bg-white"
                                    style={{ 
                                        width: `${previewWidth}px`,
                                        height: `${100 / scale}%`,
                                        transform: `scale(${scale})`,
                                        transformOrigin: 'top left',
                                    }}
                                >
                                    <iframe
                                        ref={iframeRef}
                                        srcDoc={templateHtml}
                                        title="Email Preview"
                                        className="w-full h-full border-0"
                                        sandbox="allow-scripts allow-same-origin"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full p-8">
                                <div className="text-center text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1-1m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h2 className="text-2xl font-semibold mt-4">Template Preview</h2>
                                    <p className="mt-2">Upload your email template to see it rendered here for live editing.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
export default VisualEditorPage;