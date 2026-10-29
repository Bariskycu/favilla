import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame } from 'lucide-react';
import { useStore } from '../store';
import { translations } from '../translations';

export const NotFoundPage: React.FC = () => {
    const { language } = useStore();
    const t = translations[language];

    return (
        <div className="min-h-screen bg-softBlack flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 z-0 opacity-20">
                 <img 
                    src="https://images.unsplash.com/photo-1610313813959-197931327184?q=80&w=2000&auto=format&fit=crop" 
                    className="w-full h-full object-cover" 
                    alt="Background"
                />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-softBlack via-transparent to-softBlack z-0" />

            <div className="relative z-10 text-center max-w-lg">
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="w-24 h-24 bg-offWhite/10 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10"
                >
                    <Flame size={40} className="text-cream animate-pulse" />
                </motion.div>

                <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="font-serif text-8xl md:text-9xl text-offWhite mb-2 tracking-tight"
                >
                    {t.notFound.title}
                </motion.h1>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-6"
                >
                    <p className="font-serif text-2xl text-cream italic">{t.notFound.subtitle}</p>
                    <p className="text-offWhite/60 font-sans text-sm tracking-wide leading-relaxed">
                        {t.notFound.desc}
                    </p>

                    <Link 
                        to="/"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-cream text-softBlack font-bold tracking-widest uppercase hover:bg-white transition-all duration-300 mt-8 rounded-sm group"
                    >
                        <span>{t.notFound.button}</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};