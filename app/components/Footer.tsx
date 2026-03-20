'use client';
import React from 'react';
import Link from 'next/link';
import { Instagram, Twitter, MessageCircle, Zap, ShieldCheck, Globe, Send } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
    const { t } = useLanguage();
    const [email, setEmail] = React.useState('');
    const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setStatus('loading');
        try {
            const res = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (res.ok) {
                setStatus('success');
                setEmail('');
            } else {
                setStatus('error');
            }
        } catch (err) {
            setStatus('error');
        }
    };
    return (
        <footer className="bg-black text-white pt-24 pb-12 px-6 md:px-12 font-sans overflow-hidden">
            <div className="max-w-[1800px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">

                    {/* Brand Identity */}
                    <div className="space-y-8">
                        <div className="flex flex-col">
                            <span className="text-3xl font-bold tracking-tight uppercase leading-none">Zero Store</span>
                            <span className="text-[8px] font-bold uppercase tracking-widest opacity-40 mt-2">Archive Collection / 2026</span>
                        </div>
                        <p className="text-xs font-bold leading-relaxed opacity-60 max-w-xs">
                            Engineered for industrial survival. Wearable architecture designed to withstand technical interference and aesthetic decay.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-zinc-900 hover:bg-white hover:text-black transition-all rounded-full group">
                                <Instagram size={16} />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-zinc-900 hover:bg-white hover:text-black transition-all rounded-full group">
                                <Twitter size={16} />
                            </a>
                            <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="p-3 bg-zinc-900 hover:bg-white hover:text-black transition-all rounded-full group">
                                <MessageCircle size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Navigation Nodes */}
                    <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] mb-10 opacity-30">{t('footer.navigation')}</h4>
                        <ul className="space-y-4 text-xs font-bold uppercase">
                            <li><Link href="/" className="hover:text-blue-500 transition-colors uppercase">{t('nav.collections')}</Link></li>
                            <li><Link href="/?search=apparel" className="hover:text-blue-500 transition-colors uppercase">{t('nav.apparel')}</Link></li>
                            <li><Link href="/?search=footwear" className="hover:text-blue-500 transition-colors uppercase">{t('nav.footwear')}</Link></li>
                            <li><Link href="/about" className="hover:text-blue-500 transition-colors uppercase">{t('nav.story')}</Link></li>
                            <li><Link href="/track" className="hover:text-blue-500 transition-colors uppercase italic">{t('nav.track')}</Link></li>
                        </ul>
                    </div>

                    {/* Legal Protocol */}
                    <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] mb-10 opacity-30">{t('footer.legal')}</h4>
                        <ul className="space-y-4 text-xs font-bold uppercase">
                            <li><Link href="/policies/refund" className="hover:text-red-500 transition-colors uppercase underline decoration-zinc-800 underline-offset-4">Refund Policy</Link></li>
                            <li><Link href="/policies/shipping" className="hover:text-red-500 transition-colors uppercase underline decoration-zinc-800 underline-offset-4">Shipping Info</Link></li>
                            <li><Link href="/policies/privacy" className="hover:text-red-500 transition-colors uppercase underline decoration-zinc-800 underline-offset-4">Privacy Terms</Link></li>
                            <li><Link href="/admin/dashboard" className="opacity-20 hover:opacity-100 transition-opacity uppercase">Terminal Sync [Admin]</Link></li>
                        </ul>
                    </div>

                    {/* System Status & Newsletter */}
                    <div className="space-y-12">
                        <div className="bg-zinc-900 p-8 border border-white/5 relative">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-30">{t('footer.newsletter')}</h4>
                            <form onSubmit={handleSubmit} className="relative group">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('footer.newsletter_placeholder')}
                                    disabled={status === 'loading' || status === 'success'}
                                    className="w-full bg-black border-b border-white/20 p-2 text-[10px] font-black tracking-widest outline-none focus:border-blue-500 transition-all disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={status === 'loading' || status === 'success'}
                                    className="absolute right-0 bottom-2 text-white/40 hover:text-white transition-colors"
                                >
                                    {status === 'loading' ? <div className="animate-spin w-3 h-3 border-2 border-white/20 border-t-white rounded-full" /> : <Send size={14} />}
                                </button>
                            </form>
                            {status === 'success' && <p className="text-[8px] font-black uppercase text-emerald-500 mt-4 tracking-widest">{t('footer.newsletter_success')}</p>}
                            {status === 'error' && <p className="text-[8px] font-black uppercase text-red-500 mt-4 tracking-widest">{t('footer.newsletter_error')}</p>}
                        </div>

                        <div className="bg-zinc-900/50 p-8 border border-white/5 relative">
                            <div className="absolute top-2 right-2 flex gap-1">
                                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse delay-75" />
                            </div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-6">{t('footer.status')}</h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Globe size={14} className="opacity-40" />
                                    <span className="text-[10px] font-black uppercase">{t('footer.logistics_status')}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <ShieldCheck size={14} className="opacity-40" />
                                    <span className="text-[10px] font-black uppercase">{t('footer.encryption_status')}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Zap size={14} className="opacity-40" />
                                    <span className="text-[10px] font-black uppercase">{t('footer.uptime_status')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30">
                        &copy; 2026 ZERO-SYSTEM ARCHIVE. ALL RIGHTS RESERVED.
                    </p>
                    <div className="flex gap-8">
                        <span className="text-[8vw] font-black italic opacity-5 select-none pointer-events-none tracking-tighter">ZERO-PROTOCOL</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
