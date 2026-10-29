
import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  Bell,
  Menu,
  X,
  Search,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  ShieldAlert,
  Activity,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// SidebarLink artık React Router NavLink kullanıyor
const SidebarLink = ({ to, icon: Icon, label, collapsed }: { to: string; icon: any; label: string; collapsed: boolean }) => {
  return (
    <NavLink
      to={to}
      end={to === '/admin'} // /admin rotası için tam eşleşme
      title={collapsed ? label : undefined}
      className={({ isActive }) => `flex items-center ${collapsed ? 'justify-center px-2' : 'px-4 gap-3'} py-3 rounded-lg transition-all duration-300 group ${isActive
        ? 'bg-softBlack text-white shadow-md'
        : 'text-stone-600 hover:bg-cream hover:text-softBlack'
        }`}
    >
      <Icon size={20} strokeWidth={1.5} />
      {!collapsed && (
        <span className="font-medium text-sm tracking-wide whitespace-nowrap overflow-hidden">
          {label}
        </span>
      )}
    </NavLink>
  );
};

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // URL'e göre sayfa başlığını belirle
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('products')) return 'Ürün Yönetimi';
    if (path.includes('orders')) return 'Siparişler';
    if (path.includes('customers')) return 'Müşteriler';
    if (path.includes('settings')) return 'Ayarlar';
    if (path.includes('audit-logs')) return 'Denetim Kayıtları';
    if (path.includes('system-health')) return 'Sistem Sağlığı';
    if (path.includes('support')) return 'Destek Talepleri';
    return 'Panel Özeti';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-offWhite text-softBlack font-sans">

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-softBlack/20 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-stone-200 shadow-sm flex flex-col
          ${isSidebarOpen ? 'translate-x-0 !w-64' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className={`h-full flex flex-col p-4 ${collapsed ? 'items-center' : ''}`}>
          {/* Logo & Toggle */}
          <div className={`flex items-center ${collapsed ? 'justify-center mb-8' : 'justify-between mb-10 pl-2'}`}>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-semibold tracking-tight">Favilla</span>
                <span className="text-xs uppercase tracking-[0.2em] text-stone-500">Candle Co.</span>
              </div>
            )}
            {collapsed && (
              <span className="font-serif text-2xl font-semibold tracking-tight">F</span>
            )}

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-stone-400 hover:text-softBlack"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 w-full">
            <SidebarLink to="/admin" icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} />
            <SidebarLink to="/admin/products" icon={Package} label="Ürünler" collapsed={collapsed} />
            <SidebarLink to="/admin/orders" icon={ShoppingBag} label="Siparişler" collapsed={collapsed} />
            <SidebarLink to="/admin/customers" icon={Users} label="Müşteriler" collapsed={collapsed} />
            <SidebarLink to="/admin/audit-logs" icon={ShieldAlert} label="Denetim" collapsed={collapsed} />
            <SidebarLink to="/admin/support" icon={MessageSquare} label="Destek" collapsed={collapsed} />
            <SidebarLink to="/admin/system-health" icon={Activity} label="Sistem Sağlığı" collapsed={collapsed} />
            <div className={`pt-6 mt-6 border-t border-stone-100 ${collapsed ? 'w-10 mx-auto' : ''}`}>
              <SidebarLink to="/admin/settings" icon={Settings} label="Ayarlar" collapsed={collapsed} />
            </div>
          </nav>

          {/* User Profile Snippet */}
          <div className={`mt-auto pt-6 flex items-center gap-3 border-t border-stone-100 ${collapsed ? 'flex-col justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 border border-stone-200 shrink-0">
              <User size={20} />
            </div>

            {!collapsed && (
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm font-medium truncate">{user?.name || 'Admin'}</p>
                <p className="text-xs text-stone-500 truncate">{user?.role || 'Yönetici'}</p>
              </div>
            )}

            <button
              onClick={handleLogout}
              className={`text-stone-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg ${collapsed ? 'mt-2' : ''}`}
              title="Çıkış Yap"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-20 bg-white border border-stone-200 rounded-full p-1 text-stone-400 hover:text-softBlack shadow-sm z-50"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-stone-200 h-16 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-softBlack p-1 rounded-md hover:bg-stone-100"
            >
              <Menu size={24} />
            </button>
            <h1 className="font-serif text-xl lg:text-2xl text-softBlack hidden sm:block">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input
                type="text"
                placeholder="Ara..."
                className="pl-10 pr-4 py-2 bg-stone-100 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-stone-300 w-64 transition-all focus:w-72"
              />
            </div>
            <button className="relative text-stone-500 hover:text-softBlack transition-colors p-2 hover:bg-stone-50 rounded-full">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Page Content Scroll Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 bg-offWhite scroll-smooth">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
