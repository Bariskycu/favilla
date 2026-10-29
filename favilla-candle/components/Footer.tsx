import React, { useState } from 'react';
import { useStore } from '../store';
import { translations } from '../translations';
import { Link } from 'react-router-dom';
import { ArrowRight, Instagram, Facebook, Linkedin, CreditCard } from 'lucide-react';

export const Footer: React.FC = () => {
    const { language } = useStore();
    const t = translations[language];
    const [email, setEmail] = useState('');

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        setEmail('');
        alert(t.common.thankYou);
    };

    return (
        <footer className="bg-softBlack text-offWhite pt-24 pb-12 px-6 mt-auto">
            <div className="max-w-7xl mx-auto">

                {/* Top Section: Newsletter */}
                <div className="border-b border-white/10 pb-16 mb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
                    <div>
                        <h3 className="font-serif text-3xl md:text-4xl mb-4">{t.footer.newsletterTitle}</h3>
                        <p className="font-sans text-sm md:text-base text-offWhite/60 max-w-md leading-relaxed">
                            {t.footer.newsletterDesc}
                        </p>
                    </div>
                    <form onSubmit={handleSubscribe} className="relative group">
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t.footer.emailPlaceholder}
                            className="w-full bg-transparent border-b border-white/20 py-4 text-lg focus:outline-none focus:border-white transition-colors pr-12 placeholder:text-offWhite/30"
                        />
                        <button
                            type="submit"
                            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-offWhite/50 hover:text-offWhite transition-colors"
                        >
                            <ArrowRight size={20} />
                        </button>
                    </form>
                </div>

                {/* Middle Section: Links Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-20">
                    {/* Brand & Address */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="font-serif text-2xl tracking-tight">Favilla.</h2>
                            <p className="font-sans text-xs tracking-widest uppercase opacity-40 mt-1">{t.common.cities}</p>
                        </div>
                        <p className="text-sm text-offWhite/50 leading-relaxed max-w-xs">
                            {t.footer.desc}
                        </p>
                        <div className="pt-2">
                            <p className="text-sm text-offWhite/80">{t.footer.address}</p>
                        </div>
                    </div>

                    {/* Collection */}
                    <div>
                        <h4 className="font-sans text-xs font-bold tracking-widest uppercase mb-6 opacity-40">{t.footer.collection}</h4>
                        <ul className="space-y-4 text-sm font-light">
                            <li><Link to="/shop" className="hover:text-white hover:opacity-100 opacity-70 transition-all">{t.shop.types.jar}</Link></li>
                            <li><Link to="/shop" className="hover:text-white hover:opacity-100 opacity-70 transition-all">{t.shop.types.sculptural}</Link></li>
                            <li><Link to="/shop" className="hover:text-white hover:opacity-100 opacity-70 transition-all">{t.shop.types.all}</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-sans text-xs font-bold tracking-widest uppercase mb-6 opacity-40">{t.footer.support}</h4>
                        <ul className="space-y-4 text-sm font-light">
                            <li><Link to="/shipping" className="hover:text-white hover:opacity-100 opacity-70 transition-all">{t.footer.links.shipping}</Link></li>
                            <li><Link to="/faq" className="hover:text-white hover:opacity-100 opacity-70 transition-all">{t.footer.links.faq}</Link></li>
                            <li><Link to="/contact" className="hover:text-white hover:opacity-100 opacity-70 transition-all">{t.footer.links.contact}</Link></li>
                        </ul>
                    </div>

                    {/* Legal & Social */}
                    <div>
                        <h4 className="font-sans text-xs font-bold tracking-widest uppercase mb-6 opacity-40">{t.footer.social} & {t.footer.legal}</h4>
                        <ul className="space-y-4 text-sm font-light mb-8">
                            <li><Link to="/privacy-policy" className="hover:text-white hover:opacity-100 opacity-70 transition-all">{t.footer.links.privacy}</Link></li>
                            <li><Link to="/terms-of-service" className="hover:text-white hover:opacity-100 opacity-70 transition-all">{t.footer.links.terms}</Link></li>
                        </ul>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 border border-white/10 rounded-full hover:bg-white hover:text-softBlack transition-all group">
                                <Instagram size={16} />
                            </a>
                            <a href="#" className="p-2 border border-white/10 rounded-full hover:bg-white hover:text-softBlack transition-all group">
                                <Facebook size={16} />
                            </a>
                            <a href="#" className="p-2 border border-white/10 rounded-full hover:bg-white hover:text-softBlack transition-all group">
                                <Linkedin size={16} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] md:text-xs font-medium tracking-widest uppercase opacity-40">
                    <div className="flex flex-col md:flex-row gap-2 md:gap-6 text-center md:text-left">
                        <span>{t.footer.rights}</span>
                        <span>{t.footer.madeFor}</span>
                    </div>
                    <div className="flex gap-4 items-center">
                        <span>{t.common.securePayment}</span>
                        <div className="flex gap-2 opacity-80">
                            <div className="h-2 w-4 bg-white/50 rounded-sm"></div>
                            <div className="h-2 w-4 bg-white/50 rounded-sm"></div>
                            <div className="h-2 w-4 bg-white/50 rounded-sm"></div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};