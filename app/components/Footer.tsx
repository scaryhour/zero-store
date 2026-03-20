'use client';
import React from 'react';
import Link from 'next/link';
import { Instagram, Twitter, MessageCircle, Zap, ShieldCheck, Globe, Send } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '@/lib/supabase';

export default function Footer() {
    const { t } = useLanguage();
    const [email, setEmail] = React.useState('');
    const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [isAdmin, setIsAdmin] = React.useState(false);

    React.useEffect(() => {
        const checkAdmin = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', session.user.id).single();
                if (profile?.is_admin) setIsAdmin(true);
            }
        };
        checkAdmin();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session) {
                const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', session.user.id).single();
                setIsAdmin(!!profile?.is_admin);
            } else {
                setIsAdmin(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

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
        <footer className="bg-white text-black border-t border-black/10 pt-16 pb-12 font-sans selection:bg-black selection:text-white">
            <div className="max-w-[1800px] mx-auto px-6 md:px-12">

                {/* Upper Section: Newsletter */}
                <div className="border-b border-black/5 pb-16 mb-16 flex flex-col md:flex-row justify-between items-start gap-12">
                    <div className="max-w-md">
                        <h3 className="text-xl font-black uppercase tracking-tighter mb-2">{t('footer.newsletter_title')}</h3>
                        <p className="text-sm font-bold text-black/40">{t('footer.newsletter_subtitle')}</p>
                    </div>
                    <form onSubmit={handleSubmit} className="w-full max-w-xl flex gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t('footer.newsletter_placeholder')}
                                disabled={status === 'loading' || status === 'success'}
                                className="w-full border border-black/20 px-6 py-4 text-sm font-bold outline-none focus:border-black transition-all"
                            />
                            {status === 'success' && <p className="absolute -bottom-6 left-0 text-[10px] font-bold text-emerald-600 uppercase">{t('footer.newsletter_success')}</p>}
                        </div>
                        <button
                            type="submit"
                            disabled={status === 'loading' || status === 'success'}
                            className="bg-black text-white px-10 py-4 text-sm font-black uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:bg-black/20"
                        >
                            {status === 'loading' ? '...' : t('cart.apply')}
                        </button>
                    </form>
                </div>

                {/* Middle Section: Main Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">

                    {/* Shopping */}
                    <div>
                        <h4 className="text-lg font-black uppercase tracking-tight mb-8">{t('footer.shopping_title')}</h4>
                        <ul className="space-y-4 text-sm font-bold text-black/60">
                            <li><Link href="/" className="hover:text-black transition-colors">{t('footer.all_collections')}</Link></li>
                            <li><Link href="/track" className="hover:text-black transition-colors">{t('track.title')}</Link></li>
                            <li><Link href="/wishlist" className="hover:text-black transition-colors">{t('wishlist.title')}</Link></li>
                            {isAdmin && <li><Link href="/admin/dashboard" className="text-black/20 hover:text-black transition-colors uppercase font-black">Terminal Sync [Admin]</Link></li>}
                        </ul>
                    </div>

                    {/* Customer Care */}
                    <div>
                        <h4 className="text-lg font-black uppercase tracking-tight mb-8">{t('footer.navigation')}</h4>
                        <ul className="space-y-4 text-sm font-bold text-black/60">
                            <li><Link href="/policies/shipping" className="hover:text-black transition-colors">Shipping Info</Link></li>
                            <li><Link href="/policies/refund" className="hover:text-black transition-colors">Returns & Refunds</Link></li>
                            <li><Link href="/support" className="hover:text-black transition-colors">Help & Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* About Us */}
                    <div>
                        <h4 className="text-lg font-black uppercase tracking-tight mb-8">Zero Store</h4>
                        <ul className="space-y-4 text-sm font-bold text-black/60">
                            <li><Link href="/about" className="hover:text-black transition-colors">{t('nav.story')}</Link></li>
                            <li><Link href="/policies/privacy" className="hover:text-black transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/policies/terms" className="hover:text-black transition-colors">Terms & Conditions</Link></li>
                        </ul>
                    </div>

                    {/* Regional & Payments */}
                    <div className="flex flex-col gap-10">
                        <div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-black/40 mb-4">{t('footer.country_label')}</h4>
                            <div className="border border-black/10 px-6 py-3 flex items-center justify-between group cursor-pointer hover:border-black transition-all">
                                <div className="flex items-center gap-3">
                                    <Globe size={16} />
                                    <span className="text-sm font-bold">Malaysia</span>
                                </div>
                                <ChevronDown size={14} className="opacity-40" />
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-black/40 mb-6">{t('footer.payment_label')}</h4>
                            <div className="flex flex-wrap gap-4 opacity-100 grayscale hover:grayscale-0 transition-all duration-500">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6" alt="Mastercard" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-5" alt="PayPal" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" className="h-5" alt="Apple Pay" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="pt-12 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-[10px] font-bold text-black/40">
                        Copyright © 2026 All rights reserved Zero Store.
                    </p>
                    <div className="flex items-center gap-8">
                        <span className="text-[10px] font-black uppercase tracking-widest mr-4">{t('footer.follow_us')}</span>
                        <a href="https://facebook.com" className="hover:scale-110 transition-transform"><Facebook size={18} /></a>
                        <a href="https://instagram.com" className="hover:scale-110 transition-transform"><Instagram size={18} /></a>
                        <a href="https://twitter.com" className="hover:scale-110 transition-transform"><Twitter size={18} /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

// Helper icon component since ChevronDown wasn't imported
const ChevronDown = ({ size, className }: { size: number, className: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m6 9 6 6 6-6" />
    </svg>
);

const Facebook = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
);
