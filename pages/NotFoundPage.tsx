import React from 'react';
import { Link } from 'react-router-dom';
import { MailIcon, TemplateIcon, CodeIcon } from '../components/Icons';

const NotFoundPage = () => {
    return (
        <>
            <title>404 - Page Not Found | EMLinter</title>
            <meta name="description" content="Oops! The page you're looking for doesn't exist. It might have been moved or deleted." />
            <meta name="robots" content="noindex" />
            <div className="text-center py-16 md:py-24">
                <h1 className="text-6xl md:text-8xl font-extrabold text-pink-500">404</h1>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-100 mt-4">Page Not Found</h2>
                <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mt-6 mb-10">
                    Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <Link to="/" className="px-8 py-3 font-semibold text-white bg-gradient-to-r from-pink-600 to-violet-600 rounded-lg hover:from-pink-700 hover:to-violet-700 transform hover:scale-105 transition-transform duration-200 shadow-lg">
                        Return to Homepage
                    </Link>
                </div>
                 <div className="mt-16 max-w-4xl mx-auto">
                    <p className="text-gray-500 font-semibold mb-6">Or, here are some helpful links:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <Link to="/templates" className="p-6 bg-gray-800/50 border border-gray-700/50 rounded-lg hover:bg-gray-800 hover:border-violet-500/50 transition-all duration-200">
                            <TemplateIcon className="w-8 h-8 mx-auto text-violet-400 mb-3" />
                            <h3 className="font-semibold text-gray-200">Template Library</h3>
                        </Link>
                         <Link to="/code-fix" className="p-6 bg-gray-800/50 border border-gray-700/50 rounded-lg hover:bg-gray-800 hover:border-violet-500/50 transition-all duration-200">
                            <CodeIcon className="w-8 h-8 mx-auto text-violet-400 mb-3" />
                            <h3 className="font-semibold text-gray-200">Code Fix Tool</h3>
                        </Link>
                         <Link to="/contact-us" className="p-6 bg-gray-800/50 border border-gray-700/50 rounded-lg hover:bg-gray-800 hover:border-violet-500/50 transition-all duration-200">
                            <MailIcon className="w-8 h-8 mx-auto text-violet-400 mb-3" />
                            <h3 className="font-semibold text-gray-200">Contact Us</h3>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default NotFoundPage;