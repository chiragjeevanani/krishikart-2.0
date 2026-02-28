import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Map as MapIcon, Navigation } from 'lucide-react';

export default function LocationPermissionPopup({ isOpen, onAllow, onManual, onClose }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white rounded-[32px] w-full max-w-[400px] overflow-hidden shadow-2xl relative"
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400 z-10"
                    >
                        <X size={20} />
                    </button>

                    <div className="p-8 pb-6 flex flex-col items-center text-center">
                        {/* Illustration */}
                        <div className="relative mb-8 pt-4">
                            <div className="w-48 h-48 bg-emerald-50 rounded-full flex items-center justify-center relative overflow-hidden">
                                {/* Abstract Map Background */}
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute top-4 left-4 w-12 h-12 bg-emerald-500 rounded-lg transform rotate-12" />
                                    <div className="absolute top-12 right-6 w-16 h-8 bg-emerald-500 rounded-full" />
                                    <div className="absolute bottom-10 left-8 w-20 h-4 bg-emerald-500 rounded-full transform -rotate-6" />
                                </div>

                                {/* 3D Map Illustration */}
                                <motion.div
                                    initial={{ y: 0 }}
                                    animate={{ y: [-5, 5, -5] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="relative z-10"
                                >
                                    <div className="bg-white p-3 rounded-2xl shadow-lg border border-emerald-100 flex items-center justify-center transform rotate-[-5deg]">
                                        <div className="w-16 h-12 bg-emerald-100 rounded-lg flex items-center justify-center overflow-hidden relative">
                                            <div className="grid grid-cols-4 grid-rows-3 gap-1 absolute inset-0 p-1">
                                                {[...Array(12)].map((_, i) => (
                                                    <div key={i} className={`bg-emerald-200/50 rounded-[2px] ${i === 5 ? 'bg-emerald-400' : ''}`} />
                                                ))}
                                            </div>
                                            <MapPin size={24} className="text-emerald-600 relative z-20 drop-shadow-sm" fill="white" />
                                        </div>
                                    </div>

                                    {/* Floating Elements */}
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute -top-4 -right-2 w-10 h-10 bg-emerald-200/30 rounded-full blur-xl"
                                    />
                                    <motion.div
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        className="absolute -bottom-2 -left-4 p-1.5 bg-white rounded-lg shadow-md border border-emerald-50"
                                    >
                                        <Navigation size={14} className="text-emerald-500 fill-emerald-500" />
                                    </motion.div>
                                </motion.div>
                            </div>
                        </div>

                        <h2 className="text-[24px] font-bold text-slate-900 mb-3 tracking-tight">Allow location access</h2>
                        <p className="text-slate-500 text-[15px] leading-relaxed px-4 mb-8 font-medium">
                            We will use it to help you set up your delivery location for a faster experience
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="px-8 pb-8 flex flex-col gap-3">
                        <button
                            onClick={onAllow}
                            className="w-full bg-[#10b981] hover:bg-[#059669] text-white h-[56px] rounded-2xl font-bold text-[16px] shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
                        >
                            Allow
                        </button>
                        <button
                            onClick={onManual}
                            className="w-full bg-white hover:bg-slate-50 text-[#10b981] border-2 border-[#10b981]/10 h-[56px] rounded-2xl font-bold text-[16px] transition-all active:scale-[0.98]"
                        >
                            Enter manually
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
