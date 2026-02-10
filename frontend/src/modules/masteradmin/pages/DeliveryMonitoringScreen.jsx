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
    BarChart3,
    Timer,
    Home,
    Download,
    Calendar,
    ChevronDown,
    RefreshCw,
    Layers,
    Target
} from 'lucide-react';
import mockOrders from '../data/mockAdminOrders.json';
import { cn } from '@/lib/utils';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

// Enterprise Components
import MetricRow from '../components/cards/MetricRow';
import ChartPanel from '../components/cards/ChartPanel';
import DataGrid from '../components/tables/DataGrid';
import FilterBar from '../components/tables/FilterBar';
import ProfessionalTooltip from '../components/common/ProfessionalTooltip';

export default function DeliveryMonitoringScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active');

    const inTransitOrders = mockOrders.filter(o => o.status === 'in_transit');
    const deliveredOrders = mockOrders.filter(o => o.status === 'delivered');

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
            header: 'Unit Tracking ID',
            key: 'id',
            render: (val) => <span className="font-bold text-slate-900 tracking-wider">#{val}</span>
        },
        {
            header: 'Consignee',
            key: 'customer',
            render: (val) => <span className="font-medium text-slate-600">{val}</span>
        },
        {
            header: 'Target Slot',
            key: 'deliverySlot',
            render: (val) => (
                <div className="flex items-center gap-1.5 py-0.5 px-2 bg-slate-100 rounded-sm w-fit border border-slate-200">
                    <Clock size={10} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-600 uppercase">{val}</span>
                </div>
            )
        },
        {
            header: 'SLA Progress',
            key: 'progress',
            render: (_, row) => {
                const isComplete = row.status === 'delivered';
                return (
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden max-w-[80px]">
                            <div
                                className={cn("h-full", isComplete ? "bg-emerald-500" : "bg-amber-400")}
                                style={{ width: isComplete ? '100%' : '65%' }}
                            />
                        </div>
                        <span className="text-[10px] font-bold tabular-nums text-slate-400">{isComplete ? '100%' : '65%'}</span>
                    </div>
                );
            }
        },
        {
            header: 'Value',
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
            {/* Enterprise Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-r border-slate-200 pr-4">
                            <Home size={12} />
                            <ChevronRight size={10} />
                            <span>Master Admin</span>
                            <ChevronRight size={10} />
                            <span className="text-slate-900 uppercase tracking-widest">Logistics Monitoring</span>
                        </div>
                        <h1 className="text-sm font-bold text-slate-900">Network Surveillance Matrix</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-slate-100 p-0.5 rounded-sm">
                            <button
                                onClick={() => setActiveTab('active')}
                                className={cn(
                                    "px-3 py-1 text-[10px] font-bold transition-all",
                                    activeTab === 'active' ? "bg-white text-slate-900 shadow-sm rounded-sm" : "text-slate-500 hover:text-slate-900"
                                )}
                            >
                                Active Transit
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={cn(
                                    "px-3 py-1 text-[10px] font-bold transition-all",
                                    activeTab === 'history' ? "bg-white text-slate-900 shadow-sm rounded-sm" : "text-slate-500 hover:text-slate-900"
                                )}
                            >
                                Fulfillment Log
                            </button>
                        </div>
                        <button className="bg-slate-900 text-white px-3 py-1.5 rounded-sm text-[11px] font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors">
                            <Download size={13} />
                            SLA Export
                        </button>
                    </div>
                </div>
            </div>

            {/* Performance KPIs - Stripped & Dense */}
            <div className="bg-white border-b border-slate-200 grid grid-cols-1 md:grid-cols-4">
                <MetricRow
                    label="Network Health"
                    value="98.2%"
                    change={0.4}
                    trend="up"
                    icon={Activity}
                    sparklineData={[97, 97.5, 98, 97.8, 98.2, 98.1, 98.2].map(v => ({ value: v }))}
                />
                <MetricRow
                    label="Active Transit"
                    value={inTransitOrders.length.toString()}
                    change={12.5}
                    trend="up"
                    icon={Navigation}
                    sparklineData={[1, 0, 1, 1, 2, 1, 1].map(v => ({ value: v }))}
                />
                <MetricRow
                    label="Today Yield"
                    value={deliveredOrders.length.toString()}
                    change={5.2}
                    trend="up"
                    icon={CheckSquare}
                    sparklineData={[0, 1, 1, 0, 1, 1, 1].map(v => ({ value: v }))}
                />
                <MetricRow
                    label="Avg Lead Time"
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

                <div className="grid grid-cols-1 xl:grid-cols-3 bg-slate-200 gap-px">
                    <div className="xl:col-span-2 bg-white flex flex-col">
                        <DataGrid
                            title={activeTab === 'active' ? "In-Transit Payload Surveillance" : "Historical Fulfillment Ledger"}
                            columns={unitColumns}
                            data={activeTab === 'active' ? inTransitOrders : deliveredOrders}
                            density="compact"
                        />
                        <ChartPanel
                            title="Logistics Velocity Spectrum"
                            subtitle="SLA completion efficiency by time window"
                            height={240}
                            collapsible={false}
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={slotPerformance} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="slot" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                    <RechartsTooltip content={<ProfessionalTooltip currency="" />} />
                                    <Bar dataKey="success" radius={[2, 2, 0, 0]} barSize={40}>
                                        {slotPerformance.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.success > 95 ? '#475569' : entry.success > 90 ? '#64748b' : '#94a3b8'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartPanel>
                    </div>

                    <div className="bg-white flex flex-col">
                        <ChartPanel
                            title="Infrastructure Signals"
                            collapsible={false}
                        >
                            <div className="flex flex-col h-full bg-slate-900 border-t border-white/5 relative overflow-hidden p-6">
                                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Node Integrity</span>
                                            <span className="text-lg font-bold text-white leading-none">Mainframe Optimal</span>
                                        </div>
                                        <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-emerald-400">
                                            <Target size={20} className="animate-pulse" />
                                        </div>
                                    </div>

                                    <div className="flex-1 flex items-center justify-center pointer-events-none">
                                        <div className="relative">
                                            <div className="absolute -inset-8 bg-blue-500/10 blur-3xl rounded-full" />
                                            <Activity size={48} className="text-blue-400 opacity-20" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-px bg-white/10 border border-white/10 overflow-hidden rounded-sm">
                                        <div className="bg-slate-900/80 p-3">
                                            <span className="text-[8px] font-bold text-slate-500 uppercase block mb-1 tracking-widest">Network Latency</span>
                                            <span className="text-xs font-bold text-white tabular-nums">12.4ms</span>
                                        </div>
                                        <div className="bg-slate-900/80 p-3 border-l border-white/10">
                                            <span className="text-[8px] font-bold text-slate-500 uppercase block mb-1 tracking-widest">Bandwidth Load</span>
                                            <span className="text-xs font-bold text-white tabular-nums">84.2%</span>
                                        </div>
                                        <div className="bg-slate-900/80 p-3 border-t border-white/10">
                                            <span className="text-[8px] font-bold text-slate-500 uppercase block mb-1 tracking-widest">Signal Strength</span>
                                            <span className="text-xs font-bold text-white tabular-nums">+44dB</span>
                                        </div>
                                        <div className="bg-slate-900/80 p-3 border-t border-l border-white/10">
                                            <span className="text-[8px] font-bold text-slate-500 uppercase block mb-1 tracking-widest">Uptime Ratio</span>
                                            <span className="text-xs font-bold text-emerald-400 tabular-nums">99.992%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ChartPanel>

                        <div className="p-4 flex-1 bg-slate-50 border-t border-slate-200">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Tactical Intelligence</h4>
                            <div className="space-y-2">
                                <div className="bg-white border border-slate-200 p-2.5 rounded-sm flex items-start gap-3">
                                    <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-900 leading-tight">High volume predicted for 6PM slot</p>
                                        <p className="text-[10px] font-medium text-slate-500 mt-0.5">Recommend activating buffer units for Indore-Agri-Node.</p>
                                    </div>
                                </div>
                                <div className="bg-white border border-slate-200 p-2.5 rounded-sm flex items-start gap-3">
                                    <Layers size={14} className="text-blue-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-900 leading-tight">Secondary Node Active</p>
                                        <p className="text-[10px] font-medium text-slate-500 mt-0.5">Redundancy confirmed. Traffic being routed through relay set 04.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Surveillance Footer */}
                <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Navigation size={14} className="text-blue-400 animate-pulse" />
                            <span className="text-[11px] font-bold uppercase tracking-widest text-white/90">Mainframe Feed: 24h Synchronized</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/50">
                            <Clock size={14} />
                            <span className="text-[11px] font-bold uppercase tracking-widest">Last Index: {new Date().toLocaleTimeString()}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                            Operational Protocol
                        </button>
                        <div className="h-3 w-px bg-white/10" />
                        <button className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#0284c7]">
                            <Layers size={12} />
                            Deep Intel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
