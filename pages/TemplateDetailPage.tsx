import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTemplateBySlug, updateTemplateRating } from '../services/firebase';
import type { Template } from '../types';
import { SpinnerIcon, DesktopIcon, MobileIcon, StarIcon, DownloadIcon, LitmusIcon, EmailOnAcidIcon, CodeIcon } from '../components/Icons';

const TemplateDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [template, setTemplate] = useState<Template | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
    
    const [hoverRating, setHoverRating] = useState(0);
    const [hasRated, setHasRated] = useState(false);
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);

    useEffect(() => {
        const fetchTemplate = async () => {
            if (!slug) {
                setError("Template not specified.");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                setError(null);
                setHasRated(false); // Reset rating status on new template load
                const fetchedTemplate = await getTemplateBySlug(slug);
                if (fetchedTemplate) {
                    setTemplate(fetchedTemplate);
                    // Check local storage if user has already rated this template
                    if (localStorage.getItem(`emlinter-rated-${fetchedTemplate.id}`)) {
                        setHasRated(true);
                    }
                } else {
                    setError("Template not found.");
                }
            } catch (err) {
                console.error("Error fetching template:", err);
                setError("Failed to load template details.");
            } finally {
                setLoading(false);
            }
        };
        fetchTemplate();
    }, [slug]);

    const handleRatingSubmit = async (rating: number) => {
        if (hasRated || isSubmittingRating || !template) return;
        setIsSubmittingRating(true);
        try {
            const { newAverage, newCount } = await updateTemplateRating(template.id, rating);
            setTemplate(prev => prev ? { ...prev, averageRating: newAverage, numberOfRatings: newCount } : null);
            localStorage.setItem(`emlinter-rated-${template.id}`, 'true');
            setHasRated(true);
        } catch (error) {
            console.error("Failed to submit rating:", error);
            alert("There was an error submitting your rating. Please try again.");
        } finally {
            setIsSubmittingRating(false);
        }
    };

    const handleTagClick = (type: 'categories' | 'industries', value: string) => {
        navigate('/templates', { state: { type, value } });
    };
    
    const handleStartEditing = () => {
        if (!template) return;
        navigate(`/visual-editor/${template.slug}`);
    };

    const handleDownload = async () => {
        if (!template?.htmlFileUrl) return;
        try {
            const response = await fetch(template.htmlFileUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${template.slug}.html`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (e) {
            console.error("Download failed:", e);
            alert("Could not download the file. Please try again later.");
        }
    };
    
    if (loading) {
        return <div className="flex justify-center items-center h-96"><SpinnerIcon className="animate-spin h-10 w-10 text-pink-500" /></div>;
    }

    if (error) {
        return <div className="text-center text-red-400 py-16">{error}</div>;
    }

    if (!template) {
        return null;
    }

    const ratingValue = template.averageRating || 0;
    const numberOfRatings = template.numberOfRatings || 0;

    return (
        <>
            <title>{`${template.title} | EMLinter Template`}</title>
            <meta name="description" content={template.seoMetaDescription} />
            <link rel="canonical" href={`https://emlinter.app/templates/${template.slug}`} />
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
                    {/* Left Column: Preview */}
                    <div className="lg:col-span-3">
                        <div className="sticky top-24">
                            <div className="flex justify-center sm:justify-start gap-1 bg-gray-800 p-1 rounded-t-lg max-w-min">
                                <button onClick={() => setViewMode('desktop')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${viewMode === 'desktop' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}>
                                    <DesktopIcon className="w-5 h-5" /> Desktop
                                </button>
                                {template.mobilePreviewUrl && (
                                    <button onClick={() => setViewMode('mobile')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${viewMode === 'mobile' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}>
                                        <MobileIcon className="w-5 h-5" /> Mobile
                                    </button>
                                )}
                            </div>
                            <div className="bg-gray-800/50 rounded-b-xl rounded-r-xl border border-gray-700 p-4 shadow-2xl">
                                <div className={`mx-auto bg-white transition-all duration-300 ease-in-out ${viewMode === 'mobile' ? 'w-[375px]' : 'w-full'}`}>
                                    <img src={viewMode === 'mobile' ? template.mobilePreviewUrl : template.desktopPreviewUrl} alt={`${template.title} ${viewMode} preview`} className="w-full h-auto border border-gray-300" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="lg:col-span-2">
                        <div className="space-y-6">
                            <h1 className="text-3xl font-bold text-gray-100">{template.title}</h1>
                            
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-400">
                                 <div className="flex items-center gap-1">
                                    <StarIcon className="w-5 h-5 text-yellow-400" />
                                    <span className="font-semibold text-white">{ratingValue.toFixed(1)}</span>
                                    <span className="text-sm">({numberOfRatings} Ratings)</span>
                                </div>
                                <div className="h-5 w-px bg-gray-700"></div>
                                {hasRated ? (
                                    <span className="text-sm text-green-400">Thanks for rating!</span>
                                ) : (
                                    <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                disabled={isSubmittingRating}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onClick={() => handleRatingSubmit(star)}
                                                className="disabled:cursor-wait p-0 bg-transparent border-none"
                                                aria-label={`Rate ${star} stars`}
                                            >
                                                <StarIcon
                                                    className={`w-5 h-5 transition-colors ${
                                                        (hoverRating > 0 ? star <= hoverRating : star <= Math.round(ratingValue)) 
                                                        ? 'text-yellow-400' 
                                                        : 'text-gray-600'
                                                    } hover:text-yellow-300`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Industry</h3>
                                    <button onClick={() => handleTagClick('industries', template.industry)} className="text-sm bg-cyan-800/50 text-cyan-300 px-3 py-1 rounded-full hover:bg-cyan-800 transition-colors">{template.industry}</button>
                                </div>
                                 <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Categories</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {template.categories.map(cat => (
                                            <button key={cat} onClick={() => handleTagClick('categories', cat)} className="text-sm bg-gray-700 text-gray-300 px-3 py-1 rounded-full hover:bg-gray-600 transition-colors">{cat}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                 <button
                                    onClick={handleStartEditing}
                                    className="flex-1 px-6 py-3 font-semibold text-white bg-gradient-to-r from-pink-600 to-violet-600 rounded-lg hover:from-pink-700 hover:to-violet-700 transform hover:scale-105 transition shadow-lg flex items-center justify-center gap-2"
                                >
                                    <CodeIcon className="w-5 h-5"/>
                                    <span>Start Editing</span>
                                </button>
                                 <button onClick={handleDownload} className="flex-1 px-6 py-3 font-semibold text-violet-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
                                    <DownloadIcon className="w-5 h-5"/>
                                    Download Now
                                </button>
                            </div>
                            
                            <div>
                                 <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Ready For</h3>
                                 <div className="flex flex-wrap gap-4 items-center">
                                    {template.compatibleESPs.slice(0, 6).map(esp => (
                                        <span key={esp} className="text-sm text-gray-300">{esp}</span>
                                    ))}
                                    {template.compatibleESPs.length > 6 && <span className="text-sm text-gray-500">& {template.compatibleESPs.length - 6} more</span>}
                                 </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Tested With</h3>
                                <div className="flex gap-4 items-center">
                                    <div className="flex items-center gap-2 text-green-400">
                                        <LitmusIcon className="w-6 h-6"/>
                                        <span className="font-semibold">Litmus</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-green-400">
                                        <EmailOnAcidIcon className="w-6 h-6"/>
                                        <span className="font-semibold">Email on Acid</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
                                <p className="text-gray-400 whitespace-pre-line">{template.fullDescription}</p>
                            </div>
                            
                             <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {template.tags.map(tag => (
                                        <span key={tag} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">{tag}</span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Designer</h3>
                                <p className="text-gray-300 font-semibold">{template.designer}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
export default TemplateDetailPage;