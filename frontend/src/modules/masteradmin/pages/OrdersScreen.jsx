import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    Download,
    Plus,
    ChevronDown,
    X,
    Users,
    Star,
    MapPin,
    ArrowRight,
    ShoppingBag,
    Home,
    ChevronRight,
    ShoppingBasket,
    Activity,
    Clock,
    CheckCircle2,
    Briefcase,
    FileText,
    Settings2
} from 'lucide-react';
import OrdersTable from '../components/tables/OrdersTable';
import mockOrders from '../data/mockAdminOrders.json';
import mockVendors from '../data/mockVendors.json';
import { useOrders } from '@/modules/user/contexts/OrderContext';
import { cn } from '@/lib/utils';

// Enterprise Components
import MetricRow from '../components/cards/MetricRow';
import FilterBar from '../components/tables/FilterBar';

export default function OrdersScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const { orders: contextOrders, updateOrderStatus } = useOrders();

    // Combine context orders with mock orders
    const allOrders = [...contextOrders, ...mockOrders.filter(m => !contextOrders.find(c => c.id === m.id))];

    const [selectedOrderForProcurement, setSelectedOrderForProcurement] = useState(null);

    const handleOrderAction = (orderId, newStatus, additionalData = {}) => {
        if (newStatus === 'initiate_procurement') {
            const order = allOrders.find(o => o.id === orderId);
            setSelectedOrderForProcurement(order);
            return;
        }

        if (contextOrders.find(o => o.id === orderId)) {
            updateOrderStatus(orderId, newStatus, additionalData);
        } else {
            console.log(`Action: ${newStatus} for Order: ${orderId}`);
        }
    };

    const handleFinalizeProcurement = (vendor) => {
        if (selectedOrderForProcurement) {
            handleOrderAction(selectedOrderForProcurement.id, 'assigned', {
                assignedVendor: vendor.name
            });
            setSelectedOrderForProcurement(null);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 700);
        return () => clearTimeout(timer);
    }, []);

    const filteredOrders = allOrders.filter(order => {
        const customerName = order.customer || 'Unknown';
        const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === 'all' || order.status.toLowerCase() === activeFilter.toLowerCase();
        return matchesSearch && matchesFilter;
    });

    if (isLoading) {
        return (
            <div className="p-4 space-y-4 animate-pulse">
                <div className="h-4 w-48 bg-slate-100 rounded" />
                <div className="h-16 bg-slate-50 border border-slate-200" />
                <div className="h-[500px] bg-slate-50 border border-slate-200" />
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
                            <span>Admin Panel</span>
                            <ChevronRight size={10} />
                            <span className="text-slate-900 uppercase tracking-widest">Orders</span>
                        </div>
                        <h1 className="text-sm font-bold text-slate-900">Order Dashboard</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-sm text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                            <FileText size={13} className="text-slate-400" />
                            <span>Export CSV</span>
                        </button>
                        <button className="bg-slate-900 text-white px-3 py-1.5 rounded-sm text-[11px] font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors">
                            <Plus size={13} />
                            New Order
                        </button>
                    </div>
                </div>
            </div>

            {/* Performance KPIs */}
            <div className="bg-white border-b border-slate-200 grid grid-cols-1 md:grid-cols-4">
                <MetricRow
                    label="Active Payouts"
                    value="₹1.4M"
                    change={8.4}
                    trend="up"
                    icon={Briefcase}
                    sparklineData={[1.1, 1.2, 1.4, 1.3, 1.4, 1.5, 1.4].map(v => ({ value: v }))}
                />
                <MetricRow
                    label="Volume"
                    value={allOrders.length.toString()}
                    change={12.5}
                    trend="up"
                    icon={ShoppingBasket}
                    sparklineData={[110, 115, 120, 118, 125, 122, 125].map(v => ({ value: v }))}
                />
                <MetricRow
                    label="Fulfillment Rate"
                    value="94.2%"
                    change={2.1}
                    trend="up"
                    icon={Activity}
                    sparklineData={[92, 93, 94, 93.5, 94.2, 94, 94.2].map(v => ({ value: v }))}
                />
                <MetricRow
                    label="Average Time"
                    value="18.5m"
                    change={-1.2}
                    trend="up"
                    icon={Clock}
                    sparklineData={[20, 19, 18.5, 19, 18.5, 18.8, 18.5].map(v => ({ value: v }))}
                />
            </div>

            {/* Operational Ledger */}
            <div className="flex flex-col gap-0 p-px">
                <FilterBar
                    actions={
                        <div className="flex items-center gap-2">
                            <div className="flex items-center bg-slate-100 p-0.5 rounded-sm">
                                <button
                                    onClick={() => setActiveFilter('all')}
                                    className={cn(
                                        "px-3 py-1 text-[10px] font-bold transition-all",
                                        activeFilter === 'all' ? "bg-white text-slate-900 shadow-sm rounded-sm" : "text-slate-500 hover:text-slate-900"
                                    )}
                                >
                                    All Orders
                                </button>
                                <button
                                    onClick={() => setActiveFilter('pending_assignment')}
                                    className={cn(
                                        "px-3 py-1 text-[10px] font-bold transition-all",
                                        activeFilter === 'pending_assignment' ? "bg-white text-slate-900 shadow-sm rounded-sm" : "text-slate-500 hover:text-slate-900"
                                    )}
                                >
                                    Pending
                                </button>
                                <button
                                    onClick={() => setActiveFilter('in_transit')}
                                    className={cn(
                                        "px-3 py-1 text-[10px] font-bold transition-all",
                                        activeFilter === 'in_transit' ? "bg-white text-slate-900 shadow-sm rounded-sm" : "text-slate-500 hover:text-slate-900"
                                    )}
                                >
                                    In Transit
                                </button>
                            </div>
                            <button className="p-1.5 border border-slate-200 rounded-sm hover:bg-slate-100 transition-colors text-slate-400">
                                <Settings2 size={14} />
                            </button>
                        </div>
                    }
                />

                <div className="bg-white border-t border-slate-200">
                    <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
                        <div className="relative group w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors" size={14} />
                            <input
                                type="text"
                                placeholder="Search by Order ID, Customer Name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-sm py-1.5 pl-9 pr-4 outline-none text-[11px] font-medium placeholder:text-slate-400 focus:border-slate-400 transition-all font-sans"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest tabular-nums">Showing {filteredOrders.length} records</span>
                        </div>
                    </div>

                    <OrdersTable orders={filteredOrders} onAction={handleOrderAction} />

                    {filteredOrders.length === 0 && (
                        <div className="py-20 flex flex-col items-center text-center bg-white border-t border-slate-100">
                            <div className="w-12 h-12 bg-slate-50 rounded-sm flex items-center justify-center text-slate-300 mb-4 border border-slate-100">
                                <ShoppingBasket size={24} />
                            </div>
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">No orders found</h3>
                            <p className="text-[10px] text-slate-400 mt-1 font-medium uppercase tracking-widest">Try changing your search or filters</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Enterprise Procurement Drawer */}
            <AnimatePresence>
                {selectedOrderForProcurement && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedOrderForProcurement(null)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] z-[60]"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "tween", duration: 0.3, ease: "circOut" }}
                            className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-[0_0_50px_rgba(0,0,0,0.1)] z-[70] overflow-hidden flex flex-col border-l border-slate-200"
                        >
                            {/* Drawer Header */}
                            <div className="p-6 border-b border-slate-200 bg-slate-50/50">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-sm bg-slate-900 flex items-center justify-center text-white">
                                            <Briefcase size={16} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Order Assignment</span>
                                            <span className="text-xs font-bold text-slate-900 mt-1 uppercase tracking-tight">Assign Vendor</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedOrderForProcurement(null)}
                                        className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-sm text-slate-400 transition-all"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums">#{selectedOrderForProcurement.id}</h2>
                                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-1">{selectedOrderForProcurement.customer} • {selectedOrderForProcurement.franchise}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Payload Value</span>
                                        <span className="text-xl font-black text-slate-900 tabular-nums">₹{selectedOrderForProcurement.total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Vendor Selection List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Qualified Supply Partners</h3>
                                {mockVendors.map((vendor) => (
                                    <div
                                        key={vendor.id}
                                        className="bg-white p-4 border border-slate-200 rounded-sm hover:border-slate-400 transition-all group relative overflow-hidden"
                                    >
                                        <div className="flex items-start justify-between relative z-10">
                                            <div className="flex gap-4">
                                                <div className="w-10 h-10 rounded-sm bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                                    <Users size={18} />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-900 tracking-tight">{vendor.name}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="flex items-center gap-1 text-slate-500 font-bold text-[10px]">
                                                            <Star size={10} className="text-amber-500 fill-amber-500" />
                                                            <span className="tabular-nums">{vendor.rating}</span>
                                                        </div>
                                                        <span className="text-[10px] text-slate-200">•</span>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{vendor.category}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1 tracking-widest">Efficiency</span>
                                                <span className="text-xs font-bold text-slate-900 tabular-nums">{vendor.capacity}%</span>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <MapPin size={12} />
                                                <span className="text-[10px] font-bold uppercase tracking-wide">Primary Hub</span>
                                            </div>
                                            <button
                                                onClick={() => handleFinalizeProcurement(vendor)}
                                                className="bg-white border border-slate-900 text-slate-900 text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-sm hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2"
                                            >
                                                Assign Partner
                                                <ArrowRight size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Drawer Footer */}
                            <div className="p-4 bg-white border-t border-slate-200">
                                <div className="bg-slate-900 rounded-sm p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Activity size={16} className="text-emerald-400" />
                                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Standard Service Active</span>
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Policy Rev. 4.2</span>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
