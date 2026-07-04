import React, { useState, useEffect, useMemo } from 'react';
import { getTemplates } from '../../services/firebase';
import type { Template } from '../../types';
import { SpinnerIcon, MailIcon, FilterIcon, XCircleIcon, StarIcon } from '../Icons';
import PageHero from '../PageHero';
import SeoFaq from '../SeoFaq';

const ITEMS_PER_PAGE = 12;
type SortOption = 'newest' | 'highestRated' | 'mostPopular';

function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState<T>(value);
    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
}

const TemplateCard: React.FC<{ template: Template; onTagClick: (tag: string) => void }> = ({ template, onTagClick }) => (
    <a
        href={`/templates/${template.slug}`}
        className="group card overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-400/40 flex flex-col"
    >
        <div className="w-full h-56 overflow-hidden bg-ink-900 relative">
            <img
                src={template.desktopPreviewUrl}
                alt={`${template.title} HTML email template preview`}
                loading="lazy"
                className="w-full h-auto object-cover object-top transition-transform duration-[3000ms] ease-out group-hover:-translate-y-[calc(100%-14rem)]"
            />
        </div>
        <div className="p-5 flex flex-col flex-grow">
            <h3 className="font-display font-bold text-white truncate text-base">{template.title}</h3>
            <p className="text-xs text-ink-400 mt-0.5">by {template.designer}</p>
            <div className="flex items-center gap-1.5 mt-3 text-sm">
                {template.numberOfRatings && template.numberOfRatings > 0 ? (
                    <>
                        <StarIcon className="w-4 h-4 text-amber-400" />
                        <span className="font-semibold text-white">{template.averageRating?.toFixed(1)}</span>
                        <span className="text-ink-400 text-xs">({template.numberOfRatings})</span>
                    </>
                ) : (
                    <span className="text-xs text-ink-500">No ratings yet</span>
                )}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5 pt-3 border-t border-white/5">
                {template.tags?.slice(0, 3).map((tag) => (
                    <button
                        key={tag}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onTagClick(tag); }}
                        className="text-[10px] uppercase tracking-wider bg-white/5 text-ink-300 px-2 py-1 rounded-full hover:bg-brand-500/20 hover:text-brand-200 transition-colors"
                    >
                        {tag}
                    </button>
                ))}
            </div>
        </div>
    </a>
);

const FilterSection = ({ title, options, selected, onChange, onClear }: { title: string; options: string[]; selected: string[]; onChange: (option: string, checked: boolean) => void; onClear: () => void }) => (
    <div className="border-b border-white/5 pb-4">
        <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-ink-100 text-sm">{title}</h4>
            {selected.length > 0 && (
                <button onClick={onClear} title={`Clear ${title}`} className="text-ink-500 hover:text-white transition-colors">
                    <XCircleIcon className="w-4 h-4" />
                </button>
            )}
        </div>
        <div className="space-y-2 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
            {options.map((option) => (
                <label key={option} className="flex items-center text-sm text-ink-200 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={selected.includes(option)}
                        onChange={(e) => onChange(option, e.target.checked)}
                        className="h-4 w-4 rounded-sm border-white/20 text-brand-500 focus:ring-brand-400 bg-ink-900 mr-2"
                    />
                    {option}
                </label>
            ))}
        </div>
    </div>
);

const faqs = [
    {
        question: 'Are these HTML email templates free to use?',
        answer: 'Yes — every template in the EMLinter library is free to download, edit, and use in commercial campaigns. No attribution required, no hidden tiers, no signup. Pick a template, open it in our online HTML email editor, edit text and images, and export the final HTML.',
    },
    {
        question: 'How do I use these templates in Mailchimp, Klaviyo, or HubSpot?',
        answer: 'Every template is responsive HTML compatible with major ESPs. Open the template in our Visual Editor (our free html email editor online), customize content, click Export, copy the HTML, then paste it into your ESP\'s custom-HTML editor. The templates work in Mailchimp, Klaviyo, HubSpot, Campaign Monitor, Salesforce Marketing Cloud, ActiveCampaign, Brevo, and ConvertKit.',
    },
    {
        question: 'Do the templates render correctly in Outlook?',
        answer: 'Yes — every template is built bulletproof, with VML fallbacks for CTAs and background images so Outlook for Windows (which still uses the Word rendering engine) displays the design identically to Gmail and Apple Mail. We test against 40+ email client configurations.',
    },
    {
        question: 'Can I edit the templates without coding?',
        answer: 'Absolutely. Click any template, open it in our no-code Visual Editor — the html email builder built into EMLinter — and click any block to update text, swap images, change colors, or update links. No HTML knowledge required. When you\'re done, export the final HTML.',
    },
    {
        question: 'Are the templates mobile responsive?',
        answer: 'Yes. Every template uses fluid hybrid responsive design, so they adapt cleanly from 320px mobile screens up to 600px desktop preview panes. Tested on iOS Mail, Gmail on Android, Outlook mobile, and Samsung Mail.',
    },
    {
        question: 'What is the difference between an html email editor online and a traditional code editor?',
        answer: 'A traditional code editor like VS Code shows you raw HTML — useful for developers. An online HTML email editor (also called an html email designer or html email builder) gives you a visual preview where you can click blocks and edit content, then exports clean HTML behind the scenes. EMLinter ships both: pick a template, edit visually, then download the optimized HTML.',
    },
];

