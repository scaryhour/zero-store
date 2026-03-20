'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, BarChart3, Zap, LogOut, ShieldCheck, LayoutDashboard, Truck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const menuItems = [
        {
            name: 'Inventory',
            path: '/admin/dashboard',
            icon: <Package size={18} />,
            subtitle: 'Archive Management'
        },
        {
            name: 'Analytics',
            path: '/admin/analytics',
            icon: <BarChart3 size={18} />,
            subtitle: 'Archival Intelligence'
        },
        {
            name: 'Logistics',
            path: '/admin/orders',
            icon: <Truck size={18} />,
            subtitle: 'Shipment_Control'
        },
        {
            name: 'Live Store',
            path: '/',
            icon: <Zap size={18} />,
            subtitle: 'Node_View'
        }
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r-4 border-black flex flex-col z-50">
            {/* Logo Section */}
            <div className="p-8 border-b border-black/10">
                <div className="flex items-center gap-3 mb-2">
                    <ShieldCheck size={24} strokeWidth={2.5} />
                    <h1 className="text-xl font-black uppercase tracking-tighter">Zero Command</h1>
                </div>
                <p className="text-[8px] font-bold uppercase tracking-[0.4em] opacity-30">Administrative_Layer_V2</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 mt-8">
                {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.name}
                            href={item.path}
                            className={`group flex items-center gap-4 p-4 transition-all duration-300 ${isActive ? 'bg-black text-white' : 'text-black/40 hover:bg-zinc-100 hover:text-black'}`}
                        >
                            <div className={`${isActive ? 'text-white' : 'text-black opacity-30 group-hover:opacity-100 transition-opacity'}`}>
                                {item.icon}
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest leading-none">{item.name}</p>
                                <p className={`text-[7px] font-bold uppercase tracking-widest mt-1 opacity-40 ${isActive ? 'text-white/60' : ''}`}>{item.subtitle}</p>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-black/10">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 p-4 text-red-500 hover:bg-red-50/50 transition-all group"
                >
                    <LogOut size={18} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest leading-none text-left">Logout</p>
                        <p className="text-[7px] font-bold uppercase tracking-widest mt-1 opacity-40 text-left text-zinc-400">Signal_End_Session</p>
                    </div>
                </button>
            </div>
        </aside>
    );
}
