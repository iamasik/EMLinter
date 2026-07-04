import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LitmusIcon, UploadIcon, DesktopIcon, MobileIcon, SaveIcon, TrashIcon, CheckCircleIcon, CloseIcon, SpinnerIcon } from '../Icons';
import TemplateInsertModal from '../modals/TemplateInsertModal';
import SendProgressModal, { type SendProgress } from '../modals/SendProgressModal';
import PageHero from '../PageHero';
import SeoFaq from '../SeoFaq';

const faqs = [
    { question: 'How does the HTML Email Test work?', answer: 'You provide a sender email (typically Gmail with an App Password), receiver address(es), a subject, and your HTML content. The tool then sends a real email through your provider so you can preview rendering in the actual target inbox — Gmail, Outlook, Apple Mail, Yahoo, etc.' },
    { question: 'Why an App Password and not my normal Google password?', answer: 'Google has required App Passwords for SMTP-style logins since 2022. They are randomly-generated 16-character codes scoped to a single app, revocable any time, and safer than your real password. Generate one at myaccount.google.com → Security → App Passwords.' },
    { question: 'Are my credentials stored on your servers?', answer: 'No. Credentials are stored only in your browser\'s localStorage on your device. The send request goes from your browser to our serverless email proxy which uses them once and discards them.' },
    { question: 'Can I send to multiple recipients at once?', answer: 'Yes. Add as many receiver emails as you like — they\'re queued and sent sequentially with a small delay to respect rate limits.' },
    { question: 'What\'s the difference between this and Litmus/Email on Acid?', answer: 'Litmus and Email on Acid render previews using virtual machines for every email client. This tool sends a real email to your real inbox — cheaper and faster for spot-checks, but limited to clients you have access to.' },
    { question: 'Why isn\'t my test email arriving?', answer: 'Check spam first. If still missing, verify your sender App Password is correct, the sender domain isn\'t blocked, and your subject line isn\'t triggering aggressive filters.' },
];

const LOCAL_STORAGE_KEY = 'emlinter-email-test-credentials';

const validateEmail = (email: string): boolean => {
    if (!email) return false;
    // Simple regex for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(String(email).toLowerCase());
};

