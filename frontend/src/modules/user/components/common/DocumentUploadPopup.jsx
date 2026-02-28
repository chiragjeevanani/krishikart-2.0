import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, ShieldCheck, FileCheck, Info, ChevronRight } from 'lucide-react';

export default function DocumentUploadPopup({ isOpen, onSubmit, onSkip, onClose }) {
    const [gst, setGst] = useState('');
    const [fssai, setFssai] = useState('');

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    className="bg-white rounded-[40px] w-full max-w-[420px] overflow-hidden shadow-2xl relative flex flex-col h-auto max-h-[95vh]"
                >
                    {/* Header */}
                    <div className="p-8 pb-4 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-emerald-50 rounded-[24px] flex items-center justify-center mb-6 relative">
                            <ShieldCheck size={40} className="text-[#10b981]" strokeWidth={1.5} />
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center"
                            >
                                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            </motion.div>
                        </div>

                        <h2 className="text-[24px] font-black text-slate-900 mb-2 tracking-tight">Verify your business</h2>
                        <p className="text-slate-500 text-[14px] leading-relaxed px-6">
                            Registered businesses get exclusive access to credit and wholesale pricing.
                        </p>
                    </div>

                    {/* Form */}
                    <div className="px-8 py-4 space-y-5 overflow-y-auto">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">GST Number (Optional)</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#10b981] transition-colors">
                                    <FileCheck size={18} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="22AAAAA0000A1Z5"
                                    value={gst}
                                    onChange={(e) => setGst(e.target.value.toUpperCase())}
                                    className="w-full h-[56px] pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl text-[15px] font-bold text-slate-900 outline-none focus:border-[#10b981]/30 focus:bg-white focus:ring-4 focus:ring-[#10b981]/5 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">FSSAI Number (Optional)</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#10b981] transition-colors">
                                    <FileCheck size={18} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="14-digit license number"
                                    value={fssai}
                                    onChange={(e) => setFssai(e.target.value.replace(/\D/g, '').slice(0, 14))}
                                    className="w-full h-[56px] pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl text-[15px] font-bold text-slate-900 outline-none focus:border-[#10b981]/30 focus:bg-white focus:ring-4 focus:ring-[#10b981]/5 transition-all"
                                />
                            </div>
                        </div>

                        <div className="bg-emerald-50/50 p-4 rounded-2xl flex gap-3 border border-emerald-100/50">
                            <Info size={18} className="text-emerald-600 shrink-0" />
                            <p className="text-[12px] text-emerald-800 font-medium leading-relaxed">
                                You can also skip this step and add your documents later from the Profile section.
                            </p>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-8 flex flex-col gap-3">
                        <button
                            onClick={() => onSubmit({ gst, fssai })}
                            className="w-full bg-[#10b981] hover:bg-[#059669] text-white h-[60px] rounded-[24px] font-black text-[16px] shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            Complete Onboarding <ChevronRight size={20} strokeWidth={3} />
                        </button>
                        <button
                            onClick={onSkip}
                            className="w-full h-[60px] text-slate-400 hover:text-slate-600 font-bold text-[14px] transition-all"
                        >
                            Skip for now
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
