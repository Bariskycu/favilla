
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, MapPin, Settings, LogOut, Plus, Trash2, ArrowRight, HelpCircle, CheckCircle, AlertCircle, Package, CreditCard, X, Pencil, MessageSquare, ChevronDown } from 'lucide-react';
import { useStore } from '../store';
import { translations } from '../translations';
import { useNavigate } from 'react-router-dom';
import { Address, SupportTicket, User } from '../types';

type Tab = 'overview' | 'orders' | 'addresses' | 'help' | 'settings';

export const ProfilePage: React.FC = () => {
    const { user, isAuthenticated, logout, orders, language, addAddress, removeAddress, updateProfile, updateAddress, fetchProfile, fetchTickets, fetchProductQuestions, fetchOrders } = useStore();
    const navigate = useNavigate();

    const t = translations[language];
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isAuthenticated) navigate('/login');
        else {
            fetchProfile();
            fetchTickets();
            fetchProductQuestions();
            fetchOrders();
        }
    }, [isAuthenticated, navigate, fetchProfile, fetchTickets, fetchProductQuestions, fetchOrders]);

    // Scroll to top of content when tab changes on mobile
    useEffect(() => {
        if (window.innerWidth < 1024 && scrollRef.current) {
            window.scrollTo({ top: scrollRef.current.offsetTop - 140, behavior: 'smooth' });
        }
    }, [activeTab]);

    if (!user) return null;

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        logout();
        navigate('/');
    };

    const tabs: { id: Tab; label: string }[] = [
        { id: 'overview', label: t.profile.menu.overview },
        { id: 'orders', label: t.profile.menu.orders },
        { id: 'addresses', label: t.profile.menu.addresses },
        { id: 'help', label: t.profile.menu.help },
        { id: 'settings', label: t.profile.menu.settings },
    ];

    return (
        <div className="min-h-screen bg-white text-softBlack pt-24 md:pt-32 pb-20 font-sans">
            <div className="max-w-7xl mx-auto px-6 md:px-12">

                {/* Header Section */}
                <div className="mb-8 lg:mb-24 border-b border-neutral-100 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-neutral-400 mb-2 block">{t.profile.title}</span>
                        <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl leading-tight">
                            {t.profile.overview.welcome}, <br className="hidden md:block" />
                            <span className="italic text-neutral-500">{user.name.split(' ')[0]}</span>
                        </h1>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-sm tracking-widest uppercase text-neutral-400">{user.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24" ref={scrollRef}>

                    {/* Desktop Sidebar Navigation */}
                    <div className="hidden lg:block lg:col-span-3">
                        <nav className="sticky top-32 space-y-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`group w-full flex items-center justify-between py-4 pr-4 transition-all duration-500 relative overflow-hidden text-left`}
                                >
                                    <span className={`relative z-10 text-xl transition-all duration-500 ${activeTab === tab.id ? 'font-serif italic pl-6 text-softBlack' : 'font-sans font-light text-neutral-400 hover:text-neutral-600 hover:pl-2'}`}>
                                        {tab.label}
                                    </span>
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeLineDesktop"
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-softBlack"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </button>
                            ))}

                            <button
                                onClick={handleLogoutClick}
                                className="w-full flex items-center gap-3 py-4 mt-8 text-neutral-400 hover:text-red-500 transition-colors group pl-0 hover:pl-2 duration-300"
                            >
                                <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                                <span className="text-xs font-bold tracking-widest uppercase">{t.profile.menu.logout}</span>
                            </button>
                        </nav>
                    </div>

                    {/* Mobile Horizontal Navigation (Sticky) */}
                    <div className="lg:hidden sticky top-[72px] z-30 -mx-6 px-6 bg-white/90 backdrop-blur-md border-b border-neutral-100 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                        <div className="flex gap-6 min-w-max pb-px">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative py-4 text-sm tracking-widest uppercase transition-colors ${activeTab === tab.id ? 'text-softBlack font-bold' : 'text-neutral-400'}`}
                                >
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeLineMobile"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-softBlack"
                                        />
                                    )}
                                </button>
                            ))}
                            <button onClick={handleLogoutClick} className="py-4 text-neutral-300 ml-4">
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-9 min-h-[60vh]">
                        <AnimatePresence mode="wait">
                            {activeTab === 'overview' && (
                                <motion.div
                                    key="overview"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.4 }}
                                    className="space-y-12"
                                >
                                    <div className="grid grid-cols-2 gap-4 md:gap-8">
                                        <div className="p-6 md:p-12 border border-neutral-100 bg-neutral-50 hover:bg-white hover:shadow-xl hover:shadow-neutral-100/50 transition-all duration-500 group">
                                            <div className="flex items-center justify-between mb-4 md:mb-6">
                                                <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-neutral-400 group-hover:text-softBlack transition-colors">{t.profile.overview.statOrders}</span>
                                                <Package size={16} className="text-neutral-300 md:hidden" />
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="font-serif text-3xl md:text-7xl">{orders.length}</span>
                                                <span className="text-neutral-400 italic font-serif text-sm md:text-base hidden md:inline">{t.profile.overview.items}</span>
                                            </div>
                                        </div>
                                        <div className="p-6 md:p-12 border border-neutral-100 bg-neutral-50 hover:bg-white hover:shadow-xl hover:shadow-neutral-100/50 transition-all duration-500 group">
                                            <div className="flex items-center justify-between mb-4 md:mb-6">
                                                <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-neutral-400 group-hover:text-softBlack transition-colors">{t.profile.overview.statSpent}</span>
                                                <CreditCard size={16} className="text-neutral-300 md:hidden" />
                                            </div>
                                            <div>
                                                <span className="font-serif text-3xl md:text-7xl">${orders.reduce((acc, o) => acc + (Number(o.total) || 0), 0).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Activity */}
                                    <div className="pt-8 md:pt-12 border-t border-neutral-100">
                                        <h3 className="font-serif text-xl md:text-2xl italic mb-6">{t.profile.overview.recentActivity}</h3>
                                        {orders.length > 0 ? (
                                            <div
                                                className="flex items-center justify-between py-6 border-b border-neutral-100 group cursor-pointer hover:bg-neutral-50/50 transition-colors -mx-2 px-2 rounded-lg"
                                                onClick={() => navigate(`/profile/orders/${encodeURIComponent(orders[0].id)}`)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 bg-neutral-100 rounded-full flex items-center justify-center text-softBlack">
                                                        <Package size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm md:text-base">{t.profile.overview.order} {orders[0].id}</p>
                                                        <p className="text-xs text-neutral-400 mt-1">{new Date(orders[0].createdAt).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}</p>
                                                    </div>
                                                </div>
                                                <ArrowRight className="text-neutral-300 group-hover:text-softBlack group-hover:translate-x-1 transition-all" size={18} />
                                            </div>
                                        ) : (
                                            <p className="text-neutral-400 font-light text-sm">{t.profile.overview.noActivity}</p>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'orders' && (
                                <motion.div
                                    key="orders"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <h2 className="font-serif text-2xl md:text-4xl mb-8 md:mb-12 hidden md:block">{t.profile.orders.title}</h2>

                                    {orders.length === 0 ? (
                                        <div className="py-24 text-center border-y border-neutral-100">
                                            <p className="font-serif text-xl italic text-neutral-400">{t.profile.orders.empty}</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-8 md:space-y-12">
                                            {orders.map(order => (
                                                <div
                                                    key={order.id}
                                                    className="group pb-8 md:pb-12 border-b border-neutral-100 last:border-0 cursor-pointer"
                                                    onClick={() => navigate(`/profile/orders/${encodeURIComponent(order.id)}`)}
                                                >
                                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                                        <div>
                                                            <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 block mb-1">{t.profile.overview.orderNo}</span>
                                                            <div className="flex items-center gap-2 group-hover:text-softBlack/70 transition-colors">
                                                                <span className="font-serif text-lg md:text-xl">{order.id}</span>
                                                                <ArrowRight size={16} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                                            </div>
                                                        </div>
                                                        <div className="flex w-full md:w-auto justify-between md:justify-start items-center gap-6">
                                                            <span className="text-sm font-medium text-neutral-500">{new Date(order.createdAt).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}</span>
                                                            <Badge status={order.status} t={t} />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {(order.items || []).slice(0, 2).map((item, idx) => (
                                                            <div key={idx} className="flex items-center gap-4 md:gap-6 p-3 md:p-4 bg-neutral-50/50 hover:bg-neutral-50 transition-colors rounded-sm">
                                                                <div className="w-16 h-20 bg-neutral-200 overflow-hidden relative flex-shrink-0">
                                                                    <img src={item.image} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <span className="block font-medium font-serif text-base md:text-lg truncate">{item.name}</span>
                                                                    <span className="text-[10px] tracking-widest uppercase text-neutral-400">{t.orderDetail.qty}: {item.quantity}</span>
                                                                </div>
                                                                <span className="font-medium text-sm md:text-base">${item.price}</span>
                                                            </div>
                                                        ))}
                                                        {(order.items || []).length > 2 && (
                                                            <div className="flex items-center justify-center p-4 bg-neutral-50 text-neutral-400 text-sm font-medium">
                                                                +{order.items.length - 2} {t.profile.orders.moreItems}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="mt-6 flex justify-end items-center gap-4">
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{t.profile.orders.total}</span>
                                                        <span className="font-serif text-xl md:text-2xl">${order.total}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'addresses' && (
                                <motion.div
                                    key="addresses"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <div className="flex justify-between items-end mb-8 md:mb-12 border-b border-neutral-200 pb-6">
                                        <h2 className="font-serif text-2xl md:text-4xl hidden md:block">{t.profile.addresses.title}</h2>
                                        <button
                                            onClick={() => {
                                                setEditingAddress(null);
                                                setShowAddressModal(true);
                                            }}
                                            className="w-full md:w-auto justify-center group flex items-center gap-2 text-xs font-bold tracking-widest uppercase hover:text-neutral-500 transition-colors py-3 md:py-0 border md:border-0 border-softBlack text-softBlack md:text-inherit"
                                        >
                                            <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                                            {t.profile.addresses.addNew}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                        {(user.addresses || []).map(addr => (
                                            <div key={addr.id} className="relative p-6 md:p-8 border border-neutral-200 hover:border-softBlack transition-colors duration-300 bg-white group">
                                                <div className="absolute top-6 right-6 flex gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => { setEditingAddress(addr); setShowAddressModal(true); }} className="text-neutral-300 hover:text-softBlack transition-colors p-2">
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button onClick={() => removeAddress(addr.id)} className="text-neutral-300 hover:text-red-500 transition-colors p-2">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <span className="inline-block px-3 py-1 bg-neutral-100 text-[10px] font-bold tracking-widest uppercase mb-6">
                                                    {addr.title}
                                                </span>
                                                <p className="font-serif text-lg leading-relaxed text-neutral-600">
                                                    {addr.line1}<br />
                                                    {addr.city}, {addr.zip}<br />
                                                    <span className="text-neutral-400">{addr.country}</span>
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'help' && (
                                <motion.div
                                    key="help"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.4 }}
                                    className="max-w-2xl"
                                >
                                    <h2 className="font-serif text-2xl md:text-4xl mb-4">{t.profile.help.title}</h2>
                                    <p className="text-neutral-500 mb-8 md:mb-12 text-sm md:text-base">{t.profile.help.subtitle}</p>

                                    <HelpForm t={t} />

                                    <div className="mt-16 md:mt-24 pt-12 border-t border-neutral-200">
                                        <div className="space-y-12">
                                            <div>
                                                <h3 className="font-serif text-xl md:text-2xl mb-8">{t.profile.help.requests}</h3>
                                                <TicketHistory t={t} />
                                            </div>
                                            <div>
                                                <h3 className="font-serif text-xl md:text-2xl mb-8">{t.profile.help.questions}</h3>
                                                <ProductQuestionHistory t={t} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'settings' && (
                                <motion.div
                                    key="settings"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.4 }}
                                    className="max-w-2xl"
                                >
                                    <h2 className="font-serif text-2xl md:text-4xl mb-8 md:mb-12 hidden md:block">{t.profile.settings.title}</h2>

                                    <div className="space-y-12 md:space-y-16">
                                        <section>
                                            <h3 className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase border-b border-neutral-200 pb-4 mb-8 flex items-center justify-between">
                                                <span>{t.profile.settings.personalInfo}</span>
                                                <UserIcon size={14} className="text-neutral-400" />
                                            </h3>

                                            <PersonalInfoForm user={user} t={t} updateProfile={updateProfile} />
                                        </section>

                                        <section>
                                            <h3 className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase border-b border-neutral-200 pb-4 mb-8 flex items-center justify-between">
                                                <span>{t.profile.settings.security}</span>
                                                <Settings size={14} className="text-neutral-400" />
                                            </h3>
                                            <PasswordForm t={t} />
                                        </section>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Address Modal */}
                <AnimatePresence>
                    {showAddressModal && (
                        <div className="fixed inset-0 bg-neutral-900/40 z-[80] backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                className="bg-white p-6 md:p-12 w-full max-w-lg shadow-2xl shadow-neutral-200 rounded-t-2xl md:rounded-none"
                            >
                                <div className="text-center mb-8 md:mb-10">
                                    <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 block mb-2">{t.profile.addresses.title}</span>
                                    <h3 className="font-serif text-2xl md:text-3xl">{editingAddress ? t.profile.addresses.editTitle : t.profile.addresses.formTitle}</h3>
                                </div>

                                <AddressForm
                                    initialData={editingAddress || undefined}
                                    onSubmit={(data) => {
                                        if (editingAddress) {
                                            updateAddress({ ...data, id: editingAddress.id });
                                        } else {
                                            addAddress(data);
                                        }
                                        setShowAddressModal(false);
                                    }}
                                    onCancel={() => setShowAddressModal(false)}
                                    t={t}
                                />
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Logout Confirmation Modal */}
                <AnimatePresence>
                    {showLogoutConfirm && (
                        <div className="fixed inset-0 bg-neutral-900/40 z-[90] backdrop-blur-sm flex items-center justify-center p-6">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                className="bg-white p-8 md:p-10 w-full max-w-md shadow-2xl relative"
                            >
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="absolute top-4 right-4 p-2 text-neutral-300 hover:text-softBlack transition-colors"
                                >
                                    <X size={20} />
                                </button>

                                <div className="text-center">
                                    <h3 className="font-serif text-2xl md:text-3xl mb-4">{t.profile.logoutModal.title}</h3>
                                    <p className="text-neutral-500 mb-8">{t.profile.logoutModal.message}</p>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setShowLogoutConfirm(false)}
                                            className="flex-1 border border-neutral-200 py-3 text-xs font-bold tracking-widest uppercase hover:bg-neutral-50 transition-colors"
                                        >
                                            {t.profile.logoutModal.cancel}
                                        </button>
                                        <button
                                            onClick={confirmLogout}
                                            className="flex-1 bg-softBlack text-white py-3 text-xs font-bold tracking-widest uppercase hover:bg-neutral-800 transition-colors"
                                        >
                                            {t.profile.logoutModal.confirm}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const HelpForm = ({ t }: { t: any }) => {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
    const [formData, setFormData] = useState({ subject: 'shipping', orderNo: '', message: '' });
    const { submitTicket, addToast } = useStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation for Order No
        if (formData.orderNo && formData.orderNo.trim() !== '') {
            if (!formData.orderNo.startsWith('#FAV-')) {
                addToast('Geçersiz Sipariş Numarası. Format: #FAV-XXXX', 'error');
                return;
            }
        }

        setStatus('submitting');

        try {
            await submitTicket(formData.subject, formData.message, formData.orderNo);
            setStatus('success');
            setFormData({ subject: 'shipping', orderNo: '', message: '' });
            // Reset status after a few seconds
            setTimeout(() => setStatus('idle'), 5000);
        } catch (error) {
            setStatus('idle');
        }
    };

    return (
        <div className="relative">
            <AnimatePresence>
                {status === 'success' && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -20, height: 0 }}
                        className="mb-8 overflow-hidden"
                    >
                        <div className="bg-neutral-50 border border-neutral-100 p-6 flex items-start gap-4">
                            <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                            <div>
                                <h4 className="font-serif text-lg text-green-800 mb-1">{t.profile.help.successTitle}</h4>
                                <p className="text-sm text-neutral-500">{t.profile.help.successMsg}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="group">
                        <label htmlFor="help-subject" className="block text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-2">{t.profile.help.subject}</label>
                        <div className="relative">
                            <select
                                id="help-subject"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className="w-full pb-2 bg-transparent border-b border-neutral-200 focus:border-softBlack outline-none font-serif text-base md:text-lg transition-colors appearance-none cursor-pointer rounded-none"
                            >
                                <option value="shipping">{t.profile.help.subjects.shipping}</option>
                                <option value="complaint">{t.profile.help.subjects.complaint}</option>
                                <option value="product">{t.profile.help.subjects.product}</option>
                                <option value="return">{t.profile.help.subjects.return}</option>
                                <option value="other">{t.profile.help.subjects.other}</option>
                            </select>
                        </div>
                    </div>
                    <div className="group">
                        <label htmlFor="help-orderno" className="block text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-2 group-focus-within:text-softBlack transition-colors">{t.profile.help.orderNo}</label>
                        <input
                            id="help-orderno"
                            type="text"
                            placeholder="#FAV-1001"
                            value={formData.orderNo}
                            onChange={(e) => setFormData({ ...formData, orderNo: e.target.value })}
                            className="w-full pb-2 bg-transparent border-b border-neutral-200 focus:border-softBlack outline-none font-serif text-base md:text-lg transition-colors rounded-none placeholder:text-neutral-300"
                        />
                    </div>
                </div>

                <div className="group">
                    <label htmlFor="help-message" className="block text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-2 group-focus-within:text-softBlack transition-colors">{t.profile.help.message}</label>
                    <textarea
                        id="help-message"
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full py-2 bg-transparent border-b border-neutral-200 focus:border-softBlack outline-none font-serif text-base md:text-lg transition-colors resize-none rounded-none"
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="w-full md:w-auto px-8 py-4 md:py-3 bg-softBlack text-white text-xs font-bold tracking-widest uppercase hover:bg-neutral-800 transition-colors disabled:opacity-50"
                    >
                        {status === 'submitting' ? '...' : t.profile.help.submit}
                    </button>
                </div>
            </form>
        </div>
    );
};

const TicketHistory = ({ t }: { t: any }) => {
    const { tickets, language } = useStore();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (tickets.length === 0) {
        return (
            <div className="text-center py-8 text-neutral-400 font-serif italic">
                {t.profile.help.noRequests}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {tickets.map((ticket) => (
                <div key={ticket.id} className="border border-neutral-100 bg-neutral-50/30 rounded-sm overflow-hidden">
                    <button
                        onClick={() => toggleExpand(ticket.id)}
                        className="w-full p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left hover:bg-neutral-50 transition-colors"
                    >
                        <div className="flex items-center gap-4 md:gap-8">
                            <div>
                                <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 block mb-1">{t.profile.help.ticketId}</span>
                                <span className="font-serif text-lg">{ticket.id}</span>
                            </div>
                            <div className="hidden md:block w-px h-8 bg-neutral-200" />
                            <div className="hidden md:block">
                                <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 block mb-1">{t.profile.orders.date}</span>
                                <span className="text-sm font-medium">{new Date(ticket.createdAt).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}</span>
                            </div>
                        </div>

                        <div className="flex w-full md:w-auto justify-between md:justify-end items-center gap-6">
                            <span className="text-sm font-medium text-softBlack/70 uppercase tracking-wide md:hidden">
                                {new Date(ticket.createdAt).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}
                            </span>
                            <Badge status={ticket.status} t={t} />
                            <ChevronDown size={16} className={`text-neutral-400 transition-transform duration-300 ${expandedId === ticket.id ? 'rotate-180' : ''}`} />
                        </div>
                    </button>

                    <AnimatePresence>
                        {expandedId === ticket.id && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-neutral-100"
                            >
                                <div className="p-4 md:p-6 bg-white">
                                    <div className="mb-4">
                                        <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 block mb-2">{t.profile.help.subject}</span>
                                        <span className="text-sm font-medium capitalize">{t.profile.help.subjects[ticket.subject as keyof typeof t.profile.help.subjects] || ticket.subject}</span>
                                    </div>
                                    {ticket.orderNo && (
                                        <div className="mb-4">
                                            <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 block mb-2">{t.profile.help.orderNo}</span>
                                            <span className="text-sm font-medium text-neutral-600">{ticket.orderNo}</span>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 block mb-2">{t.profile.help.message}</span>
                                        <p className="text-sm text-neutral-600 leading-relaxed font-serif">
                                            {ticket.message}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
};

const ProductQuestionHistory = ({ t }: { t: any }) => {
    const { productQuestions } = useStore();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (productQuestions.length === 0) {
        return (
            <div className="text-center py-8 text-neutral-400 font-serif italic">
                {t.profile.help.noQuestions}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {productQuestions.map((q) => (
                <div key={q.id} className="border border-neutral-100 bg-neutral-50/30 rounded-sm overflow-hidden">
                    <button
                        onClick={() => toggleExpand(q.id)}
                        className="w-full p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left hover:bg-neutral-50 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-neutral-200 rounded-sm overflow-hidden flex-shrink-0">
                                <img src={q.product?.image || ''} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 block mb-0.5">{t.profile.help.questionId}: {q.id}</span>
                                <span className="font-serif text-base text-softBlack line-clamp-1">{q.product?.name || 'Product'}</span>
                            </div>
                        </div>

                        <div className="flex w-full md:w-auto justify-between md:justify-end items-center gap-6">
                            <span className="text-sm font-medium text-softBlack/70 uppercase tracking-wide md:hidden">
                                {new Date(q.createdAt || q.answeredAt || Date.now()).toLocaleDateString()}
                            </span>
                            <Badge status={q.status || 'pending'} t={t} />
                            <ChevronDown size={16} className={`text-neutral-400 transition-transform duration-300 ${expandedId === q.id ? 'rotate-180' : ''}`} />
                        </div>
                    </button>

                    <AnimatePresence>
                        {expandedId === q.id && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-neutral-100"
                            >
                                <div className="p-4 md:p-6 bg-white space-y-6">
                                    <div>
                                        <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 block mb-2">{t.product.qa.tab}</span>
                                        <p className="text-sm text-softBlack font-medium leading-relaxed font-serif italic">
                                            "{q.question}"
                                        </p>
                                    </div>
                                    {q.answer && (
                                        <div className="bg-neutral-50 p-4 border-l-2 border-softBlack">
                                            <span className="text-[10px] font-bold tracking-widest uppercase text-softBlack/60 block mb-2">Lambardia Support</span>
                                            <p className="text-sm text-neutral-600 leading-relaxed">
                                                {q.answer}
                                            </p>
                                        </div>
                                    )}
                                    {!q.answer && (
                                        <div className="text-xs text-neutral-400 italic">
                                            {t.product.qa.pendingResponse}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
};

const PersonalInfoForm = ({ user, t, updateProfile }: { user: User, t: any, updateProfile: any }) => {
    const [name, setName] = useState(user.name);
    const [phone, setPhone] = useState(user.phone || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await updateProfile({ name, phone });
        } catch (error) {
            // Error handling if needed (toast handled in store)
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="group">
                    <label htmlFor="settings-name" className="block text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-2 group-focus-within:text-softBlack transition-colors">{t.auth.fullName}</label>
                    <input id="settings-name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full pb-2 bg-transparent border-b border-neutral-200 focus:border-softBlack outline-none font-serif text-base md:text-lg transition-colors rounded-none" />
                </div>
                <div className="group">
                    <label htmlFor="settings-email" className="block text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-2">{t.auth.email}</label>
                    <input id="settings-email" type="email" defaultValue={user.email} disabled className="w-full pb-2 bg-transparent border-b border-neutral-100 text-neutral-300 font-serif text-base md:text-lg cursor-not-allowed rounded-none" />
                </div>
            </div>
            <div className="group">
                <label htmlFor="settings-phone" className="block text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-2 group-focus-within:text-softBlack transition-colors">{t.auth.phone}</label>
                <input
                    id="settings-phone"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+1 555 000 0000"
                    className="w-full pb-2 bg-transparent border-b border-neutral-200 focus:border-softBlack outline-none font-serif text-base md:text-lg transition-colors rounded-none"
                />
            </div>
            <div className="pt-4">
                <button type="submit" disabled={isSubmitting} className="w-full md:w-auto px-8 py-4 md:py-3 bg-softBlack text-white text-xs font-bold tracking-widest uppercase hover:bg-neutral-800 transition-colors disabled:opacity-50">
                    {isSubmitting ? '...' : t.profile.settings.updateProfile}
                </button>
            </div>
        </form>
    );
};

const PasswordForm = ({ t }: { t: any }) => {
    const [current, setCurrent] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirm, setConfirm] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { updateProfile } = useStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMsg('');

        if (newPass !== confirm) {
            setError(t.profile.settings.passwordMismatch);
            return;
        }
        if (newPass.length < 6) {
            setError(t.auth.errorShortPass);
            return;
        }

        setIsSubmitting(true);
        try {
            await updateProfile({
                currentPassword: current,
                newPassword: newPass,
                confirmPassword: confirm
            });
            setMsg(t.profile.settings.passwordSuccess);
            setCurrent('');
            setNewPass('');
            setConfirm('');
        } catch (err) {
            // Error usually handled in store toast, but we can set local error too
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="group">
                <label htmlFor="pass-current" className="block text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-2 group-focus-within:text-softBlack transition-colors">{t.profile.settings.currentPassword}</label>
                <input id="pass-current" type="password" value={current} onChange={e => setCurrent(e.target.value)} required className="w-full pb-2 bg-transparent border-b border-neutral-200 focus:border-softBlack outline-none font-serif text-base md:text-lg transition-colors rounded-none" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="group">
                    <label htmlFor="pass-new" className="block text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-2 group-focus-within:text-softBlack transition-colors">{t.profile.settings.newPassword}</label>
                    <input id="pass-new" type="password" value={newPass} onChange={e => setNewPass(e.target.value)} required className="w-full pb-2 bg-transparent border-b border-neutral-200 focus:border-softBlack outline-none font-serif text-base md:text-lg transition-colors rounded-none" />
                </div>
                <div className="group">
                    <label htmlFor="pass-confirm" className="block text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-2 group-focus-within:text-softBlack transition-colors">{t.profile.settings.confirmPassword}</label>
                    <input id="pass-confirm" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required className="w-full pb-2 bg-transparent border-b border-neutral-200 focus:border-softBlack outline-none font-serif text-base md:text-lg transition-colors rounded-none" />
                </div>
            </div>
            {error && <p role="alert" className="text-xs text-red-500 font-medium tracking-wide mt-2">{error}</p>}
            {msg && <p role="status" className="text-xs text-green-600 font-medium tracking-wide mt-2">{msg}</p>}
            <div className="pt-4">
                <button type="submit" disabled={isSubmitting} className="w-full md:w-auto px-8 py-4 md:py-3 border border-neutral-200 text-neutral-900 text-xs font-bold tracking-widest uppercase hover:border-softBlack hover:bg-softBlack hover:text-white transition-all disabled:opacity-50">
                    {isSubmitting ? '...' : t.profile.settings.changePassword}
                </button>
            </div>
        </form>
    );
};

const Badge = ({ status, t }: { status: string, t: any }) => {
    const colors = {
        processing: 'text-neutral-500 border-neutral-300',
        shipped: 'text-blue-600 border-blue-200',
        delivered: 'text-green-600 border-green-200',
        open: 'text-yellow-600 border-yellow-200',
        'in-progress': 'text-blue-600 border-blue-200',
        resolved: 'text-green-600 border-green-200',
        pending: 'text-orange-500 border-orange-200',
        answered: 'text-purple-600 border-purple-200'
    };
    const label = t.status[status as keyof typeof t.status] || status;
    return (
        <span className={`px-3 py-1 border text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${colors[status as keyof typeof colors] || 'text-neutral-500 border-neutral-300'}`}>
            {label}
        </span>
    );
};

const AddressForm = ({ initialData, onSubmit, onCancel, t }: { initialData?: Partial<Address>, onSubmit: (d: Omit<Address, 'id'>) => void, onCancel: () => void, t: any }) => {
    const [formData, setFormData] = useState<Omit<Address, 'id'>>({
        title: initialData?.title || '',
        line1: initialData?.line1 || '',
        city: initialData?.city || '',
        zip: initialData?.zip || '',
        country: initialData?.country || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-6">
            <div className="group">
                <label htmlFor="edit-title" className="hidden">{t.cart.address.labels.title}</label>
                <input id="edit-title" name="title" value={formData.title} required placeholder={t.cart.address.placeholders.title} onChange={handleChange} className="w-full pb-3 bg-transparent border-b border-neutral-200 focus:border-softBlack outline-none font-serif text-lg placeholder:font-sans placeholder:text-sm placeholder:text-neutral-300 transition-colors rounded-none" />
            </div>
            <div className="group">
                <label htmlFor="edit-line1" className="hidden">{t.cart.address.labels.line1}</label>
                <input id="edit-line1" name="line1" value={formData.line1} required placeholder={t.cart.address.placeholders.line1} onChange={handleChange} className="w-full pb-3 bg-transparent border-b border-neutral-200 focus:border-softBlack outline-none font-serif text-lg placeholder:font-sans placeholder:text-sm placeholder:text-neutral-300 transition-colors rounded-none" />
            </div>
            <div className="grid grid-cols-2 gap-4 md:gap-8">
                <div className="group">
                    <label htmlFor="edit-city" className="hidden">{t.cart.address.labels.city}</label>
                    <input id="edit-city" name="city" value={formData.city} required placeholder={t.cart.address.placeholders.city} onChange={handleChange} className="w-full pb-3 bg-transparent border-b border-neutral-200 focus:border-softBlack outline-none font-serif text-lg placeholder:font-sans placeholder:text-sm placeholder:text-neutral-300 transition-colors rounded-none" />
                </div>
                <div className="group">
                    <label htmlFor="edit-zip" className="hidden">{t.cart.address.labels.zip}</label>
                    <input id="edit-zip" name="zip" value={formData.zip} required placeholder={t.cart.address.placeholders.zip} onChange={handleChange} className="w-full pb-3 bg-transparent border-b border-neutral-200 focus:border-softBlack outline-none font-serif text-lg placeholder:font-sans placeholder:text-sm placeholder:text-neutral-300 transition-colors rounded-none" />
                </div>
            </div>
            <div className="group">
                <label htmlFor="edit-country" className="hidden">{t.cart.address.labels.country}</label>
                <input id="edit-country" name="country" value={formData.country} required placeholder={t.cart.address.placeholders.country} onChange={handleChange} className="w-full pb-3 bg-transparent border-b border-neutral-200 focus:border-softBlack outline-none font-serif text-lg placeholder:font-sans placeholder:text-sm placeholder:text-neutral-300 transition-colors rounded-none" />
            </div>

            <div className="flex gap-4 pt-4 md:pt-8">
                <button type="submit" className="flex-1 bg-softBlack text-white py-4 text-xs font-bold tracking-widest uppercase hover:bg-neutral-800 transition-colors">
                    {initialData ? t.profile.addresses.update : t.profile.addresses.save}
                </button>
                <button type="button" onClick={onCancel} className="flex-1 border border-neutral-200 py-4 text-xs font-bold tracking-widest uppercase hover:bg-neutral-50 transition-colors">{t.profile.addresses.cancel}</button>
            </div>
        </form>
    )
};