const HtmlEmailTestPage = () => {
    const [templateHtml, setTemplateHtml] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [scale, setScale] = useState(1);
    
    const [emailData, setEmailData] = useState({
        senderEmail: '',
        appPassword: '',
        subject: '',
    });
    const [receiverEmails, setReceiverEmails] = useState<string[]>([]);
    const [currentReceiverInput, setCurrentReceiverInput] = useState('');
    const [credentialStatus, setCredentialStatus] = useState<'idle' | 'saved' | 'deleted'>('idle');
    const [validationErrors, setValidationErrors] = useState({
        senderEmail: '',
        receiverEmail: ''
    });
    
    // New state for sending
    const [isSending, setIsSending] = useState(false);
    const [sendProgress, setSendProgress] = useState<SendProgress | null>(null);
    const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
    const [sendError, setSendError] = useState(''); // For general errors before starting loop


    const iframeRef = useRef<HTMLIFrameElement>(null);
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const receiverInputContainerRef = useRef<HTMLDivElement>(null);
    const previewWidth = useMemo(() => viewMode === 'mobile' ? 375 : 800, [viewMode]);

    useEffect(() => {
        try {
            const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedData) {
                const { senderEmail, appPassword, receiverEmail, receiverEmails } = JSON.parse(savedData);
                setEmailData(prev => ({ ...prev, senderEmail: senderEmail || '', appPassword: appPassword || '' }));
                if (receiverEmails && Array.isArray(receiverEmails)) {
                    setReceiverEmails(receiverEmails);
                } else if (receiverEmail && typeof receiverEmail === 'string') {
                    setReceiverEmails([receiverEmail]); // For backward compatibility
                }
            }
        } catch (error) {
            console.error("Failed to load email data from local storage", error);
        }
    }, []);

    useEffect(() => {
        const schema = {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "HTML Email Test - EMLinter",
          "description": "Test your HTML email by sending it to a real inbox to check rendering and deliverability.",
          "url": window.location.href
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'page-schema';
        script.innerHTML = JSON.stringify(schema);
        document.head.appendChild(script);
    
        return () => {
          const existingScript = document.getElementById('page-schema');
          if (existingScript) {
            document.head.removeChild(existingScript);
          }
        };
    }, []);

    useEffect(() => {
        const previewContainer = previewContainerRef.current;
        if (!previewContainer) return;

        const calculateScale = () => {
            const containerPadding = 32; // p-4 on each side
            const availableWidth = previewContainer.offsetWidth - containerPadding;
            
            if (previewWidth > availableWidth) {
                setScale(availableWidth / previewWidth);
            } else {
                setScale(1);
            }
        };

        const resizeObserver = new ResizeObserver(calculateScale);
        resizeObserver.observe(previewContainer);
        calculateScale();

        return () => resizeObserver.disconnect();
    }, [previewWidth]);

    const handleInsert = (html: string) => {
        setTemplateHtml(html);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEmailData(prev => ({ ...prev, [name]: value }));
        if (name === 'senderEmail') {
             setValidationErrors(prev => ({ ...prev, senderEmail: '' }));
        }
    };
    
    const handleSenderEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { value } = e.target;
        if (value && !validateEmail(value)) {
            setValidationErrors(prev => ({ ...prev, senderEmail: 'Please enter a valid email address.' }));
        } else {
            setValidationErrors(prev => ({ ...prev, senderEmail: '' }));
        }
    };

    const handleSaveCredentials = () => {
        try {
            const { senderEmail, appPassword } = emailData;
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ senderEmail, appPassword, receiverEmails }));
            setCredentialStatus('saved');
            setTimeout(() => setCredentialStatus('idle'), 2000);
        } catch (error) {
            console.error("Failed to save credentials", error);
            alert('Failed to save credentials.');
        }
    };
    
    const handleDeleteCredentials = () => {
        try {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            setEmailData(prev => ({ ...prev, senderEmail: '', appPassword: '' }));
            setReceiverEmails([]);
            setCredentialStatus('deleted');
            setTimeout(() => setCredentialStatus('idle'), 2000);
        } catch (error) {
            console.error("Failed to delete credentials", error);
        }
    };

    const handleReceiverInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentReceiverInput(e.target.value);
        if (validationErrors.receiverEmail) {
            setValidationErrors(prev => ({ ...prev, receiverEmail: '' }));
        }
    };

    const addReceiverEmail = () => {
        const emailToAdd = currentReceiverInput.trim().replace(/,$/, '');
        if (!emailToAdd) {
            setCurrentReceiverInput('');
            return;
        }

        if (!validateEmail(emailToAdd)) {
            setValidationErrors(prev => ({ ...prev, receiverEmail: 'Invalid email format.' }));
            return;
        }
        
        if (receiverEmails.includes(emailToAdd)) {
            setValidationErrors(prev => ({ ...prev, receiverEmail: 'This email has already been added.' }));
            setCurrentReceiverInput(''); // Clear input for duplicates
            return;
        }
        
        setReceiverEmails([...receiverEmails, emailToAdd]);
        setCurrentReceiverInput('');
        setValidationErrors(prev => ({ ...prev, receiverEmail: '' }));
    };

    const handleReceiverInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === ',' || e.key === 'Enter') {
            e.preventDefault();
            addReceiverEmail();
        }
    };
    
    const handleReceiverInputBlur = () => {
        addReceiverEmail();
    };

    const removeReceiverEmail = (emailToRemove: string) => {
        setReceiverEmails(receiverEmails.filter(email => email !== emailToRemove));
    };

    const handleSendTestEmail = async () => {
        setSendError('');

        // --- Validation ---
        if (!emailData.senderEmail || !validateEmail(emailData.senderEmail)) {
            setSendError('Please provide a valid sender email.');
            return;
        }
        if (!emailData.appPassword) {
            setSendError('App password is required.');
            return;
        }
        if (receiverEmails.length === 0) {
            setSendError('Please add at least one receiver email.');
            return;
        }
        if (!templateHtml) {
            setSendError('Please insert an HTML template before sending.');
            return;
        }

        setIsSending(true);
        const initialProgress: SendProgress = {
            total: receiverEmails.length,
            sent: 0,
            results: receiverEmails.map(email => ({ email, status: 'pending' })),
        };
        setSendProgress(initialProgress);
        setIsProgressModalOpen(true);

        const updatedResults = [...initialProgress.results];

        for (let i = 0; i < receiverEmails.length; i++) {
            const email = receiverEmails[i];
            
            const updateProgress = (status: 'success' | 'error', message?: string) => {
                updatedResults[i] = { ...updatedResults[i], status, message };
                setSendProgress(prev => ({
                    ...prev!,
                    sent: i + 1,
                    results: [...updatedResults]
                }));
            };
            
            try {
                // const apiUrl = process.env.REACT_APP_EMAIL_API_URL; // For later use
                const apiUrl = 'https://emailsendergmail.netlify.app/api/send';

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sender: emailData.senderEmail,
                        appPassword: emailData.appPassword,
                        receiver: email,
                        subject: emailData.subject || 'Test Email from EMLinter',
                        html: templateHtml,
                    }),
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    updateProgress('success', data.message);
                } else {
                    updateProgress('error', data.error || 'An unknown server error occurred.');
                }

            } catch (error: any) {
                updateProgress('error', error.message || 'Network error or failed to fetch.');
            }

            if (i < receiverEmails.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }
        
        setIsSending(false);
    };
    
    const baseInputClass = "w-full px-3 py-2 text-sm text-white bg-gray-900 border rounded-md focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
    const normalInputClass = "border-gray-600 focus:ring-2 focus:ring-pink-500";
    const errorInputClass = "border-red-500 focus:ring-2 focus:ring-red-500";

    return (
        <>
            <TemplateInsertModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onInsert={handleInsert}
            />
             <SendProgressModal
                isOpen={isProgressModalOpen}
                onClose={() => setIsProgressModalOpen(false)}
                progress={sendProgress}
            />
            <PageHero
                eyebrow="HTML Email Test"
                title={<>Send a real test email and <span className="gradient-text">see the truth</span>.</>}
                subtitle="Send your HTML email to a real inbox via your own Gmail App Password. Check Gmail, Outlook, Apple Mail, or Yahoo rendering with one click — no virtual machines, no Litmus subscription."
            />
            
            <div className="bg-gray-800/50 rounded-xl shadow-2xl p-6 border border-gray-700 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Column 1 */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="senderEmail" className="block text-sm font-medium text-gray-300 mb-1">Sender Email</label>
                            <input type="email" name="senderEmail" id="senderEmail" value={emailData.senderEmail} onChange={handleInputChange} onBlur={handleSenderEmailBlur} disabled={isSending} className={`${baseInputClass} ${validationErrors.senderEmail ? errorInputClass : normalInputClass}`} placeholder="your.email@gmail.com" />
                            {validationErrors.senderEmail && <p className="text-xs text-red-400 mt-1">{validationErrors.senderEmail}</p>}
                        </div>
                        <div>
                            <label htmlFor="appPassword" className="block text-sm font-medium text-gray-300 mb-1">App Password</label>
                            <input type="password" name="appPassword" id="appPassword" value={emailData.appPassword} onChange={handleInputChange} disabled={isSending} className={`${baseInputClass} ${normalInputClass}`} placeholder="••••••••••••••••" />
                            <p className="text-xs text-gray-500 mt-1">For Gmail, use an <a href="https://support.google.com/accounts/answer/185833" target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:underline">App Password</a>. This is stored in your browser.</p>
                        </div>
                    </div>
                    {/* Column 2 */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="receiverEmailInput" className="block text-sm font-medium text-gray-300 mb-1">Receiver Email(s)</label>
                            <div 
                                ref={receiverInputContainerRef}
                                onClick={() => receiverInputContainerRef.current?.querySelector('input')?.focus()}
                                className={`w-full px-3 text-sm text-white bg-gray-900 border rounded-md focus-within:outline-none flex items-center flex-wrap gap-2 cursor-text h-auto min-h-[42px] py-1.5 ${isSending ? 'opacity-50 cursor-not-allowed' : ''} ${validationErrors.receiverEmail ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-500' : 'border-gray-600 focus-within:ring-2 focus-within:ring-pink-500'}`}
                            >
                                {receiverEmails.map((email) => (
                                    <span key={email} className="flex items-center gap-1.5 bg-violet-600 text-white text-sm font-medium px-2 py-1 rounded">
                                        {email}
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); removeReceiverEmail(email); }} 
                                            disabled={isSending}
                                            className="text-violet-200 hover:text-white rounded-full focus:bg-violet-800 disabled:cursor-not-allowed"
                                            aria-label={`Remove ${email}`}
                                        >
                                            <CloseIcon className="w-4 h-4" />
                                        </button>
                                    </span>
                                ))}
                                <input 
                                    id="receiverEmailInput"
                                    type="email" 
                                    value={currentReceiverInput}
                                    onChange={handleReceiverInputChange}
                                    onKeyDown={handleReceiverInputKeyDown}
                                    onBlur={handleReceiverInputBlur}
                                    disabled={isSending}
                                    className="flex-auto min-w-[120px] bg-transparent border-none outline-none focus:ring-0 p-0 text-sm disabled:cursor-not-allowed"
                                    placeholder={receiverEmails.length === 0 ? "Press Enter or add a comma after each email." : ""}
                                />
                            </div>
                            {validationErrors.receiverEmail && <p className="text-xs text-red-400 mt-1">{validationErrors.receiverEmail}</p>}
                        </div>
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">Email Subject</label>
                            <input type="text" name="subject" id="subject" value={emailData.subject} onChange={handleInputChange} disabled={isSending} className={`${baseInputClass} ${normalInputClass}`} placeholder="My Test Email" />
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button onClick={handleSaveCredentials} disabled={isSending} aria-label="Save Credentials" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {credentialStatus === 'saved' ? <CheckCircleIcon className="w-5 h-5 text-green-400"/> : <SaveIcon className="w-5 h-5"/>}
                            <span className="hidden sm:inline">{credentialStatus === 'saved' ? 'Saved!' : 'Save Credentials'}</span>
                        </button>
                        <button onClick={handleDeleteCredentials} disabled={isSending} aria-label="Delete Saved" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-red-800/50 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <TrashIcon className="w-5 h-5"/>
                             <span className="hidden sm:inline">{credentialStatus === 'deleted' ? 'Deleted!' : 'Delete Saved'}</span>
                        </button>
                    </div>
                    <div className="w-full sm:w-auto text-right">
                        <button onClick={handleSendTestEmail} disabled={!templateHtml || isSending} className="w-full sm:w-auto px-6 py-2.5 font-semibold text-white bg-gradient-to-r from-pink-600 to-violet-600 rounded-lg hover:from-pink-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center">
                             {isSending ? (
                                <>
                                    <SpinnerIcon className="w-5 h-5 animate-spin mr-2" />
                                    Sending...
                                </>
                            ) : (
                                'Send Test Email'
                            )}
                        </button>
                         {sendError && <p className="text-xs text-red-400 mt-2 text-center sm:text-right">{sendError}</p>}
                    </div>
                </div>
            </div>

            {!templateHtml ? (
                <div className="bg-gray-800/50 rounded-xl shadow-2xl p-8 border border-gray-700 text-center">
                    <div className="w-16 h-16 bg-violet-500/10 text-violet-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <LitmusIcon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-100">Upload Your Template to Continue</h3>
                    <p className="text-gray-400 mt-2 mb-6 max-w-lg mx-auto">
                        Once you've uploaded a template, you'll see a preview here and the "Send Test" button will be enabled.
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-8 py-3 font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transform hover:scale-105 transition-transform duration-200 shadow-lg flex items-center justify-center gap-3 mx-auto"
                    >
                        <UploadIcon className="w-5 h-5" />
                        <span>Insert HTML Template</span>
                    </button>
                </div>
            ) : (
                <div className="bg-gray-800/50 rounded-xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col">
                    <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-gray-700 min-h-[68px]">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-violet-300 bg-violet-800/30 rounded-lg hover:bg-violet-800/60 transition-colors"
                        >
                            <UploadIcon className="w-4 h-4" />
                            <span>Change Template</span>
                        </button>

                        <div className="flex items-center gap-1 bg-gray-900 p-1 rounded-lg">
                            <button
                                onClick={() => setViewMode('desktop')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${viewMode === 'desktop' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}
                            >
                                <DesktopIcon className="w-5 h-5" />
                                <span className="hidden sm:inline">Desktop</span>
                            </button>
                            <button
                                onClick={() => setViewMode('mobile')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${viewMode === 'mobile' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}
                            >
                                <MobileIcon className="w-5 h-5" />
                                <span className="hidden sm:inline">Mobile</span>
                            </button>
                        </div>
                    </div>
                    <div ref={previewContainerRef} className="h-[1400px] relative bg-gray-900/50 flex justify-center items-start p-4 overflow-auto">
                        <div
                            className="flex-shrink-0 transition-all duration-300 ease-in-out"
                            style={{
                                height: '100%',
                                width: `${previewWidth * scale}px`,
                            }}
                        >
                            <div 
                                className="shadow-lg bg-white"
                                style={{ 
                                    width: `${previewWidth}px`,
                                    height: `${100 / scale}%`,
                                    transform: `scale(${scale})`,
                                    transformOrigin: 'top left',
                                }}
                            >
                                <iframe
                                    ref={iframeRef}
                                    srcDoc={templateHtml}
                                    title="Email Preview"
                                    className="w-full h-full border-0"
                                    sandbox="allow-scripts allow-same-origin"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <SeoFaq title="HTML Email Test FAQs" items={faqs} />
        </>
    );
};

export default HtmlEmailTestPage;