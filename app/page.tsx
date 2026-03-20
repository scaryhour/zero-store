'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from './components/Navbar';
import Link from 'next/link';
import { Search, Filter, X, Zap, Heart } from 'lucide-react';
import { useCart } from './context/CartContext';
import { useWishlist } from './context/WishlistContext';
import { useLanguage } from './context/LanguageContext';
import { useAuth } from './context/AuthContext';

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
      console.log("Fetching products from Supabase...");
      const { data: prodData, error } = await supabase.from('products').select('*').order('id', { ascending: false });

      if (error) throw error;

      if (prodData) {
        console.log(`Successfully fetched ${prodData.length} products.`);
        setProducts(prodData);
      }

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
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toString().includes(searchQuery);
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    const priceA = parseFloat(a.price.replace(/[^0-9.]/g, '')) || 0;
    const priceB = parseFloat(b.price.replace(/[^0-9.]/g, '')) || 0;
    if (sortBy === 'priceLow') return priceA - priceB;
    if (sortBy === 'priceHigh') return priceB - priceA;
    return b.id - a.id; // Default newest
  });

  return (
    <main className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white pt-24">
      <Navbar />

      {/* Dynamic Hero Section - The "Visual Override" */}
      {posters.length > 0 && (
        <section className="relative h-[85vh] overflow-hidden border-b-8 border-black group">
          <div className="absolute inset-0 transition-transform duration-[2s] scale-105 group-hover:scale-100">
            <img
              src={posters[activePoster].image_url}
              className="w-full h-full object-cover grayscale-0 brightness-100 transition-all duration-[2s]"
            />
          </div>

          <div className="absolute inset-0 pointer-events-none">
            {isAdmin && <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500/50 shadow-[0_0_15px_blue] animate-[scan_4s_linear_infinite]" />}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
            {isAdmin && <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />}
          </div>

          <div className="absolute inset-0 flex flex-col justify-center px-12 md:px-24">
            <div className="max-w-4xl space-y-6">
              <div className="flex flex-col mb-12 animate-fadeInUp">
                <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-2 text-white">
                  {selectedCategory === 'All' ? t('home.all_collections') : selectedCategory.toUpperCase()}
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                  {selectedCategory === 'All' ? 'Curated Anthology' : `Selective ${selectedCategory} Series`} / 2026
                </p>
              </div>
              <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-none text-white drop-shadow-2xl">
                {posters[activePoster].title}
              </h1>
              <p className="text-lg md:text-xl font-bold text-white max-w-xl uppercase tracking-widest border-l-4 border-white pl-6">
                {posters[activePoster].subtitle}
              </p>
              <div className="pt-10 flex gap-6">
                <a
                  href={posters[activePoster].link_url || '#'}
                  className="bg-white text-black px-12 py-6 text-[12px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-500 flex items-center gap-4 group/btn shadow-xl"
                >
                  {t('home.btn_init')} <Zap size={16} className="fill-current group-hover/btn:scale-125 transition-transform" />
                </a>
              </div>
            </div>
          </div>

          {posters.length > 1 && (
            <div className="absolute bottom-12 right-12 flex gap-4">
              {posters.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePoster(idx)}
                  className={`w-12 h-1 transition-all duration-500 ${activePoster === idx ? 'bg-white w-24' : 'bg-white/20 hover:bg-white/50'}`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 py-24">
        {/* Filter & Sort Header */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-16 border-b border-black pb-8 gap-12">
          <div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight mb-4 text-black">ZERO {t('home.archive_title')}</h1>
            <p className="text-[11px] uppercase tracking-widest text-black/40 mt-4 font-bold">
              {loading ? (isAdmin ? t('home.inventory_scanning') : '...') : (isAdmin ? `${t('home.inventory_active')} / ${filteredProducts.length} Units Detected` : `${filteredProducts.length} ${t('home.items_available') || 'Items'}`)}
            </p>
          </div>

          <div className="flex flex-col gap-8 w-full max-w-3xl">
            {/* Search Bar */}
            <div className="relative group w-full">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 opacity-20 group-focus-within:opacity-100 transition-all duration-500" />
              <input
                type="text"
                placeholder={t('home.probe_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-b-2 border-black/10 py-6 pl-10 text-xl font-black uppercase tracking-widest focus:outline-none focus:border-black transition-all placeholder:text-black/10 text-black"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-0 top-1/2 -translate-y-1/2 p-2"><X size={16} /></button>
              )}
            </div>

            <div className="flex flex-col md:flex-row justify-between gap-8">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center self-center mr-4 text-black/40">
                  <Filter size={12} strokeWidth={3} />
                  <span className="text-[10px] font-bold uppercase ml-2 tracking-widest">Filter:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all border-2 ${selectedCategory === cat ? 'bg-black text-white border-black' : 'bg-transparent text-black/40 border-black/10 hover:border-black hover:text-black'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sorting */}
              <div className="flex items-center gap-6 self-end md:self-center border-l border-black/10 pl-8">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-30">{t('home.sort_label')}:</span>
                <div className="flex gap-4">
                  {[
                    { id: 'newest', label: t('home.sort_newest') },
                    { id: 'priceLow', label: t('home.sort_price_low') },
                    { id: 'priceHigh', label: t('home.sort_price_high') }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setSortBy(opt.id as any)}
                      className={`text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${sortBy === opt.id ? 'text-black border-b-2 border-black' : 'text-black/40 hover:text-black'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-[2px] bg-black animate-pulse"></div>
            <p className="text-[9px] uppercase tracking-[0.5em] font-black">{t('home.syncing')}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center gap-8 border-2 border-dashed border-black/5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">No products detected in this archival node.</p>
            <button
              onClick={() => fetchData()}
              className="bg-black text-white px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all"
            >
              Retry Data Request / Force Sync
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-20">
            {filteredProducts.map((item, index) => (
              <Link
                href={`/product/${item.id}`}
                key={item.id}
                style={{ animationDelay: `${index * 0.1}s` }}
                className="group cursor-crosshair block opacity-0 animate-fadeInUp"
              >
                <div className="relative aspect-[3/4] bg-[#f4f4f4] mb-6 overflow-hidden">
                  {isAdmin && (
                    <div className="absolute top-0 right-0 bg-black text-white text-[9px] font-black px-3 py-1.5 z-10 tracking-widest uppercase">
                      NO. {item.id.toString().padStart(4, '0')}
                    </div>
                  )}
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out" />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-[10px] bg-black px-6 py-3 font-black uppercase tracking-[0.3em]">
                      {t('home.inspect')}
                    </span>
                  </div>

                  {/* Wishlist Icon */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist({ id: item.id, name: item.name, price: item.price, image: item.image });
                    }}
                    className={`absolute bottom-4 right-4 z-20 p-2 rounded-full backdrop-blur-md transition-all duration-300 ${isInWishlist(item.id) ? 'bg-black text-white' : 'bg-white/80 text-black hover:bg-black hover:text-white opacity-0 group-hover:opacity-100'}`}
                  >
                    <Heart size={14} className={isInWishlist(item.id) ? 'fill-white' : ''} />
                  </button>
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tight mb-1 group-hover:text-blue-600 transition-colors text-black">
                      {item.name}
                    </h3>
                    <p className="text-[11px] font-bold text-black/40 mb-3">
                      {currency} {(parseFloat(item.price.toString().replace(/[^0-9.]/g, '')) * (currency === 'USD' ? exchangeRate : 1)).toFixed(2)}
                    </p>
                    <div className="flex gap-1 mt-3">
                      {item.has_sizes && item.sizes && item.sizes.length > 0 ? (
                        item.sizes.map(sz => {
                          const stock = item.stock_levels?.[sz] ?? 0;
                          return (
                            <div key={sz} className="flex flex-col items-center gap-1 group/sz">
                              <div className={`w-7 h-7 flex items-center justify-center border-2 border-black/10 text-[10px] font-black uppercase ${stock > 0 ? 'text-black group-hover:bg-black group-hover:text-white' : 'text-red-500 line-through opacity-30'} transition-colors relative`}>
                                {sz}
                              </div>
                              <span className={`text-[8px] font-black uppercase tracking-tighter ${stock > 0 ? (stock < 3 ? 'text-red-500 animate-pulse' : 'text-emerald-600') : 'text-red-500 opacity-100'}`}>
                                {stock > 0 ? `${stock}R` : 'OUT'}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="w-5 h-5 border border-black/20 relative">
                          <svg className="absolute inset-0 w-full h-full text-black/10" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="2" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black">{item.price}</p>
                    <div className="w-8 h-[1px] bg-black/20 ml-auto mt-2 group-hover:bg-black group-hover:w-full transition-all duration-500"></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}