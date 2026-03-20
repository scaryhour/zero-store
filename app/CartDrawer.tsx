'use client';
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
// 🟢 关键修复：退两层回到根目录，再进入 lib
import getStripe from '../../lib/get-stripe';

export default function CartDrawer() {
  const { cart, totalPrice } = useCart();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setLoading(true);
    try {
      // 1. 转换 Stripe 识别的格式
      const stripeItems = cart.map((item: any) => ({
        price_data: {
          currency: 'myr',
          product_data: { name: item.name },
          unit_amount: Math.round(parseFloat(item.price.toString().replace(/[^0-9.]/g, '')) * 100),
        },
        quantity: item.quantity,
      }));

      // 2. 请求后端 Session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: stripeItems }),
      });

      const session = await response.json();
      if (session.error) throw new Error(session.error);

      // 3. 驱动 Stripe 跳转
      const stripe = await getStripe();
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({
          sessionId: session.id,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      console.error("❌ Checkout Error:", err.message);
      alert("Checkout failed. Check terminal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border-t border-black bg-white">
      <div className="flex justify-between font-black italic uppercase text-2xl mb-6">
        <span>Total</span>
        <span>RM {totalPrice}</span>
      </div>
      <button
        onClick={handleCheckout}
        disabled={loading || cart.length === 0}
        className={`w-full py-6 font-black uppercase tracking-[0.4em] text-[11px] transition-all duration-500 ${
          loading ? 'bg-zinc-500' : 'bg-[#4b7c6b] hover:bg-black text-white'
        }`}
      >
        {loading ? 'Initializing Signal...' : 'Checkout Now'}
      </button>
    </div>
  );
}