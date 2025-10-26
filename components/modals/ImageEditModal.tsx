import React, { useState, useEffect } from 'react';
import { UploadIcon, PlayCircleIcon } from '../Icons';
import VideoThumbnailModal from './VideoThumbnailModal';

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
  } | null;
}

const ImageEditModal: React.FC<ImageEditModalProps> = ({ isOpen, onClose, onSave, imageData }) => {
  const [formData, setFormData] = useState({ src: '', alt: '', width: '', height: '', href: '', hasLink: false, target: '_blank' });
  const [isVideoThumbnailModalOpen, setIsVideoThumbnailModalOpen] = useState(false);
  
  useEffect(() => {
    if (imageData) {
      const linkExists = imageData.href != null;
      setFormData({
        src: imageData.src || '',
        alt: imageData.alt || '',
        width: imageData.width || '',
        height: imageData.height || '',
        href: imageData.href || '',
        hasLink: linkExists,
        target: imageData.target || '_blank',
      });
    }
  }, [imageData]);

  // Automatically calculate height based on src and width
  useEffect(() => {
    const numericWidth = Number(formData.width);
    if (formData.src && numericWidth > 0) {
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
      img.onerror = () => {
        // Could not load image, do nothing.
      };
      img.src = formData.src;
    }
  }, [formData.src, formData.width]);


  if (!isOpen || !imageData) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    
    setFormData(prev => ({ 
        ...prev, 
        [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value 
    }));
  };

  const handleSave = () => {
    onSave({ id: imageData.id, linkId: imageData.linkId, ...formData });
    onClose();
  };
  
  return (
    <>
      <VideoThumbnailModal
          isOpen={isVideoThumbnailModalOpen}
          onClose={() => setIsVideoThumbnailModalOpen(false)}
      />
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-lg p-6 relative" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-200">Edit Image</h2>
              <button
                  onClick={() => setIsVideoThumbnailModalOpen(true)}
                  className="flex items-center gap-2 text-sm font-semibold text-pink-400 hover:text-pink-300 transition-colors duration-200"
              >
                  <PlayCircleIcon className="w-5 h-5" />
                  <span>Make Video Thumbnail</span>
              </button>
          </div>
          
          <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-xs text-gray-300 mb-6 space-y-1">
              <p>
                  <strong className="text-gray-200">Note:</strong> Direct image uploading is currently disabled for privacy reasons.
              </p>
              <p>
                  Please upload your image to a service like <a href="https://imgbb.com/" target="_blank" rel="noopener noreferrer" className="text-pink-400 underline hover:text-pink-300">ImgBB</a> or <a href="https://postimages.org/" target="_blank" rel="noopener noreferrer" className="text-pink-400 underline hover:text-pink-300">Postimages</a> and paste the direct image URL below.
              </p>
              <p className="pt-2 border-t border-gray-600/50 mt-2">
                <strong className="text-pink-400">New:</strong> Create a video-style thumbnail by adding a play button overlay to your current image.
              </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                  <label htmlFor="img-src" className="block text-sm font-medium text-gray-400">Image Source (URL)</label>
                  <button
                      disabled={true}
                      title="Direct upload is disabled for privacy."
                      className="flex items-center gap-2 text-xs font-semibold text-gray-500 cursor-not-allowed"
                  >
                      <UploadIcon className="w-4 h-4" />
                      Upload Disabled
                  </button>
              </div>
              <input type="text" id="img-src" name="src" value={formData.src} onChange={handleChange} className="w-full px-3 py-2 text-sm text-white bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none" />
            </div>
            <div>
              <div className="flex items-center">
                  <input
                    id="img-hasLink"
                    name="hasLink"
                    type="checkbox"
                    checked={formData.hasLink}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-500 text-pink-600 focus:ring-pink-500 bg-gray-700"
                  />
                  <label htmlFor="img-hasLink" className="ml-2 block text-sm font-medium text-gray-300">
                    Add link to image
                  </label>
              </div>
            </div>
            {formData.hasLink && (
              <div className="space-y-4 border-l-2 border-pink-500/30 pl-4 ml-2">
                  <div>
                    <label htmlFor="img-href" className="block text-sm font-medium text-gray-400 mb-1">Image Link (URL)</label>
                    <input type="text" id="img-href" name="href" value={formData.href} onChange={handleChange} className="w-full px-3 py-2 text-sm text-white bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none" />
                  </div>
                  <div>
                      <label htmlFor="img-target" className="block text-sm font-medium text-gray-400 mb-1">Open link in</label>
                      <select id="img-target" name="target" value={formData.target} onChange={handleChange} className="w-full px-3 py-2 text-sm text-white bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none">
                          <option value="_blank">New Tab</option>
                          <option value="_self">Same Page</option>
                      </select>
                  </div>
              </div>
            )}
            <div>
              <label htmlFor="img-alt" className="block text-sm font-medium text-gray-400 mb-1">Alt Text</label>
              <input type="text" id="img-alt" name="alt" value={formData.alt} onChange={handleChange} className="w-full px-3 py-2 text-sm text-white bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none" />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="img-width" className="block text-sm font-medium text-gray-400 mb-1">Width (e.g., 600)</label>
                <input type="text" id="img-width" name="width" value={formData.width} onChange={handleChange} className="w-full px-3 py-2 text-sm text-white bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none" />
              </div>
              <div className="flex-1">
                <label htmlFor="img-height" className="block text-sm font-medium text-gray-400 mb-1">Height (e.g., 200)</label>
                <input type="text" id="img-height" name="height" value={formData.height} onChange={handleChange} className="w-full px-3 py-2 text-sm text-white bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none" />
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <button onClick={onClose} className="px-6 py-2 font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200">
              Cancel
            </button>
            <button onClick={handleSave} className="px-6 py-2 font-semibold text-white bg-gradient-to-r from-pink-600 to-violet-600 rounded-lg hover:from-pink-700 hover:to-violet-700 transition-transform duration-200">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
export default ImageEditModal;