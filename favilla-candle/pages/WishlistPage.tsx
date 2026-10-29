import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import { translations } from '../translations';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { Heart, ArrowRight, Loader2 } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Product } from '../types';

export const WishlistPage: React.FC = () => {
    // Destructure fetchWishlist from store to ensure we sync global state
    const { language, isAuthenticated, fetchWishlist: fetchStoreWishlist, addToast } = useStore();
    const t = translations[language];
    const navigate = useNavigate();
    const location = useLocation();

    // We store fully resolved Products here
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            addToast(t.wishlist.loginRequired, 'info');
            navigate('/login', { state: { from: location } });
            return;
        }

        const loadData = async () => {
            try {
                setLoading(true);
                // 1. Sync global store
                // 1. Sync global store and get items
                const wishlistItems = await fetchStoreWishlist();
                // 2. Fetch the raw wishlist items
                // Log raw response
                console.log("Wishlist Items from Store/API:", wishlistItems);

                let resolvedProducts: Product[] = [];

                if (Array.isArray(wishlistItems)) {
                    // 3. Resolve products.
                    const promises = wishlistItems.map(async (item: any) => {
                        // Helper to find the ID, handling potential casing issues
                        const pid = item.productId || item.product_id || (typeof item.product === 'string' ? item.product : null);

                        // Case A: Product is already included as object
                        if (item.product && typeof item.product === 'object' && item.product.id) {
                            return item.product as Product;
                        }

                        // Case B: Product is missing or is just an ID, use pid to fetch
                        if (pid) {
                            try {
                                const p = await api.products.getById(pid);
                                return p;
                            } catch (e) {
                                console.warn(`Failed to fetch product details for ${pid}`, e);
                                return null;
                            }
                        }
                        return null;
                    });

                    const results = await Promise.all(promises);
                    resolvedProducts = results.filter((p): p is Product => p !== null);
                } else {
                    console.error("Wishlist response was not an array:", wishlistItems);
                }

                setProducts(resolvedProducts);
            } catch (error) {
                console.error("Failed to fetch wishlist", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [isAuthenticated, navigate, location, fetchStoreWishlist]);

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-offWhite pt-24 md:pt-32 pb-24 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
                >
                    <div>
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-red-500 mb-4 shadow-sm">
                            <Heart size={20} className="fill-red-500" />
                        </div>
                        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-softBlack">
                            {t.wishlist.title}
                        </h1>
                    </div>
                    <div className="text-softBlack/50 font-sans text-sm tracking-widest uppercase">
                        {products.length} {t.wishlist.items}
                    </div>
                </motion.div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-24">
                        <Loader2 className="animate-spin text-softBlack/30" size={32} />
                    </div>
                ) : products.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12"
                    >
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-24 text-center border-y border-softBlack/5"
                    >
                        <Heart size={48} className="mx-auto text-neutral-200 mb-6" />
                        <h2 className="font-serif text-2xl text-softBlack mb-2">{t.wishlist.empty}</h2>
                        <p className="text-softBlack/50 mb-8 max-w-sm mx-auto">{t.wishlist.emptyDesc}</p>
                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-2 border-b border-softBlack pb-1 text-xs font-bold tracking-widest uppercase hover:text-softBlack/60 transition-colors"
                        >
                            {t.wishlist.explore} <ArrowRight size={14} />
                        </Link>
                    </motion.div>
                )}
            </div>
        </div>
    );
};