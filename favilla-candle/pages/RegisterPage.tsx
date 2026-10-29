
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { translations } from '../translations';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { SEO } from '../components/SEO';

export const RegisterPage: React.FC = () => {
  const { register, language } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const t = translations[language];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Validation State
  const [touched, setTouched] = useState({ name: false, email: false, phone: false, password: false });
  const [errors, setErrors] = useState({ name: '', email: '', phone: '', password: '' });

  // Determine where to redirect after registration
  const from = location.state?.from?.pathname || '/profile';

  const validators = {
      name: (val: string) => !val ? t.validation.nameRequired : '',
      email: (val: string) => !val ? t.validation.emailRequired : (!/\S+@\S+\.\S+/.test(val) ? t.validation.emailInvalid : ''),
      phone: (val: string) => !val ? t.validation.phoneRequired : '',
      password: (val: string) => !val ? t.validation.passwordRequired : (val.length < 6 ? t.auth.errorShortPass : '')
  };

  const handleBlur = (field: keyof typeof touched) => {
      setTouched(prev => ({ ...prev, [field]: true }));
      // @ts-ignore
      setErrors(prev => ({ ...prev, [field]: validators[field](eval(field)) }));
  };

  const handleChange = (field: keyof typeof touched, value: string) => {
      if (field === 'name') setName(value);
      if (field === 'email') setEmail(value);
      if (field === 'phone') setPhone(value);
      if (field === 'password') setPassword(value);

      if (touched[field]) {
          // @ts-ignore
           setErrors(prev => ({ ...prev, [field]: validators[field](value) }));
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = {
        name: validators.name(name),
        email: validators.email(email),
        phone: validators.phone(phone),
        password: validators.password(password)
    };

    setErrors(newErrors);
    setTouched({ name: true, email: true, phone: true, password: true });

    if (Object.values(newErrors).some(err => err !== '')) return;

    setLoading(true);
    // Simulate API latency & login
    setTimeout(() => {
      register(email, name, phone);
      setLoading(false);
      navigate(from, { replace: true });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex bg-offWhite">
      <SEO title="Register" />
      {/* Left: Artistic Visual */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="hidden lg:block w-1/2 relative overflow-hidden bg-cream"
      >
        <img 
          src="https://images.unsplash.com/photo-1596436889106-be35e843f974?q=80&w=2000&auto=format&fit=crop" 
          alt="Favilla Candle Art" 
          className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-multiply"
        />
         <div className="absolute inset-0 bg-gradient-to-t from-softBlack/50 via-transparent to-transparent" />
         <div className="absolute bottom-20 left-20 text-offWhite">
            <h2 className="font-serif text-5xl mb-4">{t.hero.slide2.title}</h2>
            <p className="font-sans text-sm tracking-widest uppercase opacity-80">{t.hero.slide2.subtitle}</p>
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
            <h1 className="font-serif text-4xl mb-4 text-softBlack">{t.auth.registerTitle}</h1>
            <p className="text-softBlack/50 mb-12">{t.auth.registerSubtitle}</p>

            <form onSubmit={handleSubmit} className="space-y-8" noValidate>
                <div className="space-y-2 relative">
                    <label htmlFor="reg-name" className="text-xs font-bold tracking-widest uppercase text-softBlack/60">{t.auth.fullName}</label>
                    <input 
                        id="reg-name"
                        type="text" 
                        value={name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        onBlur={() => handleBlur('name')}
                        className={`w-full py-3 border-b bg-transparent focus:outline-none transition-colors ${errors.name && touched.name ? 'border-red-400 text-red-900' : 'border-softBlack/20 focus:border-softBlack'}`}
                        placeholder="John Doe"
                        aria-invalid={!!(errors.name && touched.name)}
                        aria-describedby={errors.name && touched.name ? "name-error" : undefined}
                    />
                    <AnimatePresence>
                        {errors.name && touched.name && (
                            <motion.span 
                                id="name-error"
                                role="alert"
                                initial={{ opacity: 0, y: -5 }} 
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-xs text-red-500 absolute -bottom-5 left-0 flex items-center gap-1"
                            >
                                <AlertCircle size={10} /> {errors.name}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
                <div className="space-y-2 relative">
                    <label htmlFor="reg-email" className="text-xs font-bold tracking-widest uppercase text-softBlack/60">{t.auth.email}</label>
                    <input 
                        id="reg-email"
                        type="email" 
                        value={email}
                        onChange={(e) => handleChange('email', e.target.value)}
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
                    <label htmlFor="reg-phone" className="text-xs font-bold tracking-widest uppercase text-softBlack/60">{t.auth.phone}</label>
                    <input 
                        id="reg-phone"
                        type="tel" 
                        value={phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        onBlur={() => handleBlur('phone')}
                        className={`w-full py-3 border-b bg-transparent focus:outline-none transition-colors ${errors.phone && touched.phone ? 'border-red-400 text-red-900' : 'border-softBlack/20 focus:border-softBlack'}`}
                        placeholder="+1 555 000 0000"
                        aria-invalid={!!(errors.phone && touched.phone)}
                        aria-describedby={errors.phone && touched.phone ? "phone-error" : undefined}
                    />
                    <AnimatePresence>
                        {errors.phone && touched.phone && (
                            <motion.span 
                                id="phone-error"
                                role="alert"
                                initial={{ opacity: 0, y: -5 }} 
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-xs text-red-500 absolute -bottom-5 left-0 flex items-center gap-1"
                            >
                                <AlertCircle size={10} /> {errors.phone}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
                <div className="space-y-2 relative">
                    <label htmlFor="reg-password" className="text-xs font-bold tracking-widest uppercase text-softBlack/60">{t.auth.password}</label>
                    <input 
                        id="reg-password"
                        type="password" 
                        value={password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        onBlur={() => handleBlur('password')}
                        className={`w-full py-3 border-b bg-transparent focus:outline-none transition-colors ${errors.password && touched.password ? 'border-red-400 text-red-900' : 'border-softBlack/20 focus:border-softBlack'}`}
                        placeholder="••••••••"
                        aria-invalid={!!(errors.password && touched.password)}
                        aria-describedby={errors.password && touched.password ? "password-error" : undefined}
                    />
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
                    <span className="text-sm font-medium tracking-widest">{loading ? '...' : t.auth.signUp}</span>
                    <ArrowRight size={16} />
                </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-sm text-softBlack/60">
                    {t.auth.hasAccount} <Link to="/login" state={{ from: location.state?.from }} className="text-softBlack font-bold border-b border-softBlack pb-0.5 hover:opacity-70">{t.auth.signIn}</Link>
                </p>
            </div>
        </motion.div>
      </div>
    </div>
  );
};
