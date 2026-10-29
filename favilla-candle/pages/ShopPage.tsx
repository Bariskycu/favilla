import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { ProductType, ProductColor, Product } from '../types';
import { useStore } from '../store';
import { translations } from '../translations';
import { ChevronDown, SlidersHorizontal, Plus, Search } from 'lucide-react';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const ShopPage: React.FC = () => {
    const { language } = useStore();
    const t = translations[language];

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 0 });

    const [filterType, setFilterType] = useState<ProductType | 'all'>('all');
    const [filterColor, setFilterColor] = useState<ProductColor | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sort, setSort] = useState<string>('newest');
    // Debounce search
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => setSearchTerm(debouncedSearch), 500);
        return () => clearTimeout(timer);
    }, [debouncedSearch]);

    // Control dropdown open states
    const [openDropdown, setOpenDropdown] = useState<string | null>('type');

    // Fetch Products Effect
    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        const fetchProducts = async () => {
            if (pagination.page === 1) {
                setLoading(true);
            }

            setError(null);

            try {
                const response = await api.products.getAll({
                    page: pagination.page,
                    limit: pagination.limit,
                    type: filterType !== 'all' ? filterType : undefined,
                    color: filterColor !== 'all' ? filterColor : undefined,
                    search: searchTerm || undefined,
                    sort: sort,
                    lang: language
                });

                if (!signal.aborted) {
                    setProducts(prev => pagination.page === 1 ? response.data : [...prev, ...response.data]);
                    setPagination(prev => ({ ...prev, total: response.pagination.total, totalPages: response.pagination.totalPages }));
                    setLoading(false);
                }
            } catch (error: any) {
                if (!signal.aborted) {
                    console.error('Failed to fetch products', error);
                    setError(t.common?.error || 'Failed to load products. Please try again.');
                    setLoading(false);
                }
            }
        };

        fetchProducts();

        return () => {
            controller.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language, filterType, filterColor, searchTerm, sort, pagination.page]);

    const toggleDropdown = (name: string) => {
        setOpenDropdown(openDropdown === name ? null : name);
    };

    const handleLoadMore = () => {
        setPagination(prev => ({ ...prev, page: prev.page + 1 }));
    };

    const hasMore = pagination.page < pagination.totalPages;

    const handleFilterChange = (type: 'type' | 'color' | 'sort', value: string) => {
        if (type === 'type') setFilterType(value as ProductType | 'all');
        if (type === 'color') setFilterColor(value as ProductColor | 'all');
        if (type === 'sort') setSort(value);
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1
        setProducts([]); // Clear current products to visually reset
    };

    return (
        <div className="pt-24 md:pt-32 pb-20 px-6 max-w-[1600px] mx-auto min-h-screen">
            <SEO
                title={t.shop.title}
                description={t.shop.seoDescription}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Sidebar Area */}
                <div className="lg:col-span-3">
                    <div className="relative">

                        <Breadcrumbs items={[{ label: t.nav.collection }]} />

                        {/* Header */}
                        <div className="mb-8 lg:mb-12">
                            <h1 className="font-serif text-4xl md:text-6xl mb-4 md:mb-6">{t.shop.title}</h1>
                            <p className="text-sm text-softBlack/60 leading-relaxed max-w-md font-light">
                                {t.shop.subtitle}
                            </p>
                        </div>

                        {/* Unified Filter Section (Desktop & Mobile) */}
                        <div className="mb-12 space-y-6 lg:sticky lg:top-32 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto lg:pr-2 lg:pb-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-softBlack/10 hover:[&::-webkit-scrollbar-thumb]:bg-softBlack/20 [scrollbar-width:thin]">
                            {/* Search Input */}
                            <div className="relative border-b border-softBlack/20 group focus-within:border-softBlack transition-colors">
                                <input
                                    type="text"
                                    placeholder={t.search.placeholder || "Search..."}
                                    value={debouncedSearch}
                                    onChange={(e) => setDebouncedSearch(e.target.value)}
                                    className="w-full py-2 bg-transparent outline-none font-serif text-lg placeholder:text-softBlack/30"
                                />
                                <Search className="absolute right-0 top-1/2 -translate-y-1/2 text-softBlack/30 group-focus-within:text-softBlack transition-colors" size={18} />
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-4 text-softBlack/30 pb-2 border-b border-softBlack/5">
                                    <SlidersHorizontal size={12} />
                                    <span className="text-[10px] uppercase tracking-widest">{t.shop.filterLabel}</span>
                                </div>

                                <FilterDropdown
                                    id="sort"
                                    title={t.shop.sort || "Sort By"}
                                    // Mapping generic sort keys to localized labels if available, otherwise simplified
                                    options={['newest', 'price-asc', 'price-desc', 'rating']}
                                    current={sort}
                                    onChange={(val) => handleFilterChange('sort', val)}
                                    type="sort"
                                    isOpen={openDropdown === 'sort'}
                                    onToggle={() => toggleDropdown('sort')}
                                    t={t}
                                />
                                <FilterDropdown
                                    id="type"
                                    title={t.shop.type}
                                    options={['all', 'jar', 'sculptural', 'set']}
                                    current={filterType}
                                    onChange={(val) => handleFilterChange('type', val)}
                                    type="type"
                                    isOpen={openDropdown === 'type'}
                                    onToggle={() => toggleDropdown('type')}
                                    t={t}
                                />
                                <FilterDropdown
                                    id="color"
                                    title={t.shop.finish}
                                    options={['all', 'natural', 'charcoal', 'terracotta']}
                                    current={filterColor}
                                    onChange={(val) => handleFilterChange('color', val)}
                                    type="color"
                                    isOpen={openDropdown === 'color'}
                                    onToggle={() => toggleDropdown('color')}
                                    t={t}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="lg:col-span-9">
                    <div className="lg:pt-24">
                        <AnimatePresence mode="popLayout">
                            {loading && pagination.page === 1 ? (
                                <div className="flex justify-center py-24">
                                    <div className="animate-pulse flex flex-col items-center">
                                        <div className="h-4 w-4 bg-softBlack rounded-full mb-2"></div>
                                        <span className="text-xs uppercase tracking-widest text-softBlack/50">Loading...</span>
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <p className="text-red-500 mb-4">{error}</p>
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev }))} // Trigger refetch
                                        className="underline text-softBlack hover:text-softBlack/60"
                                    >
                                        {t.common?.retry || 'Retry'}
                                    </button>
                                </div>
                            ) : (
                                <motion.div
                                    layout
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 md:gap-x-8 md:gap-y-16"
                                >
                                    {products.map(product => (
                                        <motion.div
                                            layout
                                            key={product.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.4 }}
                                        >
                                            <ProductCard product={product} />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {!loading && !error && products.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="py-32 flex flex-col items-center justify-center text-center opacity-50 space-y-4"
                            >
                                <SlidersHorizontal size={32} className="opacity-20" />
                                <p className="font-serif text-xl">{t.shop.noResults}</p>
                                <button
                                    onClick={() => { handleFilterChange('type', 'all'); handleFilterChange('color', 'all'); }}
                                    className="text-xs font-bold tracking-widest uppercase border-b border-softBlack pb-1 hover:text-softBlack/60 transition-colors"
                                >
                                    {t.shop.resetFilters}
                                </button>
                            </motion.div>
                        )}

                        {/* Load More Button */}
                        {hasMore && !loading && !error && (
                            <div className="mt-20 flex justify-center">
                                <button
                                    onClick={handleLoadMore}
                                    className="group flex flex-col items-center gap-2 text-softBlack/40 hover:text-softBlack transition-colors"
                                >
                                    <span className="text-[10px] font-bold tracking-widest uppercase">{t.shop.loadMore}</span>
                                    <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Elegant Dropdown Component ---
const FilterDropdown = ({
    id,
    title,
    options,
    current,
    onChange,
    type,
    isOpen,
    onToggle,
    t
}: {
    id: string,
    title: string,
    options: string[],
    current: string,
    onChange: (val: string) => void,
    type: 'type' | 'color' | 'sort',
    isOpen: boolean,
    onToggle: () => void,
    t: any
}) => {
    return (
        <div className="border-b border-softBlack/10 last:border-0">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between py-5 group transition-colors"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-3">
                    <span className={`text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase transition-colors ${isOpen ? 'text-softBlack' : 'text-softBlack/50 group-hover:text-softBlack/80'}`}>
                        {title}
                    </span>
                    {current !== 'all' && (
                        <span className="hidden md:inline-block w-1 h-1 bg-softBlack rounded-full" />
                    )}
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <ChevronDown size={14} className="text-softBlack/40" />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden"
                    >
                        <ul className="pb-6 space-y-1">
                            {options.map(option => {
                                let label = option;
                                if (type === 'type') {
                                    // @ts-ignore
                                    label = t.shop.types[option] || option;
                                } else if (type === 'color') {
                                    // @ts-ignore
                                    label = t.shop.colors[option] || option;
                                } else if (type === 'sort') {
                                    // Simplified mapping for sort options
                                    const sortMap: Record<string, string> = {
                                        'newest': 'Newest',
                                        'price-asc': 'Price: Low to High',
                                        'price-desc': 'Price: High to Low',
                                        'rating': 'Top Rated'
                                    };
                                    label = sortMap[option] || option;
                                }
                                const isActive = current === option;

                                return (
                                    <li key={option}>
                                        <button
                                            onClick={() => onChange(option)}
                                            className={`
                                              w-full text-left py-2 px-2 text-sm transition-all duration-300 border-l-2
                                              ${isActive
                                                    ? 'border-softBlack pl-4 font-serif text-lg italic text-softBlack'
                                                    : 'border-transparent pl-0 text-softBlack/60 hover:text-softBlack hover:pl-2'}
                                          `}
                                        >
                                            {label || option}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};