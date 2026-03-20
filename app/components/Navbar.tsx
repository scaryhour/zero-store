'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, Menu, X, Zap, ChevronDown, Heart, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const { setIsCartOpen, cart } = useCart();
  const { wishlist, setIsWishlistOpen } = useWishlist();
  const { language, setLanguage, t } = useLanguage();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const fetchCats = async () => {
      const { data } = await supabase.from('categories').select('name');
      if (data) setCategories(data.map(c => c.name));
    };
    fetchCats();

    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  const menuItems = [
    { name: t('nav.collections'), subItems: ['NEW ARRIVALS', 'BEST SELLERS', 'ARCHIVE PIECES', 'LIMITED DROPS'] },
    { name: t('nav.apparel'), subItems: categories.length > 0 ? categories.map(c => c.toUpperCase()) : ['TOPS', 'BOTTOMS', 'OUTERWEAR'] },
    { name: t('nav.footwear'), subItems: ['SNEAKERS', 'BOOTS', 'TECHNICAL SHOES', 'ARCHIVE'] },
    { name: t('nav.archive'), subItems: ['SERIES-01', 'SERIES-02', 'EXPERIMENTAL', 'RECYCLED'] },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 border-b ${isScrolled ? 'bg-white/90 backdrop-blur-md py-4 border-black/10 shadow-sm' : 'bg-transparent py-8 border-transparent'}`}>
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex justify-between items-center">

        <div className="hidden lg:flex gap-10 items-center">
          {menuItems.map((item) => (
            <div key={item.name} onMouseEnter={() => setActiveMenu(item.name)} onMouseLeave={() => setActiveMenu(null)} className="relative group">
              <button className={`text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeMenu === item.name ? 'text-blue-600' : isScrolled ? 'text-black opacity-60 hover:opacity-100' : 'text-black opacity-40 hover:opacity-100'}`}>
                {item.name}
                <ChevronDown size={10} className={`transition-transform duration-300 ${activeMenu === item.name ? 'rotate-180' : ''}`} />
              </button>
              <div className={`fixed top-[100%] left-0 right-0 bg-white border-b-8 border-black shadow-2xl transition-all duration-500 overflow-hidden ${activeMenu === item.name ? 'max-h-[500px] opacity-100 py-16' : 'max-h-0 opacity-0'}`} style={{ top: isScrolled ? '73px' : '105px' }}>
                <div className="max-w-6xl mx-auto px-12 grid grid-cols-4 gap-12">
                  <div className="col-span-1 border-l-2 border-black pl-8">
                    <h4 className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-6 font-bold">Catalogue Protocol</h4>
                    <ul className="space-y-4">
                      {item.subItems.map(sub => (
                        <li key={sub}><a href={`/?search=${sub.toLowerCase()}`} className="text-xl font-bold uppercase tracking-tight hover:text-blue-600 transition-all block group/item">{sub}</a></li>
                      ))}
                    </ul>
                  </div>
                  <div className="col-span-2 bg-zinc-50 p-6 border border-black/5 flex items-center justify-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-10 italic">Zero-System Archive Access</p>
                  </div>
                  <div className="col-span-1 text-right">
                    <p className="text-[10px] font-black uppercase italic opacity-20">System / Node_042</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute left-1/2 -translate-x-1/2">
          <Link href="/" className="flex flex-col items-center group">
            <span className="text-3xl font-bold leading-none tracking-tight uppercase transition-transform group-hover:scale-105 duration-500">Zero Store</span>
            <div className="flex items-center gap-1 mt-1 opacity-40">
              <span className="text-[7px] font-bold uppercase tracking-widest transition-all group-hover:tracking-widest">Archive Collection</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={() => setLanguage(language === 'EN' ? 'CN' : 'EN')} className={`text-[10px] font-black uppercase tracking-widest border-2 px-3 py-1 transition-all ${isScrolled ? 'border-black/10 hover:bg-black hover:text-white' : 'border-black/20 hover:bg-black hover:text-white text-black/60 hover:text-white'}`}>
            {language === 'EN' ? 'EN' : 'CN'}
          </button>

          <button className={`text-black/60 hover:text-black transition-all ${isScrolled ? 'opacity-80 hover:opacity-100' : 'opacity-60 hover:opacity-100'}`}>
            <Search size={18} strokeWidth={2} />
          </button>

          <div onClick={() => setIsWishlistOpen(true)} className="relative group cursor-pointer">
            <Heart size={18} strokeWidth={2} className={`${isScrolled ? 'text-black/80' : 'text-black/60'} ${wishlist.length > 0 ? 'fill-black/20' : ''}`} />
          </div>

          <Link href={user ? "/profile" : "/login"} className="relative group cursor-pointer flex items-center">
            <User size={18} strokeWidth={2} className={`transition-transform group-hover:scale-110 ${isScrolled ? 'text-black/80' : 'text-black/60'} ${user ? 'text-blue-500' : ''}`} />
            {!user && <span className="text-[7px] font-black absolute -bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">LOGIN</span>}
          </Link>

          <div onClick={() => setIsCartOpen(true)} className="relative group cursor-pointer flex items-center">
            <ShoppingCart size={18} strokeWidth={2} className={`${isScrolled ? 'text-black/80' : 'text-black/60'}`} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden text-black/60 hover:text-black transition-all"
          >
            <Menu size={20} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-white z-[200] lg:hidden transition-all duration-700 ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="p-8 flex flex-col h-full">
          <div className="flex justify-between items-center mb-16">
            <span className="text-xl font-black italic uppercase italic tracking-tighter">Menu</span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-4 bg-black text-white rounded-full">
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 space-y-10 overflow-y-auto no-scrollbar">
            {menuItems.map((item) => (
              <div key={item.name} className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30">{item.name}</h4>
                <div className="grid grid-cols-1 gap-4">
                  {item.subItems.map(sub => (
                    <a
                      key={sub}
                      href={`/?search=${sub.toLowerCase()}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-4xl font-black italic uppercase tracking-tighter hover:text-blue-600 transition-colors"
                    >
                      {sub}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-auto pt-10 border-t border-black/5 grid grid-cols-2 gap-4">
            <Link href={user ? "/profile" : "/login"} onClick={() => setIsMobileMenuOpen(false)} className="bg-zinc-100 p-6 flex flex-col gap-2">
              <User size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">{user ? 'Profile' : 'Login'}</span>
            </Link>
            <div onClick={() => { setIsCartOpen(true); setIsMobileMenuOpen(false); }} className="bg-zinc-100 p-6 flex flex-col gap-2">
              <ShoppingCart size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">Cart ({cart.length})</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}