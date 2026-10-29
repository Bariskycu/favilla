
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { translations } from '../translations';
import { ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { SEO } from '../components/SEO';

export const LoginPage: React.FC = () => {
  const { login, language } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const t = translations[language];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validation State
  const [touched, setTouched] = useState({ email: false, password: false });
  const [errors, setErrors] = useState({ email: '', password: '' });

  // Determine where to redirect after login
  const from = location.state?.from?.pathname || '/profile';

  const validateEmail = (val: string) => {
    if (!val) return t.validation.emailRequired;
    if (!/\S+@\S+\.\S+/.test(val)) return t.validation.emailInvalid;
    return '';
  };

  const validatePassword = (val: string) => {
    if (!val) return t.validation.passwordRequired;
    if (val.length < 6) return t.auth.errorShortPass;
    return '';
  };

  const handleBlur = (field: 'email' | 'password') => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'email') setErrors(prev => ({ ...prev, email: validateEmail(email) }));
    if (field === 'password') setErrors(prev => ({ ...prev, password: validatePassword(password) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);

    setErrors({ email: emailErr, password: passErr });
    setTouched({ email: true, password: true });

    if (emailErr || passErr) return;

    setLoading(true);
    try {
      await login(email, password); // Şifreyi de gönderiyoruz ve await ediyoruz
      navigate(from, { replace: true });
    } catch (error) {
      // Hata toast ile store içinde gösteriliyor zaten
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-offWhite">
      <SEO title="Login" />
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
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-softBlack via-transparent to-transparent" />
        <div className="absolute bottom-20 left-20 text-offWhite">
          <h2 className="font-serif text-5xl mb-4">{t.hero.slide1.title}</h2>
          <p className="font-sans text-sm tracking-widest uppercase opacity-70">{t.hero.slide1.subtitle}</p>
        </div>
      </motion.div>

      {/* Right: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-24 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-md w-full mx-auto"
        >
          <h1 className="font-serif text-4xl mb-4 text-softBlack">{t.auth.welcome}</h1>
          <p className="text-softBlack/50 mb-12">{t.auth.subtitle}</p>

          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            <div className="space-y-2 relative">
              <label htmlFor="email" className="text-xs font-bold tracking-widest uppercase text-softBlack/60">{t.auth.email}</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (touched.email) setErrors(prev => ({ ...prev, email: validateEmail(e.target.value) }));
                }}
                onBlur={() => handleBlur('email')}
                className={`w-full py-3 border-b bg-transparent focus:outline-none transition-colors ${errors.email && touched.email ? 'border-red-400 text-red-900' : 'border-softBlack/20 focus:border-softBlack'}`}
                placeholder="example@favilla.com"
                aria-invalid={!!(errors.email && touched.email)}
                aria-describedby={errors.email && touched.email ? "email-error" : undefined}
              />
              <AnimatePresence>
                {errors.email && touched.email && (
                  <motion.span
                    id="email-error"
                    role="alert"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-red-500 absolute -bottom-5 left-0 flex items-center gap-1"
                  >
                    <AlertCircle size={10} /> {errors.email}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-2 relative">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs font-bold tracking-widest uppercase text-softBlack/60">{t.auth.password}</label>
                <Link to="/forgot-password" className="text-xs text-softBlack/40 hover:text-softBlack transition-colors">
                  {t.auth.forgotPassword}
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (touched.password) setErrors(prev => ({ ...prev, password: validatePassword(e.target.value) }));
                  }}
                  onBlur={() => handleBlur('password')}
                  className={`w-full py-3 pr-10 border-b bg-transparent focus:outline-none transition-colors ${errors.password && touched.password ? 'border-red-400 text-red-900' : 'border-softBlack/20 focus:border-softBlack'}`}
                  placeholder="••••••••"
                  aria-invalid={!!(errors.password && touched.password)}
                  aria-describedby={errors.password && touched.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-softBlack/40 hover:text-softBlack transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && touched.password && (
                  <motion.span
                    id="password-error"
                    role="alert"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-red-500 absolute -bottom-5 left-0 flex items-center gap-1"
                  >
                    <AlertCircle size={10} /> {errors.password}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-softBlack text-offWhite py-4 flex items-center justify-center gap-3 hover:bg-gray-800 transition-colors disabled:opacity-70 mt-8"
            >
              <span className="text-sm font-medium tracking-widest">{loading ? '...' : t.auth.signIn}</span>
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-sm text-softBlack/60">
              {t.auth.noAccount} <Link to="/register" state={{ from: location.state?.from }} className="text-softBlack font-bold border-b border-softBlack pb-0.5 hover:opacity-70">{t.auth.signUp}</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
