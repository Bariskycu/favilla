import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { translations } from '../translations';
import { Plus, Minus, HelpCircle } from 'lucide-react';

export const FAQPage: React.FC = () => {
  const { language } = useStore();
  const t = translations[language];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-offWhite pt-24 md:pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 md:mb-24"
        >
            <div className="w-16 h-16 bg-cream/30 rounded-full flex items-center justify-center mx-auto mb-6 text-softBlack/60">
                <HelpCircle size={32} strokeWidth={1.5} />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-4 text-softBlack">
                {t.faq.title}
            </h1>
            <p className="font-sans text-sm md:text-base text-softBlack/50 tracking-wide max-w-lg mx-auto leading-relaxed">
                {t.faq.subtitle}
            </p>
        </motion.div>

        {/* Questions Grid */}
        <div className="space-y-4">
            {t.faq.questions.map((item, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                >
                    <button
                        onClick={() => toggleQuestion(index)}
                        className={`w-full flex items-start md:items-center justify-between p-6 md:p-8 text-left transition-all duration-300 border border-neutral-200 hover:border-softBlack bg-white ${openIndex === index ? 'border-softBlack shadow-lg shadow-neutral-100' : ''}`}
                    >
                        <span className={`font-serif text-lg md:text-xl pr-8 transition-colors ${openIndex === index ? 'text-softBlack' : 'text-softBlack/80'}`}>
                            {item.q}
                        </span>
                        <div className={`flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : 'rotate-0'}`}>
                            {openIndex === index ? (
                                <Minus size={20} className="text-softBlack" />
                            ) : (
                                <Plus size={20} className="text-neutral-400 group-hover:text-softBlack transition-colors" />
                            )}
                        </div>
                    </button>
                    
                    <AnimatePresence>
                        {openIndex === index && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                                className="overflow-hidden border-x border-b border-softBlack bg-neutral-50"
                            >
                                <div className="p-6 md:p-8 pt-0">
                                    <p className="text-sm md:text-base text-softBlack/70 leading-relaxed font-sans max-w-3xl">
                                        {item.a}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            ))}
        </div>
        
        {/* Contact Footer */}
        <motion.div 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: true }}
             className="mt-20 text-center border-t border-neutral-200 pt-12"
        >
             <p className="text-softBlack/60 mb-4">{t.common.stillQuestions}</p>
             <a href="mailto:support@lambardia.com" className="font-serif text-xl md:text-2xl text-softBlack border-b border-softBlack/20 hover:border-softBlack transition-all pb-1">
                 support@lambardia.com
             </a>
        </motion.div>

      </div>
    </div>
  );
};