import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Truck,
    Navigation,
    Map as MapIcon,
    Clock,
    CheckSquare,
    AlertTriangle,
    Search,
    ChevronRight,
    Activity,
    IndianRupee,
    Timer,
    Home,
    Download,
    RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { initSocket, joinAdminDeliveryTracking } from '@/lib/socket.js';

// Enterprise Components
import MetricRow from '../components/cards/MetricRow';
import ChartPanel from '../components/cards/ChartPanel';
import DataGrid from '../components/tables/DataGrid';
import FilterBar from '../components/tables/FilterBar';
import ProfessionalTooltip from '../components/common/ProfessionalTooltip';

import { exportToCSV } from '@/lib/exportToCSV';

export default function DeliveryMonitoringScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active');
    const [orders, setOrders] = useState([]);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders/admin/all');
            if (response.data.success) {
                setOrders(response.data.results || []);
            }
        } catch (error) {
            console.error('Fetch orders error:', error);
            toast.error('Failed to load live deliveries');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();

        // Initializing Real-time tracking
        const socket = initSocket();
        joinAdminDeliveryTracking();

        socket.on('order_status_updated', (updatedOrder) => {
            setOrders(prev => {
                const index = prev.findIndex(o => o._id === updatedOrder._id);
                if (index !== -1) {
                    const newOrders = [...prev];
                    newOrders[index] = updatedOrder;
                    return newOrders;
                }
                return [updatedOrder, ...prev];
            });
            toast.info(`Order #${updatedOrder._id.slice(-6)} updated to ${updatedOrder.orderStatus}`);
        });

        return () => {
            socket.off('order_status_updated');
        };
    }, []);

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const response = await api.put(`/orders/admin/${orderId}/status`, { status: newStatus });
            if (response.data.success) {
                toast.success('Status updated successfully');
                // Socket will handle the state update for us as well, but we can update locally for snappiness
                setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const inTransitOrders = orders.filter(o => ['packed', 'dispatched'].includes(o.orderStatus?.toLowerCase()));
    const deliveredOrders = orders.filter(o => ['delivered', 'received'].includes(o.orderStatus?.toLowerCase()));

    const handleExport = () => {
        const columns = [
            { header: 'Order ID', key: '_id' },
            { header: 'Customer', key: 'userId' },
            { header: 'Shop', key: 'franchiseId' },
            { header: 'Rider', key: 'deliveryPartnerId' },
            { header: 'Status', key: 'orderStatus' },
            { header: 'Amount', key: 'totalAmount' }
        ];

        const data = (activeTab === 'active' ? inTransitOrders : deliveredOrders).map(o => ({
            ...o,
            userId: o.userId?.fullName || 'Guest',
            franchiseId: o.franchiseId?.franchiseName || 'N/A',
            deliveryPartnerId: o.deliveryPartnerId?.fullName || 'Not Assigned'
        }));

        exportToCSV(`Delivery_Report_${activeTab}`, columns, data);
    };

    const slotPerformance = [
        { slot: '6AM-9AM', success: 98, volume: 145 },
        { slot: '9AM-12PM', success: 94, volume: 220 },
        { slot: '12PM-3PM', success: 88, volume: 180 },
        { slot: '3PM-6PM', success: 91, volume: 195 },
        { slot: '6PM-9PM', success: 96, volume: 110 }
    ];

    const unitColumns = [
        {
            header: 'Order ID',
            key: '_id',
            render: (val) => <span className="font-bold text-slate-900 tracking-wider">#{val?.slice(-6).toUpperCase()}</span>
        },
        {
            header: 'Customer',
            key: 'userId',
            render: (val) => <span className="font-medium text-slate-600">{val?.fullName || 'Guest'}</span>
        },
        {
            header: 'Shop Name',
            key: 'franchiseId',
            render: (val) => <span className="font-medium text-slate-600">{val?.franchiseName || 'Staging Zone'}</span>
        },
        {
            header: 'Rider',
            key: 'deliveryPartnerId',
            render: (val) => (
                <div className="flex items-center gap-1.5 py-0.5 px-2 bg-blue-50 rounded-sm w-fit border border-blue-100">
                    <Truck size={10} className="text-blue-500" />
                    <span className="text-[10px] font-bold text-blue-700 uppercase">{val?.fullName || 'Self/Not Assigned'}</span>
                </div>
            )
        },
        {
            header: 'Slot',
            key: 'deliverySlot',
            render: (val) => (
                <div className="flex items-center gap-1.5 py-0.5 px-2 bg-slate-100 rounded-sm w-fit border border-slate-200">
                    <Clock size={10} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-600 uppercase">{val || 'Standard'}</span>
                </div>
            )
        },
        {
            header: 'Status',
            key: 'orderStatus',
            render: (val, row) => (
                <select
                    value={val}
                    onChange={(e) => handleStatusUpdate(row._id, e.target.value)}
                    className={cn(
                        "text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-sm border outline-none bg-white",
                        val === 'Placed' && "text-slate-500 border-slate-200",
                        val === 'Packed' && "text-amber-600 border-amber-200 bg-amber-50",
                        val === 'Dispatched' && "text-blue-600 border-blue-200 bg-blue-50",
                        val === 'Delivered' && "text-emerald-600 border-emerald-200 bg-emerald-50",
                        val === 'Cancelled' && "text-red-600 border-red-200 bg-red-50"
                    )}
                >
                    {['Placed', 'Packed', 'Dispatched', 'Delivered', 'Received', 'Cancelled'].map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            )
        },
        {
            header: 'Payment',
            key: 'paymentMethod',
            render: (val) => (
                <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border",
                    val === 'Prepaid' || val === 'Wallet' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                )}>
                    {val || 'COD'}
                </span>
            )
        },
        {
            header: 'Amount',
            key: 'totalAmount',
            align: 'right',
            render: (val) => <span className="font-bold text-slate-900 leading-none">₹{val?.toLocaleString() || 0}</span>
        }
    ];

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
            {/* Simple Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">Delivery Tracking</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Track and manage customer deliveries</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-slate-100 p-1 rounded-sm">
                            <button
                                onClick={() => setActiveTab('active')}
                                className={cn(
                                    "px-4 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all",
                                    activeTab === 'active' ? "bg-white text-slate-900 shadow-sm rounded-sm" : "text-slate-500 hover:text-slate-900"
                                )}
                            >
                                Active Orders
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={cn(
                                    "px-4 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all",
                                    activeTab === 'history' ? "bg-white text-slate-900 shadow-sm rounded-sm" : "text-slate-500 hover:text-slate-900"
                                )}
                            >
                                Past Orders
                            </button>
                        </div>
                        <button
                            onClick={handleExport}
                            className="bg-slate-900 text-white px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-colors"
                        >
                            <Download size={13} />
                            Download Report
                        </button>
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="bg-white border-b border-slate-200 grid grid-cols-1 md:grid-cols-4">
                <MetricRow
                    label="Success Rate"
                    value="98.2%"
                    change={0.4}
                    trend="up"
                    icon={Activity}
                    sparklineData={[97, 97.5, 98, 97.8, 98.2, 98.1, 98.2].map(v => ({ value: v }))}
                />
                <MetricRow
                    label="Orders on the Way"
                    value={inTransitOrders.length.toString()}
                    change={12.5}
                    trend="up"
                    icon={Navigation}
                    sparklineData={[1, 0, 1, 1, 2, 1, 1].map(v => ({ value: v }))}
                />
                <MetricRow
                    label="Delivered Today"
                    value={deliveredOrders.length.toString()}
                    change={5.2}
                    trend="up"
                    icon={CheckSquare}
                    sparklineData={[0, 1, 1, 0, 1, 1, 1].map(v => ({ value: v }))}
                />
                <MetricRow
                    label="Average Delivery Time"
                    value="14.2m"
                    change={-2.1}
                    trend="up"
                    icon={Timer}
                    sparklineData={[16, 15.5, 15, 14.8, 14.2, 14.5, 14.2].map(v => ({ value: v }))}
                />
            </div>

            {/* Main Operational Ledger */}
            <div className="flex flex-col gap-px">
                <FilterBar
                    actions={
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-100">REAL-TIME</span>
                        </div>
                    }
                />

                <div className="bg-white">
                    <DataGrid
                        title={activeTab === 'active' ? "Active Orders" : "Order History"}
                        columns={unitColumns}
                        data={activeTab === 'active' ? inTransitOrders : deliveredOrders}
                        density="compact"
                    />

                    <div className="p-6 bg-slate-50 border-t border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Updates</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white border border-slate-200 p-4 rounded-sm flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                                <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-slate-900">Busy evening expected</p>
                                    <p className="text-[11px] text-slate-500 mt-1">Many orders are expected at 6 PM. Make sure enough riders are available.</p>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 p-4 rounded-sm flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                                <CheckSquare size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-slate-900">Morning orders done</p>
                                    <p className="text-[11px] text-slate-500 mt-1">All 145 orders from this morning were delivered on time. Good job!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
