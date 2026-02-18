import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    PlusCircle,
    Truck,
    TrendingUp,
    Clock,
    IndianRupee,
    Wallet,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import mockData from '../data/mockVendorStats.json';
import { cn } from '@/lib/utils';
import { useOrders } from '@/modules/user/contexts/OrderContext';
import MetricCard from '../components/cards/MetricCard';
import DataGrid from '../components/tables/DataGrid';

export default function DashboardScreen() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [activeDispatches, setActiveDispatches] = useState([]);
    const { stats, performance } = mockData;
    const { orders: contextOrders } = useOrders();

    const totalTurnover = contextOrders
        .filter(o => o.fulfillmentType === 'requires_procurement' && o.status === 'completed')
        .reduce((sum, o) => sum + (o.procurementTotal || 0), 0) + performance.monthlyRevenue;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/procurement/vendor/active-dispatch');
                if (response.data.success) {
                    setActiveDispatches(response.data.results);
                }
            } catch (error) {
                console.error("Failed to fetch active dispatches", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const liveActiveOrders = activeDispatches.length;

    const pendingSettlement = activeDispatches
        .reduce((sum, o) => sum + (o.totalQuotedAmount || 0), 0);

    const dispatchColumns = [
        {
            header: 'Dispatch Ref',
            key: '_id',
            render: (val) => <span className="text-primary font-black uppercase tracking-widest">{val.slice(-6)}</span>
        },
        {
            header: 'Franchise Node',
            key: 'franchiseId',
            render: (val) => <span className="text-slate-900 font-bold">{val?.shopName || val?.ownerName || 'Node'}</span>
        },
        {
            header: 'Payload',
            key: 'actualWeight',
            render: (val) => <span className="text-slate-600 font-black tabular-nums">{val ? `${val} KG` : 'TBD'}</span>
        },
        {
            header: 'Cycle Status',
            key: 'status',
            align: 'right',
            render: (val) => (
                <span className={cn(
                    "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter",
                    val === 'ready_for_pickup' ? "bg-emerald-100 text-emerald-600" :
                        val === 'approved' ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"
                )}>
                    {val.replace('_', ' ')}
                </span>
            )
        }
    ];

    if (isLoading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-10 w-48 bg-slate-100 rounded-xl" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-slate-100 rounded-[32px]" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Procurement Pulse</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Operational Status: Active</p>
                        {liveActiveOrders > 0 && (
                            <span className="flex items-center gap-1.5 px-3 py-0.5 bg-primary/10 text-primary rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse border border-primary/20">
                                <div className="w-1 h-1 rounded-full bg-primary" />
                                {liveActiveOrders} Live Ops
                            </span>
                        )}
                    </div>
                </div>
                <button className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200 hover:scale-105 transition-all">
                    <PlusCircle size={24} />
                </button>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    label="Escrow Settlement"
                    value={`₹${(pendingSettlement || 124000).toLocaleString()}`}
                    icon={Wallet}
                    color="blue"
                    trend={{ value: 12, positive: true }}
                    index={0}
                />
                <MetricCard
                    label="Payout Cycle"
                    value="4 Days"
                    icon={Clock}
                    color="amber"
                    index={1}
                />
                <MetricCard
                    label="Yield Delta"
                    value="₹4,200"
                    icon={TrendingUp}
                    color="red"
                    trend={{ value: 3.4, positive: false }}
                    index={2}
                />
                <MetricCard
                    label="Metric Turnover"
                    value={`₹${totalTurnover.toLocaleString()}`}
                    icon={IndianRupee}
                    color="emerald"
                    trend={{ value: 24, positive: true }}
                    index={3}
                />
            </div>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden group shadow-2xl shadow-slate-900/20"
                >
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <h3 className="text-xl font-black tracking-tight mb-2">Network Efficiency</h3>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Enterprise Standard Alignment</p>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/5">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Alpha Verified</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-8">
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Fulfillment</p>
                                <p className="text-3xl font-black tabular-nums">{performance.fulfillmentRate}%</p>
                                <div className="mt-4 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${performance.fulfillmentRate}%` }}
                                        className="h-full bg-primary"
                                    />
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Cycle Rate</p>
                                <p className="text-3xl font-black tabular-nums">{performance.avgPrepTime}</p>
                                <div className="mt-4 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-3/4" />
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Archive Vol</p>
                                <p className="text-3xl font-black tabular-nums">{stats.completedDeliveries}</p>
                                <p className="text-[9px] text-emerald-400 font-black mt-2 uppercase tracking-wide">Ready for Settlement</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-xl hover:shadow-slate-200/50 transition-all border-b-4 border-b-slate-900"
                >
                    <div>
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 mb-6 border border-slate-100 shadow-sm">
                            <Truck size={24} />
                        </div>
                        <h4 className="text-lg font-black text-slate-900 tracking-tight leading-none uppercase">Dispatch <br /> Workflow</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6">Matrix Sync in 22m</p>
                    </div>

                    <button
                        onClick={() => navigate('/vendor/dispatch')}
                        className="mt-8 group w-full bg-slate-900 text-white rounded-2xl py-4 flex items-center justify-center gap-3 transition-all hover:bg-slate-800"
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Enter Fleet Matrix</span>
                        <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                </motion.div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 gap-6">
                <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Operations Ledger</h3>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-1">Real-time Batch Tracking</p>
                        </div>
                        <button
                            onClick={() => navigate('/vendor/dispatch-history')}
                            className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 hover:translate-x-1 transition-transform"
                        >
                            History Access <ChevronRight size={14} />
                        </button>
                    </div>

                    <DataGrid
                        columns={dispatchColumns}
                        data={activeDispatches}
                        onRowClick={(row) => navigate(`/vendor/dispatch?order=${row._id}`)}
                        className="border-none shadow-none"
                    />
                </div>
            </div>
        </div>
    );
}

