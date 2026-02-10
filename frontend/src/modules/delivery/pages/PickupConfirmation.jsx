import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check,
    CheckCircle2,
    Package,
    ChevronLeft,
    HandMetal,
    AlertCircle
} from 'lucide-react';
import { activeDelivery } from '../utils/mockData';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

const PickupConfirmation = () => {
    const [items, setItems] = useState(activeDelivery.items.map(item => ({ ...item, checked: false })));
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    const toggleItem = (index) => {
        const newItems = [...items];
        newItems[index].checked = !newItems[index].checked;
        setItems(newItems);
    };

    const allChecked = items.every(item => item.checked);

    const handleConfirm = () => {
        if (!allChecked) return;
        setIsSuccess(true);
        setTimeout(() => {
            navigate(ROUTES.DASHBOARD);
        }, 2000);
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl mb-6"
                >
                    <CheckCircle2 className="w-16 h-16 text-primary" />
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold text-white text-center"
                >
                    Pickup Confirmed!
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-white/80 text-center mt-2"
                >
                    Starting your delivery route now.
                </motion.p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full">
            {/* Header */}
            <div className="px-6 pt-8 pb-4 bg-white sticky top-0 z-10 border-b border-border/50">
                <div className="flex items-center gap-4 mb-2">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full active:scale-90 transition-all">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold">Verify Pickup</h1>
                </div>
                <p className="text-sm text-muted-foreground">Please check all items before leaving franchise</p>
            </div>

            <div className="p-6 space-y-6">
                {/* Franchise Details */}
                <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                        <Package className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-primary">{activeDelivery.pickup.name}</h3>
                        <p className="text-xs text-muted-foreground">Order ID: {activeDelivery.id}</p>
                    </div>
                </div>

                {/* Checklist */}
                <div className="space-y-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Item Checklist</h2>
                    {items.map((item, i) => (
                        <motion.div
                            key={i}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleItem(i)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${item.checked ? 'bg-primary/5 border-primary/30' : 'bg-white border-border shadow-sm'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${item.checked ? 'bg-primary border-primary' : 'border-muted'}`}>
                                    {item.checked && <Check className="w-4 h-4 text-white font-bold" />}
                                </div>
                                <div>
                                    <p className={`text-sm font-bold ${item.checked ? 'text-primary' : 'text-foreground'}`}>{item.name}</p>
                                    <p className="text-xs text-muted-foreground">{item.qty}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Info Box */}
                {!allChecked && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                        <p className="text-xs text-amber-700 leading-relaxed">
                            Ensure you have checked all items and quantities. Discrepancies reported later may affect your rating.
                        </p>
                    </div>
                )}
            </div>

            {/* Action Button */}
            <div className="p-6 mt-auto">
                <motion.button
                    whileTap={allChecked ? { scale: 0.95 } : {}}
                    disabled={!allChecked}
                    onClick={handleConfirm}
                    className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 text-lg transition-all ${allChecked ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
                >
                    <HandMetal className="w-5 h-5" />
                    Confirm & Start Delivery
                </motion.button>
            </div>
        </div>
    );
};

export default PickupConfirmation;
