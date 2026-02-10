import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, AlertCircle, IndianRupee } from 'lucide-react';
import { useState } from 'react';

export default function CreditOverrideModal({ isOpen, onClose, hotel, onSave }) {
    const [limit, setLimit] = useState(hotel?.creditLimit || 0);
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden"
                >
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Override Limit</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                                    Updating limit for {hotel?.hotelName}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Credit Limit</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-focus-within:text-primary transition-colors font-bold">
                                        ₹
                                    </div>
                                    <input
                                        type="number"
                                        value={limit}
                                        onChange={(e) => setLimit(e.target.value)}
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 rounded-2xl py-4 pl-14 pr-4 outline-none text-lg font-black text-slate-900 transition-all"
                                        placeholder="Enter amount"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason for Adjustment</label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows={3}
                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 rounded-2xl p-4 outline-none text-sm font-medium text-slate-900 transition-all resize-none"
                                    placeholder="Brief explanation for the record..."
                                />
                            </div>

                            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3">
                                <AlertCircle size={20} className="text-amber-500 shrink-0" />
                                <p className="text-[11px] font-bold text-amber-700 leading-relaxed">
                                    Changes will be logged in the system audit trail and effective immediately.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-10">
                            <button
                                onClick={onClose}
                                className="py-4 rounded-2xl font-black text-sm text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-tight"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => onSave({ limit, reason })}
                                className="py-4 bg-primary text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-primary/20 uppercase tracking-tight"
                            >
                                <Save size={18} />
                                Confirm
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
