import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CoffeeIcon, MenuIcon, CloseIcon, WandIcon, ImageIcon, CheckCircleIcon, BookOpenIcon, NewspaperIcon, MailIcon, CursorClickIcon, UsersIcon, CodeIcon, MoonIcon, QuestionMarkCircleIcon } from '../Icons';
import ActionInfoModal from '../modals/ActionInfoModal';

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const dropdownTimeoutRef = useRef<number | null>(null);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const location = useLocation();
    const activePage = location.pathname;

    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);
    
    useEffect(() => {
        // Close menu on route change
        setIsMenuOpen(false);
        setOpenDropdown(null);
    }, [activePage]);


    const handleDropdownEnter = (page: string) => {
        if (dropdownTimeoutRef.current) {
            clearTimeout(dropdownTimeoutRef.current);
            dropdownTimeoutRef.current = null;
        }
        setOpenDropdown(page);
    };

    const handleDropdownLeave = () => {
        dropdownTimeoutRef.current = window.setTimeout(() => {
            setOpenDropdown(null);
        }, 300); // Increased delay to prevent accidental closing
    };
    
    const navLinks = [
        { page: '/', label: 'Home' },
        { page: '/templates', label: 'Templates' },
        { page: '/visual-editor', label: 'Visual Editor' },
        { page: '/code-fix', label: 'Code Fix' },
        { 
          page: 'tools', 
          label: 'Tools', 
          children: [
            { page: '/beautify-code', label: 'Beautifier', description: 'Format and clean your HTML code.', icon: <WandIcon className="w-5 h-5"/> },
            { page: '/dark-mode-checker', label: 'Dark Mode Checker', description: 'Simulate how your email looks in dark mode.', icon: <MoonIcon className="w-5 h-5"/> },
            { page: '/design-copier', label: 'Design Copier', description: 'Copy the visual design of an email.', icon: <CursorClickIcon className="w-5 h-5"/> },
            { page: '/html-minifier', label: 'HTML Minifier', description: 'Compress HTML to reduce file size.', icon: <CodeIcon className="w-5 h-5"/> },
            { page: '/outlook-background-generator', label: 'Outlook Background', description: 'Generate VML background images.', icon: <ImageIcon className="w-5 h-5"/> },
            { page: '/outlook-button-generator', label: 'Outlook Button Generator', description: 'Create bulletproof VML buttons.', icon: <CursorClickIcon className="w-5 h-5"/> },
            { page: '/outlook-ready-html', label: 'Outlook Ready HTML', description: 'Fix common Outlook spacing issues.', icon: <CheckCircleIcon className="w-5 h-5"/> }
          ] 
        },
        { 
          page: 'resources', 
          label: 'Resources',
          children: [
              { page: '/blog', label: 'Blog', description: 'Latest updates and industry insights.', icon: <NewspaperIcon className="w-5 h-5"/> },
              { page: '/how-it-works', label: 'How It Works', description: 'Learn how to use our tools.', icon: <BookOpenIcon className="w-5 h-5"/> },
              { page: '/faq', label: 'FAQ', description: 'Find answers to common questions.', icon: <QuestionMarkCircleIcon className="w-5 h-5"/> },
              { page: '/contact-us', label: 'Contact', description: 'Get in touch with our team.', icon: <MailIcon className="w-5 h-5"/> },
          ]
        },
    ];
    
    const getDesktopLinkClass = (page: string, children?: any[]) => {
        const isActive = activePage === page || children?.some(child => activePage.startsWith(child.page));
        return `transition-colors duration-200 ${isActive ? 'font-semibold text-pink-500' : 'text-gray-300 hover:text-white'}`;
    };
    
    const getMobileLinkClass = (page: string, children?: any[]) => {
        const isActive = activePage === page || children?.some(child => activePage.startsWith(child.page));
        return `text-3xl font-medium transition-colors duration-200 ${isActive ? 'text-pink-400' : 'text-gray-300 hover:text-white'}`;
    };

    return (
        <>
            <style>{`
              @property --angle {
                syntax: '<angle>';
                initial-value: 0deg;
                inherits: false;
              }
            
              @keyframes spin {
                to {
                  --angle: 360deg;
                }
              }

              .animated-border-button {
                position: relative;
                z-index: 0; /* Creates a stacking context */
              }

              /* The pseudo-element creates the animated border background */
              .animated-border-button::before {
                content: '';
                position: absolute;
                z-index: -1; /* Place it behind the button */
                /* Make it slightly larger than the button to create the border effect */
                inset: -3px; 
                background: conic-gradient(from var(--angle), #fb923c, #facc15, #fde047, #facc15, #fb923c);
                border-radius: 9999px; /* This must match the button's rounded-full */
                animation: spin 4s linear infinite;
              }
            `}</style>
            <ActionInfoModal
                isOpen={isActionModalOpen}
                onClose={() => setIsActionModalOpen(false)}
                actionType="buyMeACoffee"
            />
            <header className="border-b border-gray-700/50 sticky top-0 bg-gray-900/80 backdrop-blur-md z-30">
                <nav className="container mx-auto px-4 flex items-center justify-between h-20">
                    <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-pink-500">
                        EMLinter
                    </Link>

                    {/* Desktop Navigation */}
                    <ul className="hidden lg:flex items-center space-x-6 md:space-x-8">
                        {navLinks.map(({ page, label, children }) => {
                            if (children) {
                                return (
                                    <li key={page} className="relative" onMouseEnter={() => handleDropdownEnter(page)} onMouseLeave={handleDropdownLeave}>
                                        <button className={`${getDesktopLinkClass(page, children)} flex items-center gap-1`}>
                                            {label}
                                            <svg className={`w-4 h-4 transition-transform ${openDropdown === page ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </button>
                                        
                                        <div 
                                            onMouseEnter={() => handleDropdownEnter(page)} 
                                            onMouseLeave={handleDropdownLeave} 
                                            className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max transition-all duration-300 ease-out transform ${openDropdown === page ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
                                        >
                                            <div className="bg-gray-800/80 backdrop-blur-lg border border-gray-700 rounded-xl shadow-2xl p-4">
                                                <div className={`grid ${children.length > 4 ? 'grid-cols-2 w-[40rem]' : 'w-[20rem]'} gap-x-4 gap-y-2`}>
                                                    {children.map(child => (
                                                        <Link key={child.page} to={child.page} onClick={() => setOpenDropdown(null)} className="group flex items-start gap-4 p-3 rounded-lg hover:bg-gray-700/50 transition-colors">
                                                            <div className="bg-gray-900/50 p-3 rounded-lg text-violet-400 transition-all duration-300 group-hover:bg-violet-600 group-hover:text-white">
                                                                {child.icon}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-100 transition-colors group-hover:text-white">{child.label}</p>
                                                                <p className="text-sm text-gray-400 transition-colors group-hover:text-gray-300">{child.description}</p>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                );
                            }
                            return (
                                <li key={page}>
                                    <Link to={page} className={getDesktopLinkClass(page)}>
                                        {label}
                                    </Link>
                                </li>
                            );
                        })}
                        <li>
                            <button 
                                onClick={() => setIsActionModalOpen(true)}
                                className="animated-border-button px-4 py-2 text-sm font-semibold text-gray-900 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 flex items-center space-x-2"
                            >
                                <CoffeeIcon className="w-5 h-5" />
                                <span>Buy Me a Coffee</span>
                            </button>
                        </li>
                    </ul>
                    
                    {/* Mobile Menu Button */}
                    <div className="lg:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu" className="text-gray-300 hover:text-white transition-colors">
                            {isMenuOpen ? <CloseIcon className="w-8 h-8"/> : <MenuIcon className="w-8 h-8"/>}
                        </button>
                    </div>
                </nav>
            </header>
            
            {/* Mobile Menu Overlay */}
            <div 
                className={`fixed inset-0 bg-gray-900 z-20 flex flex-col items-center justify-start pt-28 px-4 pb-4 overflow-y-auto transition-transform duration-300 ease-in-out lg:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                aria-hidden={!isMenuOpen}
            >
                <ul className="flex flex-col items-center space-y-6 text-center">
                    {navLinks.flatMap(({ page, label, children }) => {
                        if (children) {
                            return [
                                <li key={`${page}-header`} className="pt-4">
                                    <span className="text-sm font-bold text-gray-500 tracking-widest uppercase">{label}</span>
                                </li>,
                                ...children.map(child => (
                                    <li key={child.page}>
                                        <Link
                                            to={child.page}
                                            className={`block text-2xl font-medium py-1 ${activePage === child.page ? 'text-pink-400' : 'text-gray-300'} hover:text-white transition-colors`}
                                        >
                                            {child.label}
                                        </Link>
                                    </li>
                                ))
                            ];
                        }
                        return (
                            <li key={page}>
                                <Link to={page} className={getMobileLinkClass(page)}>
                                    {label}
                                </Link>
                            </li>
                        );
                    })}
                    <li className="pt-8">
                         <button 
                            onClick={() => {
                                setIsMenuOpen(false);
                                setIsActionModalOpen(true);
                            }}
                            className="animated-border-button px-6 py-3 text-base font-semibold text-gray-900 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 flex items-center space-x-2"
                        >
                            <CoffeeIcon className="w-5 h-5" />
                            <span>Buy Me a Coffee</span>
                        </button>
                    </li>
                </ul>
            </div>
        </>
    );
};

export default Header;