const TemplatesPage: React.FC = () => {
    const [allTemplates, setAllTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const debouncedSearchTerm = useDebounce(inputValue, 300);
    const [ratingFilter, setRatingFilter] = useState<number>(0);
    const [activeFilters, setActiveFilters] = useState<{ categories: string[]; industries: string[]; compatibleESPs: string[] }>({ categories: [], industries: [], compatibleESPs: [] });
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState<SortOption>('newest');

    useEffect(() => {
        // Initialize filter from query param (?filter=newsletter|promo|...)
        try {
            const params = new URLSearchParams(window.location.search);
            const f = params.get('filter');
            const q = params.get('q');
            if (f) setActiveFilters((p) => ({ ...p, categories: [f] }));
            if (q) setInputValue(q);
        } catch {}
        getTemplates()
            .then(setAllTemplates)
            .catch((err) => { console.error(err); setError('Failed to load templates.'); })
            .finally(() => setLoading(false));
    }, []);

    const filterOptions = useMemo(() => {
        const categories = new Set<string>(), industries = new Set<string>(), esps = new Set<string>();
        allTemplates.forEach((t) => {
            t.categories?.forEach((c) => categories.add(c));
            if (t.industry) industries.add(t.industry);
            t.compatibleESPs?.forEach((e) => esps.add(e));
        });
        return {
            categories: Array.from(categories).sort(),
            industries: Array.from(industries).sort(),
            compatibleESPs: Array.from(esps).sort(),
        };
    }, [allTemplates]);

    const filteredTemplates = useMemo(() => {
        const sorted = [...allTemplates].sort((a, b) => {
            if (sortBy === 'highestRated') return (b.averageRating || 0) - (a.averageRating || 0);
            if (sortBy === 'mostPopular') return (b.numberOfRatings || 0) - (a.numberOfRatings || 0);
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
            return dateB - dateA;
        });
        return sorted.filter((t) => {
            const s = debouncedSearchTerm.toLowerCase();
            if (s && !t.title?.toLowerCase().includes(s) && !t.fullDescription?.toLowerCase().includes(s) && !t.tags?.some((tag) => tag.toLowerCase().includes(s))) return false;
            if (ratingFilter > 0 && (!t.averageRating || t.averageRating < ratingFilter)) return false;
            if (activeFilters.categories.length > 0 && !activeFilters.categories.some((c) => t.categories?.includes(c))) return false;
            if (activeFilters.industries.length > 0 && !activeFilters.industries.includes(t.industry)) return false;
            if (activeFilters.compatibleESPs.length > 0 && !activeFilters.compatibleESPs.some((e) => t.compatibleESPs?.includes(e))) return false;
            return true;
        });
    }, [allTemplates, debouncedSearchTerm, activeFilters, ratingFilter, sortBy]);

    const handleFilterChange = (filterType: keyof typeof activeFilters, value: string, isChecked: boolean) => {
        setActiveFilters((prev) => ({
            ...prev,
            [filterType]: isChecked ? [...prev[filterType], value] : prev[filterType].filter((i) => i !== value),
        }));
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(filteredTemplates.length / ITEMS_PER_PAGE);
    const paginatedTemplates = useMemo(
        () => filteredTemplates.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
        [filteredTemplates, currentPage]
    );

    return (
        <div>
            <PageHero
                eyebrow="Free HTML Email Editor + Template Library"
                title={
                    <>
                        Free responsive <span className="gradient-text">HTML email templates</span> — edit online, export anywhere.
                    </>
                }
                subtitle="The fastest free HTML email editor online: pick a fully responsive template, edit text and images in our no-code HTML email builder, then export clean HTML for Mailchimp, Klaviyo, HubSpot, and every major ESP."
            >
                <a href="/visual-editor" className="btn-primary">Open the HTML email editor</a>
                <a href="#library" className="btn-secondary">Browse the library</a>
            </PageHero>

            {error && <div className="text-center text-red-400 mb-6">{error}</div>}

            <div id="library" className="md:hidden flex justify-end mb-4">
                <button
                    onClick={() => setIsFilterVisible(!isFilterVisible)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-accent-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                >
                    <FilterIcon className="w-4 h-4" />
                    <span>{isFilterVisible ? 'Hide Filters' : 'Show Filters'}</span>
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-8 mb-20">
                <aside className={`${isFilterVisible ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
                    <div className="card p-5 md:sticky md:top-24">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-base font-bold flex items-center gap-2 text-white">
                                <FilterIcon className="w-4 h-4 text-ink-200" />
                                Filters
                            </h2>
                            <button
                                onClick={() => {
                                    setActiveFilters({ categories: [], industries: [], compatibleESPs: [] });
                                    setRatingFilter(0);
                                    setInputValue('');
                                }}
                                className="text-xs text-brand-400 hover:text-brand-300"
                            >
                                Clear All
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="border-b border-white/5 pb-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-semibold text-ink-100 text-sm">Rating</h4>
                                    {ratingFilter > 0 && (
                                        <button onClick={() => setRatingFilter(0)} className="text-ink-500 hover:text-white">
                                            <XCircleIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    {[4, 3, 2, 1].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRatingFilter(star)}
                                            className={`w-full text-left flex items-center gap-2 px-2 py-1 rounded-md transition-colors ${
                                                ratingFilter === star ? 'bg-brand-500/15 text-brand-200' : 'hover:bg-white/5'
                                            }`}
                                        >
                                            {[...Array(5)].map((_, i) => (
                                                <StarIcon key={i} className={`w-4 h-4 ${i < star ? 'text-amber-400' : 'text-ink-700'}`} />
                                            ))}
                                            <span className="text-xs text-ink-300">& up</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <FilterSection title="Categories" options={filterOptions.categories} selected={activeFilters.categories} onChange={(o, c) => handleFilterChange('categories', o, c)} onClear={() => setActiveFilters((p) => ({ ...p, categories: [] }))} />
                            <FilterSection title="Industry" options={filterOptions.industries} selected={activeFilters.industries} onChange={(o, c) => handleFilterChange('industries', o, c)} onClear={() => setActiveFilters((p) => ({ ...p, industries: [] }))} />
                            <FilterSection title="Compatible ESPs" options={filterOptions.compatibleESPs} selected={activeFilters.compatibleESPs} onChange={(o, c) => handleFilterChange('compatibleESPs', o, c)} onClear={() => setActiveFilters((p) => ({ ...p, compatibleESPs: [] }))} />
                        </div>
                    </div>
                </aside>

                <main className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch mb-6">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search templates by title, description, or tag…"
                                value={inputValue}
                                onChange={(e) => { setInputValue(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-10 pr-10 py-3 bg-ink-900/60 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-transparent focus:outline-none text-sm"
                            />
                            {inputValue && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <button onClick={() => setInputValue('')} className="text-ink-500 hover:text-white" aria-label="Clear search">
                                        <XCircleIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="relative flex-shrink-0">
                            <select
                                value={sortBy}
                                onChange={(e) => { setSortBy(e.target.value as SortOption); setCurrentPage(1); }}
                                className="w-full sm:w-52 appearance-none pl-4 pr-9 py-3 bg-ink-900/60 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-400 focus:outline-none text-sm"
                            >
                                <option value="newest">Sort: Newest</option>
                                <option value="highestRated">Sort: Highest Rated</option>
                                <option value="mostPopular">Sort: Most Popular</option>
                            </select>
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-96">
                            <SpinnerIcon className="animate-spin h-10 w-10 text-brand-500" />
                        </div>
                    ) : paginatedTemplates.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                {paginatedTemplates.map((template) => (
                                    <TemplateCard key={template.id} template={template} onTagClick={(tag) => { setInputValue(tag); setCurrentPage(1); }} />
                                ))}
                            </div>
                            {totalPages > 1 && (
                                <nav className="mt-10 flex justify-center items-center gap-2 flex-wrap">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
                                                currentPage === page ? 'bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-glow' : 'bg-white/5 border border-white/10 text-ink-200 hover:bg-white/10'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </nav>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-16 card">
                            <MailIcon className="w-16 h-16 text-ink-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white">No templates match those filters</h3>
                            <p className="text-ink-400 mt-2 text-sm">Try clearing filters or searching a different keyword.</p>
                        </div>
                    )}
                </main>
            </div>

            {/* SEO content block */}
            <section className="card p-8 md:p-12 max-w-5xl mx-auto mb-12">
                <h2 className="section-title mb-5">The free HTML email editor email developers actually recommend</h2>
                <div className="text-ink-300 leading-relaxed space-y-4 text-sm md:text-base">
                    <p>
                        EMLinter is a free online HTML email editor and template library built for marketers, designers, and developers who need to ship responsive campaigns without subscriptions. Unlike traditional drag-and-drop builders that generate bloated, table-soup HTML, our html email builder produces clean code that renders identically across Gmail, Outlook, Apple Mail, and Yahoo Mail.
                    </p>
                    <p>
                        Every template in this library is a complete HTML email template — fully responsive, bulletproof for Outlook (with VML fallbacks for buttons and backgrounds), and compatible with every major ESP. Edit any template in our visual html email designer, then export the optimized HTML and drop it into Mailchimp, Klaviyo, HubSpot, Salesforce Marketing Cloud, or your preferred platform.
                    </p>
                    <p>
                        If you've been hunting for an html email editor online free with no signup, no watermark, and no exported-code restrictions — this is it. Open the editor, pick a template, customize, export.
                    </p>
                </div>
            </section>

            <SeoFaq
                title="HTML Email Editor & Template FAQs"
                subtitle="Everything you need to know about using EMLinter's online html email editor and free template library."
                items={faqs}
            />
        </div>
    );
};

export default TemplatesPage;
