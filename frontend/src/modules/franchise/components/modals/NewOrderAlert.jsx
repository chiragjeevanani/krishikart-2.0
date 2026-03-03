import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Bell, ArrowRight, Package } from 'lucide-react';
import { useFranchiseOrders } from '../../contexts/FranchiseOrdersContext';
import { useNavigate } from 'react-router-dom';

const NewOrderAlert = () => {
    const { isAlertOpen, setIsAlertOpen, newOrderData } = useFranchiseOrders();
    const navigate = useNavigate();

    if (!isAlertOpen || !newOrderData) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsAlertOpen(false)}
                    className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 40 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 40 }}
                    className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20"
                >
                    {/* Top Accent Bar */}
                    <div className="h-3 bg-emerald-500 w-full animate-pulse" />

                    <div className="p-10">
                        {/* Header Area */}
                        <div className="flex justify-between items-start mb-8">
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20" />
                                <div className="relative bg-emerald-50 p-6 rounded-2xl">
                                    <Bell className="text-emerald-600 w-10 h-10 animate-bounce" />
                                </div>
                            </div>
                            <button
                                onClick={() => setIsAlertOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Title & Description */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
                                New Order Assigned!
                            </h2>
                            <p className="text-slate-500 font-bold text-lg leading-relaxed">
                                A new order has been auto-assigned to your franchise. Please accept it immediately to start processing.
                            </p>
                        </div>

                        {/* Order Details Card */}
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-white p-3 rounded-xl shadow-sm">
                                    <ShoppingBag className="text-slate-900 w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Reference</p>
                                    <p className="text-xl font-black text-slate-900">#{newOrderData.orderId?.toString().slice(-6).toUpperCase()}</p>
                                </div>
                            </div>

                            <div className="h-px bg-slate-200 w-full my-4" />

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">Status: Auto-Assigned</span>
                                </div>
                                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">Priority</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setIsAlertOpen(false)}
                                className="h-16 px-6 rounded-2xl border-2 border-slate-100 text-slate-500 font-black uppercase text-xs tracking-widest hover:bg-slate-50 hover:border-slate-200 transition-all"
                            >
                                Not Now
                            </button>
                            <button
                                onClick={() => {
                                    setIsAlertOpen(false);
                                    navigate(`/franchise/orders`);
                                }}
                                className="h-16 px-6 rounded-2xl bg-slate-900 text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                            >
                                View Order
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="bg-slate-900 py-4 px-8 flex items-center justify-center gap-2">
                        <Package size={14} className="text-emerald-400" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-[0.3em]">Krishikart Logistic Engine</span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default NewOrderAlert;
