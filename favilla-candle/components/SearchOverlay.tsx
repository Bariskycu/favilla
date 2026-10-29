import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight } from 'lucide-react';
import { useStore } from '../store';
import { translations } from '../translations';
import { getProducts } from '../constants';
import { Link } from 'react-router-dom';

export const SearchOverlay: React.FC = () => {
    const { isSearchOpen, toggleSearch, language } = useStore();
    const t = translations[language];
    const products = getProducts(language);
    
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isSearchOpen && inputRef.current) {
            // Slight delay to allow animation to start
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isSearchOpen]);

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') toggleSearch(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [toggleSearch]);

    const filteredProducts = query 
        ? products.filter(p => 
            p.name.toLowerCase().includes(query.toLowerCase()) || 
            p.tagline.toLowerCase().includes(query.toLowerCase())
          ) 
        : [];

    return (
        <AnimatePresence>
            {isSearchOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[100] bg-offWhite/95 backdrop-blur-xl flex flex-col"
                >
                    {/* Header/Input Area */}
                    <div className="max-w-4xl mx-auto w-full px-6 pt-24 md:pt-32 pb-8 border-b border-softBlack/5">
                        <div className="relative">
                            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-softBlack/30" size={32} />
                            <input 
                                ref={inputRef}
                                type="text" 
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={t.search.placeholder}
                                className="w-full bg-transparent border-none outline-none font-serif text-3xl md:text-5xl placeholder:text-softBlack/10 text-softBlack pl-12 md:pl-16"
                            />
                            <button 
                                onClick={() => toggleSearch(false)}
                                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:bg-softBlack/5 rounded-full transition-colors"
                            >
                                <X size={24} className="text-softBlack/50" />
                            </button>
                        </div>
                    </div>

                    {/* Results Area */}
                    <div className="flex-1 overflow-y-auto max-w-4xl mx-auto w-full px-6 py-12">
                        {query ? (
                            <div className="space-y-8">
                                <h3 className="text-xs font-bold tracking-widest uppercase text-softBlack/40">
                                    {filteredProducts.length} {t.search.results}
                                </h3>
                                
                                {filteredProducts.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {filteredProducts.map(product => (
                                            <Link 
                                                key={product.id} 
                                                to={`/product/${product.id}`}
                                                onClick={() => toggleSearch(false)}
                                                className="flex gap-4 group"
                                            >
                                                <div className="w-20 h-24 bg-neutral-100 flex-shrink-0 overflow-hidden rounded-sm">
                                                    <img src={product.image} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-serif text-xl group-hover:text-softBlack/70 transition-colors">{product.name}</h4>
                                                    <p className="text-xs text-softBlack/50 uppercase tracking-wider mt-1 mb-2">{product.tagline}</p>
                                                    <span className="text-sm font-medium">${product.discountPrice || product.price}</span>
                                                </div>
                                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0 duration-300">
                                                    <ArrowRight size={20} className="text-softBlack/30" />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-softBlack/40 italic font-serif text-xl">
                                        {t.search.noResults}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 opacity-50">
                                <div>
                                    <h3 className="text-xs font-bold tracking-widest uppercase text-softBlack/40 mb-6">{t.search.quickLinks}</h3>
                                    <div className="flex flex-col gap-4 items-start">
                                        <Link to="/shop" onClick={() => toggleSearch(false)} className="font-serif text-xl hover:translate-x-2 transition-transform">{t.search.quickLinkItems.table}</Link>
                                        <Link to="/shop" onClick={() => toggleSearch(false)} className="font-serif text-xl hover:translate-x-2 transition-transform">{t.search.quickLinkItems.pendants}</Link>
                                        <Link to="/shop" onClick={() => toggleSearch(false)} className="font-serif text-xl hover:translate-x-2 transition-transform">{t.search.quickLinkItems.atelier}</Link>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold tracking-widest uppercase text-softBlack/40 mb-6">{t.search.trending}</h3>
                                    <div className="flex flex-col gap-4 items-start">
                                        <button onClick={() => setQuery('Ember')} className="font-serif text-xl hover:translate-x-2 transition-transform">{t.search.trends.orbit}</button>
                                        <button onClick={() => setQuery('Luna')} className="font-serif text-xl hover:translate-x-2 transition-transform">{t.search.trends.halo}</button>
                                        <button onClick={() => setQuery('Void')} className="font-serif text-xl hover:translate-x-2 transition-transform">{t.search.trends.cream}</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Footer Hint */}
                    <div className="py-6 text-center text-[10px] font-bold tracking-widest uppercase text-softBlack/20 border-t border-softBlack/5">
                        {t.search.pressEsc}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};