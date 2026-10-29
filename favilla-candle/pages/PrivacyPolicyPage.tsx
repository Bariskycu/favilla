import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import { translations } from '../translations';
import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
    const { language } = useStore();
    const t = translations[language];

    // Highlights/Key points derived from the sections
    const highlights = [
        { icon: Lock, label: t.privacyPolicy.sections[3].title }, // Data Security
        { icon: Eye, label: t.privacyPolicy.sections[4].title }, // Your Privacy Rights
        { icon: FileText, label: t.privacyPolicy.sections[5].title } // Cookies
    ];

    return (
        <div className="min-h-screen bg-offWhite pt-24 md:pt-32 pb-24 px-6">
            <div className="max-w-7xl mx-auto">

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-16 md:mb-24 flex flex-col items-center text-center"
                >
                    <div className="w-16 h-16 bg-softBlack text-offWhite rounded-full flex items-center justify-center mb-6">
                        <ShieldCheck size={32} strokeWidth={1.5} />
                    </div>
                    <h1 className="font-serif text-4xl md:text-6xl mb-4 text-softBlack tracking-tight">
                        {t.privacyPolicy.title}
                    </h1>
                    <p className="font-sans text-sm md:text-base text-softBlack/60 tracking-wide max-w-lg leading-relaxed">
                        {t.privacyPolicy.subtitle}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">

                    {/* Sidebar / Highlights */}
                    <div className="lg:col-span-4">
                        <div className="lg:sticky lg:top-32 space-y-8 bg-white p-8 border border-neutral-100 shadow-sm">
                            <h3 className="font-serif text-xl italic mb-6">Favilla Privacy</h3>
                            <div className="space-y-6">
                                {highlights.map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 + (idx * 0.1) }}
                                        className="flex items-center gap-4 group"
                                    >
                                        <div className="w-10 h-10 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-400 group-hover:bg-softBlack group-hover:text-white transition-all duration-300">
                                            <item.icon size={18} />
                                        </div>
                                        <span className="text-xs font-bold tracking-widest uppercase text-softBlack/80">
                                            {item.label}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-16">
                        {t.privacyPolicy.sections.map((section: any, idx: number) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + (idx * 0.1) }}
                                className="border-b border-softBlack/10 pb-12 last:border-0"
                            >
                                <h2 className="font-serif text-2xl md:text-3xl mb-6 text-softBlack">
                                    {section.title}
                                </h2>
                                <p className="font-sans text-base leading-loose text-softBlack/70 text-justify">
                                    {section.content}
                                </p>
                            </motion.div>
                        ))}

                        <div className="bg-neutral-100 p-8 md:p-12 text-center mt-12">
                            <p className="font-serif text-xl italic text-softBlack mb-4">
                                {t.common.stillQuestions}
                            </p>
                            <a href="mailto:privacy@favilla.com" className="text-xs font-bold tracking-widest uppercase border-b border-softBlack pb-1 hover:text-softBlack/60 transition-colors">
                                privacy@favilla.com
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
