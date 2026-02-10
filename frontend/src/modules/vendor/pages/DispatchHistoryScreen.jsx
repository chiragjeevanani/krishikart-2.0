import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    History,
    Search,
    ArrowLeft,
    Truck,
    ChevronRight,
    Calendar,
    Package,
    Scale,
    Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useOrders } from '@/modules/user/contexts/OrderContext';

const mockDispatches = [
    {
        id: 'GC-12894',
        date: '2026-01-28',
        time: '14:30',
        hub: 'South Delhi Hub',
        weight: '42.5 KG',
        status: 'In Transit',
        items: 12
    },
    {
        id: 'GC-11562',
        date: '2026-01-27',
        time: '10:15',
        hub: 'Gurugram Central Hub',
        weight: '68.2 KG',
        status: 'Delivered',
        items: 24
    },
    {
        id: 'GC-09841',
        date: '2026-01-25',
        time: '16:45',
        hub: 'Noida North Hub',
        weight: '31.0 KG',
        status: 'Delivered',
        items: 8
    }
];

export default function DispatchHistoryScreen() {
    const navigate = useNavigate();
    const { orders: contextOrders } = useOrders();
    const [searchQuery, setSearchQuery] = useState('');

    // Merge mock dispatches with live completed orders
    const liveDispatches = contextOrders
        .filter(o => o.status === 'completed')
        .map(o => ({
            id: `GC-${o.id.split('-')[1] || o.id.slice(-5)}`,
            orderId: o.id,
            date: o.date || new Date().toISOString().split('T')[0],
            time: 'Just Now',
            hub: o.franchise || 'Main Center',
            weight: '45.0 KG',
            status: 'Delivered',
            items: o.items?.length || 0
        }));

    const allDispatches = [...liveDispatches, ...mockDispatches];

    const filteredDispatches = allDispatches.filter(d =>
        d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.hub.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-20">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-slate-100">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">Dispatch History</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audit Trail & Logs</p>
                    </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                    <History size={20} />
                </div>
            </header>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                    type="text"
                    placeholder="Search Consignment ID or Hub..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 bg-white border border-slate-100 rounded-2xl text-xs font-bold transition-all outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20"
                />
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Recent Dispatches</h2>
                    <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                        <Filter size={16} />
                    </button>
                </div>

                <div className="grid gap-4">
                    <AnimatePresence mode="popLayout">
                        {filteredDispatches.map((dispatch, idx) => (
                            <motion.div
                                key={dispatch.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => navigate(`/vendor/orders/${dispatch.orderId || 'ORD-2091'}`)}
                                className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col gap-5 hover:border-primary/20 transition-all group cursor-pointer active:scale-[0.98]"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                            dispatch.status === 'Delivered' ? "bg-emerald-50 text-emerald-500" : "bg-blue-50 text-blue-500"
                                        )}>
                                            <Truck size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-900 tracking-tight">{dispatch.id}</h4>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full shrink-0",
                                                    dispatch.status === 'Delivered' ? "bg-emerald-500" : "bg-blue-500 animate-pulse"
                                                )} />
                                                <span className={cn(
                                                    "text-[9px] font-black uppercase tracking-widest",
                                                    dispatch.status === 'Delivered' ? "text-emerald-500" : "text-blue-500"
                                                )}>{dispatch.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dispatch.date}</p>
                                        <p className="text-[9px] font-bold text-slate-300 uppercase mt-0.5">{dispatch.time}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                                        <div className="flex items-center gap-2 mb-1">
                                            <ChevronRight size={10} className="text-slate-300" />
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Target Hub</span>
                                        </div>
                                        <p className="text-[11px] font-black text-slate-600 truncate">{dispatch.hub}</p>
                                    </div>
                                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Scale size={10} className="text-slate-300" />
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Net WT</span>
                                        </div>
                                        <p className="text-[11px] font-black text-slate-600">{dispatch.weight}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg">
                                            <Package size={10} className="text-slate-400" />
                                            <span className="text-[9px] font-black text-slate-600">{dispatch.items} Items</span>
                                        </div>
                                    </div>
                                    <button className="text-[9px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                        Manifest <ChevronRight size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredDispatches.length === 0 && (
                        <div className="py-20 flex flex-col items-center justify-center text-center opacity-20">
                            <History size={48} strokeWidth={1} className="mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No logs found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
