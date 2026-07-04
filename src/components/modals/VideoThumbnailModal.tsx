import React, { useState, useRef, useEffect, useMemo } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CloseIcon, SpinnerIcon, UploadIcon, DownloadIcon, PlaySolid, PlayOutline, PlayClean, PlayModern, LockIcon, UnlockIcon, YoutubeIcon } from '../Icons';

interface VideoThumbnailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const svgToDataURL = (svgComponent: React.ReactElement) => {
  const svgString = renderToStaticMarkup(svgComponent);
  return `data:image/svg+xml;base64,${btoa(svgString)}`;
};

const PREDEFINED_ICONS = [
  { name: 'Solid', dataUrl: svgToDataURL(<PlaySolid />) },
  { name: 'Outline', dataUrl: svgToDataURL(<PlayOutline />) },
  { name: 'Clean', dataUrl: svgToDataURL(<PlayClean />) },
  { name: 'Modern', dataUrl: svgToDataURL(<PlayModern />) },
];

type Position = 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center-center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

const POSITIONS: Position[] = [
  'top-left', 'top-center', 'top-right',
  'center-left', 'center-center', 'center-right',
  'bottom-left', 'bottom-center', 'bottom-right',
];

const hexToRgba = (hex: string, alpha: number) => {
    let c: any;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return `rgba(${[(c>>16)&255, (c>>8)&255, c&255].join(',')},${alpha})`;
    }
    return `rgba(0,0,0,${alpha})`; // Fallback for invalid hex
};

const extractYouTubeId = (url: string): string | null => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
};

