import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Download,
    Filter,
    Calendar,
    ChevronDown,
    IndianRupee,
    Users,
    ShoppingCart,
    Clock,
    Home,
    ChevronRight,
    Search,
    RefreshCw,
    MoreHorizontal,
    Activity,
    Layers,
    FileText,
    ExternalLink,
    AlertCircle,
    BarChart3,
    Terminal,
    Cpu
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar
} from 'recharts';
import mockDashboard from '../data/mockDashboard.json';
import { cn } from '@/lib/utils';

// Enterprise Components
import MetricRow from '../components/cards/MetricRow';
import ChartPanel from '../components/cards/ChartPanel';
import DataGrid from '../components/tables/DataGrid';
import FilterBar from '../components/tables/FilterBar';
import ComparisonChart from '../components/cards/ComparisonChart';
import ProfessionalTooltip from '../components/common/ProfessionalTooltip';

export default function DashboardScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const [showMetrics, setShowMetrics] = useState(true);
    const [settlementSearch, setSettlementSearch] = useState('');
    const { kpis, orderFlow, revenueFlow, recentSettlements } = mockDashboard;

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const settlementColumns = [
        {
            header: 'Vendor Details',
            key: 'vendor',
            render: (val, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-sm bg-slate-100 flex items-center justify-center text-slate-400">
                        <Users size={12} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-[11px] leading-tight">{val}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">ENT-{row.id.split('-')[1]}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Status',
            key: 'status',
            render: (val) => (
                <div className={cn(
                    "px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest border w-fit",
                    val === 'Paid' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                )}>
                    {val}
                </div>
            )
        },
        {
            header: 'Amount',
            key: 'amount',
            align: 'right',
            render: (val) => <span className="font-bold text-slate-900 tabular-nums text-[11px]">₹{val.toLocaleString()}</span>
        },
        {
            header: 'Net Payable',
            key: 'netPayable',
            align: 'right',
            render: (_, row) => <span className="font-bold text-blue-600 tabular-nums text-[11px]">₹{(row.amount * 0.95).toLocaleString()}</span>
        },
        {
            header: 'Date',
            key: 'date',
            render: (val) => <span className="text-[10px] text-slate-400 font-bold uppercase tabular-nums">{val}</span>
        },
        {
            header: '',
            key: 'actions',
            align: 'right',
            render: () => (
                <button className="p-1 hover:bg-slate-100 rounded-sm text-slate-400 transition-colors">
                    <MoreHorizontal size={14} />
                </button>
            )
        }
    ];

    if (isLoading) {
        return (
            <div className="p-4 space-y-4 animate-pulse">
                <div className="h-4 w-48 bg-slate-100 rounded" />
                <div className="h-20 bg-slate-50 border border-slate-200" />
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <div className="h-[400px] bg-slate-50 border border-slate-200 rounded-sm" />
                    <div className="h-[400px] bg-slate-50 border border-slate-200 rounded-sm" />
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
                            <span>Admin Panel</span>
                            <ChevronRight size={10} />
                            <span className="text-slate-900 uppercase tracking-widest">Dashboard</span>
                        </div>
                        <h1 className="text-sm font-bold text-slate-900">Dashboard Overview</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-slate-100 p-0.5 rounded-sm mr-2">
                            <button className="px-3 py-1 text-[9px] font-bold bg-white text-slate-900 shadow-sm rounded-sm uppercase tracking-widest">Live</button>
                            <button className="px-3 py-1 text-[9px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">History</button>
                        </div>
                        <button className="p-1.5 border border-slate-200 rounded-sm hover:bg-slate-50 text-slate-400 transition-colors">
                            <RefreshCw size={14} />
                        </button>
                        <button className="bg-slate-900 text-white px-3 py-1.5 rounded-sm text-[11px] font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm">
                            <Download size={13} />
                            Export Data
                        </button>
                    </div>
                </div>
            </div>

            {/* Performance Strip */}
            <div className="bg-white border-b border-slate-200">
                <div
                    className="px-4 py-1.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
                    onClick={() => setShowMetrics(!showMetrics)}
                >
                    <div className="flex items-center gap-2">
                        {showMetrics ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Key Metrics</span>
                    </div>
                    {!showMetrics && (
                        <div className="flex gap-4">
                            {kpis.slice(0, 3).map((kpi, i) => (
                                <span key={i} className="text-[10px] font-bold tabular-nums text-slate-500">
                                    {kpi.label}: <span className="text-slate-900">{kpi.value}</span>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <AnimatePresence>
                    {showMetrics && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-4 border-t border-slate-200 overflow-hidden"
                        >
                            {kpis.map((kpi, idx) => (
                                <MetricRow
                                    key={idx}
                                    {...kpi}
                                    icon={idx === 0 ? IndianRupee : idx === 1 ? ShoppingCart : idx === 2 ? Users : Clock}
                                    sparklineData={[30, 35, 32, 38, 42, 45, 48].map(v => ({ value: v }))}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Operational Grid */}
            <div className="flex flex-col gap-0">

                {/* Visual Analytics */}
                <div className="grid grid-cols-1 xl:grid-cols-2 bg-slate-200 gap-px border-b border-slate-200">
                    <ChartPanel
                        title="Order Statistics"
                        subtitle="Order fulfillment rate"
                        height={340}
                    >
                        <ComparisonChart
                            data={orderFlow}
                            type="composed"
                            metrics={[
                                { key: "orders", name: "Orders", color: "#0f172a", type: "area" },
                                { key: "fulfillment", name: "Fulfillment", color: "#64748b", type: "bar" }
                            ]}
                            height={300}
                            targetValue={80}
                            targetLabel="SLA Threshold"
                        />
                    </ChartPanel>

                    <ChartPanel
                        title="Revenue Trends"
                        subtitle="Daily revenue (Last 24 hours)"
                        height={340}
                    >
                        <ResponsiveContainer width="100%" height="100%" debounce={50}>
                            <AreaChart data={revenueFlow} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }}
                                />
                                <RechartsTooltip content={<ProfessionalTooltip currency="₹" />} />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#0284c7"
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartPanel>
                </div>

                {/* Ledger Management */}
                <div className="bg-white">
                    <FilterBar
                        onSearch={setSettlementSearch}
                        onRefresh={() => {
                            setIsLoading(true);
                            setTimeout(() => setIsLoading(false), 800);
                        }}
                    />
                    <DataGrid
                        title="Recent Settlements"
                        columns={settlementColumns}
                        data={recentSettlements.filter(s =>
                            s.vendor.toLowerCase().includes(settlementSearch.toLowerCase()) ||
                            s.id.toLowerCase().includes(settlementSearch.toLowerCase())
                        )}
                        density="compact"
                    />

                    {/* Pipeline Summary Footer */}
                    <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 border border-amber-100 rounded-sm">
                                <AlertCircle size={10} className="text-amber-500" />
                                <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest">4 Pending Items</span>
                            </div>
                            <div className="h-3 w-px bg-slate-200" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest underline decoration-slate-200 underline-offset-4 cursor-help">
                                Total Amount: <span className="text-slate-900 tabular-nums">₹892,500.00</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button className="px-2 py-1 text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase">Prev</button>
                            <span className="text-[10px] font-bold px-2 tabular-nums">Page 01 // 12</span>
                            <button className="px-2 py-1 text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase">Next</button>
                        </div>
                    </div>
                </div>

                {/* System Diagnostics Strip */}
                <div className="bg-slate-900 text-white px-4 py-1.5 flex items-center justify-between border-t border-slate-800">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">System Status // <span className="text-white">Active</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Cpu size={11} className="text-blue-400" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Server Load // <span className="text-white">12%</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Terminal size={11} className="text-purple-400" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Server // <span className="text-white">UK-42-B</span></span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[9px] font-bold text-slate-500 tabular-nums">Uptime: 142d 12h 42m</span>
                        <div className="h-3 w-px bg-slate-800" />
                        <button className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
