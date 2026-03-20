'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Package, Trash2, Edit3, Filter, PlusCircle, RefreshCcw } from 'lucide-react';
import UploadProduct, { ProductData } from '../../components/UploadProduct';
import AdminSidebar from '../../components/AdminSidebar';

interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  description: string;
  has_sizes: boolean;
  sizes: string[];
  category: string;
  stock_levels: Record<string, number>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();

      if (!profile?.is_admin) {
        alert("ACCESS_DENIED: ADMINISTRATIVE_PRIVILEGES_REQUIRED");
        router.push('/');
        return;
      }

      setIsAdmin(true);
      setAuthLoading(false);
    };
    checkAuth();
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('id', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin]);

  const refreshData = async () => {
    const { data } = await supabase.from('products').select('*').order('id', { ascending: false });
    if (data) setProducts(data);
  };

  if (authLoading) return (
    <div className="min-h-screen bg-black text-emerald-500 font-mono flex items-center justify-center p-12 text-center uppercase tracking-[0.5em]">
      {'>'} SYSTEM_AUTH_VALIDATION_IN_PROGRESS...
    </div>
  );

  const startEdit = (item: Product) => {
    setEditingProduct(item);
    setIsUploadModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-black font-sans selection:bg-black selection:text-white">
      <AdminSidebar />

      <main className="ml-64 p-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="flex justify-between items-end mb-16 border-b-4 border-black pb-8">
            <div>
              <h1 className="text-5xl font-bold uppercase tracking-tighter leading-tight mb-2">Inventory_Command</h1>
              <div className="flex items-center gap-4 opacity-30">
                <p className="text-[10px] uppercase tracking-widest font-bold italic">Node_00 / Global_Archive</p>
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest">System_Live</span>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={fetchData}
                className="p-4 bg-white border border-black/10 hover:border-black transition-all group"
              >
                <RefreshCcw size={18} className={loading ? 'animate-spin' : 'opacity-40 group-hover:opacity-100'} />
              </button>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-10 py-5 bg-black text-white hover:bg-emerald-600 transition-all text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-4 ring-offset-4 active:ring-2 ring-black"
              >
                <PlusCircle size={18} fill="white" /> Register_New_Piece
              </button>
            </div>
          </header>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 border border-black/5 shadow-sm">
              <p className="text-[9px] font-black uppercase opacity-30 tracking-[0.3em] mb-4">Detected_Units</p>
              <p className="text-4xl font-bold tracking-tighter">{products.length}</p>
            </div>
            <div className="bg-white p-8 border border-black/5 shadow-sm">
              <p className="text-[9px] font-black uppercase opacity-30 tracking-[0.3em] mb-4">Active_Collections</p>
              <p className="text-4xl font-bold tracking-tighter">{[...new Set(products.map(p => p.category))].length}</p>
            </div>
            <div className="bg-white p-8 border border-black/5 shadow-sm">
              <p className="text-[9px] font-black uppercase opacity-30 tracking-[0.3em] mb-4">Inventory_Health</p>
              <p className="text-4xl font-bold tracking-tighter text-emerald-600">OPTIMAL</p>
            </div>
          </div>

          {/* Product Grid */}
          <section>
            <div className="flex justify-between items-center mb-10 border-b border-black pb-4">
              <h2 className="text-[11px] font-bold uppercase tracking-widest">Archives_Log</h2>
              <div className="flex items-center gap-2">
                <Filter size={12} strokeWidth={3} className="opacity-20" />
                <span className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Real-Time Filtering Active</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {loading ? (
                <div className="h-40 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-black/5 bg-white">
                  <div className="w-8 h-1 bg-black animate-pulse" />
                </div>
              ) : products.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-black/5 bg-white">
                  <p className="text-[10px] uppercase font-black opacity-20 tracking-widest">Empty_Archive_Node</p>
                </div>
              ) : products.map(item => {
                const totalStock = Object.values(item.stock_levels || {}).reduce((acc, curr) => acc + curr, 0);
                const isOutOfStock = totalStock === 0;

                return (
                  <div key={item.id} className="bg-white p-6 flex justify-between items-center group border border-transparent hover:border-black transition-all shadow-sm">
                    <div className="flex items-center gap-8">
                      <div className="w-20 h-24 bg-[#f4f4f4] overflow-hidden border border-black/5">
                        <img
                          src={item.image}
                          className={`w-full h-full object-cover transition-all duration-700 ${isOutOfStock ? 'grayscale opacity-40' : 'grayscale-0'}`}
                          alt={item.name}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[8px] font-black px-2 py-1 bg-black text-white uppercase tracking-widest">NO. {item.id.toString().padStart(4, '0')}</span>
                          <h3 className="text-lg font-bold uppercase tracking-tighter">{item.name}</h3>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-[10px] font-bold opacity-40">{item.price}</p>
                          <span className="text-[8px] font-black px-2 py-0.5 bg-zinc-100 text-black/40 uppercase tracking-widest">{item.category || 'Archive'}</span>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-4">
                          {item.has_sizes && item.sizes && item.sizes.length > 0 ? (
                            item.sizes.map(sz => (
                              <div key={sz} className="flex flex-col items-center">
                                <span className="text-[8px] font-black px-2 py-1 bg-zinc-100 text-black/60 border border-black/5">{sz}</span>
                                <span className={`text-[8px] font-black mt-1 ${item.stock_levels?.[sz] === 0 ? 'text-red-500 animate-pulse' : 'text-emerald-600'}`}>
                                  {item.stock_levels?.[sz] ?? 0}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="flex flex-col items-center">
                              <span className="text-[8px] font-black px-2 py-1 bg-zinc-200">STOCK</span>
                              <span className={`text-[8px] font-black mt-1 ${item.stock_levels?.['OS'] === 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                                {item.stock_levels?.['OS'] ?? 0}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-8 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => startEdit(item)} className="p-3 bg-zinc-100 hover:bg-black hover:text-white transition-all">
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('Confirm Decommission?')) {
                            const res = await fetch('/api/admin/delete-product', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: item.id }),
                            });
                            const result = await res.json();
                            if (result.success) refreshData();
                            else alert("Decommission failed: " + result.error);
                          }
                        }}
                        className="p-3 bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      {/* Modal Layer */}
      {isUploadModalOpen && (
        <UploadProduct
          isModal={true}
          onProductAdded={() => {
            setEditingProduct(null);
            setIsUploadModalOpen(false);
            refreshData();
          }}
          editingProduct={editingProduct as ProductData}
          onCancelEdit={() => {
            setEditingProduct(null);
            setIsUploadModalOpen(false);
          }}
        />
      )}
    </div>
  );
}