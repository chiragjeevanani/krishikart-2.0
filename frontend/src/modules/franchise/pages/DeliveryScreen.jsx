import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Truck,
    User,
    Phone,
    Navigation,
    CheckCircle2,
    Search,
    MapPin,
    Package,
    Clock,
    UserPlus,
    Ghost,
    Home,
    ChevronRight,
    RefreshCw,
    ShieldCheck,
    Settings2,
    ArrowRight,
    Zap
} from 'lucide-react';
import { useFranchiseOrders } from '../contexts/FranchiseOrdersContext';
import { cn } from '@/lib/utils';

// Enterprise Components
import MetricRow from '../components/cards/MetricRow';
import DataGrid from '../components/tables/DataGrid';
import FilterBar from '../components/tables/FilterBar';

export default function DeliveryScreen() {
    const { orders, updateOrderStatus } = useFranchiseOrders();
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 600);
        return () => clearTimeout(timer);
    }, []);

    const dispatchOrders = orders.filter(o =>
        (o.status === 'ready' || o.status === 'out_for_delivery') &&
        (o.hotelName.toLowerCase().includes(searchQuery.toLowerCase()) || o.id.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const readyCount = orders.filter(o => o.status === 'ready').length;
    const outCount = orders.filter(o => o.status === 'out_for_delivery').length;

    const deliveryPartners = [
        { id: 'DP001', name: 'Amit Kumar', phone: '+91 98765 43210', avatar: 'AK' },
        { id: 'DP002', name: 'Suresh Singh', phone: '+91 98765 43211', avatar: 'SS' },
        { id: 'DP003', name: 'Vikram Phogat', phone: '+91 98765 43212', avatar: 'VP' },
        { id: 'DP004', name: 'Rahul Dev', phone: '+91 98765 43213', avatar: 'RD' }
    ];

    if (isLoading) {
        return (
            <div className="p-4 space-y-4 animate-pulse bg-slate-50 min-h-screen">
                <div className="h-4 w-48 bg-slate-200 rounded" />
                <div className="h-16 bg-white border border-slate-200" />
                <div className="h-[500px] bg-white border border-slate-200" />
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
                            <span>Logistics Node</span>
                            <ChevronRight size={10} />
                            <span className="text-slate-900 uppercase tracking-widest">Dispatch Hub</span>
                        </div>
                        <h1 className="text-sm font-bold text-slate-900">Last-Mile Fulfillment Desk</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="bg-slate-900 text-white px-3 py-1.5 rounded-sm text-[11px] font-black flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm uppercase tracking-widest leading-none">
                            <Navigation size={14} />
                            Fleet Matrix
                        </button>
                    </div>
                </div>
            </div>

            {/* Performance Strip */}
            <div className="bg-white border-b border-slate-200 grid grid-cols-1 md:grid-cols-4">
                <MetricRow
                    label="Active Dispatch"
                    value={outCount}
                    trend="up"
                    icon={Truck}
                    sub="Couriers on Road"
                />
                <MetricRow
                    label="Staged for Delivery"
                    value={readyCount}
                    trend="Stable"
                    icon={Package}
                    sub="Queue Integrity: High"
                />
                <MetricRow
                    label="Fleet Utilization"
                    value="84%"
                    trend="up"
                    icon={Zap}
                />
                <MetricRow
                    label="Transit Security"
                    value="Encrypted"
                    trend="Stable"
                    icon={ShieldCheck}
                />
            </div>

            <div className="p-px bg-slate-200">
                <FilterBar
                    actions={
                        <div className="flex items-center gap-2">
                            <div className="relative group w-full max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={14} />
                                <input
                                    type="text"
                                    placeholder="Matrix Transit Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-white border border-slate-200 rounded-sm py-1.5 pl-9 pr-4 outline-none text-[11px] font-black text-slate-900 placeholder:text-slate-400 focus:border-slate-400 transition-all font-sans min-w-[240px]"
                                />
                            </div>
                            <button className="p-1.5 border border-slate-200 rounded-sm hover:bg-slate-100 transition-colors text-slate-400 bg-white">
                                <RefreshCw size={14} />
                            </button>
                        </div>
                    }
                />

                <div className="p-4 space-y-4">
                    <AnimatePresence mode="popLayout">
                        {dispatchOrders.length > 0 ? (
                            dispatchOrders.map((order) => (
                                <motion.div
                                    key={order.id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-white border border-slate-200 p-6 rounded-sm grid grid-cols-12 gap-8 items-start group relative transition-all hover:border-slate-900"
                                >
                                    <div className="col-span-12 lg:col-span-4 space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-sm bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all shrink-0">
                                                <Package size={22} />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-[14px] font-black text-slate-900 uppercase tracking-tight leading-none mb-2">{order.hotelName}</h4>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{order.id}</span>
                                                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight border-b border-slate-900 pb-px">{order.deliverySlot}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-slate-50/50 rounded-sm border border-slate-100 space-y-2">
                                            <div className="flex items-start gap-2 text-[11px] font-bold text-slate-500">
                                                <MapPin size={12} className="shrink-0 mt-0.5" />
                                                <p className="leading-snug">{order.address}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-span-12 lg:col-span-5">
                                        {order.status === 'ready' ? (
                                            <div className="space-y-3">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Protocol: Assign Fleet Operational Partner</p>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                    {deliveryPartners.map((dp) => (
                                                        <button
                                                            key={dp.id}
                                                            onClick={() => updateOrderStatus(order.id, 'out_for_delivery')}
                                                            className="flex flex-col items-center gap-2 p-3 bg-white border border-slate-200 rounded-sm hover:border-slate-900 hover:bg-slate-50 transition-all group/dp"
                                                        >
                                                            <div className="w-8 h-8 rounded-sm bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover/dp:bg-slate-900 group-hover/dp:text-white transition-all">
                                                                {dp.avatar}
                                                            </div>
                                                            <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">{dp.name.split(' ')[0]}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-6 p-4 bg-emerald-50/50 border border-emerald-100 rounded-sm">
                                                <div className="w-12 h-12 rounded-sm bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
                                                    <User size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-2">Transit Operations: Active</p>
                                                    <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-tight">Amit Kumar</h4>
                                                    <p className="text-[10px] font-bold text-slate-400 tabular-nums">+91 98765 43210</p>
                                                </div>
                                                <div className="w-px h-10 bg-emerald-200" />
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Est. Completion</span>
                                                    <span className="text-[11px] font-black text-slate-900 tabular-nums">14:20 HR</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-span-12 lg:col-span-3 flex lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-4 h-full">
                                        <div className={cn(
                                            "px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest border",
                                            order.status === 'ready' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-indigo-50 text-indigo-600 border-indigo-100"
                                        )}>
                                            {order.status === 'ready' ? 'Staged' : 'In-Transit'}
                                        </div>

                                        <div className="flex-1 lg:flex-none" />

                                        {order.status === 'out_for_delivery' && (
                                            <button
                                                onClick={() => updateOrderStatus(order.id, 'delivered')}
                                                className="w-full h-11 bg-slate-900 text-white rounded-sm font-black uppercase text-[10px] tracking-[0.2em] shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                                            >
                                                Confirm Delivery <ArrowRight size={14} />
                                            </button>
                                        )}
                                        {order.status === 'ready' && (
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Manifest Value</p>
                                                <p className="text-[14px] font-black text-slate-900 tabular-nums">₹{order.total.toLocaleString()}</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="py-32 flex flex-col items-center justify-center text-center opacity-40">
                                <Ghost size={64} strokeWidth={1} className="mb-4 text-slate-200" />
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Shipment Inactive</h3>
                                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Awaiting Stage Transition from Orders Pipeline</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
