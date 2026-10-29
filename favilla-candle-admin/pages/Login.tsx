
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/admin');
    } catch (err: any) {
      let message = 'Giriş bilgileri doğrulanamadı. Lütfen tekrar deneyin.';

      if (err.response && err.response.data && (err.response.data.message || err.response.data.error)) {
        message = err.response.data.message || err.response.data.error;
      } else if (err.message) {
        message = err.message;
      }

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-offWhite text-softBlack font-sans overflow-hidden">

      {/* Sol Taraf - Görsel Alanı */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:block w-1/2 relative bg-stone-900"
      >
        <div className="absolute inset-0 bg-black/20 z-10" />
        <img
          src="https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=1000&auto=format&fit=crop"
          alt="Favilla Candle Aesthetics"
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />
        <div className="absolute bottom-12 left-12 z-20 text-white max-w-md">
          <p className="font-serif text-3xl font-medium leading-tight mb-4">
            "Işığın ve kokunun dansı, mekanınıza ruh katsın."
          </p>
          <div className="flex items-center gap-3">
            <div className="h-px w-12 bg-white/60"></div>
            <span className="text-sm tracking-[0.2em] uppercase font-light text-white/80">Favilla Collection</span>
          </div>
        </div>
      </motion.div>

      {/* Sağ Taraf - Form Alanı */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="w-full max-w-md space-y-8">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center lg:text-left"
          >
            <div className="inline-block mb-6 lg:mb-8">
              <h1 className="font-serif text-4xl font-semibold text-softBlack">Favilla</h1>
              <span className="text-xs uppercase tracking-[0.3em] text-stone-500 block mt-1 ml-1">Candle Co.</span>
            </div>
            <h2 className="text-2xl font-serif font-medium text-stone-800">Yönetici Girişi</h2>
            <p className="text-stone-500 mt-2 text-sm">Devam etmek için lütfen kimlik bilgilerinizi girin.</p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-600 text-sm"
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700 ml-1">E-posta Adresi</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-softBlack transition-colors" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-softBlack focus:border-softBlack transition-all placeholder:text-stone-300"
                  placeholder="ornek@favilla.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="block text-sm font-medium text-stone-700">Şifre</label>
                <a href="#" className="text-xs text-stone-400 hover:text-softBlack transition-colors">Şifremi Unuttum?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-softBlack transition-colors" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-softBlack focus:border-softBlack transition-all placeholder:text-stone-300"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-softBlack text-white rounded-xl font-medium text-sm hover:bg-stone-800 transition-all shadow-lg shadow-stone-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group mt-2"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Giriş Yap
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </motion.form>


        </div>

        {/* Footer info */}
        <div className="absolute bottom-6 text-center w-full text-[10px] text-stone-300">
          &copy; {new Date().getFullYear()} Favilla Candle Co. Tüm hakları saklıdır.
        </div>
      </div>
    </div>
  );
}
