'use client';
import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function ShippingPolicy() {
    return (
        <main className="min-h-screen bg-white text-black font-sans pb-20">
            <Navbar />
            <div className="pt-40 px-6 md:px-12 max-w-4xl mx-auto">
                <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-12">Shipping & Logistics</h1>
                <div className="prose prose-sm font-bold opacity-70 space-y-8">
                    <section>
                        <h2 className="text-black uppercase text-xs tracking-widest font-black">Global Processing</h2>
                        <p>Orders are processed within 2-4 business days. Standard global transit times vary between 7-14 days depending on regional node efficiency.</p>
                    </section>
                    <section>
                        <h2 className="text-black uppercase text-xs tracking-widest font-black">Tracking</h2>
                        <p>Once your piece is dispatched, you will receive a technical report containing your tracking number via email.</p>
                    </section>
                </div>
            </div>
            <Footer />
        </main>
    );
}
