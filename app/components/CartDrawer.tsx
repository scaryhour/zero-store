'use client';
import { useCart, CartItem } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { ShoppingCart, X, Plus, Minus, Trash2, ArrowRight, Tag, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    totalPrice,
    currency,
    toggleCurrency,
    discount,
    applyDiscount,
    exchangeRate
  } = useCart();
  const { t, language } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [couponError, setCouponError] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyPromo = async () => {
    setIsVerifying(true);
    setCouponError(false);
    const success = await applyDiscount(promoCode);
    setIsVerifying(false);
    if (!success) setCouponError(true);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Your queue is empty!");
      return;
    }

    setIsProcessing(true);
    try {
      // 🟢 1. Format local cart for Stripe
      const stripeItems = cart.map((item) => ({
        price_data: {
          currency: currency.toLowerCase() === 'rm' ? 'myr' : 'usd',
          product_data: {
            name: item.selectedSize ? `${item.name} (Size: ${item.selectedSize})` : item.name,
          },
          unit_amount: Math.round(parseFloat(item.price.toString().replace(/[^0-9.]/g, '')) * (currency === 'USD' ? exchangeRate : 1) * (1 - discount / 100) * 100),
        },
        quantity: item.quantity,
      }));

      // 🟢 2. Send to /api/checkout
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: stripeItems,
          cartItems: cart.map(item => ({ id: item.id, quantity: item.quantity, selectedSize: item.selectedSize }))
        }),
      });

      const session = await response.json();

      if (session.error) throw new Error(session.error);

      // 🟢 3. Redirect to Stripe
      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error("No checkout URL returned from Stripe.");
      }

    } catch (err: any) {
      console.error("❌ Checkout failed:", err.message);
      alert("Checkout sequence failed. Check Terminal for details.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white text-black z-50 shadow-2xl flex flex-col font-sans transform transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.3,1)]">

        {/* Header */}
        <div className="p-8 border-b-4 border-black flex flex-col gap-6 bg-[#f9f9f9]">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-bold uppercase tracking-tight">{t('cart.title')}</h2>
              <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold mt-1">{t('cart.ready')}</p>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white px-4 py-2 border-2 border-transparent hover:border-black transition-all"
            >
              {language === 'EN' ? 'Close [X]' : '关闭 [X]'}
            </button>
          </div>

          {/* Currency Toggle */}
          <div className="flex bg-black/5 p-1 self-start">
            {['RM', 'USD'].map(c => (
              <button
                key={c}
                onClick={toggleCurrency}
                className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${currency === c ? 'bg-black text-white' : 'text-black/40 hover:text-black'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-30 select-none">
              <ShoppingCart size={48} strokeWidth={1} className="mb-6" />
              <p className="text-[10px] font-black uppercase tracking-[0.5em]">{t('cart.empty')}</p>
            </div>
          ) : (
            cart.map((item: CartItem) => (
              <div key={`${item.id}-${item.selectedSize || 'none'}`} className="flex gap-6 items-center p-4 bg-[#f9f9f9] border border-black/5 hover:border-black transition-colors group">
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
                    {item.selectedSize && (
                      <span className="inline-block mt-2 text-[8px] font-black bg-emerald-600 text-white px-2 py-0.5 uppercase tracking-widest">
                        SIZE: {item.selectedSize}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest mt-auto">
                    <div className="flex items-center gap-4 bg-white px-2 py-1 border border-black/10">
                      <button
                        onClick={() => updateQuantity(item.id, -1, item.selectedSize)}
                        className="w-6 h-6 hover:bg-black hover:text-white transition-colors flex items-center justify-center"
                      >-</button>
                      <span className="w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1, item.selectedSize)}
                        className="w-6 h-6 hover:bg-black hover:text-white transition-colors flex items-center justify-center"
                      >+</button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id, item.selectedSize)}
                      className="text-red-500 hover:bg-red-500 hover:text-white px-2 py-1 transition-colors"
                    >
                      {t('cart.delete')}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Checkout */}
        {cart.length > 0 && (
          <div className="border-t-4 border-black bg-white p-8">
            {/* Discount Code */}
            <div className="mb-8 space-y-3">
              <p className="text-[9px] font-black uppercase opacity-30 tracking-widest">{t('cart.promo')}</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => { setPromoCode(e.target.value); setCouponError(false); }}
                  className={`flex-1 bg-zinc-100 border p-3 text-xs font-bold focus:outline-none uppercase tracking-widest ${couponError ? 'border-red-500' : 'border-transparent focus:border-black'}`}
                  placeholder={t('cart.promo_placeholder')}
                />
                <button
                  onClick={handleApplyPromo}
                  disabled={isVerifying || !promoCode}
                  className="bg-black text-white px-6 text-[9px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all disabled:opacity-50"
                >
                  {isVerifying ? t('cart.verifying') : t('cart.apply')}
                </button>
              </div>
              {couponError && <p className="text-[9px] font-bold text-red-500 mt-2 tracking-widest uppercase">Invalid Promo Code</p>}
              {discount > 0 && <p className="text-[9px] font-bold text-emerald-600 mt-2 tracking-widest uppercase">Discount Applied: {discount}% OFF</p>}
            </div>

            <div className="flex justify-between items-end mb-8 border-t border-black/5 pt-8">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">{t('cart.total')}</span>
              <span className="text-4xl font-bold tracking-tight">{currency} {totalPrice.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full py-6 bg-black text-white text-[11px] font-black uppercase tracking-[0.5em] hover:bg-white hover:text-black border-2 border-black transition-all flex items-center justify-center gap-4"
            >
              <ShoppingCart size={16} strokeWidth={2.5} />
              {isProcessing ? t('cart.processing') : t('cart.checkout')}
            </button>
            <p className="text-[8px] text-center font-bold uppercase tracking-widest opacity-30 mt-4">
              Secure transmission via Stripe Network
            </p>
          </div>
        )}
      </div>
    </>
  );
}