// FIX: Imported 'useEffect' from 'react' to resolve 'Cannot find name' error.
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MailIcon, FacebookIcon, TwitterIcon, InstagramIcon, YoutubeIcon } from '../Icons';
import NewsletterModal from '../modals/NewsletterModal';
import PolicyModal from '../modals/PolicyModal';
import ActionInfoModal from '../modals/ActionInfoModal';

const PrivacyPolicyContent = () => (
    <>
        <h3>Last Updated: July 24, 2024</h3>

        <p>EMLinter ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we handle information in connection with the EMLinter website (the "Service").</p>

        <h3>1. Information Collection and Use</h3>
        <p>Our Service is designed to function almost entirely within your browser. We do not have a backend server to collect or store your personal data.</p>
        <ul>
            <li><strong>HTML Code:</strong> Any HTML code you paste, upload, or edit using our tools (like the Linter, Beautifier, or Visual Editor) is processed locally in your browser. It is never sent to or stored on our servers.</li>
            <li><strong>Newsletter Subscription:</strong> If you choose to subscribe to our newsletter, you will provide your first name and email address. This information is collected and managed by our third-party email marketing provider, Mailchimp, and is subject to their privacy policy. We only use this information to send you updates and marketing communications you have opted into.</li>
            <li><strong>Image URLs:</strong> The Visual Editor (Vibe) allows you to change image sources by providing a URL. If you use images hosted by third-party services, you are responsible for the content. We recommend reviewing the terms and privacy policies of any image hosting service you use.</li>
        </ul>
        
        <h3>2. Local Storage</h3>
        <p>To enhance your experience, the Visual Editor saves your email template content to your browser's <code>localStorage</code>. This allows you to close your browser and resume your work later. This data is stored only on your computer and is not accessible by us.</p>
        
        <h3>3. Third-Party Services</h3>
        <p>We use the following third-party services:</p>
        <ul>
            <li><strong>Mailchimp:</strong> For newsletter management.</li>
        </ul>
        <p>These services have their own privacy policies, and we encourage you to review them.</p>

        <h3>4. Changes to This Privacy Policy</h3>
        <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>

        <h3>5. Contact Us</h3>
        <p>If you have any questions about this Privacy Policy, please get in touch via our <Link to="/contact-us" className="text-pink-400 hover:underline">Contact Us</Link> page.</p>
    </>
);

const CookiePolicyContent = () => (
     <>
        <h3>Last Updated: July 24, 2024</h3>

        <h3>What Are Cookies?</h3>
        <p>Cookies are small text files stored on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the site owners.</p>

        <h3>Our Use of Cookies and Similar Technologies</h3>
        <p>EMLinter uses modern web technologies to provide functionality with minimal use of traditional cookies.</p>
        <ul>
            <li><strong>Strictly Necessary - <code>localStorage</code>:</strong> We do not use traditional cookies for tracking or analytics. However, we use your browser's <code>localStorage</code>, which is a similar technology, for essential functionality. The Visual Editor (Vibe) uses <code>localStorage</code> to save your template progress directly on your device. This is not a cookie, it is not sent to a server, and it is crucial for the auto-save feature to work. Without it, you would lose your work when you close the browser tab.</li>
            <li><strong>Third-Party Cookies:</strong> Some third-party services we use may set cookies. For example, if you interact with the Mailchimp newsletter subscription form, Mailchimp may set cookies to manage the subscription process. We do not have control over these cookies.</li>
        </ul>

        <h3>Managing Your Data</h3>
        <p>You can control and manage your data in the following ways:</p>
        <ul>
            <li><strong>Clearing <code>localStorage</code>:</strong> You can clear your browser's <code>localStorage</code> at any time through your browser settings. This will remove any templates saved in the Visual Editor. The "Clear" button within the Visual Editor also performs this action for our specific data.</li>
            <li><strong>Managing Cookies:</strong> Most web browsers allow you to control cookies through their settings. You can set your browser to block cookies or to alert you when cookies are being sent.</li>
        </ul>
     </>
);

const Footer: React.FC = () => {
    const [isNewsletterModalOpen, setIsNewsletterModalOpen] = useState(false);
    const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
    const [policyData, setPolicyData] = useState<{ title: string; content: React.ReactNode | null }>({ title: '', content: null });
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    
    const handleOpenPolicy = (type: 'privacy' | 'cookie') => {
        if (type === 'privacy') {
            setPolicyData({ title: 'Privacy Policy', content: <PrivacyPolicyContent /> });
        } else {
            setPolicyData({ title: 'Cookie Policy', content: <CookiePolicyContent /> });
        }
        setIsPolicyModalOpen(true);
    };

    return (
        <>
            <NewsletterModal isOpen={isNewsletterModalOpen} onClose={() => setIsNewsletterModalOpen(false)} />
            <PolicyModal isOpen={isPolicyModalOpen} onClose={() => setIsPolicyModalOpen(false)} title={policyData.title}>
                {policyData.content}
            </PolicyModal>
            <ActionInfoModal
                isOpen={isActionModalOpen}
                onClose={() => setIsActionModalOpen(false)}
                actionType="hireMe"
            />
            <footer className="bg-gray-900 border-t border-gray-700/50">
                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1">
                            <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-pink-500 mb-4 inline-block">
                                EMLinter
                            </Link>
                            <p className="text-sm text-gray-400 mb-2">This website is an official EMLinter product.</p>
                            <p className="text-xs text-gray-500 mb-4">This tool is for educational and development purposes. Automated scraping or misuse of the AI service is strictly prohibited.</p>
                            <p className="text-xs text-gray-500 mb-4">
                                <strong className="text-gray-400">Privacy Notice:</strong> This website operates locally in your browser and does not store your data. Images uploaded via the Visual Editor use a third-party service; you are responsible for any uploaded content.
                            </p>
                            <button 
                                onClick={() => setIsActionModalOpen(true)}
                                className="text-pink-400 hover:text-pink-300 font-semibold transition-colors duration-200"
                            >
                                Hire Me &rarr;
                            </button>
                        </div>
                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div>
                                <div className="mb-8">
                                    <h3 className="font-semibold text-gray-200 mb-4">Legal</h3>
                                    <ul className="space-y-2">
                                        <li><button onClick={() => handleOpenPolicy('privacy')} className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</button></li>
                                        <li><button onClick={() => handleOpenPolicy('cookie')} className="text-sm text-gray-400 hover:text-white transition-colors">Cookie Policy</button></li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-200 mb-4">Follow Us</h3>
                                    <div className="flex items-center space-x-4">
                                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                            <FacebookIcon className="w-6 h-6" />
                                        </a>
                                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                            <TwitterIcon className="w-6 h-6" />
                                        </a>
                                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                            <InstagramIcon className="w-6 h-6" />
                                        </a>
                                        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                            <YoutubeIcon className="w-6 h-6" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div className="sm:col-span-1">
                                <h3 className="font-semibold text-gray-200 mb-4">Get Email Insights</h3>
                                <p className="text-sm text-gray-400 mb-4">Join our newsletter for tips, updates, and exclusive content on email development.</p>
                                <button
                                    onClick={() => setIsNewsletterModalOpen(true)}
                                    className="w-full sm:w-auto px-5 py-2.5 font-semibold text-white bg-gradient-to-r from-pink-600 to-violet-600 rounded-lg hover:from-pink-700 hover:to-violet-700 transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    <MailIcon className="w-5 h-5" />
                                    <span>Subscribe Now</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-gray-700/50 text-center text-sm text-gray-500">
                        <p>&copy; {new Date().getFullYear()} EMLinter. All Rights Reserved.</p>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Footer;