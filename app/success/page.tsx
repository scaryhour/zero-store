'use client';
import React, { useEffect, useRef, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { CheckCircle, ArrowRight, Zap, MapPin } from 'lucide-react';

function SuccessContent() {
  const { cart, clearCart } = useCart();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const hasNotified = useRef(false);
  const [orderRef, setOrderRef] = useState("");

  useEffect(() => {
    setOrderRef(Math.random().toString(36).substr(2, 9).toUpperCase());

    if (cart && cart.length > 0 && !hasNotified.current) {
      const sendOrderNotification = async () => {
        const itemsList = cart.map((item: any) => `• ${item.name}${item.selectedSize ? ` (Size: ${item.selectedSize})` : ''} (x${item.quantity})`).join('\n');
        const totalPrice = cart.reduce((acc: number, item: any) => {
          const priceNum = typeof item.price === 'string'
            ? parseFloat(item.price.replace(/[^0-9.]/g, ''))
            : item.price;
          return acc + (priceNum * item.quantity);
        }, 0).toFixed(2);

        try {
          // 1. Send Signal Relay (Telegram)
          await fetch('/api/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, items: itemsList, total: totalPrice }),
          });

          // 2. Record Order in Supabase
          const appliedCoupon = localStorage.getItem('zero_applied_coupon');
          const recordRes = await fetch('/api/record-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              items: cart,
              total: totalPrice,
              couponCode: appliedCoupon
            }),
          });

          localStorage.removeItem('zero_applied_coupon');

          if (recordRes.ok) {
            const data = await recordRes.json();
            if (data.trackId) setOrderRef(data.trackId);
          }

          hasNotified.current = true;
          clearCart();
        } catch (err) {
          console.error("Signal Relay Failed:", err);
        }
      };

      sendOrderNotification();
    }
  }, [cart, clearCart, sessionId]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-black text-center space-y-10">
      <CheckCircle size={100} className="text-emerald-500 animate-in fade-in zoom-in duration-700" strokeWidth={1} />
      <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Acquisition <br /> Complete</h1>

      <div className="bg-[#f9f9f9] p-8 border-l-8 border-black text-left space-y-4 max-w-md w-full shadow-sm">
        <div className="flex items-center gap-2 text-emerald-600 font-black text-[9px] uppercase tracking-widest">
          <MapPin size={12} /> Relay Active
        </div>
        <p className="text-[11px] font-bold uppercase opacity-60">Payment verified. Shipping data has been securely dispatched to ZERO HQ.</p>
        <div className="pt-4 border-t border-black/5 flex justify-between text-[9px] font-black opacity-20">
          <span>Protocol v1.4.2</span>
          <span>Ref: {orderRef}</span>
        </div>
      </div>

      <Link href="/" className="flex items-center justify-center gap-4 w-full max-w-md bg-black text-white py-6 text-[11px] font-black uppercase tracking-[0.6em] hover:bg-emerald-600 transition-all duration-500 group">
        Return to Archive <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
      </Link>
    </div>
  );
}

// 核心：必须使用 Suspense 包装，否则 useSearchParams 会导致页面崩溃
export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="font-black italic uppercase text-2xl animate-pulse">Syncing Signal...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}