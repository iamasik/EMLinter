import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { markdownSanitizeSchema } from '../../lib/markdownSanitize';
import { getProductBySlug } from '../../services/firebase';
import type { Product } from '../../types';
import { SpinnerIcon, StarIcon, CheckCircleIcon, BookOpenIcon, ChevronDownIcon } from '../Icons';

const formatDate = (timestamp: any): string => {
    if (!timestamp || typeof timestamp.toDate !== 'function') return '';
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(timestamp.toDate());
};

const extractYouTubeId = (url: string): string | null => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
};

const FAQAccordion: React.FC<{ faq: { question: string; answer: string }[] }> = ({ faq }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    return (
        <div className="space-y-4">
            {faq.map((item, index) => (
                <div key={index} className="border-b border-gray-700 pb-4">
                    <button onClick={() => setOpenIndex(openIndex === index ? null : index)} className="w-full flex justify-between items-center text-left focus:outline-none">
                        <span className="font-semibold text-gray-200 text-lg">{item.question}</span>
                        <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                        <p className="text-gray-400 leading-relaxed">{item.answer}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

const ProductDetailPage: React.FC<{ slug: string }> = ({ slug }) => {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getProductBySlug(slug).then(p => {
            if (p) {
                setProduct(p);
                document.title = `${p.seoTitle || p.name} | EMLinter`;
                const metaDesc = document.querySelector('meta[name="description"]');
                if (metaDesc && p.seoMetaDescription) metaDesc.setAttribute('content', p.seoMetaDescription);
            } else { setError("Product not found."); }
        }).catch(err => { console.error(err); setError("Failed to load product details."); })
        .finally(() => setLoading(false));
    }, [slug]);

    // Product / SoftwareApplication and FAQ JSON-LD are emitted server-side in the
    // [slug].astro shell (crawlable in the initial HTML). The VideoObject schema stays
    // client-side since it depends on the demo video embed rendered here.
    useEffect(() => {
        if (!product?.demoVideoUrl) return;
        const vid = extractYouTubeId(product.demoVideoUrl);
        if (!vid) return;
        const s = document.createElement('script');
        s.type = 'application/ld+json';
        s.innerHTML = JSON.stringify({ "@context": "https://schema.org", "@type": "VideoObject", "name": `${product.name} Demo`, "description": `Watch a demonstration of ${product.name}.`, "thumbnailUrl": `https://i.ytimg.com/vi/${vid}/maxresdefault.jpg`, "uploadDate": product.createdAt?.toDate?.().toISOString(), "embedUrl": `https://www.youtube.com/embed/${vid}` });
        document.head.appendChild(s);
        return () => { try { document.head.removeChild(s); } catch {} };
    }, [product]);

    if (loading) return <div className="flex justify-center items-center h-96"><SpinnerIcon className="animate-spin h-10 w-10 text-pink-500" /></div>;
    if (error || !product) return <div className="text-center text-red-400 py-16">{error || "Product not found"}</div>;

    const videoId = extractYouTubeId(product.demoVideoUrl);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <header className="mb-10 text-center md:text-left md:flex md:justify-between md:items-end border-b border-gray-700/50 pb-8">
                <div>
                    <div className="flex flex-wrap items-center gap-2 mb-3 justify-center md:justify-start">
                        {product.categories.map(cat => <span key={cat} className="bg-violet-900/50 text-violet-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-violet-700/50">{cat}</span>)}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">{product.name}</h1>
                    <p className="text-gray-400 text-sm">
                        Last updated: <time dateTime={product.lastUpdatedAt?.toDate?.().toISOString()}>{formatDate(product.lastUpdatedAt)}</time>
                        {product.version && <span className="ml-3 px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-500">v{product.version}</span>}
                    </p>
                </div>
                {product.averageRating && (
                    <div className="hidden md:flex flex-col items-end">
                        <div className="flex items-center gap-1"><span className="text-2xl font-bold text-white">{product.averageRating}</span><StarIcon className="w-5 h-5 text-yellow-400" /></div>
                        <p className="text-sm text-gray-500">{product.reviewCount} Reviews</p>
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-12">
                    {videoId ? (
                        <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-800 bg-black aspect-video relative">
                            <iframe src={`https://www.youtube.com/embed/${videoId}`} title={`${product.name} Demo`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute top-0 left-0 w-full h-full"></iframe>
                        </div>
                    ) : (
                        <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-800"><img src={product.thumbnailUrl} alt={product.name} fetchpriority="high" className="w-full h-auto" /></div>
                    )}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><CheckCircleIcon className="w-6 h-6 text-green-400" />Key Features</h2>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {product.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-3 bg-gray-800/30 p-4 rounded-lg border border-gray-700/50">
                                    <div className="mt-1 min-w-[16px]"><div className="w-2 h-2 rounded-full bg-pink-500"></div></div>
                                    <span className="text-gray-300 leading-snug">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                    <section className="prose prose-invert prose-lg max-w-none">
                        <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
                        <ReactMarkdown rehypePlugins={[rehypeRaw, [rehypeSanitize, markdownSanitizeSchema]]}>{product.longDescription}</ReactMarkdown>
                    </section>
                    {product.galleryImageUrls?.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6">Gallery</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {product.galleryImageUrls.map((url, idx) => (
                                    <div key={idx} className="rounded-lg overflow-hidden border border-gray-700/50 shadow-lg group">
                                        <img src={url} alt={`${product.name} screenshot ${idx + 1}`} loading="lazy" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                    {product.faq?.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
                            <FAQAccordion faq={product.faq} />
                        </section>
                    )}
                </div>

                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl sticky top-24">
                        <div className="mb-6">
                            <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Price</span>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-4xl font-extrabold text-white">{product.isFree ? 'Free' : `$${product.price}`}</span>
                                {!product.isFree && <span className="text-gray-500">USD</span>}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <a href={product.purchaseUrl} target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-gradient-to-r from-pink-600 to-violet-600 text-white font-bold py-3.5 px-4 rounded-lg hover:from-pink-700 hover:to-violet-700 transition-all shadow-lg">
                                {product.isFree ? 'Download Now' : 'Get It Now'}
                            </a>
                            {product.liveDemoUrl && <a href={product.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-gray-700 text-gray-200 font-semibold py-3.5 px-4 rounded-lg hover:bg-gray-600 transition-colors border border-gray-600">View Live Demo</a>}
                        </div>
                        <div className="mt-6 pt-6 border-t border-gray-700 space-y-4">
                            {product.documentationUrl && <a href={product.documentationUrl} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"><BookOpenIcon className="w-5 h-5 text-gray-500" /><span>Read Documentation</span></a>}
                            <div className="flex items-center gap-2 text-sm text-gray-300"><CheckCircleIcon className="w-5 h-5 text-green-500" /><span>Secure Checkout</span></div>
                            <div className="flex items-center gap-2 text-sm text-gray-300"><CheckCircleIcon className="w-5 h-5 text-green-500" /><span>Instant Access</span></div>
                        </div>
                    </div>
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                        <h3 className="font-bold text-white mb-4">Tech Stack</h3>
                        <div className="flex flex-wrap gap-2">
                            {product.techStack.map(tech => <span key={tech} className="px-3 py-1 bg-gray-900 border border-gray-600 text-gray-300 text-sm rounded-md hover:border-gray-500 cursor-default">{tech}</span>)}
                        </div>
                    </div>
                    {product.tags && (
                        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                            <h3 className="font-bold text-white mb-4">Tags</h3>
                            <div className="flex flex-wrap gap-2">{product.tags.map(tag => <span key={tag} className="text-xs text-gray-500 hover:text-gray-300 cursor-pointer">#{tag}</span>)}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default ProductDetailPage;
