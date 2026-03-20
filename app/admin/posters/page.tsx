'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Image as ImageIcon, Plus, Trash2, CheckCircle2, XCircle } from 'lucide-react';

interface Poster {
    id: string;
    title: string;
    subtitle: string;
    image_url: string;
    link_url: string;
    is_active: boolean;
    created_at: string;
}

export default function PostersDashboard() {
    const [posters, setPosters] = useState<Poster[]>([]);
    const [loading, setLoading] = useState(true);
    const [newPoster, setNewPoster] = useState({ title: '', subtitle: '', image_url: '', link_url: '' });

    const fetchPosters = async () => {
        const { data } = await supabase.from('posters').select('*').order('created_at', { ascending: false });
        if (data) setPosters(data);
        setLoading(false);
    };

    useEffect(() => { fetchPosters(); }, []);

    const addPoster = async () => {
        if (!newPoster.title || !newPoster.image_url) return alert("Title and Image URL required.");
        const { error } = await supabase.from('posters').insert([newPoster]);
        if (!error) {
            setNewPoster({ title: '', subtitle: '', image_url: '', link_url: '' });
            fetchPosters();
        }
    };

    const toggleStatus = async (id: string, current: boolean) => {
        await supabase.from('posters').update({ is_active: !current }).eq('id', id);
        fetchPosters();
    };

    const deletePoster = async (id: string) => {
        if (confirm("Decommission this visual?")) {
            await supabase.from('posters').delete().eq('id', id);
            fetchPosters();
        }
    };

    return (
        <div className="min-h-screen bg-[#f4f4f4] text-black p-8 md:p-12 font-sans">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-end mb-16 border-b-4 border-black pb-8">
                    <div>
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter">Visual Override</h1>
                        <p className="text-[10px] uppercase tracking-[0.5em] opacity-30 mt-2 font-bold">Terminal / Hero Management</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Form Side */}
                    <div className="lg:col-span-4">
                        <div className="bg-white p-8 border border-black shadow-sm space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest border-b border-black/5 pb-4">New Transmission</h3>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black uppercase opacity-40">Primary Heading</p>
                                    <input
                                        className="w-full bg-[#f9f9f9] border border-black/5 p-3 text-xs font-bold focus:border-black outline-none"
                                        placeholder="ENTER TITLE..."
                                        value={newPoster.title}
                                        onChange={(e) => setNewPoster({ ...newPoster, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black uppercase opacity-40">Secondary Data</p>
                                    <input
                                        className="w-full bg-[#f9f9f9] border border-black/5 p-3 text-xs font-bold focus:border-black outline-none"
                                        placeholder="ENTER SUBTITLE..."
                                        value={newPoster.subtitle}
                                        onChange={(e) => setNewPoster({ ...newPoster, subtitle: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black uppercase opacity-40">Resource URL (Visual)</p>
                                    <input
                                        className="w-full bg-[#f9f9f9] border border-black/5 p-3 text-xs font-bold focus:border-black outline-none"
                                        placeholder="HTTPS://IMAGE-HOST.COM/..."
                                        value={newPoster.image_url}
                                        onChange={(e) => setNewPoster({ ...newPoster, image_url: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black uppercase opacity-40">Redirect Path</p>
                                    <input
                                        className="w-full bg-[#f9f9f9] border border-black/5 p-3 text-xs font-bold focus:border-black outline-none"
                                        placeholder="/category/tops"
                                        value={newPoster.link_url}
                                        onChange={(e) => setNewPoster({ ...newPoster, link_url: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={addPoster}
                                className="w-full py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black border border-black transition-all flex items-center justify-center gap-3"
                            >
                                <Plus size={14} /> Deploy Visual
                            </button>
                        </div>
                    </div>

                    {/* List Side */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex justify-between items-center border-b border-black pb-4">
                            <h3 className="text-[10px] font-black uppercase tracking-widest">Active Overlays</h3>
                            <span className="text-[10px] font-bold opacity-30 uppercase">{posters.length} Channels</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {posters.map(poster => (
                                <div key={poster.id} className="bg-white border border-black group overflow-hidden">
                                    <div className="aspect-video bg-zinc-100 overflow-hidden relative">
                                        <img src={poster.image_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-[1s]" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                            <button onClick={() => toggleStatus(poster.id, poster.is_active)} className="bg-white p-2 hover:bg-emerald-500 hover:text-white transition-all">
                                                {poster.is_active ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                                            </button>
                                            <button onClick={() => deletePoster(poster.id)} className="bg-white p-2 hover:bg-red-500 hover:text-white transition-all">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        {!poster.is_active && (
                                            <div className="absolute top-2 right-2 bg-red-600 text-white text-[7px] font-black px-2 py-0.5 uppercase tracking-widest">Off-Line</div>
                                        )}
                                    </div>
                                    <div className="p-4 flex flex-col justify-between">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-tighter italic">{poster.title}</p>
                                            <p className="text-[8px] font-bold opacity-30 uppercase mt-1 tracking-widest leading-none">{poster.subtitle}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {posters.length === 0 && (
                            <div className="p-16 border-2 border-dashed border-black/10 text-center">
                                <p className="text-[10px] font-black uppercase opacity-20 tracking-[0.5em]">No Visual Signals Detected</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-20">
                    <a href="/admin/dashboard" className="text-[10px] font-black uppercase tracking-widest border border-black px-6 py-3 hover:bg-black hover:text-white transition-all">Back to Command Center</a>
                </div>
            </div>
        </div>
    );
}
