import React from 'react';
import PageHero from '../PageHero';
import SeoFaq from '../SeoFaq';
import { CONVERTER_BASE_PATH, convertersByCategory } from '../../lib/pixelConverters';

const categories = convertersByCategory();

const faqs = [
    {
        question: 'What is the Pixel Converter?',
        answer: 'The Pixel Converter is a free, browser-based toolkit for converting pixels into CSS units like em, rem, pt, and vh, as well as physical measurements like inches, centimeters, and millimeters. It also converts standard A, B, C, and US paper sizes into pixel dimensions. Every conversion runs instantly on your device — nothing is uploaded.',
    },
    {
        question: 'Why convert pixels to em, rem, or pt?',
        answer: 'Absolute pixels do not scale with a user’s font-size preference. Converting to relative units like em and rem makes typography and spacing accessible and responsive, while pt is the standard unit for print and word processors. Each converter shows the exact formula and a reference table so you can move between units confidently.',
    },
    {
        question: 'How accurate are the physical unit conversions?',
        answer: 'Screen pixels map to physical lengths through a resolution (DPI). CSS defines a reference of 96 pixels per inch, which is the default here, and you can change the DPI for print work (typically 150 or 300). At 96 DPI, 1 inch = 96px, 1cm ≈ 37.8px, and 1mm ≈ 3.78px.',
    },
    {
        question: 'What paper sizes can I convert to pixels?',
        answer: 'The toolkit covers the full ISO A series (A0–A10), B series (B0–B10), and C series (C0–C10, used for envelopes), plus US sizes including Letter, Legal, Tabloid, Ledger, and the ANSI A–E engineering series. Pick a size and DPI to get exact pixel width and height.',
    },
    {
        question: 'Is the Pixel Converter free and private?',
        answer: 'Yes — completely free, no signup, and fully private. All conversion math happens client-side in your browser, so no values are ever sent to a server.',
    },
];

const PixelConverterHubPage: React.FC = () => (
    <div>
        <PageHero
            eyebrow="Pixel Converter"
            title={
                <>
                    The free <span className="gradient-text">pixel converter</span> for CSS units and paper sizes.
                </>
            }
            subtitle="Convert pixels into CSS units such as em, rem, pt, and vh — plus absolute measurements like inch, centimeter, and millimeter, and standard A, B, C, and US paper sizes. Pick a conversion below."
        >
            <a href={`${CONVERTER_BASE_PATH}/px-to-em`} className="btn-primary">px to em</a>
            <a href={`${CONVERTER_BASE_PATH}/px-to-rem`} className="btn-secondary">px to rem</a>
        </PageHero>

        <div className="space-y-10 mb-16">
            {categories.map(({ category, items }) => (
                <section key={category}>
                    <h2 className="inline-block text-sm font-display font-bold uppercase tracking-wider text-white border-b-2 border-brand-500 pb-1 mb-4">
                        {category}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {items.map((c) => (
                            <a
                                key={c.slug}
                                href={`${CONVERTER_BASE_PATH}/${c.slug}`}
                                className={`group card px-6 py-5 text-center font-display font-bold text-lg bg-gradient-to-br ${c.tone} ring-1 hover:-translate-y-0.5 transition-all duration-300`}
                            >
                                <span className="inline-flex items-center gap-2">
                                    {c.label}
                                    <svg className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                </span>
                            </a>
                        ))}
                    </div>
                </section>
            ))}
        </div>

        <section className="card p-8 md:p-12 max-w-5xl mx-auto mb-12">
            <h2 className="section-title mb-5">One toolkit for every pixel conversion</h2>
            <div className="text-ink-300 leading-relaxed space-y-4 text-sm md:text-base">
                <p>
                    Front-end and email developers constantly translate between units. A design comes in pixels, a
                    design system wants rem, a print spec asks for points, and a physical layout needs centimeters.
                    This pixel converter puts every one of those conversions in a single place, each with the exact
                    formula, a live result, and a reference table you can scan at a glance.
                </p>
                <p>
                    The CSS unit converters — px to em, px to rem, px to pt, and px to vh (and their reverses) — let you
                    set the base font-size or viewport so the relative math matches your actual document. The physical
                    converters — pixels to inches, centimeters, and millimeters — use the 96 DPI CSS reference by default
                    and let you switch to a print resolution like 300 DPI. And the paper-size converters turn ISO A, B,
                    and C sizes plus US Letter, Legal, Tabloid, and ANSI formats into exact pixel dimensions for any DPI.
                </p>
                <p>
                    Everything runs locally in your browser — no signup, no uploads, no waiting. Bookmark the conversion
                    you use most, or start from the list above.
                </p>
            </div>
        </section>

        <SeoFaq title="Pixel Converter FAQs" items={faqs} />
    </div>
);

export default PixelConverterHubPage;
