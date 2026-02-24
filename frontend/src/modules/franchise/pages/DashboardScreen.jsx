import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingBag,
    Truck,
    TrendingUp,
    PackageCheck,
    Bell,
    ChevronRight,
    Zap,
    Wallet,
    AlertTriangle,
    ArrowUpRight,
    Clock,
    Home,
    Download,
    RefreshCw,
    MoreHorizontal,
    Search,
    IndianRupee,
    Briefcase,
    History,
    ShieldCheck,
    Monitor,
    CheckCircle2
} from 'lucide-react';
import { useFranchiseOrders } from '../contexts/FranchiseOrdersContext';
import { useInventory } from '../contexts/InventoryContext';
import { useGRN } from '../contexts/GRNContext';
import { useCOD } from '../contexts/CODContext';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useFranchiseAuth } from '../contexts/FranchiseAuthContext';
import { toast } from 'sonner';

// Enterprise Components
import MetricRow from '../components/cards/MetricRow';
import ChartPanel from '../components/cards/ChartPanel';
import DataGrid from '../components/tables/DataGrid';
import FilterBar from '../components/tables/FilterBar';

export default function DashboardScreen() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const { franchise } = useFranchiseAuth();
    const { stats, orders, refreshOrders } = useFranchiseOrders();
    const { getStockStats, refreshInventory } = useInventory();
    const { purchaseOrders } = useGRN();
    const { summary: codSummary } = useCOD();
    const [showKYCModal, setShowKYCModal] = useState(false);

    useEffect(() => {
        if (franchise && !franchise.isVerified) {
            setShowKYCModal(true);
        }
    }, [franchise]);

    const inventoryStats = getStockStats();
    const recentOrders = orders.slice(0, 10);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const orderColumns = [
        {
            header: 'Store / Shop',
            key: 'hotelName',
            render: (val, row) => (
                <div className="flex flex-col">
                    <span className="font-black text-slate-900 text-[11px] tracking-tight">{val}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.1em] mt-0.5">Order #{row.id}</span>
                </div>
            )
        },
        {
            header: 'Status',
            key: 'status',
            render: (val) => (
                <div className={cn(
                    "px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest border w-fit",
                    (val === 'delivered' || val === 'received') ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        val === 'cancelled' ? "bg-rose-50 text-rose-600 border-rose-100" :
                            "bg-amber-50 text-amber-600 border-amber-100"
                )}>
                    {val === 'received' ? 'Received' : val === 'delivered' ? 'Delivered' : val}
                </div>
            )
        },
        {
            header: 'Amount',
            key: 'total',
            align: 'right',
            render: (val) => <span className="text-[11px] font-black text-slate-900 tabular-nums">₹{(val || 0).toLocaleString()}</span>
        },
        {
            header: 'Delivery Slot',
            key: 'deliverySlot',
            render: (val) => <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{val}</span>
        },
        {
            header: 'Action',
            key: 'actions',
            align: 'right',
            render: (_, row) => (
                <button
                    onClick={() => navigate(`/franchise/orders/${row.id}`)}
                    className="p-1 px-2 text-[9px] font-black uppercase text-slate-900 border border-slate-900 rounded-sm hover:bg-slate-900 hover:text-white transition-all"
                >
                    View Details
                </button>
            )
        }
    ];

    if (isLoading) {
        return (
            <div className="p-4 space-y-4 animate-pulse bg-slate-50 min-h-screen">
                <div className="h-4 w-48 bg-slate-200 rounded" />
                <div className="h-16 bg-white border border-slate-200" />
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-1 bg-slate-200">
                    <div className="h-20 bg-white" />
                    <div className="h-20 bg-white" />
                    <div className="h-20 bg-white" />
                </div>
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
                            <span>Franchise</span>
                            <ChevronRight size={10} />
                            <span className="text-slate-900 uppercase tracking-widest">Dashboard</span>
                        </div>
                        <h1 className="text-sm font-bold text-slate-900">Manage Orders</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-slate-100 p-0.5 rounded-sm mr-2">
                            <button className="px-3 py-1 text-[9px] font-bold bg-white text-slate-900 shadow-sm rounded-sm uppercase tracking-widest">Today</button>
                            <button className="px-3 py-1 text-[9px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">History</button>
                        </div>
                        <button
                            onClick={() => {
                                refreshInventory();
                                refreshOrders();
                                toast.info("Refreshing dashboard data...");
                            }}
                            className="p-1.5 border border-slate-200 rounded-sm hover:bg-slate-50 text-slate-400">
                            <RefreshCw size={14} />
                        </button>
                        <button className="bg-slate-900 text-white px-3 py-1.5 rounded-sm text-[11px] font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm uppercase tracking-widest">
                            <Monitor size={14} />
                            Sales Terminal (POS)
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white border-b border-slate-200 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7">
                <MetricRow
                    label="Queued Orders"
                    value={stats.newOrders}
                    icon={ShoppingBag}
                />
                <MetricRow
                    label="Active Dispatch"
                    value={stats.outForDelivery}
                    icon={Truck}
                />
                <MetricRow
                    label="Completed"
                    value={stats.completedCount}
                    icon={CheckCircle2}
                />
                <MetricRow
                    label="Stock Health"
                    value={inventoryStats.lowStockCount}
                    icon={AlertTriangle}
                />
                <MetricRow
                    label="Est. Commission"
                    value={`₹${(stats.revenue * 0.1).toLocaleString()}`}
                    sub="10% of revenue"
                    icon={TrendingUp}
                />
                <MetricRow
                    label="Incoming PO"
                    value={purchaseOrders.length}
                    icon={PackageCheck}
                />
                <MetricRow
                    label="COD Liability"
                    value={`₹${(codSummary?.totalToDeposit || 0).toLocaleString()}`}
                    icon={Wallet}
                />
            </div>

            <div className="p-px bg-slate-200">
                {/* Advanced Task Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 bg-slate-200 gap-px">
                    <div className="xl:col-span-2 bg-white min-h-[500px]">
                        <FilterBar
                            actions={
                                <div className="flex items-center gap-4">
                                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Recent Orders</h2>
                                    <div className="h-4 w-px bg-slate-200" />
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded-sm">
                                        <ShieldCheck size={10} className="text-emerald-500" />
                                        <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">System Online</span>
                                    </div>
                                </div>
                            }
                        />

                        <DataGrid
                            columns={orderColumns}
                            data={recentOrders}
                            density="compact"
                        />
                    </div>

                    <div className="bg-white h-full">
                        {/* Stock Health Panel */}
                        <ChartPanel
                            title="Stock distribution"
                            subtitle="Current inventory split"
                            height={220}
                            className="bg-white border-b border-slate-100"
                        >
                            <div className="space-y-6 pt-2">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest mb-1">
                                        <span className="text-slate-500">Stock Availability</span>
                                        <span className="text-emerald-600">{inventoryStats.healthPercentage}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500" style={{ width: `${inventoryStats.healthPercentage}%` }} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest mb-1">
                                        <span className="text-slate-500">Critical Alerts</span>
                                        <span className="text-rose-600">{inventoryStats.lowStockCount} SKUs</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-rose-500" style={{ width: `${(inventoryStats.lowStockCount / (inventoryStats.totalItems || 1)) * 100}%` }} />
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate('/franchise/inventory')}
                                    className="w-full py-2.5 border border-slate-900 text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 hover:bg-slate-900 hover:text-white transition-all mt-4"
                                >
                                    Manage Stock
                                </button>
                            </div>
                        </ChartPanel>
                    </div>
                </div>
            </div>

            {/* Tactical Quick Actions */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-1.5 bg-slate-900 shadow-2xl rounded-sm border border-slate-700 lg:hidden">
                {[
                    { icon: PackageCheck, path: '/franchise/receiving' },
                    { icon: Zap, path: '/franchise/inventory' },
                    { icon: Truck, path: '/franchise/dispatch' },
                    { icon: Wallet, path: '/franchise/cash' },
                    { icon: Monitor, path: '/franchise/pos' }
                ].map((btn, i) => (
                    <button
                        key={i}
                        onClick={() => navigate(btn.path)}
                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-sm transition-all"
                    >
                        <btn.icon size={18} />
                    </button>
                ))}
            </div>

            {/* KYC Pending Modal */}
            <AnimatePresence>
                {showKYCModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-sm shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
                        >
                            <div className="p-8 text-center space-y-6">
                                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto border border-amber-100">
                                    <ShieldCheck size={40} className="text-amber-500" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Node Verification Required</h3>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                        Your franchise identity is currently <span className="text-amber-600 font-black">UNVERIFIED</span>.
                                        Please complete your document submission to activate order processing and node settlement.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={() => navigate('/franchise/documentation')}
                                        className="w-full py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-sm hover:bg-emerald-600 transition-all shadow-xl shadow-slate-100"
                                    >
                                        Go to Documentation
                                    </button>
                                    <button
                                        onClick={() => setShowKYCModal(false)}
                                        className="w-full py-3 bg-white text-slate-400 text-[9px] font-black uppercase tracking-widest hover:text-slate-900 transition-colors"
                                    >
                                        I'll do it later
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
