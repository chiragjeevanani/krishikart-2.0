import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sprout, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

import api from '../../../lib/axios';

export default function LoginScreen() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await api.post('/vendor/login', { email, password });

            // Store token and vendor data
            localStorage.setItem('vendorToken', response.data.token);
            localStorage.setItem('vendorData', JSON.stringify(response.data));

            navigate('/vendor/dashboard');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafd] flex items-center justify-center p-6 selection:bg-emerald-100 overflow-hidden relative">
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
                className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-[40px] border border-white shadow-2xl shadow-emerald-900/5 relative z-10"
            >
                <div className="flex flex-col items-center mb-10 text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                        className="w-20 h-20 bg-primary rounded-[24px] flex items-center justify-center text-white mb-6 shadow-xl shadow-primary/30"
                    >
                        <Sprout size={40} />
                    </motion.div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Vendor HUB</h1>
                    <p className="text-slate-500 font-medium mt-2">Manage your fresh produce & operations</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="vendor@krishikart.com"
                                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-14 pr-6 outline-none text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all text-slate-900"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-14 pr-6 outline-none text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all text-slate-900"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <button
                            type="button"
                            onClick={() => navigate('/vendor/forgot-password')}
                            className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                        >
                            Forgot Access?
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group w-full bg-slate-900 text-white rounded-2xl py-4 px-6 font-black text-sm flex items-center justify-center gap-3 hover:bg-primary transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none mt-4"
                    >
                        {isLoading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <>
                                Authenticate
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Don't have a vendor account?
                    </p>
                    <button onClick={() => navigate('/vendor/signup')} className="mt-2 text-primary font-black text-xs hover:underline">
                        Apply for Partnership
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
