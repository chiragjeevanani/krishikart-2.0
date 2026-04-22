import { motion, AnimatePresence } from 'framer-motion';
import { Package, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NewTaskAlert({ isOpen, onClose, data }) {
    const navigate = useNavigate();

    if (!data) return null;

    const handleViewTask = () => {
        onClose();
        if (data.type === 'RETURN') {
            navigate('/delivery/return-pickups');
        } else {
            navigate('/delivery/active');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-sm"
                    >
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-emerald-100">
                            {/* Header */}
                            <div className="bg-emerald-500 p-6 text-center relative">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        rotate: [0, -10, 10, -10, 0]
                                    }}
                                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                                    className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner"
                                >
                                    <Package className="w-8 h-8 text-emerald-500" />
                                </motion.div>
                                <h3 className="text-xl font-bold text-white mb-1">
                                    {data.type === 'RETURN' ? 'New Return Pickup!' : 'New Delivery Task!'}
                                </h3>
                                <p className="text-emerald-100 text-sm font-medium">You have been assigned a new task</p>
                            </div>

                            {/* Content */}
                            <div className="p-6 bg-white">
                                <div className="space-y-4 mb-6 text-center">
                                    <p className="text-slate-600 text-sm">
                                        {data.message || "A new task requires your attention."}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="space-y-3">
                                    <button
                                        onClick={handleViewTask}
                                        className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                                        style={{ WebkitTapHighlightColor: 'transparent' }}
                                    >
                                        View Task
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="w-full py-3 px-4 text-slate-500 font-medium hover:bg-slate-50 rounded-xl transition-colors active:scale-[0.98]"
                                        style={{ WebkitTapHighlightColor: 'transparent' }}
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
