import React from 'react';
import { CloseIcon } from '../Icons';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const PolicyModal: React.FC<PolicyModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-3xl h-[80vh] flex flex-col p-6 relative" onClick={(e) => e.stopPropagation()}>
        {/* Custom styles for policy content readability */}
        <style>{`
            .policy-content h3 { font-size: 1.125rem; font-weight: 600; color: #E5E7EB; margin-top: 1.5rem; margin-bottom: 0.5rem; border-bottom: 1px solid #4B5563; padding-bottom: 0.25rem;}
            .policy-content p { margin-bottom: 1rem; line-height: 1.6; }
            .policy-content ul { list-style-position: outside; list-style-type: disc; margin-bottom: 1rem; padding-left: 1.5rem; }
            .policy-content li { margin-bottom: 0.5rem; }
            .policy-content a { color: #f472b6; text-decoration: underline; transition: color 0.2s; }
            .policy-content a:hover { color: #db2777; }
            .policy-content strong { color: #F3F4F6; }
            .policy-content code { background-color: #374151; padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-size: 0.8em; }
        `}</style>
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h2 className="text-2xl font-semibold text-gray-200">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-grow bg-gray-900 rounded-lg p-4 overflow-y-auto text-gray-300">
            <div className="policy-content">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default PolicyModal;