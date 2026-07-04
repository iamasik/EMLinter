import React, { useState, useRef } from 'react';

interface UploadHtmlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (html: string) => void;
}

const UploadHtmlModal: React.FC<UploadHtmlModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [htmlContent, setHtmlContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setHtmlContent(e.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleUploadClick = () => {
    onUpload(htmlContent);
    onClose();
    setHtmlContent('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-3xl p-6 relative" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-semibold text-gray-200 mb-4">Upload Your HTML Template</h2>
        
        <div className="flex space-x-4 mb-4">
          <button 
            onClick={triggerFileSelect}
            className="flex-1 px-4 py-3 font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors duration-200"
          >
            Select HTML File
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".html,.htm"
            className="hidden"
          />
        </div>
        
        <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-600" />
            </div>
            <div className="relative flex justify-center">
                <span className="bg-gray-800 px-2 text-sm text-gray-400">
                    Or paste your code directly
                </span>
            </div>
        </div>

        <textarea
          value={htmlContent}
          onChange={(e) => setHtmlContent(e.target.value)}
          className="w-full h-72 p-4 font-mono text-sm bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition duration-200 resize-y"
          placeholder="<!-- Paste your HTML email code here -->"
        />

        <div className="mt-6 flex justify-end space-x-4">
          <button 
            onClick={onClose} 
            className="px-6 py-2 font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleUploadClick}
            disabled={!htmlContent}
            className="px-6 py-2 font-semibold text-white bg-gradient-to-r from-pink-600 to-violet-600 rounded-lg hover:from-pink-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-200"
          >
            Upload Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadHtmlModal;
