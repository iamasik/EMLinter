import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircleIcon, ChevronDownIcon, WandIcon, CodeIcon, TemplateIcon, CursorClickIcon, UsersIcon, BookOpenIcon } from '../components/Icons';

// Sub-component for the FAQ accordion item
// Fix: Changed FaqItem to be of type React.FC to correctly handle the 'key' prop when used in a list.
const FaqItem: React.FC<{ q: string, a: React.ReactNode }> = ({ q, a }) => {
    const [isOpen, setIsOpen] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    return (
        <div className="border-b border-gray-700/50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left py-5 px-2"
            >
                <span className="text-lg font-medium text-gray-100">{q}</span>
                <ChevronDownIcon className={`w-6 h-6 text-gray-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
                ref={contentRef}
                className="overflow-hidden transition-[max-height] duration-500 ease-in-out"
                style={{ maxHeight: isOpen ? `${contentRef.current?.scrollHeight}px` : '0px' }}
            >
                <div className="pb-5 px-2 text-gray-400 leading-relaxed">{a}</div>
            </div>
        </div>
    );
};


const HomePage = () => {
    const navigate = useNavigate();
    
    const faqs = [
        {
            q: "What is EMLinter?",
            a: "EMLinter is a comprehensive web-based toolkit for professionals who build and manage HTML emails. It includes a code validator (linter), a visual editor, a code formatter, and specialized tools for ensuring compatibility with tricky email clients like Microsoft Outlook."
        },
        {
            q: "Who is this toolkit for?",
            a: "EMLinter is for everyone involved in creating emails. It's perfect for marketers and content managers who need to edit templates without code, designers striving for pixel-perfect rendering, and developers who want a faster, error-free workflow. It's the ideal toolkit for individuals and teams alike."
        },
        {
            q: "Is my code and data safe?",
            a: <p>Absolutely. EMLinter operates entirely within your browser. Your HTML code, templates, and any edits are processed on your computer and are never sent to or stored on our servers, ensuring your data remains private.</p>
        },
        {
            q: "Do you offer pre-made email templates?",
            a: <p>Yes! We have a growing <Link to="/templates" className="text-pink-400 hover:underline">Template Library</Link> of professionally designed, responsive HTML email templates. They are fully compatible with our tools and ready to be customized for your next campaign.</p>
        },
        {
            q: "How do I make my template editable in the Visual Editor?",
            a: <p>It's simple! You just need to add specific CSS classes like <code>vibe-section</code>, <code>vibe-text</code>, and <code>vibe-img</code> to your HTML elements. We provide a full guide on how to prepare your templates. Visit our <Link to="/how-it-works" className="text-pink-400 hover:underline">How It Works</Link> page for a detailed walkthrough.</p>
        }
    ];
    
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-enter');
                }
            });
        }, { threshold: 0.1 });

        const elements = document.querySelectorAll('.animate-on-scroll');
        elements.forEach(el => observer.observe(el));

        return () => elements.forEach(el => observer.unobserve(el));
    }, []);

    useEffect(() => {
        const faqSchema = {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What is EMLinter?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "EMLinter is a comprehensive web-based toolkit for professionals who build and manage HTML emails. It includes a code validator (linter), a visual editor, a code formatter, and specialized tools for ensuring compatibility with tricky email clients like Microsoft Outlook."
              }
            },
            {
              "@type": "Question",
              "name": "Who is this toolkit for?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "EMLinter is for everyone involved in creating emails. It's perfect for marketers and content managers who need to edit templates without code, designers striving for pixel-perfect rendering, and developers who want a faster, error-free workflow. It's the ideal toolkit for individuals and teams alike."
              }
            },
            {
              "@type": "Question",
              "name": "Is my code and data safe?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. EMLinter operates entirely within your browser. Your HTML code, templates, and any edits are processed on your computer and are never sent to or stored on our servers, ensuring your data remains private."
              }
            },
            {
              "@type": "Question",
              "name": "Do you offer pre-made email templates?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! We have a growing Template Library of professionally designed, responsive HTML email templates. They are fully compatible with our tools and ready to be customized for your next campaign."
              }
            },
            {
              "@type": "Question",
              "name": "How do I make my template editable in the Visual Editor?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "It's simple! You just need to add specific CSS classes like vibe-section, vibe-text, and vibe-img to your HTML elements. We provide a full guide on how to prepare your templates. Visit our How It Works page for a detailed walkthrough."
              }
            }
          ]
        };
        
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'faq-schema';
        script.innerHTML = JSON.stringify(faqSchema);
        document.head.appendChild(script);
    
        return () => {
          const existingScript = document.getElementById('faq-schema');
          if (existingScript) {
            document.head.removeChild(existingScript);
          }
        };
    }, []); // Run only once on mount

    return (
        <>
            <title>EMLinter - The Ultimate Toolkit for HTML Email Development</title>
            <meta name="description" content="Validate, visually edit, and build flawless responsive HTML emails with our intelligent linter, no-code editor, Outlook compatibility tools, and free template library." />
            <link rel="canonical" href="https://emlinter.app/" />
            <div className="space-y-24 md:space-y-32">
                <style>{`
                    @keyframes gradient-pan {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                    .animated-gradient-text {
                        background: linear-gradient(90deg, #ec4899, #8b5cf6, #ec4899);
                        background-size: 200% 200%;
                        animation: gradient-pan 4s ease infinite;
                        -webkit-background-clip: text;
                        background-clip: text;
                        -webkit-text-fill-color: transparent;
                    }
                    .animated-bg {
                        background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, rgba(18, 18, 27, 0) 60%);
                    }
                    .animate-on-scroll {
                        opacity: 0;
                        transform: translateY(30px);
                        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
                    }
                    .animate-enter {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    .delay-1 { transition-delay: 0.1s; } .delay-2 { transition-delay: 0.2s; } .delay-3 { transition-delay: 0.3s; }
                     .feature-card {
                        background-color: rgba(30, 41, 59, 0.5); /* bg-slate-800/50 */
                        border: 1px solid rgba(51, 65, 85, 0.5); /* border-slate-700/50 */
                        transition: all 0.3s ease;
                     }
                    .feature-card:hover {
                        transform: translateY(-8px);
                        background-color: rgba(30, 41, 59, 1); /* bg-slate-800 */
                        border-color: rgba(139, 92, 246, 0.5); /* border-violet-500/50 */
                    }
                `}</style>

                {/* Hero Section */}
                <section className="text-center py-16 md:py-24 relative">
                    <div className="absolute inset-0 animated-bg -z-10"></div>
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold animated-gradient-text mb-6 animate-on-scroll pb-4">
                        The Ultimate Toolkit for HTML Email Development
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 max-w-4xl mx-auto mb-10 animate-on-scroll delay-1">
                        Validate, visually edit, and build flawless responsive HTML emails with our intelligent linter, no-code editor, Outlook compatibility tools, and free template library.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 animate-on-scroll delay-2">
                        <button onClick={() => navigate('/visual-editor')} className="px-8 py-3 font-semibold text-white bg-gradient-to-r from-pink-600 to-violet-600 rounded-lg hover:from-pink-700 hover:to-violet-700 transform hover:scale-105 transition-transform duration-200 shadow-lg">
                            Get Started for Free
                        </button>
                        <button onClick={() => navigate('/templates')} className="px-8 py-3 font-semibold text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200">
                            Browse Templates
                        </button>
                    </div>
                </section>
                
                {/* Features Section */}
                <section className="space-y-16">
                    <div className="text-center animate-on-scroll">
                        <h2 className="text-4xl font-bold text-gray-100">The All-in-One Email Toolkit</h2>
                        <p className="text-lg text-gray-400 mt-3 max-w-2xl mx-auto">
                            Everything you need to streamline your email workflow, from code to campaign.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1: Intelligent Linter */}
                        <div className="feature-card p-8 rounded-xl animate-on-scroll delay-1">
                            <div className="bg-pink-900/50 text-pink-400 p-3 rounded-lg inline-block mb-4"><CheckCircleIcon className="w-7 h-7"/></div>
                            <h3 className="text-2xl font-bold mb-3">Intelligent Linter</h3>
                            <p className="text-gray-400 mb-4">Catch client-specific bugs, unclosed tags, and CSS errors before they cause rendering nightmares in Outlook and other clients.</p>
                            <button onClick={() => navigate('/code-fix')} className="font-semibold text-pink-400 hover:text-pink-300 transition-colors">Validate Your Email &rarr;</button>
                        </div>
                        {/* Feature 2: Visual Editor */}
                        <div className="feature-card p-8 rounded-xl animate-on-scroll delay-2">
                            <div className="bg-violet-900/50 text-violet-400 p-3 rounded-lg inline-block mb-4"><CursorClickIcon className="w-7 h-7"/></div>
                            <h3 className="text-2xl font-bold mb-3">No-Code Visual Editor</h3>
                            <p className="text-gray-400 mb-4">Empower marketers and content creators to edit text, swap images, and update links on coded templates without writing a single line of code.</p>
                            <button onClick={() => navigate('/visual-editor')} className="font-semibold text-violet-400 hover:text-violet-300 transition-colors">Launch the Editor &rarr;</button>
                        </div>
                         {/* Feature 3: Template Library */}
                        <div className="feature-card p-8 rounded-xl animate-on-scroll delay-3">
                            <div className="bg-cyan-900/50 text-cyan-400 p-3 rounded-lg inline-block mb-4"><TemplateIcon className="w-7 h-7"/></div>
                            <h3 className="text-2xl font-bold mb-3">Template Library</h3>
                            <p className="text-gray-400 mb-4">Kickstart your next campaign with professionally designed, fully responsive, and Vibe-compatible HTML email templates.</p>
                            <button onClick={() => navigate('/templates')} className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">Browse Templates &rarr;</button>
                        </div>
                         {/* Feature 4: Outlook Toolkit */}
                        <div className="feature-card p-8 rounded-xl animate-on-scroll delay-1">
                            <div className="bg-green-900/50 text-green-400 p-3 rounded-lg inline-block mb-4"><UsersIcon className="w-7 h-7"/></div>
                            <h3 className="text-2xl font-bold mb-3">Outlook Toolkit</h3>
                            <p className="text-gray-400 mb-4">Generate bulletproof VML buttons and backgrounds, and sanitize your HTML to fix common spacing issues in every version of Outlook.</p>
                            <button onClick={() => navigate('/outlook-button-generator')} className="font-semibold text-green-400 hover:text-green-300 transition-colors">Explore Outlook Tools &rarr;</button>
                        </div>
                         {/* Feature 5: Code Beautifier */}
                        <div className="feature-card p-8 rounded-xl animate-on-scroll delay-2">
                            <div className="bg-yellow-900/50 text-yellow-400 p-3 rounded-lg inline-block mb-4"><WandIcon className="w-7 h-7"/></div>
                            <h3 className="text-2xl font-bold mb-3">Code Beautifier</h3>
                            <p className="text-gray-400 mb-4">Instantly transform messy or minified HTML into a perfectly indented, easy-to-read structure for painless debugging.</p>
                            <button onClick={() => navigate('/beautify-code')} className="font-semibold text-yellow-400 hover:text-yellow-300 transition-colors">Beautify My Code &rarr;</button>
                        </div>
                         {/* Feature 6: Privacy First */}
                        <div className="feature-card p-8 rounded-xl animate-on-scroll delay-3">
                            <div className="bg-gray-700/50 text-gray-300 p-3 rounded-lg inline-block mb-4"><CodeIcon className="w-7 h-7"/></div>
                            <h3 className="text-2xl font-bold mb-3">Privacy First</h3>
                            <p className="text-gray-400 mb-4">EMLinter operates entirely in your browser. Your code and templates are never sent to our servers, ensuring your data remains yours.</p>
                            <button onClick={() => navigate('/how-it-works')} className="font-semibold text-gray-300 hover:text-white transition-colors">Learn More &rarr;</button>
                        </div>
                    </div>
                </section>
                
                {/* FAQ Section */}
                <section className="max-w-4xl mx-auto animate-on-scroll">
                     <div className="text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-100">Frequently Asked Questions</h2>
                     </div>
                     <div className="mt-8">
                         {faqs.map((faq, index) => <FaqItem key={index} q={faq.q} a={faq.a} />)}
                     </div>
                </section>

                {/* How It Works Section */}
                <section className="max-w-4xl mx-auto text-center animate-on-scroll">
                    <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-10 md:p-16 relative overflow-hidden">
                        <div className="absolute -top-16 -right-16 w-48 h-48 text-violet-900/50">
                            <BookOpenIcon />
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">
                                Curious How It All Works?
                            </h2>
                            <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                                From preparing your templates for our Visual Editor to mastering the Outlook toolkit, our step-by-step video guides will walk you through everything you need to know.
                            </p>
                            <button onClick={() => navigate('/how-it-works')} className="px-8 py-3 font-semibold text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200">
                                Watch the Guides
                            </button>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-20 text-center animate-on-scroll">
                    <h2 className="text-4xl font-bold mb-4">Ready to Build Better Emails?</h2>
                    <p className="text-gray-400 max-w-xl mx-auto mb-8">
                        Stop the guesswork and start shipping perfect emails. Dive into the toolkit and experience a smarter, faster workflow today.
                    </p>
                    <button onClick={() => navigate('/visual-editor')} className="px-10 py-4 font-semibold text-lg text-white bg-gradient-to-r from-pink-600 to-violet-600 rounded-lg hover:from-pink-700 hover:to-violet-700 transform hover:scale-105 transition-transform duration-200 shadow-lg">
                        Start for Free
                    </button>
                </section>
            </div>
        </>
    );
};

export default HomePage;