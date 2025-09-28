import React, { useState, useEffect } from 'react';
import { getExperts } from '../services/firebase';
import type { Expert } from '../types';
import { SpinnerIcon, UsersIcon } from '../components/Icons';
import ExpertDetailModal from '../components/modals/ExpertDetailModal';

const ExpertCard: React.FC<{ expert: Expert; onViewDetails: (expert: Expert) => void; }> = ({ expert, onViewDetails }) => {
    return (
        <div className="group relative p-6 rounded-2xl bg-gray-800/50 border border-gray-700/50 overflow-hidden transform transition-transform duration-300 hover:-translate-y-2">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex flex-col items-center text-center h-full">
                <img
                    src={expert.profilePictureUrl}
                    alt={expert.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-700/50 mb-4"
                />
                <h3 className="text-xl font-bold text-gray-100">{expert.name}</h3>
                <p className="text-pink-400 font-semibold text-sm mb-3">{expert.designation}</p>
                <p className="text-gray-400 text-sm mb-6 flex-grow">
                    {expert.description.length > 100 ? `${expert.description.substring(0, 100)}...` : expert.description}
                </p>
                <button
                    onClick={() => onViewDetails(expert)}
                    className="mt-auto w-full px-4 py-2.5 font-semibold text-white bg-gray-700/80 rounded-lg hover:bg-violet-600 transition-colors duration-200"
                >
                    View Details
                </button>
            </div>
        </div>
    );
};

const OurExpertsPage = () => {
    const [experts, setExperts] = useState<Expert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchExperts = async () => {
            try {
                setLoading(true);
                const expertList = await getExperts();
                setExperts(expertList);
            } catch (err) {
                console.error("Error fetching experts:", err);
                setError("Failed to load our experts. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchExperts();
    }, []);

    const handleViewDetails = (expert: Expert) => {
        setSelectedExpert(expert);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        // Delay clearing to allow for modal closing animation
        setTimeout(() => setSelectedExpert(null), 300);
    };

    return (
        <>
            <ExpertDetailModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                expert={selectedExpert}
            />
            <div>
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 pb-2">
                        Our Experts
                    </h1>
                    <p className="text-gray-400 mt-2 max-w-xl mx-auto">
                        Meet the talented individuals behind the EMLinter toolkit, dedicated to simplifying your email development workflow.
                    </p>
                </header>

                {loading ? (
                    <div className="flex justify-center items-center h-64"><SpinnerIcon className="animate-spin h-10 w-10 text-pink-500" /></div>
                ) : error ? (
                    <div className="text-center text-red-400 py-16">{error}</div>
                ) : experts.length === 0 ? (
                    <div className="text-center py-20 bg-gray-800/30 rounded-lg">
                        <UsersIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-semibold">Our Team Is Assembling</h2>
                        <p className="text-gray-400 mt-2">
                            Information about our team of experts will be available here shortly.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {experts.map(expert => (
                            <ExpertCard key={expert.id} expert={expert} onViewDetails={handleViewDetails} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default OurExpertsPage;
