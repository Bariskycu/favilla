
import React, { useEffect, Suspense } from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartSidebar } from './components/CartSidebar';
import { ToastContainer } from './components/Toast';
import { SearchOverlay } from './components/SearchOverlay';
import { Flame } from 'lucide-react';
import { useStore } from './store';

// Lazy load pages to improve initial bundle size (Code Splitting)
// Since pages are named exports, we use the .then(module => ({ default: module.Name })) pattern
const HomePage = React.lazy(() => import('./pages/HomePage').then(module => ({ default: module.HomePage })));
const ShopPage = React.lazy(() => import('./pages/ShopPage').then(module => ({ default: module.ShopPage })));
const ProductDetailPage = React.lazy(() => import('./pages/ProductDetailPage').then(module => ({ default: module.ProductDetailPage })));
const LoginPage = React.lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage').then(module => ({ default: module.RegisterPage })));
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage').then(module => ({ default: module.ForgotPasswordPage })));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage').then(module => ({ default: module.ProfilePage })));
const OrderDetailPage = React.lazy(() => import('./pages/OrderDetailPage').then(module => ({ default: module.OrderDetailPage })));
const AtelierPage = React.lazy(() => import('./pages/AtelierPage').then(module => ({ default: module.AtelierPage })));
const FAQPage = React.lazy(() => import('./pages/FAQPage').then(module => ({ default: module.FAQPage })));
const ContactPage = React.lazy(() => import('./pages/ContactPage').then(module => ({ default: module.ContactPage })));
const ShippingPage = React.lazy(() => import('./pages/ShippingPage').then(module => ({ default: module.ShippingPage })));
const WishlistPage = React.lazy(() => import('./pages/WishlistPage').then(module => ({ default: module.WishlistPage })));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })));
const PrivacyPolicyPage = React.lazy(() => import('./pages/PrivacyPolicyPage').then(module => ({ default: module.PrivacyPolicyPage })));
const TermsOfServicePage = React.lazy(() => import('./pages/TermsOfServicePage').then(module => ({ default: module.TermsOfServicePage })));

const PaymentResultPage = React.lazy(() => import('./pages/PaymentResultPage').then(module => ({ default: module.PaymentResultPage })));
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};
{/* Catch-all 404 Route */ }
<Route path="*" element={<NotFoundPage />} />

// Elegant Loading Spinner for Suspense Fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-offWhite z-40">
    <div className="relative">
      <div className="absolute inset-0 bg-cream/50 blur-xl rounded-full animate-pulse"></div>
      <Flame size={48} className="text-softBlack relative z-10 animate-pulse" strokeWidth={1} />
    </div>
    <span className="mt-6 font-serif text-softBlack/40 text-sm tracking-[0.3em] uppercase animate-pulse">
      Favilla...
    </span>
  </div>
);

const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const hideLayout = ['/login', '/register', '/forgot-password'].includes(location.pathname);
  const verifySession = useStore((state) => state.verifySession);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  useEffect(() => {
    const handleUnauthorized = () => {
      navigate('/login');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-offWhite text-softBlack font-sans selection:bg-cream selection:text-softBlack">
      <ToastContainer />
      <SearchOverlay />

      {/* Navbar remains static so navigation is always visible, unless hidden */}
      {!hideLayout && <Navbar />}
      <CartSidebar />

      {/* Suspense handles the loading state for lazy components */}
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/orders/:id" element={<OrderDetailPage />} />
          <Route path="/atelier" element={<AtelierPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/shipping" element={<ShippingPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/payment/result" element={<PaymentResultPage />} />
          {/* Catch-all 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      {/* Footer remains static, unless hidden */}
      {!hideLayout && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <ScrollToTop />
      <AppContent />
    </HashRouter>
  );
};

export default App;
