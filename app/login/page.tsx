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

    return (
        <main className="min-h-screen relative selection:bg-black selection:text-white flex flex-col">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=2000&auto=format&fit=crop"
                    alt="Zero Archive Background"
                    className="w-full h-full object-cover brightness-[0.4]"
                />
            </div>

            {/* Navbar overlay */}
            <div className="relative z-20">
                <Navbar />
            </div>

            {/* Centered Modal Container */}
            <div className="flex-1 flex items-center justify-center p-6 relative z-10 pt-24 pb-12">
                <div className="w-full max-w-[480px] bg-white shadow-2xl overflow-hidden animate-fadeInUp">

                    {/* Modal Header */}
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

                    {/* Modal Body / Form */}
                    <div className="p-10 space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-[10px] font-bold uppercase text-red-600 tracking-widest">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleAuth} className="space-y-6">

                            {/* Always show Email */}
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

                            {/* Additional Registration Fields */}
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

                            {/* Password Fields */}
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

                            {isSignUp && (
                                <div className="text-[9px] text-zinc-500 font-bold leading-relaxed pt-2">
                                    By signing up, you agree to our <a href="#" className="text-black underline uppercase">Terms of Use</a> and <a href="#" className="text-black underline uppercase">Privacy Policy</a>
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
