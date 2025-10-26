import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { getPostBySlug, getRecommendedPosts, updatePostVoteCount } from '../services/firebase';
import type { Post } from '../types';
import { SpinnerIcon, ThumbUpIcon, ThumbDownIcon, TrendingUpIcon } from '../components/Icons';

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

const RecommendedPostsSidebar: React.FC<{ posts: Post[], currentPostId: string, loading: boolean }> = ({ posts, currentPostId, loading }) => (
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
                    {posts.filter(p => p.id !== currentPostId).map(post => (
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


const BlogPostPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<Post | null>(null);
    const [recommendedPosts, setRecommendedPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingRecs, setLoadingRecs] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [votes, setVotes] = useState({ helpful: 0, notHelpful: 0 });
    const [votedStatus, setVotedStatus] = useState<'helpful' | 'not-helpful' | null>(null);
    const [isVoting, setIsVoting] = useState(false);

    useEffect(() => {
        const fetchPostData = async () => {
             if (!slug) {
                setError("Blog post not specified.");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                setLoadingRecs(true);
                setError(null);
                setVotedStatus(null);
                const [fetchedPost, recPosts] = await Promise.all([
                    getPostBySlug(slug),
                    getRecommendedPosts()
                ]);

                if (fetchedPost) {
                    setPost(fetchedPost);
                    setVotes({ helpful: fetchedPost.helpfulCount || 0, notHelpful: fetchedPost.notHelpfulCount || 0 });

                    const storedVote = localStorage.getItem(`emlinter-voted-${fetchedPost.id}`);
                    if (storedVote === 'helpful' || storedVote === 'not-helpful') {
                        setVotedStatus(storedVote as 'helpful' | 'not-helpful');
                    }
                } else {
                    setError("Blog post not found.");
                }
                setRecommendedPosts(recPosts);
            } catch (err) {
                console.error("Error fetching post data:", err);
                setError("Failed to load the blog post.");
            } finally {
                setLoading(false);
                setLoadingRecs(false);
            }
        };
        fetchPostData();
    }, [slug]);

    useEffect(() => {
        if (post) {
          const postSchema = {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": window.location.href
            },
            "headline": post.title,
            "image": post.thumbnailUrl || "/favicon.svg",
            "author": {
              "@type": "Person",
              "name": post.author
            },
            "publisher": {
              "@type": "Organization",
              "name": "EMLinter",
              "logo": {
                "@type": "ImageObject",
                "url": "/favicon.svg"
              }
            },
            "datePublished": post.createdAt.toDate().toISOString(),
            "dateModified": post.createdAt.toDate().toISOString()
          };
    
          const script = document.createElement('script');
          script.type = 'application/ld+json';
          script.id = 'blog-post-schema';
          script.innerHTML = JSON.stringify(postSchema);
          document.head.appendChild(script);
        }
    
        return () => {
          const existingScript = document.getElementById('blog-post-schema');
          if (existingScript) {
            document.head.removeChild(existingScript);
          }
        };
    }, [post]);

    const handleVote = async (voteType: 'helpful' | 'not-helpful') => {
        if (votedStatus || isVoting || !post) return;

        setIsVoting(true);
        const keyToUpdate = voteType === 'helpful' ? 'helpful' : 'notHelpful';

        setVotes(prev => ({ ...prev, [keyToUpdate]: prev[keyToUpdate] + 1 }));
        setVotedStatus(voteType);

        try {
            await updatePostVoteCount(post.id, voteType);
            localStorage.setItem(`emlinter-voted-${post.id}`, voteType);
        } catch (error) {
            console.error("Failed to submit vote:", error);
            // Revert optimistic update on failure
            setVotes(prev => ({ ...prev, [keyToUpdate]: prev[keyToUpdate] - 1 }));
            setVotedStatus(null);
            alert("Could not save your vote. Please try again.");
        } finally {
            setIsVoting(false);
        }
    };
    
    if (loading) {
        return <div className="flex justify-center items-center h-96"><SpinnerIcon className="animate-spin h-10 w-10 text-pink-500" /></div>;
    }

    if (error) {
        return <div className="text-center text-red-400 py-16">{error}</div>;
    }

    if (!post) {
        return null;
    }
    
    return (
        <>
            <title>{`${post.title} | EMLinter Blog`}</title>
            <meta name="description" content={post.seoMetaDescription} />
            <link rel="canonical" href={`https://emlinter.app/blog/${post.slug}`} />
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                <article className="lg:col-span-2">
                    <style>{`
                        .prose { color: #D1D5DB; }
                        .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 { color: #F9FAFB; margin-top: 1.5em; margin-bottom: 0.8em; }
                        .prose h1 { font-size: 2.25rem; } .prose h2 { font-size: 1.875rem; } .prose h3 { font-size: 1.5rem; }
                        .prose a { color: #EC4899; text-decoration: underline; transition: color 0.2s; }
                        .prose a:hover { color: #F472B6; }
                        .prose blockquote { border-left-color: #A78BFA; color: #E5E7EB; background-color: rgba(139, 92, 246, 0.1); padding: 1rem; margin-top: 2em; margin-bottom: 2em; }
                        .prose code { background-color: #374151; color: #FBCFE8; padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-size: 0.9em; }
                        .prose pre { background-color: #111827; border: 1px solid #374151; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
                        .prose pre code { background-color: transparent; padding: 0; }
                        .prose ul, .prose ol { list-style: none; padding-left: 0; margin-top: 1.5em; margin-bottom: 1.5em; }
                        .prose li p { margin: 0; }
                        .prose ul li { position: relative; padding-left: 1.75rem; margin-bottom: 0.75rem; }
                        .prose ul li::before { content: ''; position: absolute; left: 0.5rem; top: 0.65em; transform: translateY(-50%); width: 0.5rem; height: 0.5rem; border-radius: 50%; background-color: #EC4899; }
                        .prose ol { counter-reset: ordered-list-counter; }
                        .prose ol li { position: relative; padding-left: 2.5rem; margin-bottom: 0.75rem; counter-increment: ordered-list-counter; }
                        .prose ol li::before { content: counter(ordered-list-counter); position: absolute; left: 0; top: 0.1em; width: 1.75rem; height: 1.75rem; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; color: #F9FAFB; background-color: #8B5CF6; border-radius: 50%; }
                        .prose img { width: 100%; border-radius: 0.75rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); margin-top: 2em; margin-bottom: 2em; }
                    `}</style>

                    <header className="mb-8">
                        <Link to="/blog" className="text-sm font-semibold text-pink-400 hover:text-pink-300 transition-colors mb-4 inline-block">
                            &larr; Back to Blog
                        </Link>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {post.categories?.map(cat => (
                                <span key={cat} className="text-xs bg-violet-800/50 text-violet-300 font-semibold px-3 py-1 rounded-full">{cat}</span>
                            ))}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-50 leading-tight">
                            {post.title}
                        </h1>
                        <div className="mt-6 text-gray-400">
                            <span>By <span className="font-semibold text-gray-200">{post.author}</span></span>
                            <span className="mx-2">&bull;</span>
                            <span>Published on {formatDate(post.createdAt)}</span>
                        </div>
                    </header>

                    {post.thumbnailUrl && (
                        <div className="my-8 rounded-xl overflow-hidden shadow-lg">
                            <img src={post.thumbnailUrl} alt={post.title} className="w-full h-auto object-cover" />
                        </div>
                    )}

                    <div className="prose prose-lg max-w-none">
                        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{post.content}</ReactMarkdown>
                    </div>
                    
                    <footer className="mt-12 pt-8 border-t border-gray-700/50">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {post.tags?.map(tag => (
                                <span key={tag} className="text-sm bg-gray-700 text-gray-300 px-3 py-1 rounded-full">#{tag}</span>
                            ))}
                        </div>
                    </footer>

                    <div className="mt-12 pt-8 border-t border-gray-700/50 text-center">
                        <h3 className="text-lg font-semibold text-gray-200 mb-4">Was this article helpful?</h3>
                        <div className="flex justify-center items-center gap-4">
                            <button 
                                onClick={() => handleVote('helpful')}
                                disabled={!!votedStatus || isVoting}
                                className={`flex items-center gap-2 px-6 py-2 font-semibold rounded-lg transition-all duration-200 disabled:cursor-not-allowed group ${
                                    votedStatus === 'helpful' ? 'bg-green-600 text-white ring-2 ring-green-400' : 'bg-gray-700 text-gray-300 hover:bg-green-800/50 disabled:bg-gray-700/50'
                                }`}
                            >
                                {isVoting && votedStatus === 'helpful' ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : <ThumbUpIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                                <span>Helpful</span>
                                <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                                    votedStatus === 'helpful' ? 'bg-green-700' : 'bg-gray-600'
                                }`}>
                                    {votes.helpful}
                                </span>
                            </button>
                            <button 
                                onClick={() => handleVote('not-helpful')}
                                disabled={!!votedStatus || isVoting}
                                className={`flex items-center gap-2 px-6 py-2 font-semibold rounded-lg transition-all duration-200 disabled:cursor-not-allowed group ${
                                    votedStatus === 'not-helpful' ? 'bg-red-600 text-white ring-2 ring-red-400' : 'bg-gray-700 text-gray-300 hover:bg-red-800/50 disabled:bg-gray-700/50'
                                }`}
                            >
                                {isVoting && votedStatus === 'not-helpful' ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : <ThumbDownIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                                <span>Not Helpful</span>
                                <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                                    votedStatus === 'not-helpful' ? 'bg-red-700' : 'bg-gray-600'
                                }`}>
                                    {votes.notHelpful}
                                </span>
                            </button>
                        </div>
                        {votedStatus && <p className="text-sm text-green-400 mt-4">Thank you for your feedback!</p>}
                    </div>
                </article>

                <RecommendedPostsSidebar posts={recommendedPosts} currentPostId={post.id} loading={loadingRecs} />
            </div>
        </>
    );
};
export default BlogPostPage;