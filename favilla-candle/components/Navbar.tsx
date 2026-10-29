import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, User as UserIcon, Search, Heart } from 'lucide-react';
import { useStore } from '../store';
import { AnimatePresence, motion } from 'framer-motion';
import { translations } from '../translations';

export const Navbar: React.FC = () => {
  const { toggleCart, cart, language, setLanguage, isAuthenticated, toggleSearch, wishlist } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const t = translations[language];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/wishlist');
  };

  const isAuthPage = location.pathname.includes('/login') || location.pathname.includes('/register');
  const isDarkHero = ['/', '/atelier'].includes(location.pathname); // Pages with dark hero sections

  // Navbar Background Logic
  const navbarBg = isAuthPage ? 'bg-transparent' : (scrolled ? 'bg-offWhite/80 backdrop-blur-md py-4 border-b border-softBlack/5' : 'bg-transparent py-8');

  // Text Color Logic
  // If not scrolled and on a dark hero page, use light text. Otherwise, use dark text.
  const isLightText = !scrolled && isDarkHero && !isAuthPage;

  const textColor = isLightText ? 'text-offWhite' : 'text-softBlack';
  const textHover = isLightText ? 'hover:text-white' : 'hover:text-softBlack';
  const textOpacity = isLightText ? 'text-offWhite/80' : 'text-softBlack/80';
  const iconColor = isLightText ? 'text-offWhite' : 'text-softBlack';

  // Helper for language buttons
  const getLangClass = (langCode: string) => {
    const isActive = language === langCode;
    if (isActive) return isLightText ? 'text-white font-bold' : 'text-softBlack font-bold';
    return isLightText ? 'text-offWhite/40 hover:text-white/60' : 'text-softBlack/40 hover:text-softBlack/60';
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navbarBg}`}
        role="navigation"
        aria-label={t.nav.home}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="z-50 relative" aria-label={t.nav.home}>
            <h1 className={`font-serif text-2xl tracking-tight font-semibold transition-colors duration-500 ${textColor}`}>
              Favilla<span className="text-cream text-4xl leading-none">.</span>
            </h1>
          </Link>

          {/* Desktop Menu */}
          {!isAuthPage && (
            <div className={`hidden md:flex items-center gap-12 font-sans text-sm tracking-widest font-medium transition-colors duration-500 ${textOpacity}`}>
              <Link to="/" className={`transition-colors ${textHover}`}>{t.nav.journal}</Link>
              <Link to="/shop" className={`transition-colors ${textHover}`}>{t.nav.collection}</Link>
              <Link to="/atelier" className={`transition-colors ${textHover}`}>{t.nav.atelier}</Link>
            </div>
          )}

          <div className="flex items-center gap-4 md:gap-6 z-50 relative">
            {/* Language Toggle (Refined Design) */}
            <div className="hidden md:flex items-center gap-1 text-sm font-medium tracking-widest">
              <button
                onClick={() => setLanguage('en')}
                className={`transition-colors duration-300 ${getLangClass('en')}`}
                aria-label="Switch to English"
              >
                EN
              </button>
              <span className={`cursor-default transition-colors duration-500 ${isLightText ? 'text-offWhite/20' : 'text-softBlack/20'}`}>|</span>
              <button
                onClick={() => setLanguage('tr')}
                className={`transition-colors duration-300 ${getLangClass('tr')}`}
                aria-label="Türkçe'ye Geç"
              >
                TR
              </button>
            </div>

            {/* Search */}
            <button
              onClick={() => toggleSearch(true)}
              className={`p-2 rounded-full transition-colors duration-300 ${isLightText ? 'hover:bg-white/10' : 'hover:bg-softBlack/5'}`}
              title={t.nav.search}
              aria-label={t.nav.search}
            >
              <Search size={20} className={`transition-colors duration-500 ${iconColor}`} />
            </button>

            {/* Wishlist */}
            <button
              onClick={handleWishlistClick}
              className={`p-2 rounded-full transition-colors duration-300 relative ${isLightText ? 'hover:bg-white/10' : 'hover:bg-softBlack/5'}`}
              title={t.nav.wishlist}
              aria-label={t.nav.wishlist}
            >
              <Heart size={20} className={`transition-colors duration-500 ${iconColor}`} />
              {wishlist.length > 0 && isAuthenticated && (
                <span className="absolute top-1 right-0.5 h-3 w-3 bg-red-500 text-offWhite text-[8px] flex items-center justify-center rounded-full" />
              )}
            </button>

            {/* Auth Button */}
            {isAuthenticated ? (
              <Link to="/profile" className={`p-2 rounded-full transition-colors duration-300 hidden md:block ${isLightText ? 'hover:bg-white/10' : 'hover:bg-softBlack/5'}`} title={t.nav.account} aria-label={t.nav.account}>
                <UserIcon size={20} className={`transition-colors duration-500 ${iconColor}`} />
              </Link>
            ) : (
              <Link to="/login" className={`hidden md:block text-sm font-medium tracking-widest transition-colors duration-500 ${isLightText ? 'text-offWhite hover:text-white/80' : 'text-softBlack hover:text-softBlack/60'}`}>
                {t.nav.login}
              </Link>
            )}

            <button
              onClick={() => toggleCart()}
              className={`relative p-2 rounded-full transition-colors duration-300 ${isLightText ? 'hover:bg-white/10' : 'hover:bg-softBlack/5'}`}
              aria-label={t.nav.cart}
              title={t.nav.cart}
            >
              <ShoppingBag size={20} className={`transition-colors duration-500 ${iconColor}`} />
              {cart.length > 0 && (
                <span className={`absolute top-0 right-0 h-4 w-4 text-[10px] flex items-center justify-center rounded-full ${isLightText ? 'bg-offWhite text-softBlack' : 'bg-softBlack text-offWhite'}`}>
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </button>
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={t.nav.menu}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} className={`transition-colors duration-500 ${iconColor}`} /> : <Menu size={20} className={`transition-colors duration-500 ${iconColor}`} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-offWhite z-40 flex flex-col items-center justify-center space-y-8 md:hidden"
          >
            <Link to="/" className="text-2xl font-serif" onClick={() => setMobileMenuOpen(false)}>{t.nav.journal}</Link>
            <Link to="/shop" className="text-2xl font-serif" onClick={() => setMobileMenuOpen(false)}>{t.nav.collection}</Link>
            <Link to="/atelier" className="text-2xl font-serif" onClick={() => setMobileMenuOpen(false)}>{t.nav.atelier}</Link>
            <button onClick={(e) => { handleWishlistClick(e); setMobileMenuOpen(false); }} className="text-2xl font-serif">{t.nav.wishlist}</button>
            <Link to="/profile" className="text-2xl font-serif" onClick={() => setMobileMenuOpen(false)}>{isAuthenticated ? t.nav.account : t.nav.login}</Link>
            <div className="pt-8 flex gap-4">
              <button onClick={() => setLanguage('en')} className={`text-sm tracking-widest ${language === 'en' ? 'font-bold' : 'opacity-50'}`}>EN</button>
              <span className="opacity-20">|</span>
              <button onClick={() => setLanguage('tr')} className={`text-sm tracking-widest ${language === 'tr' ? 'font-bold' : 'opacity-50'}`}>TR</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};