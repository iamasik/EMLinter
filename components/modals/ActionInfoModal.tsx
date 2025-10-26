import React, { useState, useEffect } from 'react';
import { getAppSettings } from '../../services/firebase';
import type { AppSettings } from '../../types';
import { CloseIcon, SpinnerIcon, CoffeeIcon, BriefcaseIcon, AlertTriangleIcon } from '../Icons';

interface ActionInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: 'buyMeACoffee' | 'hireMe';
}

const ActionInfoModal: React.FC<ActionInfoModalProps> = ({ isOpen, onClose, actionType }) => {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            setError(null);
            const fetchSettings = async () => {
                try {
                    const appSettings = await getAppSettings();
                    if (appSettings) {
                        setSettings(appSettings);
                    } else {
                        setError("Configuration for this feature is currently unavailable.");
                    }
                } catch (err) {
                    console.error("Error fetching settings:", err);
                    setError("Could not load details. Please check your internet connection and try again.");
                } finally {
                    setLoading(false);
                }
            };
            fetchSettings();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const isBuyMeACoffee = actionType === 'buyMeACoffee';
    const config = {
        title: isBuyMeACoffee ? "Buy Me a Coffee" : "Hire Me",
        icon: isBuyMeACoffee ? <CoffeeIcon className="w-8 h-8 text-yellow-400" /> : <BriefcaseIcon className="w-8 h-8 text-green-400" />,
        buttonIcon: isBuyMeACoffee ? <CoffeeIcon className="w-5 h-5" /> : <BriefcaseIcon className="w-5 h-5" />,
        gradient: isBuyMeACoffee ? "from-yellow-400 to-orange-400" : "from-green-400 to-cyan-400",
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center h-40">
                    <SpinnerIcon className="w-10 h-10 animate-spin text-violet-400" />
                    <p className="mt-4 text-gray-400">Loading details...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                    <AlertTriangleIcon className="w-10 h-10 text-red-400 mb-4" />
                    <p className="text-red-400">{error}</p>
                </div>
            );
        }

        if (isBuyMeACoffee) {
            if (settings?.buyMeACoffee?.isEnabled) {
                return (
                    <div className="text-center">
                        <p className="text-gray-300 mb-6">
                            If you find this tool useful, please consider supporting its development. Every coffee helps!
                        </p>
                        <a 
                            href={settings.buyMeACoffee.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={`inline-flex items-center justify-center gap-2 px-8 py-3 font-semibold text-white bg-gradient-to-r ${config.gradient} rounded-full hover:scale-105 transition-transform`}
                        >
                            {config.buttonIcon}
                            <span>{config.title}</span>
                        </a>
                    </div>
                );
            } else {
                return (
                    <div className="flex flex-col items-center justify-center h-40 text-center">
                        <CoffeeIcon className="w-10 h-10 text-gray-500 mb-4" />
                        <p className="text-gray-400">
                            The "Buy Me a Coffee" option is currently disabled. Thank you for your interest!
                        </p>
                    </div>
                );
            }
        }

        if (actionType === 'hireMe') {
            if (settings?.hireMeUrl) {
                 return (
                    <div className="text-center">
                        <p className="text-gray-300 mb-6">
                            Need a professional developer for your next email project? Let's build something great together.
                        </p>
                        <a 
                            href={settings.hireMeUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                             className={`inline-flex items-center justify-center gap-2 px-8 py-3 font-semibold text-white bg-gradient-to-r ${config.gradient} rounded-full hover:scale-105 transition-transform`}
                        >
                            {config.buttonIcon}
                             <span>{config.title}</span>
                        </a>
                    </div>
                );
            } else {
                 return (
                    <div className="flex flex-col items-center justify-center h-40 text-center">
                        <BriefcaseIcon className="w-10 h-10 text-gray-500 mb-4" />
                        <p className="text-gray-400">
                           Hiring information is currently unavailable. Please check back later.
                        </p>
                    </div>
                );
            }
        }

        return null;
    };


  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={onClose}>
        <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md p-8 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
            <div className="flex flex-col items-center text-center">
                <div className={`p-4 rounded-full bg-gray-700/50 border border-gray-600 mb-4`}>
                    {config.icon}
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">{config.title}</h2>
                {renderContent()}
            </div>
        </div>
    </div>
  );
};

export default ActionInfoModal;