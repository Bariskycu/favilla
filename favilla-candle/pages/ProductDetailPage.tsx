import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useStore, Language } from '../store';
import { translations } from '../translations';
import { ChevronLeft, User, Check, X, HelpCircle, Lock, Heart } from 'lucide-react';
import { StarRating } from '../components/StarRating';
import { Product, ProductQuestion, Review } from '../types';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { addToCart, toggleCart, language, orders, isAuthenticated, toggleWishlist, isInWishlist, addToast, submitReview, user } = useStore();
    const [activeTab, setActiveTab] = useState<'specs' | 'care' | 'reviews' | 'qa'>('specs');

    // Ref for scrolling to reviews section
    const reviewsRef = useRef<HTMLDivElement>(null);

    const t = translations[language];

    // Local state for product
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            setLoading(true);
            try {
                // Using getBySlug because new API design suggests slugs in URL
                // If id is UUID, backend should handle it or we might need getById fallback/check
                // For now, assuming standard public endpoint GET /api/v1/products/:slug covers it
                const data = await api.products.getBySlug(id);
                setProduct(data);
            } catch (error) {
                console.error('Product fetch failed', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    // Reviews State
    const [reviews, setReviews] = useState<Review[]>([]);

    // Fetch reviews based on product ID
    useEffect(() => {
        if (product) {
            api.reviews.getAll(product.id)
                .then(res => setReviews(res.data))
                .catch(err => console.error('Reviews fetch failed', err));
        }
    }, [product]);

    // Check Eligibility to Review (Server-side)
    const [isEligibleToReview, setIsEligibleToReview] = useState(false);

    useEffect(() => {
        if (isAuthenticated && product) {
            api.reviews.checkEligibility(product.id)
                .then(eligible => setIsEligibleToReview(eligible))
                .catch(err => {
                    console.error('Eligibility check failed', err);
                    setIsEligibleToReview(false);
                });
        }
    }, [product, isAuthenticated]);

    if (loading) return <div className="pt-32 text-center flex items-center justify-center min-h-[50vh]"><div className="animate-pulse w-8 h-8 bg-softBlack/20 rounded-full"></div></div>;

    if (!product) return <div className="pt-32 text-center">{t.common.notFound}</div>;

    const hasDiscount = !!product.discountPrice;
    const currentPrice = product.discountPrice || product.price;
    const isWishlisted = isInWishlist(product.id);

    const handleWishlistToggle = () => {
        if (!isAuthenticated) {
            addToast(t.wishlist.loginRequired, 'info');
            navigate('/login', { state: { from: location } });
            return;
        }
        toggleWishlist(product.id);
    };

    return (
        <div className="min-h-screen pt-24 md:pt-32 pb-32">
            <SEO
                title={product.name}
                description={product.description}
            />

            {/* Custom Scrollbar Styles for this page */}
            <style>{`
            .scrollbar-elegant {
                scrollbar-width: thin;
                scrollbar-color: rgba(26, 26, 26, 0.1) transparent;
            }
            .scrollbar-elegant::-webkit-scrollbar {
                height: 1px;
            }
            .scrollbar-elegant::-webkit-scrollbar-track {
                background: transparent;
            }
            .scrollbar-elegant::-webkit-scrollbar-thumb {
                background-color: rgba(26, 26, 26, 0.1);
                border-radius: 999px;
                transition: background-color 0.3s ease;
            }
            .scrollbar-elegant:hover::-webkit-scrollbar-thumb {
                background-color: rgba(26, 26, 26, 0.3);
            }
        `}</style>

            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col gap-4 mb-8">
                    <Breadcrumbs items={[
                        { label: t.nav.collection, path: '/shop' },
                        { label: product.name }
                    ]} />

                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-softBlack/50 hover:text-softBlack transition-colors group w-fit"
                        aria-label="Go back"
                    >
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        {t.product.back}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

                    {/* Gallery Section */}
                    <div className="space-y-4 lg:sticky lg:top-32 h-fit">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="aspect-[4/5] w-full bg-gray-100 rounded-sm overflow-hidden relative"
                        >
                            {hasDiscount && (
                                <div className="absolute top-6 right-6 z-10 bg-softBlack text-white w-16 h-16 rounded-full flex items-center justify-center flex-col">
                                    <span className="font-serif italic text-lg leading-none">-{Math.round(((product.price - currentPrice) / product.price) * 100)}%</span>
                                </div>
                            )}
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="eager" />
                        </motion.div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="aspect-square bg-gray-100 rounded-sm overflow-hidden">
                                <img src={product.hoverImage} alt={`${product.name} detail`} className="w-full h-full object-cover" loading="lazy" />
                            </div>
                            <div className="aspect-square bg-gray-100 rounded-sm overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1595180633649-7c87c2c9d2bf?q=80&w=800&auto=format&fit=crop" alt="Texture detail" className="w-full h-full object-cover" loading="lazy" />
                            </div>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="flex flex-col justify-center">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="flex flex-col gap-2 mb-2">
                                <span className="text-xs md:text-sm font-bold tracking-widest uppercase text-softBlack/40 block">{product.tagline}</span>
                                <div className="flex items-center gap-3">
                                    <StarRating rating={product.rating} size={16} />
                                    <button
                                        onClick={() => {
                                            setActiveTab('reviews');
                                            reviewsRef.current?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className="text-xs font-medium text-softBlack/60 hover:text-softBlack underline decoration-softBlack/20 underline-offset-4 transition-colors"
                                    >
                                        {product.rating} ({product.reviewCount} {t.reviews.reviewCountLabel})
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-start justify-between gap-4 mb-4 md:mb-6">
                                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl">{product.name}</h1>
                                {/* Desktop Wishlist Button */}
                                <button
                                    onClick={handleWishlistToggle}
                                    className="hidden md:flex p-3 rounded-full border border-gray-200 hover:border-softBlack hover:bg-neutral-50 transition-all"
                                    title={isWishlisted ? t.product.wishlistRemove : t.product.wishlistAdd}
                                    aria-label={isWishlisted ? t.product.wishlistRemove : t.product.wishlistAdd}
                                >
                                    <Heart size={24} className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-softBlack'} />
                                </button>
                            </div>

                            <div className="flex items-baseline gap-4 mb-6 md:mb-8">
                                {hasDiscount ? (
                                    <>
                                        <p className="text-xl md:text-2xl font-sans text-red-900 font-medium">${currentPrice}</p>
                                        <p className="text-lg font-sans text-softBlack/40 line-through decoration-1">${product.price}</p>
                                    </>
                                ) : (
                                    <p className="text-xl md:text-2xl font-sans">${product.price}</p>
                                )}
                            </div>

                            <p className="text-softBlack/70 leading-relaxed mb-10 md:mb-12 max-w-md">
                                {product.description}
                            </p>

                            {/* Interactive Selector Mock */}
                            <div className="mb-12">
                                <label className="text-xs font-bold tracking-widest uppercase mb-4 block opacity-60">{t.product.configuration}</label>
                                <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-elegant">
                                    <button className={`flex-shrink-0 px-6 py-3 border transition-all ${product.type === 'jar' ? 'border-softBlack bg-softBlack text-offWhite' : 'border-gray-300 text-gray-400 cursor-not-allowed'}`}>
                                        {t.shop.types.jar}
                                    </button>
                                    <button className={`flex-shrink-0 px-6 py-3 border transition-all ${product.type === 'sculptural' ? 'border-softBlack bg-softBlack text-offWhite' : 'border-gray-300 text-gray-400 cursor-not-allowed'}`}>
                                        {t.shop.types.sculptural}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">{t.product.viewingConfig(product.type)}</p>
                            </div>

                            {/* Accordion Tabs */}
                            <div ref={reviewsRef} className="border-t border-softBlack/10 scroll-mt-32">
                                <div className="flex gap-8 mb-6 mt-6 overflow-x-auto pb-4 scrollbar-elegant">
                                    <button
                                        onClick={() => setActiveTab('specs')}
                                        className={`text-sm tracking-widest uppercase pb-2 transition-colors whitespace-nowrap ${activeTab === 'specs' ? 'border-b border-softBlack text-softBlack' : 'text-gray-400 hover:text-softBlack/60'}`}
                                    >
                                        {t.product.specifications}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('care')}
                                        className={`text-sm tracking-widest uppercase pb-2 transition-colors whitespace-nowrap ${activeTab === 'care' ? 'border-b border-softBlack text-softBlack' : 'text-gray-400 hover:text-softBlack/60'}`}
                                    >
                                        {t.product.careGuide}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('reviews')}
                                        className={`text-sm tracking-widest uppercase pb-2 transition-colors whitespace-nowrap ${activeTab === 'reviews' ? 'border-b border-softBlack text-softBlack' : 'text-gray-400 hover:text-softBlack/60'}`}
                                    >
                                        {t.reviews.tab} ({product.reviewCount})
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('qa')}
                                        className={`text-sm tracking-widest uppercase pb-2 transition-colors whitespace-nowrap ${activeTab === 'qa' ? 'border-b border-softBlack text-softBlack' : 'text-gray-400 hover:text-softBlack/60'}`}
                                    >
                                        {t.product.qa.tab}
                                    </button>
                                </div>

                                <div className="min-h-[160px]">
                                    <AnimatePresence mode="wait">
                                        {activeTab === 'specs' && (
                                            <motion.ul
                                                key="specs"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="space-y-3 text-sm text-softBlack/70"
                                            >
                                                {product.burnTime && (
                                                    <li className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                                        <span>{t.product.lightSource}</span>
                                                        <span>{product.burnTime}</span>
                                                    </li>
                                                )}
                                                {product.scentProfile && (
                                                    <li className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                                        <span>{t.product.scentProfile}</span>
                                                        <span>{product.scentProfile}</span>
                                                    </li>
                                                )}
                                                <li className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                                    <span>{t.product.material}</span>
                                                    <span className="capitalize">{product.material}</span>
                                                </li>
                                            </motion.ul>
                                        )}

                                        {activeTab === 'care' && (
                                            <motion.p
                                                key="care"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="text-sm text-softBlack/70 leading-relaxed"
                                            >
                                                {t.product.careText}
                                            </motion.p>
                                        )}

                                        {activeTab === 'reviews' && (
                                            <ReviewsContent
                                                reviews={reviews}
                                                setReviews={setReviews}
                                                productRating={product.rating}
                                                reviewCount={product.reviewCount}
                                                language={language}
                                                isAuthenticated={isAuthenticated}
                                                isEligibleToReview={isEligibleToReview}
                                                productId={product.id}
                                                submitReview={submitReview}
                                                currentUser={user}
                                            />
                                        )}

                                        {activeTab === 'qa' && (
                                            <QuestionAnswerContent product={product} language={language} />
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Sticky Mobile/Desktop Footer Action */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 md:p-6 z-50 shadow-2xl md:shadow-none pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
                    <div className="hidden md:block">
                        <h4 className="font-serif text-lg">{product.name}</h4>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{product.tagline}</span>
                            <span className="text-gray-300">|</span>
                            <StarRating rating={product.rating} size={12} />
                        </div>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        {/* Sticky Footer Wishlist Button */}
                        <button
                            onClick={handleWishlistToggle}
                            className="w-14 md:w-auto px-0 md:px-4 flex items-center justify-center border border-gray-300 rounded-sm hover:border-softBlack hover:text-softBlack transition-colors"
                            title={isWishlisted ? t.product.wishlistRemove : t.product.wishlistAdd}
                            aria-label={isWishlisted ? t.product.wishlistRemove : t.product.wishlistAdd}
                        >
                            <Heart size={20} className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-softBlack'} />
                        </button>

                        <button
                            onClick={() => {
                                if (product.stock > 0) {
                                    addToCart(product);
                                    toggleCart(true);
                                }
                            }}
                            disabled={product.stock === 0}
                            className={`flex-1 md:w-64 py-4 px-8 rounded-sm transition-colors flex items-center justify-center gap-2 font-medium tracking-wide ${product.stock > 0 ? 'bg-softBlack text-offWhite hover:bg-gray-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                        >
                            <span>{product.stock > 0 ? t.product.addToCart : 'Out of Stock'}</span>
                            {product.stock > 0 && (
                                <>
                                    <span className="opacity-50">—</span>
                                    <div className="flex gap-2">
                                        {hasDiscount && <span className="line-through opacity-50">${product.price}</span>}
                                        <span>${currentPrice}</span>
                                    </div>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const QuestionAnswerContent = ({ product, language }: { product: Product, language: Language }) => {
    const { isAuthenticated, submitProductQuestion } = useStore();
    const [isAskModalOpen, setIsAskModalOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [questions, setQuestions] = useState<ProductQuestion[]>([]);
    const t = translations[language];
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        api.questions.getByProduct(product.id)
            .then(res => setQuestions(res.data || []))
            .catch(() => { });
    }, [product.id]);

    const handleAskClick = () => {
        if (!isAuthenticated) {
            setIsLoginModalOpen(true);
        } else {
            setIsAskModalOpen(true);
        }
    };

    return (
        <>
            <motion.div
                key="qa"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
            >
                <div className="bg-neutral-50 p-6 border border-neutral-100 flex flex-col items-center text-center space-y-4 rounded-sm">
                    <HelpCircle size={32} className="text-softBlack/40" />
                    <div>
                        <h3 className="font-serif text-xl mb-1">{t.product.qa.title}</h3>
                        <p className="text-sm text-softBlack/60">{t.product.qa.subtitle}</p>
                    </div>
                    <button
                        onClick={handleAskClick}
                        className="px-8 py-3 bg-softBlack text-offWhite text-xs font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors"
                    >
                        {t.product.qa.title}
                    </button>
                </div>

                <div className="space-y-6 pt-6">
                    {questions.length === 0 ? (
                        <p className="text-center text-sm text-neutral-400 italic">{t.profile.help.noQuestions}</p>
                    ) : (
                        questions.map(q => (
                            <div key={q.id} className="border-b border-neutral-100 pb-6 last:border-0">
                                <div className="flex justify-between items-start mb-3">
                                    <p className="font-serif text-base text-softBlack flex-1 pr-4">{q.question}</p>
                                    <span className="text-[10px] text-neutral-400 uppercase tracking-widest whitespace-nowrap">
                                        {new Date(q.answeredAt || q.createdAt || Date.now()).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}
                                    </span>
                                </div>
                                {q.answer ? (
                                    <div className="bg-neutral-50 p-4 border-l-2 border-softBlack text-sm text-neutral-600 leading-relaxed relative">
                                        <span className="text-[10px] font-bold tracking-widest uppercase text-softBlack/40 absolute top-2 right-2">Favilla</span>
                                        {q.answer}
                                    </div>
                                ) : (
                                    <p className="text-xs text-neutral-400 italic px-2 border-l-2 border-neutral-200">{t.product.qa.pendingResponse}</p>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </motion.div>

            {/* Login Prompt Modal */}
            <AnimatePresence>
                {isLoginModalOpen && (
                    <div className="fixed inset-0 bg-neutral-900/40 z-[80] backdrop-blur-sm flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white p-8 w-full max-w-sm relative text-center shadow-2xl rounded-sm"
                        >
                            <button
                                onClick={() => setIsLoginModalOpen(false)}
                                className="absolute top-4 right-4 text-neutral-300 hover:text-softBlack"
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>
                            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-500">
                                <Lock size={24} />
                            </div>
                            <h3 className="font-serif text-2xl mb-2">{t.product.qa.loginRequired}</h3>
                            <p className="text-sm text-neutral-500 mb-8">{t.product.qa.loginMsg}</p>
                            <button
                                onClick={() => navigate('/login', { state: { from: location } })}
                                className="block w-full py-4 bg-softBlack text-white text-xs font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors"
                            >
                                {t.product.qa.loginBtn}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Ask Question Form Modal */}
            <AnimatePresence>
                {isAskModalOpen && (
                    <div className="fixed inset-0 bg-neutral-900/40 z-[80] backdrop-blur-sm flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white p-8 w-full max-w-lg relative shadow-2xl rounded-sm"
                        >
                            <button
                                onClick={() => setIsAskModalOpen(false)}
                                className="absolute top-4 right-4 text-neutral-300 hover:text-softBlack"
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>

                            <h3 className="font-serif text-2xl mb-1">{t.product.qa.title}</h3>
                            <p className="text-xs text-neutral-400 font-bold tracking-widest uppercase mb-6">{product.name}</p>

                            <QuestionForm
                                onSubmit={(q) => {
                                    submitProductQuestion(product, q);
                                    setIsAskModalOpen(false);
                                    setIsSuccessModalOpen(true);
                                }}
                                t={t}
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Success Modal */}
            <AnimatePresence>
                {isSuccessModalOpen && (
                    <div className="fixed inset-0 bg-neutral-900/40 z-[80] backdrop-blur-sm flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white p-8 w-full max-w-md relative text-center shadow-2xl rounded-sm"
                        >
                            <button
                                onClick={() => setIsSuccessModalOpen(false)}
                                className="absolute top-4 right-4 text-neutral-300 hover:text-softBlack"
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                                <Check size={32} />
                            </div>
                            <h3 className="font-serif text-2xl mb-4">{t.product.qa.success}</h3>
                            <p className="text-sm text-neutral-500 mb-8 leading-relaxed">{t.product.qa.successMsg}</p>
                            <button
                                onClick={() => navigate('/profile')}
                                className="block w-full py-4 bg-softBlack text-white text-xs font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors"
                            >
                                {t.product.qa.goToProfile}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

const QuestionForm = ({ onSubmit, t }: { onSubmit: (q: string) => void, t: any }) => {
    const [question, setQuestion] = useState('');

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(question); }} className="space-y-6">
            <textarea
                autoFocus
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
                placeholder={t.product.qa.placeholder}
                className="w-full p-4 bg-neutral-50 border border-neutral-200 focus:border-softBlack outline-none font-serif text-sm min-h-[120px] resize-none rounded-sm transition-colors"
            />
            <button
                type="submit"
                disabled={!question.trim()}
                className="w-full py-4 bg-softBlack text-white text-xs font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
                {t.product.qa.submit}
            </button>
        </form>
    );
};

// Sub-component for Reviews
const ReviewsContent = ({
    reviews,
    setReviews,
    productRating,
    reviewCount,
    language,
    isAuthenticated,
    isEligibleToReview,
    productId,
    submitReview,
    currentUser
}: {
    reviews: Review[],
    setReviews: React.Dispatch<React.SetStateAction<Review[]>>,
    productRating: number,
    reviewCount: number,
    language: Language,
    isAuthenticated: boolean,
    isEligibleToReview: boolean,
    productId: string,
    submitReview: (productId: string, rating: number, comment: string) => Promise<Review>,
    currentUser: any // Passing user object
}) => {
    const [isWriting, setIsWriting] = useState(false);
    const [newRating, setNewRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const t = translations[language];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const newReview = await submitReview(productId, newRating, comment);

            // If the backend returns the review, use it. Otherwise, construct a robust optimistic one.
            if (newReview) {
                setReviews([newReview, ...reviews]);
            } else {
                // Fallback optimistic update
                const tempReview: Review = {
                    id: Math.random().toString(),
                    userId: currentUser?.id || 'current-user',
                    userName: currentUser?.name || t.reviews.you,
                    rating: newRating,
                    comment: comment,
                    createdAt: new Date().toISOString(),
                    verifiedPurchase: true
                };
                setReviews([tempReview, ...reviews]);
            }

            setSubmitted(true);
            setIsWriting(false);
        } catch (error) {
            console.error('Review submit failed', error);
            // Optionally handle 403 or other errors specifically here if needed
        }
    };

    return (
        <motion.div
            key="reviews"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
        >
            {/* Rating Summary */}
            <div className="flex items-center gap-6 bg-neutral-50 p-6 rounded-sm border border-neutral-100">
                <div className="text-center">
                    <span className="block text-4xl font-serif text-softBlack leading-none mb-1">{productRating}</span>
                    <span className="text-[10px] uppercase tracking-widest text-neutral-400">{reviewCount} {t.reviews.reviewCountLabel}</span>
                </div>
                <div className="h-10 w-px bg-neutral-200"></div>
                <div className="flex-1">
                    <StarRating rating={productRating} size={20} />
                    <p className="text-xs text-neutral-500 mt-2">{t.reviews.recommendation}</p>
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex justify-between items-center border-b border-softBlack/5 pb-4 min-h-[40px]">
                <span className="text-xs font-bold tracking-widest uppercase text-softBlack/60">{t.reviews.latest}</span>
                {!submitted && !isWriting && (
                    <>
                        {isAuthenticated ? (
                            isEligibleToReview ? (
                                <button
                                    onClick={() => setIsWriting(true)}
                                    className="text-xs font-bold tracking-widest uppercase border-b border-softBlack text-softBlack pb-0.5 hover:opacity-60 transition-opacity"
                                >
                                    {t.reviews.write}
                                </button>
                            ) : (
                                <span className="text-xs font-bold tracking-widest uppercase text-neutral-400">
                                    {t.reviews.purchaseToReview}
                                </span>
                            )
                        ) : (
                            <button
                                onClick={() => navigate('/login', { state: { from: location } })}
                                className="text-xs font-bold tracking-widest uppercase border-b border-softBlack text-softBlack pb-0.5 hover:opacity-60 transition-opacity"
                            >
                                {t.reviews.loginToReview}
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Write Review Form */}
            <AnimatePresence>
                {isWriting && (
                    <motion.form
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        onSubmit={handleSubmit}
                        className="bg-white border border-neutral-200 p-6 space-y-4 overflow-hidden"
                    >
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold tracking-widest uppercase text-neutral-400">{t.reviews.rating}</label>
                            <StarRating rating={newRating} interactive onRate={setNewRating} size={24} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold tracking-widest uppercase text-neutral-400">{t.reviews.comment}</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                required
                                placeholder={t.reviews.placeholder}
                                className="w-full p-3 bg-neutral-50 border border-neutral-200 focus:border-softBlack outline-none font-serif text-sm min-h-[100px] resize-none"
                            />
                        </div>
                        <div className="flex gap-4 pt-2">
                            <button
                                type="submit"
                                disabled={newRating === 0 || !comment}
                                className="px-6 py-3 bg-softBlack text-white text-xs font-bold tracking-widest uppercase hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                            >
                                {t.reviews.submit}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsWriting(false)}
                                className="px-6 py-3 border border-neutral-200 text-xs font-bold tracking-widest uppercase hover:bg-neutral-50 transition-colors"
                            >
                                {t.reviews.cancel}
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Review List */}
            <div className="space-y-6">
                {reviews.length === 0 ? (
                    <p className="text-sm text-neutral-400 italic py-4">{t.reviews.noReviews}</p>
                ) : (
                    reviews.map((review, idx) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="border-b border-neutral-100 pb-6 last:border-0"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                                        <User size={14} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-softBlack">{review.userName}</h4>
                                        <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
                                            {new Date(review.createdAt).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}
                                        </span>
                                    </div>
                                </div>
                                <StarRating rating={review.rating} size={12} />
                            </div>
                            <p className="text-sm text-softBlack/70 leading-relaxed pl-11">
                                {review.comment}
                            </p>
                        </motion.div>
                    ))
                )}
            </div>
        </motion.div>
    );
};