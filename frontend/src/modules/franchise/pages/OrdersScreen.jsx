import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    ShoppingBag,
    Truck,
    CheckCircle2,
    Clock,
    Zap,
    History,
    Home,
    ChevronRight,
    Search as SearchIcon,
    Settings2,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
    IndianRupee
} from 'lucide-react';
import { useFranchiseOrders } from '../contexts/FranchiseOrdersContext';
import { cn } from '@/lib/utils';
import { useInventory } from '../contexts/InventoryContext';
import { useNavigate } from 'react-router-dom';

// Enterprise Components
import MetricRow from '../components/cards/MetricRow';
import DataGrid from '../components/tables/DataGrid';
import FilterBar from '../components/tables/FilterBar';

export default function OrdersScreen() {
    const navigate = useNavigate();
    const { orders: allOrders, updateOrderStatus } = useFranchiseOrders();
    const { inventory, deductStock } = useInventory();
    const [activeTab, setActiveTab] = useState('new');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 600);
        return () => clearTimeout(timer);
    }, [activeTab]);

    const handleAction = (orderId, newStatus) => {
        const order = allOrders.find(o => o._id === orderId);
        if (!order) return;

        // Stock Validation Logic (Simplified for UI display)
        if (newStatus === 'preparing' || newStatus === 'out_for_delivery') {
            const itemsToValidate = order.items.map(i => ({
                id: i.id || i.productId,
                qty: i.quantity || i.qty,
                name: i.name
            }));

            const insufficient = itemsToValidate.filter(i => {
                const stockItem = inventory.find(s => s.id === i.id);
                return !stockItem || stockItem.currentStock < i.qty;
            });

            if (insufficient.length > 0) {
                alert(`Cannot proceed! Insufficient stock for: ${insufficient.map(i => i.name).join(', ')}`);
                return;
            }
        }

        if (newStatus === 'out_for_delivery') {
            deductStock(order.items.map(i => ({
                id: i.id || i.productId,
                qty: i.quantity || i.qty
            })));
        }

        updateOrderStatus(orderId, newStatus);
    };

    const tabs = [
        { id: 'new', label: 'New', icon: ShoppingBag },
        { id: 'preparing', label: 'Preparing', icon: Zap },
        { id: 'ready', label: 'Dispatch', icon: Truck },
        { id: 'delivered', label: 'Completed', icon: History }
    ];

    const filteredOrders = allOrders.filter(order => {
        let matchesTab = false;
        const status = (order.orderStatus || order.status || '').toLowerCase();
        if (activeTab === 'new') matchesTab = status === 'pending' || status === 'placed' || status === 'new' || status === 'processing';
        else if (activeTab === 'preparing') matchesTab = status === 'processing' || status === 'confirmed' || status === 'preparing';
        else if (activeTab === 'ready') matchesTab = status === 'ready' || status === 'out for delivery';
        else if (activeTab === 'delivered') matchesTab = status === 'delivered';

        const hotelName = order.hotelName || order.userId?.fullName || 'Unknown';
        const orderId = (order._id || order.id || '').toString();
        const matchesSearch = orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            hotelName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

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
            header: 'Date & Time',
            key: 'dateTime',
            render: (val, row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900 text-[10px] tracking-tight">{row.date || new Date(row.timeline?.[0]?.time || Date.now()).toLocaleDateString()}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.1em] mt-0.5">{row.time || new Date(row.timeline?.[0]?.time || Date.now()).toLocaleTimeString()}</span>
                </div>
            )
        },
        {
            header: 'Delivery Slot',
            key: 'deliverySlot',
            render: (val) => <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{val}</span>
        },
        {
            header: 'Amount',
            key: 'total',
            align: 'right',
            render: (val) => <span className="text-[11px] font-black text-slate-900 tabular-nums">₹{(val || 0).toLocaleString()}</span>
        },
        {
            header: 'Total Items',
            key: 'items',
            render: (items) => <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{items.length} units</span>
        },
        {
            header: 'Action',
            key: 'actions',
            align: 'right',
            render: (_, row) => (
                <div className="flex items-center justify-end gap-2">
                    {row.status === 'new' && (
                        <button
                            onClick={() => handleAction(row.id, 'preparing')}
                            className="p-1 px-3 text-[9px] font-black uppercase text-emerald-600 border border-emerald-600 rounded-sm hover:bg-emerald-600 hover:text-white transition-all"
                        >
                            Accept
                        </button>
                    )}
                    {row.status === 'preparing' && (
                        <button
                            onClick={() => handleAction(row.id, 'ready')}
                            className="p-1 px-3 text-[9px] font-black uppercase text-blue-600 border border-blue-600 rounded-sm hover:bg-blue-600 hover:text-white transition-all"
                        >
                            Ready
                        </button>
                    )}
                    {row.status === 'ready' && (
                        <button
                            onClick={() => handleAction(row.id, 'out_for_delivery')}
                            className="p-1 px-3 text-[9px] font-black uppercase text-orange-600 border border-orange-600 rounded-sm hover:bg-orange-600 hover:text-white transition-all"
                        >
                            Dispatch
                        </button>
                    )}
                    <button
                        onClick={() => navigate(`/franchise/orders/${row.id}`)}
                        className="p-1 px-2 text-[9px] font-black uppercase text-slate-900 border border-slate-900 rounded-sm hover:bg-slate-900 hover:text-white transition-all"
                    >
                        View
                    </button>
                </div>
            )
        }
    ];

    if (isLoading && !filteredOrders.length) {
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
                            <span>Franchise</span>
                            <ChevronRight size={10} />
                            <span className="text-slate-900 uppercase tracking-widest">Orders</span>
                        </div>
                        <h1 className="text-sm font-bold text-slate-900">Order Management</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors border border-slate-200 rounded-sm bg-white">
                            <Settings2 size={14} />
                        </button>
                        <button className="bg-slate-900 text-white px-3 py-1.5 rounded-sm text-[11px] font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm uppercase tracking-widest">
                            <History size={14} />
                            Order History
                        </button>
                    </div>
                </div>
            </div>

            {/* Performance Strip */}
            <div className="bg-white border-b border-slate-200 grid grid-cols-1 md:grid-cols-4">
                <MetricRow
                    label="New Orders"
                    value={allOrders.filter(o => o.status === 'new').length}
                    trend="Stable"
                    icon={ShoppingBag}
                />
                <MetricRow
                    label="Success Rate"
                    value="94.2%"
                    change={2.1}
                    trend="up"
                    icon={CheckCircle2}
                />
                <MetricRow
                    label="Avg Prep Time"
                    value="18m"
                    change={-5.4}
                    trend="up"
                    icon={Clock}
                />
                <MetricRow
                    label="Total Sales"
                    value={`₹${allOrders.reduce((acc, curr) => acc + (curr.total || 0), 0).toLocaleString()}`}
                    trend="Stable"
                    icon={IndianRupee}
                />
            </div>

            <div className="p-px bg-slate-200">
                <FilterBar
                    actions={
                        <div className="flex items-center gap-2">
                            <div className="flex items-center bg-slate-100 p-0.5 rounded-sm mr-4">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            setIsLoading(true);
                                            setActiveTab(tab.id);
                                        }}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all",
                                            activeTab === tab.id
                                                ? "bg-white text-slate-900 shadow-sm rounded-sm"
                                                : "text-slate-500 hover:text-slate-900"
                                        )}
                                    >
                                        <tab.icon size={12} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            <div className="relative group w-full max-w-xs">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search by Order ID or Store..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-white border border-slate-200 rounded-sm py-1.5 pl-9 pr-4 outline-none text-[11px] font-black text-slate-900 placeholder:text-slate-400 focus:border-slate-400 transition-all font-sans min-w-[240px]"
                                />
                            </div>
                        </div>
                    }
                />

                <div className="bg-white border-t border-slate-200">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="p-8 space-y-4"
                            >
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="h-12 bg-slate-50 rounded-sm animate-pulse" />
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="grid"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <DataGrid
                                    columns={orderColumns}
                                    data={filteredOrders}
                                    density="compact"
                                    showSearch={false}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
