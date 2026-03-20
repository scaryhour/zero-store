'use client';
import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function RefundPolicy() {
    return (
        <main className="min-h-screen bg-white text-black font-sans pb-20">
            <Navbar />
            <div className="pt-40 px-6 md:px-12 max-w-4xl mx-auto">
                <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-12">Refund Protocol</h1>
                <div className="prose prose-sm font-bold opacity-70 space-y-8">
                    <section>
                        <h2 className="text-black uppercase text-xs tracking-widest font-black">Returns</h2>
                        <p>Our policy lasts 30 days. If 30 days have gone by since your purchase, unfortunately we can’t offer you a refund or exchange.</p>
                    </section>
                    <section>
                        <h2 className="text-black uppercase text-xs tracking-widest font-black">Eligibility</h2>
                        <p>To be eligible for a return, your item must be unused and in the same condition that you received it. It must also be in the original packaging.</p>
                    </section>
                    <section>
                        <h2 className="text-black uppercase text-xs tracking-widest font-black">Archive Pieces</h2>
                        <p>Limited drop and experimental pieces are non-refundable unless verified for technical defect.</p>
                    </section>
                </div>
            </div>
            <Footer />
        </main>
    );
}
