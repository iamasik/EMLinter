import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CoffeeIcon, BriefcaseIcon, SendIcon, CheckCircleIcon, SpinnerIcon, AlertTriangleIcon } from '../Icons';
import ActionInfoModal from '../modals/ActionInfoModal';

const SITEKEY = import.meta.env.PUBLIC_HCAPTCHA_SITEKEY as string | undefined;
const HCAPTCHA_SRC = 'https://js.hcaptcha.com/1/api.js?render=explicit';

declare global {
    interface Window {
        hcaptcha?: {
            render: (el: HTMLElement, opts: Record<string, unknown>) => string;
            reset: (id?: string) => void;
            getResponse: (id?: string) => string;
        };
    }
}

type FormState = {
    fullName: string;
    email: string;
    subject: string;
    message: string;
};

const EMPTY: FormState = { fullName: '', email: '', subject: '', message: '' };

type Status = 'idle' | 'submitting' | 'success' | 'error';

// Load the hCaptcha script once and resolve when window.hcaptcha is ready.
let hcaptchaPromise: Promise<void> | null = null;
function loadHcaptcha(): Promise<void> {
    if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
    if (window.hcaptcha) return Promise.resolve();
    if (hcaptchaPromise) return hcaptchaPromise;
    hcaptchaPromise = new Promise<void>((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>(`script[src="${HCAPTCHA_SRC}"]`);
        const onReady = () => {
            // Script tag present but API may attach a tick later.
            const wait = () => (window.hcaptcha ? resolve() : setTimeout(wait, 50));
            wait();
        };
        if (existing) {
            onReady();
            return;
        }
        const script = document.createElement('script');
        script.src = HCAPTCHA_SRC;
        script.async = true;
        script.defer = true;
        script.onload = onReady;
        script.onerror = () => reject(new Error('Failed to load hCaptcha'));
        document.head.appendChild(script);
    });
    return hcaptchaPromise;
}

