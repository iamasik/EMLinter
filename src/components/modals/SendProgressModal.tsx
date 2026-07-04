import React from 'react';
import { CloseIcon, SpinnerIcon, CheckCircleIcon, XCircleIcon } from '../Icons';

export interface SendResult {
  email: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
}

export interface SendProgress {
  total: number;
  sent: number;
  results: SendResult[];
}

interface SendProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: SendProgress | null;
}

const StatusIcon = ({ status }: { status: SendResult['status'] }) => {
    switch (status) {
        case 'pending':
            return <SpinnerIcon className="w-5 h-5 animate-spin text-gray-400" />;
        case 'success':
            return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
        case 'error':
            return <XCircleIcon className="w-5 h-5 text-red-400" />;
    }
};

const SendProgressModal: React.FC<SendProgressModalProps> = ({ isOpen, onClose, progress }) => {
  if (!isOpen || !progress) return null;

  const isComplete = progress.sent === progress.total;
  const successCount = progress.results.filter(r => r.status === 'success').length;
  const errorCount = progress.results.filter(r => r.status === 'error').length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4" onClick={isComplete ? onClose : undefined}>
      <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] flex flex-col p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-2xl font-semibold text-gray-200">
            {isComplete ? 'Sending Complete' : 'Sending Test Emails...'}
          </h2>
          {isComplete && <button onClick={onClose} className="text-gray-500 hover:text-white"><CloseIcon className="w-6 h-6" /></button>}
        </div>

        <div className="flex-grow overflow-y-auto pr-2 space-y-4">
            <div className='mb-4'>
                <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
                    <span>Overall Progress</span>
                    <span>{progress.sent} / {progress.total}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div className="bg-violet-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${(progress.sent / progress.total) * 100}%` }}></div>
                </div>
            </div>

            {isComplete && (
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-green-800/50 p-3 rounded-lg">
                        <p className="text-sm text-gray-300">Succeeded</p>
                        <p className="text-2xl font-bold">{successCount}</p>
                    </div>
                     <div className="bg-red-800/50 p-3 rounded-lg">
                        <p className="text-sm text-gray-300">Failed</p>
                        <p className="text-2xl font-bold">{errorCount}</p>
                    </div>
                </div>
            )}
            
            <ul className="space-y-3">
                {progress.results.map((result) => (
                    <li key={result.email} className="bg-gray-900/50 p-3 rounded-lg flex items-start gap-3">
                        <div className="mt-1"><StatusIcon status={result.status} /></div>
                        <div className="flex-1">
                            <p className="font-medium text-gray-200">{result.email}</p>
                            {result.status === 'error' && <p className="text-xs text-red-400 mt-1">{result.message}</p>}
                        </div>
                    </li>
                ))}
            </ul>

        </div>

        <div className="mt-6 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            disabled={!isComplete}
            className="px-6 py-2 font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isComplete ? 'Done' : 'Sending...'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendProgressModal;