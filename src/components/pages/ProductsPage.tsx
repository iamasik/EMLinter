import React, { useState, useEffect } from 'react';
import { getProducts } from '../../services/firebase';
import type { Product } from '../../types';
import { SpinnerIcon, ShoppingBagIcon, StarIcon } from '../Icons';

const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
    <a href={`/resources/products/${product.slug}`}
        className="group flex flex-col rounded-xl bg-gray-800/50 border border-gray-700/50 overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-pink-500/50 h-full">
        <div className="relative w-full h-56 overflow-hidden bg-gray-900">
            <img src={product.thumbnailUrl || 'https://via.placeholder.com/600x400/1F2937/FFFFFF?text=Product'} alt={product.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute top-3 right-3 bg-gray-900/90 backdrop-blur-md px-3 py-1 rounded-full border border-gray-700">
                <span className="text-sm font-bold text-white">{product.isFree ? 'FREE' : `$${product.price}`}</span>
            </div>
            {product.productType && <span className="absolute top-3 left-3 text-xs bg-pink-600 text-white font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">{product.productType}</span>}
        </div>
        <div className="p-5 flex flex-col flex-grow">
            <h3 className="text-lg font-bold text-gray-100 group-hover:text-pink-400 transition-colors mb-2">{product.name}</h3>
            <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-grow">{product.shortDescription}</p>
            <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                <div className="flex items-center gap-1 text-sm text-gray-400">
                    {product.averageRating ? (
                        <><StarIcon className="w-4 h-4 text-yellow-400" /><span className="font-semibold text-gray-200">{product.averageRating}</span><span>({product.reviewCount || 0})</span></>
                    ) : <span className="text-xs">New Release</span>}
                </div>
                <span className="text-xs text-pink-400 font-semibold group-hover:underline">View Details &rarr;</span>
            </div>
        </div>
    </a>
);

const ProductsPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getProducts().then(setProducts).catch(err => { console.error(err); setError("Failed to load products."); }).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex justify-center items-center h-96"><SpinnerIcon className="animate-spin h-10 w-10 text-pink-500" /></div>;
    if (error) return <div className="text-center text-red-400 py-16">{error}</div>;

    return (
        <div>
            <header className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 pb-2">Premium Tools & Products</h1>
                <p className="text-gray-400 mt-2 max-w-2xl mx-auto">Supercharge your email workflow with our curated collection of professional templates, components, and developer tools.</p>
            </header>
            {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map(product => <ProductCard key={product.id} product={product} />)}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-800/30 rounded-lg">
                    <ShoppingBagIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-200">No Products Found</h3>
                    <p className="text-gray-400 mt-2">Check back soon for new releases!</p>
                </div>
            )}
        </div>
    );
};
export default ProductsPage;
