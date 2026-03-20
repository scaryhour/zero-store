'use client';
import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-white text-black">
            <Navbar />
            <div className="pt-40 px-6 md:px-12 max-w-4xl mx-auto pb-40">
                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-12">Terms & Conditions</h1>
                <div className="space-y-12">
                    <section>
                        <h2 className="text-xs font-black uppercase tracking-widest text-black/40 mb-4">Agreement</h2>
                        <p className="text-sm font-bold leading-relaxed">
                            By accessing Zero Store, you agree to comply with our design-driven terms of service and usage.
                        </p>
                    </section>
                </div>
            </div>
            <Footer />
        </main>
    );
}
