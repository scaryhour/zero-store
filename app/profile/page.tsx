'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/navigation';
import { User, Package, LogOut, ChevronRight, Activity, ShieldCheck, Box } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Order {
    id: string;
    created_at: string;
    total: string;
    status: string;
    items: any[];
}

export default function ProfilePage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [user, setUser] = useState<any>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }
            setUser(session.user);

            // Fetch user's orders
            const { data: orderData } = await supabase
                .from('orders')
                .select('*')
                .eq('customer_email', session.user.email)
                .order('created_at', { ascending: false });

            if (orderData) setOrders(orderData);
            setLoading(false);
        };
        checkUser();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center font-bold uppercase tracking-widest animate-pulse">
            SYNCING_IDENTITY...
        </div>
    );

    return (
        <main className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white pt-24 pb-24">
            <Navbar />

            <div className="max-w-6xl mx-auto px-6 md:px-12 mt-20">

                {/* Profile Header */}
                <header className="flex flex-col md:flex-row justify-between items-end mb-20 border-b-8 border-black pb-12 gap-12 animate-fadeInUp">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-4">{t('profile.subtitle')}</p>
                        <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tight leading-tight">{t('profile.title')}</h1>
                        <div className="mt-6 flex items-center gap-4">
                            <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold">
                                {user?.email?.substring(0, 1).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase">{user?.email}</p>
                                <p className="text-[8px] font-bold opacity-30 uppercase tracking-widest">Authorized Collector Session</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-8 py-4 bg-zinc-100 hover:bg-black hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest group"
                    >
                        <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                        {t('profile.logout')}
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">

                    {/* Main: Order History */}
                    <div className="lg:col-span-8 space-y-12">
                        <h2 className="text-2xl font-bold uppercase tracking-tight border-b border-black pb-4 flex items-center gap-4">
                            <Box size={24} />
                            {t('profile.history_title')}
                        </h2>

                        {orders.length === 0 ? (
                            <div className="p-20 bg-[#f4f4f4] text-center border border-black/5 animate-fadeInUp">
                                <Package size={48} className="mx-auto opacity-10 mb-6" />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 italic">{t('profile.no_orders')}</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {orders.map((order, idx) => (
                                    <div
                                        key={order.id}
                                        className="bg-white border border-black/10 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 group hover:border-blue-600 transition-all animate-fadeInUp"
                                        style={{ animationDelay: `${idx * 0.1 + 0.3}s` }}
                                    >
                                        <div className="space-y-2">
                                            <p className="text-[8px] font-bold uppercase tracking-widest opacity-30">Archive Entry ID: {order.id.substring(0, 8)}</p>
                                            <h3 className="text-lg font-bold uppercase tracking-tight leading-none">
                                                {order.items.length} {order.items.length > 1 ? 'Archive Units' : 'Archive Unit'} Secured
                                            </h3>
                                            <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString()}</p>
                                        </div>

                                        <div className="flex items-center gap-12 w-full md:w-auto">
                                            <div className="text-right">
                                                <p className="text-[8px] font-black uppercase tracking-widest opacity-30 mb-1">Acquisition Yield</p>
                                                <p className="text-xl font-black italic">{order.total}</p>
                                            </div>
                                            <div className="flex-1 md:flex-none">
                                                <div className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest text-center ${order.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                                                    {order.status}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar: System Stats */}
                    <aside className="lg:col-span-4 space-y-10 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                        <div className="bg-black text-white p-10 space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                                <Activity size={80} strokeWidth={4} />
                            </div>
                            <div>
                                <h4 className="text-[9px] font-bold uppercase tracking-widest opacity-40 mb-2">{t('profile.stats_orders')}</h4>
                                <p className="text-5xl font-bold tracking-tight leading-none">{orders.length}</p>
                            </div>
                            <div className="pt-10 flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.4em]">
                                <ShieldCheck size={16} className="text-emerald-500" />
                                Archive Verified
                            </div>
                        </div>

                        <div className="p-8 border border-black/5 bg-[#fcfcfc] space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">Collector Meta</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                    <span className="opacity-40">System Role</span>
                                    <span>Level 01 Collector</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                    <span className="opacity-40">Data Node</span>
                                    <span>MY_HUB_01</span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}
