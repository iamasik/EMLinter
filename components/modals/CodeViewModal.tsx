import React, { useState, useEffect } from 'react';
import { CopyIcon, CloseIcon } from '../Icons';

const CodeViewModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  htmlContent: string | null;
}> = ({ isOpen, onClose, htmlContent }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (htmlContent) {
      navigator.clipboard.writeText(htmlContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (isOpen) {
        setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-4xl h-[80vh] flex flex-col p-6 relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-200">Template HTML Code</h2>
            <div className="flex gap-4 items-center">
                 <button 
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors duration-200"
                >
                    <CopyIcon className="w-5 h-5" />
                    {copied ? 'Copied!' : 'Copy Code'}
                </button>
                <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
        <div className="flex-grow bg-gray-900 rounded-lg p-4 overflow-auto">
             <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                <code>{htmlContent || 'No HTML content to display.'}</code>
             </pre>
        </div>
      </div>
    </div>
  );
};

export default CodeViewModal;
