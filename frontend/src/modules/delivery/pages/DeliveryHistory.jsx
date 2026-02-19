import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Search, ChevronRight, TrendingUp, CheckCircle2, Package } from 'lucide-react';
import api from '@/lib/axios';

const DeliveryHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get('/orders/delivery/history');
                if (response.data.success) {
                    setHistory(response.data.results || []);
                }
            } catch (error) {
                console.error('Fetch history error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const totalEarnings = history.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    return (
        <div className="flex flex-col min-h-full bg-slate-50 pb-20">
            {/* Header */}
            <div className="px-6 pt-8 pb-4 bg-white sticky top-0 z-10 border-b border-border/10">
                <h1 className="text-2xl font-bold mb-4">Earnings History</h1>

                <div className="bg-primary/5 p-5 rounded-3xl flex items-center justify-between border border-primary/10 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                            <TrendingUp className="text-primary w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Total Earnings</p>
                            <p className="text-xl font-black text-foreground">₹{totalEarnings.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            className="w-full pl-9 pr-4 py-3 rounded-2xl border border-border bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                        />
                    </div>
                    <button className="p-3 rounded-2xl border border-border bg-white text-foreground active:scale-95 shadow-sm">
                        <Calendar className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* History List */}
            <div className="p-6">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-white border border-border rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : history.length > 0 ? (
                    <div className="space-y-4">
                        {history.map((item, i) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-white p-5 rounded-3xl border border-border shadow-sm flex items-center justify-between group border-l-4 border-l-primary"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary transition-colors">
                                        <CheckCircle2 className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-foreground">{item.customer}</h3>
                                        <p className="text-xs text-muted-foreground font-medium">{item.date} • {item.time}</p>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                    <span className="text-sm font-black text-primary">+ ₹{item.amount}</span>
                                    <span className="text-[8px] bg-green-500 text-white px-2 py-0.5 rounded-sm font-black uppercase tracking-tighter">Delivered</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 grayscale opacity-50">
                            <Package className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">No History Found</h3>
                        <p className="text-sm text-muted-foreground px-10">
                            Complete your first delivery to see your earnings history here!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryHistory;
