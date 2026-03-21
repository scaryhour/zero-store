'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from './components/Navbar';
import Link from 'next/link';
import { Search, Filter, X, Zap, Heart, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useCart } from './context/CartContext';
import { useWishlist } from './context/WishlistContext';
import { useLanguage } from './context/LanguageContext';
import { useAuth } from './context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// 定义商品数据的类型
interface Product { id: number; name: string; price: string; image: string; description: string; has_sizes: boolean; sizes: string[]; category: string; video_url?: string; stock_levels?: Record<string, number>; }
interface Poster { id: string; title: string; subtitle: string; image_url: string; link_url: string; is_active: boolean; }

export default function Home() {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { currency, exchangeRate } = useCart();
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [posters, setPosters] = useState<Poster[]>([]);
  const [activePoster, setActivePoster] = useState(0);
  const [sortBy, setSortBy] = useState<'newest' | 'priceLow' | 'priceHigh'>('newest');
  const { isAdmin } = useAuth();

  // --- 从云端抓取所有商品数据 ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: prodData, error } = await supabase.from('products').select('*').order('id', { ascending: false });
      if (error) throw error;
      if (prodData) setProducts(prodData);

      const { data: catData } = await supabase.from('categories').select('name');
      if (catData) setCategories(['All', ...catData.map(c => c.name)]);

      const { data: posterData } = await supabase.from('posters').select('*').eq('is_active', true).order('created_at', { ascending: false });
      if (posterData) setPosters(posterData);
    } catch (err) {
      console.error("Fetch data failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = products.filter(item => {
    const matchesCategory = selectedCategory === 'All' || (item.category?.toUpperCase() === selectedCategory.toUpperCase());
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.id.toString().includes(searchQuery);
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    const priceA = parseFloat(a.price.replace(/[^0-9.]/g, '')) || 0;
    const priceB = parseFloat(b.price.replace(/[^0-9.]/g, '')) || 0;
    if (sortBy === 'priceLow') return priceA - priceB;
    if (sortBy === 'priceHigh') return priceB - priceA;
    return b.id - a.id;
  });

  return (
    <main className="min-h-screen bg-white text-black font-sans selection:bg-emerald-500 selection:text-white pt-24 overflow-x-hidden">
      <Navbar />

      {/* Dynamic Hero Section - The "Visual Override" */}
      {posters.length > 0 && (
        <section className="relative h-[85vh] overflow-hidden border-b-[12px] border-black group">
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2 }}
            className="absolute inset-0"
          >
            <img
              src={posters[activePoster].image_url}
              className="w-full h-full object-cover brightness-75 group-hover:brightness-90 transition-all duration-1000"
            />
          </motion.div>

          {/* High-Tech Overlay Elements */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              initial={{ top: '-10%' }}
              animate={{ top: '110%' }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-[1px] bg-white/20 z-10"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
          </div>

          <div className="absolute inset-0 flex flex-col justify-center px-12 md:px-32">
            <div className="max-w-4xl space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <Zap size={10} className="text-emerald-500 fill-emerald-500" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500">Live Archival Drop</span>
                </div>
                <h1 className="text-8xl md:text-[12rem] font-black uppercase tracking-tighter leading-[0.8] text-white drop-shadow-2xl">
                  {posters[activePoster].title}
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-lg md:text-xl font-bold text-white/80 max-w-xl uppercase tracking-widest border-l-4 border-emerald-500 pl-6 py-2"
              >
                {posters[activePoster].subtitle}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="pt-10 flex gap-6"
              >
                <a
                  href={posters[activePoster].link_url || '#'}
                  className="bg-emerald-500 text-black px-14 py-6 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-white transition-all duration-500 flex items-center gap-4 group/btn shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)]"
                >
                  {t('home.btn_init')} <ArrowRight size={16} className="group-hover/btn:translate-x-2 transition-transform" />
                </a>
              </motion.div>
            </div>
          </div>

          <div className="absolute bottom-12 left-12 md:left-32 flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Sequence Control</span>
            <div className="flex gap-4">
              {posters.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePoster(idx)}
                  className={cn(
                    "h-1 transition-all duration-700 rounded-full",
                    activePoster === idx ? "bg-emerald-500 w-24" : "bg-white/20 w-8 hover:bg-white/40"
                  )}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 py-32">
        {/* Filter & Sort Header - Professional Layout */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-24 gap-16">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-[2px] w-12 bg-emerald-500"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">Current Catalogue</span>
            </div>
            <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-none text-black">
              {(t('home.archive_title') || 'THE ARCHIVE').split(' ')[0]} <br />
              <span className="text-zinc-200 group-hover:text-black transition-colors duration-1000">
                {(t('home.archive_title') || 'THE ARCHIVE').split(' ')[1] || 'ARCHIVE'}
              </span>
            </h1>
          </div>

          <div className="flex flex-col gap-10 w-full max-w-4xl">
            {/* Search Bar - Modern Minimal */}
            <div className="relative group w-full">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-300 group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="text"
                placeholder={t('home.probe_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-b-4 border-zinc-100 py-8 pl-14 text-2xl font-black uppercase tracking-tighter focus:outline-none focus:border-black transition-all placeholder:text-zinc-100 text-black"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearchQuery('')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-4 bg-zinc-50 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-full border-2",
                      selectedCategory === cat
                        ? "bg-black text-white border-black"
                        : "bg-transparent text-zinc-400 border-zinc-100 hover:border-black hover:text-black"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-8 bg-zinc-50 px-8 py-4 rounded-full border border-zinc-100">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-300">Organize By</span>
                <div className="flex gap-6">
                  {['newest', 'priceLow', 'priceHigh'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSortBy(opt as any)}
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest transition-all",
                        sortBy === opt ? "text-emerald-600" : "text-black/40 hover:text-black"
                      )}
                    >
                      {opt === 'newest' ? 'Drop Date' : opt === 'priceLow' ? 'Price +' : 'Price -'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-6">
            <div className="w-16 h-16 border-4 border-zinc-100 border-t-emerald-500 rounded-full animate-spin"></div>
            <p className="text-[10px] uppercase tracking-[0.5em] font-black text-zinc-400">{t('home.syncing')}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center gap-8 bg-zinc-50 rounded-[40px] border-2 border-dashed border-zinc-200">
            <div className="w-16 h-16 bg-zinc-200 rounded-full flex items-center justify-center text-zinc-400"><X size={32} /></div>
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">Archive matches not found in current sector.</p>
            <button
              onClick={() => fetchData()}
              className="bg-black text-white px-12 py-5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl"
            >
              Forced Node Synchronization
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-24">
            {filteredProducts.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/product/${item.id}`} className="group block space-y-8">
                  <div className="relative aspect-[4/5] bg-zinc-50 rounded-[2rem] overflow-hidden group-hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] transition-all duration-700">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out p-8" />

                    {/* High-end Badges */}
                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                      {item.category && (
                        <span className="bg-white/80 backdrop-blur-md px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                          {item.category}
                        </span>
                      )}
                    </div>

                    <div className="absolute top-6 right-6">
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist({ id: item.id, name: item.name, price: item.price, image: item.image }); }}
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                          isInWishlist(item.id)
                            ? "bg-emerald-500 text-white shadow-lg"
                            : "bg-white/50 backdrop-blur-md text-black hover:bg-white opacity-0 group-hover:opacity-100"
                        )}
                      >
                        <Heart size={16} className={isInWishlist(item.id) ? 'fill-white' : ''} />
                      </button>
                    </div>

                    {/* Quick Add Overlay */}
                    <div className="absolute inset-x-6 bottom-6 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="bg-black text-white p-6 rounded-2xl flex justify-between items-center shadow-2xl">
                        <span className="text-[10px] font-black uppercase tracking-widest">View Specs</span>
                        <ArrowUpRight size={16} className="text-emerald-500" />
                      </div>
                    </div>
                  </div>

                  <div className="px-2 space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-black uppercase tracking-tighter leading-none group-hover:text-emerald-600 transition-colors">
                        {item.name}
                      </h3>
                      <span className="text-lg font-black tracking-tighter tabular-nums">{item.price}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.has_sizes && item.sizes && item.sizes.length > 0 && (
                        <div className="flex gap-2">
                          {item.sizes.slice(0, 4).map(sz => {
                            const stock = item.stock_levels?.[sz] ?? 0;
                            return (
                              <div key={sz} className={cn(
                                "w-8 h-8 rounded-lg border flex items-center justify-center text-[9px] font-black transition-all",
                                stock > 0 ? "border-zinc-100 bg-zinc-50 text-black group-hover:border-black" : "border-zinc-50 bg-zinc-50 text-zinc-300 line-through"
                              )}>
                                {sz}
                              </div>
                            );
                          })}
                          {item.sizes.length > 4 && <span className="text-[9px] font-black text-zinc-300 self-center">+{item.sizes.length - 4}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}