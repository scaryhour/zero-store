'use client';
import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Calendar, Hash, RefreshCcw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Coupon {
    id: string;
    code: string;
    discount_percent: number;
    is_active: boolean;
    used_count: number;
    expiry_date?: string;
    created_at: string;
}

export default function CouponCommand() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    // Form State
    const [newCode, setNewCode] = useState('');
    const [discount, setDiscount] = useState('10');
    const [expiry, setExpiry] = useState('');

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/get-coupons');
            const result = await res.json();
            if (result.success) setCoupons(result.data);
        } catch (err) {
            console.error("Fetch coupons failed", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const generateRandomCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No O, 0, I, 1 for clarity
        let result = 'ARCHIVE-';
        for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setNewCode(result);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCode || !discount) return;

        setIsGenerating(true);
        try {
            const payload = {
                code: newCode.toUpperCase(),
                discount_percent: parseInt(discount),
                is_active: true,
                expiry_date: expiry || null
            };

            const res = await fetch('/api/admin/save-coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ coupon: payload }),
            });

            const result = await res.json();
            if (result.success) {
                fetchCoupons();
                setNewCode('');
                setExpiry('');
            } else {
                alert("Operation Failed: " + result.error);
            }
        } catch (err) {
            console.error("Save coupon failed", err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Decommission this access code?')) return;
        try {
            const res = await fetch('/api/admin/delete-coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            const result = await res.json();
            if (result.success) fetchCoupons();
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    return (
        <div className="min-h-screen bg-[#f4f4f4] text-black p-8 md:p-12 font-sans selection:bg-black selection:text-white">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <header className="flex justify-between items-end mb-16 border-b-4 border-black pb-8">
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <Link href="/admin/dashboard" className="p-2 bg-black text-white hover:bg-emerald-600 transition-colors">
                                <ArrowLeft size={16} />
                            </Link>
                            <h1 className="text-5xl font-black italic uppercase tracking-tighter">Coupon Command</h1>
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.5em] opacity-30 font-bold ml-12">Promotion Matrix / System 1.1</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                    {/* Generator UI (40%) */}
                    <section className="lg:col-span-5">
                        <div className="bg-white p-8 border border-black/10 shadow-sm sticky top-12">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] mb-8 border-b border-black pb-4 flex items-center gap-3">
                                <Plus size={14} strokeWidth={3} />
                                Generate Protocol
                            </h2>

                            <form onSubmit={handleSave} className="space-y-6">
                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-2 block">Access Code</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="E.G. SUMMER20"
                                            value={newCode}
                                            onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                                            className="flex-1 bg-zinc-100 p-4 text-xs font-black uppercase tracking-widest border-2 border-transparent focus:border-black outline-none transition-all"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={generateRandomCode}
                                            className="bg-zinc-200 p-4 hover:bg-black hover:text-white transition-all group"
                                            title="Randomize"
                                        >
                                            <RefreshCcw size={16} className="group-active:rotate-180 transition-transform duration-500" />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-2 block">Discount Yield (%)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={discount}
                                        onChange={(e) => setDiscount(e.target.value)}
                                        className="w-full bg-zinc-100 p-4 text-xs font-black tracking-widest border-2 border-transparent focus:border-black outline-none transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-2 block">Expiry Protocol (Optional)</label>
                                    <input
                                        type="date"
                                        value={expiry}
                                        onChange={(e) => setExpiry(e.target.value)}
                                        className="w-full bg-zinc-100 p-4 text-xs font-black uppercase border-2 border-transparent focus:border-black outline-none transition-all"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isGenerating}
                                    className={`w-full py-6 text-[10px] font-black uppercase tracking-[0.5em] transition-all border-2 border-black ${isGenerating ? 'bg-zinc-100 text-zinc-400' : 'bg-black text-white hover:bg-white hover:text-black'}`}
                                >
                                    {isGenerating ? 'TRANSMITTING...' : 'INITIALIZE CODE'}
                                </button>
                            </form>
                        </div>
                    </section>

                    {/* Active Matrix (60%) */}
                    <section className="lg:col-span-7">
                        <div className="flex justify-between items-center mb-10 border-b border-black pb-4">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em]">Active Matrix</h2>
                            <span className="text-[10px] font-bold opacity-30 uppercase">{coupons.length} Protocols Loaded</span>
                        </div>

                        <div className="space-y-4">
                            {loading ? (
                                <div className="p-20 text-center opacity-20 italic font-black uppercase tracking-[1em] animate-pulse">Syncing...</div>
                            ) : coupons.length === 0 ? (
                                <div className="p-20 text-center border-2 border-dashed border-black/5 opacity-30">
                                    <p className="text-[10px] font-black uppercase tracking-[0.5em]">No Active Protocols</p>
                                </div>
                            ) : (
                                coupons.map((c) => (
                                    <div key={c.id} className="bg-white p-6 border border-black/5 hover:border-black transition-all group flex justify-between items-center">
                                        <div className="flex items-center gap-8">
                                            <div className="w-12 h-12 bg-black flex items-center justify-center text-white shrink-0">
                                                <Tag size={18} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-sm font-black uppercase tracking-widest">{c.code}</h3>
                                                    <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black px-2 py-0.5 uppercase">-{c.discount_percent}%</span>
                                                </div>
                                                <div className="flex gap-4 mt-2">
                                                    <div className="flex items-center gap-1.5 opacity-40">
                                                        <Hash size={10} />
                                                        <span className="text-[9px] font-bold">USED: {c.used_count || 0}</span>
                                                    </div>
                                                    {c.expiry_date && (
                                                        <div className="flex items-center gap-1.5 text-red-500/60">
                                                            <Calendar size={10} />
                                                            <span className="text-[9px] font-bold uppercase">EXP: {new Date(c.expiry_date).toLocaleDateString()}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(c.id)}
                                            className="text-red-500 opacity-0 group-hover:opacity-100 p-4 hover:bg-red-500 hover:text-white transition-all transition-opacity"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
