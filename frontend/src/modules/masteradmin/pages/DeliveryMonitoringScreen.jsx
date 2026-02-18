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
import mockOrders from '../data/mockAdminOrders.json';
import { cn } from '@/lib/utils';

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

    const inTransitOrders = mockOrders.filter(o => o.status === 'in_transit');
    const deliveredOrders = mockOrders.filter(o => o.status === 'delivered');

    const handleExport = () => {
        const columns = [
            { header: 'Order ID', key: 'id' },
            { header: 'Customer', key: 'customer' },
            { header: 'Shop', key: 'franchise' },
            { header: 'Rider', key: 'vendor' },
            { header: 'Status', key: 'status' },
            { header: 'Amount', key: 'total' }
        ];

        const data = (activeTab === 'active' ? inTransitOrders : deliveredOrders).map(o => ({
            ...o,
            franchise: o.franchise || 'Main Shop',
            vendor: o.vendor || 'Not Assigned'
        }));

        exportToCSV(`Delivery_Report_${activeTab}`, columns, data);
    };

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 700);
        return () => clearTimeout(timer);
    }, []);

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
            key: 'id',
            render: (val) => <span className="font-bold text-slate-900 tracking-wider">#{val}</span>
        },
        {
            header: 'Customer',
            key: 'customer',
            render: (val) => <span className="font-medium text-slate-600">{val}</span>
        },
        {
            header: 'Shop Name',
            key: 'franchise',
            render: (val) => <span className="font-medium text-slate-600">{val || 'Main Shop'}</span>
        },
        {
            header: 'Rider',
            key: 'vendor',
            render: (val) => (
                <div className="flex items-center gap-1.5 py-0.5 px-2 bg-blue-50 rounded-sm w-fit border border-blue-100">
                    <Truck size={10} className="text-blue-500" />
                    <span className="text-[10px] font-bold text-blue-700 uppercase">{val || 'Not Assigned'}</span>
                </div>
            )
        },
        {
            header: 'Slot',
            key: 'deliverySlot',
            render: (val) => (
                <div className="flex items-center gap-1.5 py-0.5 px-2 bg-slate-100 rounded-sm w-fit border border-slate-200">
                    <Clock size={10} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-600 uppercase">{val}</span>
                </div>
            )
        },
        {
            header: 'Payment',
            key: 'paymentMethod',
            render: (val) => (
                <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border",
                    val === 'Prepaid' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                )}>
                    {val}
                </span>
            )
        },
        {
            header: 'Amount',
            key: 'total',
            align: 'right',
            render: (val) => <span className="font-bold text-slate-900 leading-none">₹{val.toLocaleString()}</span>
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
