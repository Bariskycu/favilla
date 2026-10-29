
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { translations } from '../translations';
import { HERO_SPIRAL_LAMP } from '../assets/images';

export const HeroSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const { language } = useStore();
  const t = translations[language];

  // Base URLs (without params) to allow us to construct optimized srcsets
  // Note: We strip the existing params to append our own responsive ones
  const SLIDES = [
    {
      id: 1,
      imageBase: "https://images.unsplash.com/photo-VlyRQyFmSEs", 
      title: t.hero.slide1.title,
      subtitle: t.hero.slide1.subtitle
    },
    {
      id: 2,
      imageBase: 'https://images.unsplash.com/photo-1592657388147-380d5d1c97bd',
      title: t.hero.slide2.title,
      subtitle: t.hero.slide2.subtitle
    },
    {
      id: 3,
      imageBase: 'https://images.unsplash.com/photo-1601369796068-d064228f9d0c',
      title: t.hero.slide3.title,
      subtitle: t.hero.slide3.subtitle
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [SLIDES.length]);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-offWhite text-offWhite">
      <AnimatePresence mode='wait'>
        <motion.div
          key={current}
          className="absolute inset-0 w-full h-full"
          initial={{ clipPath: 'circle(0% at 50% 50%)', opacity: 0 }}
          animate={{ clipPath: 'circle(150% at 50% 50%)', opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Optimized Image Handling */}
          <img 
            src={`${SLIDES[current].imageBase}?q=80&w=1920&auto=format&fit=crop`}
            srcSet={`
              ${SLIDES[current].imageBase}?q=80&w=640&auto=format&fit=crop 640w,
              ${SLIDES[current].imageBase}?q=80&w=1024&auto=format&fit=crop 1024w,
              ${SLIDES[current].imageBase}?q=80&w=1920&auto=format&fit=crop 1920w
            `}
            sizes="100vw"
            alt="Hero Background" 
            width="1920"
            height="1080"
            className="w-full h-full object-cover filter brightness-[0.7]"
            // Eager load the first image for LCP, lazy load others if they were list items (but here we cycle)
            loading="eager" 
            decoding="async"
          />
          <div className="absolute inset-0 bg-black/30" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-6 md:p-8">
        <AnimatePresence mode='wait'>
          <motion.div
            key={`${current}-${language}`} // Add language key to force re-render on switch
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="space-y-4 md:space-y-6 max-w-4xl"
          >
            <span className="text-xs md:text-sm tracking-[0.3em] uppercase opacity-90 font-sans block">
              {SLIDES[current].subtitle}
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-serif font-light leading-tight">
              {SLIDES[current].title}
            </h1>
            <div className="pt-6 md:pt-8">
              <Link to="/shop">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group flex items-center gap-3 px-6 py-3 md:px-8 md:py-4 border border-offWhite/30 backdrop-blur-sm bg-white/10 rounded-full hover:bg-white hover:text-softBlack transition-all duration-300 mx-auto"
                >
                  <span className="text-xs md:text-sm font-medium tracking-widest">{t.hero.explore}</span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex gap-4 z-20">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-1 rounded-full transition-all duration-500 ${current === idx ? 'w-8 md:w-12 bg-offWhite' : 'w-2 md:w-4 bg-offWhite/30'}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
