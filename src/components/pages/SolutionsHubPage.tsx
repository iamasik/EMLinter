import React from 'react';
import { LitmusIcon, CursorClickIcon, ImageIcon, CheckCircleIcon } from '../Icons';
import PageHero from '../PageHero';
import SeoFaq from '../SeoFaq';

const solutions = [
    {
        id: 'outlook-button-generator',
        label: 'Bulletproof Button Generator',
        description: 'Generate VML email buttons that render in every Outlook version — including the Word-based renderer that breaks border-radius and padding.',
        icon: CursorClickIcon,
        tone: 'from-pink-500/20 to-pink-500/5 text-pink-300 ring-pink-400/20',
    },
    {
        id: 'outlook-background-generator',
        label: 'Outlook Background Generator',
        description: 'Build bulletproof Outlook background images with VML fallback so hero banners look identical in Outlook, Gmail, and Apple Mail.',
        icon: ImageIcon,
        tone: 'from-violet-500/20 to-violet-500/5 text-violet-300 ring-violet-400/20',
    },
    {
        id: 'outlook-ready-html',
        label: 'Outlook HTML Sanitizer',
        description: 'Fix the most common Outlook rendering issues: collapsing margins, ghost spacing, divider lines, and font fallbacks — in one click.',
        icon: CheckCircleIcon,
        tone: 'from-emerald-500/20 to-emerald-500/5 text-emerald-300 ring-emerald-400/20',
    },
    {
        id: 'html-email-test',
        label: 'HTML Email Test',
        description: 'Send a real test email straight to your own inbox to preview how Gmail, Outlook, and Apple Mail will actually render your campaign.',
        icon: LitmusIcon,
        tone: 'from-sky-500/20 to-sky-500/5 text-sky-300 ring-sky-400/20',
    },
];

const faqs = [
    {
        question: 'Why do I need bulletproof Outlook code?',
        answer: 'Microsoft Outlook for Windows (2007–2024) uses the Microsoft Word rendering engine instead of a real browser engine. That means CSS3 properties like border-radius, background-image, padding on <a> tags, and modern fonts are silently ignored. Bulletproof code uses VML — Microsoft\'s legacy XML format — as a conditional fallback so the design still renders pixel-perfect.',
    },
    {
        question: 'What is VML and is it still relevant in 2026?',
        answer: 'VML (Vector Markup Language) is a Microsoft-specific XML language for vector graphics. It is wrapped in <!--[if gte mso 9]> conditional comments so only Outlook reads it; every other client ignores the block entirely. Yes — it is still the only reliable way to get rounded-corner buttons and full-bleed hero backgrounds in Outlook for Windows, and that engine is not going away soon.',
    },
    {
        question: 'Will bulletproof code make my email heavier?',
        answer: 'Slightly — usually under 200 bytes per VML block. That is well worth it given Outlook still represents 8–15% of B2B email opens. Use the EMLinter HTML Email Minifier to strip whitespace afterward and you will reclaim most of the added size.',
    },
    {
        question: 'Do these solutions work in Outlook on Mac and Outlook.com?',
        answer: 'Outlook for Mac and Outlook.com use a WebKit-based engine and render modern CSS fine, so the VML fallback is invisible there. Our generators produce code that degrades cleanly: modern clients use the CSS path, Outlook for Windows uses the VML path. You ship one HTML file that works everywhere.',
    },
    {
        question: 'Can I preview my Outlook fixes without installing Windows?',
        answer: 'Send a real test email to an Outlook.com address using our HTML Email Test tool, then preview it in the Outlook.com web client. For Outlook for Windows specifically, you need a Windows machine, a VM, or a paid service like Litmus or Email on Acid — there is no free way to simulate the Word renderer.',
    },
    {
        question: 'Is the visual editor ESP-compatible (Mailchimp, Klaviyo, HubSpot)?',
        answer: 'Yes. Edit your template in our Visual Editor or fix it with our Outlook solutions, then copy the HTML and paste it directly into Mailchimp, Klaviyo, HubSpot, Campaign Monitor, Salesforce Marketing Cloud, ActiveCampaign, Brevo, or any other ESP that accepts custom HTML.',
    },
];

const SolutionsHubPage: React.FC = () => (
    <div>
        <PageHero
            eyebrow="Email Compatibility Solutions"
            title={
                <>
                    Bulletproof <span className="gradient-text">Outlook fixes</span> for the email clients that refuse to play nice.
                </>
            }
            subtitle="Outlook for Windows still uses Microsoft Word as its rendering engine. Our solutions generate VML fallback code so your buttons, backgrounds, and layouts render identically — in Outlook, Gmail, Apple Mail, and everywhere else."
        >
            <a href="/solutions/outlook-button-generator" className="btn-primary">Generate a button</a>
            <a href="/solutions/outlook-background-generator" className="btn-secondary">Generate a background</a>
        </PageHero>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-20">
            {solutions.map(({ id, label, description, icon: Icon, tone }) => (
                <a
                    key={id}
                    href={`/solutions/${id}`}
                    className="group card p-7 hover:border-white/20 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                >
                    <div className={`absolute -top-12 -right-12 w-44 h-44 rounded-full bg-gradient-to-br ${tone} opacity-60 blur-2xl group-hover:opacity-90 transition-opacity`} />
                    <div className={`relative inline-flex p-3 rounded-xl bg-gradient-to-br ${tone} ring-1 mb-5`}>
                        <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="relative text-xl font-display font-bold text-white mb-2">{label}</h3>
                    <p className="relative text-sm text-ink-300 leading-relaxed">{description}</p>
                    <span className="relative inline-flex items-center gap-1 text-sm font-medium text-brand-300 mt-5 group-hover:text-brand-200">
                        Open solution
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </span>
                </a>
            ))}
        </section>

        <section className="card p-8 md:p-12 max-w-5xl mx-auto mb-12">
            <h2 className="section-title mb-5">What "bulletproof" actually means in email</h2>
            <div className="text-ink-300 leading-relaxed space-y-4 text-sm md:text-base">
                <p>
                    "Bulletproof" is the industry term for an email element that renders identically across every major client without relying on optional CSS. A bulletproof button degrades gracefully — modern clients use CSS, Outlook for Windows falls back to VML, plain-text clients see clean anchor text. No broken padding. No missing hero image. No CTA that disappears in Outlook.
                </p>
                <p>
                    EMLinter's solutions generate the bulletproof code for you. Pick the element you need — button, background, sanitizer — fill in the inputs, and copy the output. No VML syntax to memorize, no Outlook conditional comments to hand-roll.
                </p>
            </div>
        </section>

        <SeoFaq title="Outlook & Email Compatibility FAQs" items={faqs} />
    </div>
);

export default SolutionsHubPage;
