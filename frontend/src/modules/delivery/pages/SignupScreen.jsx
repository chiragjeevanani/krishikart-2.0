import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, ShieldCheck, ArrowRight, Phone, User, Truck, Car } from 'lucide-react';
import { ROUTES } from '../utils/constants';
import { useNavigate } from 'react-router-dom';
import api from '../../../lib/axios';

const SignupScreen = () => {
    const [step, setStep] = useState('details'); // 'details' or 'otp'
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        vehicleNumber: '',
        vehicleType: 'bike' // 'bike', 'scooter', 'van'
    });
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (formData.phone.length !== 10 || !formData.name || !formData.vehicleNumber) return;
        setLoading(true);
        try {
            await api.post('/delivery/register', {
                fullName: formData.name,
                mobile: formData.phone,
                vehicleNumber: formData.vehicleNumber,
                vehicleType: formData.vehicleType
            });
            setStep('otp');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const otpCode = otp.join('');
        if (otpCode.length !== 6) return;
        setLoading(true);
        try {
            const response = await api.post('/delivery/verify-otp', {
                mobile: formData.phone,
                otp: otpCode
            });
            // Store token and delivery user data
            localStorage.setItem('deliveryToken', response.data.token);
            localStorage.setItem('deliveryData', JSON.stringify(response.data));

            navigate(ROUTES.DASHBOARD);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 10) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleOtpChange = (value, index) => {
        const val = value.replace(/\D/g, '');
        const newOtp = [...otp];
        newOtp[index] = val;
        setOtp(newOtp);

        if (val && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center p-6 overflow-hidden relative">
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.05, scale: 1 }}
                className="absolute -top-24 -right-24 w-80 h-80 bg-primary rounded-full blur-[80px]"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.03, scale: 1 }}
                className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500 rounded-full blur-[80px]"
            />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm mt-10 z-10"
            >
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0.8, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="w-16 h-16 bg-primary rounded-[24px] flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-primary/20"
                    >
                        <Navigation className="w-8 h-8 text-white" />
                    </motion.div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Join Fleet</h1>
                    <p className="text-primary font-bold tracking-[0.2em] uppercase text-[10px] mt-1">Delivery Partner Registration</p>
                </div>

                <AnimatePresence mode="wait">
                    {step === 'details' ? (
                        <motion.div
                            key="details-step"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <form onSubmit={handleSendOtp} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Full Name</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                            <User size={16} />
                                        </div>
                                        <input
                                            name="name"
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Enter your name"
                                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-border bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-black tracking-tight"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Phone Number</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                            <Phone size={16} />
                                        </div>
                                        <input
                                            name="phone"
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="Mobile number"
                                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-border bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-black tracking-tight"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Vehicle Number</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                            <Truck size={16} />
                                        </div>
                                        <input
                                            name="vehicleNumber"
                                            type="text"
                                            required
                                            style={{ textTransform: 'uppercase' }}
                                            value={formData.vehicleNumber}
                                            onChange={handleChange}
                                            placeholder="MP 09 AB 1234"
                                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-border bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-black tracking-tight"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Vehicle Type</label>
                                    <div className="flex gap-2">
                                        {['bike', 'scooter'].map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, vehicleType: type })}
                                                className={`flex-1 py-3 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all ${formData.vehicleType === type ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    disabled={loading || !formData.name || formData.phone.length !== 10 || !formData.vehicleNumber}
                                    type="submit"
                                    className={`w-full py-4 rounded-3xl font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 mt-4 ${!loading && formData.name && formData.phone.length === 10 && formData.vehicleNumber ? 'bg-primary text-white shadow-primary/30' : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'}`}
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Continue <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </motion.button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Already have an account?
                                </p>
                                <button
                                    onClick={() => navigate('/delivery/login')}
                                    className="mt-1 text-primary font-black text-[11px] hover:underline"
                                >
                                    Login Here
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="otp-step"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div className="mb-6 flex items-center justify-between px-1">
                                <div>
                                    <h3 className="font-black text-slate-900 text-sm">Verify Details</h3>
                                    <p className="text-[10px] font-bold text-slate-400">OTP Sent to +91 {formData.phone}</p>
                                </div>
                                <button
                                    onClick={() => setStep('details')}
                                    className="text-[10px] font-bold text-primary hover:underline"
                                >
                                    Edit
                                </button>
                            </div>

                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                                <div className="flex justify-between gap-1">
                                    {otp.map((digit, idx) => (
                                        <input
                                            key={idx}
                                            id={`otp-${idx}`}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(e.target.value, idx)}
                                            onKeyDown={(e) => handleKeyDown(e, idx)}
                                            className="w-10 h-12 bg-slate-50 border border-slate-100 rounded-xl text-center text-lg font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                                        />
                                    ))}
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    disabled={otp.join('').length !== 6 || loading}
                                    type="submit"
                                    className={`w-full py-4 rounded-3xl font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 ${otp.join('').length === 6 && !loading ? 'bg-slate-900 text-white shadow-slate-900/30' : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'}`}
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Register & Login <ShieldCheck className="w-4 h-4" />
                                        </>
                                    )}
                                </motion.button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default SignupScreen;
