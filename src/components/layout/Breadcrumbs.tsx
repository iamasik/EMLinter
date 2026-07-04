import React, { useEffect, useState } from 'react';

const Breadcrumbs: React.FC = () => {
    const [activePage, setActivePage] = useState('');

    useEffect(() => {
        const pathname = window.location.pathname;
        if (pathname === '/') {
            setActivePage('home');
        } else {
            setActivePage(pathname.replace(/^\/+|\/+$/g, ''));
        }
    }, []);

    if (!activePage || activePage === 'home') return null;

    const parts = activePage.split('/');

    return (
        <nav aria-label="Breadcrumb" className="mb-6 md:mb-8">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-ink-400">
                <li className="flex items-center">
                    <a href="/" className="hover:text-brand-400 transition-colors whitespace-nowrap">Home</a>
                </li>
                {parts.map((part, index) => {
                    const isLast = index === parts.length - 1;
                    const path = '/' + parts.slice(0, index + 1).join('/');
                    const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
                    return (
                        <li key={path} className="flex items-center gap-1.5 min-w-0">
                            <svg className="w-3 h-3 text-ink-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                            {isLast ? (
                                <span className="text-ink-100 font-medium truncate max-w-[180px] sm:max-w-[320px] md:max-w-none" aria-current="page" title={label}>
                                    {label}
                                </span>
                            ) : (
                                <a href={path} className="hover:text-brand-400 transition-colors whitespace-nowrap">
                                    {label}
                                </a>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
