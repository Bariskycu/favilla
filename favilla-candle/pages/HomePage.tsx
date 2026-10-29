
import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { VisualSlider } from '../components/VisualSlider';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { ArrowRight, Flame, Droplets } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { Product } from '../types';
import { translations } from '../translations';

export const HomePage: React.FC = () => {
    const { language } = useStore();
    const t = translations[language];
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                // Fetch enough products to show in both sections (popular: 3, featured: 3 = 6 total)
                const response = await api.products.getAll({ limit: 6, lang: language });
                setProducts(response.data);
            } catch (error) {
                console.error('Failed to load products', error);
            }
        };
        fetchFeatured();
    }, [language]);

    const { scrollYProgress } = useScroll();

    // Parallax effect for the aesthetic section image
    const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

    // Shared animation props for the text elements
    const textMotion = {
        initial: { opacity: 0, scale: 0.9 },
        whileInView: { opacity: 1, scale: 1 },
        viewport: { once: true },
        transition: { duration: 1 },
        whileHover: { letterSpacing: "1.2em", color: "#E0D5C7", scale: 1.05 }
    };

    const commonTextClasses = "text-offWhite font-sans font-light uppercase tracking-[0.5em] md:tracking-[0.8em] lg:tracking-[1em] text-xl md:text-4xl lg:text-5xl transition-all duration-700 cursor-default whitespace-nowrap";

    // Story Image
    const storyImg = "https://images.unsplash.com/photo-1596436889106-be35e843f974";
    // Aesthetic Image
    const aestheticImg = "https://images.unsplash.com/photo-1603006905003-be475563bc59";

    return (
        <main className="min-h-screen">
            {/* Visual Slider is now the Hero Section */}
            <VisualSlider />

            <section className="bg-white py-20 md:py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6 md:gap-0">
                        <div>
                            <h2 className="font-serif text-3xl md:text-4xl mb-2">{t.home.popularProducts}</h2>
                            <p className="text-sm md:text-base text-softBlack/50">{t.home.popularCollection}</p>
                        </div>
                        <Link to="/shop" className="group flex items-center gap-2 text-sm font-medium tracking-widest uppercase hover:opacity-60 transition-opacity">
                            {t.home.viewAll} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-8">
                        {products.slice(0, 3).map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-16 md:py-32 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-10%" }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6 md:mb-8 leading-tight">
                            {t.home.storyTitle} <br /> <span className="italic text-gray-400">{t.home.storyTitleItalic}</span>
                        </h2>
                        <p className="font-sans text-base md:text-lg text-softBlack/70 leading-relaxed max-w-md">
                            {t.home.storyText}
                        </p>
                        <div className="mt-8 md:mt-12 flex gap-8">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border border-softBlack/10 flex items-center justify-center">
                                    <Flame className="animate-pulse text-softBlack/60" size={20} />
                                </div>
                                <span className="text-[10px] md:text-xs uppercase tracking-widest">{t.home.rotational}</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border border-softBlack/10 flex items-center justify-center">
                                    <Droplets className="text-softBlack/60" size={20} />
                                </div>
                                <span className="text-[10px] md:text-xs uppercase tracking-widest">{t.home.modular}</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative h-[400px] md:h-[600px] bg-cream/20 rounded-t-full overflow-hidden mt-8 md:mt-0"
                    >
                        <img
                            src={`${storyImg}?q=80&w=800&auto=format&fit=crop`}
                            srcSet={`
                        ${storyImg}?q=80&w=400&auto=format&fit=crop 400w,
                        ${storyImg}?q=80&w=800&auto=format&fit=crop 800w
                    `}
                            sizes="(max-width: 768px) 100vw, 50vw"
                            alt="Candle Pouring Process"
                            width="800"
                            height="1000"
                            loading="lazy"
                            className="w-full h-full object-cover opacity-90"
                        />
                    </motion.div>
                </div>
            </section>

            {/* Aesthetic Statement Section */}
            <section className="relative w-full h-screen overflow-hidden group bg-softBlack">
                {/* Background Image with Hover Zoom */}
                <div className="absolute inset-0 bg-black">
                    <motion.div
                        className="w-full h-full"
                        style={{ y }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 2.5, ease: "easeOut" }}
                    >
                        <img
                            src={`${aestheticImg}?q=80&w=2000&auto=format&fit=crop`}
                            srcSet={`
                        ${aestheticImg}?q=80&w=600&auto=format&fit=crop 600w,
                        ${aestheticImg}?q=80&w=1200&auto=format&fit=crop 1200w,
                        ${aestheticImg}?q=80&w=2000&auto=format&fit=crop 2000w
                    `}
                            sizes="100vw"
                            width="2000"
                            height="1200"
                            alt="Aesthetic Dark Candle"
                            className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-1000"
                        />
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 pointer-events-none" />
                </div>

                {/* Diagonal Text Layout */}
                <div className="absolute inset-0 flex flex-col justify-between p-12 md:p-20 z-10 pointer-events-none">

                    {/* Top Left: Aesthetic */}
                    <div className="w-full flex justify-start pointer-events-auto">
                        <motion.h2
                            {...textMotion}
                            transition={{ ...textMotion.transition, delay: 0.1 }}
                            className={commonTextClasses}
                        >
                            {t.home.aesthetic}
                        </motion.h2>
                    </div>

                    {/* Center: Stylish */}
                    <div className="w-full flex justify-center items-center pointer-events-auto my-auto">
                        <motion.h2
                            {...textMotion}
                            transition={{ ...textMotion.transition, delay: 0.3 }}
                            className={commonTextClasses}
                        >
                            {t.home.stylish}
                        </motion.h2>
                    </div>

                    {/* Bottom Right: Functional */}
                    <div className="w-full flex justify-end pointer-events-auto">
                        <motion.h2
                            {...textMotion}
                            transition={{ ...textMotion.transition, delay: 0.5 }}
                            className={commonTextClasses}
                        >
                            {t.home.functional}<span className="text-cream opacity-50">.</span>
                        </motion.h2>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="bg-white py-20 md:py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6 md:gap-0">
                        <div>
                            <h2 className="font-serif text-3xl md:text-4xl mb-2">{t.home.selectedWorks}</h2>
                            <p className="text-sm md:text-base text-softBlack/50">{t.home.coreCollection}</p>
                        </div>
                        <Link to="/shop" className="group flex items-center gap-2 text-sm font-medium tracking-widest uppercase hover:opacity-60 transition-opacity">
                            {t.home.viewAll} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-8">
                        {products.slice(3, 6).map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
};
