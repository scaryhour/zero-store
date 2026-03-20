'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { supabase } from '@/lib/supabase';

interface Product {
    id: number;
    name: string;
    image: string;
    price: string;
}

export default function RecentlyViewed() {
    const { currency, exchangeRate } = useCart();
    const [items, setItems] = useState<Product[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const history = localStorage.getItem('zero_view_history');
        if (history) {
            try {
                setItems(JSON.parse(history));
            } catch (e) {
                console.error("Failed to parse history", e);
            }
        }

        const checkAdmin = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', session.user.id).single();
                if (profile?.is_admin) setIsAdmin(true);
            }
        };
        checkAdmin();
    }, []);

    if (items.length === 0) return null;

    return (
        <div className="mt-40 border-t border-black pb-20 pt-16">
            <h2 className="text-[11px] font-bold uppercase tracking-widest mb-12 text-black/40">Recently Viewed {isAdmin && '/ Archive Memory'}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                {items.map((item) => (
                    <Link key={item.id} href={`/product/${item.id}`} className="group block">
                        <div className="aspect-[3/4] bg-[#f4f4f4] mb-4 overflow-hidden relative border border-black/5">
                            {isAdmin && (
                                <div className="absolute top-0 right-0 bg-black text-white text-[7px] font-black px-2 py-1 z-10">
                                    NO. {item.id.toString().padStart(4, '0')}
                                </div>
                            )}
                            <img src={item.image} className="w-full h-full object-cover mix-blend-multiply grayscale-0 transition-all duration-700 group-hover:scale-110" alt={item.name} />
                        </div>
                        <h3 className="text-[11px] font-black uppercase tracking-tight truncate text-black">{item.name}</h3>
                        <p className="text-[10px] font-bold text-black/40 mt-1">
                            {currency} {(parseFloat(item.price.toString().replace(/[^0-9.]/g, '')) * (currency === 'USD' ? exchangeRate : 1)).toFixed(2)}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
