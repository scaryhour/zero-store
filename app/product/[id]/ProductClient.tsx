'use client';
import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, ChevronLeft, ShieldCheck, Globe, Heart, Star, MessageSquare, Send, CheckCircle2, RefreshCcw, Zap } from 'lucide-react';
import RecentlyViewed from '../../components/RecentlyViewed';
import { useWishlist } from '../../context/WishlistContext';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '@/lib/supabase';

interface Product {
    id: number;
    name: string;
    price: string;
    image: string;
    description: string;
    has_sizes: boolean;
    sizes: string[];
    images?: string[];
    stock_levels?: Record<string, number>;
    video_url?: string;
}

export default function ProductClient({ initialProduct, initialReviews }: { initialProduct: Product, initialReviews: any[] }) {
    const { addToCart, currency, exchangeRate } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { t, language } = useLanguage();
    const [product] = useState<Product>(initialProduct);
    const [reviews, setReviews] = useState<any[]>(initialReviews);
    const [loading] = useState(false);
    const [added, setAdded] = useState(false);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [activeMedia, setActiveMedia] = useState<number>(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
    const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewSuccess, setReviewSuccess] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    // Track Recently Viewed
    useEffect(() => {
        if (product) {
            const history = localStorage.getItem('zero_view_history');
            let items = history ? JSON.parse(history) : [];
            items = items.filter((i: any) => i.id !== product.id);
            items.unshift({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image
            });
            localStorage.setItem('zero_view_history', JSON.stringify(items.slice(0, 8)));
        }

        const checkAdmin = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', session.user.id).single();
                if (profile?.is_admin) setIsAdmin(true);
            }
        };
        checkAdmin();
    }, [product]);

    const handleAddToCart = () => {
        if (product) {
            const sizeKey = selectedSize || 'OS';
            const availableStock = product.stock_levels?.[sizeKey] ?? 99;
            if (availableStock <= 0) {
                alert("ITEM OUT OF STOCK");
                return;
            }
            const productToAdd = { ...product, selectedSize: selectedSize || undefined };
            addToCart(productToAdd);
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product || submittingReview) return;
        setSubmittingReview(true);
        try {
            const res = await fetch('/api/admin/save-review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: product.id,
                    customer_name: reviewForm.name,
                    rating: reviewForm.rating,
                    comment: reviewForm.comment
                })
            });
            const result = await res.json();
            if (result.success) {
                setReviews([result.data, ...reviews]);
                setReviewForm({ name: '', rating: 5, comment: '' });
                setReviewSuccess(true);
                setTimeout(() => setReviewSuccess(false), 3000);
            }
        } catch (err) {
            console.error("Submit review failed", err);
        } finally {
            setSubmittingReview(false);
        }
    };

    return (
        <main className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white pb-20">
            <Navbar />

            <div className="pt-32 px-6 md:px-12 max-w-7xl mx-auto">
                <a href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-12 hover:opacity-50 transition-opacity">
                    <ChevronLeft size={12} strokeWidth={3} /> {t('product.back')}
                </a>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
                    {/* Media Section */}
                    <div className="space-y-4">
                        <div className="bg-[#f9f9f9] overflow-hidden group border border-black/5 aspect-[4/5] relative">
                            <div className="w-full h-full">
                                {product.video_url && activeMedia === (product.images?.length || 1) ? (
                                    <video src={product.video_url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                                ) : (
                                    <img
                                        src={(product.images && product.images.length > 0) ? product.images[activeMedia] : product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                                    />
                                )}
                            </div>
                            {isAdmin && (
                                <div className="absolute top-4 left-4 z-10">
                                    <span className="bg-black text-white text-[8px] font-black px-2 py-1 uppercase tracking-widest">
                                        {language === 'EN' ? 'Batch: 2026.03' : '批次：2026.03'}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4">
                            {(product.images && product.images.length > 0 ? product.images : [product.image]).map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveMedia(i)}
                                    className={`w-16 h-20 shrink-0 border-2 transition-all ${activeMedia === i ? 'border-black' : 'border-black/5 opacity-50 hover:opacity-100'}`}
                                >
                                    <img src={img} className="w-full h-full object-cover" />
                                </button>
                            ))}
                            {product.video_url && (
                                <button
                                    onClick={() => setActiveMedia(product.images && product.images.length > 0 ? product.images.length : 1)}
                                    className={`w-16 h-20 shrink-0 border-2 flex items-center justify-center bg-zinc-100 transition-all ${activeMedia === (product.images && product.images.length > 0 ? product.images.length : 1) ? 'border-black' : 'border-black/5 opacity-50 hover:opacity-100'}`}
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-black border-b-[4px] border-b-transparent ml-1" />
                                        <span className="text-[6px] font-black uppercase mt-1">Video</span>
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col space-y-12">
                        <header className="border-b-4 border-black pb-8">
                            <div className="flex justify-between items-center mb-4">
                                {isAdmin && (
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-black transition-all text-left"
                                    >
                                        Archive NO. {product.id.toString().padStart(4, '0')} [SPEC]
                                    </button>
                                )}
                                <span className="flex items-center gap-2 text-[10px] font-bold uppercase text-emerald-600 ml-auto">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    {t('product.active')}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight mb-4 text-black">{product.name}</h1>
                            <p className="text-3xl font-black tracking-tighter text-black">
                                {currency} {(parseFloat(product.price.toString().replace(/[^0-9.]/g, '')) * (currency === 'USD' ? exchangeRate : 1)).toFixed(2)}
                            </p>
                        </header>

                        <div className="space-y-6">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">{t('product.design_specs')}</h2>
                            <p className="text-sm leading-relaxed font-medium max-w-md">
                                {product.description || "A foundational piece within the ZERO architecture. Engineered for high-frequency use and industrial minimalism."}
                            </p>
                        </div>

                        <div className="space-y-4 pt-8">
                            {product.has_sizes && product.sizes && product.sizes.length > 0 && (
                                <div className="mb-6 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em]">{t('product.select_size')}</h3>
                                        <div className="flex gap-4">
                                            <button onClick={() => setIsSizeGuideOpen(true)} className="text-[9px] font-bold uppercase tracking-widest text-blue-600 hover:underline">[Size Guide]</button>
                                            {selectedSize && <span className="text-[10px] font-bold text-emerald-600">[{selectedSize}] SELECTED</span>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {product.sizes.map((sz) => {
                                            const stock = product.stock_levels?.[sz] ?? 0;
                                            const isOutOfStock = stock <= 0;
                                            return (
                                                <button
                                                    key={sz}
                                                    onClick={() => !isOutOfStock && setSelectedSize(sz)}
                                                    disabled={isOutOfStock}
                                                    className={`group relative py-3 text-xs font-black uppercase transition-all border ${selectedSize === sz ? 'border-black bg-black text-white' : isOutOfStock ? 'border-black/5 text-black/10 cursor-not-allowed bg-zinc-50' : 'border-black/20 text-black/40 hover:border-black hover:text-black hover:bg-black/5'}`}
                                                >
                                                    {sz}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button
                                    onClick={handleAddToCart}
                                    className={`flex-1 py-6 text-[11px] font-black uppercase tracking-[0.5em] transition-all bg-black text-white border-2 border-black hover:bg-white hover:text-black shadow-[0_10px_30px_rgba(0,0,0,0.1)] flex items-center justify-center gap-4`}
                                >
                                    <ShoppingCart size={16} strokeWidth={2.5} />
                                    {added ? t('product.added') : t('product.acquire')}
                                </button>
                                <button
                                    onClick={() => toggleWishlist({ id: product.id, name: product.name, price: product.price, image: product.image })}
                                    className={`px-8 border-2 transition-all duration-300 flex items-center justify-center ${isInWishlist(product.id) ? 'bg-black border-black text-white' : 'bg-white border-black/10 text-black hover:border-black'}`}
                                >
                                    <Heart size={18} className={isInWishlist(product.id) ? 'fill-white' : ''} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-[#f4f4f4] flex flex-col items-center justify-center gap-2">
                                    <Globe size={14} className="opacity-40" />
                                    <p className="text-[8px] font-black uppercase opacity-40">{t('product.logistics')}</p>
                                </div>
                                <div className="p-4 bg-[#f4f4f4] flex flex-col items-center justify-center gap-2">
                                    <ShieldCheck size={14} className="opacity-40" />
                                    <p className="text-[8px] font-black uppercase opacity-40">{t('product.authentic')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-24 opacity-5 select-none pointer-events-none">
                            <p className="text-[6vw] font-black leading-none tracking-tighter">ZERO-SYSTEM</p>
                        </div>
                    </div>
                </div>

                {/* --- REVIEWS --- */}
                <section className="mt-32 pt-24 border-t-2 border-black/5 animate-fadeInUp">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-12">
                        <div className="flex-1 space-y-12">
                            <h2 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-4 text-black text-black">
                                <MessageSquare size={24} />
                                {t('product.reviews_title')}
                            </h2>
                            {reviews.length === 0 ? (
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 italic">{t('product.reviews_empty')}</p>
                            ) : (
                                <div className="space-y-10">
                                    {reviews.map((rev) => (
                                        <div key={rev.id} className="border-l-4 border-black pl-8 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={10} className={i < rev.rating ? 'fill-black' : 'fill-transparent stroke-black/20'} />
                                                    ))}
                                                </div>
                                                <span className="text-[9px] font-black uppercase tracking-widest">{rev.customer_name}</span>
                                            </div>
                                            <p className="text-[11px] font-bold uppercase tracking-widest leading-relaxed opacity-60">{rev.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="w-full md:w-96 bg-[#f4f4f4] p-10 space-y-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">{t('product.write_review')}</h3>
                            {reviewSuccess ? (
                                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600">REPORT LOGGED SUCCESSFULLY</p>
                            ) : (
                                <form onSubmit={handleSubmitReview} className="space-y-6">
                                    <input
                                        type="text"
                                        value={reviewForm.name}
                                        onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                                        className="w-full bg-white border-b border-black/10 p-3 text-[10px] font-black tracking-widest outline-none"
                                        placeholder="IDENTIFIER..."
                                    />
                                    <textarea
                                        rows={4}
                                        value={reviewForm.comment}
                                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                        className="w-full bg-white border-b border-black/10 p-3 text-[10px] font-black tracking-widest outline-none resize-none"
                                        placeholder="ARCHIVAL OBSERVATIONS..."
                                    />
                                    <button type="submit" disabled={submittingReview} className="w-full bg-black text-white py-4 text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3">
                                        {submittingReview ? <RefreshCcw size={14} className="animate-spin" /> : <Send size={14} />}
                                        {t('product.submit_btn')}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </section>

                {/* Technical Specs Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
                        <div className="relative bg-white w-full max-w-2xl p-10 border-t-8 border-black">
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-8">{t('product.specs')}</h2>
                            <p className="text-xs font-bold leading-relaxed">{product.description}</p>
                            <button onClick={() => setIsModalOpen(false)} className="mt-12 w-full bg-black text-white py-4 text-[10px] font-black uppercase tracking-widest">Close Specs</button>
                        </div>
                    </div>
                )}

                {/* Recently Viewed */}
                <RecentlyViewed />
            </div>
        </main>
    );
}
