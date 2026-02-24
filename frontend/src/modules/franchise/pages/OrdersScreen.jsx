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
import { useNavigate } from 'react-router-dom';
import { useFranchiseOrders } from '../contexts/FranchiseOrdersContext';
import { cn } from '@/lib/utils';
import { useInventory } from '../contexts/InventoryContext';
import {
    X,
    UserCircle2,
    Check
} from 'lucide-react';
import { toast } from 'sonner';

// Enterprise Components
import MetricRow from '../components/cards/MetricRow';
import DataGrid from '../components/tables/DataGrid';
import FilterBar from '../components/tables/FilterBar';
import OrderHistoryModal from '../components/modals/OrderHistoryModal';

export default function OrdersScreen() {
    const navigate = useNavigate();
    const {
        orders: allOrders,
        updateOrderStatus,
        acceptOrder,
        assignDeliveryPartner,
        deliveryPartners,
        stats
    } = useFranchiseOrders();
    const { inventory, refreshInventory } = useInventory();
    const [activeTab, setActiveTab] = useState('new');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [processingOrderId, setProcessingOrderId] = useState(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedOrderForDispatch, setSelectedOrderForDispatch] = useState(null);
    const [isAssigning, setIsAssigning] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

    const handleAcceptOrder = async (orderId) => {
        setProcessingOrderId(orderId);
        await acceptOrder(orderId);
        setProcessingOrderId(null);
    };

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 600);
        return () => clearTimeout(timer);
    }, [activeTab]);

    const handleAction = async (orderId, newStatus) => {
        const order = allOrders.find(o => o.id === orderId);
        if (!order) return;

        if (newStatus === 'Dispatched') {
            const itemsToValidate = order.items.map(i => ({
                id: i.id || i.productId,
                qty: i.quantity || i.qty,
                name: i.name
            }));

            const insufficient = itemsToValidate.filter(i => {
                const stockItem = inventory.find(s => s.id === i.id || s.productId === i.id);
                return !stockItem || stockItem.currentStock < i.qty;
            });

            if (insufficient.length > 0) {
                toast.error(`Cannot proceed! Insufficient stock for: ${insufficient.map(i => i.name).join(', ')}`);
                return;
            }
        }

        await updateOrderStatus(orderId, newStatus);

        if (newStatus === 'Dispatched') {
            refreshInventory();
        }
    };

    const handleAssignDelivery = async (partnerId) => {
        if (!selectedOrderForDispatch || !partnerId) return;
        setIsAssigning(true);
        const success = await assignDeliveryPartner(selectedOrderForDispatch, partnerId);
        if (success) {
            setIsAssignModalOpen(false);
            setSelectedOrderForDispatch(null);
            refreshInventory(); // Stock is deducted on the backend during dispatch
        }
        setIsAssigning(false);
    };

    const tabs = [
        { id: 'new', label: 'New', icon: ShoppingBag },
        { id: 'ready', label: 'Ready to Dispatch', icon: Zap },
        { id: 'completed', label: 'Completed', icon: History }
    ];

    const filteredOrders = allOrders.filter(order => {
        let matchesTab = false;
        const status = (order.status || '').toLowerCase();

        if (activeTab === 'new') {
            matchesTab = ['placed', 'pending', 'new'].includes(status);
        } else if (activeTab === 'ready') {
            matchesTab = ['packed', 'dispatched', 'ready'].includes(status);
        } else if (activeTab === 'completed') {
            matchesTab = ['delivered', 'received', 'completed'].includes(status);
        }

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
                    <span className="font-bold text-slate-900 text-sm tracking-tight">{val}</span>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-[0.05em] mt-0.5">Order #{row.id}</span>
                </div>
            )
        },
        {
            header: 'Date & Time',
            key: 'dateTime',
            render: (val, row) => {
                const safeDate = (dateStr) => {
                    const d = new Date(dateStr);
                    return isNaN(d.getTime()) ? new Date() : d;
                };

                // Prioritize row.date/time if they are already formatted strings
                const displayDate = row.date || safeDate(row.timeline?.[0]?.time || Date.now()).toLocaleDateString();
                const displayTime = row.time || safeDate(row.timeline?.[0]?.time || Date.now()).toLocaleTimeString();

                return (
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-sm tracking-tight">{displayDate}</span>
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-[0.05em] mt-0.5">{displayTime}</span>
                    </div>
                );
            }
        },
        {
            header: 'Delivery Slot',
            key: 'deliverySlot',
            render: (val) => <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{val}</span>
        },
        {
            header: 'Amount',
            key: 'total',
            align: 'right',
            render: (val) => <span className="text-sm font-bold text-slate-900 tabular-nums">₹{(val || 0).toLocaleString()}</span>
        },
        {
            header: 'Total Items',
            key: 'items',
            render: (items) => <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{items.length} units</span>
        },
        {
            header: 'Action',
            key: 'actions',
            align: 'right',
            render: (_, row) => (
                <div className="flex items-center justify-end gap-2">
                    {activeTab === 'ready' && row.status === 'dispatched' && row.deliveryPartner && (
                        <div className="flex items-center gap-2 mr-4 bg-emerald-50 px-2 py-1 rounded-sm border border-emerald-100">
                            <UserCircle2 size={12} className="text-emerald-600" />
                            <span className="text-[10px] font-bold text-emerald-700 uppercase">{row.deliveryPartner?.fullName}</span>
                        </div>
                    )}
                    {activeTab === 'new' && (
                        <button
                            onClick={() => handleAction(row.id, 'Packed')}
                            disabled={processingOrderId === row.id}
                            className="p-1.5 px-3 text-xs font-bold uppercase text-emerald-600 border border-emerald-600 rounded-sm hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Mark Packed
                        </button>
                    )}
                    {activeTab === 'ready' && row.status === 'packed' && (
                        <button
                            onClick={() => {
                                setSelectedOrderForDispatch(row.id);
                                setIsAssignModalOpen(true);
                            }}
                            className="p-1.5 px-3 text-xs font-bold uppercase text-orange-600 border border-orange-600 rounded-sm hover:bg-orange-600 hover:text-white transition-all flex items-center gap-1.5"
                        >
                            <Truck size={12} /> Assign & Dispatch
                        </button>
                    )}
                    <button
                        onClick={() => navigate(`/franchise/orders/${row.id}`)}
                        className="p-1.5 px-3 text-xs font-bold uppercase text-slate-900 border border-slate-900 rounded-sm hover:bg-slate-900 hover:text-white transition-all"
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
                <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-r border-slate-200 pr-4">
                            <Home size={14} />
                            <ChevronRight size={12} />
                            <span>Franchise</span>
                            <ChevronRight size={12} />
                            <span className="text-slate-900 uppercase tracking-widest">Orders</span>
                        </div>
                        <h1 className="text-xl font-bold text-slate-900">Order Management</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors border border-slate-200 rounded-sm bg-white">
                            <Settings2 size={16} />
                        </button>
                        <button
                            onClick={() => setIsHistoryModalOpen(true)}
                            className="bg-slate-900 text-white px-4 py-2 rounded-sm text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm uppercase tracking-widest"
                        >
                            <History size={14} />
                            Order History
                        </button>
                    </div>
                </div>
            </div>

            {/* Performance Strip */}
            <div className="bg-white border-b border-slate-200 grid grid-cols-1 md:grid-cols-5">
                <MetricRow
                    label="New Orders"
                    value={stats.newOrders}
                    trend="Stable"
                    icon={ShoppingBag}
                />
                <MetricRow
                    label="Ready to Dispatch"
                    value={stats.readyToDispatch}
                    change={0}
                    trend="up"
                    icon={CheckCircle2}
                />
                <MetricRow
                    label="Out for Delivery"
                    value={stats.outForDelivery}
                    change={0}
                    trend="up"
                    icon={Truck}
                />
                <MetricRow
                    label="Completed"
                    value={stats.completedCount}
                    trend="Stable"
                    icon={History}
                />
                <MetricRow
                    label="Total Revenue"
                    value={`₹${stats.revenue.toLocaleString()}`}
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

            {/* Delivery Assignment Modal */}
            <AnimatePresence>
                {isAssignModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAssignModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-md bg-white rounded-sm shadow-2xl overflow-hidden"
                        >
                            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                        <Truck size={16} className="text-emerald-400" />
                                        Assign Delivery Partner
                                    </h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Order #{selectedOrderForDispatch?.slice(-6)}</p>
                                </div>
                                <button onClick={() => setIsAssignModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6">
                                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                    {deliveryPartners.length === 0 ? (
                                        <div className="text-center py-8">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No active partners found</p>
                                        </div>
                                    ) : (
                                        deliveryPartners.map((partner) => (
                                            <button
                                                key={partner._id}
                                                onClick={() => handleAssignDelivery(partner._id)}
                                                disabled={isAssigning}
                                                className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-sm hover:border-slate-900 hover:bg-white transition-all group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-200 rounded-sm flex items-center justify-center text-slate-500 font-black text-xs uppercase">
                                                        {partner.fullName.slice(0, 2)}
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{partner.fullName}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{partner.vehicleNumber} • {partner.vehicleType}</p>
                                                    </div>
                                                </div>
                                                <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                                                    <ChevronRight size={14} />
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                                <button
                                    onClick={() => setIsAssignModalOpen(false)}
                                    className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Order History Modal */}
            <OrderHistoryModal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
            />
        </div >
    );
}
