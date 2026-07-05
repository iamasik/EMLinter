import React, { useState } from 'react';
import { MailIcon } from '../Icons';
import NewsletterModal from '../modals/NewsletterModal';
import PolicyModal from '../modals/PolicyModal';
import ActionInfoModal from '../modals/ActionInfoModal';

const PrivacyPolicyContent = () => (
    <>
        <h3>Last Updated: June 28, 2026</h3>
        <p>EMLinter ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we handle information in connection with the EMLinter website (the "Service").</p>
        <h3>1. Information Collection and Use</h3>
        <p>Our Service is designed to function almost entirely within your browser. We do not have a backend server to collect or store your personal data.</p>
        <ul>
            <li><strong>HTML Code:</strong> Any HTML code you paste, upload, or edit using our tools (like the Linter, Beautifier, or Visual Editor) is processed locally in your browser. It is never sent to or stored on our servers.</li>
            <li><strong>Newsletter Subscription:</strong> If you choose to subscribe to our newsletter, you will provide your first name and email address. This information is collected and managed by our third-party email marketing provider, Mailchimp, and is subject to their privacy policy.</li>
            <li><strong>Image URLs:</strong> The Visual Editor allows you to change image sources by providing a URL. If you use images hosted by third-party services, you are responsible for the content.</li>
        </ul>
        <h3>2. Local Storage</h3>
        <p>To enhance your experience, the Visual Editor saves your email template content to your browser's <code>localStorage</code>. This data is stored only on your computer and is not accessible by us.</p>
        <h3>3. Third-Party Services</h3>
        <ul>
            <li><strong>Mailchimp:</strong> For newsletter management.</li>
            <li><strong>Firebase / Firestore:</strong> Used read-only to serve template metadata, blog posts, and app settings.</li>
        </ul>
        <h3>4. Changes to This Privacy Policy</h3>
        <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
        <h3>5. Contact Us</h3>
        <p>If you have any questions about this Privacy Policy, please get in touch via our <a href="/contact-us">Contact Us</a> page.</p>
    </>
);

const CookiePolicyContent = () => (
    <>
        <h3>Last Updated: June 28, 2026</h3>
        <h3>What Are Cookies?</h3>
        <p>Cookies are small text files stored on your device when you visit a website. They are used to make websites work more efficiently and to provide information to the site owners.</p>
        <h3>Our Use of Cookies and Similar Technologies</h3>
        <p>EMLinter uses modern web technologies to provide functionality with minimal use of traditional cookies.</p>
        <ul>
            <li><strong>Strictly Necessary - <code>localStorage</code>:</strong> We use your browser's <code>localStorage</code> for essential functionality. The Visual Editor uses it to save your template progress directly on your device. This is not sent to a server.</li>
            <li><strong>Third-Party Cookies:</strong> Some third-party services (Mailchimp, Firebase) may set cookies. We do not control those cookies.</li>
        </ul>
        <h3>Managing Your Data</h3>
        <p>You can clear your browser's <code>localStorage</code> at any time through your browser settings.</p>
    </>
);

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
    const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
    const [policyData, setPolicyData] = useState<{ title: string; content: React.ReactNode | null }>({ title: '', content: null });
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);

    const handleOpenPolicy = (type: 'privacy' | 'cookie') => {
        setPolicyData(
            type === 'privacy'
                ? { title: 'Privacy Policy', content: <PrivacyPolicyContent /> }
                : { title: 'Cookie Policy', content: <CookiePolicyContent /> }
        );
        setIsPolicyModalOpen(true);
    };

    return (
        <>
            <NewsletterModal isOpen={isNewsletterModalOpen} onClose={() => setIsNewsletterModalOpen(false)} />
            <PolicyModal isOpen={isPolicyModalOpen} onClose={() => setIsPolicyModalOpen(false)} title={policyData.title}>
                {policyData.content}
            </PolicyModal>
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
                        <div className="flex items-center gap-5">
                            <button onClick={() => handleOpenPolicy('privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
                            <button onClick={() => handleOpenPolicy('cookie')} className="hover:text-white transition-colors">Cookie Policy</button>
                            <a href="/contact-us" className="hover:text-white transition-colors">Contact</a>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Footer;
