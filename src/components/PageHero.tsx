import React from 'react';

interface PageHeroProps {
    eyebrow?: string;
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    children?: React.ReactNode;
    align?: 'center' | 'left';
}

const PageHero: React.FC<PageHeroProps> = ({ eyebrow, title, subtitle, children, align = 'center' }) => {
    const isCenter = align === 'center';
    return (
        <section className={`relative ${isCenter ? 'text-center' : ''} pt-6 md:pt-10 pb-10 md:pb-14`}>
            <div className="absolute inset-0 -z-10 bg-grid-fade pointer-events-none" />
            {eyebrow && (
                <div className={isCenter ? 'flex justify-center' : ''}>
                    <span className="chip text-brand-300 border-brand-400/30 bg-brand-500/10 mb-5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                        {eyebrow}
                    </span>
                </div>
            )}
            <h1 className={`font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-balance ${isCenter ? 'mx-auto max-w-4xl' : 'max-w-4xl'}`}>
                {title}
            </h1>
            {subtitle && (
                <p className={`mt-5 text-base md:text-lg text-ink-300 text-pretty ${isCenter ? 'mx-auto max-w-2xl' : 'max-w-2xl'}`}>
                    {subtitle}
                </p>
            )}
            {children && (
                <div className={`mt-8 flex flex-wrap gap-3 ${isCenter ? 'justify-center' : ''}`}>{children}</div>
            )}
        </section>
    );
};

export default PageHero;
