'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Truck, Package, Search, Filter, RefreshCcw, Timer, CheckCircle, ExternalLink, Ship, Copy, Check } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';

interface Order {
    id: string;
    track_id: string;
    customer_name: string;
    customer_email: string;
    amount_total: number;
    currency: string;
    status: string;
    items: any[];
    shipping_address: any;
    tracking_number?: string;
    created_at: string;
    processed_at?: string;
    shipped_at?: string;
    delivered_at?: string;
}

export default function AdminOrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

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
                alert("ACCESS_DENIED: ADMINISTRATIVE_PRIVILEGES_REQUIRED");
                router.push('/');
                return;
            }

            setIsAdmin(true);
            setAuthLoading(false);
        };
        checkAuth();
    }, [router]);

    const fetchOrders = async () => {
        setLoading(true);
        const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (data) setOrders(data);
        setLoading(false);
    };

    useEffect(() => {
        if (isAdmin) fetchOrders();
    }, [isAdmin]);

    const updateOrderStatus = async (orderId: string, status: string, trackingNumber?: string) => {
        setUpdatingId(orderId);
        try {
            const res = await fetch('/api/admin/update-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, status, trackingNumber }),
            });
            const data = await res.json();
            if (data.success) {
                fetchOrders();
            } else {
                alert("Update Failed: " + data.error);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setUpdatingId(null);
        }
    };

    if (authLoading) return (
        <div className="min-h-screen bg-black text-emerald-500 font-mono flex items-center justify-center p-12 text-center uppercase tracking-[0.5em]">
            {'>'} SYSTEM_AUTH_VALIDATION_IN_PROGRESS...
        </div>
    );

    const filteredOrders = orders.filter(o =>
        o.track_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#f8f8f8] text-black font-sans selection:bg-black selection:text-white">
            <AdminSidebar />

            <main className="ml-64 p-12">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <header className="flex justify-between items-end mb-16 border-b-4 border-black pb-8">
                        <div>
                            <h1 className="text-5xl font-bold uppercase tracking-tighter leading-tight mb-2">Logistics_Command</h1>
                            <div className="flex items-center gap-4 opacity-30">
                                <p className="text-[10px] uppercase tracking-widest font-bold italic">Node_01 / Global_Shipments</p>
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Protocol_Live</span>
                            </div>
                        </div>
                        <button
                            onClick={fetchOrders}
                            className="px-10 py-5 bg-black text-white hover:bg-emerald-600 transition-all text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-4 ring-offset-4 active:ring-2 ring-black"
                        >
                            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} /> Sync_Order_Buffer
                        </button>
                    </header>

                    {/* Search Bar */}
                    <div className="mb-12 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity" size={18} />
                        <input
                            type="text"
                            placeholder="SEARCH_MANIFEST_BY_TRACK_ID_OR_NAME..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-black/5 p-6 pl-16 text-[10px] font-black tracking-widest uppercase focus:border-black outline-none transition-all"
                        />
                    </div>

                    {/* Orders List */}
                    <div className="space-y-4">
                        {loading && orders.length === 0 ? (
                            <div className="h-40 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-black/5 bg-white">
                                <div className="w-8 h-1 bg-black animate-pulse" />
                            </div>
                        ) : filteredOrders.length === 0 ? (
                            <div className="h-40 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-black/5 bg-white">
                                <p className="text-[10px] uppercase font-black opacity-20 tracking-widest">Empty_Logistics_Node</p>
                            </div>
                        ) : filteredOrders.map(order => (
                            <div key={order.id} className="bg-white border border-black/5 hover:border-black transition-all p-8 flex flex-col gap-8 group">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-4 mb-4">
                                            <span className="text-[9px] font-black px-3 py-1 bg-black text-white uppercase tracking-widest italic">{order.track_id || order.id.substring(0, 8)}</span>
                                            <span className={`text-[8px] font-black px-2 py-0.5 uppercase tracking-widest border ${order.status === 'delivered' ? 'bg-emerald-50 border-emerald-500 text-emerald-600' :
                                                order.status === 'shipped' ? 'bg-blue-50 border-blue-500 text-blue-600' :
                                                    'bg-zinc-50 border-black/10 text-black/50'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold uppercase tracking-tighter">{order.customer_name}</h3>
                                        <p className="text-[10px] font-bold opacity-30 mt-1 uppercase tracking-widest">{order.customer_email}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 mb-2">Total Valuation</p>
                                        <p className="text-2xl font-black italic">{order.amount_total} {order.currency}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-black/5">
                                    {/* Items Summary */}
                                    <div className="space-y-4">
                                        <p className="text-[8px] font-black uppercase tracking-widest opacity-30">Archive Manifest</p>
                                        <div className="space-y-2">
                                            {order.items?.map((item: any, idx: number) => (
                                                <div key={idx} className="text-[10px] font-bold italic flex justify-between">
                                                    <span>{item.name} {item.selectedSize ? `[${item.selectedSize}]` : ''} x{item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Shipment Status Control */}
                                    <div className="space-y-4">
                                        <p className="text-[8px] font-black uppercase tracking-widest opacity-30">Status Control</p>
                                        <div className="flex gap-2">
                                            {[
                                                { val: 'processing', icon: Timer, time: order.processed_at },
                                                { val: 'shipped', icon: Truck, time: order.shipped_at },
                                                { val: 'delivered', icon: CheckCircle, time: order.delivered_at }
                                            ].map(s => (
                                                <div key={s.val} className="flex-1 flex flex-col gap-1">
                                                    <button
                                                        onClick={() => updateOrderStatus(order.id, s.val)}
                                                        disabled={updatingId === order.id}
                                                        className={`w-full p-3 border flex flex-col items-center gap-2 transition-all ${order.status === s.val ? 'bg-black text-white border-black' : 'bg-zinc-50 border-black/5 hover:border-black text-black/40 hover:text-black'
                                                            }`}
                                                    >
                                                        <s.icon size={16} strokeWidth={order.status === s.val ? 3 : 1.5} />
                                                        <span className="text-[7px] font-black uppercase">{s.val}</span>
                                                    </button>
                                                    {s.time && (
                                                        <span className="text-[6px] font-bold text-center opacity-30 uppercase tracking-tighter">
                                                            {new Date(s.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Tracking Number Injection */}
                                    <div className="space-y-4">
                                        <p className="text-[8px] font-black uppercase tracking-widest opacity-30">Logistics Reference</p>
                                        <div className="relative group/input">
                                            <input
                                                type="text"
                                                placeholder="TRACKING_NUMBER..."
                                                defaultValue={order.tracking_number}
                                                onBlur={(e) => {
                                                    if (e.target.value !== order.tracking_number) {
                                                        updateOrderStatus(order.id, order.status, e.target.value);
                                                    }
                                                }}
                                                className="w-full bg-[#f9f9f9] border border-black/5 p-4 pr-12 text-[10px] font-black tracking-widest uppercase focus:border-black outline-none transition-all"
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                                {order.tracking_number && (
                                                    <button
                                                        onClick={() => copyToClipboard(order.tracking_number!, order.id)}
                                                        className="p-2 hover:bg-black hover:text-white transition-all rounded opacity-0 group-hover/input:opacity-100"
                                                    >
                                                        {copiedId === order.id ? <Check size={12} /> : <Copy size={12} />}
                                                    </button>
                                                )}
                                                <Package size={14} className="opacity-20" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
