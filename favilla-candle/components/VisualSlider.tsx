
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../store';
import { translations } from '../translations';

const SLIDE_IMAGES = [
  {
    id: 1,
    key: 'eclipse',
    // Stripped base URL
    imageBase: 'https://images.unsplash.com/photo-1596436889106-be35e843f974'
  },
  {
    id: 2,
    key: 'mono',
    imageBase: 'https://images.unsplash.com/photo-1603006905003-be475563bc59'
  },
  {
    id: 3,
    key: 'aurora',
    imageBase: 'https://images.unsplash.com/photo-1596436889106-be35e843f974'
  },
  {
    id: 4,
    key: 'axis',
    imageBase: 'https://images.unsplash.com/photo-1603006905003-be475563bc59'
  },
  {
    id: 5,
    key: 'zenith',
    imageBase: 'https://images.unsplash.com/photo-1596436889106-be35e843f974'
  }
];

export const VisualSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const { language } = useStore();
  const t = translations[language];

  // Auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % SLIDE_IMAGES.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + SLIDE_IMAGES.length) % SLIDE_IMAGES.length);
  };

  const handleNavClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const getCurrentSlideContent = (key: string) => {
    // @ts-ignore - Dynamic key access for slider content
    return t.slider[key] || { title: '', role: '', caption: '' };
  };

  return (
    <section className="w-full h-screen bg-softBlack flex flex-col lg:flex-row overflow-hidden relative group">

      {/* --- Main Slider Area (80% Desktop) --- */}
      <div className="relative w-full lg:w-[80%] h-full overflow-hidden bg-neutral-900">
        <AnimatePresence mode='popLayout' initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ opacity: 0, x: direction * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -50 }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Background Image with slight scale animation */}
            <motion.div
              className="w-full h-full"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 6, ease: "linear" }}
            >
              <img
                src={`${SLIDE_IMAGES[currentIndex].imageBase}?q=80&w=1600&auto=format&fit=crop`}
                srcSet={`
                        ${SLIDE_IMAGES[currentIndex].imageBase}?q=80&w=600&auto=format&fit=crop 600w,
                        ${SLIDE_IMAGES[currentIndex].imageBase}?q=80&w=1200&auto=format&fit=crop 1200w,
                        ${SLIDE_IMAGES[currentIndex].imageBase}?q=80&w=1600&auto=format&fit=crop 1600w
                    `}
                sizes="(max-width: 1024px) 100vw, 80vw"
                alt="Candle Detail"
                width="1600"
                height="900"
                className="w-full h-full object-cover opacity-80"
              />
            </motion.div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Content Overlay */}
        <div className="absolute top-1/2 -translate-y-1/2 left-8 md:left-24 max-w-xl z-20 text-offWhite pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentIndex}-${language}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-cream/80 mb-4 block">
                {getCurrentSlideContent(SLIDE_IMAGES[currentIndex].key).role}
              </span>
              <h2 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight">
                {getCurrentSlideContent(SLIDE_IMAGES[currentIndex].key).title}
              </h2>
              <p className="text-sm md:text-lg font-light text-offWhite/80 leading-relaxed max-w-md border-l-2 border-cream/50 pl-6">
                {getCurrentSlideContent(SLIDE_IMAGES[currentIndex].key).caption}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Arrows (Bottom Right of Main Area) */}
        <div className="absolute bottom-8 right-8 flex gap-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handlePrev}
            className="w-12 h-12 flex items-center justify-center border border-white/20 hover:bg-white hover:text-softBlack rounded-full transition-all text-white backdrop-blur-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            className="w-12 h-12 flex items-center justify-center border border-white/20 hover:bg-white hover:text-softBlack rounded-full transition-all text-white backdrop-blur-sm"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* --- Vertical Navigation Slider (20% Desktop) --- */}
      <div className="hidden lg:flex w-[20%] h-full flex-col border-l border-white/10 bg-black z-20">
        {SLIDE_IMAGES.map((slide, index) => (
          <div
            key={slide.id}
            onClick={() => handleNavClick(index)}
            className={`
                    relative flex-1 cursor-pointer overflow-hidden transition-all duration-500 group/nav
                    ${currentIndex === index ? 'opacity-100' : 'opacity-40 hover:opacity-100'}
                `}
          >
            <img
              src={`${slide.imageBase}?q=80&w=400&auto=format&fit=crop`}
              alt="Thumbnail"
              width="400"
              height="300"
              className="absolute inset-0 w-full h-full object-cover grayscale transition-all duration-700 group-hover/nav:scale-110"
              loading="lazy"
            />
            <div className={`absolute inset-0 transition-colors duration-300 ${currentIndex === index ? 'bg-transparent' : 'bg-black/40 group-hover/nav:bg-transparent'}`} />

            {/* Active Indicator Line */}
            {currentIndex === index && (
              <motion.div
                layoutId="activeNavLine"
                className="absolute left-0 top-0 bottom-0 w-1 bg-cream z-10"
              />
            )}

            <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 to-transparent">
              <span className="text-xs font-serif text-white tracking-wider transform translate-y-2 group-hover/nav:translate-y-0 transition-transform duration-300">
                {getCurrentSlideContent(slide.key).title}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Dots Navigation (Visible only on mobile) */}
      <div className="lg:hidden absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {SLIDE_IMAGES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleNavClick(idx)}
            className={`h-1 rounded-full transition-all duration-300 ${currentIndex === idx ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}
          />
        ))}
      </div>

    </section>
  );
};
