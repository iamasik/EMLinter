import React, { useState } from 'react';
import { MailIcon } from '../Icons';
import NewsletterModal from '../modals/NewsletterModal';
import ActionInfoModal from '../modals/ActionInfoModal';

// Privacy & Cookie policy copy now lives as crawlable static Astro pages
// (/privacy-policy, /cookie-policy, /terms) — linked below — instead of modals.

const navColumns = [
    {
        title: 'Tools',
        links: [
            { href: '/tools/code-fix', label: 'HTML Email Linter' },
            { href: '/tools/beautify-code', label: 'HTML Beautifier' },
            { href: '/tools/html-minifier', label: 'HTML Email Minifier' },
            { href: '/tools/dark-mode-checker', label: 'Dark Mode Tester' },
            { href: '/tools/design-copier', label: 'Design Copier' },
            { href: '/tools/svg-to-png', label: 'SVG to PNG' },
            { href: '/tools/relative-image-scaler', label: 'Relative Image Scaler' },
            { href: '/tools/html-to-image', label: 'HTML to Image' },
        ],
    },
    {
        title: 'Solutions',
        links: [
            { href: '/solutions/outlook-button-generator', label: 'Bulletproof Buttons' },
            { href: '/solutions/outlook-background-generator', label: 'Outlook Backgrounds' },
            { href: '/solutions/outlook-ready-html', label: 'Outlook Sanitizer' },
            { href: '/solutions/html-email-test', label: 'HTML Email Test' },
            { href: '/visual-editor', label: 'Visual Editor' },
        ],
    },
    {
        title: 'Resources',
        links: [
            { href: '/templates', label: 'Email Templates' },
            { href: '/resources/blog', label: 'Blog' },
            { href: '/resources/products', label: 'Products' },
            { href: '/resources/how-it-works', label: 'How It Works' },
            { href: '/resources/faq', label: 'FAQ' },
            { href: '/contact-us', label: 'Contact' },
        ],
    },
] as const;

const Footer: React.FC = () => {
    const [isNewsletterModalOpen, setIsNewsletterModalOpen] = useState(false);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);

    return (
        <>
            <NewsletterModal isOpen={isNewsletterModalOpen} onClose={() => setIsNewsletterModalOpen(false)} />
            <ActionInfoModal isOpen={isActionModalOpen} onClose={() => setIsActionModalOpen(false)} actionType="hireMe" />

            <footer className="mt-24 border-t border-white/5 bg-ink-950/80">
                <div className="container-wide py-14">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                        <div className="md:col-span-4">
                            <a href="/" className="flex items-center mb-4" aria-label="EMLinter — home">
                                <img src="/logo.svg" alt="EMLinter" width={820} height={200} className="h-9 w-auto" />
                            </a>
                            <p className="text-sm text-ink-300 mb-4 max-w-sm">
                                The complete HTML email developer toolkit. Free linter, visual editor, dark-mode tester, and bulletproof Outlook generators — built for marketers, designers, and developers who ship pixel-perfect emails.
                            </p>
                            <div className="flex items-center gap-3 mb-6">
                                <button
                                    onClick={() => setIsNewsletterModalOpen(true)}
                                    className="btn-primary text-sm py-2 px-4"
                                >
                                    <MailIcon className="w-4 h-4" /> Subscribe
                                </button>
                                <button onClick={() => setIsActionModalOpen(true)} className="btn-secondary text-sm py-2 px-4">
                                    Hire Me
                                </button>
                            </div>
                            {/* Social profile links removed until real, verified EMLinter
                                profiles exist — placeholder links to platform homepages hurt
                                brand/entity signals and send link equity nowhere useful. */}
                        </div>

                        <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
                            {navColumns.map((col) => (
                                <div key={col.title}>
                                    <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">{col.title}</h3>
                                    <ul className="space-y-2">
                                        {col.links.map((link) => (
                                            <li key={link.href}>
                                                <a href={link.href} className="text-sm text-ink-300 hover:text-brand-400 transition-colors">
                                                    {link.label}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-ink-400">
                        <p>&copy; {new Date().getFullYear()} EMLinter. All rights reserved.</p>
                        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                            <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</a>
                            <a href="/terms" className="hover:text-white transition-colors">Terms</a>
                            <a href="/contact-us" className="hover:text-white transition-colors">Contact</a>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Footer;
