import React, { useState } from 'react';
import type { Expert } from '../../types';
import { CloseIcon, MailIcon, CopyIcon } from '../Icons';

interface ExpertDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  expert: Expert | null;
}

const ExpertDetailModal: React.FC<ExpertDetailModalProps> = ({ isOpen, onClose, expert }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopyEmail = () => {
        if (!expert?.email) return;
        navigator.clipboard.writeText(expert.email);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto p-4 transition-opacity duration-300" onClick={onClose}>
        <div className="flex min-h-full items-center justify-center">
            <div 
                className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row relative transition-all duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Left Column: Image and Basic Info */}
                <div className="w-full md:w-1/3 flex-shrink-0 bg-gray-900/50 p-8 rounded-t-2xl md:rounded-l-2xl md:rounded-r-none flex flex-col items-center justify-center text-center">
                    <img
                        src={expert?.profilePictureUrl}
                        alt={expert?.name}
                        className="w-32 h-32 rounded-full object-cover border-4 border-violet-500/50 mb-4 shadow-lg"
                    />
                    <h2 className="text-2xl font-bold text-white">{expert?.name}</h2>
                    <p className="text-pink-400 font-semibold">{expert?.designation}</p>
                </div>

                {/* Right Column: Details */}
                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="flex justify-end md:hidden mb-4">
                        <button onClick={onClose} className="text-gray-500 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-300 mb-2 border-b border-gray-700/50 pb-2">About</h3>
                    <p className="text-gray-400 whitespace-pre-line text-sm leading-relaxed">
                        {expert?.description}
                    </p>

                    <h3 className="text-lg font-semibold text-gray-300 mt-6 mb-2 border-b border-gray-700/50 pb-2">Contact</h3>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-gray-900/50 p-3 rounded-lg">
                        <div className="flex items-center gap-3 text-violet-300 flex-shrink-0">
                            <MailIcon className="w-5 h-5" />
                            <span className="font-mono text-sm">{expert?.email}</span>
                        </div>
                        <button 
                            onClick={handleCopyEmail}
                            className="ml-auto flex-shrink-0 px-3 py-1.5 text-xs font-semibold text-gray-900 bg-cyan-300 rounded-md hover:bg-cyan-400 transition-colors flex items-center gap-2"
                        >
                            <CopyIcon className="w-4 h-4" />
                            {isCopied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                    
                    {expert?.socials && expert.socials.length > 0 && (
                        <>
                            <h3 className="text-lg font-semibold text-gray-300 mt-6 mb-3 border-b border-gray-700/50 pb-2">Follow</h3>
                            <div className="space-y-3">
                                {expert.socials.map((social, index) => (
                                    <a
                                        key={index}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-baseline gap-4 text-sm group"
                                    >
                                        <span className="font-semibold text-gray-300 w-24 text-right flex-shrink-0">{social.name}</span>
                                        <span className="text-pink-400 group-hover:underline truncate">{social.url}</span>
                                    </a>
                                ))}
                            </div>
                        </>
                    )}
                </div>
                
                {/* Close button for larger screens */}
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white hidden md:block"><CloseIcon className="w-6 h-6" /></button>
            </div>
        </div>
    </div>
  );
};

export default ExpertDetailModal;