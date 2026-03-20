'use client';
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useLanguage } from '../context/LanguageContext';
import { Zap, Shield, Box, Activity, ChevronRight } from 'lucide-react';

export default function AboutPage() {
    const { t } = useLanguage();
    const [totalDispatched, setTotalDispatched] = useState(0);

    useEffect(() => {
        // A little "Live" effect for the Archive vibe
        const target = 1420; // Simulated total units
        let start = 0;
        const interval = setInterval(() => {
            start += 12;
            if (start >= target) {
                setTotalDispatched(target);
                clearInterval(interval);
            } else {
                setTotalDispatched(start);
            }
        }, 20);
        return () => clearInterval(interval);
    }, []);

    return (
        <main className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white pt-24 pb-24">
            <Navbar />

            <div className="max-w-6xl mx-auto px-6 md:px-12 mt-20">

                {/* Hero Concept */}
                <header className="border-b-8 border-black pb-12 mb-20 animate-fadeInUp">
                    <p className="text-[10px] font-black uppercase tracking-[0.8em] text-blue-600 mb-6">{t('about.subtitle')}</p>
                    <h1 className="text-8xl md:text-9xl font-black italic uppercase tracking-tighter leading-none mb-8">{t('about.title')}</h1>
                    <div className="max-w-2xl border-l-4 border-black pl-8">
                        <p className="text-xl font-bold uppercase tracking-widest leading-relaxed opacity-80">
                            {t('about.story')}
                        </p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">

                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-24">

                        <section className="space-y-8 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4">
                                <div className="w-8 h-[2px] bg-black"></div>
                                Technical Durability
                            </h2>
                            <p className="text-sm font-bold uppercase tracking-widest leading-loose opacity-60">
                                Every piece in the Zero Archive undergoes rigorous structural validation. We prioritize high-tenacity materials and reinforced ergonomics to ensure minimal interference with the human kinetic chain.
                            </p>
                        </section>

                        <section className="space-y-8 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4">
                                <div className="w-8 h-[2px] bg-black"></div>
                                Archive Preservation
                            </h2>
                            <p className="text-sm font-bold uppercase tracking-widest leading-loose opacity-60">
                                The archive is not a store. It is a preservation protocol. We release items in limited "System Syncs," focusing on scarcity and the longevity of each prototype within the global network.
                            </p>
                        </section>

                        {/* Simulated Data Feed */}
                        <div className="bg-[#f4f4f4] p-12 relative overflow-hidden group border border-black/5 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                                <Activity size={100} strokeWidth={4} />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] mb-4 opacity-40">System Relay Status</h3>
                            <div className="space-y-2 font-mono text-[9px] uppercase tracking-widest opacity-30">
                                <p>{'>'} ARCHIVE_BOOT_SEQUENCE_INITIALIZED</p>
                                <p>{'>'} RELAY_ACTIVE_MALAYSIA_NODE</p>
                                <p>{'>'} PROTOCOL_V1.1_STABLE</p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Stats */}
                    <aside className="lg:col-span-4 space-y-12 animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
                        <div className="border-t-4 border-black pt-8">
                            <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">{t('about.stats_label')}</h4>
                            <p className="text-6xl font-black italic tracking-tighter leading-none">{totalDispatched}</p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4 group cursor-help">
                                <Shield className="text-blue-600 transition-transform group-hover:scale-125" size={20} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Secure Acquisition</span>
                            </div>
                            <div className="flex items-center gap-4 group cursor-help">
                                <Zap className="text-orange-500 transition-transform group-hover:rotate-12" size={20} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Rapid Sync Dispatch</span>
                            </div>
                            <div className="flex items-center gap-4 group cursor-help">
                                <Box className="text-emerald-500 transition-transform group-hover:-translate-y-1" size={20} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Industrial Packaging</span>
                            </div>
                        </div>

                        <div className="pt-20">
                            <p className="text-[9px] font-bold uppercase tracking-widest opacity-20 italic">
                                "Zero interference. Full potential."
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}
