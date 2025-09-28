

const NotFoundPage = ({ onNavigate }: { onNavigate: (path: string) => void }) => {
    return (
        <div className="text-center py-20 flex flex-col items-center justify-center">
            <h1 className="text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
                404
            </h1>
            <h2 className="text-3xl font-bold text-gray-100 mt-4">Page Not Found</h2>
            <p className="text-gray-400 mt-4 max-w-md mx-auto">
                Oops! The page you are looking for might have been moved, deleted, or never existed.
            </p>
            <button
                onClick={() => onNavigate('/')}
                className="mt-8 px-8 py-3 font-semibold text-white bg-gradient-to-r from-pink-600 to-violet-600 rounded-lg hover:from-pink-700 hover:to-violet-700 transform hover:scale-105 transition-transform duration-200 shadow-lg"
            >
                Return to Homepage
            </button>
        </div>
    );
};

export default NotFoundPage;
