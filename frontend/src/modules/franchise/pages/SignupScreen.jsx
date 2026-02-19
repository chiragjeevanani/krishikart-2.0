import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, ArrowRight, ShieldCheck,
    Cpu, Zap, Home, Command,
    Smartphone, MapPin, Building2, Mail, ChevronRight, Loader2
} from 'lucide-react';
import { useFranchiseAuth } from '../contexts/FranchiseAuthContext';
import api from '../../../lib/axios';

export default function SignupScreen() {
    const navigate = useNavigate();
    const { loginSuccess } = useFranchiseAuth();

    // Form States
    const [formData, setFormData] = useState({
        franchiseName: '',
        ownerName: '',
        mobile: '',
        email: '',
        area: '',
        city: '',
        state: ''
    });

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState('details'); // 'details' or 'otp'
    const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = async (e) => {
        e.preventDefault();
        if (formData.mobile.length === 10 && formData.franchiseName && formData.ownerName) {
            setIsLoading(true);
            try {
                await api.post('/franchise/register', {
                    franchiseName: formData.franchiseName,
                    ownerName: formData.ownerName,
                    mobile: formData.mobile,
                    area: formData.area,
                    city: formData.city,
                    state: formData.state
                });
                setMode('otp');
            } catch (error) {
                console.error(error);
                alert(error.response?.data?.message || 'Registration failed');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) value = value[0];
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            otpRefs[index + 1].current.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs[index - 1].current.focus();
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        const otpValue = otp.join('');
        if (otpValue.length !== 6) return;

        setIsLoading(true);

        try {
            const response = await api.post('/franchise/verify-otp', { mobile: formData.mobile, otp: otpValue });

            localStorage.setItem('franchiseToken', response.data.result.token);
            localStorage.setItem('franchiseData', JSON.stringify(response.data.result));

            loginSuccess(response.data.result);

            navigate('/franchise/dashboard');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Verification failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row relative overflow-hidden font-sans">
            {/* Left Panel: Information Deck */}
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
                        <Zap size={10} /> v2.4.0 Register
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter leading-[0.9] uppercase">
                        Become a <br />
                        Franchise <br />
                        Partner.
                    </h1>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed uppercase tracking-tight">
                        Join our network and start managing orders in your area. Quick verification to get you started.
                    </p>
                </div>

                <div className="flex items-center gap-12 text-slate-500">
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-white uppercase tabular-nums tracking-widest">Type-A</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest mt-1">Infrastructure</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-white uppercase tabular-nums tracking-widest">Secure</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest mt-1">Onboarding</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-white uppercase tabular-nums tracking-widest">24/7</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest mt-1">Support</span>
                    </div>
                </div>

                <div className="absolute inset-0 opacity-10 -z-10" style={{ backgroundImage: 'radial-gradient(#fff 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
            </div>

            {/* Right Panel: Registration Form */}
            <div className="flex-1 flex items-center justify-center p-6 bg-slate-900 md:bg-white relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md space-y-12"
                >
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                            <Home size={12} />
                            <ChevronRight size={10} />
                            <span className="text-slate-900 border-b border-slate-900 pb-px">Registration</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Partner Details</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Enter your business information</p>
                    </div>

                    <form onSubmit={mode === 'details' ? handleNext : handleSignup} className="space-y-6">
                        <AnimatePresence mode="wait">
                            {mode === 'details' ? (
                                <motion.div
                                    key="details-input"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="space-y-4"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">Shop Name</label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors">
                                                    <Building2 size={16} />
                                                </div>
                                                <input
                                                    autoFocus
                                                    value={formData.franchiseName}
                                                    onChange={(e) => handleChange('franchiseName', e.target.value)}
                                                    placeholder="Franchise Name"
                                                    className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-sm outline-none text-xs font-black text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-slate-900 transition-all font-sans"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">Owner Name</label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors">
                                                    <User size={16} />
                                                </div>
                                                <input
                                                    value={formData.ownerName}
                                                    onChange={(e) => handleChange('ownerName', e.target.value)}
                                                    placeholder="Owner Name"
                                                    className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-sm outline-none text-xs font-black text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-slate-900 transition-all font-sans"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">Mobile Number</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors">
                                                <Smartphone size={16} />
                                            </div>
                                            <input
                                                type="tel"
                                                maxLength={10}
                                                value={formData.mobile}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    if (val.length <= 10) handleChange('mobile', val);
                                                }}
                                                placeholder="Mobile Number"
                                                className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-sm outline-none text-xs font-black text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-slate-900 transition-all font-sans tracking-widest"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">Area</label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors">
                                                    <MapPin size={16} />
                                                </div>
                                                <input
                                                    value={formData.area}
                                                    onChange={(e) => handleChange('area', e.target.value)}
                                                    placeholder="e.g. Vijay Nagar"
                                                    className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-sm outline-none text-xs font-black text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-slate-900 transition-all font-sans"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">City</label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors">
                                                    <Building2 size={16} />
                                                </div>
                                                <input
                                                    value={formData.city}
                                                    onChange={(e) => handleChange('city', e.target.value)}
                                                    placeholder="e.g. Indore"
                                                    className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-sm outline-none text-xs font-black text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-slate-900 transition-all font-sans"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">State</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors">
                                                <MapPin size={16} />
                                            </div>
                                            <input
                                                value={formData.state}
                                                onChange={(e) => handleChange('state', e.target.value)}
                                                placeholder="e.g. Madhya Pradesh"
                                                className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-sm outline-none text-xs font-black text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-slate-900 transition-all font-sans"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        disabled={!formData.mobile || formData.mobile.length < 10 || !formData.franchiseName || !formData.city || !formData.state}
                                        className="w-full h-14 bg-slate-900 text-white rounded-sm font-black uppercase text-[11px] tracking-[0.3em] shadow-xl hover:bg-slate-800 active:scale-[0.98] transition-all disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center gap-3 mt-4"
                                    >
                                        Register Now <ArrowRight size={16} />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => navigate('/franchise/login')}
                                        className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest py-2 hover:text-slate-900 transition-colors underline underline-offset-8 decoration-slate-200"
                                    >
                                        Already a partner? Login
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
                                                <span className="text-[9px] font-bold text-slate-400">{formData.mobile}</span>
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
                                                    Confirm Registration <ShieldCheck size={16} />
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMode('details');
                                                setOtp(['', '', '', '', '', '']);
                                            }}
                                            className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-2 hover:text-slate-900 transition-colors underline underline-offset-8 decoration-slate-200"
                                        >
                                            Edit Details
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>

                    <div className="pt-12 border-t border-slate-100 flex flex-col items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">System Status: Online</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
