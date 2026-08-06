import React, { useState, useEffect } from 'react';
import { UploadIcon, PlayCircleIcon, ScaleIcon, LinkIcon, InfoIcon } from '../Icons';
import VideoThumbnailModal from './VideoThumbnailModal';
import ColorPickerInput from '../ColorPickerInput';

interface ImageEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  imageData: {
    id: string;
    src: string;
    alt: string;
    width: string;
    height: string;
    linkId?: string;
    href?: string | null;
    target?: string | null;
    borderRadius?: string;
    border?: string;
    paddingTop?: string;
    paddingRight?: string;
    paddingBottom?: string;
    paddingLeft?: string;
  } | null;
}

const CornerRadiusIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16V9a5 5 0 015-5h7" />
  </svg>
);

const BorderBoxIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="4" y="4" width="16" height="16" rx="1.5" />
  </svg>
);

// A single bordered box combining a small badge (letter or icon) with the input, so a field
// is self-labeling without needing its own <label> line — the compact building block for the
// dimension/style/padding grids below.
const CompactField: React.FC<{
  badge: React.ReactNode;
  title: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  suffix?: React.ReactNode;
}> = ({ badge, title, name, value, onChange, placeholder, suffix }) => (
  <div
    title={title}
    className="flex items-center gap-1 bg-gray-900 border border-gray-600 rounded-md pl-2 pr-1 focus-within:ring-2 focus-within:ring-pink-500"
  >
    <span className="flex items-center justify-center w-3.5 shrink-0 text-[10px] font-bold text-gray-500">{badge}</span>
    <input
      type="text"
      id={`img-${name}`}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      aria-label={title}
      className="w-full min-w-0 bg-transparent py-1.5 text-sm text-white focus:outline-none"
    />
    {suffix}
  </div>
);

// Strips a trailing "px" for display in plain-number fields; leaves other units (%, em, "auto") untouched.
const stripPx = (value?: string | null) => {
  if (!value) return '';
  const match = String(value).trim().match(/^(\d+(?:\.\d+)?)px$/);
  return match ? match[1] : value;
};

const BORDER_STYLES = ['none', 'solid', 'dashed', 'dotted', 'double'];

// The rest of the app (VisualEditorPage's postMessage bridge) works with a single CSS border
// shorthand string, e.g. "1px solid #ff0000" -- these two helpers are the only place that string
// is taken apart into width/style/color for editing and put back together on save.
const parseBorderShorthand = (border?: string | null) => {
  const result = { borderWidth: '', borderStyle: 'solid', borderColor: '#000000' };
  if (!border) return result;
  for (const part of String(border).trim().split(/\s+/)) {
    if (/^\d+(?:\.\d+)?(px)?$/.test(part)) {
      result.borderWidth = part.replace(/px$/, '');
    } else if (BORDER_STYLES.includes(part.toLowerCase())) {
      result.borderStyle = part.toLowerCase();
    } else if (part) {
      result.borderColor = part;
    }
  }
  return result;
};

const buildBorderShorthand = ({ borderWidth, borderStyle, borderColor }: { borderWidth: string; borderStyle: string; borderColor: string }) => {
  if (!borderWidth || borderStyle === 'none') return '';
  const width = /^[\d.]+$/.test(borderWidth) ? `${borderWidth}px` : borderWidth;
  const color = isValidHexColor(borderColor) ? borderColor : (borderColor || '#000000');
  return `${width} ${borderStyle} ${color}`;
};

const isValidHexColor = (value: string) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());

const initialFormData = {
  src: '', alt: '', width: '', height: '', href: '', hasLink: false, target: '_blank',
  borderRadius: '', borderWidth: '', borderStyle: 'solid', borderColor: '#000000',
  paddingTop: '', paddingRight: '', paddingBottom: '', paddingLeft: '',
};

