import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, CreditCard, Lock, ChevronLeft, Check, ChevronRight, CheckCircle, Ticket } from 'lucide-react';
import { useStore } from '../store';
import { translations } from '../translations';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressSchema, paymentSchema, AddressFormData, PaymentFormData } from '../validation/schemas';

type CheckoutStep = 'cart' | 'address' | 'payment' | 'success';

// Address Form Component
const AddressForm = ({
    onCancel,
    onSubmit,
    t
}: {
    onCancel: () => void;
    onSubmit: (data: AddressFormData) => void;
    t: any;
}) => {
    const { register, handleSubmit, formState: { errors } } = useForm<AddressFormData>({
        resolver: zodResolver(addressSchema)
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="group">
                <label htmlFor="addr-title" className="text-[10px] font-bold tracking-widest uppercase text-softBlack/40 mb-1 block">{t.cart.address.labels.title}</label>
                <input {...register('title')} id="addr-title" placeholder={t.cart.address.placeholders.title} className="w-full pb-2 bg-transparent border-b border-softBlack/20 focus:border-softBlack outline-none font-serif text-lg transition-colors rounded-none" />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div className="group">
                <label htmlFor="addr-line1" className="text-[10px] font-bold tracking-widest uppercase text-softBlack/40 mb-1 block">{t.cart.address.labels.line1}</label>
                <input {...register('line1')} id="addr-line1" placeholder={t.cart.address.placeholders.line1} className="w-full pb-2 bg-transparent border-b border-softBlack/20 focus:border-softBlack outline-none font-serif text-lg transition-colors rounded-none" />
                {errors.line1 && <p className="text-red-500 text-xs mt-1">{errors.line1.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="group">
                    <label htmlFor="addr-city" className="text-[10px] font-bold tracking-widest uppercase text-softBlack/40 mb-1 block">{t.cart.address.labels.city}</label>
                    <input {...register('city')} id="addr-city" placeholder={t.cart.address.placeholders.city} className="w-full pb-2 bg-transparent border-b border-softBlack/20 focus:border-softBlack outline-none font-serif text-lg transition-colors rounded-none" />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                </div>
                <div className="group">
                    <label htmlFor="addr-zip" className="text-[10px] font-bold tracking-widest uppercase text-softBlack/40 mb-1 block">{t.cart.address.labels.zip}</label>
                    <input {...register('zip')} id="addr-zip" placeholder={t.cart.address.placeholders.zip} className="w-full pb-2 bg-transparent border-b border-softBlack/20 focus:border-softBlack outline-none font-serif text-lg transition-colors rounded-none" />
                    {errors.zip && <p className="text-red-500 text-xs mt-1">{errors.zip.message}</p>}
                </div>
            </div>
            <div className="group">
                <label htmlFor="addr-country" className="text-[10px] font-bold tracking-widest uppercase text-softBlack/40 mb-1 block">{t.cart.address.labels.country}</label>
                <input {...register('country')} id="addr-country" placeholder={t.cart.address.placeholders.country} className="w-full pb-2 bg-transparent border-b border-softBlack/20 focus:border-softBlack outline-none font-serif text-lg transition-colors rounded-none" />
                {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
            </div>

            <div className="flex gap-4">
                <button type="button" onClick={onCancel} className="flex-1 py-4 border border-neutral-200 text-neutral-500 text-xs font-bold tracking-widest uppercase hover:bg-neutral-50 transition-colors">
                    {t.common.cancel}
                </button>
                <button type="submit" className="flex-1 bg-softBlack text-white py-4 text-xs font-bold tracking-widest uppercase hover:bg-neutral-800 transition-colors">
                    {t.cart.address.form.save}
                </button>
            </div>
        </form>
    );
};

// Payment Form Component (Iyzico Integration)
import { api } from '../services/api';

const PaymentForm = ({
    t,
    subtotal,
    total,
    discountAmount,
    couponCode,
    discountPercentage,
    onApplyCoupon,
    onRemoveCoupon,
    couponMessage,
    selectedAddress,
    user,
    cart
}: {
    t: any;
    subtotal: number;
    total: number;
    discountAmount: number;
    couponCode: string | null;
    discountPercentage: number;
    onApplyCoupon: (code: string) => void;
    onRemoveCoupon: () => void;
    couponMessage: { type: 'success' | 'error', text: string } | null;
    selectedAddress: any;
    user: any;
    cart: any[];
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [couponInput, setCouponInput] = useState('');
    const [iframeContent, setIframeContent] = useState<string | null>(null);

    const initializePayment = async () => {
        setLoading(true);
        setError(null);
        try {
            const basketItems = cart.map(item => ({
                id: item.productId,
                name: item.product.name,
                category1: 'Candle', // Default category
                itemType: 'PHYSICAL', // Iyzipay.BASKET_ITEM_TYPE.PHYSICAL (mapped in backend or here)
                price: item.product.price.toString()
            }));

            const buyer = {
                id: user.id || 'guest',
                name: user.name || 'Guest',
                surname: 'User',
                gsmNumber: user.phone || '+905555555555',
                email: user.email || 'guest@example.com',
                identityNumber: '11111111111', // Dummy for testing if not collected
                lastLoginDate: '2023-01-01 12:00:00',
                registrationDate: '2023-01-01 12:00:00',
                registrationAddress: selectedAddress.line1,
                ip: '85.34.78.112', // Should be collected from backend req
                city: selectedAddress.city,
                country: selectedAddress.country,
                zipCode: selectedAddress.zip
            };

            const addressData = {
                contactName: user.name || 'Guest User',
                city: selectedAddress.city,
                country: selectedAddress.country,
                address: selectedAddress.line1,
                zipCode: selectedAddress.zip
            };

            const response = await api.payment.initialize({
                price: subtotal.toString(),
                paidPrice: total.toString(),
                basketItems: basketItems,
                buyer: buyer,
                shippingAddress: addressData,
                billingAddress: addressData,
                conversationId: `order_${Date.now()}`
            });

            if (response.data?.checkoutFormContent) {
                setIframeContent(response.data.checkoutFormContent);
                // Execute scripts in the content
                setTimeout(() => {
                    const scripts = document.getElementById('iyzico-checkout-container')?.getElementsByTagName('script');
                    if (scripts) {
                        Array.from(scripts).forEach(script => {
                            const newScript = document.createElement('script');
                            Array.from(script.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                            newScript.appendChild(document.createTextNode(script.innerHTML));
                            script.parentNode?.replaceChild(newScript, script);
                        });
                    }
                }, 500);
            } else if (response.status === 'failure') {
                setError(response.errorMessage || 'Payment initialization failed');
            }

        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleCouponSubmit = (e: React.MouseEvent) => {
        e.preventDefault();
        onApplyCoupon(couponInput);
    };

    return (
        <div className="space-y-6">

            {/* Coupon Section */}
            <div className="pt-4 border-b border-softBlack/5 pb-4">
                {!couponCode ? (
                    <div className="space-y-2">
                        <div className="flex gap-2 items-end">
                            <div className="flex-1 group">
                                <label htmlFor="cart-coupon" className="text-[10px] font-bold tracking-widest uppercase text-softBlack/40 mb-1 flex items-center gap-1">
                                    <Ticket size={10} /> {t.cart.coupon.label}
                                </label>
                                <input
                                    id="cart-coupon"
                                    type="text"
                                    value={couponInput}
                                    onChange={(e) => setCouponInput(e.target.value)}
                                    placeholder={t.cart.coupon.placeholder}
                                    className="w-full pb-2 bg-transparent border-b border-softBlack/20 focus:border-softBlack outline-none font-serif text-sm transition-colors rounded-none uppercase placeholder:text-neutral-300"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleCouponSubmit}
                                disabled={!couponInput}
                                className="pb-2 px-2 text-[10px] font-bold tracking-widest uppercase border-b border-transparent hover:border-softBlack text-softBlack/60 hover:text-softBlack transition-all disabled:opacity-30 disabled:hover:border-transparent disabled:cursor-not-allowed"
                            >
                                {t.cart.coupon.apply}
                            </button>
                        </div>
                        {couponMessage && (
                            <span className={`text-[10px] block ${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                                {couponMessage.text}
                            </span>
                        )}
                    </div>
                ) : (
                    <div className="bg-neutral-50 p-3 flex justify-between items-center border border-neutral-100">
                        <div className="flex items-center gap-2">
                            <Ticket size={14} className="text-softBlack" />
                            <span className="font-serif italic text-softBlack">{couponCode}</span>
                            <span className="text-[10px] bg-softBlack text-white px-1.5 py-0.5 rounded-sm">-{discountPercentage}%</span>
                        </div>
                        <button
                            type="button"
                            onClick={onRemoveCoupon}
                            className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 hover:text-red-500 transition-colors"
                        >
                            {t.cart.coupon.remove}
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-softBlack/60">{t.cart.subtotal}</span>
                    <span className="font-medium">${subtotal}</span>
                </div>
                {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-sm text-green-700">
                        <span className="flex items-center gap-1">{t.cart.coupon.discount} <span className="text-[10px] opacity-70">({couponCode})</span></span>
                        <span className="font-medium">-${discountAmount.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between items-center text-xl font-serif pt-4 border-t border-softBlack/10">
                    <span>{t.orderDetail.total}</span>
                    <span>${total.toFixed(2)}</span>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-500 p-3 text-xs rounded-sm">
                    {error}
                </div>
            )}

            {!iframeContent ? (
                <button
                    onClick={initializePayment}
                    disabled={loading}
                    className="w-full bg-softBlack text-offWhite py-4 font-medium tracking-wide hover:bg-gray-800 transition-colors mt-8 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {loading ? <span className="animate-pulse">Loading Iyzico Checkour...</span> : <span>Proceed to Secure Payment</span>}
                    <Lock size={16} />
                </button>
            ) : (
                <div id="iyzico-checkout-container" dangerouslySetInnerHTML={{ __html: iframeContent }} />
            )}
        </div>
    );
};


export const CartSidebar: React.FC = () => {
    const { cart, isCartOpen, toggleCart, removeFromCart, addToCart, decreaseQuantity, createOrder, isAuthenticated, language, user, addAddress, applyCoupon, removeCoupon, couponCode, discountPercentage } = useStore();
    const [step, setStep] = useState<CheckoutStep>('cart');
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [isAddingAddress, setIsAddingAddress] = useState(false);

    // Coupon state local to UI for messaging
    const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const t = translations[language];
    const navigate = useNavigate();
    const location = useLocation();

    // Use discount price if available for subtotal
    const subtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);

    // Calculate discount and total
    const discountAmount = subtotal * (discountPercentage / 100);
    const total = subtotal - discountAmount;

    // Reset state logic removed to persist state on close

    // Pre-select default address
    useEffect(() => {
        if (user && user.addresses?.length > 0 && !selectedAddressId) {
            setSelectedAddressId(user.addresses[0].id);
        }
    }, [user, selectedAddressId]);

    const handleCheckoutInit = () => {
        if (!isAuthenticated) {
            toggleCart(false);
            navigate('/login', { state: { from: location } });
            return;
        }
        setStep('address');
    };

    // Iyzico handles success via callback page
    const handleSuccessClose = () => {
        toggleCart(false);
        navigate('/profile');
        setStep('cart');
    };

    const handleAddressSubmit = (data: AddressFormData) => {
        addAddress(data);
        setIsAddingAddress(false);
    };

    const handleCouponApply = (code: string) => {
        applyCoupon(code).then((success) => {
            if (success) {
                setCouponMessage({ type: 'success', text: `${t.cart.coupon.applied} (-${discountPercentage}%)` });
            } else {
                setCouponMessage({ type: 'error', text: t.cart.coupon.invalid });
            }
        });
    };

    const handleRemoveCoupon = () => {
        removeCoupon();
        setCouponMessage(null);
    };

    const goBack = () => {
        if (isAddingAddress) {
            setIsAddingAddress(false);
        } else if (step === 'payment') {
            setStep('address');
        } else if (step === 'address') {
            setStep('cart');
        }
    };

    const selectedAddress = user?.addresses.find(a => a.id === selectedAddressId);

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => toggleCart(false)}
                        className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-offWhite z-[70] shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 flex items-center justify-between border-b border-softBlack/5 bg-offWhite relative z-20">
                            <div className="flex items-center gap-3">
                                {step !== 'cart' && step !== 'success' && (
                                    <button onClick={goBack} className="p-1 hover:bg-black/5 rounded-full transition-colors">
                                        <ChevronLeft size={20} />
                                    </button>
                                )}
                                <h2 className="font-serif text-2xl">
                                    {step === 'cart' && t.cart.title}
                                    {step === 'address' && t.cart.address.title}
                                    {step === 'payment' && t.cart.steps.payment}
                                    {step === 'success' && t.cart.steps.success}
                                </h2>
                            </div>
                            <button onClick={() => toggleCart(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
                            <AnimatePresence mode="wait">
                                {/* CART STEP */}
                                {step === 'cart' && (
                                    <motion.div
                                        key="cart"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                        className="p-6 space-y-8"
                                    >
                                        {cart.length === 0 ? (
                                            <div className="h-[60vh] flex flex-col items-center justify-center opacity-40">
                                                <span className="font-serif text-xl mb-2">{t.cart.empty}</span>
                                                <p className="font-sans text-sm">{t.cart.discover}</p>
                                            </div>
                                        ) : (
                                            cart.filter(item => item && item.product).map(item => {
                                                const product = item.product;
                                                return (
                                                    <div key={item.productId} className="flex gap-4">
                                                        <div className="w-24 h-32 bg-gray-100 rounded-sm overflow-hidden flex-shrink-0 relative">
                                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                            {product.discountPrice && (
                                                                <div className="absolute top-0 left-0 bg-softBlack text-white text-[9px] font-bold px-1.5 py-0.5">{t.common.sale}</div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 flex flex-col justify-between py-1">
                                                            <div>
                                                                <div className="flex justify-between items-start">
                                                                    <h3 className="font-serif text-lg">{product.name}</h3>
                                                                    <div className="text-right">
                                                                        <span className="font-sans text-sm font-medium block">${item.subtotal}</span>
                                                                        {product.discountPrice && (
                                                                            <span className="text-xs text-softBlack/40 line-through">${product.price * item.quantity}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <p className="text-xs text-softBlack/60 uppercase tracking-wide mt-1">{product.tagline}</p>
                                                            </div>

                                                            <div className="flex items-center gap-4 mt-4">
                                                                <div className="flex items-center border border-softBlack/10 rounded-full px-2 py-1">
                                                                    <button
                                                                        onClick={() => decreaseQuantity(item.productId)}
                                                                        className="p-1 hover:text-gray-600"
                                                                    >
                                                                        <Minus size={14} />
                                                                    </button>
                                                                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                                                                    <button
                                                                        onClick={() => addToCart(product)}
                                                                        className="p-1 hover:text-gray-600"
                                                                    >
                                                                        <Plus size={14} />
                                                                    </button>
                                                                </div>
                                                                <button onClick={() => removeFromCart(item.productId)} className="text-xs underline text-softBlack/50 hover:text-red-500">
                                                                    {t.cart.remove}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </motion.div>
                                )}

                                {/* ADDRESS STEP */}
                                {step === 'address' && (
                                    <motion.div
                                        key="address"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                        className="p-6"
                                    >
                                        {isAddingAddress ? (
                                            <AddressForm
                                                onCancel={() => setIsAddingAddress(false)}
                                                onSubmit={handleAddressSubmit}
                                                t={t}
                                            />
                                        ) : (
                                            <div className="space-y-4">
                                                <p className="text-sm text-softBlack/60 mb-6">{t.cart.address.select}</p>

                                                {user?.addresses.map(addr => (
                                                    <div
                                                        key={addr.id}
                                                        onClick={() => setSelectedAddressId(addr.id)}
                                                        className={`relative p-6 border cursor-pointer transition-all duration-300 group ${selectedAddressId === addr.id ? 'border-softBlack bg-white shadow-lg' : 'border-neutral-200 bg-transparent hover:border-neutral-300'}`}
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className={`text-[10px] font-bold tracking-widest uppercase ${selectedAddressId === addr.id ? 'text-softBlack' : 'text-neutral-400'}`}>
                                                                {addr.title}
                                                            </span>
                                                            {selectedAddressId === addr.id && (
                                                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                                    <Check size={16} className="text-softBlack" />
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                        <p className="font-serif text-lg leading-tight text-softBlack/90">
                                                            {addr.line1}
                                                        </p>
                                                        <p className="text-sm text-softBlack/50 mt-1">
                                                            {addr.city}, {addr.zip}
                                                        </p>
                                                    </div>
                                                ))}

                                                <button
                                                    onClick={() => setIsAddingAddress(true)}
                                                    className="w-full py-4 border border-dashed border-neutral-300 text-neutral-400 hover:text-softBlack hover:border-softBlack transition-colors text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2"
                                                >
                                                    <Plus size={16} />
                                                    {t.cart.address.addNew}
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* PAYMENT STEP */}
                                {step === 'payment' && (
                                    <motion.div
                                        key="payment"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                        className="p-6"
                                    >
                                        <PaymentForm
                                            t={t}
                                            subtotal={subtotal}
                                            total={total}
                                            discountAmount={discountAmount}
                                            couponCode={couponCode}
                                            discountPercentage={discountPercentage}
                                            onApplyCoupon={handleCouponApply}
                                            onRemoveCoupon={handleRemoveCoupon}
                                            couponMessage={couponMessage}
                                            selectedAddress={selectedAddress}
                                            user={user}
                                            cart={cart}
                                        />
                                    </motion.div>
                                )}

                                {/* SUCCESS POPUP STEP */}
                                {step === 'success' && (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.4 }}
                                        className="p-6 h-[70vh] flex flex-col items-center justify-center text-center space-y-6"
                                    >
                                        <motion.div
                                            initial={{ scale: 0, rotate: -90 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                                            className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-4"
                                        >
                                            <CheckCircle size={40} />
                                        </motion.div>

                                        <div>
                                            <h3 className="font-serif text-3xl mb-4">{t.cart.steps.success}</h3>
                                            <p className="text-softBlack/70 leading-relaxed font-sans text-sm max-w-xs mx-auto">
                                                {t.cart.success}
                                            </p>
                                        </div>

                                        <button
                                            onClick={handleSuccessClose}
                                            className="mt-8 px-8 py-3 bg-softBlack text-offWhite text-xs font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors"
                                        >
                                            {t.cart.viewOrder}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Bottom Action Bar */}
                        {step !== 'payment' && step !== 'success' && !isAddingAddress && cart.length > 0 && (
                            <div className="p-6 border-t border-softBlack/5 bg-offWhite z-10">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="font-serif text-lg">{t.cart.subtotal}</span>
                                    <span className="font-sans text-xl font-medium">${subtotal}</span>
                                </div>

                                {step === 'cart' ? (
                                    <button
                                        onClick={handleCheckoutInit}
                                        className="w-full bg-softBlack text-offWhite py-4 font-medium tracking-wide hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span>{isAuthenticated ? t.cart.checkout : t.cart.loginRequired}</span>
                                        <CreditCard size={16} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setStep('payment')}
                                        disabled={!selectedAddressId}
                                        className="w-full bg-softBlack text-offWhite py-4 font-medium tracking-wide hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span>{t.cart.address.continueToPayment}</span>
                                        <ChevronRight size={16} />
                                    </button>
                                )}
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
