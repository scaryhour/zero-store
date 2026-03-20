'use client';
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import { Search, Package, Timer, Truck, CheckCircle, AlertTriangle, Copy, Check } from 'lucide-react';

export default function TrackOrderPage() {
    const { t } = useLanguage();
    const [orderId, setOrderId] = useState('');
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderId) return;

        setLoading(true);
        setError('');
        setOrder(null);

        try {
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);

            let query = supabase.from('orders').select('*');
            if (isUuid) {
                query = query.or(`id.eq."${orderId}",track_id.eq."${orderId}"`);
            } else {
                query = query.eq('track_id', orderId);
            }

            const { data, error } = await query.maybeSingle();

            if (error) throw error;
            if (!data) {
                setError(t('track.error_not_found'));
            } else {
                setOrder(data);
            }
        } catch (err: any) {
            setError(t('track.error_tech'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const statusSteps = [
        { label: t('track.status_payment'), icon: Timer, key: 'payment_status', value: 'paid', timeKey: 'created_at' },
        { label: t('track.status_processing'), icon: Package, key: 'status', value: 'processing', timeKey: 'processed_at' },
        { label: t('track.status_shipped'), icon: Truck, key: 'status', value: 'shipped', timeKey: 'shipped_at' },
        { label: t('track.status_delivered'), icon: CheckCircle, key: 'status', value: 'delivered', timeKey: 'delivered_at' }
    ];

    return (
        <main className="min-h-screen bg-white text-black font-sans pb-20">
            <Navbar />

            <div className="pt-40 px-6 md:px-12 max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 text-black">{t('track.title')}</h1>
                    <p className="text-[11px] uppercase tracking-widest text-black/40 font-bold">{t('track.subtitle')}</p>
                </div>

                {/* Search Box */}
                <form onSubmit={handleTrack} className="mb-20 max-w-xl mx-auto">
                    <div className="relative group">
                        <input
                            type="text"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            placeholder={t('track.placeholder')}
                            className="w-full bg-[#f9f9f9] border-2 border-black/5 p-6 text-xs font-black tracking-widest uppercase focus:border-black outline-none transition-all pr-16"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:text-blue-600 transition-colors text-black"
                        >
                            <Search size={20} className={loading ? 'animate-pulse' : ''} />
                        </button>
                    </div>
                    <p className="mt-4 text-[9px] font-bold uppercase tracking-widest text-black/20 text-center leading-none">
                        * Refer to your confirmation telegram or technical report for the ID.
                    </p>
                </form>

                {/* Results */}
                {error && (
                    <div className="bg-red-50 p-8 border-l-4 border-red-500 flex items-center gap-6">
                        <AlertTriangle className="text-red-500" />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-red-500">System Error</p>
                            <p className="text-xs font-bold">{error}</p>
                        </div>
                    </div>
                )}

                {order && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Status Visualizer */}
                        <div className="bg-[#f9f9f9] p-12 border border-black/5">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                {statusSteps.map((step, idx) => {
                                    const isActive = order[step.key] === step.value ||
                                        (step.value === 'processing' && order.payment_status === 'paid');
                                    return (
                                        <div key={idx} className={`flex flex-col items-center gap-4 ${isActive ? 'opacity-100' : 'opacity-10'}`}>
                                            <step.icon size={32} strokeWidth={isActive ? 2.5 : 1} />
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-center">{step.label}</span>
                                                {isActive && order[step.timeKey] && (
                                                    <span className="text-[9px] font-bold text-black opacity-40 mt-1 uppercase tracking-tighter">
                                                        {new Date(order[step.timeKey]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Order Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t-2 border-black pt-12">
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">Archive Manifest</h3>
                                <div className="space-y-4">
                                    {order.cart_items?.map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center text-xs font-bold">
                                            <span>{item.name} {item.size ? `[${item.size}]` : ''} x{item.quantity}</span>
                                            <span>{item.price}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-6 border-t border-black/5 flex justify-between font-black uppercase tracking-widest text-sm">
                                    <span>Total Amount</span>
                                    <span>{order.total_amount} {order.currency}</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">Logistic Node</h3>
                                <div className="text-xs font-bold leading-relaxed space-y-1">
                                    <p className="uppercase">{order.customer_name}</p>
                                    <p className="opacity-60">{order.customer_email}</p>
                                    <p className="opacity-60 mt-4">
                                        {typeof order.shipping_address === 'string'
                                            ? order.shipping_address
                                            : Object.values(order.shipping_address || {}).filter(v => v).join(', ')
                                        }
                                    </p>
                                </div>
                                {order.tracking_number && (
                                    <div className="bg-black text-white p-6 mt-6 flex justify-between items-center group/track">
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Carrier Reference</p>
                                            <p className="text-sm font-black tracking-widest uppercase">{order.tracking_number}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(order.tracking_number!);
                                                setCopied(true);
                                                setTimeout(() => setCopied(false), 2000);
                                            }}
                                            className="p-3 bg-zinc-800 hover:bg-white hover:text-black transition-all rounded opacity-50 group-hover/track:opacity-100"
                                        >
                                            {copied ? <Check size={16} /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>

            <Footer />
        </main>
    );
}
