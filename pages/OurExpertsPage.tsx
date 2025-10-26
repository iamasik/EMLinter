import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon } from '../components/Icons';

// Sub-component for the FAQ accordion item
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
                <div className="pb-5 px-2 text-gray-400 leading-relaxed prose">{a}</div>
            </div>
        </div>
    );
};

const FaqPage = () => {
    
    const faqs = [
        {
            q: "What is EMLinter?",
            a: <p>EMLinter is a comprehensive web-based toolkit designed for professionals who build and manage HTML emails. It includes a code validator (linter) to catch errors, a no-code visual editor (Vibe), a code formatter, a minifier, and specialized tools to ensure compatibility with tricky email clients like Microsoft Outlook.</p>
        },
        {
            q: "Who is this toolkit for?",
            a: <p>EMLinter is for everyone involved in the email creation process. It's perfect for marketers and content managers who need to edit templates without code, designers striving for pixel-perfect rendering, and developers who want a faster, error-free workflow. It's an ideal toolkit for individuals and teams alike.</p>
        },
        {
            q: "Is EMLinter free to use?",
            a: <p>Yes, all tools on EMLinter are currently free to use. We are supported by community contributions. If you find the tools helpful, please consider supporting the project.</p>
        },
        {
            q: "Is my code and data safe?",
            a: <p>Absolutely. EMLinter operates entirely within your browser. Your HTML code, templates, and any edits you make are processed locally on your computer. They are never sent to, or stored on, our servers, ensuring your data remains private and secure.</p>
        },
        {
            q: "What kind of errors does the linter find?",
            a: <p>Our <Link to="/code-fix" className="text-pink-400 hover:underline">HTML Email Linter</Link> is specifically designed to find issues common in email development. This includes unclosed or mismatched tags, missing attributes, broken image links, and CSS properties that are poorly supported in major email clients, especially different versions of Outlook.</p>
        },
        {
            q: "How do I make my template editable in the Visual Editor (Vibe)?",
            a: <p>It's simple! You just need to add specific CSS classes to your HTML elements. For example, add <code>vibe-section</code> to a <code>&lt;tr&gt;</code> to make it a movable/duplicatable section, <code>vibe-text</code> to an element containing text, and <code>vibe-img</code> to an <code>&lt;img&gt;</code> tag. We provide a full guide on our <Link to="/how-it-works" className="text-pink-400 hover:underline">How It Works</Link> page.</p>
        },
        {
            q: "Why are there special tools for Outlook?",
            a: <p>Microsoft Outlook uses Microsoft Word's rendering engine for emails, which has many quirks and poor support for modern HTML/CSS standards. Our <Link to="/outlook-button-generator" className="text-pink-400 hover:underline">Outlook Tools</Link> generate VML (Vector Markup Language) code, a Microsoft-specific language that provides a reliable fallback for things like rounded buttons and background images, ensuring they look great in all Outlook versions.</p>
        },
        {
            q: "Can I use the templates for commercial projects?",
            a: <p>Yes! All templates in our <Link to="/templates" className="text-pink-400 hover:underline">Template Library</Link> are free to download and use for both personal and commercial projects without attribution.</p>
        },
    ];

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
                "text": "EMLinter is a comprehensive web-based toolkit designed for professionals who build and manage HTML emails. It includes a code validator (linter) to catch errors, a no-code visual editor (Vibe), a code formatter, a minifier, and specialized tools to ensure compatibility with tricky email clients like Microsoft Outlook."
              }
            },
            {
              "@type": "Question",
              "name": "Who is this toolkit for?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "EMLinter is for everyone involved in the email creation process. It's perfect for marketers and content managers who need to edit templates without code, designers striving for pixel-perfect rendering, and developers who want a faster, error-free workflow. It's an ideal toolkit for individuals and teams alike."
              }
            },
            {
              "@type": "Question",
              "name": "Is my code and data safe?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. EMLinter operates entirely within your browser. Your HTML code, templates, and any edits you make are processed locally on your computer. They are never sent to, or stored on, our servers, ensuring your data remains private and secure."
              }
            },
             {
              "@type": "Question",
              "name": "What kind of errors does the linter find?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Our HTML Email Linter is specifically designed to find issues common in email development. This includes unclosed or mismatched tags, missing attributes, broken image links, and CSS properties that are poorly supported in major email clients, especially different versions of Outlook."
              }
            },
            {
              "@type": "Question",
              "name": "Can I use the templates for commercial projects?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! All templates in our Template Library are free to download and use for both personal and commercial projects without attribution."
              }
            }
          ]
        };
        
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'faq-schema-page';
        script.innerHTML = JSON.stringify(faqSchema);
        document.head.appendChild(script);
    
        return () => {
          const existingScript = document.getElementById('faq-schema-page');
          if (existingScript) {
            document.head.removeChild(existingScript);
          }
        };
    }, []);

    return (
        <>
            <title>FAQ - Frequently Asked Questions | EMLinter</title>
            <meta name="description" content="Find answers to common questions about our HTML email tools, including the linter, visual editor, templates, and security." />
            <link rel="canonical" href="https://emlinter.app/faq" />
            <div>
                <style>{`.prose p { margin-bottom: 1em; } .prose a { color: #f472b6; } .prose a:hover { text-decoration: underline; } .prose code { background-color: #374151; padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-size: 0.9em; }`}</style>
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 pb-2">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
                        Find answers to common questions about our tools and services.
                    </p>
                </header>
                
                <div className="max-w-4xl mx-auto bg-gray-800/50 rounded-xl p-4 md:p-8 border border-gray-700">
                    {faqs.map((faq, index) => <FaqItem key={index} q={faq.q} a={faq.a} />)}
                </div>
            </div>
        </>
    );
};

export default FaqPage;