import React, { useState, useEffect } from 'react';
import { CloseIcon } from '../Icons';

interface AnnouncementBarProps {
    announcement: {
        text: string;
        isEnabled: boolean;
    } | null;
    isLoading: boolean;
}

const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ announcement, isLoading }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!isLoading && announcement?.isEnabled) {
            const isDismissed = sessionStorage.getItem('announcementDismissed') === 'true';
            if (!isDismissed) {
                // Use a short timeout to allow the rest of the page to render, then animate in.
                setTimeout(() => setIsVisible(true), 100);
            }
        }
    }, [announcement, isLoading]);

    const handleDismiss = () => {
        setIsVisible(false);
        try {
            sessionStorage.setItem('announcementDismissed', 'true');
        } catch (error) {
            console.error("Could not save dismissal state to sessionStorage:", error);
        }
    };

    return (
        <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${isVisible ? 'max-h-20' : 'max-h-0'}`}
            aria-hidden={!isVisible}
        >
            <div className="bg-gradient-to-r from-violet-600 to-pink-600 text-white p-3 text-center text-sm font-semibold relative">
                <p>{announcement?.text}</p>
                <button
                    onClick={handleDismiss}
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                    aria-label="Dismiss announcement"
                >
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default AnnouncementBar;
