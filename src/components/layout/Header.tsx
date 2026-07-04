import React, { useState, useEffect, useRef } from 'react';
import { CoffeeIcon, MenuIcon, CloseIcon, WandIcon, ImageIcon, CheckCircleIcon, BookOpenIcon, NewspaperIcon, CursorClickIcon, CodeIcon, MoonIcon, QuestionMarkCircleIcon, LitmusIcon, ShoppingBagIcon } from '../Icons';
import ActionInfoModal from '../modals/ActionInfoModal';

interface HeaderProps {
    currentPath: string;
}

const Header: React.FC<HeaderProps> = ({ currentPath }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const openMenu = (page: string) => {
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }
        setOpenDropdown(page);
    };

    const scheduleClose = () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => {
            setOpenDropdown(null);
            closeTimer.current = null;
        }, 150);
    };

    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    }, [isMenuOpen]);

    useEffect(() => () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
    }, []);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const isActive = (page: string) => {
        if (page === 'home') return currentPath === '/';
        return currentPath.startsWith(`/${page}`);
    };

    const navLinks = [
        { page: 'home', label: 'Home' },
        { page: 'templates', label: 'Templates' },
        { page: 'visual-editor', label: 'Editor' },
        {
            page: 'tools',
            label: 'Tools',
            children: [
                { page: 'tools/code-fix', label: 'HTML Email Linter', description: 'Validate and fix common HTML email errors', icon: <CheckCircleIcon className="w-5 h-5" /> },
                { page: 'tools/beautify-code', label: 'HTML Beautifier', description: 'Format and clean your HTML code', icon: <WandIcon className="w-5 h-5" /> },
                { page: 'tools/html-minifier', label: 'HTML Email Minifier', description: 'Compress HTML to reduce file size', icon: <CodeIcon className="w-5 h-5" /> },
                { page: 'tools/dark-mode-checker', label: 'Dark Mode Tester', description: 'Preview emails in dark mode', icon: <MoonIcon className="w-5 h-5" /> },
                { page: 'tools/design-copier', label: 'Design Copier', description: 'Copy visual design to Gmail/Outlook', icon: <CursorClickIcon className="w-5 h-5" /> },
            ],
        },
        {
            page: 'solutions',
            label: 'Solutions',
            children: [
                { page: 'solutions/html-email-test', label: 'HTML Email Test', description: 'Send real test emails across clients', icon: <LitmusIcon className="w-5 h-5" /> },
                { page: 'solutions/outlook-background-generator', label: 'Outlook Background', description: 'Bulletproof VML background images', icon: <ImageIcon className="w-5 h-5" /> },
                { page: 'solutions/outlook-button-generator', label: 'Outlook Buttons', description: 'Bulletproof VML email buttons', icon: <CursorClickIcon className="w-5 h-5" /> },
                { page: 'solutions/outlook-ready-html', label: 'Outlook Fixer', description: 'Fix Outlook spacing and rendering', icon: <CheckCircleIcon className="w-5 h-5" /> },
            ],
        },
        {
            page: 'resources',
            label: 'Resources',
            children: [
                { page: 'resources/blog', label: 'Blog', description: 'Email development insights', icon: <NewspaperIcon className="w-5 h-5" /> },
                { page: 'resources/products', label: 'Products', description: 'Premium templates and kits', icon: <ShoppingBagIcon className="w-5 h-5" /> },
                { page: 'resources/how-it-works', label: 'How It Works', description: 'Guides and walkthroughs', icon: <BookOpenIcon className="w-5 h-5" /> },
                { page: 'resources/faq', label: 'FAQ', description: 'Answers to common questions', icon: <QuestionMarkCircleIcon className="w-5 h-5" /> },
            ],
        },
    ] as const;

    const linkClass = (page: string) => {
        const active = isActive(page);
        return `relative px-1 py-2 text-sm font-medium transition-colors ${active ? 'text-white' : 'text-ink-300 hover:text-white'}`;
    };

    return (
        <>
            <ActionInfoModal isOpen={isActionModalOpen} onClose={() => setIsActionModalOpen(false)} actionType="buyMeACoffee" />
            <header
                className={`sticky top-0 z-30 transition-all duration-300 ${
                    scrolled
                        ? 'border-b border-white/10 bg-ink-950/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.4)]'
                        : 'border-b border-transparent bg-ink-950/40 backdrop-blur'
                }`}
            >
                <nav className="container-wide flex items-center justify-between h-16 md:h-20">
                    <a href="/" className="flex items-center gap-2 group">
                        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 grid place-items-center font-bold text-white shadow-glow">EM</span>
                        <span className="text-xl font-display font-bold gradient-text">EMLinter</span>
                    </a>

                    <ul className="hidden lg:flex items-center gap-7">
                        {navLinks.map((link) => {
                            const { page, label } = link;
                            const children = 'children' in link ? link.children : undefined;
                            return (
                                <li
                                    key={page}
                                    className="relative"
                                    onMouseEnter={() => children && openMenu(page)}
                                    onMouseLeave={() => children && scheduleClose()}
                                >
                                    {children ? (
                                        <button className={`${linkClass(page)} flex items-center gap-1`}>
                                            {label}
                                            <svg className={`w-4 h-4 transition-transform ${openDropdown === page ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    ) : (
                                        <a href={page === 'home' ? '/' : `/${page}`} className={linkClass(page)}>
                                            {label}
                                        </a>
                                    )}
                                    {isActive(page) && (
                                        <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-brand-500 to-accent-500" />
                                    )}
                                    {children && (
                                        <div
                                            className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 w-max transition-all duration-200 ${
                                                openDropdown === page ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
                                            }`}
                                        >
                                            <div className="rounded-2xl border border-white/10 bg-ink-900/95 backdrop-blur-xl shadow-2xl ring-1 ring-black/40 p-3">
                                                <div className={`grid ${children.length > 4 ? 'grid-cols-2 w-[36rem]' : 'w-[22rem]'} gap-1`}>
                                                    {children.map((child) => (
                                                        <a
                                                            key={child.page}
                                                            href={`/${child.page}`}
                                                            className="group flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
                                                        >
                                                            <div className="bg-ink-900/70 p-2 rounded-lg text-accent-300 group-hover:bg-gradient-to-br group-hover:from-brand-500 group-hover:to-accent-500 group-hover:text-white transition-all">
                                                                {child.icon}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-semibold text-ink-100 group-hover:text-white text-sm leading-tight">{child.label}</p>
                                                                <p className="text-xs text-ink-300 mt-0.5">{child.description}</p>
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                        <li>
                            <button
                                onClick={() => setIsActionModalOpen(true)}
                                className="ml-2 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-ink-950 bg-gradient-to-r from-amber-300 to-orange-400 rounded-full hover:brightness-110 transition-all"
                            >
                                <CoffeeIcon className="w-4 h-4" /> <span>Buy Me a Coffee</span>
                            </button>
                        </li>
                    </ul>

                    <div className="lg:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu" className="text-ink-200 p-2">
                            {isMenuOpen ? <CloseIcon className="w-7 h-7" /> : <MenuIcon className="w-7 h-7" />}
                        </button>
                    </div>
                </nav>
            </header>

            {/* Mobile menu */}
            <div
                className={`fixed inset-0 bg-ink-950/95 backdrop-blur-xl z-20 flex flex-col pt-24 px-6 transition-transform duration-300 lg:hidden overflow-y-auto ${
                    isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <ul className="flex flex-col space-y-2">
                    {navLinks.map((link) => {
                        const { page, label } = link;
                        const children = 'children' in link ? link.children : undefined;
                        return (
                            <li key={page} className="border-b border-white/5 pb-3">
                                {children ? (
                                    <span className="text-sm uppercase tracking-wider text-ink-400">{label}</span>
                                ) : (
                                    <a
                                        href={page === 'home' ? '/' : `/${page}`}
                                        className="block text-xl font-semibold text-white py-2"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {label}
                                    </a>
                                )}
                                {children && (
                                    <div className="mt-2 space-y-1">
                                        {children.map((child) => (
                                            <a
                                                key={child.page}
                                                href={`/${child.page}`}
                                                className="flex items-center gap-3 py-2 text-ink-200 hover:text-brand-400"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <span className="text-accent-300">{child.icon}</span>
                                                <span className="font-medium">{child.label}</span>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </>
    );
};

export default Header;
