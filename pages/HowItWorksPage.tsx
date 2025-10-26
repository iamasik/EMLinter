import React, { useState, useEffect } from 'react';
import { getVideoGuides } from '../services/firebase';
import type { VideoGuide } from '../types';
import { SpinnerIcon, PlayCircleIcon, BookOpenIcon } from '../components/Icons';

const extractYouTubeId = (url: string): string | null => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
};

const HowItWorksPage = () => {
    const [videoGuides, setVideoGuides] = useState<VideoGuide[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<VideoGuide | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGuides = async () => {
            try {
                setLoading(true);
                const guides = await getVideoGuides();
                setVideoGuides(guides);
                if (guides.length > 0) {
                    setSelectedVideo(guides[0]);
                }
            } catch (err) {
                console.error("Error fetching video guides:", err);
                setError("Failed to load video guides. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchGuides();
    }, []);

    useEffect(() => {
        if (videoGuides && videoGuides.length > 0) {
            const videoSchema = videoGuides.map(guide => {
                const videoId = extractYouTubeId(guide.videoUrl);
                if (!videoId) return null;
                return {
                    "@context": "https://schema.org",
                    "@type": "VideoObject",
                    "name": guide.title,
                    "description": guide.description,
                    "thumbnailUrl": `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
                    "uploadDate": guide.createdAt?.toDate ? guide.createdAt.toDate().toISOString() : new Date().toISOString(),
                    "embedUrl": `https://www.youtube.com/embed/${videoId}`
                };
            }).filter(Boolean); // Filter out any nulls if videoId extraction failed
            
            if(videoSchema.length > 0) {
                const script = document.createElement('script');
                script.type = 'application/ld+json';
                script.id = 'video-guides-schema';
                script.innerHTML = JSON.stringify(videoSchema);
                document.head.appendChild(script);
            }
        }
        
        return () => {
            const existingScript = document.getElementById('video-guides-schema');
            if (existingScript) {
                document.head.removeChild(existingScript);
            }
        };
    }, [videoGuides]);

    const selectedVideoId = selectedVideo ? extractYouTubeId(selectedVideo.videoUrl) : null;

    return (
        <>
            <title>How It Works | Video Guides & Tutorials | EMLinter</title>
            <meta name="description" content="Watch our video guides to learn how to use EMLinter's powerful toolkit to validate, fix, and visually edit your HTML emails." />
            <link rel="canonical" href="https://emlinter.app/how-it-works" />
            <div>
                <header className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 pb-2">
                        How It Works
                    </h1>
                    <p className="text-gray-400 mt-2 max-w-3xl mx-auto">
                        Watch our video guides to learn how to use EMLinter's powerful toolkit to validate, fix, and visually edit your HTML emails.
                    </p>
                </header>

                {loading ? (
                    <div className="flex justify-center items-center h-96"><SpinnerIcon className="animate-spin h-10 w-10 text-pink-500" /></div>
                ) : error ? (
                    <div className="text-center text-red-400 py-16">{error}</div>
                ) : videoGuides.length === 0 ? (
                     <div className="text-center py-20 bg-gray-800/30 rounded-lg">
                        <BookOpenIcon className="w-16 h-16 text-gray-500 mx-auto mb-4"/>
                        <h2 className="text-2xl font-semibold">No Video Guides Available</h2>
                        <p className="text-gray-400 mt-2">
                            Tutorials and step-by-step instructions are coming soon. Stay tuned!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Left Column (Playlist) - order-2 on mobile */}
                        <aside className="md:col-span-1 md:order-1 order-2">
                             <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 sticky top-24">
                                <h2 className="text-lg font-bold mb-4 px-2">Video Playlist</h2>
                                <ul className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                                    {videoGuides.map(video => (
                                        <li key={video.id}>
                                            <button 
                                                onClick={() => setSelectedVideo(video)}
                                                className={`w-full text-left flex items-start gap-3 p-3 rounded-lg transition-colors duration-200 ${selectedVideo?.id === video.id ? 'bg-violet-600/30 text-white' : 'hover:bg-gray-700/50'}`}
                                            >
                                                <PlayCircleIcon className={`w-6 h-6 flex-shrink-0 mt-0.5 ${selectedVideo?.id === video.id ? 'text-violet-300' : 'text-gray-400'}`} />
                                                <span className="text-sm font-medium">{video.title}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </aside>

                        {/* Right Column (Player & Details) - order-1 on mobile */}
                        <main className="md:col-span-2 md:order-2 order-1">
                            {selectedVideo && selectedVideoId ? (
                                 <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                                    <div className="relative mb-4" style={{ paddingTop: '56.25%' /* 16:9 Aspect Ratio */ }}>
                                        <iframe 
                                            src={`https://www.youtube.com/embed/${selectedVideoId}`} 
                                            title={selectedVideo.title} 
                                            frameBorder="0" 
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                            allowFullScreen
                                            className="absolute top-0 left-0 w-full h-full rounded-lg"
                                        ></iframe>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-100">{selectedVideo.title}</h3>
                                    <p className="text-gray-400 mt-2 whitespace-pre-line">{selectedVideo.description}</p>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full bg-gray-800/30 rounded-lg">
                                    <p className="text-gray-500">Please select a video from the playlist.</p>
                                </div>
                            )}
                        </main>
                    </div>
                )}
            </div>
        </>
    );
};

export default HowItWorksPage;