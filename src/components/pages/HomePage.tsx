import React, { useEffect } from 'react';
import {
    CheckCircleIcon,
    WandIcon,
    CodeIcon,
    TemplateIcon,
    CursorClickIcon,
    UsersIcon,
    MoonIcon,
    ImageIcon,
    LitmusIcon,
    BookOpenIcon,
    SpinnerIcon,
} from '../Icons';
import SeoFaq from '../SeoFaq';
import PageHero from '../PageHero';

const HomePage: React.FC = () => {
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) entry.target.classList.add('animate-fade-up');
                });
            },
            { threshold: 0.1 }
        );
        document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const faqs = [
        {
            question: 'What is EMLinter and who is it for?',
            answer: (
                <p>
                    EMLinter is a free, browser-based HTML email toolkit built for email developers, marketers, and designers. It bundles a linter, beautifier, minifier, dark-mode tester, visual editor, and bulletproof Outlook generators into one workflow — so you can validate, debug, and ship pixel-perfect email campaigns without juggling six different tools.
                </p>
            ),
        },
        {
            question: 'Is EMLinter really free? Do I need to sign up?',
            answer: (
                <p>
                    Yes — every tool on EMLinter is 100% free with no signup required. Paste your HTML, click a button, copy the result. We don't gate features behind a login, and we don't store your code or personal data.
                </p>
            ),
        },
        {
            question: 'Is my HTML code safe? Where does it get processed?',
            answer: (
                <p>
                    All processing happens locally in your browser. Your HTML never touches our servers — the linter, minifier, beautifier, dark-mode tester, and Outlook generators all run client-side. Nothing is uploaded, logged, or stored.
                </p>
            ),
        },
        {
            question: 'Which email clients does EMLinter optimize for?',
            answer: (
                <p>
                    The toolkit targets every major client and rendering engine: Gmail (web, iOS, Android), Apple Mail, Outlook 2007–2024 (Word + WebView), Outlook.com, Yahoo Mail, Samsung Mail, Thunderbird, ProtonMail, and HEY. Our Outlook tools specifically generate VML fallbacks for the trickiest of the bunch.
                </p>
            ),
        },
        {
            question: 'How is EMLinter different from Litmus, Email on Acid, or Stripo?',
            answer: (
                <p>
                    Litmus and Email on Acid are paid rendering-preview platforms. Stripo and BEE are drag-and-drop builders. EMLinter sits between them — a free, code-first toolkit for people who already write or maintain HTML email and need fast, focused utilities (lint, minify, dark-mode preview, VML generators) without subscriptions or onboarding.
                </p>
            ),
        },
        {
            question: 'Can I use templates from EMLinter in Mailchimp, Klaviyo, or HubSpot?',
            answer: (
                <p>
                    Yes. Every template in our library is plain, responsive HTML compatible with major ESPs — Mailchimp, Klaviyo, HubSpot, Constant Contact, Salesforce Marketing Cloud, Campaign Monitor, ActiveCampaign, and more. Edit the copy and images in our Visual Editor, copy the HTML, paste it into your ESP's code editor.
                </p>
            ),
        },
    ];

    const featureCards = [
        {
            icon: CheckCircleIcon,
            tone: 'from-pink-500/20 to-pink-500/5 text-pink-300 ring-pink-400/20',
            title: 'HTML Email Linter',
            text: 'Catch unclosed tags, broken nesting, and Outlook-specific bugs the second you paste your code.',
            href: '/tools/code-fix',
            cta: 'Validate code',
        },
        {
            icon: CursorClickIcon,
            tone: 'from-violet-500/20 to-violet-500/5 text-violet-300 ring-violet-400/20',
            title: 'No-Code Visual Editor',
            text: 'Let marketing teams edit text, swap images, and update links on coded templates — without touching HTML.',
            href: '/visual-editor',
            cta: 'Open editor',
        },
        {
            icon: TemplateIcon,
            tone: 'from-sky-500/20 to-sky-500/5 text-sky-300 ring-sky-400/20',
            title: 'Template Library',
            text: 'Free, fully responsive HTML email templates you can edit, export, and drop into any ESP.',
            href: '/templates',
            cta: 'Browse templates',
        },
        {
            icon: UsersIcon,
            tone: 'from-emerald-500/20 to-emerald-500/5 text-emerald-300 ring-emerald-400/20',
            title: 'Bulletproof Outlook Tools',
            text: 'Generate VML buttons and background images that render in every Microsoft Outlook version.',
            href: '/solutions/outlook-button-generator',
            cta: 'Open Outlook kit',
        },
        {
            icon: MoonIcon,
            tone: 'from-indigo-500/20 to-indigo-500/5 text-indigo-300 ring-indigo-400/20',
            title: 'Dark Mode Tester',
            text: 'Simulate Outlook and Gmail dark modes side-by-side and flag low-contrast text automatically.',
            href: '/tools/dark-mode-checker',
            cta: 'Test dark mode',
        },
        {
            icon: CodeIcon,
            tone: 'from-amber-500/20 to-amber-500/5 text-amber-300 ring-amber-400/20',
            title: 'Beautify + Minify',
            text: 'Format messy code for debugging, then minify the final build to slip under Gmail\'s 102KB clip.',
            href: '/tools/html-minifier',
            cta: 'Optimize code',
        },
    ];

    const stats = [
        { label: 'Email clients tested', value: '40+' },
        { label: 'Outlook versions covered', value: '18' },
        { label: 'Tools, one workflow', value: '12' },
        { label: 'Cost', value: 'Free' },
    ];

    const workflow = [
        {
            step: '01',
            title: 'Build or paste',
            text: 'Start from a free template, paste your existing HTML, or open the no-code Visual Editor.',
        },
        {
            step: '02',
            title: 'Lint & optimize',
            text: 'Run the linter for tag errors, beautify for readability, minify for deliverability, simulate dark mode.',
        },
        {
            step: '03',
            title: 'Bulletproof for Outlook',
            text: 'Wrap CTAs and hero images in VML so every Outlook version renders exactly what you designed.',
        },
        {
            step: '04',
            title: 'Send & ship',
            text: 'Fire a real test to your inbox, copy the final HTML, and paste it into your ESP. Done.',
        },
    ];

    return (
        <div className="relative">
            <PageHero
                eyebrow="Free HTML Email Toolkit"
                title={
                    <>
                        Build, lint, and ship{' '}
                        <span className="gradient-text">flawless HTML emails</span>{' '}
                        in every inbox.
                    </>
                }
                subtitle="EMLinter is the free, browser-based toolkit email developers actually use. Validate HTML, simulate dark mode, generate bulletproof Outlook code, and edit templates visually — all without a signup."
            >
                <a href="/visual-editor" className="btn-primary">
                    Launch Visual Editor
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </a>
                <a href="/templates" className="btn-secondary">Browse Free Templates</a>
            </PageHero>

            {/* Stats strip */}
            <section className="reveal opacity-0 mb-20 md:mb-24">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {stats.map((s) => (
                        <div key={s.label} className="card p-5 md:p-6 text-center">
                            <div className="text-2xl md:text-3xl font-display font-bold gradient-text">{s.value}</div>
                            <div className="mt-1 text-xs md:text-sm text-ink-300">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="reveal opacity-0 mb-20 md:mb-28">
                <div className="text-center mb-12">
                    <h2 className="section-title">Everything you need to build email — in one place</h2>
                    <p className="section-subtitle mx-auto mt-4">
                        A focused toolkit that replaces three subscriptions. Lint, minify, preview, generate, and edit — without leaving the browser.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {featureCards.map(({ icon: Icon, tone, title, text, href, cta }) => (
                        <a
                            key={title}
                            href={href}
                            className="group card p-6 hover:border-white/20 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                        >
                            <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${tone} opacity-60 blur-2xl group-hover:opacity-90 transition-opacity`} />
                            <div className={`relative inline-flex p-2.5 rounded-xl bg-gradient-to-br ${tone} ring-1 mb-5`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <h3 className="relative text-xl font-display font-bold text-white mb-2">{title}</h3>
                            <p className="relative text-sm text-ink-300 leading-relaxed mb-4">{text}</p>
                            <span className="relative text-sm font-medium text-brand-300 group-hover:text-brand-200 inline-flex items-center gap-1">
                                {cta}
                                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                            </span>
                        </a>
                    ))}
                </div>
            </section>

            {/* Workflow */}
            <section className="reveal opacity-0 mb-20 md:mb-28">
                <div className="text-center mb-12">
                    <h2 className="section-title">The four-step EMLinter workflow</h2>
                    <p className="section-subtitle mx-auto mt-4">
                        From blank canvas to send — without context-switching between Litmus, Stripo, and a manual VML cheat sheet.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {workflow.map((w, i) => (
                        <div key={w.step} className="relative card p-6">
                            <div className="text-xs font-semibold text-brand-400 tracking-widest mb-3">STEP {w.step}</div>
                            <h3 className="text-lg font-display font-bold text-white mb-2">{w.title}</h3>
                            <p className="text-sm text-ink-300 leading-relaxed">{w.text}</p>
                            {i < workflow.length - 1 && (
                                <div className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 text-ink-700">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Tool deep-dive split */}
            <section className="reveal opacity-0 mb-20 md:mb-28">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                    <div className="card p-8 md:p-10 relative overflow-hidden">
                        <div className="absolute inset-0 -z-10 bg-mesh opacity-40" />
                        <span className="chip mb-4">For developers</span>
                        <h3 className="font-display text-2xl md:text-3xl font-bold mb-4 text-balance">
                            A code-first toolkit, not another drag-and-drop builder.
                        </h3>
                        <ul className="space-y-3 text-sm text-ink-200">
                            {[
                                'Validate against 40+ client-specific rendering bugs',
                                'Beautify or minify to slide under Gmail\'s 102KB cap',
                                'Generate Outlook VML buttons and backgrounds in one click',
                                'Auto-flag dark-mode contrast failures (WCAG AA)',
                            ].map((line) => (
                                <li key={line} className="flex items-start gap-3">
                                    <CheckCircleIcon className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
                                    <span>{line}</span>
                                </li>
                            ))}
                        </ul>
                        <a href="/tools" className="btn-primary mt-6 text-sm">Open developer tools</a>
                    </div>
                    <div className="card p-8 md:p-10 relative overflow-hidden">
                        <div className="absolute inset-0 -z-10 bg-mesh opacity-30" />
                        <span className="chip mb-4">For marketers</span>
                        <h3 className="font-display text-2xl md:text-3xl font-bold mb-4 text-balance">
                            Edit coded templates without ever opening a code editor.
                        </h3>
                        <ul className="space-y-3 text-sm text-ink-200">
                            {[
                                'Click any block to update text, images, and links',
                                'Pixel-perfect templates that survive Gmail clipping',
                                'Hand off to developers without losing brand integrity',
                                'Auto-save to your browser — pick up where you left off',
                            ].map((line) => (
                                <li key={line} className="flex items-start gap-3">
                                    <CheckCircleIcon className="w-5 h-5 text-accent-400 flex-shrink-0 mt-0.5" />
                                    <span>{line}</span>
                                </li>
                            ))}
                        </ul>
                        <a href="/visual-editor" className="btn-primary mt-6 text-sm">Open Visual Editor</a>
                    </div>
                </div>
            </section>

            {/* SEO content block — answer engine optimization (AEO) */}
            <section className="reveal opacity-0 mb-20 md:mb-28">
                <div className="card p-8 md:p-12 max-w-5xl mx-auto">
                    <h2 className="section-title mb-6">What is an HTML email toolkit, and why do you need one?</h2>
                    <div className="prose prose-invert prose-sm md:prose-base max-w-none text-ink-300 leading-relaxed space-y-4">
                        <p>
                            An <strong className="text-white">HTML email toolkit</strong> is a collection of utilities that helps developers and marketers build, validate, and optimize email campaigns for inbox rendering. Unlike web browsers, email clients (Gmail, Outlook, Apple Mail, Yahoo) parse HTML in wildly inconsistent ways — Outlook uses Microsoft Word as its rendering engine, Gmail strips style tags, and most clients ignore modern CSS entirely.
                        </p>
                        <p>
                            A good toolkit solves the three core problems of email development:
                            <strong className="text-white"> validation</strong> (catching errors before they break a send),
                            <strong className="text-white"> compatibility</strong> (generating VML fallbacks for Outlook), and
                            <strong className="text-white"> deliverability</strong> (minifying to stay under Gmail's 102KB clipping threshold).
                            EMLinter wraps all three into one free, browser-based workflow.
                        </p>
                        <p>
                            We built EMLinter because the existing market is split between expensive preview platforms (Litmus, Email on Acid) and drag-and-drop builders (BEE, Stripo) that produce bloated code. If you write HTML email by hand — or maintain templates someone else wrote — you need a fast, focused, code-first toolkit. That's what we shipped.
                        </p>
                    </div>
                </div>
            </section>

            <SeoFaq
                title="HTML email toolkit FAQs"
                subtitle="Answers to the questions developers and marketers ask before they ship a campaign."
                items={faqs}
            />

            {/* Final CTA */}
            <section className="reveal opacity-0 py-12 md:py-16 text-center">
                <div className="card p-10 md:p-14 max-w-3xl mx-auto relative overflow-hidden">
                    <div className="absolute inset-0 -z-10 bg-mesh opacity-50" />
                    <h2 className="section-title mb-4">Ready to ship better emails?</h2>
                    <p className="section-subtitle mx-auto mb-8">
                        Open the toolkit, paste your HTML, and see why thousands of email developers swapped their paid tools for EMLinter.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <a href="/visual-editor" className="btn-primary">Start for free</a>
                        <a href="/resources/how-it-works" className="btn-secondary">See how it works</a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
