'use client';
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WishlistDrawer from '../components/WishlistDrawer';

export default function WishlistPage() {
    return (
        <main className="min-h-screen bg-white text-black">
            <Navbar />
            <div className="pt-40 px-6 md:px-12 max-w-4xl mx-auto pb-40">
                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-12">Your Wishlist</h1>
                <p className="text-sm font-bold leading-relaxed mb-8">
                    View and manage your saved items.
                </p>
                <div className="bg-[#f9f9f9] p-12 border border-black/5 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-6">Archive Access</p>
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('open-wishlist'))}
                        className="bg-black text-white px-8 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all"
                    >
                        Review Saved Items
                    </button>
                </div>
            </div>
            <Footer />
        </main>
    );
}
