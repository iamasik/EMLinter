import React, { useState, useEffect } from 'react';
import { CloseIcon } from '../Icons';
import { getAppSettings } from '../../services/firebase';

const AnnouncementBar: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [text, setText] = useState('');

    useEffect(() => {
        const isDismissed = sessionStorage.getItem('announcementDismissed') === 'true';
        if (isDismissed) return;

        getAppSettings()
            .then((settings) => {
                if (settings?.announcement?.isEnabled && settings.announcement.text) {
                    setText(settings.announcement.text);
                    setTimeout(() => setIsVisible(true), 100);
                }
            })
            .catch((err) => console.error('Failed to load announcement:', err));
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        try {
            sessionStorage.setItem('announcementDismissed', 'true');
        } catch {}
    };

    return (
        <div
            className={`transition-all duration-500 ease-out overflow-hidden ${isVisible ? 'max-h-20' : 'max-h-0'}`}
            aria-hidden={!isVisible}
        >
            <div className="relative bg-gradient-to-r from-brand-600 via-accent-600 to-brand-600 text-white text-center text-sm font-medium py-2.5 px-12">
                <p className="truncate">{text}</p>
                <button
                    onClick={handleDismiss}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
                    aria-label="Dismiss announcement"
                >
                    <CloseIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default AnnouncementBar;
