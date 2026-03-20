'use client';
import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

export default function WishlistDrawer() {
    const { wishlist, isWishlistOpen, setIsWishlistOpen, toggleWishlist } = useWishlist();
    const { currency, exchangeRate } = useCart();
    const { t, language } = useLanguage();

    if (!isWishlistOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity"
                onClick={() => setIsWishlistOpen(false)}
            />

            <div className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white text-black z-[110] shadow-2xl flex flex-col font-sans transform transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.3,1)]">

                {/* Header */}
                <div className="p-8 border-b-4 border-black flex flex-col gap-6 bg-[#f9f9f9]">
                    <div className="flex justify-between items-end">
                        <div>
                            <h2 className="text-3xl font-bold uppercase tracking-tight">{t('wishlist.title')}</h2>
                            <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold mt-1">{t('wishlist.saved')}</p>
                        </div>
                        <button
                            onClick={() => setIsWishlistOpen(false)}
                            className="text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white px-4 py-2 border-2 border-transparent hover:border-black transition-all"
                        >
                            {language === 'EN' ? 'Close [X]' : '关闭 [X]'}
                        </button>
                    </div>
                </div>

                {/* Wishlist Items */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {wishlist.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-30 select-none">
                            <Heart size={48} strokeWidth={1} className="mb-6" />
                            <p className="text-[10px] font-black uppercase tracking-[0.5em]">{t('wishlist.empty')}</p>
                        </div>
                    ) : (
                        wishlist.map((item) => (
                            <div key={item.id} className="flex gap-6 items-center p-4 bg-[#f9f9f9] border border-black/5 hover:border-black transition-colors group">
                                <div className="w-20 h-24 bg-zinc-200 overflow-hidden shrink-0 filter grayscale-0 transition-all duration-500">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                                </div>

                                <div className="flex-1 flex flex-col justify-between h-24 py-1">
                                    <div>
                                        <h3 className="text-[12px] font-bold uppercase tracking-widest leading-none bg-black text-white inline-block px-2 py-1">
                                            {item.name}
                                        </h3>
                                        <p className="text-[10px] font-bold opacity-60 mt-2">
                                            {currency} {(parseFloat(item.price.toString().replace(/[^0-9.]/g, '')) * (currency === 'USD' ? exchangeRate : 1)).toFixed(2)}
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest mt-auto">
                                        <Link
                                            href={`/product/${item.id}`}
                                            onClick={() => setIsWishlistOpen(false)}
                                            className="text-blue-600 hover:underline"
                                        >
                                            {t('wishlist.view')}
                                        </Link>
                                        <button
                                            onClick={() => toggleWishlist(item)}
                                            className="text-red-500 hover:bg-red-500 hover:text-white px-2 py-1 transition-colors"
                                        >
                                            {t('wishlist.remove')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {wishlist.length > 0 && (
                    <div className="border-t-4 border-black bg-zinc-50 p-8 space-y-4">
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-40 italic">
                            {t('wishlist.disclaimer')}
                        </p>
                        <Link
                            href="/"
                            onClick={() => setIsWishlistOpen(false)}
                            className="w-full py-6 bg-black text-white text-[11px] font-black uppercase tracking-[0.5em] hover:bg-white hover:text-black border-2 border-black transition-all flex items-center justify-center gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.1)]"
                        >
                            {t('wishlist.continue')}
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}
