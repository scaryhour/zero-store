'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, UserPlus, LogIn, Loader2, Phone, User as UserIcon, Globe, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function LoginPage() {
    const router = useRouter();
    const { t } = useLanguage();

    // Registration States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [countryCode, setCountryCode] = useState('+60');
    const [phone, setPhone] = useState('');
    const [givenName, setGivenName] = useState('');
    const [familyName, setFamilyName] = useState('');

    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                if (password !== confirmPassword) throw new Error("Passwords do not match");
                const fullName = `${givenName} ${familyName}`.trim();
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
                        data: {
                            full_name: fullName || email.split('@')[0],
                            phone: `${countryCode} ${phone}`
                        }
                    }
                });
                if (error) throw error;
                alert("Verification link sent to your email.");
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                router.push('/');
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined }
        });
        if (error) setError(error.message);
    };

    return (
        <main className="min-h-screen bg-white flex overflow-hidden">
            <Navbar className="fixed top-0 left-0 right-0 z-[100] bg-white/10 backdrop-blur-md border-b border-white/5" />

            {/* --- Left Side: Archive Visual --- */}
            <section className="hidden lg:flex w-1/2 bg-black relative flex-col justify-center items-center p-12 overflow-hidden border-r-[12px] border-emerald-500/20">
                {/* Background Grid & Scanlines */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                </div>

                {/* Animated Scanner Line */}
                <motion.div
                    initial={{ top: '-10%' }}
                    animate={{ top: '110%' }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[2px] bg-emerald-500/50 shadow-[0_0_20px_#10b981] z-10"
                />

                <div className="relative z-20 space-y-12 max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                            <Zap size={10} className="text-emerald-500 fill-emerald-500" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500">Secure Node Access</span>
                        </div>
                        <h1 className="text-8xl font-black text-white tracking-tighter uppercase leading-none">
                            ZERO <br /> <span className="text-emerald-500">STORE</span>
                        </h1>
                        <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest leading-relaxed">
                            A restricted anthology of wearable engineering. <br /> Authenticate to bypass retrieval limits.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 gap-6 pt-12">
                        {[
                            { label: 'Latency', value: '0.42ms' },
                            { label: 'Uptime', value: '100.0%' },
                            { label: 'Secure', value: 'AES-256' },
                            { label: 'Protocol', value: 'W_0.01' }
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 + (i * 0.1) }}
                                className="border-l-2 border-zinc-800 pl-4 py-1"
                            >
                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{stat.label}</p>
                                <p className="text-lg font-black text-white">{stat.value}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Scrolling Code / Logs */}
                    <div className="absolute bottom-12 left-12 right-12 opacity-10 font-mono text-[8px] text-emerald-400 overflow-hidden h-24 select-none pointer-events-none">
                        <motion.div
                            animate={{ y: [-100, 0] }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        >
                            {Array.from({ length: 20 }).map((_, i) => (
                                <p key={i}> {`> SYNC_ARCHIVE_${Math.random().toString(16).slice(2, 8)}: SUCCESS (CRC_${Math.random().toString(16).slice(2, 4)})`}</p>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- Right Side: Form --- */}
            <section className="flex-1 flex flex-col justify-center items-center p-8 md:p-12 lg:p-24 bg-[#FAFAFA] relative">
                <div className="w-full max-w-[420px] space-y-12">

                    <div className="text-center space-y-4">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="inline-block"
                        >
                            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-500 shadow-2xl">
                                <span className="text-white text-3xl font-black">Z</span>
                            </div>
                        </motion.div>
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black uppercase tracking-tight text-black">
                                {isSignUp ? 'New Identity' : 'Welcome Back'}
                            </h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                                {isSignUp ? 'Initialize your archive profile' : 'Reconnect to the base station'}
                            </p>
                        </div>
                    </div>

                    {/* Form Container */}
                    <div className="bg-white p-8 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-zinc-100">
                        <form onSubmit={handleAuth} className="space-y-6">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-4 bg-red-50 rounded-xl border border-red-100 flex items-start gap-4"
                                >
                                    <Shield className="text-red-500 shrink-0" size={16} />
                                    <p className="text-[10px] font-bold uppercase text-red-600 leading-tight tracking-wide">{error}</p>
                                </motion.div>
                            )}

                            <div className="space-y-6">
                                {/* Sign Up Fields */}
                                <AnimatePresence mode="popLayout">
                                    {isSignUp && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-4 overflow-hidden"
                                        >
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 pl-1">First Name</label>
                                                    <input
                                                        type="text" placeholder="GIVEN"
                                                        value={givenName} onChange={(e) => setGivenName(e.target.value)}
                                                        className="w-full bg-zinc-50 border-0 rounded-xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-black transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 pl-1">Last Name</label>
                                                    <input
                                                        type="text" placeholder="FAMILY"
                                                        value={familyName} onChange={(e) => setFamilyName(e.target.value)}
                                                        className="w-full bg-zinc-50 border-0 rounded-xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-black transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 pl-1">Mobile Access</label>
                                                <div className="flex bg-zinc-50 rounded-xl overflow-hidden">
                                                    <select
                                                        value={countryCode} onChange={(e) => setCountryCode(e.target.value)}
                                                        className="bg-zinc-100 px-3 py-3.5 text-[10px] font-black border-0 outline-none"
                                                    >
                                                        <option value="+60">+60</option>
                                                        <option value="+65">+65</option>
                                                        <option value="+86">+86</option>
                                                    </select>
                                                    <input
                                                        type="tel" placeholder="000 000 000"
                                                        value={phone} onChange={(e) => setPhone(e.target.value)}
                                                        className="flex-1 bg-transparent px-4 py-3.5 text-xs font-bold border-0 outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Email Field */}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 pl-1">Email Terminal</label>
                                    <div className="relative group">
                                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-black transition-colors" />
                                        <input
                                            type="email" required placeholder="name@archive.com"
                                            value={email} onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-zinc-50 border-0 rounded-xl pl-12 pr-4 py-4 text-xs font-bold focus:ring-2 focus:ring-black transition-all placeholder:text-zinc-300"
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 pl-1">Passkey</label>
                                    <div className="relative group">
                                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-black transition-colors" />
                                        <input
                                            type="password" required placeholder="••••••••••••"
                                            value={password} onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-zinc-50 border-0 rounded-xl pl-12 pr-4 py-4 text-xs font-bold focus:ring-2 focus:ring-black transition-all placeholder:text-zinc-300"
                                        />
                                    </div>
                                </div>

                                {isSignUp && (
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 pl-1">Confirm Passkey</label>
                                        <input
                                            type="password" required placeholder="••••••••••••"
                                            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-zinc-50 border-0 rounded-xl px-4 py-4 text-xs font-bold focus:ring-2 focus:ring-black transition-all"
                                        />
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-black text-white rounded-xl py-5 text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 hover:bg-zinc-800 shadow-xl disabled:opacity-50 group"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : isSignUp ? (
                                    <>Initialize Access <UserPlus size={16} className="group-hover:translate-x-1 transition-transform" /></>
                                ) : (
                                    <>Authorize Entry <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
                                )}
                            </button>
                        </form>

                        <div className="relative py-8">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-100"></div></div>
                            <div className="relative flex justify-center text-[8px] font-black uppercase bg-white px-4 tracking-[0.5em] text-zinc-300">Alternate Sync</div>
                        </div>

                        <button
                            onClick={handleGoogleLogin}
                            className="w-full bg-white border border-zinc-200 text-zinc-600 rounded-xl py-4 text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-3 hover:bg-zinc-50 hover:border-zinc-300"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google Identity
                        </button>
                    </div>

                    {/* Bottom Toggle */}
                    <div className="text-center">
                        <button
                            onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                            className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors"
                        >
                            {isSignUp ? 'Already authorized? Sign in' : 'No access key? Create one'}
                        </button>
                    </div>

                </div>

                {/* Footer Link */}
                <div className="absolute bottom-8 text-[9px] font-black uppercase tracking-[0.5em] text-zinc-300">
                    Zero Store Archive / Security Prot. 2.1
                </div>
            </section>
        </main>
    );
}
