import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Search, ChevronRight, TrendingUp, CheckCircle2 } from 'lucide-react';
import { deliveryHistory } from '../utils/mockData';

const DeliveryHistory = () => {
    return (
        <div className="flex flex-col min-h-full">
            {/* Header */}
            <div className="px-6 pt-8 pb-4 bg-white sticky top-0 z-10 border-b border-border/50">
                <h1 className="text-2xl font-bold mb-4">Earnings History</h1>

                <div className="bg-primary/5 p-5 rounded-2xl flex items-center justify-between border border-primary/20 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                            <TrendingUp className="text-primary w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">This Month</p>
                            <p className="text-xl font-bold text-foreground">₹12,450.00</p>
                        </div>
                    </div>
                    <button className="text-xs font-bold text-primary underline underline-offset-4">View Report</button>
                </div>

                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search history..."
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                        />
                    </div>
                    <button className="p-2.5 rounded-xl border border-border bg-white text-foreground active:scale-95">
                        <Calendar className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* History List */}
            <div className="p-6">
                <div className="space-y-4">
                    {deliveryHistory.map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-white p-4 rounded-2xl border border-border shadow-sm flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-foreground">{item.customer}</h3>
                                    <p className="text-xs text-muted-foreground">{item.date} • {item.time}</p>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-1">
                                <span className="text-sm font-bold text-primary">+ ₹{item.amount}</span>
                                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-tight">Delivered</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <button className="w-full mt-8 py-3 text-sm font-bold text-muted-foreground flex items-center justify-center gap-2">
                    View All History <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default DeliveryHistory;
