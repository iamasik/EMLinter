import React, { useState, useRef } from 'react';
import { ChevronDownIcon } from './Icons';

export interface SeoFaqItem {
    question: string;
    answer: React.ReactNode;
}

interface SeoFaqProps {
    /** Section heading (default: "Frequently Asked Questions") */
    title?: string;
    /** Optional subheading shown under the title */
    subtitle?: string;
    items: SeoFaqItem[];
    /** When true, first item is open by default */
    openFirst?: boolean;
}

const FaqRow: React.FC<{ q: string; a: React.ReactNode; defaultOpen?: boolean }> = ({ q, a, defaultOpen }) => {
    const [isOpen, setIsOpen] = useState(!!defaultOpen);
    const contentRef = useRef<HTMLDivElement>(null);
    return (
        <div className="border-b border-white/5 last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                className="w-full flex justify-between items-center text-left py-5 px-2 group"
            >
                <span className="text-base md:text-lg font-medium text-ink-100 group-hover:text-white transition-colors pr-4">
                    {q}
                </span>
                <ChevronDownIcon
                    className={`w-5 h-5 flex-shrink-0 text-ink-300 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-400' : ''}`}
                />
            </button>
            <div
                ref={contentRef}
                className="overflow-hidden transition-[max-height,opacity] duration-500 ease-out"
                style={{
                    maxHeight: isOpen ? `${contentRef.current?.scrollHeight ?? 1000}px` : '0px',
                    opacity: isOpen ? 1 : 0,
                }}
            >
                <div className="pb-5 px-2 text-ink-300 leading-relaxed text-sm md:text-base">{a}</div>
            </div>
        </div>
    );
};

const SeoFaq: React.FC<SeoFaqProps> = ({ title = 'Frequently Asked Questions', subtitle, items, openFirst = true }) => {
    return (
        <section className="max-w-4xl mx-auto py-12 md:py-16">
            <div className="text-center mb-8 md:mb-12">
                <h2 className="section-title">{title}</h2>
                {subtitle && <p className="section-subtitle mx-auto mt-3">{subtitle}</p>}
            </div>
            <div className="card p-2 md:p-4">
                {items.map((item, i) => (
                    <FaqRow key={i} q={item.question} a={item.answer} defaultOpen={openFirst && i === 0} />
                ))}
            </div>
        </section>
    );
};

export default SeoFaq;
