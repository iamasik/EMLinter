import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPosts, getRecommendedPosts } from '../services/firebase';
import type { Post } from '../types';
import { SpinnerIcon, NewspaperIcon, TrendingUpIcon } from '../components/Icons';

const ITEMS_PER_PAGE = 9;

const formatDate = (timestamp: any): string => {
    if (!timestamp || typeof timestamp.toDate !== 'function') {
        return 'Date unavailable';
    }
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);
};

const PostCard: React.FC<{ post: Post; }> = ({ post }) => {
    return (
        <Link 
            to={`/blog/${post.slug}`}
            className="group flex flex-col rounded-xl bg-gray-800/50 border border-gray-700/50 overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-pink-500/50 cursor-pointer">
            <div className="relative w-full h-48 overflow-hidden">
                <img
                    src={post.thumbnailUrl || 'https://via.placeholder.com/600x400/1F2937/FFFFFF?text=EMLinter'}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                {post.categories?.[0] && (
                     <span className="absolute top-3 left-3 text-xs bg-pink-600 text-white font-semibold px-2.5 py-1 rounded-full">{post.categories[0]}</span>
                )}
            </div>
            <div className="p-5 flex flex-col flex-grow">
                <p className="text-xs text-gray-400 mb-2">
                    By <span className="font-semibold text-gray-300">{post.author}</span> &bull; {formatDate(post.createdAt)}
                </p>
                <h3 className="text-lg font-bold text-gray-100 group-hover:text-pink-400 transition-colors flex-grow min-h-[3.5rem]">
                    {post.title}
                </h3>
                <p className="text-sm text-gray-400 mt-2">
                    {post.seoMetaDescription}
                </p>
                <div className="mt-4 pt-4 border-t border-gray-700/50 flex flex-wrap gap-2">
                    {post.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">#{tag}</span>
                    ))}
                </div>
            </div>
        </Link>
    );
};

const RecommendedPostsSidebar: React.FC<{ posts: Post[], loading: boolean }> = ({ posts, loading }) => (
    <aside className="lg:col-span-1">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 sticky top-24">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                <TrendingUpIcon className="w-6 h-6 text-pink-400" />
                <span>Recommended Reads</span>
            </h2>
            {loading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse flex flex-col">
                            <div className="h-4 bg-gray-700 rounded w-5/6 mb-2"></div>
                            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <ul className="space-y-3">
                    {posts.map(post => (
                        <li key={post.id}>
                            <Link
                                to={`/blog/${post.slug}`}
                                className="text-left w-full group"
                            >
                                <p className="font-medium text-sm leading-snug text-gray-200 group-hover:text-pink-400 transition-colors">{post.title}</p>
                                <p className="text-xs text-gray-500 mt-1">by {post.author}</p>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    </aside>
);

const BlogPage = () => {
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [recommendedPosts, setRecommendedPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingRecs, setLoadingRecs] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                setLoadingRecs(true);
                const [posts, recPosts] = await Promise.all([
                    getPosts(),
                    getRecommendedPosts()
                ]);
                setAllPosts(posts);
                setRecommendedPosts(recPosts);
            } catch (err) {
                console.error("Error fetching posts:", err);
                setError("Failed to load blog posts. Please try again later.");
            } finally {
                setLoading(false);
                setLoadingRecs(false);
            }
        };
        fetchAllData();
    }, []);
    
    const totalPages = Math.ceil(allPosts.length / ITEMS_PER_PAGE);
    const paginatedPosts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return allPosts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [allPosts, currentPage]);
    
    if (error) {
        return <div className="text-center text-red-400">{error}</div>;
    }

    return (
        <>
            <title>Blog | HTML Email Development Insights | EMLinter</title>
            <meta name="description" content="Insights, tutorials, and updates on HTML email development from the EMLinter team. Stay ahead with the latest tips and tricks." />
            <link rel="canonical" href="https://emlinter.app/blog" />
            <div>
                <header className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 pb-2">
                        EMLinter Blog
                    </h1>
                    <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
                        Insights, tutorials, and updates on HTML email development from the EMLinter team.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <main className="lg:col-span-3">
                        {loading ? (
                             <div className="flex justify-center items-center h-96">
                                <SpinnerIcon className="animate-spin h-10 w-10 text-pink-500" />
                             </div>
                        ) : paginatedPosts.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {paginatedPosts.map(post => (
                                        <PostCard key={post.id} post={post} />
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
                            <div className="text-center py-20 bg-gray-800/30 rounded-lg">
                                 <NewspaperIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold">No Posts Yet</h3>
                                <p className="text-gray-400 mt-2">Check back soon for articles and updates!</p>
                            </div>
                        )}
                    </main>
                    <RecommendedPostsSidebar posts={recommendedPosts} loading={loadingRecs} />
                </div>
            </div>
        </>
    );
};

export default BlogPage;