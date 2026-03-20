'use client';
import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function SupportBubble() {
    return (
        <a
            href="https://wa.me/60123456789" // Suggest replacing with real number
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-8 right-8 z-[90] bg-black text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95 border border-white/10 flex items-center justify-center group"
        >
            <div className="absolute -top-12 right-0 bg-black text-white text-[9px] font-black uppercase tracking-[0.3em] px-4 py-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 pointer-events-none border border-white/10">
                Sync with Support
            </div>
            <MessageCircle size={24} />
        </a>
    );
}
