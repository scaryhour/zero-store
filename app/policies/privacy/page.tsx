'use client';
import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function PrivacyPolicy() {
    return (
        <main className="min-h-screen bg-white text-black font-sans pb-20">
            <Navbar />
            <div className="pt-40 px-6 md:px-12 max-w-4xl mx-auto">
                <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-12">Data Privacy Protocol</h1>
                <div className="prose prose-sm font-bold opacity-70 space-y-8">
                    <section>
                        <h2 className="text-black uppercase text-xs tracking-widest font-black">Information Security</h2>
                        <p>We only collect data necessary for transaction processing and archive tracking. Your technical profile is never shared with external nodes for commercial exploitation.</p>
                    </section>
                    <section>
                        <h2 className="text-black uppercase text-xs tracking-widest font-black">Cookies</h2>
                        <p>We use micro-data modules (cookies) to maintain your session and archive preferences.</p>
                    </section>
                </div>
            </div>
            <Footer />
        </main>
    );
}