const VideoThumbnailModal: React.FC<VideoThumbnailModalProps> = ({ isOpen, onClose }) => {
  const [baseImageSrc, setBaseImageSrc] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(400);
  const [isAspectRatioLocked, setIsAspectRatioLocked] = useState(true);
  
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isFetchingThumbnail, setIsFetchingThumbnail] = useState(false);

  const [overlayColor, setOverlayColor] = useState('#000000');
  const [overlayOpacity, setOverlayOpacity] = useState(0.3);
  
  const [selectedIcon, setSelectedIcon] = useState(PREDEFINED_ICONS[0].dataUrl);
  const [customIcon, setCustomIcon] = useState<string | null>(null);
  const [iconSize, setIconSize] = useState(25);
  const [iconPosition, setIconPosition] = useState<Position>('center-center');
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
        setBaseImageSrc(null);
        setYoutubeUrl('');
        setIsAspectRatioLocked(true);
    }
  }, [isOpen]);
  
  const processImageSrc = (src: string) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
        setAspectRatio(img.naturalHeight / img.naturalWidth);
        const newWidth = img.naturalWidth > 1280 ? 1280 : img.naturalWidth;
        setWidth(newWidth);
        setHeight(Math.round(newWidth * (img.naturalHeight / img.naturalWidth)));
        setBaseImageSrc(src);
        setIsAspectRatioLocked(true);
    };
    img.src = src;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => processImageSrc(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
        alert("Please select a valid image file.");
    }
  };
  
  const handleFetchThumbnail = () => {
    const videoId = extractYouTubeId(youtubeUrl);
    if (!videoId) {
        alert("Could not find a valid YouTube video ID in the URL.");
        return;
    }
    setIsFetchingThumbnail(true);

    const resolutions = ['maxresdefault', 'sddefault', 'hqdefault'];
    let currentResIndex = 0;

    const tryNextResolution = () => {
        if (currentResIndex >= resolutions.length) {
            alert("Could not fetch a high-quality thumbnail for this video.");
            setIsFetchingThumbnail(false);
            return;
        }
        const res = resolutions[currentResIndex];
        const url = `https://img.youtube.com/vi/${videoId}/${res}.jpg`;
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            // YouTube returns a 120x90 placeholder for non-existent thumbnails.
            if (img.naturalWidth > 120) {
                processImageSrc(url);
                setIsFetchingThumbnail(false);
                setYoutubeUrl('');
            } else {
                currentResIndex++;
                tryNextResolution();
            }
        };
        img.onerror = () => {
            currentResIndex++;
            tryNextResolution();
        };
        img.src = url;
    };
    tryNextResolution();
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
  
  const handleCustomIconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'image/png') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCustomIcon(result);
        setSelectedIcon(result);
      };
      reader.readAsDataURL(file);
    } else {
        alert("Please select a valid PNG file.");
    }
  };

  const handleDownload = async () => {
    if (!baseImageSrc || !selectedIcon) return;
    setIsProcessing(true);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
        setIsProcessing(false);
        return;
    }

    const baseImg = new Image();
    baseImg.crossOrigin = "Anonymous";
    const iconImg = new Image();
    iconImg.crossOrigin = "Anonymous";
    
    const loadImages = Promise.all([
        new Promise((resolve, reject) => { baseImg.onload = resolve; baseImg.onerror = reject; baseImg.src = baseImageSrc; }),
        new Promise((resolve, reject) => { iconImg.onload = resolve; iconImg.onerror = reject; iconImg.src = selectedIcon; }),
    ]);

    try {
        await loadImages;

        canvas.width = width;
        canvas.height = height;

        // 1. Draw base image with cropping/filling logic (object-fit: cover)
        const imageAR = baseImg.naturalWidth / baseImg.naturalHeight;
        const canvasAR = width / height;
        let sx = 0, sy = 0, sWidth = baseImg.naturalWidth, sHeight = baseImg.naturalHeight;
        if (imageAR > canvasAR) { // Image wider than canvas, crop sides
            sWidth = baseImg.naturalHeight * canvasAR;
            sx = (baseImg.naturalWidth - sWidth) / 2;
        } else if (imageAR < canvasAR) { // Image taller than canvas, crop top/bottom
            sHeight = baseImg.naturalWidth / canvasAR;
            sy = (baseImg.naturalHeight - sHeight) / 2;
        }
        ctx.drawImage(baseImg, sx, sy, sWidth, sHeight, 0, 0, width, height);
        
        // 2. Draw color overlay
        ctx.fillStyle = hexToRgba(overlayColor, overlayOpacity);
        ctx.fillRect(0, 0, width, height);
        
        // 3. Draw play icon
        const iconDrawWidth = width * (iconSize / 100);
        const iconAspectRatio = iconImg.naturalWidth > 0 ? iconImg.naturalHeight / iconImg.naturalWidth : 1;
        const iconDrawHeight = iconDrawWidth * iconAspectRatio;
        let x = 0, y = 0;
        const [yPos, xPos] = iconPosition.split('-');
        if (xPos === 'center') x = (width - iconDrawWidth) / 2;
        if (xPos === 'right') x = width - iconDrawWidth;
        if (yPos === 'center') y = (height - iconDrawHeight) / 2;
        if (yPos === 'bottom') y = height - iconDrawHeight;
        ctx.drawImage(iconImg, x, y, iconDrawWidth, iconDrawHeight);
        
        const finalDataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = finalDataUrl;
        link.download = 'video-thumbnail.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } catch (error) {
        console.error("Error generating thumbnail:", error);
        alert("Could not load one of the images. Please check the source and try again.");
    } finally {
        setIsProcessing(false);
    }
  };

  const previewIconStyle: React.CSSProperties = useMemo(() => ({
    position: 'absolute',
    width: `${iconSize}%`,
    ...(() => {
        const posStyles: React.CSSProperties = {};
        const [y, x] = iconPosition.split('-');
        if (y === 'top') posStyles.top = '0';
        if (y === 'center') { posStyles.top = '50%'; posStyles.transform = 'translateY(-50%)'; }
        if (y === 'bottom') posStyles.bottom = '0';
        if (x === 'left') posStyles.left = '0';
        if (x === 'center') { posStyles.left = '50%'; posStyles.transform = (posStyles.transform || '') + ' translateX(-50%)'; }
        if (x === 'right') posStyles.right = '0';
        return posStyles;
    })(),
  }), [iconSize, iconPosition]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-5xl h-[90vh] flex flex-col p-6 relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h2 className="text-2xl font-semibold text-gray-200">Video Thumbnail Generator</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><CloseIcon className="w-6 h-6" /></button>
        </div>

        <div className="flex-grow grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-0">
          <div className="lg:col-span-3 bg-gray-900 rounded-lg flex items-center justify-center p-4 overflow-auto">
            {!baseImageSrc ? (
                 <div className="text-center text-gray-400">
                    <p className="mb-4">Upload an image or fetch from YouTube to start.</p>
                 </div>
            ) : (
                <div 
                    className="relative flex-shrink-0 overflow-hidden"
                    style={{ width: `${width}px`, height: `${height}px` }}
                >
                    <img src={baseImageSrc} alt="Base" className="absolute w-full h-full object-cover"/>
                    <div 
                        className="absolute inset-0 w-full h-full" 
                        style={{ backgroundColor: hexToRgba(overlayColor, overlayOpacity) }}
                    />
                    <img src={selectedIcon} alt="Play Icon Overlay" style={previewIconStyle}/>
                </div>
            )}
          </div>
          
          <div className="lg:col-span-2 space-y-4 overflow-y-auto pr-2">
            <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-2">1. Base Image</h3>
                <div className='bg-gray-700/40 p-3 rounded-lg space-y-3'>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">From YouTube URL</label>
                        <div className="flex gap-2">
                            <input type="url" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} placeholder="Paste YouTube video link" className="flex-1 w-full px-3 py-2 text-sm text-white bg-gray-900 border border-gray-600 rounded-md"/>
                            <button onClick={handleFetchThumbnail} disabled={isFetchingThumbnail || !youtubeUrl} className="px-3 py-2 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center">
                                {isFetchingThumbnail ? <SpinnerIcon className="w-5 h-5 animate-spin"/> : <YoutubeIcon className="w-5 h-5"/>}
                            </button>
                        </div>
                    </div>
                    <div className="relative flex items-center">
                        <div className="flex-grow border-t border-gray-600"></div>
                        <span className="flex-shrink mx-2 text-xs text-gray-500">OR</span>
                        <div className="flex-grow border-t border-gray-600"></div>
                    </div>
                    <div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-gray-700 rounded-lg hover:bg-gray-600">
                            <UploadIcon className="w-4 h-4" />
                            <span>{baseImageSrc ? 'Change Image from Computer' : 'Upload from Computer'}</span>
                        </button>
                    </div>
                </div>
            </div>
             <div className={`${!baseImageSrc ? 'opacity-40 pointer-events-none' : ''}`}>
                <h3 className="text-sm font-semibold text-gray-300 mb-2">2. Dimensions</h3>
                <div className="grid grid-cols-2 gap-4 items-end">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Width (px)</label>
                        <input type="number" value={width} onChange={e => handleWidthChange(Number(e.target.value))} className="w-full px-3 py-2 text-sm text-white bg-gray-900 border border-gray-600 rounded-md"/>
                    </div>
                     <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-xs text-gray-400">Height ({isAspectRatioLocked ? 'auto' : 'px'})</label>
                            <button onClick={() => setIsAspectRatioLocked(!isAspectRatioLocked)} title={isAspectRatioLocked ? 'Unlock aspect ratio' : 'Lock aspect ratio'} className="text-gray-400 hover:text-white">
                                {isAspectRatioLocked ? <LockIcon className="w-4 h-4"/> : <UnlockIcon className="w-4 h-4 text-pink-400"/>}
                            </button>
                        </div>
                        <input type="number" value={height} onChange={e => handleHeightChange(Number(e.target.value))} readOnly={isAspectRatioLocked} className={`w-full px-3 py-2 text-sm  border border-gray-600 rounded-md ${isAspectRatioLocked ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-900 text-white'}`}/>
                    </div>
                </div>
            </div>

            <div className={`${!baseImageSrc ? 'opacity-40 pointer-events-none' : ''}`}>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">3. Color Overlay</h3>
               <div className="grid grid-cols-2 gap-4">
                   <div>
                        <label className="block text-xs text-gray-400 mb-1">Color</label>
                        <div className="flex items-center bg-gray-900 border border-gray-600 rounded-md">
                            <input type="color" value={overlayColor} onChange={e => setOverlayColor(e.target.value)} className="w-10 h-10 p-1 bg-transparent border-0 cursor-pointer" />
                            <input type="text" value={overlayColor} onChange={e => setOverlayColor(e.target.value)} className="w-full px-3 py-2 text-sm text-white bg-transparent focus:outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Opacity ({overlayOpacity.toFixed(1)})</label>
                        <input type="range" min="0" max="1" step="0.1" value={overlayOpacity} onChange={e => setOverlayOpacity(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                    </div>
                </div>
            </div>

            <div className={`${!baseImageSrc ? 'opacity-40 pointer-events-none' : ''}`}>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">4. Play Icon Style</h3>
              <div className="grid grid-cols-4 gap-2">
                {PREDEFINED_ICONS.map(icon => (
                    <button key={icon.name} onClick={() => { setSelectedIcon(icon.dataUrl); setCustomIcon(null); }} className={`p-2 bg-gray-700 rounded-md transition-all ${selectedIcon === icon.dataUrl && !customIcon ? 'ring-2 ring-pink-500' : 'hover:bg-gray-600'}`}>
                        <img src={icon.dataUrl} alt={icon.name} className="w-full h-auto"/>
                    </button>
                ))}
              </div>
            </div>

             <div className={`${!baseImageSrc ? 'opacity-40 pointer-events-none' : ''}`}>
                <h3 className="text-sm font-semibold text-gray-300 mb-2">5. Custom Icon</h3>
                <div className="flex items-center gap-4">
                     <input type="file" onChange={handleCustomIconUpload} accept="image/png" className="hidden" id="custom-icon-upload"/>
                     <label htmlFor="custom-icon-upload" className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700">
                        <UploadIcon className="w-4 h-4" />
                        <span>Upload Icon (.png)</span>
                    </label>
                    {customIcon && (
                        <div onClick={() => setSelectedIcon(customIcon)} className={`p-1 bg-gray-700 rounded-md transition-all w-16 h-16 cursor-pointer ${selectedIcon === customIcon ? 'ring-2 ring-pink-500' : ''}`}>
                             <img src={customIcon} alt="Custom Icon Preview" className="w-full h-full object-contain"/>
                        </div>
                    )}
                </div>
            </div>
            
             <div className={`${!baseImageSrc ? 'opacity-40 pointer-events-none' : ''}`}>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">6. Icon Properties</h3>
               <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Size ({iconSize}%)</label>
                    <input type="range" min="5" max="80" value={iconSize} onChange={e => setIconSize(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Position</label>
                    <div className="grid grid-cols-3 gap-2">
                        {POSITIONS.map(pos => (
                            <button key={pos} onClick={() => setIconPosition(pos)} className={`h-12 bg-gray-700 rounded-md transition-all flex items-center justify-center ${iconPosition === pos ? 'ring-2 ring-pink-500' : 'hover:bg-gray-600'}`}>
                                <div className="w-4 h-4 bg-pink-500 rounded-full" />
                            </button>
                        ))}
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4 flex-shrink-0">
          <button onClick={onClose} className="px-6 py-2 font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Cancel</button>
          <button onClick={handleDownload} disabled={isProcessing || !baseImageSrc} className="px-6 py-2 font-semibold text-white bg-gradient-to-r from-pink-600 to-violet-600 rounded-lg hover:from-pink-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed w-48 text-center flex items-center justify-center gap-2">
            {isProcessing ? <SpinnerIcon className="animate-spin h-5 w-5" /> : <><DownloadIcon className="w-5 h-5"/> <span>Download</span></>}
          </button>
        </div>
        
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
    </div>
  );
};

export default VideoThumbnailModal;