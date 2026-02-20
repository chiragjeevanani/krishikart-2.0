import { useState, useEffect } from 'react';
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
    Filter,
    Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';
import { toast } from 'sonner';

export default function DispatchHistoryScreen() {
    const navigate = useNavigate();
    const [dispatches, setDispatches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get('/procurement/vendor/my-assignments');
                if (response.data.success) {
                    // Filter for completed or dispatched orders
                    const completed = response.data.results.filter(o =>
                        ['completed', 'ready_for_pickup'].includes(o.status)
                    );
                    setDispatches(completed);
                }
            } catch (error) {
                console.error("History fetch failed", error);
                toast.error("Failed to load dispatch history");
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const filteredDispatches = dispatches.filter(d =>
        (d.invoice?.invoiceNumber || d._id).toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.franchiseId?.shopName || '').toLowerCase().includes(searchQuery.toLowerCase())
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

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-40">
                        <Loader2 className="animate-spin mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Consulting Audit Trails...</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        <AnimatePresence mode="popLayout">
                            {filteredDispatches.map((dispatch, idx) => (
                                <motion.div
                                    key={dispatch._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col gap-5 hover:border-primary/20 transition-all group active:scale-[0.98]"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                                dispatch.status === 'completed' ? "bg-emerald-50 text-emerald-500" : "bg-blue-50 text-blue-500"
                                            )}>
                                                <Truck size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-slate-900 tracking-tight">{dispatch.invoice?.invoiceNumber || dispatch._id}</h4>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <div className={cn(
                                                        "w-1.5 h-1.5 rounded-full shrink-0",
                                                        dispatch.status === 'completed' ? "bg-emerald-500" : "bg-blue-500 animate-pulse"
                                                    )} />
                                                    <span className={cn(
                                                        "text-[9px] font-black uppercase tracking-widest",
                                                        dispatch.status === 'completed' ? "text-emerald-500" : "text-blue-500"
                                                    )}>{dispatch.status === 'ready_for_pickup' ? 'In Transit' : dispatch.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                                                {dispatch.invoice?.invoiceDate ? 'Inv Date' : 'Updated'}
                                            </p>
                                            <p className="text-xs font-black text-slate-900 tracking-tight">
                                                {new Date(dispatch.invoice?.invoiceDate || dispatch.updatedAt).toLocaleDateString(undefined, {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                                            <div className="flex items-center gap-2 mb-1">
                                                <ChevronRight size={10} className="text-slate-300" />
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Target Node</span>
                                            </div>
                                            <p className="text-[11px] font-black text-slate-600 truncate">{dispatch.franchiseId?.shopName}</p>
                                        </div>
                                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Scale size={10} className="text-slate-300" />
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Authorized WT</span>
                                            </div>
                                            <p className="text-[11px] font-black text-slate-600">{dispatch.actualWeight || '0'} KG</p>
                                        </div>
                                    </div>

                                    <div className="flex items-end justify-between pt-4 border-t border-slate-50 mt-2">
                                        <div className="flex flex-col gap-2 overflow-hidden mr-4">
                                            {dispatch.items?.slice(0, 3).map((item, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                                        <Package size={10} className="text-slate-400" />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-700 truncate">{item.name}</span>
                                                    <span className="text-[9px] font-bold text-slate-400 shrink-0 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{item.quantity} * {item.unit}</span>
                                                </div>
                                            ))}
                                            {dispatch.items?.length > 3 && (
                                                <span className="text-[9px] font-bold text-slate-400 pl-7">+{dispatch.items.length - 3} more items</span>
                                            )}
                                        </div>
                                        <button className="shrink-0 text-[9px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-1 group-hover:translate-x-1 transition-transform mb-1">
                                            Manifest <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {filteredDispatches.length === 0 && !isLoading && (
                <div className="py-20 flex flex-col items-center justify-center text-center opacity-20">
                    <History size={48} strokeWidth={1} className="mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No logs found</p>
                </div>
            )}
        </div>
    );
}
