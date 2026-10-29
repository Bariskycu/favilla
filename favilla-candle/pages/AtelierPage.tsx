
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useStore } from '../store';
import { translations } from '../translations';
import { Beaker, Feather, Flame, ArrowUpRight } from 'lucide-react';

export const AtelierPage: React.FC = () => {
    const { language } = useStore();
    const t = translations[language];
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const heroY = useTransform(scrollYProgress, [0, 0.5], ['0%', '30%']);
    const opacityHero = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

    // Image Constants (Base URLs)
    const heroImg = "https://images.unsplash.com/photo-1596436889106-be35e843f974";
    const philosophyImg = "https://images.unsplash.com/photo-1603006905003-be475563bc59";
    const bespokeImg = "https://images.unsplash.com/photo-1617377507198-25f02c658a2f";

    return (
        <div ref={containerRef} className="min-h-screen">

            {/* Immersive Hero Section */}
            <section className="relative h-[80vh] md:h-screen w-full overflow-hidden flex items-center justify-center">
                <motion.div
                    style={{ y: heroY }}
                    className="absolute inset-0 z-0"
                >
                    {/* Workshop Environment / Candle Making */}
                    <img
                        src={`${heroImg}?q=80&w=2000&auto=format&fit=crop`}
                        srcSet={`
                    ${heroImg}?q=80&w=640&auto=format&fit=crop 640w,
                    ${heroImg}?q=80&w=1200&auto=format&fit=crop 1200w,
                    ${heroImg}?q=80&w=2000&auto=format&fit=crop 2000w
                `}
                        sizes="100vw"
                        alt="Atelier Workshop Space"
                        width="2000"
                        height="1200"
                        className="w-full h-full object-cover filter brightness-50"
                        loading="eager" // Hero image
                    />
                </motion.div>

                <motion.div
                    style={{ opacity: opacityHero }}
                    className="relative z-10 text-center text-offWhite p-6"
                >
                    <motion.h1
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="font-serif text-5xl md:text-8xl lg:text-9xl tracking-tight mb-4 md:mb-6"
                    >
                        {t.atelier.hero.title}
                    </motion.h1>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                        className="font-sans text-sm md:text-base tracking-[0.3em] uppercase opacity-80"
                    >
                        {t.atelier.hero.subtitle}
                    </motion.p>
                </motion.div>
            </section>

            {/* Philosophy Section */}
            <section className="py-24 md:py-40 bg-offWhite px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-10%" }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-xs font-bold tracking-widest uppercase text-neutral-400 mb-6 block flex items-center gap-2">
                            <span className="w-8 h-[1px] bg-neutral-400"></span>
                            {t.atelier.philosophy.title}
                        </span>
                        <p className="font-serif text-2xl md:text-4xl leading-tight mb-8 text-softBlack">
                            {t.atelier.philosophy.text1}
                        </p>
                        <p className="font-sans text-softBlack/60 leading-relaxed max-w-md">
                            {t.atelier.philosophy.text2}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="relative aspect-[3/4] bg-neutral-200"
                    >
                        {/* Hand pouring */}
                        <img
                            src={`${philosophyImg}?q=80&w=1200&auto=format&fit=crop`}
                            srcSet={`
                        ${philosophyImg}?q=80&w=600&auto=format&fit=crop 600w,
                        ${philosophyImg}?q=80&w=1200&auto=format&fit=crop 1200w
                    `}
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            alt="Workshop Education"
                            width="1200"
                            height="1600"
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-cream/90 backdrop-blur-sm flex items-center justify-center p-4 text-center hidden md:flex">
                            <span className="font-serif text-3xl italic">Est. 2024</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Process Grid */}
            <section className="py-24 bg-white border-t border-softBlack/5 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                        <ProcessStep
                            icon={<Feather size={32} />}
                            title={t.atelier.process.design.title}
                            desc={t.atelier.process.design.desc}
                            delay={0}
                        />
                        <ProcessStep
                            icon={<Beaker size={32} />}
                            title={t.atelier.process.material.title}
                            desc={t.atelier.process.material.desc}
                            delay={0.2}
                        />
                        <ProcessStep
                            icon={<Flame size={32} />}
                            title={t.atelier.process.assembly.title}
                            desc={t.atelier.process.assembly.desc}
                            delay={0.4}
                        />
                    </div>
                </div>
            </section>

            {/* Bespoke/Dark Section */}
            <section className="bg-softBlack text-offWhite py-32 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                    {/* Dark Candle Imagery */}
                    <img
                        src={`${bespokeImg}?q=80&w=1200&auto=format&fit=crop`}
                        srcSet={`
                    ${bespokeImg}?q=80&w=600&auto=format&fit=crop 600w,
                    ${bespokeImg}?q=80&w=1200&auto=format&fit=crop 1200w
                `}
                        sizes="50vw"
                        className="w-full h-full object-cover grayscale"
                        alt="Collaborative Design"
                        width="1200"
                        height="800"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-transparent to-softBlack" />
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="max-w-2xl"
                    >
                        <h2 className="font-serif text-4xl md:text-6xl mb-6">{t.atelier.bespoke.title}</h2>
                        <p className="text-xl md:text-2xl font-light text-cream mb-8 opacity-80">{t.atelier.bespoke.subtitle}</p>
                        <p className="text-offWhite/60 leading-relaxed mb-12 max-w-lg">
                            {t.atelier.bespoke.desc}
                        </p>

                        <button className="group flex items-center gap-4 text-sm font-bold tracking-widest uppercase border-b border-offWhite/30 pb-2 hover:text-cream hover:border-cream transition-all">
                            {t.atelier.bespoke.cta}
                            <ArrowUpRight className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                </div>
            </section>

        </div>
    );
};

const ProcessStep = ({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay }}
            className="flex flex-col items-center text-center p-8 hover:bg-neutral-50 transition-colors rounded-sm group"
        >
            <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center text-softBlack mb-8 group-hover:scale-110 transition-transform duration-500">
                {icon}
            </div>
            <h3 className="font-serif text-2xl mb-4">{title}</h3>
            <p className="text-sm text-softBlack/60 leading-relaxed max-w-xs mx-auto">
                {desc}
            </p>
        </motion.div>
    );
};
