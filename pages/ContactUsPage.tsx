import React, { useState, useEffect } from 'react';
import { CopyIcon, FacebookIcon, TwitterIcon, InstagramIcon, YoutubeIcon } from '../components/Icons';
import { getAppSettings } from '../services/firebase';
import type { AppSettings } from '../types';
import ActionInfoModal from '../components/modals/ActionInfoModal';


// SVGs for card backgrounds
const MailIconBg = () => (
    <svg className="absolute bottom-4 right-4 w-32 h-32 text-gray-700/50 transform -rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);
const BriefcaseIconBg = () => (
    <svg className="absolute bottom-4 right-4 w-32 h-32 text-gray-700/50 transform rotate-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);
const PartnershipIcon = () => (
    <svg className="absolute bottom-4 right-4 w-32 h-32 text-gray-700/50 transform -rotate-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm-2 5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const ContactUsPage = () => {
    const [isCopied, setIsCopied] = useState(false);
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);

    useEffect(() => {
        setLoading(true);
        getAppSettings()
            .then(setSettings)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleCopyEmail = (emailToCopy: string) => {
        if (!emailToCopy) return;
        navigator.clipboard.writeText(emailToCopy);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <>
            <title>Contact Us | EMLinter</title>
            <meta name="description" content="Get in touch with the EMLinter team. We'd love to hear from you whether you have a question, a project idea, or just want to say hi." />
            <link rel="canonical" href="https://emlinter.app/contact-us" />
            <ActionInfoModal
                isOpen={isActionModalOpen}
                onClose={() => setIsActionModalOpen(false)}
                actionType="hireMe"
            />
            <div className="relative overflow-hidden py-12">
                 <style>{`
                    @keyframes aurora {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                    .aurora-bg {
                        position: absolute;
                        top: -20%; right: -20%; bottom: -20%; left: -20%;
                        background: radial-gradient(circle at 10% 20%, rgba(37, 99, 235, 0.2) 0%, transparent 40%),
                                    radial-gradient(circle at 80% 30%, rgba(34, 197, 94, 0.2) 0%, transparent 40%),
                                    radial-gradient(circle at 50% 90%, rgba(139, 92, 246, 0.2) 0%, transparent 40%);
                        background-size: 200% 200%;
                        animation: aurora 20s infinite ease-in-out;
                        filter: blur(80px);
                        z-index: -1;
                    }
                     @keyframes enter-from-bottom {
                        from {
                            opacity: 0;
                            transform: translateY(30px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    .animate-enter { 
                        animation: enter-from-bottom 0.6s ease-out forwards;
                    }
                `}</style>

                <div className="aurora-bg"></div>
                
                <header className="text-center mb-16 opacity-0 animate-enter" style={{ animationDelay: '0s' }}>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-100 pb-2">
                        Let's Connect
                    </h1>
                    <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
                        Whether you have a question, a project idea, or just want to say hi, I'd love to hear from you.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Contact Us Card */}
                    <div className="opacity-0 animate-enter" style={{ animationDelay: '100ms' }}>
                        <div className="relative p-8 h-full rounded-2xl bg-gray-800/50 border border-gray-700/50 overflow-hidden transform transition-transform duration-300 hover:-translate-y-2">
                             <MailIconBg />
                             <div className="relative z-10 flex flex-col h-full">
                                <h3 className="text-xl font-semibold text-gray-100 mb-2">Contact Us</h3>
                                {loading ? (
                                    <div className="flex-grow mb-6 space-y-2 animate-pulse">
                                        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                                    </div>
                                ) : (settings?.contact?.isEnabled && (settings.contact.email || settings.contact.phone)) ? (
                                    <>
                                        <div className="flex-grow mb-6 space-y-2">
                                            {settings.contact.email && (
                                                <p className="text-gray-400 text-sm break-all">
                                                    <span className="font-semibold text-gray-300">Email:</span> {settings.contact.email}
                                                </p>
                                            )}
                                            {settings.contact.phone && (
                                                <p className="text-gray-400 text-sm">
                                                    <span className="font-semibold text-gray-300">Call:</span> {settings.contact.phone}
                                                </p>
                                            )}
                                        </div>
                                        {settings.contact.email && (
                                            <button onClick={() => handleCopyEmail(settings.contact.email!)} className="mt-auto w-full text-center px-4 py-2.5 font-semibold text-gray-900 bg-cyan-300 rounded-lg hover:bg-cyan-400 transition-colors duration-200 flex items-center justify-center gap-2">
                                                <CopyIcon className="w-4 h-4" />
                                                {isCopied ? 'Copied!' : 'Copy Email'}
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex-grow mb-6">
                                        <p className="text-gray-500 text-sm">
                                            Contact information is currently unavailable. Please check back later or use our social media channels.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Hire Me Card */}
                    <div className="opacity-0 animate-enter" style={{ animationDelay: '250ms' }}>
                        <div className="relative p-8 h-full rounded-2xl bg-gray-800/50 border border-gray-700/50 overflow-hidden transform transition-transform duration-300 hover:-translate-y-2">
                            <BriefcaseIconBg />
                            <div className="relative z-10 flex flex-col h-full">
                                <h3 className="text-xl font-semibold text-gray-100 mb-2">Hire Me</h3>
                                <p className="text-gray-400 text-sm mb-6 flex-grow">Looking for a professional developer for your next project? Let's talk.</p>
                                <button
                                    onClick={() => setIsActionModalOpen(true)}
                                    className="mt-auto block w-full text-center px-4 py-2.5 font-semibold text-gray-900 bg-cyan-300 rounded-lg hover:bg-cyan-400 transition-colors duration-200"
                                >
                                    View Offer
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Follow Us Card */}
                    <div className="opacity-0 animate-enter" style={{ animationDelay: '400ms' }}>
                        <div className="relative p-8 h-full rounded-2xl bg-gray-800/50 border border-gray-700/50 overflow-hidden transform transition-transform duration-300 hover:-translate-y-2">
                            <PartnershipIcon />
                            <div className="relative z-10 flex flex-col h-full">
                                <h3 className="text-xl font-semibold text-gray-100 mb-2">Follow Us</h3>
                                <p className="text-gray-400 text-sm mb-6 flex-grow">Connect with us on social media for updates and insights.</p>
                                <div className="mt-auto flex justify-center items-center space-x-6">
                                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                                        <FacebookIcon className="w-6 h-6" />
                                    </a>
                                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                                        <TwitterIcon className="w-6 h-6" />
                                    </a>
                                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                                        <InstagramIcon className="w-6 h-6" />
                                    </a>
                                    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="YouTube">
                                        <YoutubeIcon className="w-6 h-6" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
export default ContactUsPage;