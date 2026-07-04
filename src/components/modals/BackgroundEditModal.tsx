import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CloseIcon, UploadIcon, DownloadIcon, SpinnerIcon, LockIcon, UnlockIcon } from '../Icons';

interface BackgroundEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  bgData: {
    id: string;
    inlineStyle: string;
    backgroundAttr: string;
    bgColorAttr: string;
    vmlSrc: string | null;
  } | null;
}

const hexToRgba = (hex: string, alpha: number) => {
    let c: any;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length === 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return `rgba(${[(c>>16)&255, (c>>8)&255, c&255].join(',')},${alpha})`;
    }
    return `rgba(0,0,0,${alpha})`; // Fallback for invalid hex
};

const ImageOverlayGenerator = () => {
    const [baseImageSrc, setBaseImageSrc] = useState<string | null>(null);
    const [imageUrlInput, setImageUrlInput] = useState('');
    const [aspectRatio, setAspectRatio] = useState(1.5);
    const [width, setWidth] = useState(600);
    const [height, setHeight] = useState(400);
    const [isAspectRatioLocked, setIsAspectRatioLocked] = useState(true);
    
    const [overlayColor, setOverlayColor] = useState('#000000');
    const [overlayOpacity, setOverlayOpacity] = useState(0.3);

    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const processImageSrc = (src: string) => {
        setIsLoading(true);
        const img = new Image();
        img.crossOrigin = "Anonymous"; // Attempt to load cross-origin images for canvas
        img.onload = () => {
            const naturalAR = img.naturalHeight / img.naturalWidth;
            setAspectRatio(naturalAR);
            const newWidth = img.naturalWidth > 600 ? 600 : img.naturalWidth;
            setWidth(newWidth);
            setHeight(Math.round(newWidth * naturalAR));
            setBaseImageSrc(src);
            setIsAspectRatioLocked(true);
            setIsLoading(false);
        };
        img.onerror = () => {
            alert("Could not load the image. Please check the URL, ensure it allows cross-origin requests, or upload the image from your computer.");
            setIsLoading(false);
        };
        img.src = src;
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => processImageSrc(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    };
    
    const handleUrlLoad = () => {
        if (!imageUrlInput) return;
        processImageSrc(imageUrlInput);
    };

    const handleWidthChange = (newWidth: number) => {
        setWidth(newWidth);
        if (isAspectRatioLocked) {
            setHeight(Math.round(newWidth * aspectRatio));
        }
    };
    
    const handleHeightChange = (newHeight: number) => {
        if (!isAspectRatioLocked) {
            setHeight(newHeight);
        }
    };

    const handleDownload = async () => {
        if (!baseImageSrc) return;
        setIsProcessing(true);

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) {
            setIsProcessing(false);
            return;
        }

        const baseImg = new Image();
        baseImg.crossOrigin = "Anonymous";
        
        try {
            await new Promise<void>((resolve, reject) => {
                baseImg.onload = () => resolve();
                baseImg.onerror = reject;
                baseImg.src = baseImageSrc;
            });

            canvas.width = width;
            canvas.height = height;
            
            // Draw base image with cropping/filling logic (object-fit: cover)
            const imageAR = baseImg.naturalWidth / baseImg.naturalHeight;
            const canvasAR = width / height;
            let sx = 0, sy = 0, sWidth = baseImg.naturalWidth, sHeight = baseImg.naturalHeight;
            if (imageAR > canvasAR) {
                sWidth = baseImg.naturalHeight * canvasAR;
                sx = (baseImg.naturalWidth - sWidth) / 2;
            } else if (imageAR < canvasAR) {
                sHeight = baseImg.naturalWidth / canvasAR;
                sy = (baseImg.naturalHeight - sHeight) / 2;
            }
            ctx.drawImage(baseImg, sx, sy, sWidth, sHeight, 0, 0, width, height);
            
            // Draw color overlay
            ctx.fillStyle = hexToRgba(overlayColor, overlayOpacity);
            ctx.fillRect(0, 0, width, height);
            
            const finalDataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = finalDataUrl;
            link.download = 'overlay-background.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error generating image:", error);
            alert("Could not process the image. If you are using a URL, the server may be blocking it. Please try downloading the image and uploading it from your computer.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className='space-y-4'>
            <div className="bg-gray-900 rounded-lg p-4 flex items-center justify-center min-h-[250px] overflow-auto relative">
                {!baseImageSrc ? (
                     <div className="text-center text-gray-500">
                        <UploadIcon className="w-12 h-12 mx-auto mb-2"/>
                        <p>Upload an image to start</p>
                    </div>
                ) : (
                    <div 
                        className="relative flex-shrink-0"
                        style={{ width: `${width}px`, height: `${height}px` }}
                    >
                        <img src={baseImageSrc} alt="Preview" className="absolute w-full h-full object-cover"/>
                        <div 
                            className="absolute inset-0 w-full h-full" 
                            style={{ backgroundColor: hexToRgba(overlayColor, overlayOpacity) }}
                        />
                    </div>
                )}
                 {isLoading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><SpinnerIcon className="w-8 h-8 animate-spin"/></div>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-400">Image Source</label>
                    <div className="flex gap-2">
                        <input type="url" value={imageUrlInput} onChange={e => setImageUrlInput(e.target.value)} placeholder="Paste image URL" className="flex-1 w-full px-3 py-2 text-sm text-white bg-gray-900 border border-gray-600 rounded-md"/>
                        <button onClick={handleUrlLoad} disabled={isLoading} className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50">Load</button>
                    </div>
                    <div className="relative flex items-center">
                        <div className="flex-grow border-t border-gray-600"></div><span className="flex-shrink mx-2 text-xs text-gray-500">OR</span><div className="flex-grow border-t border-gray-600"></div>
                    </div>
                     <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-gray-700 rounded-lg hover:bg-gray-600">
                        <UploadIcon className="w-4 h-4" /> <span>Upload from Computer</span>
                    </button>
                </div>
                 <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-400">Dimensions</label>
                    <div className="flex items-end gap-2">
                        <div className="flex-1">
                            <label className="block text-xs text-gray-400 mb-1">Width (px)</label>
                            <input type="number" value={width} onChange={e => handleWidthChange(Number(e.target.value))} className="w-full px-3 py-2 text-sm text-white bg-gray-900 border border-gray-600 rounded-md"/>
                        </div>
                        <button onClick={() => setIsAspectRatioLocked(!isAspectRatioLocked)} title={isAspectRatioLocked ? 'Unlock aspect ratio' : 'Lock aspect ratio'} className="p-2 bg-gray-900 border border-gray-600 rounded-md text-gray-400 hover:text-white mb-px">
                            {isAspectRatioLocked ? <LockIcon className="w-5 h-5"/> : <UnlockIcon className="w-5 h-5 text-pink-400"/>}
                        </button>
                        <div className="flex-1">
                            <label className="block text-xs text-gray-400 mb-1">Height (px)</label>
                            <input type="number" value={height} onChange={e => handleHeightChange(Number(e.target.value))} readOnly={isAspectRatioLocked} className={`w-full px-3 py-2 text-sm border border-gray-600 rounded-md ${isAspectRatioLocked ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-900 text-white'}`}/>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end pt-2">
                {/* Color Picker */}
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Overlay Color</label>
                    <div className="flex items-center bg-gray-900 border border-gray-600 rounded-md">
                        <input type="color" value={overlayColor} onChange={e => setOverlayColor(e.target.value)} className="w-10 h-10 p-1 bg-transparent border-0 cursor-pointer" />
                        <input type="text" value={overlayColor} onChange={e => setOverlayColor(e.target.value)} className="w-full px-3 py-2 text-sm text-white bg-transparent focus:outline-none" />
                    </div>
                </div>
                {/* Opacity Slider */}
                <div className="col-span-2">
                     <label className="block text-sm font-medium text-gray-400 mb-1">Opacity ({overlayOpacity.toFixed(2)})</label>
                    <input type="range" min="0" max="1" step="0.05" value={overlayOpacity} onChange={e => setOverlayOpacity(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                </div>
                {/* Download Button */}
                <div className="col-span-2 md:col-span-1">
                    <button onClick={handleDownload} disabled={isProcessing || !baseImageSrc} className="w-full px-4 py-2 font-semibold text-white bg-gradient-to-r from-pink-600 to-violet-600 rounded-lg hover:from-pink-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-center flex items-center justify-center gap-2">
                        {isProcessing ? <SpinnerIcon className="animate-spin h-5 w-5" /> : <><DownloadIcon className="w-5 h-5"/> <span>Download</span></>}
                    </button>
                </div>
            </div>

            <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
    );
};

const BackgroundPropertiesEditor = ({ onSave, onClose, bgData }: { onSave: (data: any) => void, onClose: () => void, bgData: BackgroundEditModalProps['bgData'] }) => {
    const [formData, setFormData] = useState({
        imageUrl: '',
        vmlImageUrl: '',
        bgColor: '#ffffff',
        useSameUrl: true,
    });

    useEffect(() => {
        if (bgData) {
            const urlRegex = /url\((['"]?)(.*?)\1\)/;
            const colorRegex = /background-color:\s*([^;]+)/;

            let mainUrl = bgData.backgroundAttr || '';
            if (!mainUrl && bgData.inlineStyle) {
                const styleMatch = bgData.inlineStyle.match(urlRegex);
                if (styleMatch && styleMatch[2]) {
                mainUrl = styleMatch[2];
                }
            }

            let mainColor = bgData.bgColorAttr || '';
            if (!mainColor && bgData.inlineStyle) {
                const colorMatch = bgData.inlineStyle.match(colorRegex);
                if (colorMatch && colorMatch[1]) {
                mainColor = colorMatch[1].trim();
                }
            }

            const vmlUrl = bgData.vmlSrc || mainUrl;

            setFormData({
                imageUrl: mainUrl,
                vmlImageUrl: vmlUrl,
                bgColor: mainColor || '#ffffff',
                useSameUrl: mainUrl === vmlUrl,
            });
        }
    }, [bgData]);

    useEffect(() => {
        if (formData.useSameUrl) {
            setFormData(prev => ({ ...prev, vmlImageUrl: prev.imageUrl }));
        }
    }, [formData.imageUrl, formData.useSameUrl]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSave = () => {
        if (!bgData) return;
        onSave({ id: bgData.id, ...formData });
        onClose();
    };

    return (
        <>
            <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-xs text-gray-300 mb-6 space-y-1">
                <p><strong className="text-gray-200">Note:</strong> Direct image uploading is currently disabled for privacy reasons.</p>
                <p>Please upload your image to a service like <a href="https://imgbb.com/" target="_blank" rel="noopener noreferrer" className="text-pink-400 underline hover:text-pink-300">ImgBB</a> or <a href="https://postimages.org/" target="_blank" rel="noopener noreferrer" className="text-pink-400 underline hover:text-pink-300">Postimages</a> and paste the direct image URL below.</p>
            </div>
            <div className="space-y-4">
                <div>
                    <label htmlFor="bg-imageUrl" className="block text-sm font-medium text-gray-400 mb-1">Background Image URL</label>
                    <input type="text" id="bg-imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full px-3 py-2 text-sm text-white bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Fallback Background Color</label>
                    <div className="flex items-center bg-gray-900 border border-gray-600 rounded-md focus-within:ring-2 focus-within:ring-pink-500">
                    <input type="color" name="bgColor" value={formData.bgColor} onChange={handleChange} className="w-10 h-10 p-1 bg-transparent border-0 cursor-pointer" />
                    <input type="text" name="bgColor" value={formData.bgColor} onChange={handleChange} className="w-full px-3 py-2 text-sm text-white bg-transparent focus:outline-none" />
                    </div>
                </div>
                <div className="pt-2">
                    <div className="flex items-center mb-2">
                    <input id="bg-useSameUrl" name="useSameUrl" type="checkbox" checked={formData.useSameUrl} onChange={handleChange} className="h-4 w-4 rounded border-gray-500 text-pink-600 focus:ring-pink-500 bg-gray-700" />
                    <label htmlFor="bg-useSameUrl" className="ml-2 block text-sm font-medium text-gray-300">Use same image for VML (Outlook)</label>
                    </div>
                    <div className={`transition-opacity ${formData.useSameUrl ? 'opacity-50' : ''}`}>
                        <label htmlFor="bg-vmlImageUrl" className="block text-sm font-medium text-gray-400 mb-1">VML Background Image URL</label>
                        <input type="text" id="bg-vmlImageUrl" name="vmlImageUrl" value={formData.vmlImageUrl} onChange={handleChange} disabled={formData.useSameUrl} className="w-full px-3 py-2 text-sm text-white bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:cursor-not-allowed" />
                    </div>
                </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
                <button onClick={onClose} className="px-6 py-2 font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Cancel</button>
                <button onClick={handleSave} className="px-6 py-2 font-semibold text-white bg-gradient-to-r from-pink-600 to-violet-600 rounded-lg hover:from-pink-700 hover:to-violet-700">Save Changes</button>
            </div>
        </>
    );
};


const BackgroundEditModal: React.FC<BackgroundEditModalProps> = ({ isOpen, onClose, onSave, bgData }) => {
    const [mode, setMode] = useState<'properties' | 'generator'>('properties');
    
    useEffect(() => {
        if(isOpen) {
            setMode('properties'); // Reset to default mode when opening
        }
    }, [isOpen]);
  
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto p-4" onClick={onClose}>
            <div className="flex min-h-full items-center justify-center">
                <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-2xl p-6 relative" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-200">{mode === 'properties' ? 'Edit Background' : 'Create Overlay Image'}</h2>
                        <div className='flex items-center gap-2 sm:gap-4'>
                            <label className="flex items-center cursor-pointer text-sm">
                                <span className="text-gray-400 mr-2 hidden sm:inline">Properties</span>
                                <div className="relative" onClick={() => setMode(mode === 'properties' ? 'generator' : 'properties')}>
                                    <div className="w-12 h-6 bg-gray-700 rounded-full shadow-inner"></div>
                                    <div className={`absolute w-5 h-5 bg-white rounded-full shadow inset-y-0.5 transition-transform duration-300 ease-in-out ${mode === 'properties' ? 'left-0.5' : 'translate-x-full left-0.5'}`}></div>
                                </div>
                                <span className="text-gray-400 ml-2 hidden sm:inline">Generator</span>
                            </label>
                            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                                <CloseIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {mode === 'properties' ? (
                        <BackgroundPropertiesEditor onSave={onSave} onClose={onClose} bgData={bgData} />
                    ) : (
                        <ImageOverlayGenerator />
                    )}
                </div>
            </div>
        </div>
    );
};

export default BackgroundEditModal;