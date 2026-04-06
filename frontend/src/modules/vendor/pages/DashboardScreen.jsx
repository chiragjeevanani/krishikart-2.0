import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Truck,
    TrendingUp,
    Clock,
    IndianRupee,
    Wallet,
    ChevronRight,
    ArrowUpRight,
    Settings
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
        payoutCycleDays: 0,
        verificationStatus: 'Pending Verification',
        syncMinutes: 0,
        trends: {
            pendingSettlement: 0,
            yieldDelta: 0,
            totalTurnover: 0
        },
        inventory: {
            stockQuantity: 0,
            availableProduce: 0
        },
        performance: {
            fulfillmentRate: 0,
            avgPrepTime: '0.0 Days',
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

    const {
        activeOps = 0,
        pendingSettlement = 0,
        totalTurnover = 0,
        payoutCycleDays = 0,
        verificationStatus = 'Pending Verification',
        syncMinutes = 0,
        trends = {},
        performance = {},
    } = dashboardStats || {};

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
            <header className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">Procurement Pulse</h1>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <p className="text-[9px] sm:text-[10px] font-black text-slate-300 uppercase tracking-[0.15em] sm:tracking-[0.2em]">Operational Status: Active</p>
                        {activeOps > 0 && (
                            <span className="flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 bg-primary/10 text-primary rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest animate-pulse border border-primary/20">
                                <div className="w-1 h-1 rounded-full bg-primary" />
                                {activeOps} Live Ops
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 sm:justify-end sm:shrink-0">
                    <button
                        type="button"
                        onClick={() => navigate('/vendor/profile')}
                        className="h-10 sm:h-11 min-h-[44px] px-3 sm:px-4 bg-white border border-slate-200 text-slate-900 rounded-xl sm:rounded-2xl inline-flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm hover:bg-slate-50 transition-all font-black text-[9px] sm:text-[10px] uppercase tracking-wide sm:tracking-widest active:scale-[0.98]"
                    >
                        <Settings className="h-4 w-4 sm:h-[17px] sm:w-[17px] text-slate-600 shrink-0" strokeWidth={2} />
                        Settings
                    </button>
                    <button
                        type="button"
                        onClick={handleTestPush}
                        disabled={sendingPush}
                        className="h-10 sm:h-11 min-h-[44px] px-3 sm:px-5 bg-white border border-slate-200 text-slate-900 rounded-xl sm:rounded-2xl inline-flex items-center justify-center gap-1.5 sm:gap-2 shadow-xl shadow-slate-100 hover:bg-slate-50 transition-all font-black text-[9px] sm:text-[10px] uppercase tracking-wide sm:tracking-widest disabled:opacity-50 active:scale-[0.98]"
                    >
                        <Bell className={`h-4 w-4 sm:h-[18px] sm:w-[18px] ${sendingPush ? 'animate-pulse text-indigo-500' : 'text-indigo-500'}`} strokeWidth={2} />
                        {sendingPush ? 'Testing...' : 'Test Push'}
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <MetricCard
                    label="Escrow Settlement"
                    value={`₹${pendingSettlement.toLocaleString()}`}
                    icon={Wallet}
                    color="blue"
                    trend={{ value: Math.abs(trends.pendingSettlement || 0), positive: (trends.pendingSettlement || 0) >= 0 }}
                    index={0}
                />
                <MetricCard
                    label="Payout Cycle"
                    value={`${payoutCycleDays.toFixed(1)} Days`}
                    icon={Clock}
                    color="amber"
                    index={1}
                />
                <MetricCard
                    label="Yield Delta"
                    value={`₹${(performance.yieldDelta || 0).toLocaleString()}`}
                    icon={TrendingUp}
                    color="red"
                    trend={{ value: Math.abs(trends.yieldDelta || 0), positive: (trends.yieldDelta || 0) >= 0 }}
                    index={2}
                />
                <MetricCard
                    label="Metric Turnover"
                    value={`₹${totalTurnover.toLocaleString()}`}
                    icon={IndianRupee}
                    color="emerald"
                    trend={{ value: Math.abs(trends.totalTurnover || 0), positive: (trends.totalTurnover || 0) >= 0 }}
                    index={3}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 bg-slate-900 rounded-2xl sm:rounded-[40px] p-5 sm:p-8 text-white relative overflow-hidden group shadow-2xl shadow-slate-900/20"
                >
                    <div className="relative z-10">
                        <div className="flex justify-between items-start gap-3 mb-6 sm:mb-10">
                            <div className="min-w-0">
                                <h3 className="text-lg sm:text-xl font-black tracking-tight mb-1 sm:mb-2">Network Efficiency</h3>
                                <p className="text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em]">Enterprise Standard Alignment</p>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl backdrop-blur-md border border-white/5 shrink-0">
                                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest">{verificationStatus}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 sm:gap-8">
                            <div className="min-w-0">
                                <p className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-wider sm:tracking-widest mb-1 sm:mb-2">Fulfillment</p>
                                <p className="text-xl sm:text-2xl md:text-3xl font-black tabular-nums leading-none">{performance.fulfillmentRate}%</p>
                                <div className="mt-4 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${performance.fulfillmentRate}%` }}
                                        className="h-full bg-primary"
                                    />
                                </div>
                            </div>
                            <div className="min-w-0">
                                <p className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-wider sm:tracking-widest mb-1 sm:mb-2">Cycle Rate</p>
                                <p className="text-xl sm:text-2xl md:text-3xl font-black tabular-nums leading-none break-words">{performance.avgPrepTime}</p>
                                <div className="mt-4 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500"
                                        style={{ width: `${Math.min(100, Math.max(0, payoutCycleDays >= 0 ? ((7 - Math.min(payoutCycleDays, 7)) / 7) * 100 : 0))}%` }}
                                    />
                                </div>
                            </div>
                            <div className="min-w-0">
                                <p className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-wider sm:tracking-widest mb-1 sm:mb-2">Archive Vol</p>
                                <p className="text-xl sm:text-2xl md:text-3xl font-black tabular-nums leading-none">{performance.archiveVol}</p>
                                <p className="text-[8px] sm:text-[9px] text-emerald-400 font-black mt-1.5 sm:mt-2 uppercase tracking-wide">Ready for Settlement</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-2xl sm:rounded-[40px] p-5 sm:p-8 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-xl hover:shadow-slate-200/50 transition-all border-b-4 border-b-slate-900"
                >
                    <div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-slate-900 mb-4 sm:mb-6 border border-slate-100 shadow-sm">
                            <Truck className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
                        </div>
                        <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight uppercase">Dispatch <br /> Workflow</h4>
                        <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 sm:mt-6">Matrix Sync in {syncMinutes}m</p>
                    </div>

                    <button
                        onClick={() => navigate('/vendor/dispatch')}
                        className="mt-6 sm:mt-8 group w-full bg-slate-900 text-white rounded-xl sm:rounded-2xl py-3.5 sm:py-4 flex items-center justify-center gap-2 sm:gap-3 transition-all hover:bg-slate-800"
                    >
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em]">Enter Fleet Matrix</span>
                        <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="bg-white rounded-2xl sm:rounded-[40px] p-5 sm:p-8 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
                        <div className="min-w-0">
                            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Operations Ledger</h3>
                            <p className="text-[9px] sm:text-[10px] font-black text-slate-300 uppercase tracking-[0.15em] sm:tracking-[0.2em] mt-1">Real-time Batch Tracking</p>
                        </div>
                        <button
                            onClick={() => navigate('/vendor/dispatch-history')}
                            className="text-[9px] sm:text-[10px] font-black text-slate-900 uppercase tracking-[0.15em] sm:tracking-[0.2em] flex items-center gap-1.5 sm:gap-2 hover:translate-x-1 transition-transform shrink-0"
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
