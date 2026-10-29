import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Download, Package, Truck, Home, CreditCard, Star, FileText } from 'lucide-react';
import { useStore } from '../store';
import { translations } from '../translations';
import { OrderStatus } from '../types';

export const OrderDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { language, fetchOrder } = useStore();
    const t = translations[language];

    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<any | null>(null);

    useEffect(() => {
        if (id) {
            fetchOrder(id).then(data => {
                setOrder(data);
                setLoading(false);
            });
        }
    }, [id, fetchOrder]);

    if (!order && !loading) {
        return (
            <div className="min-h-screen pt-32 flex flex-col items-center justify-center">
                <p className="font-serif text-xl mb-4">{t.common.notFound}</p>
                <button onClick={() => navigate('/profile')} className="text-sm underline">{t.common.backProfile}</button>
            </div>
        );
    }

    if (loading) {
        return <div className="min-h-screen pt-32"></div>;
    }

    // Address is now part of the order object (if fetched via detail)
    const address = order?.address;

    return (
        <div className="min-h-screen bg-offWhite pt-24 md:pt-32 pb-20 px-6">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12"
                >
                    <div>
                        <button
                            onClick={() => navigate('/profile')}
                            className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-softBlack/50 hover:text-softBlack transition-colors mb-4 group"
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            {t.orderDetail.back}
                        </button>
                        <h1 className="font-serif text-3xl md:text-4xl mb-2">{t.orderDetail.title} <span className="text-softBlack/30 italic">{order?.id}</span></h1>
                        <p className="text-sm text-softBlack/60">{order?.date}</p>
                    </div>

                    <button className="flex items-center gap-2 px-6 py-3 border border-softBlack/10 hover:bg-white hover:border-softBlack transition-all rounded-sm group">
                        <Download size={16} className="text-softBlack/60 group-hover:text-softBlack" />
                        <span className="text-xs font-bold tracking-widest uppercase">{t.orderDetail.downloadInvoice}</span>
                    </button>
                </motion.div>

                {/* Status Timeline */}
                <StatusTimeline status={order?.status!} t={t} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mt-12">

                    {/* Left Column (Items) */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Ordered Items */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white p-6 md:p-8 border border-neutral-100 shadow-sm"
                        >
                            <h3 className="font-serif text-xl mb-6">{t.orderDetail.items}</h3>
                            <div className="space-y-6">
                                {(order?.items || []).map((item, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => navigate(`/product/${item.productId}`)}
                                        className="flex gap-4 md:gap-6 pb-6 border-b border-neutral-50 last:border-0 last:pb-0 cursor-pointer group"
                                    >
                                        <div className="w-20 h-24 bg-neutral-100 flex-shrink-0 relative overflow-hidden">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-serif text-lg leading-tight group-hover:text-softBlack/70 transition-colors">{item.name}</h4>
                                                    <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 mt-1">{t.orderDetail.qty}: {item.quantity}</p>
                                                </div>
                                                <span className="font-medium">${item.price * item.quantity}</span>
                                            </div>
                                            <div className="text-xs text-neutral-400">
                                                {t.orderDetail.unitPrice}: ${item.price}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* User Review Section */}
                        <ReviewSection t={t} />

                    </div>

                    {/* Right Column (Sidebar Info) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-6"
                    >
                        {/* Order Summary Card */}
                        <div className="bg-white p-6 md:p-8 border border-neutral-100 shadow-sm">
                            <h3 className="font-serif text-lg mb-6">{t.orderDetail.summary}</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-neutral-600">
                                    <span>{t.cart.subtotal}</span>
                                    <span>${order?.total}</span>
                                </div>
                                <div className="flex justify-between text-neutral-600">
                                    <span>{t.orderDetail.shipping}</span>
                                    <span className="text-green-600">{t.common.free}</span>
                                </div>
                                <div className="border-t border-neutral-100 pt-3 mt-3 flex justify-between font-medium text-lg font-serif">
                                    <span>{t.orderDetail.total}</span>
                                    <span>${order?.total}</span>
                                </div>
                            </div>
                        </div>

                        {/* Address Card */}
                        <div className="bg-white p-6 md:p-8 border border-neutral-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4 text-neutral-400">
                                <Home size={16} />
                                <span className="text-[10px] font-bold tracking-widest uppercase">{t.orderDetail.deliveryAddress}</span>
                            </div>
                            {address ? (
                                <p className="font-serif text-lg leading-relaxed text-softBlack">
                                    {address.title}<br />
                                    <span className="text-base font-sans font-light text-neutral-600">
                                        {address.line1}<br />
                                        {address.city}, {address.zip}<br />
                                        {address.country}
                                    </span>
                                </p>
                            ) : (
                                <p className="text-neutral-400 italic">No address information.</p>
                            )}
                        </div>

                        {/* Payment Info Mock */}
                        <div className="bg-white p-6 md:p-8 border border-neutral-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4 text-neutral-400">
                                <CreditCard size={16} />
                                <span className="text-[10px] font-bold tracking-widest uppercase">{t.orderDetail.paymentMethod}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-12 bg-neutral-100 rounded-sm flex items-center justify-center text-[10px] font-bold text-neutral-500">
                                    CARD
                                </div>
                                <span className="text-sm text-neutral-600">Credit Card Payment</span>
                            </div>
                        </div>

                    </motion.div>
                </div>
            </div>
        </div>
    );
};

const StatusTimeline = ({ status, t }: { status: OrderStatus, t: any }) => {
    // Map status strings to a 0-3 scale
    // processing -> 0 or 1
    // shipped -> 2
    // delivered -> 3
    let currentStep = 1;
    if (status === 'shipped') currentStep = 2;
    if (status === 'delivered') currentStep = 3;

    const steps = [
        { icon: FileText, label: t.orderDetail.steps.received },
        { icon: Package, label: t.orderDetail.steps.preparing },
        { icon: Truck, label: t.orderDetail.steps.shipped },
        { icon: Home, label: t.orderDetail.steps.delivered }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 md:p-12 border border-neutral-100 shadow-sm overflow-hidden"
        >
            <div className="relative">
                {/* Progress Bar Background */}
                <div className="absolute top-5 left-0 w-full h-0.5 bg-neutral-100 hidden md:block" />
                <div className="absolute left-5 top-0 w-0.5 h-full bg-neutral-100 md:hidden" />

                {/* Active Progress Line (Horizontal Desktop) */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="absolute top-5 left-0 h-0.5 bg-softBlack hidden md:block"
                />
                {/* Active Progress Line (Vertical Mobile) */}
                <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(currentStep / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="absolute left-5 top-0 w-0.5 bg-softBlack md:hidden"
                />

                <div className="flex flex-col md:flex-row justify-between relative z-10 h-full gap-8 md:gap-0">
                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        const isCompleted = idx <= currentStep;
                        const isCurrent = idx === currentStep;

                        return (
                            <div key={idx} className="flex md:flex-col items-center gap-4 md:gap-4">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: idx * 0.2 }}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-500 bg-white
                                        ${isCompleted ? 'border-softBlack text-softBlack' : 'border-neutral-200 text-neutral-300'}
                                    `}
                                >
                                    {isCompleted ? <Check size={16} /> : <Icon size={16} />}
                                </motion.div>
                                <div className={`md:text-center transition-colors duration-500 ${isCurrent ? 'text-softBlack' : 'text-neutral-400'}`}>
                                    <span className="text-xs font-bold tracking-widest uppercase block">{step.label}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};

const ReviewSection = ({ t }: { t: any }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        if (rating === 0) return;
        setSubmitted(true);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-neutral-50 p-6 md:p-8 border border-neutral-100"
        >
            <h3 className="font-serif text-xl mb-2">{t.orderDetail.review.title}</h3>

            <AnimatePresence mode='wait'>
                {!submitted ? (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-1 my-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                                >
                                    <Star
                                        size={24}
                                        className={`transition-colors duration-200 ${star <= (hoverRating || rating)
                                            ? 'fill-softBlack text-softBlack'
                                            : 'text-neutral-300'
                                            }`}
                                    />
                                </button>
                            ))}
                            <span className="ml-2 text-xs font-bold tracking-widest uppercase text-neutral-400">
                                {rating > 0 ? `${rating} / 5` : t.orderDetail.review.rating}
                            </span>
                        </div>

                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder={t.orderDetail.review.placeholder}
                            className="w-full p-4 bg-white border border-neutral-200 focus:border-softBlack outline-none font-serif text-sm transition-colors min-h-[100px] resize-none"
                        />

                        <button
                            onClick={handleSubmit}
                            disabled={rating === 0}
                            className="bg-softBlack text-white px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t.orderDetail.review.submit}
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-8 text-center"
                    >
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4">
                            <Check size={32} />
                        </div>
                        <h4 className="font-serif text-lg text-softBlack mb-2">{t.orderDetail.review.submitted}</h4>
                        <div className="flex justify-center gap-1 mb-2">
                            {[...Array(rating)].map((_, i) => (
                                <Star key={i} size={16} className="fill-softBlack text-softBlack" />
                            ))}
                        </div>
                        <p className="text-sm text-neutral-500 max-w-sm mx-auto italic">"{comment}"</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};