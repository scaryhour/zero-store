'use client';
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, UserPlus, LogIn, Loader2, Phone, User as UserIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

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
                if (password !== confirmPassword) {
                    throw new Error("Passwords do not match");
                }
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
            options: {
                redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
            }
        });
        if (error) setError(error.message);
    };

    return (
        <main className="min-h-screen relative selection:bg-black selection:text-white flex flex-col">
            {/* ... Dynamic Background etc ... */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=2000&auto=format&fit=crop"
                    alt="Zero Archive Background"
                    className="w-full h-full object-cover brightness-[0.4]"
                />
            </div>

            <div className="relative z-20">
                <Navbar />
            </div>

            <div className="flex-1 flex items-center justify-center p-6 relative z-10 pt-24 pb-12">
                <div className="w-full max-w-[480px] bg-white shadow-2xl overflow-hidden animate-fadeInUp">

                    <div className="py-8 px-10 border-b border-black/5 flex flex-col items-center">
                        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                            Z
                        </div>
                        <h1 className="text-3xl font-bold uppercase tracking-tight">
                            {isSignUp ? 'Sign up' : 'Sign in'}
                        </h1>
                        <p className="text-[10px] uppercase tracking-widest opacity-40 mt-2 font-bold">
                            {isSignUp ? 'Install new identity' : 'Sync archival access'}
                        </p>
                    </div>

                    <div className="p-10 space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-[10px] font-bold uppercase text-red-600 tracking-widest">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleAuth} className="space-y-6">
                            {/* Email and Password fields same as before... */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full border-2 border-black/10 rounded-md p-3 text-xs font-bold tracking-wide outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                    placeholder="name@host.com"
                                />
                            </div>

                            {isSignUp && (
                                <div className="space-y-6 animate-fadeInUp">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60 flex items-center gap-2">
                                            Phone number
                                        </label>
                                        <div className="flex bg-white border-2 border-black/10 rounded-md focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all overflow-hidden text-xs font-bold tracking-wide">
                                            <select
                                                value={countryCode}
                                                onChange={(e) => setCountryCode(e.target.value)}
                                                className="bg-transparent pl-3 pr-2 py-3 outline-none border-r border-black/10 text-zinc-600 appearance-none min-w-[70px] cursor-pointer hover:bg-black/5 transition-colors"
                                            >
                                                <option value="+60">+60 (MY)</option>
                                                <option value="+65">+65 (SG)</option>
                                                <option value="+86">+86 (CN)</option>
                                                <option value="+852">+852 (HK)</option>
                                                <option value="+886">+886 (TW)</option>
                                                <option value="+1">+1 (US)</option>
                                                <option value="+44">+44 (UK)</option>
                                                <option value="+61">+61 (AU)</option>
                                            </select>
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="w-full bg-transparent p-3 outline-none"
                                                placeholder="Phone number"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-60">
                                                Given name
                                            </label>
                                            <input
                                                type="text"
                                                value={givenName}
                                                onChange={(e) => setGivenName(e.target.value)}
                                                className="w-full border-2 border-black/10 rounded-md p-3 text-xs font-bold tracking-wide outline-none focus:border-black transition-all"
                                                placeholder="First name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-60">
                                                Family name
                                            </label>
                                            <input
                                                type="text"
                                                value={familyName}
                                                onChange={(e) => setFamilyName(e.target.value)}
                                                className="w-full border-2 border-black/10 rounded-md p-3 text-xs font-bold tracking-wide outline-none focus:border-black transition-all"
                                                placeholder="Last name"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-60 flex items-center gap-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full border-2 border-black/10 rounded-md p-3 text-xs font-bold tracking-wide outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                    placeholder="Enter password"
                                />
                            </div>

                            {isSignUp && (
                                <div className="space-y-2 animate-fadeInUp">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 flex items-center gap-2">
                                        Confirm password
                                    </label>
                                    <input
                                        type="password"
                                        required={isSignUp}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full border-2 border-black/10 rounded-md p-3 text-xs font-bold tracking-wide outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                        placeholder="Reenter password"
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-black text-white rounded-md py-4 text-[13px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:bg-zinc-800 shadow-xl"
                            >
                                {loading && <Loader2 size={16} className="animate-spin" />}
                                {isSignUp ? 'Sign up' : 'Sign in'}
                            </button>
                        </form>

                        <div className="relative flex items-center py-4">
                            <div className="flex-grow border-t border-black/5"></div>
                            <span className="flex-shrink mx-4 text-[8px] font-black uppercase tracking-[0.4em] opacity-20 italic">Archival Relay</span>
                            <div className="flex-grow border-t border-black/5"></div>
                        </div>

                        <button
                            onClick={handleGoogleLogin}
                            className="w-full bg-white border-2 border-black/10 text-black rounded-md py-4 text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 hover:bg-black hover:text-white hover:border-black group"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Sign in with Google
                        </button>
                    </div>

                    {/* Modal Footer / Toggle */}
                    <div className="bg-zinc-50 py-6 border-t border-black/5 text-center">
                        <span className="text-[11px] font-bold text-zinc-500 mr-2">
                            {isSignUp ? 'Have an account already?' : 'New user?'}
                        </span>
                        <button
                            onClick={(e) => { e.preventDefault(); setIsSignUp(!isSignUp); setError(null); }}
                            className="text-[11px] font-black text-blue-600 hover:text-blue-800 hover:underline transition-all"
                        >
                            {isSignUp ? 'Sign in' : 'Create an account'}
                        </button>
                    </div>

                </div>
            </div>
        </main>
    );
}
