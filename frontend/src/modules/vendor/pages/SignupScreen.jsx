import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sprout, Mail, Lock, Loader2, ArrowRight, User, Phone, MapPin } from 'lucide-react';

import api from '../../../lib/axios';

export default function SignupScreen() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        mobile: '',
        password: '',
        farmLocation: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/vendor/register', formData);
            alert('Registration successful! Please login.');
            navigate('/vendor/login');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafd] flex items-center justify-center p-4 selection:bg-emerald-100 overflow-hidden relative">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-100 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        x: [0, 50, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-sm bg-white/80 backdrop-blur-xl p-6 rounded-[32px] border border-white shadow-2xl shadow-emerald-900/5 relative z-10"
            >
                <div className="flex flex-col items-center mb-5 text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                        className="w-12 h-12 bg-primary rounded-[16px] flex items-center justify-center text-white mb-3 shadow-xl shadow-primary/30"
                    >
                        <Sprout size={24} />
                    </motion.div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">Join as Vendor</h1>
                    <p className="text-slate-500 font-medium mt-0.5 text-xs">Start selling your fresh produce</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-3">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                <User size={14} />
                            </div>
                            <input
                                name="fullName"
                                type="text"
                                required
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Your Name"
                                className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 outline-none text-xs font-bold focus:ring-4 focus:ring-primary/5 transition-all text-slate-900"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                <Mail size={14} />
                            </div>
                            <input
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="vendor@krishikart.com"
                                className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 outline-none text-xs font-bold focus:ring-4 focus:ring-primary/5 transition-all text-slate-900"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                <Phone size={14} />
                            </div>
                            <input
                                name="mobile"
                                type="tel"
                                required
                                value={formData.mobile}
                                onChange={handleChange}
                                placeholder="+91 98765 43210"
                                className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 outline-none text-xs font-bold focus:ring-4 focus:ring-primary/5 transition-all text-slate-900"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Farm Location</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                <MapPin size={14} />
                            </div>
                            <input
                                name="farmLocation"
                                type="text"
                                required
                                value={formData.farmLocation}
                                onChange={handleChange}
                                placeholder="City, State"
                                className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 outline-none text-xs font-bold focus:ring-4 focus:ring-primary/5 transition-all text-slate-900"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                <Lock size={14} />
                            </div>
                            <input
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 outline-none text-xs font-bold focus:ring-4 focus:ring-primary/5 transition-all text-slate-900"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group w-full bg-slate-900 text-white rounded-xl py-3 px-6 font-black text-xs flex items-center justify-center gap-2 hover:bg-primary transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none mt-4"
                    >
                        {isLoading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <>
                                Register Account
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-5 text-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Already have a vendor account?
                    </p>
                    <button
                        onClick={() => navigate('/vendor/login')}
                        className="mt-1 text-primary font-black text-[10px] hover:underline"
                    >
                        Login to Dashboard
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
