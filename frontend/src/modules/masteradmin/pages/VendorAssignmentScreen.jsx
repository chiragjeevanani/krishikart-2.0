import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Search,
    CheckCircle2,
    Clock,
    AlertCircle,
    ChevronRight,
    Star,
    MapPin,
    ArrowRight,
    X,
    Home,
    Terminal,
    Cpu,
    Activity,
    Zap
} from 'lucide-react';
import mockVendors from '../data/mockVendors.json';
import mockOrders from '../data/mockAdminOrders.json';
import { cn } from '@/lib/utils';

export default function VendorAssignmentScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isAssigning, setIsAssigning] = useState(false);
    const [assignmentSuccess, setAssignmentSuccess] = useState(false);

    const pendingOrders = mockOrders.filter(o => o.status === 'pending_assignment');

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 700);
        return () => clearTimeout(timer);
    }, []);

    const handleAssign = (vendor) => {
        setIsAssigning(true);
        setTimeout(() => {
            setIsAssigning(false);
            setAssignmentSuccess(true);
            setTimeout(() => {
                setAssignmentSuccess(false);
                setSelectedOrder(null);
            }, 2000);
        }, 1200);
    };

    if (isLoading) {
        return (
            <div className="p-4 space-y-4 animate-pulse">
                <div className="h-4 w-48 bg-slate-100 rounded" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-[600px] bg-slate-50 border border-slate-200 rounded-sm" />
                    <div className="h-[400px] bg-slate-900 rounded-sm" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Enterprise Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-r border-slate-200 pr-4">
                            <Home size={12} />
                            <ChevronRight size={10} />
                            <span>Logistics</span>
                            <ChevronRight size={10} />
                            <span className="text-slate-900 uppercase tracking-widest">Assignment Command</span>
                        </div>
                        <h1 className="text-sm font-bold text-slate-900">Optimization Queue</h1>
                    </div>
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Dense Pending Orders Ledger */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
                        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <Activity className="text-amber-500" size={14} />
                                Operational Queue
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-black rounded-sm uppercase tracking-widest tabular-nums">
                                    {pendingOrders.length} Objects Pending
                                </span>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-50">
                            {pendingOrders.map((order, index) => (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => setSelectedOrder(order)}
                                    className={cn(
                                        "px-4 py-3 flex items-center justify-between cursor-pointer transition-all border-l-2",
                                        selectedOrder?.id === order.id
                                            ? "bg-slate-50 border-slate-900"
                                            : "hover:bg-slate-50 border-transparent hover:border-slate-200"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-9 h-9 border border-slate-100 bg-slate-50 rounded-sm flex items-center justify-center text-slate-400 font-black text-[10px] tabular-nums">
                                            {order.id.split('-')[1]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-xs leading-none mb-1">{order.customer}</p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{order.franchise} // {order.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-slate-900 tabular-nums">₹{order.total.toLocaleString()}</p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter flex items-center justify-end gap-1">
                                                <Clock size={10} />
                                                12m ago
                                            </p>
                                        </div>
                                        <ChevronRight size={14} className={cn("text-slate-200 transition-all", selectedOrder?.id === order.id ? "text-slate-900 translate-x-1" : "")} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {pendingOrders.length === 0 && (
                        <div className="py-20 flex flex-col items-center justify-center text-center opacity-30 border border-slate-200 border-dashed rounded-sm bg-white">
                            <Zap size={32} className="text-slate-300 mb-2" />
                            <h3 className="text-sm font-bold text-slate-900">Queue Synchronized</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest">No active objects requiring assignment</p>
                        </div>
                    )}
                </div>

                {/* Right Column: Protocols & Intelligence */}
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-sm p-6 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Terminal size={120} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-6">
                                <Cpu className="text-emerald-400" size={16} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/80">Operational Protocols</span>
                            </div>
                            <h3 className="text-lg font-black tracking-tight leading-none mb-8">Assignment Logic // <span className="text-slate-500 font-bold">V 2.1</span></h3>
                            <div className="space-y-5">
                                {[
                                    { step: "01", label: "Queue Selection", desc: "Isolate pending objects from the primary optimization queue." },
                                    { step: "02", label: "Vendor Audit", desc: "Review real-time capacity and geospatial proximity data." },
                                    { step: "03", label: "Protocol Lock", desc: "Initialize the assignment to synchronize node notifications." }
                                ].map((step) => (
                                    <div key={step.step} className="flex gap-4">
                                        <span className="text-[10px] font-black tabular-nums text-slate-600 border border-slate-800 h-fit px-1.5 py-0.5 rounded-sm">{step.step}</span>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-white tracking-widest mb-1">{step.label}</p>
                                            <p className="text-[10px] font-medium text-slate-500 leading-relaxed">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-white border border-slate-200 rounded-sm">
                        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-50">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Load</span>
                            <span className="text-[10px] font-bold text-emerald-500 tabular-nums">Normal</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-[9px] font-bold text-slate-400 block uppercase">Throughput</span>
                                <span className="text-xs font-black text-slate-900 tabular-nums">1.2ms/req</span>
                            </div>
                            <div>
                                <span className="text-[9px] font-bold text-slate-400 block uppercase">Reliability</span>
                                <span className="text-xs font-black text-slate-900 tabular-nums">99.98%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assignment Drawer */}
            <AnimatePresence>
                {selectedOrder && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedOrder(null)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] z-[60]"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed right-0 top-0 h-full w-full max-w-md bg-white border-l border-slate-200 shadow-2xl z-[70] overflow-hidden flex flex-col"
                        >
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="px-2 py-0.5 bg-slate-900 text-white text-[9px] font-black rounded-sm uppercase tracking-widest">Assigning ID- {selectedOrder.id.split('-')[1]}</div>
                                    <button onClick={() => setSelectedOrder(null)} className="p-1.5 hover:bg-white border border-transparent hover:border-slate-200 rounded-sm text-slate-400 transition-colors">
                                        <X size={16} />
                                    </button>
                                </div>
                                <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">Select Fulfillment Partner</h2>
                                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest italic opacity-60">Fulfillment Recommendations for {selectedOrder.franchise}</p>

                                <div className="relative mt-4 group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={12} />
                                    <input
                                        type="text"
                                        placeholder="Filter nodes by ID or Name..."
                                        className="w-full bg-white border border-slate-200 rounded-sm py-2 pl-9 pr-4 outline-none text-[11px] font-bold focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all font-sans"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                                {mockVendors.map((vendor, index) => (
                                    <motion.div
                                        key={vendor.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white p-4 border border-slate-200 rounded-sm hover:border-slate-400 transition-all flex flex-col gap-4 group"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex gap-3">
                                                <div className="w-10 h-10 border border-slate-100 bg-slate-50 text-slate-400 rounded-sm flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                                    <Users size={18} />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-900 text-xs tracking-tight leading-tight">{vendor.name}</h4>
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <div className="flex items-center gap-1 text-amber-500 font-black text-[9px] tabular-nums">
                                                            <Star size={9} fill="currentColor" /> {vendor.rating}
                                                        </div>
                                                        <span className="text-slate-200">•</span>
                                                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{vendor.category}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Utilization</div>
                                                <div className="text-xs font-black text-slate-900 tabular-nums leading-none">{vendor.capacity}%</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-50">
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <MapPin size={10} />
                                                <span className="text-[9px] font-bold tabular-nums">2.4km Proximity</span>
                                            </div>
                                            <button
                                                disabled={isAssigning}
                                                onClick={() => handleAssign(vendor)}
                                                className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider px-3 py-2 rounded-sm hover:bg-slate-800 active:scale-[0.98] transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                                            >
                                                Initialize Assignment
                                                <ArrowRight size={12} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Success Overlay - High Impact Enterprise Style */}
            <AnimatePresence>
                {assignmentSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none bg-slate-900/40 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-slate-900 text-white p-10 border border-slate-700 rounded-sm shadow-2xl flex flex-col items-center text-center max-w-xs"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                                className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] mb-6"
                            >
                                <CheckCircle2 size={32} className="text-slate-900" />
                            </motion.div>
                            <h3 className="text-lg font-black tracking-tight leading-none mb-2">Protocol Verified</h3>
                            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">Partner Link Synchronized</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Diagnostics Strip */}
            <div className="px-4 py-1.5 bg-slate-900 text-white/40 flex items-center justify-between border-t border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest">
                        <div className="w-1 h-1 rounded-full bg-emerald-400" />
                        Logistics Gate: Active
                    </div>
                </div>
                <div className="text-[9px] font-bold uppercase tracking-widest tabular-nums">Node:KK-ASSIGN-v2.1</div>
            </div>
        </div>
    );
}
