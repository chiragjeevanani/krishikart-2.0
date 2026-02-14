import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, ArrowRight, ShieldCheck, KeyRound, Globe, Cpu, Zap, ChevronRight, Home, Command, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFranchiseAuth } from '../contexts/FranchiseAuthContext';
import { cn } from '@/lib/utils';
import api from '../../../lib/axios';

export default function LoginScreen() {
    const navigate = useNavigate();
    const { login } = useFranchiseAuth();
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState('mobile'); // 'mobile' or 'otp'
    const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

    const handleNext = async (e) => {
        e.preventDefault();
        if (mobile.length === 10) {
            setIsLoading(true);
            try {
                await api.post('/franchise/send-otp', { mobile });
                setMode('otp');
            } catch (error) {
                console.error(error);
                alert(error.response?.data?.message || 'Failed to send OTP');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) value = value[0]; // Allow only 1 char
        if (!/^\d*$/.test(value)) return; // Allow only digits

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            otpRefs[index + 1].current.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs[index - 1].current.focus();
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const otpValue = otp.join('');
        if (otpValue.length !== 6) return;

        setIsLoading(true);

        try {
            const response = await api.post('/franchise/verify-otp', { mobile, otp: otpValue });
            // The context login function might need updating or we handle storage manually here to match other modules
            // Assuming context handles state update if we pass data, but let's do manual storage for consistency
            localStorage.setItem('franchiseToken', response.data.token);
            localStorage.setItem('franchiseData', JSON.stringify(response.data));

            // If context has a login method that updates state, ideally use it. 
            // For now, manual storage + navigation works.
            navigate('/franchise/dashboard');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row relative overflow-hidden font-sans">
            {/* Left Panel: Brand & Visual Identity */}
            <div className="hidden md:flex flex-1 flex-col justify-between p-12 relative z-10 border-r border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-sm flex items-center justify-center text-slate-900 shadow-xl">
                        <Home size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white text-lg font-black tracking-tight leading-none uppercase">KrishiKart</span>
                        <span className="text-[10px] text-slate-500 font-bold tracking-[0.3em] uppercase">Franchise Partner</span>
                    </div>
                </div>

                <div className="space-y-6 max-w-md">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-sm">
                        <Zap size={10} /> v2.4.0 Live
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter leading-[0.9] uppercase">
                        Franchise <br />
                        Partner <br />
                        Login.
                    </h1>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed uppercase tracking-tight">
                        Welcome back! Login to manage your orders, deliveries, and business profile securely.
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
                            <span className="text-slate-900 border-b border-slate-900 pb-px">Login</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Account Access</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Verify your partner identity</p>
                    </div>

                    <form onSubmit={mode === 'mobile' ? handleNext : handleLogin} className="space-y-6">
                        <AnimatePresence mode="wait">
                            {mode === 'mobile' ? (
                                <motion.div
                                    key="mobile-input"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">Mobile Interface</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors">
                                                <Smartphone size={16} />
                                            </div>
                                            <input
                                                autoFocus
                                                type="tel"
                                                maxLength={10}
                                                value={mobile}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    if (val.length <= 10) setMobile(val);
                                                }}
                                                placeholder="Enter Mobile Number"
                                                className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-sm outline-none text-xs font-black text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-slate-900 transition-all font-sans tracking-widest"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        disabled={mobile.length < 10}
                                        className="w-full h-14 bg-slate-900 text-white rounded-sm font-black uppercase text-[11px] tracking-[0.3em] shadow-xl hover:bg-slate-800 active:scale-[0.98] transition-all disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center gap-3"
                                    >
                                        Request OTP <ArrowRight size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/franchise/signup')}
                                        className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest py-2 hover:text-slate-900 transition-colors underline underline-offset-8 decoration-slate-200"
                                    >
                                        Register as New Partner
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="otp-input"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center px-1">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Access Verification</label>
                                                <span className="text-[9px] font-bold text-slate-400">{mobile}</span>
                                            </div>

                                            <div className="flex gap-2 justify-between">
                                                {otp.map((digit, index) => (
                                                    <input
                                                        key={index}
                                                        ref={otpRefs[index]}
                                                        type="text"
                                                        inputMode="numeric"
                                                        maxLength={1}
                                                        value={digit}
                                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                                        className="w-12 h-14 bg-slate-50 border border-slate-200 rounded-sm outline-none text-lg font-black text-slate-900 text-center focus:bg-white focus:border-slate-900 transition-all font-sans"
                                                        autoFocus={index === 0}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        <button
                                            className="w-full h-14 bg-slate-900 text-white rounded-sm font-black uppercase text-[11px] tracking-[0.3em] shadow-xl hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:bg-slate-200 disabled:text-slate-400"
                                            disabled={isLoading || otp.join('').length < 6}
                                        >
                                            {isLoading ? <Loader2 className="animate-spin" size={16} /> : (
                                                <>
                                                    Login to Account <ShieldCheck size={16} />
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMode('mobile');
                                                setOtp(['', '', '', '', '', '']);
                                            }}
                                            className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-2 hover:text-slate-900 transition-colors underline underline-offset-8 decoration-slate-200"
                                        >
                                            Change Mobile Number
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>

                    <div className="pt-12 border-t border-slate-100 flex flex-col items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Secure Connection Active</span>
                        </div>
                        <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest text-center leading-relaxed">
                            KrishiKart Partner Security Protocol v2.4.0<br />
                            By logging in, you agree to our partner terms and compliance.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
