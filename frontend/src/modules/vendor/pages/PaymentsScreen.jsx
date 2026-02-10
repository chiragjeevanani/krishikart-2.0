import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    IndianRupee,
    Percent,
    CreditCard,
    ChevronRight,
    Calendar,
    Download,
    BarChart3,
    ShieldCheck,
    Briefcase,
    Zap,
    Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import mockPayments from '../data/mockPayments.json';
import { cn } from '@/lib/utils';
import MetricCard from '../components/cards/MetricCard';
import DataGrid from '../components/tables/DataGrid';

export default function PaymentsScreen() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const { currentMonth, history, transactions } = mockPayments;

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const transactionColumns = [
        {
            header: 'Transaction Reference',
            key: 'id',
            render: (val) => <span className="text-[11px] font-black text-slate-900 tracking-tight">{val}</span>
        },
        {
            header: 'Affiliate Node',
            key: 'franchise',
            render: (val, row) => (
                <div>
                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{val}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{row.date}</p>
                </div>
            )
        },
        {
            header: 'Net Settlement',
            key: 'amount',
            align: 'right',
            render: (val) => (
                <div className="flex items-center justify-end gap-1">
                    <IndianRupee size={10} className="text-slate-400" />
                    <span className="text-[12px] font-black text-slate-900 tabular-nums">{val?.toLocaleString()}</span>
                </div>
            )
        },
        {
            header: 'Status',
            key: 'status',
            align: 'right',
            render: () => (
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                    Settled
                </span>
            )
        }
    ];

    if (isLoading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-10 w-48 bg-slate-100 rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-100 rounded-[32px]" />)}
                </div>
                <div className="h-96 bg-slate-100 rounded-[40px]" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-32">
            <header className="flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Financial Intelligence</p>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Earnings Intel</h1>
                </div>
                <button className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95">
                    <Download size={16} />
                    Export Ledger
                </button>
            </header>

            {/* Primary Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                    label="Net Settlement (OCT)"
                    value={`₹${currentMonth.netPayout.toLocaleString()}`}
                    icon={CreditCard}
                    color="slate"
                    trend={{ value: 12, positive: true }}
                />
                <MetricCard
                    label="Gross Volume Value"
                    value={`₹${currentMonth.grossEarnings.toLocaleString()}`}
                    icon={BarChart3}
                    color="blue"
                    trend={{ value: 8, positive: true }}
                />
                <MetricCard
                    label="Platform Royalty"
                    value={`₹${currentMonth.commission.toLocaleString()}`}
                    icon={Percent}
                    color="amber"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visual P&L Analytics */}
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -z-0 opacity-50 group-hover:bg-primary/10 transition-colors" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none mb-1">Margin Analysis</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Q3 Performance Index</p>
                            </div>
                            <div className="w-10 h-10 bg-slate-50 text-slate-900 rounded-xl flex items-center justify-center border border-slate-100 italic font-black text-xs">
                                87%
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-slate-900" />
                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Core Fulfillment Margin</span>
                                    </div>
                                    <span className="text-[11px] font-black tabular-nums">87.5%</span>
                                </div>
                                <div className="h-2 bg-slate-50 rounded-full overflow-hidden flex">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '87.5%' }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                        className="h-full bg-slate-900"
                                    />
                                    <div className="h-full bg-slate-100" style={{ width: '12.5%' }} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 bg-slate-50 rounded-[28px] border border-slate-100 group-hover:border-slate-200 transition-colors">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Zap size={14} className="text-blue-500" />
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Logistics Cap</p>
                                    </div>
                                    <p className="text-xl font-black text-slate-900 tabular-nums">₹0.00</p>
                                    <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest mt-2 flex items-center gap-1">
                                        <ShieldCheck size={10} /> Promo Waived
                                    </p>
                                </div>
                                <div className="p-5 bg-slate-50 rounded-[28px] border border-slate-100 group-hover:border-slate-200 transition-colors">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Activity size={14} className="text-amber-500" />
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Compliance</p>
                                    </div>
                                    <p className="text-xl font-black text-slate-900 tabular-nums">100.0</p>
                                    <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest mt-2 flex items-center gap-1">
                                        <ShieldCheck size={10} /> No Penalties
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Audit Ledger List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Audit Ledger</h3>
                        <button className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                            View All <ChevronRight size={12} />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {transactions.slice(0, 4).map((txn, i) => (
                            <div key={i} className="flex items-center justify-between p-5 bg-white rounded-[32px] border border-slate-100 hover:shadow-xl hover:shadow-slate-100/50 transition-all cursor-pointer group active:scale-[0.98]">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                                        <Briefcase size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900 tracking-tight">{txn.id}</h4>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{txn.date} • {txn.franchise}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-slate-900 tabular-nums">₹{txn.amount.toLocaleString()}</p>
                                    <div className="flex items-center justify-end gap-1.5 mt-1">
                                        <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                        <span className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">Settled</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Historical Cycles Ledger */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Settlement Cycles</h3>
                    <div className="flex items-center gap-3">
                        <button className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                            <Calendar size={18} />
                        </button>
                    </div>
                </div>

                <DataGrid
                    columns={[
                        {
                            header: 'Cycle Period',
                            key: 'period',
                            render: (val, row) => (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-50 text-slate-900 rounded-xl flex items-center justify-center border border-slate-100">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{val}</p>
                                        <p className="text-[9px] font-bold text-slate-400 tracking-widest">{row.id}</p>
                                    </div>
                                </div>
                            )
                        },
                        {
                            header: 'Commission',
                            key: 'commission',
                            render: (val) => (
                                <div className="flex items-center gap-1 text-red-500">
                                    <IndianRupee size={10} />
                                    <span className="text-[11px] font-black tabular-nums">{val.toLocaleString()}</span>
                                </div>
                            )
                        },
                        {
                            header: 'Net Payout',
                            key: 'net',
                            render: (val) => (
                                <div className="flex items-center gap-1 text-slate-900">
                                    <IndianRupee size={10} className="text-slate-400" />
                                    <span className="text-[12px] font-black tabular-nums">{val.toLocaleString()}</span>
                                </div>
                            )
                        },
                        {
                            header: 'Status',
                            key: 'status',
                            align: 'right',
                            render: (val) => (
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                    val === 'Paid' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                                )}>
                                    {val}
                                </span>
                            )
                        }
                    ]}
                    data={history}
                />
            </div>
        </div>
    );
}
