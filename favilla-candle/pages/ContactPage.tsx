
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { translations } from '../translations';
import { MapPin, Mail, Phone, CheckCircle, ArrowRight } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { language } = useStore();
  const t = translations[language];
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate network request
    setTimeout(() => {
        setLoading(false);
        setSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-offWhite pt-24 md:pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header - Left Aligned for Impact */}
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16 md:mb-24 max-w-2xl"
        >
            <h1 className="font-serif text-5xl md:text-7xl mb-6 text-softBlack tracking-tight">
                {t.contact.title}
            </h1>
            <p className="font-sans text-sm md:text-base text-softBlack/60 tracking-wide leading-relaxed border-l-2 border-softBlack pl-6">
                {t.contact.subtitle}
            </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            
            {/* Left Column: Info & Visual */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="space-y-12"
            >
                {/* Visual */}
                <div className="aspect-[4/3] w-full bg-neutral-200 overflow-hidden relative rounded-sm">
                    <img 
                        src="https://images.unsplash.com/photo-1601369796068-d064228f9d0c?q=80&w=1200&auto=format&fit=crop" 
                        alt="Favilla Showroom" 
                        className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-softBlack/10 mix-blend-multiply" />
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 block mb-2">{t.contact.info.visit}</span>
                        <p className="font-serif text-xl text-softBlack">12 Orbital Way,<br/>London SW1A 1AA</p>
                        <p className="text-sm text-neutral-500 mt-2">{t.contact.info.hours}</p>
                    </div>
                    
                    <div className="space-y-6">
                        <div>
                            <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 block mb-2">{t.contact.info.email}</span>
                            <a href="mailto:hello@favilla.com" className="font-serif text-xl text-softBlack hover:opacity-60 transition-opacity">hello@favilla.com</a>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 block mb-2">{t.contact.info.call}</span>
                            <a href="tel:+442012345678" className="font-serif text-xl text-softBlack hover:opacity-60 transition-opacity">+44 20 1234 5678</a>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Right Column: Form */}
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="bg-white p-8 md:p-12 border border-neutral-100 shadow-xl shadow-neutral-100/50 h-fit"
            >
                <AnimatePresence mode='wait'>
                    {!success ? (
                        <motion.form 
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onSubmit={handleSubmit} 
                            className="space-y-8"
                        >
                            <div className="space-y-2 group">
                                <label htmlFor="contact-name" className="text-xs font-bold tracking-widest uppercase text-neutral-400 group-focus-within:text-softBlack transition-colors">{t.contact.form.name}</label>
                                <input 
                                    id="contact-name"
                                    type="text" 
                                    required
                                    className="w-full pb-3 bg-transparent border-b border-neutral-200 focus:border-softBlack outline-none font-serif text-lg transition-colors rounded-none placeholder:text-neutral-200"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="space-y-2 group">
                                <label htmlFor="contact-email" className="text-xs font-bold tracking-widest uppercase text-neutral-400 group-focus-within:text-softBlack transition-colors">{t.contact.form.email}</label>
                                <input 
                                    id="contact-email"
                                    type="email" 
                                    required
                                    className="w-full pb-3 bg-transparent border-b border-neutral-200 focus:border-softBlack outline-none font-serif text-lg transition-colors rounded-none placeholder:text-neutral-200"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div className="space-y-2 group">
                                <label htmlFor="contact-subject" className="text-xs font-bold tracking-widest uppercase text-neutral-400 group-focus-within:text-softBlack transition-colors">{t.contact.form.subject}</label>
                                <select 
                                    id="contact-subject"
                                    className="w-full pb-3 bg-transparent border-b border-neutral-200 focus:border-softBlack outline-none font-serif text-lg transition-colors rounded-none cursor-pointer appearance-none"
                                >
                                    <option>{t.contact.form.subjects.general}</option>
                                    <option>{t.contact.form.subjects.commission}</option>
                                    <option>{t.contact.form.subjects.order}</option>
                                    <option>{t.contact.form.subjects.press}</option>
                                </select>
                            </div>

                            <div className="space-y-2 group">
                                <label htmlFor="contact-message" className="text-xs font-bold tracking-widest uppercase text-neutral-400 group-focus-within:text-softBlack transition-colors">{t.contact.form.message}</label>
                                <textarea 
                                    id="contact-message"
                                    required
                                    rows={4}
                                    className="w-full py-3 bg-transparent border-b border-neutral-200 focus:border-softBlack outline-none font-serif text-lg transition-colors rounded-none resize-none placeholder:text-neutral-200"
                                    placeholder="..."
                                />
                            </div>

                            <div className="pt-4">
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="group w-full bg-softBlack text-offWhite py-5 flex items-center justify-center gap-3 hover:bg-neutral-800 transition-colors disabled:opacity-70"
                                >
                                    <span className="text-xs font-bold tracking-widest uppercase">{loading ? t.contact.form.sending : t.contact.form.send}</span>
                                    {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                                </button>
                            </div>
                        </motion.form>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center text-center py-12"
                        >
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-6">
                                <CheckCircle size={40} />
                            </div>
                            <h3 className="font-serif text-2xl md:text-3xl mb-4 text-softBlack">{t.contact.form.success}</h3>
                            <p className="text-neutral-500 max-w-xs mx-auto leading-relaxed">
                                {t.contact.form.successDesc}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
      </div>
    </div>
  );
};
