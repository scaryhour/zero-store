'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, Menu, X, Zap, ChevronDown, Heart, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface NavbarProps {
  className?: string;
}

export default function Navbar({ className }: NavbarProps) {
  const { setIsCartOpen, cart } = useCart();
  const { wishlist, setIsWishlistOpen } = useWishlist();
  const { language, setLanguage, t } = useLanguage();
  const { user, isAdmin } = useAuth();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchCats = async () => {
      const { data } = await supabase.from('categories').select('name');
      if (data) setCategories(data.map(c => c.name));
    };
    fetchCats();

    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const menuItems = [
    { name: t('nav.collections'), subItems: ['NEW ARRIVALS', 'BEST SELLERS', 'ARCHIVE PIECES', 'LIMITED DROPS'] },
    { name: t('nav.apparel'), subItems: categories.length > 0 ? categories.map(c => c.toUpperCase()) : ['TOPS', 'BOTTOMS', 'OUTERWEAR'] },
    { name: t('nav.footwear'), subItems: ['SNEAKERS', 'BOOTS', 'TECHNICAL SHOES', 'ARCHIVE'] },
    { name: t('nav.archive'), subItems: ['SERIES-01', 'SERIES-02', 'EXPERIMENTAL', 'RECYCLED'] },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ease-in-out border-b",
      isScrolled ? "bg-white/95 backdrop-blur-md py-4 border-zinc-200 shadow-sm" : "bg-transparent py-8 border-transparent",
      className
    )}>
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex justify-between items-center">

        <div className="hidden lg:flex gap-10 items-center">
          {menuItems.map((item) => (
            <div key={item.name} onMouseEnter={() => setActiveMenu(item.name)} onMouseLeave={() => setActiveMenu(null)} className="relative group">
              <button className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2",
                activeMenu === item.name ? "text-emerald-600" : "text-black hover:text-emerald-600"
              )}>
                {item.name}
                <ChevronDown size={10} className={cn("transition-transform duration-500", activeMenu === item.name && "rotate-180")} />
              </button>

              {/* Dropdown for professional mega-menu */}
              <div className={cn(
                "fixed top-[100%] left-0 right-0 bg-white border-b-8 border-black shadow-2xl transition-all duration-500 overflow-hidden",
                activeMenu === item.name ? "max-h-[500px] opacity-100 py-16" : "max-h-0 opacity-0 pointer-events-none"
              )} style={{ top: isScrolled ? '73px' : '105px' }}>
                <div className="max-w-6xl mx-auto px-12 grid grid-cols-4 gap-12">
                  <div className="col-span-1 border-l-2 border-black pl-8">
                    <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-300 mb-6">Archive Selection</h4>
                    <ul className="space-y-4">
                      {item.subItems.map(sub => (
                        <li key={sub}>
                          <a href={`/?search=${sub.toLowerCase()}`} className="text-2xl font-black uppercase tracking-tighter hover:text-emerald-600 transition-all block group/item">
                            {sub}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="col-span-2 bg-zinc-50 p-8 border border-zinc-100 flex flex-col justify-between relative overflow-hidden group/card">
                    <div className="relative z-10">
                      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500/50 mb-2 block">Protocol 01</span>
                      <h3 className="text-4xl font-black uppercase tracking-tighter leading-none mb-4">The Next Generation <br /> of Archive</h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 max-w-xs leading-relaxed">System-wide synchronization active. Access restricted to authorized archival members only.</p>
                    </div>
                    <div className="absolute right-[-10%] bottom-[-10%] text-[120px] font-black text-black/[0.03] select-none group-hover/card:scale-110 transition-transform duration-[2s]">ZERO</div>
                  </div>
                  <div className="col-span-1 flex flex-col justify-end text-right">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-300 mb-2">Relay / Node_042</p>
                    <div className="h-1 w-12 bg-black ml-auto"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
          <Link href="/" className="flex flex-col items-center group">
            <span className="text-2xl md:text-5xl font-black leading-none tracking-tighter uppercase transition-transform group-hover:scale-105 duration-700 text-black">Zero Store</span>
            <div className="flex items-center gap-2 mt-1 transition-opacity group-hover:opacity-100">
              <span className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400">Archival Series / 2026</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-7">
          <button
            onClick={() => setLanguage(language === 'EN' ? 'CN' : 'EN')}
            className="group flex flex-col items-center"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-black mb-1 group-hover:text-emerald-600 transition-colors">{language}</span>
            <div className="h-[2px] w-0 bg-emerald-500 group-hover:w-full transition-all duration-500"></div>
          </button>

          <button className="hidden md:block text-black hover:text-emerald-600 transition-all transform hover:scale-110 duration-300">
            <Search size={18} strokeWidth={3} />
          </button>

          <div onClick={() => setIsWishlistOpen(true)} className="hidden md:block relative group cursor-pointer transition-transform hover:scale-110 duration-300">
            <Heart size={18} strokeWidth={3} className={cn("text-black", wishlist.length > 0 && "fill-emerald-500 text-emerald-500")} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            )}
          </div>

          <Link href={user ? "/profile" : "/login"} className="hidden md:block relative group cursor-pointer flex items-center transition-transform hover:scale-110 duration-300">
            <User size={18} strokeWidth={3} className={cn("text-black", user && "text-emerald-600")} />
            {!user && <span className="text-[8px] font-black absolute -bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity tracking-widest">ACCESS</span>}
          </Link>

          <div onClick={() => setIsCartOpen(true)} className="relative group cursor-pointer flex items-center transition-transform hover:scale-110 duration-300">
            <ShoppingCart size={18} strokeWidth={3} className="text-black" />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 bg-emerald-500 rounded-full items-center justify-center text-[8px] font-black text-white border-2 border-white">
                {cart.length}
              </span>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden text-black hover:scale-110 transition-all p-1"
          >
            <Menu size={22} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay - More Professional Style */}
      <div className={cn(
        "fixed inset-0 bg-white z-[200] lg:hidden transition-all duration-700 ease-[cubic-bezier(0.85,0,0.15,1)]",
        isMobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
      )}>
        <div className="p-8 flex flex-col h-full bg-white relative overflow-hidden">
          {/* Decorative background text */}
          <div className="absolute top-[20%] left-[-20%] text-[200px] font-black text-black/[0.02] select-none -rotate-12 pointer-events-none uppercase">ARCHIVE</div>

          <div className="flex justify-between items-center mb-20 relative z-10">
            <span className="text-3xl font-black uppercase tracking-tighter text-black">Menu Protocol</span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform">
              <X size={24} strokeWidth={3} />
            </button>
          </div>

          <nav className="flex-1 space-y-12 overflow-y-auto no-scrollbar relative z-10">
            {menuItems.map((item) => (
              <div key={item.name} className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 pl-1">{item.name}</h4>
                <div className="flex flex-col gap-6">
                  {item.subItems.map(sub => (
                    <a
                      key={sub}
                      href={`/?search=${sub.toLowerCase()}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-5xl font-black uppercase tracking-tighter text-black hover:translate-x-4 transition-transform duration-500"
                    >
                      {sub}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-auto pt-10 border-t border-zinc-100 grid grid-cols-2 gap-4 relative z-10">
            <Link href={user ? "/profile" : "/login"} onClick={() => setIsMobileMenuOpen(false)} className="bg-zinc-50 p-8 flex flex-col gap-4 group">
              <User size={24} strokeWidth={3} className="group-hover:text-emerald-500 transition-colors" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-black">{user ? 'Identity Profile' : 'Access Base'}</span>
                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Status: {user ? 'Connected' : 'Disconnected'}</span>
              </div>
            </Link>
            <div onClick={() => { setIsCartOpen(true); setIsMobileMenuOpen(false); }} className="bg-zinc-50 p-8 flex flex-col gap-4 group">
              <ShoppingCart size={24} strokeWidth={3} className="group-hover:text-emerald-500 transition-colors" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-black">Active Parcel</span>
                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{cart.length} Units Detected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}