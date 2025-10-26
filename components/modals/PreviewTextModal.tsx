import React, { useState, useEffect } from 'react';
import { CloseIcon, SaveIcon } from '../Icons';

interface PreviewTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlContent: string | null;
  onSave: (newHtml: string) => void;
}

const PreviewTextModal: React.FC<PreviewTextModalProps> = ({ isOpen, onClose, htmlContent, onSave }) => {
  const [previewText, setPreviewText] = useState('');
  const [spanExists, setSpanExists] = useState(false);

  useEffect(() => {
    if (isOpen && htmlContent) {
      // Regex to find the preview text span and capture its content
      const regex = /(<span[^>]*class=(["'])\s*PreviewText\s*\2[^>]*>)([\s\S]*?)(<\/span>)/i;
      const match = htmlContent.match(regex);

      if (match && match[3]) {
        setSpanExists(true);
        setPreviewText(match[3]);
      } else {
        setSpanExists(false);
        setPreviewText('');
      }
    }
  }, [isOpen, htmlContent]);

  const handleSave = () => {
    if (!htmlContent) return;

    let newHtml = htmlContent;
    
    if (spanExists) {
      // Span exists, so we replace its content
      const regex = /(<span[^>]*class=(["'])\s*PreviewText\s*\2[^>]*>)([\s\S]*?)(<\/span>)/i;
      newHtml = htmlContent.replace(regex, `$1${previewText}$4`);
    } else {
      // Span doesn't exist, so we create and inject it
      const newSpan = `\n<span class="PreviewText" style="display:none; font-size:0px; line-height:0px; max-height:0px; max-width:0px; opacity:0; overflow:hidden; visibility:hidden; mso-hide:all;">${previewText}</span>`;
      const bodyRegex = /(<body[^>]*>)/i;
      
      if (bodyRegex.test(htmlContent)) {
        // Inject right after the <body> tag
        newHtml = htmlContent.replace(bodyRegex, `$1${newSpan}`);
      } else {
        // Fallback if no body tag is found (unlikely for a full email template)
        newHtml = newSpan + htmlContent;
      }
    }
    
    onSave(newHtml);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-2xl p-6 relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-200">Set Email Preview Text</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
        </div>
        
        {spanExists ? (
          <p className="text-gray-400 text-sm mb-4">Your template already has a preview text element. Edit the content below.</p>
        ) : (
          <div className="bg-violet-900/30 border border-violet-500/50 text-violet-300 text-sm p-3 rounded-lg mb-4">
            No preview text element was found. We will create one for you. This text appears after the subject line in most email clients.
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="preview-text-input" className="block text-sm font-medium text-gray-300 mb-1">
              Preview Text
            </label>
            <textarea
              id="preview-text-input"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              className="w-full h-28 p-3 text-sm text-white bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition duration-200 resize-y"
              placeholder="Enter the preview text that recipients will see in their inbox..."
            />
            <p className="text-xs text-gray-500 mt-1">For best results, keep this between 40 and 130 characters.</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button 
            onClick={onClose} 
            className="px-6 py-2 font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 font-semibold text-white bg-gradient-to-r from-pink-600 to-violet-600 rounded-lg hover:from-pink-700 hover:to-violet-700 flex items-center gap-2"
          >
            <SaveIcon className="w-5 h-5"/>
            <span>Save Preview Text</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewTextModal;