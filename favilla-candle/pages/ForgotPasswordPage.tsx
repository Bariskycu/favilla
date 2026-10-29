
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { translations } from '../translations';
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { SEO } from '../components/SEO';
import { api } from '../services/api';

export const ForgotPasswordPage: React.FC = () => {
    const { language } = useStore();
    const t = translations[language];

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const validateEmail = (val: string) => {
        return /\S+@\S+\.\S+/.test(val);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError(t.validation.emailRequired);
            return;
        }

        if (!validateEmail(email)) {
            setError(t.forgotPasswordPage.invalidEmail);
            return;
        }

        setLoading(true);
        try {
            await api.auth.forgotPassword(email);
            setSuccess(true);
        } catch (err) {
            console.error(err);
            // Even if it fails (security by obscurity), we might want to show success or a generic error.
            // But for better UX in this dev phase, let's show an error if it's not a 404/user not found.
            // Or just fail gracefully.
            // For now, let's assume it works or show a generic error.
            setError(t.common.errorDesc);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-offWhite">
            <SEO title={t.forgotPasswordPage.title} />

            {/* Left: Artistic Visual */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="hidden lg:block w-1/2 relative overflow-hidden bg-softBlack"
            >
                <img
                    src="https://images.unsplash.com/photo-1608546194258-29369cf531dc?q=80&w=2000&auto=format&fit=crop"
                    alt="Favilla Candle Art"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-softBlack via-transparent to-transparent" />
                <div className="absolute bottom-20 left-20 text-offWhite">
                    <h2 className="font-serif text-5xl mb-4">{t.hero.slide3.title}</h2>
                    <p className="font-sans text-sm tracking-widest uppercase opacity-70">{t.hero.slide3.subtitle}</p>
                </div>
            </motion.div>

            {/* Right: Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-24 py-20 md:py-32 relative">
                <Link to="/login" className="absolute top-10 left-8 md:left-24 flex items-center gap-2 text-sm text-softBlack/50 hover:text-softBlack transition-colors uppercase tracking-widest font-bold">
                    <ArrowLeft size={16} /> {t.forgotPasswordPage.backToLogin}
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-md w-full mx-auto"
                >
                    {!success ? (
                        <>
                            <h1 className="font-serif text-4xl mb-4 text-softBlack">{t.forgotPasswordPage.title}</h1>
                            <p className="text-softBlack/50 mb-12">{t.forgotPasswordPage.subtitle}</p>

                            <form onSubmit={handleSubmit} className="space-y-8" noValidate>
                                <div className="space-y-2 relative">
                                    <label htmlFor="email" className="text-xs font-bold tracking-widest uppercase text-softBlack/60">{t.forgotPasswordPage.emailLabel}</label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (error) setError('');
                                        }}
                                        className={`w-full py-3 border-b bg-transparent focus:outline-none transition-colors ${error ? 'border-red-400 text-red-900' : 'border-softBlack/20 focus:border-softBlack'}`}
                                        placeholder={t.forgotPasswordPage.emailPlaceholder}
                                    />
                                    <AnimatePresence>
                                        {error && (
                                            <motion.span
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="text-xs text-red-500 absolute -bottom-5 left-0 flex items-center gap-1"
                                            >
                                                <AlertCircle size={10} /> {error}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-softBlack text-offWhite py-4 flex items-center justify-center gap-3 hover:bg-gray-800 transition-colors disabled:opacity-70 mt-8"
                                >
                                    <span className="text-sm font-medium tracking-widest">{loading ? '...' : t.forgotPasswordPage.submitButton}</span>
                                    {!loading && <ArrowRight size={16} />}
                                </button>
                            </form>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={32} />
                            </div>
                            <h2 className="font-serif text-3xl mb-4 text-softBlack">{t.forgotPasswordPage.successTitle}</h2>
                            <p className="text-softBlack/60 mb-8">{t.forgotPasswordPage.successMessage}</p>
                            <Link to="/login" className="inline-block border-b border-softBlack pb-1 text-softBlack font-medium hover:opacity-70 transition-opacity">
                                {t.forgotPasswordPage.backToLogin}
                            </Link>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};
