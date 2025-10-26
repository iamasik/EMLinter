import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getTemplates } from '../services/firebase';
import type { Template } from '../types';
import { SpinnerIcon, MailIcon, FilterIcon, XCircleIcon, StarIcon } from '../components/Icons';

const ITEMS_PER_PAGE = 12;

type SortOption = 'newest' | 'highestRated' | 'mostPopular';

/**
 * Custom hook to debounce a value.
 * @param value The value to debounce.
 * @param delay The debounce delay in milliseconds.
 * @returns The debounced value.
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function that clears the timeout
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const TemplateCard: React.FC<{ template: Template, onTagClick: (tag: string) => void }> = ({ template, onTagClick }) => {
  return (
    <Link to={`/templates/${template.slug}`}
      className="group rounded-xl bg-gray-800/50 border border-gray-700/50 overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-pink-500/50 cursor-pointer flex flex-col">
      <div className="w-full h-60 overflow-hidden">
        <img
          src={template.desktopPreviewUrl}
          alt={`${template.title} preview`}
          className="w-full h-auto object-cover object-top transition-transform duration-[4000ms] ease-out group-hover:-translate-y-[calc(100%-15rem)]"
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-gray-100 truncate">{template.title}</h3>
        <p className="text-sm text-gray-400 mt-1">by {template.designer}</p>
        
        {template.numberOfRatings && template.numberOfRatings > 0 ? (
            <div className="flex items-center gap-1 mt-2 text-sm">
                <StarIcon className="w-4 h-4 text-yellow-400" />
                <span className="font-semibold text-white">{template.averageRating?.toFixed(1)}</span>
                <span className="text-gray-400">({template.numberOfRatings})</span>
            </div>
        ) : (
            <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                <StarIcon className="w-4 h-4" />
                <span>No ratings yet</span>
            </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-gray-700/50">
          {template.tags?.slice(0, 3).map(tag => (
             <button
              key={tag}
              onClick={(e) => {
                e.preventDefault(); // Prevent Link navigation
                e.stopPropagation(); 
                onTagClick(tag);
              }}
              className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full hover:bg-pink-600 hover:text-white transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>
    </Link>
  );
};


const FilterSection = ({ title, options, selected, onChange, onClear }: { title: string, options: string[], selected: string[], onChange: (option: string, checked: boolean) => void, onClear: () => void }) => {
    return (
        <div className="border-b border-gray-700/50 pb-4">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-gray-200">{title}</h4>
                {selected.length > 0 && (
                    <button onClick={onClear} title={`Clear ${title}`} className="text-gray-500 hover:text-white transition-colors">
                        <XCircleIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {options.map(option => (
                    <label key={option} className="flex items-center text-sm text-gray-300 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={selected.includes(option)}
                            onChange={e => onChange(option, e.target.checked)}
                            className="h-4 w-4 rounded-sm border-gray-500 text-pink-600 focus:ring-pink-500 bg-gray-700 mr-2"
                        />
                        {option}
                    </label>
                ))}
            </div>
        </div>
    );
};

const TemplatesPage = () => {
    const [allTemplates, setAllTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFilterVisible, setIsFilterVisible] = useState(false);

    const [inputValue, setInputValue] = useState('');
    const debouncedSearchTerm = useDebounce(inputValue, 300);
    const [ratingFilter, setRatingFilter] = useState<number>(0);
    const [activeFilters, setActiveFilters] = useState<{
        categories: string[];
        industries: string[];
        compatibleESPs: string[];
    }>({ categories: [], industries: [], compatibleESPs: [] });

    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState<SortOption>('newest');

    const location = useLocation();
    const initialFilter = location.state;
    
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                setLoading(true);
                const templates = await getTemplates();
                setAllTemplates(templates);
            } catch (err) {
                console.error("Error fetching templates:", err);
                setError("Failed to load templates. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchTemplates();
    }, []);

    useEffect(() => {
        if (initialFilter && initialFilter.type && initialFilter.value) {
            const { type, value } = initialFilter;
            // Reset existing filters and apply the new one
            setActiveFilters({
                categories: type === 'categories' ? [value] : [],
                industries: type === 'industries' ? [value] : [],
                compatibleESPs: type === 'compatibleESPs' ? [value] : [],
            });
             setRatingFilter(0);
             setInputValue(''); // Also reset search input
        }
    }, [initialFilter]);


    const filterOptions = useMemo(() => {
        const categories = new Set<string>();
        const industries = new Set<string>();
        const esps = new Set<string>();

        allTemplates.forEach(template => {
            template.categories?.forEach(cat => categories.add(cat));
            if(template.industry) industries.add(template.industry);
            template.compatibleESPs?.forEach(esp => esps.add(esp));
        });

        return {
            categories: Array.from(categories).sort(),
            industries: Array.from(industries).sort(),
            compatibleESPs: Array.from(esps).sort(),
        };
    }, [allTemplates]);

    const filteredTemplates = useMemo(() => {
        // 1. Create a mutable copy to sort.
        const sorted = [...allTemplates].sort((a, b) => {
            switch (sortBy) {
                case 'highestRated':
                    return (b.averageRating || 0) - (a.averageRating || 0);
                case 'mostPopular':
                    return (b.numberOfRatings || 0) - (a.numberOfRatings || 0);
                case 'newest':
                default:
                    // Firestore Timestamps have a `toDate()` method
                    const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
                    const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
                    return dateB - dateA;
            }
        });
        
        // 2. Filter the sorted array.
        return sorted.filter(template => {
            const searchTermLower = debouncedSearchTerm.toLowerCase();
            const matchesSearch = searchTermLower === '' ||
                template.title?.toLowerCase().includes(searchTermLower) ||
                template.fullDescription?.toLowerCase().includes(searchTermLower) ||
                template.tags?.some(tag => tag.toLowerCase().includes(searchTermLower));
            if (!matchesSearch) return false;

            const matchesRating = ratingFilter === 0 || (template.averageRating && template.averageRating >= ratingFilter);
            if (!matchesRating) return false;

            const matchesCategory = activeFilters.categories.length === 0 ||
                activeFilters.categories.some(cat => template.categories?.includes(cat));
            if (!matchesCategory) return false;

            const matchesIndustry = activeFilters.industries.length === 0 ||
                activeFilters.industries.includes(template.industry);
            if (!matchesIndustry) return false;

            const matchesEsp = activeFilters.compatibleESPs.length === 0 ||
                activeFilters.compatibleESPs.some(esp => template.compatibleESPs?.includes(esp));
            if (!matchesEsp) return false;

            return true;
        });
    }, [allTemplates, debouncedSearchTerm, activeFilters, ratingFilter, sortBy]);
    
    const handleFilterChange = (filterType: keyof typeof activeFilters, value: string, isChecked: boolean) => {
        setActiveFilters(prev => {
            const currentValues = prev[filterType];
            const newValues = isChecked
                ? [...currentValues, value]
                : currentValues.filter(item => item !== value);
            return { ...prev, [filterType]: newValues };
        });
        setCurrentPage(1);
    };

    const handleTagClick = (tag: string) => {
        setInputValue(tag);
        setCurrentPage(1);
    };
    
    const handleClearFilter = (filterType: keyof typeof activeFilters) => {
        setActiveFilters(prev => ({ ...prev, [filterType]: [] }));
    };

    const handleClearAllFilters = () => {
        setActiveFilters({ categories: [], industries: [], compatibleESPs: [] });
        setRatingFilter(0);
        setInputValue('');
    };

    const totalPages = Math.ceil(filteredTemplates.length / ITEMS_PER_PAGE);
    const paginatedTemplates = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredTemplates.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredTemplates, currentPage]);
    
    if (error) {
        return <div className="text-center text-red-400">{error}</div>;
    }

    return (
        <>
            <title>Free HTML Email Templates | EMLinter</title>
            <meta name="description" content="Explore our library of professionally crafted, responsive, and fully customizable HTML email templates. Perfect for your next marketing campaign." />
            <link rel="canonical" href="https://emlinter.app/templates" />
            <div>
                <style>{`
                    /* Custom Scrollbar for Webkit Browsers */
                    .custom-scrollbar::-webkit-scrollbar {
                      width: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                      background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                      background: #4a5568; /* gray-600 */
                      border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                      background: #718096; /* gray-500 */
                    }
                `}</style>
                <header className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 pb-2">
                        Email Template Library
                    </h1>
                    <p className="text-gray-400 mt-2 max-w-3xl mx-auto">
                        Explore professionally crafted, responsive HTML email templates for your next campaign.
                    </p>
                </header>
                
                <div className="md:hidden flex justify-end mb-4">
                    <button 
                        onClick={() => setIsFilterVisible(!isFilterVisible)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-violet-300 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <FilterIcon className="w-4 h-4" />
                        <span>{isFilterVisible ? 'Hide Filters' : 'Show Filters'}</span>
                    </button>
                </div>
                
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <aside className={`${isFilterVisible ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0 mb-8 md:mb-0`}>
                        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 md:sticky md:top-24">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <FilterIcon className="w-5 h-5 text-gray-300" />
                                    <span>Filters</span>
                                </h2>
                                <button 
                                    onClick={handleClearAllFilters} 
                                    className="text-sm text-pink-400 hover:underline"
                                >
                                    Clear All
                                </button>
                            </div>
                             <div className="space-y-4">
                                <div className="border-b border-gray-700/50 pb-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-semibold text-gray-200">Rating</h4>
                                        {ratingFilter > 0 && (
                                            <button onClick={() => setRatingFilter(0)} title="Clear Rating Filter" className="text-gray-500 hover:text-white transition-colors">
                                                <XCircleIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        {[4, 3, 2, 1].map(star => (
                                            <button
                                                key={star}
                                                onClick={() => setRatingFilter(star)}
                                                className={`w-full text-left flex items-center gap-2 p-1 rounded-md transition-colors ${ratingFilter === star ? 'bg-pink-600/20 text-pink-300' : 'hover:bg-gray-700/80'}`}
                                            >
                                                {[...Array(5)].map((_, i) => (
                                                    <StarIcon key={i} className={`w-4 h-4 ${i < star ? 'text-yellow-400' : 'text-gray-600'}`} />
                                                ))}
                                                <span className="text-sm text-gray-300">& up</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <FilterSection 
                                    title="Categories" 
                                    options={filterOptions.categories} 
                                    selected={activeFilters.categories}
                                    onChange={(option, checked) => handleFilterChange('categories', option, checked)}
                                    onClear={() => handleClearFilter('categories')}
                                />
                                <FilterSection 
                                    title="Industry" 
                                    options={filterOptions.industries} 
                                    selected={activeFilters.industries}
                                    onChange={(option, checked) => handleFilterChange('industries', option, checked)}
                                    onClear={() => handleClearFilter('industries')}
                                />
                                <FilterSection 
                                    title="Compatible ESPs" 
                                    options={filterOptions.compatibleESPs} 
                                    selected={activeFilters.compatibleESPs}
                                    onChange={(option, checked) => handleFilterChange('compatibleESPs', option, checked)}
                                    onClear={() => handleClearFilter('compatibleESPs')}
                                />
                             </div>
                        </div>
                    </aside>
                    
                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                         <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
                            <div className="relative flex-grow w-full">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search templates by title, description, or tags..."
                                    value={inputValue}
                                    onChange={e => {
                                        setInputValue(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-10 pr-10 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none"
                                />
                                {inputValue && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <button
                                            onClick={() => setInputValue('')}
                                            className="text-gray-500 hover:text-white transition-colors"
                                            aria-label="Clear search"
                                        >
                                            <XCircleIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="relative flex-shrink-0 w-full sm:w-auto">
                                <label htmlFor="sort-by" className="sr-only">Sort by</label>
                                <select
                                    id="sort-by"
                                    value={sortBy}
                                    onChange={e => {
                                        setSortBy(e.target.value as SortOption);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full sm:w-48 appearance-none pl-3 pr-8 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none"
                                >
                                    <option value="newest">Sort by: Newest</option>
                                    <option value="highestRated">Sort by: Highest Rated</option>
                                    <option value="mostPopular">Sort by: Most Popular</option>
                                </select>
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                             <div className="flex justify-center items-center h-96">
                                <SpinnerIcon className="animate-spin h-10 w-10 text-pink-500" />
                             </div>
                        ) : paginatedTemplates.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {paginatedTemplates.map(template => (
                                        <TemplateCard key={template.id} template={template} onTagClick={handleTagClick} />
                                    ))}
                                </div>
                                
                                {totalPages > 1 && (
                                    <nav className="mt-12 flex justify-center items-center gap-2">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button 
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-10 h-10 rounded-md text-sm font-semibold transition-colors ${currentPage === page ? 'bg-pink-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </nav>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-16 bg-gray-800/30 rounded-lg">
                                 <MailIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold">No Templates Found</h3>
                                <p className="text-gray-400 mt-2">Try adjusting your search or filter criteria.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
};
export default TemplatesPage;