const ImageEditModal: React.FC<ImageEditModalProps> = ({ isOpen, onClose, onSave, imageData }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [isVideoThumbnailModalOpen, setIsVideoThumbnailModalOpen] = useState(false);

  useEffect(() => {
    if (imageData) {
      const linkExists = imageData.href != null;
      const { borderWidth, borderStyle, borderColor } = parseBorderShorthand(imageData.border);
      setFormData({
        src: imageData.src || '',
        alt: imageData.alt || '',
        width: imageData.width || 'auto',
        height: imageData.height || 'auto',
        href: imageData.href || '',
        hasLink: linkExists,
        target: imageData.target || '_blank',
        borderRadius: imageData.borderRadius || '',
        borderWidth,
        borderStyle,
        borderColor,
        paddingTop: stripPx(imageData.paddingTop),
        paddingRight: stripPx(imageData.paddingRight),
        paddingBottom: stripPx(imageData.paddingBottom),
        paddingLeft: stripPx(imageData.paddingLeft),
      });
    }
  }, [imageData]);

  if (!isOpen || !imageData) return null;

  // Manually recompute height from the current width using the source image's natural aspect ratio.
  // Deliberately not automatic: an automatic recalc on every keystroke would fight a user who typed
  // "auto" or a deliberately-distorted height.
  const handleCalculateHeight = () => {
    const numericWidth = Number(formData.width);
    if (!formData.src || !numericWidth || numericWidth <= 0) return;
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth > 0) {
        const aspectRatio = img.naturalHeight / img.naturalWidth;
        const newHeight = Math.round(numericWidth * aspectRatio);
        if (!isNaN(newHeight)) {
          setFormData(prev => ({ ...prev, height: String(newHeight) }));
        }
      }
    };
    img.src = formData.src;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const { borderWidth, borderStyle, borderColor, ...rest } = formData;
    const border = buildBorderShorthand({ borderWidth, borderStyle, borderColor });
    onSave({ id: imageData.id, linkId: imageData.linkId, ...rest, border, src: formData.src.trim(), href: formData.href.trim() });
    onClose();
  };

  return (
    <>
      <VideoThumbnailModal
          isOpen={isVideoThumbnailModalOpen}
          onClose={() => setIsVideoThumbnailModalOpen(false)}
      />
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4" onClick={onClose}>
        <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md sm:max-w-lg max-h-[92vh] overflow-y-auto p-4 sm:p-6 relative" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-200">Edit Image</h2>
              <button
                  onClick={() => setIsVideoThumbnailModalOpen(true)}
                  title="Make Video Thumbnail"
                  className="flex items-center gap-1.5 text-xs font-semibold text-pink-400 hover:text-pink-300 transition-colors duration-200"
              >
                  <PlayCircleIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Video Thumbnail</span>
              </button>
          </div>

          <div className="flex items-start gap-2 bg-gray-700/40 border border-gray-600 rounded-lg px-3 py-2 text-[11px] leading-snug text-gray-400 mb-4">
              <InfoIcon className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-500" />
              <p>
                  Uploads are disabled for privacy — host your image on <a href="https://imgbb.com/" target="_blank" rel="noopener noreferrer" className="text-pink-400 underline hover:text-pink-300">ImgBB</a> or <a href="https://postimages.org/" target="_blank" rel="noopener noreferrer" className="text-pink-400 underline hover:text-pink-300">Postimages</a> and paste the URL below.
              </p>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                  <label htmlFor="img-src" className="block text-sm font-medium text-gray-400">Image Source (URL)</label>
                  <button
                      disabled={true}
                      title="Direct upload is disabled for privacy."
                      className="text-gray-600 cursor-not-allowed"
                  >
                      <UploadIcon className="w-4 h-4" />
                  </button>
              </div>
              <input type="text" id="img-src" name="src" value={formData.src} onChange={handleChange} className="w-full px-3 py-2 text-sm text-white bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none" />
            </div>

            <div className="flex items-center justify-between">
                <label htmlFor="img-hasLink" className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
                    <LinkIcon className="w-3.5 h-3.5 text-gray-500" />
                    Add link to image
                </label>
                <button
                    id="img-hasLink"
                    type="button"
                    role="switch"
                    aria-checked={formData.hasLink}
                    onClick={() => setFormData(prev => ({ ...prev, hasLink: !prev.hasLink }))}
                    className={`relative w-9 h-5 rounded-full shrink-0 transition-colors duration-200 ${formData.hasLink ? 'bg-pink-600' : 'bg-gray-600'}`}
                >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${formData.hasLink ? 'translate-x-4' : ''}`} />
                </button>
            </div>
            {formData.hasLink && (
              <div className="flex gap-3 border-l-2 border-pink-500/30 pl-3 ml-1">
                  <div className="flex-1">
                    <label htmlFor="img-href" className="block text-xs text-gray-500 mb-1">Link URL</label>
                    <input type="text" id="img-href" name="href" value={formData.href} onChange={handleChange} className="w-full px-3 py-2 text-sm text-white bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none" />
                  </div>
                  <div className="w-28 shrink-0">
                      <label htmlFor="img-target" className="block text-xs text-gray-500 mb-1">Opens in</label>
                      <select id="img-target" name="target" value={formData.target} onChange={handleChange} className="w-full px-2 py-2 text-sm text-white bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none">
                          <option value="_blank">New Tab</option>
                          <option value="_self">Same Page</option>
                      </select>
                  </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <div className="sm:col-span-2">
                <label htmlFor="img-alt" className="block text-sm font-medium text-gray-400 mb-1">Alt Text</label>
                <input type="text" id="img-alt" name="alt" value={formData.alt} onChange={handleChange} className="w-full px-3 py-2 text-sm text-white bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none" />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs text-gray-500 mb-1">Border</label>
                <div className="flex gap-1.5">
                  <div
                    title="Border width (px)"
                    className="w-14 shrink-0 flex items-center gap-1 bg-gray-900 border border-gray-600 rounded-md pl-1.5 pr-1 focus-within:ring-2 focus-within:ring-pink-500"
                  >
                    <span className="flex items-center justify-center w-3 shrink-0 text-gray-500"><BorderBoxIcon className="w-3.5 h-3.5" /></span>
                    <input
                      type="text"
                      id="img-borderWidth"
                      name="borderWidth"
                      value={formData.borderWidth}
                      onChange={handleChange}
                      placeholder="1"
                      aria-label="Border width (px)"
                      className="w-full min-w-0 bg-transparent py-1.5 text-sm text-white focus:outline-none"
                    />
                  </div>
                  <select
                    id="img-borderStyle"
                    name="borderStyle"
                    title="Border style"
                    aria-label="Border style"
                    value={formData.borderStyle}
                    onChange={handleChange}
                    className="w-20 shrink-0 px-1 py-1.5 text-xs text-white bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  >
                    <option value="none">None</option>
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                    <option value="double">Double</option>
                  </select>
                  <div className="flex-1 min-w-0">
                    <ColorPickerInput
                      value={isValidHexColor(formData.borderColor) ? formData.borderColor : '#000000'}
                      onChange={(hex) => setFormData(prev => ({ ...prev, borderColor: hex }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <CompactField badge="W" title="Width (px or auto)" name="width" value={formData.width} onChange={handleChange} placeholder="auto" />
              <CompactField
                badge="H" title="Height (px or auto)" name="height" value={formData.height} onChange={handleChange} placeholder="auto"
                suffix={
                  <button
                    type="button"
                    onClick={handleCalculateHeight}
                    disabled={!formData.src || !formData.width || formData.width === 'auto'}
                    title="Calculate height from width using the image's aspect ratio"
                    className="p-1 text-gray-500 hover:text-pink-400 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors duration-200 shrink-0"
                  >
                    <ScaleIcon className="w-3.5 h-3.5" />
                  </button>
                }
              />
              <CompactField badge={<CornerRadiusIcon className="w-3.5 h-3.5" />} title="Border radius" name="borderRadius" value={formData.borderRadius} onChange={handleChange} placeholder="8px" />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Cell padding (px)</label>
              <div className="grid grid-cols-4 gap-1.5">
                <CompactField badge="T" title="Padding top" name="paddingTop" value={formData.paddingTop} onChange={handleChange} placeholder="0" />
                <CompactField badge="R" title="Padding right" name="paddingRight" value={formData.paddingRight} onChange={handleChange} placeholder="0" />
                <CompactField badge="B" title="Padding bottom" name="paddingBottom" value={formData.paddingBottom} onChange={handleChange} placeholder="0" />
                <CompactField badge="L" title="Padding left" name="paddingLeft" value={formData.paddingLeft} onChange={handleChange} placeholder="0" />
              </div>
            </div>
          </div>

          <div className="mt-5 flex gap-3 sm:justify-end">
            <button onClick={onClose} className="flex-1 sm:flex-none px-5 py-2 text-sm font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200">
              Cancel
            </button>
            <button onClick={handleSave} className="flex-1 sm:flex-none px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-pink-600 to-violet-600 rounded-lg hover:from-pink-700 hover:to-violet-700 transition-transform duration-200">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
export default ImageEditModal;
