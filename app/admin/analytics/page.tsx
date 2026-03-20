'use client';
import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Package, Users, ArrowLeft, RefreshCcw, DollarSign, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../../components/AdminSidebar';

interface Stats {
    totalRevenue: string;
    orderCount: number;
    topProducts: Array<{ name: string; count: number; revenue: number }>;
}

export default function AnalyticsDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', session.user.id)
                .single();

            if (!profile?.is_admin) {
                router.push('/');
                return;
            }

            setIsAdmin(true);
        };
        checkAuth();
    }, [router]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/analytics');
            const result = await res.json();
            if (result.success) setStats(result.stats);
        } catch (err) {
            console.error("Fetch analytics failed", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) fetchStats();
    }, [isAdmin]);

    return (
        <div className="min-h-screen bg-[#f8f8f8] text-black font-sans selection:bg-black selection:text-white uppercase">
            <AdminSidebar />

            <main className="ml-64 p-12">
                <div className="max-w-6xl mx-auto">

                    {/* Header */}
                    <header className="flex justify-between items-end mb-16 border-b-4 border-black pb-8">
                        <div>
                            <h1 className="text-5xl font-bold uppercase tracking-tighter leading-tight mb-2">Archival_Intelligence</h1>
                            <div className="flex items-center gap-4 opacity-30 mt-2">
                                <p className="text-[10px] uppercase tracking-widest font-bold italic">Node_01 / Global_Analytics</p>
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            </div>
                        </div>
                        <button onClick={fetchStats} className="p-5 bg-white border border-black/10 hover:border-black transition-all group">
                            <RefreshCcw size={18} className={loading ? 'animate-spin' : 'opacity-40 group-hover:opacity-100'} />
                        </button>
                    </header>

                    {loading ? (
                        <div className="h-96 flex flex-col items-center justify-center gap-4 text-center opacity-20">
                            <div className="w-12 h-[2px] bg-black animate-pulse"></div>
                            <p className="text-[9px] uppercase tracking-widest font-bold italic">Extracting Signal...</p>
                        </div>
                    ) : (
                        <div className="space-y-16">

                            {/* Top Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="bg-white p-12 border border-black/5 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <TrendingUp size={120} strokeWidth={4} />
                                    </div>
                                    <h3 className="text-[10px] font-bold opacity-40 tracking-widest mb-4 italic">Cumulative Acquisition (GMV)</h3>
                                    <p className="text-7xl font-bold tracking-tighter leading-none">RM {stats?.totalRevenue}</p>
                                    <div className="mt-8 flex items-center gap-2 text-emerald-600">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        <span className="text-[9px] font-black tracking-widest">SYSTEM_STABLE_V2.0</span>
                                    </div>
                                </div>

                                <div className="bg-white p-12 border border-black/5 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Package size={120} strokeWidth={4} />
                                    </div>
                                    <h3 className="text-[10px] font-bold opacity-40 tracking-widest mb-4 italic">Total Orders Logged</h3>
                                    <p className="text-7xl font-bold tracking-tighter leading-none">{stats?.orderCount}</p>
                                    <p className="text-[9px] font-black mt-8 opacity-20 tracking-widest">ENCRYPTED_TRANSACTION_NODES</p>
                                </div>
                            </div>

                            {/* Top Products Table */}
                            <section>
                                <h2 className="text-[12px] font-black tracking-[0.4em] mb-10 border-b border-black pb-4 flex items-center gap-4">
                                    <BarChart3 size={16} />
                                    Top_Performing_Pieces
                                </h2>

                                <div className="bg-white border border-black/5 overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-black/5 text-[9px] font-black opacity-40">
                                                <th className="p-8 tracking-widest uppercase">Archive_Name</th>
                                                <th className="p-8 tracking-widest uppercase text-center">Acquisitions</th>
                                                <th className="p-8 tracking-widest uppercase text-right">Yield (Revenue)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-black/[0.03]">
                                            {stats?.topProducts.map((p, i) => (
                                                <tr key={i} className="group hover:bg-[#fcfcfc] transition-colors">
                                                    <td className="p-8 font-bold tracking-tight text-base italic">{p.name}</td>
                                                    <td className="p-8 font-bold text-sm text-center">{p.count} UNITS</td>
                                                    <td className="p-8 font-bold text-base text-right italic text-emerald-600">RM {p.revenue.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
