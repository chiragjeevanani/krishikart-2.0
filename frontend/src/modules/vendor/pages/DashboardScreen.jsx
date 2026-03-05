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
import { cn } from '@/lib/utils';
import { Bell } from 'lucide-react';
import MetricCard from '../components/cards/MetricCard';
import DataGrid from '../components/tables/DataGrid';
import api from '@/lib/axios';

export default function DashboardScreen() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [activeDispatches, setActiveDispatches] = useState([]);
    const [dashboardStats, setDashboardStats] = useState({
        activeOps: 0,
        pendingSettlement: 0,
        totalTurnover: 0,
        inventory: {
            stockQuantity: 0,
            availableProduce: 0
        },
        performance: {
            fulfillmentRate: 0,
            avgPrepTime: "0h",
            archiveVol: 0,
            yieldDelta: 0
        }
    });

    const [sendingPush, setSendingPush] = useState(false);

    const handleTestPush = async () => {
        setSendingPush(true);
        let token = localStorage.getItem(`fcm_token_vendor`);

        if (!token) {
            const { requestFCMToken } = await import('@/lib/firebase');
            token = await requestFCMToken();
            if (token) {
                localStorage.setItem(`fcm_token_vendor`, token);
                await api.post(`/vendor/fcm-token`, { token });
            }
        }

        if (!token) {
            alert("No FCM token found. Please allow notifications in your browser.");
            setSendingPush(false);
            return;
        }

        try {
            await api.post('/vendor/test-notification', {
                fcm_token: token,
                plateform: 'Vendor Web Dashboard'
            });
            alert("Test notification triggered!");
        } catch (error) {
            console.error(error);
            alert("Failed to send test push");
        } finally {
            setSendingPush(false);
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [dispatchRes, statsRes] = await Promise.all([
                    api.get('/procurement/vendor/active-dispatch'),
                    api.get('/procurement/vendor/dashboard-stats')
                ]);

                if (dispatchRes.data.success) {
                    setActiveDispatches(dispatchRes.data.results);
                }
                if (statsRes.data.success) {
                    setDashboardStats(statsRes.data.result || statsRes.data.results || {});
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const { activeOps = 0, pendingSettlement = 0, totalTurnover = 0, performance = {}, inventory = {} } = dashboardStats || {};

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
                        {activeOps > 0 && (
                            <span className="flex items-center gap-1.5 px-3 py-0.5 bg-primary/10 text-primary rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse border border-primary/20">
                                <div className="w-1 h-1 rounded-full bg-primary" />
                                {activeOps} Live Ops
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleTestPush}
                        disabled={sendingPush}
                        className="h-12 px-6 bg-white border border-slate-200 text-slate-900 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-slate-100 hover:bg-slate-50 transition-all font-black text-[10px] uppercase tracking-widest disabled:opacity-50"
                    >
                        <Bell size={18} className={sendingPush ? "animate-pulse text-indigo-500" : "text-indigo-500"} />
                        {sendingPush ? 'Testing...' : 'Test Push'}
                    </button>
                    <button className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200 hover:scale-105 transition-all">
                        <PlusCircle size={24} />
                    </button>
                </div>
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
                    value={`₹${(performance.yieldDelta || 0).toLocaleString()}`}
                    icon={TrendingUp}
                    color="red"
                    trend={{ value: 3.4, positive: performance.yieldDelta > 0 }}
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
                                <p className="text-3xl font-black tabular-nums">{performance.archiveVol}</p>
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

