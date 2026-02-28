import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, FileText, FileX, Store, ChevronRight } from 'lucide-react';

export default function BusinessTypeSelector({ isOpen, onSelect, onClose }) {
    const [selected, setSelected] = useState('registered');

    if (!isOpen) return null;

    const options = [
        {
            id: 'registered',
            title: 'I have GST or FSSAI',
            subtext: 'For registered businesses',
            icon: <FileText size={20} />,
            benefits: ['Better prices', 'Access to credit'],
        },
        {
            id: 'unregistered',
            title: "I don't have GST or FSSAI",
            subtext: 'For non-registered businesses',
            icon: <FileX size={20} />,
            benefits: [],
        }
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    className="bg-white rounded-[40px] w-full max-w-[420px] overflow-hidden shadow-2xl relative flex flex-col h-auto max-h-[90vh]"
                >
                    {/* Main Content Scrollable Area */}
                    <div className="p-8 pb-4 flex flex-col items-center overflow-y-auto">
                        {/* Header Illustration */}
                        <div className="mb-8 relative">
                            <div className="w-40 h-40 bg-emerald-50 rounded-full flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-white/40 backdrop-blur-sm z-10" />

                                {/* Visual Representation of Business/Shop */}
                                <div className="relative z-20 flex flex-col items-center">
                                    <motion.div
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ duration: 4, repeat: Infinity }}
                                        className="p-4 bg-white rounded-2xl shadow-lg border border-emerald-100"
                                    >
                                        <Store size={48} className="text-[#10b981]" strokeWidth={1.5} />
                                    </motion.div>
                                </div>

                                {/* Decorative circles */}
                                <div className="absolute top-4 left-4 w-4 h-4 rounded-full bg-emerald-200/40" />
                                <div className="absolute bottom-10 right-8 w-6 h-6 rounded-full bg-emerald-300/30" />
                            </div>
                        </div>

                        <h2 className="text-[26px] font-black text-slate-900 mb-8 tracking-tight text-center leading-tight">
                            Select your business type
                        </h2>

                        {/* Options List */}
                        <div className="w-full space-y-4">
                            {options.map((option) => (
                                <div
                                    key={option.id}
                                    onClick={() => setSelected(option.id)}
                                    className={`relative p-5 rounded-[24px] border-2 cursor-pointer transition-all duration-300 ${selected === option.id
                                            ? 'border-[#10b981] bg-emerald-50/50 shadow-md translate-y-[-2px]'
                                            : 'border-slate-100 bg-white hover:border-slate-200'
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl flex items-center justify-center transition-colors ${selected === option.id ? 'bg-[#10b981] text-white shadow-lg' : 'bg-slate-50 text-slate-400'
                                            }`}>
                                            {option.icon}
                                        </div>

                                        <div className="flex-1 pr-8">
                                            <h3 className={`text-[17px] font-bold leading-none mb-2 ${selected === option.id ? 'text-slate-900' : 'text-slate-800'
                                                }`}>
                                                {option.title}
                                            </h3>
                                            <p className="text-[13px] text-slate-500 font-medium">
                                                {option.subtext}
                                            </p>

                                            {/* Benefits (only show when selected and if present) */}
                                            {selected === option.id && option.benefits.length > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="mt-4 pt-4 border-t border-[#10b981]/10 space-y-2"
                                                >
                                                    {option.benefits.map((benefit, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 text-[13px] font-bold text-emerald-700">
                                                            <Check size={14} className="text-[#10b981]" strokeWidth={3} />
                                                            {benefit}
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Custom Radio Circle */}
                                        <div className="absolute top-6 right-6 flex items-center justify-center">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selected === option.id ? 'border-[#10b981]' : 'border-slate-200'
                                                }`}>
                                                {selected === option.id && (
                                                    <div className="w-3 h-3 rounded-full bg-[#10b981]" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Persistent Footer Button */}
                    <div className="p-8 pt-4">
                        <button
                            onClick={() => onSelect(selected)}
                            disabled={!selected}
                            className="w-full bg-[#10b981] hover:bg-[#059669] disabled:opacity-50 text-white h-[64px] rounded-[24px] font-black text-[18px] shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            Next <ChevronRight size={20} strokeWidth={3} />
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
