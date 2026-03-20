'use client';
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function SupportPage() {
    return (
        <main className="min-h-screen bg-white text-black">
            <Navbar />
            <div className="pt-40 px-6 md:px-12 max-w-4xl mx-auto pb-40">
                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-12">Support Center</h1>
                <div className="space-y-12">
                    <section>
                        <h2 className="text-xs font-black uppercase tracking-widest text-black/40 mb-4">Contact Logic</h2>
                        <p className="text-sm font-bold leading-relaxed">
                            For technical inquiries or order assistance, please contact our logistics node via Telegram or email.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-xs font-black uppercase tracking-widest text-black/40 mb-4">FAQ</h2>
                        <p className="text-sm font-bold leading-relaxed">
                            Q: How do I track my order?<br />
                            A: Use the "Track Order" link in the footer with your unique Archive ID.
                        </p>
                    </section>
                </div>
            </div>
            <Footer />
        </main>
    );
}
