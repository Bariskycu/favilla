
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import AdminLayout from './layouts/AdminLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Orders from './pages/admin/Orders';
import Customers from './pages/admin/Customers';
import Settings from './pages/admin/Settings';
import AuditLogs from './pages/admin/AuditLogs';
import SystemHealth from './pages/admin/SystemHealth';
import Support from './pages/admin/Support';

// Loading Fallback
const LoadingFallback = () => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-offWhite space-y-4">
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="w-16 h-16 rounded-full bg-cream border-4 border-softBlack"
    />
    <p className="font-serif text-softBlack tracking-widest text-sm animate-pulse">FAVILLA</p>
  </div>
);

// Protected Route Wrapper
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Root Redirect Logic */}
          <Route path="/" element={<Navigate to="/admin" replace />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="customers" element={<Customers />} />
            <Route path="settings" element={<Settings />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="system-health" element={<SystemHealth />} />
            <Route path="support" element={<Support />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
