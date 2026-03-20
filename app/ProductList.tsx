'use client';
import React, { useState, useEffect } from 'react';
import UploadProduct from './components/UploadProduct';
import { useCart } from './context/CartContext';
import { supabase } from '../lib/supabase';

export default function ProductList() {
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProds, setLoadingProds] = useState(true);
  const { cart, addToCart, setIsCartOpen } = useCart() || { cart: [], addToCart: () => { }, setIsCartOpen: () => { } };

  const fetchProducts = async () => {
    setLoadingProds(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      console.error("Error fetching products:", err.message);
    } finally {
      setLoadingProds(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="py-24 px-12">
      {/* 购物车图标按钮 */}
      <button onClick={() => setIsCartOpen(true)} className="fixed bottom-10 right-10 z-[110] bg-black text-white p-5 rounded-full shadow-2xl hover:scale-110 transition-transform">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
        {cart?.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center">{cart.length}</span>
        )}
      </button>

      <div className="flex justify-between items-end mb-20 border-b border-black/5 pb-10">
        <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none">The Archive</h2>
        <p className="text-[10px] font-bold opacity-30 italic">Curating Zero / 2026 Edition —</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-20">
        <UploadProduct onProductAdded={fetchProducts} />

        {loadingProds && products.length === 0 ? (
          <div className="col-span-3 flex items-center justify-center py-20 text-xs font-black uppercase tracking-widest opacity-20">
            Syncing Databank...
          </div>
        ) : (
          products.map((p) => (
            <div key={p.id} className="group relative">
              <div className="aspect-[3/4] bg-[#f5f5f5] overflow-hidden flex items-center justify-center relative">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
                ) : (
                  <div className="opacity-5 font-black italic text-5xl">ZERO</div>
                )}

                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <button onClick={() => addToCart({ ...p, image: p.image_url })} className="w-full bg-black text-white py-4 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                    Add to Bag +
                  </button>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-black uppercase tracking-tight">{p.name}</h4>
                  <p className="text-sm font-medium">{p.price}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}