import React, { useState, useEffect, useRef } from 'react';
import { CoffeeIcon, MenuIcon, CloseIcon, WandIcon, ImageIcon, CheckCircleIcon, BookOpenIcon, NewspaperIcon, MailIcon, CursorClickIcon, UsersIcon, CodeIcon } from '../Icons';
import ActionInfoModal from '../modals/ActionInfoModal';

interface HeaderProps {
    activePage: string;
    onNavigate: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activePage, onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [mobileDropdownsOpen, setMobileDropdownsOpen] = useState<{ [key: string]: boolean }>({});
    const dropdownTimeoutRef = useRef<number | null>(null);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);

    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

    const handleLinkClick = (page: string) => {
        onNavigate(page);
        setIsMenuOpen(false);
        setOpenDropdown(null);
        setMobileDropdownsOpen({});
    };

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
        }, 200); // 200ms delay to allow moving between elements
    };
    
    const navLinks = [
        { page: 'home', label: 'Home' },
        { page: 'templates', label: 'Templates' },
        { page: 'visual-editor', label: 'Visual Editor' },
        { page: 'code-fix', label: 'Code Fix' },
        { 
          page: 'tools', 
          label: 'Tools', 
          children: [
            { page: 'beautify-code', label: 'Beautifier', description: 'Format and clean your HTML code.', icon: <WandIcon className="w-5 h-5"/> },
            { page: 'html-minifier', label: 'HTML Minifier', description: 'Compress HTML to reduce file size.', icon: <CodeIcon className="w-5 h-5"/> },
            { page: 'outlook-button-generator', label: 'Outlook Button Generator', description: 'Create bulletproof VML buttons.', icon: <CursorClickIcon className="w-5 h-5"/> },
            { page: 'outlook-background-generator', label: 'Outlook Background', description: 'Generate VML background images.', icon: <ImageIcon className="w-5 h-5"/> },
            { page: 'outlook-ready-html', label: 'Outlook Ready HTML', description: 'Fix common Outlook spacing issues.', icon: <CheckCircleIcon className="w-5 h-5"/> }
          ] 
        },
        { 
          page: 'resources', 
          label: 'Resources',
          children: [
              { page: 'blog', label: 'Blog', description: 'Latest updates and industry insights.', icon: <NewspaperIcon className="w-5 h-5"/> },
              { page: 'how-it-works', label: 'How It Works', description: 'Learn how to use our tools.', icon: <BookOpenIcon className="w-5 h-5"/> },
              { page: 'our-experts', label: 'Our Experts', description: 'Meet the team behind EMLinter.', icon: <UsersIcon className="w-5 h-5"/> },
              { page: 'contact-us', label: 'Contact', description: 'Get in touch with our team.', icon: <MailIcon className="w-5 h-5"/> },
          ]
        },
    ];
    
    const getDesktopLinkClass = (page: string, children?: any[]) => {
        const isActive = activePage.startsWith(page) || children?.some(child => activePage.startsWith(child.page));
        return `transition-colors duration-200 ${isActive ? 'font-semibold text-pink-500' : 'text-gray-300 hover:text-white'}`;
    };
    
    const getMobileLinkClass = (page: string, children?: any[]) => {
        const isActive = activePage.startsWith(page) || children?.some(child => activePage.startsWith(child.page));
        return `text-3xl font-medium transition-colors duration-200 ${isActive ? 'text-pink-400' : 'text-gray-300 hover:text-white'}`;
    };

    return (
        <>
            <ActionInfoModal
                isOpen={isActionModalOpen}
                onClose={() => setIsActionModalOpen(false)}
                actionType="buyMeACoffee"
            />
            <header className="border-b border-gray-700/50 sticky top-0 bg-gray-900/80 backdrop-blur-md z-30">
                <nav className="container mx-auto px-4 flex items-center justify-between h-20">
                    <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick('home'); }} className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-pink-500">
                        EMLinter
                    </a>

                    {/* Desktop Navigation */}
                    <ul className="hidden md:flex items-center space-x-6 md:space-x-8">
                        {navLinks.map(({ page, label, children }) => {
                            if (children) {
                                return (
                                    <li key={page} className="relative" onMouseEnter={() => handleDropdownEnter(page)} onMouseLeave={handleDropdownLeave}>
                                        <button className={`${getDesktopLinkClass(page, children)} flex items-center gap-1`}>
                                            {label}
                                            <svg className={`w-4 h-4 transition-transform ${openDropdown === page ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </button>
                                        {openDropdown === page && (
                                            <div onMouseEnter={() => handleDropdownEnter(page)} onMouseLeave={handleDropdownLeave} className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-xl shadow-2xl p-4">
                                                <div className={`grid ${children.length > 4 ? 'grid-cols-2 w-[40rem]' : 'grid-cols-1 w-[20rem]'} gap-x-4 gap-y-2`}>
                                                    {children.map(child => (
                                                        <a key={child.page} href="#" onClick={(e) => { e.preventDefault(); handleLinkClick(child.page); }} className="group flex items-start gap-4 p-3 rounded-lg hover:bg-gray-700/50 transition-colors">
                                                            <div className="bg-gray-900/50 p-3 rounded-lg text-violet-400 transition-all duration-300 group-hover:bg-violet-600 group-hover:text-white">
                                                                {child.icon}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-100">{child.label}</p>
                                                                <p className="text-sm text-gray-400">{child.description}</p>
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                );
                            }
                            return (
                                <li key={page}>
                                    <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick(page); }} className={getDesktopLinkClass(page)}>
                                        {label}
                                    </a>
                                </li>
                            );
                        })}
                        <li>
                            <button 
                                onClick={() => setIsActionModalOpen(true)}
                                className="px-4 py-2 text-sm font-semibold text-gray-900 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 flex items-center space-x-2 transform hover:scale-105"
                            >
                                <CoffeeIcon className="w-5 h-5" />
                                <span>Buy Me a Coffee</span>
                            </button>
                        </li>
                    </ul>
                    
                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu" className="text-gray-300 hover:text-white transition-colors">
                            {isMenuOpen ? <CloseIcon className="w-8 h-8"/> : <MenuIcon className="w-8 h-8"/>}
                        </button>
                    </div>
                </nav>
            </header>
            
            {/* Mobile Menu Overlay */}
            <div 
                className={`fixed inset-0 bg-gray-900 z-20 flex flex-col items-center justify-start pt-28 px-4 pb-4 overflow-y-auto transition-transform duration-300 ease-in-out md:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                aria-hidden={!isMenuOpen}
            >
                <ul className="flex flex-col items-center space-y-10 text-center">
                    {navLinks.map(({ page, label, children }) => {
                        if (children) {
                            return (
                                <li key={page}>
                                    <button onClick={() => setMobileDropdownsOpen(prev => ({ ...prev, [page]: !prev[page] }))} className={`${getMobileLinkClass(page, children)} flex items-center gap-2`}>
                                        {label}
                                        <svg className={`w-6 h-6 transition-transform ${mobileDropdownsOpen[page] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    </button>
                                    {mobileDropdownsOpen[page] && (
                                        <div className="mt-4 space-y-4">
                                            {children.map(child => (
                                                <a key={child.page} href="#" onClick={(e) => { e.preventDefault(); handleLinkClick(child.page); }} className={`block text-xl font-medium ${activePage === child.page ? 'text-pink-400' : 'text-gray-400'} hover:text-white`}>
                                                    {child.label}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </li>
                            );
                        }
                        return (
                            <li key={page}>
                                <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick(page); }} className={getMobileLinkClass(page)}>
                                    {label}
                                </a>
                            </li>
                        );
                    })}
                    <li className="pt-6">
                         <button 
                            onClick={() => {
                                setIsMenuOpen(false);
                                setIsActionModalOpen(true);
                            }}
                            className="px-6 py-3 text-base font-semibold text-gray-900 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 flex items-center space-x-2 transform hover:scale-105"
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