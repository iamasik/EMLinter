import React, { useState } from 'react';
import { CloseIcon, SpinnerIcon, CopyIcon, ColorSwatchIcon, AlertTriangleIcon, CheckCircleIcon } from '../Icons';
import type { AnalysisResult } from '../../services/colorAnalyzer';

interface ColorAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: AnalysisResult[] | null;
  isLoading: boolean;
}

const ResultRow: React.FC<{ result: AnalysisResult }> = ({ result }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(result.suggestion);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1 space-y-2">
                    <p className="text-xs text-gray-400">On Element: <code className="bg-gray-700 px-1 rounded">&lt;{result.elementTag}&gt;</code> with text "{result.elementText}"</p>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full border border-gray-600" style={{ backgroundColor: result.originalTextColor }} />
                        <span className="font-mono text-sm text-gray-300">{result.originalTextColor}</span>
                        <span className="text-gray-400">on</span>
                        <div className="w-5 h-5 rounded-full border border-gray-600" style={{ backgroundColor: result.originalBgColor }} />
                        <span className="font-mono text-sm text-gray-300">{result.originalBgColor}</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm w-full sm:w-auto">
                    <div className={`p-2 rounded-md text-center ${result.passesLight ? 'bg-green-800/50' : 'bg-red-800/50'}`}>
                        <p className="text-xs text-gray-400">Light Contrast</p>
                        <p className="font-bold text-lg">{result.lightModeContrast}:1</p>
                    </div>
                    <div className={`p-2 rounded-md text-center ${result.passesDark ? 'bg-green-800/50' : 'bg-red-800/50'}`}>
                        <p className="text-xs text-gray-400">Dark Contrast</p>
                        <p className="font-bold text-lg">{result.darkModeContrast}:1</p>
                    </div>
                </div>
            </div>
             <div className="mt-4 pt-4 border-t border-gray-700/50 flex flex-col sm:flex-row items-center gap-3">
                <p className="text-sm text-cyan-300 font-semibold flex-shrink-0">Suggested universal color:</p>
                <div className="flex items-center gap-2 bg-gray-700 p-2 rounded-lg">
                    <div className="w-5 h-5 rounded-full border border-gray-600" style={{ backgroundColor: result.suggestion }} />
                    <span className="font-mono text-sm text-white">{result.suggestion}</span>
                    <button onClick={handleCopy} className="ml-2 text-gray-400 hover:text-white">
                        {isCopied ? <CheckCircleIcon className="w-4 h-4 text-green-400"/> : <CopyIcon className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ColorAnalysisModal: React.FC<ColorAnalysisModalProps> = ({ isOpen, onClose, results, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto p-4" onClick={onClose}>
        <div className="flex min-h-full items-center justify-center">
            <div 
                className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-3xl max-h-[90vh] flex flex-col p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <h2 className="text-xl font-semibold text-gray-200 flex items-center gap-3">
                        <ColorSwatchIcon className="w-6 h-6 text-cyan-400"/>
                        Color Contrast Analysis
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                </div>
                
                <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <SpinnerIcon className="w-10 h-10 animate-spin text-violet-400" />
                            <p className="mt-4 text-gray-400">Analyzing your template's colors...</p>
                        </div>
                    ) : results === null ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                           <p className="text-gray-500">Something went wrong during analysis.</p>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center text-green-400">
                           <CheckCircleIcon className="w-12 h-12 mb-4"/>
                           <h3 className="text-xl font-semibold text-gray-100">All Clear!</h3>
                           <p className="mt-2 text-gray-300">No color contrast issues were found in your template for light or dark mode.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-yellow-900/30 border border-yellow-500/50 text-yellow-300 text-sm p-3 rounded-lg flex items-start gap-3">
                                <AlertTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <div>
                                    Found <strong className="font-bold">{results.length} color combination(s)</strong> that fail WCAG AA accessibility standards (4.5:1 ratio) in either light or dark mode.
                                </div>
                            </div>
                            {results.map((result, index) => (
                                <ResultRow key={index} result={result} />
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end flex-shrink-0">
                    <button onClick={onClose} className="px-6 py-2 font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Close</button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ColorAnalysisModal;