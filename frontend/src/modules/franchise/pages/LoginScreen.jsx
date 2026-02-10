import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, ArrowRight, ShieldCheck, KeyRound, Globe, Cpu, Zap, ChevronRight, Home, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFranchiseAuth } from '../contexts/FranchiseAuthContext';
import { cn } from '@/lib/utils';

export default function LoginScreen() {
    const navigate = useNavigate();
    const { login } = useFranchiseAuth();
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState('franchise_id'); // 'franchise_id' or 'credentials'

    const handleNext = (e) => {
        e.preventDefault();
        if (id.length >= 4) {
            setMode('credentials');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate network delay
        setTimeout(() => {
            const success = login(id, password);
            if (success) {
                navigate('/franchise/dashboard');
            }
            setIsLoading(false);
        }, 1200);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row relative overflow-hidden font-sans">
            {/* Left Panel: Brand & Visual Identity */}
            <div className="hidden md:flex flex-1 flex-col justify-between p-12 relative z-10 border-r border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-sm flex items-center justify-center text-slate-900 shadow-xl">
                        <Command size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white text-lg font-black tracking-tight leading-none uppercase">KrishiKart</span>
                        <span className="text-[10px] text-slate-500 font-bold tracking-[0.3em] uppercase">Operations OS</span>
                    </div>
                </div>

                <div className="space-y-6 max-w-md">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-sm">
                        <Zap size={10} /> v2.4.0 High-Performance Hub
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter leading-[0.9] uppercase">
                        Enterprise <br />
                        Node <br />
                        Access.
                    </h1>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed uppercase tracking-tight">
                        Authorized logistics terminal for verified franchise partners. Secure biometric and credential handshakes required for operational sync.
                    </p>
                </div>

                <div className="flex items-center gap-12 text-slate-500">
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-white uppercase tabular-nums tracking-widest">99.9%</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest mt-1">Uptime SLA</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-white uppercase tabular-nums tracking-widest">&lt; 200MS</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest mt-1">Sync Latency</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-white uppercase tabular-nums tracking-widest">Quantum</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest mt-1">Encryption</span>
                    </div>
                </div>

                {/* Grid Background Pattern */}
                <div className="absolute inset-0 opacity-10 -z-10" style={{ backgroundImage: 'radial-gradient(#fff 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
            </div>

            {/* Right Panel: Auth Terminal */}
            <div className="flex-1 flex items-center justify-center p-6 bg-slate-900 md:bg-white relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-sm space-y-12"
                >
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                            <Home size={12} />
                            <ChevronRight size={10} />
                            <span className="text-slate-900 border-b border-slate-900 pb-px">Terminal Login</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Security Handshake</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Deploying RSA Session Keys...</p>
                    </div>

                    <form onSubmit={mode === 'franchise_id' ? handleNext : handleLogin} className="space-y-6">
                        <AnimatePresence mode="wait">
                            {mode === 'franchise_id' ? (
                                <motion.div
                                    key="id-input"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">Franchise Identifier</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors">
                                                <User size={16} />
                                            </div>
                                            <input
                                                autoFocus
                                                value={id}
                                                onChange={(e) => setId(e.target.value)}
                                                placeholder="NODE-ID-XXXX"
                                                className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-sm outline-none text-xs font-black text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-slate-900 transition-all font-sans"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        disabled={id.length < 4}
                                        className="w-full h-14 bg-slate-900 text-white rounded-sm font-black uppercase text-[11px] tracking-[0.3em] shadow-xl hover:bg-slate-800 active:scale-[0.98] transition-all disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center gap-3"
                                    >
                                        Execute Connection <ArrowRight size={16} />
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="credentials-input"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">Access Credentials</label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors">
                                                    <KeyRound size={16} />
                                                </div>
                                                <input
                                                    autoFocus
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-sm outline-none text-xs font-black text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-slate-900 transition-all font-sans"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        <button
                                            className="w-full h-14 bg-slate-900 text-white rounded-sm font-black uppercase text-[11px] tracking-[0.3em] shadow-xl hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? <Cpu className="animate-spin" size={16} /> : (
                                                <>
                                                    Authorize Node Access <ShieldCheck size={16} />
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setMode('franchise_id')}
                                            className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-2 hover:text-slate-900 transition-colors underline underline-offset-8 decoration-slate-200"
                                        >
                                            Return to Handshake
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>

                    <div className="pt-12 border-t border-slate-100 flex flex-col items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Operational Readiness Validated</span>
                        </div>
                        <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest text-center leading-relaxed">
                            Logistics Node Authentication protocol v2.4.0-STABLE<br />
                            Unauthorized data extraction is a violation of partner compliance.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