const ContactUsPage = () => {
    const [modalType, setModalType] = useState<'hireMe' | 'buyMeACoffee' | null>(null);
    const [form, setForm] = useState<FormState>(EMPTY);
    const [status, setStatus] = useState<Status>('idle');
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [captchaToken, setCaptchaToken] = useState<string>('');
    const [captchaReady, setCaptchaReady] = useState(false);

    const captchaRef = useRef<HTMLDivElement>(null);
    const widgetId = useRef<string | null>(null);

    // Render the hCaptcha widget once the script is loaded.
    useEffect(() => {
        if (!SITEKEY) return;
        let cancelled = false;
        loadHcaptcha()
            .then(() => {
                if (cancelled || !captchaRef.current || !window.hcaptcha) return;
                if (widgetId.current !== null) return; // guard against double render (StrictMode)
                widgetId.current = window.hcaptcha.render(captchaRef.current, {
                    sitekey: SITEKEY,
                    theme: 'dark',
                    callback: (token: string) => setCaptchaToken(token),
                    'expired-callback': () => setCaptchaToken(''),
                    'error-callback': () => setCaptchaToken(''),
                });
                setCaptchaReady(true);
            })
            .catch(() => {
                if (!cancelled) setCaptchaReady(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const resetCaptcha = useCallback(() => {
        setCaptchaToken('');
        if (window.hcaptcha && widgetId.current !== null) {
            try {
                window.hcaptcha.reset(widgetId.current);
            } catch {
                /* noop */
            }
        }
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        if (SITEKEY && !captchaToken) {
            setStatus('error');
            setErrorMsg('Please complete the captcha before submitting.');
            return;
        }

        setStatus('submitting');
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, captchaToken }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data?.error || 'Failed to send your message.');
            }
            setStatus('success');
            setForm(EMPTY);
            resetCaptcha();
        } catch (err) {
            setStatus('error');
            setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
            resetCaptcha();
        }
    };

    const inputClasses =
        'w-full px-4 py-2.5 bg-gray-900/60 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition';

    return (
        <>
            <ActionInfoModal
                isOpen={modalType !== null}
                onClose={() => setModalType(null)}
                actionType={modalType ?? 'hireMe'}
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
                        from { opacity: 0; transform: translateY(30px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-enter { animation: enter-from-bottom 0.6s ease-out forwards; }
                `}</style>
                <div className="aurora-bg"></div>

                <header className="text-center mb-12 opacity-0 animate-enter" style={{ animationDelay: '0s' }}>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-100 pb-2">Let's Connect</h1>
                    <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
                        Whether you have a question, a project idea, or just want to say hi, I'd love to hear from you.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Left column: Hire Me + Buy Me a Coffee */}
                    <div className="flex flex-col gap-8 opacity-0 animate-enter" style={{ animationDelay: '100ms' }}>
                        <div className="relative p-8 rounded-2xl bg-gray-800/50 border border-gray-700/50 overflow-hidden transition-transform duration-300 hover:-translate-y-1">
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="p-3 rounded-full bg-gray-700/50 border border-gray-600 w-fit mb-4">
                                    <BriefcaseIcon className="w-6 h-6 text-green-400" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-100 mb-2">Hire Me</h2>
                                <p className="text-gray-400 text-sm mb-6 flex-grow">
                                    Looking for a professional developer for your next email project? Let's talk.
                                </p>
                                <button
                                    onClick={() => setModalType('hireMe')}
                                    className="mt-auto w-full text-center px-4 py-2.5 font-semibold text-white bg-gradient-to-r from-green-400 to-cyan-400 rounded-lg hover:scale-[1.02] transition-transform duration-200"
                                >
                                    View Offer
                                </button>
                            </div>
                        </div>

                        <div className="relative p-8 rounded-2xl bg-gray-800/50 border border-gray-700/50 overflow-hidden transition-transform duration-300 hover:-translate-y-1">
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="p-3 rounded-full bg-gray-700/50 border border-gray-600 w-fit mb-4">
                                    <CoffeeIcon className="w-6 h-6 text-yellow-400" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-100 mb-2">Buy Me a Coffee</h2>
                                <p className="text-gray-400 text-sm mb-6 flex-grow">
                                    Find this toolkit useful? A little caffeine goes a long way in keeping it free and improving.
                                </p>
                                <button
                                    onClick={() => setModalType('buyMeACoffee')}
                                    className="mt-auto w-full text-center px-4 py-2.5 font-semibold text-gray-900 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg hover:scale-[1.02] transition-transform duration-200"
                                >
                                    Support the Project
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right column: Contact form */}
                    <div className="opacity-0 animate-enter" style={{ animationDelay: '250ms' }}>
                        <div className="relative p-8 rounded-2xl bg-gray-800/50 border border-gray-700/50 h-full">
                            <h2 className="text-xl font-semibold text-gray-100 mb-6">Send a Message</h2>

                            {status === 'success' ? (
                                <div className="flex flex-col items-center justify-center text-center py-10">
                                    <CheckCircleIcon className="w-14 h-14 text-green-400 mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-100">Message sent!</h3>
                                    <p className="text-gray-400 mt-2">
                                        Thanks for reaching out. I'll get back to you as soon as I can.
                                    </p>
                                    <button
                                        onClick={() => setStatus('idle')}
                                        className="mt-6 px-5 py-2 text-sm font-semibold text-gray-200 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                                    >
                                        Send another
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                                    <div>
                                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1.5">
                                            Full Name
                                        </label>
                                        <input
                                            id="fullName"
                                            name="fullName"
                                            type="text"
                                            required
                                            maxLength={120}
                                            value={form.fullName}
                                            onChange={handleChange}
                                            className={inputClasses}
                                            placeholder="Jane Doe"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                                            Email
                                        </label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            maxLength={254}
                                            value={form.email}
                                            onChange={handleChange}
                                            className={inputClasses}
                                            placeholder="jane@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1.5">
                                            Subject
                                        </label>
                                        <input
                                            id="subject"
                                            name="subject"
                                            type="text"
                                            required
                                            maxLength={160}
                                            value={form.subject}
                                            onChange={handleChange}
                                            className={inputClasses}
                                            placeholder="How can I help?"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1.5">
                                            Message
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            required
                                            maxLength={5000}
                                            rows={5}
                                            value={form.message}
                                            onChange={handleChange}
                                            className={`${inputClasses} resize-y`}
                                            placeholder="Tell me a bit about your project or question..."
                                        />
                                    </div>

                                    {SITEKEY ? (
                                        <div ref={captchaRef} className="min-h-[78px]" />
                                    ) : (
                                        <p className="text-xs text-yellow-500/80 flex items-center gap-2">
                                            <AlertTriangleIcon className="w-4 h-4" />
                                            Captcha is not configured. Set PUBLIC_HCAPTCHA_SITEKEY to enable spam protection.
                                        </p>
                                    )}

                                    {status === 'error' && errorMsg && (
                                        <p className="text-sm text-red-400 flex items-center gap-2">
                                            <AlertTriangleIcon className="w-4 h-4 flex-shrink-0" />
                                            {errorMsg}
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={status === 'submitting' || (Boolean(SITEKEY) && !captchaToken)}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white bg-gradient-to-r from-violet-500 to-brand-500 rounded-lg hover:scale-[1.02] transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    >
                                        {status === 'submitting' ? (
                                            <>
                                                <SpinnerIcon className="w-5 h-5 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <SendIcon className="w-5 h-5" />
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ContactUsPage;
