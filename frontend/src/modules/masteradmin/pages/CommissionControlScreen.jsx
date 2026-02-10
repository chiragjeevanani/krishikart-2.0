import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Percent,
    ArrowRight,
    TrendingUp,
    PieChart as PieIcon,
    History,
    IndianRupee,
    ArrowUpRight,
    Zap,
    Home,
    ChevronRight,
    ShieldCheck,
    BarChart3
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip as RechartsTooltip
} from 'recharts';
import CommissionForm from '../components/forms/CommissionForm';
import mockData from '../data/mockCommissions.json';
import { cn } from '@/lib/utils';

export default function CommissionControlScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const { currentRates, preview, history } = mockData;

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const chartData = [
        { name: 'Vendor', value: preview.vendorEarning, color: '#10b981' },
        { name: 'Franchise', value: preview.franchiseEarning, color: '#3b82f6' },
        { name: 'Company', value: preview.companyMargin, color: '#0f172a' }
    ];

    if (isLoading) {
        return (
            <div className="p-4 space-y-4 animate-pulse">
                <div className="h-4 w-48 bg-slate-100 rounded" />
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="h-[400px] bg-slate-50 border border-slate-200 rounded-sm" />
                    <div className="h-[400px] bg-white border border-slate-200 rounded-sm" />
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
                            <span>Financials</span>
                            <ChevronRight size={10} />
                            <span className="text-slate-900 uppercase tracking-widest">Commission Logic</span>
                        </div>
                        <h1 className="text-sm font-bold text-slate-900 whitespace-nowrap">Revenue Strategy Control</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-black rounded-sm uppercase tracking-widest">
                            <ShieldCheck size={10} />
                            Live Deployment
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Left: Financial Parameters */}
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border border-slate-200 rounded-sm overflow-hidden">
                            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Partner Node</span>
                            </div>
                            <div className="p-4">
                                <CommissionForm
                                    label="Vendor Commission"
                                    initialRate={currentRates.vendorCommission}
                                    onSave={(rate) => console.log('Vendor rate:', rate)}
                                />
                            </div>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-sm overflow-hidden">
                            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Distribution Node</span>
                            </div>
                            <div className="p-4">
                                <CommissionForm
                                    label="Franchise Commission"
                                    initialRate={currentRates.franchiseCommission}
                                    onSave={(rate) => console.log('Franchise rate:', rate)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-sm p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <BarChart3 size={120} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <Zap className="text-amber-400" size={16} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Strategy Impact Matrix</span>
                            </div>
                            <p className="text-slate-400 text-[11px] font-medium leading-relaxed max-w-sm mb-8">
                                Adjustments to unit economics will propagate through the fulfillment chain instantly. Current logic uses a percentage-of-GMV payout model.
                            </p>

                            <div className="flex items-center gap-12">
                                <div>
                                    <div className="text-2xl font-black text-white tabular-nums">₹1.2M</div>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">MTD Payouts</span>
                                </div>
                                <div className="w-px h-8 bg-slate-800" />
                                <div>
                                    <div className="text-2xl font-black text-emerald-400 tabular-nums">+12.4%</div>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Efficiency</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: P&L Intelligence */}
                <div className="bg-white border border-slate-200 rounded-sm flex flex-col shadow-sm">
                    <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">P&L Simulation Deck</h3>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Reference Basis: ₹{preview.sampleOrderAmount.toLocaleString()} GMV</p>
                        </div>
                        <PieIcon size={14} className="text-slate-300" />
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center flex-1">
                        <div className="h-48 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={70}
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Margin</span>
                                <span className="text-lg font-black text-slate-900">95%</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {chartData.map((item) => (
                                <div key={item.name} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{item.name}</span>
                                    </div>
                                    <div className="text-xs font-black text-slate-900 tabular-nums">
                                        ₹{item.value.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                            <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between px-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Simulator GMV</span>
                                <span className="text-sm font-black text-slate-900 tabular-nums">₹{preview.sampleOrderAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change History: Dense Audit Trail */}
            <div className="mx-6 mb-6 bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
                <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <History size={14} className="text-slate-400" />
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Logic Audit Trail</h3>
                    </div>
                    <button className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">
                        Access Full Registry
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Timestamp</th>
                                <th className="px-6 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Target Entity</th>
                                <th className="px-6 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Baseline</th>
                                <th className="px-6 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Update</th>
                                <th className="px-6 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Security Principal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-900 transition-colors">
                            {history.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-3 text-[11px] font-bold tabular-nums">
                                        {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-sm">
                                            {item.entityType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-[11px] font-bold text-slate-400 tabular-nums">{item.previousRate}%</td>
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[11px] tabular-nums">
                                            <TrendingUp size={12} />
                                            <span>{item.newRate}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold text-slate-900">{item.modifiedBy}</span>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{item.reason}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Diagnostics Strip */}
            <div className="px-4 py-1.5 bg-slate-900 text-white/40 flex items-center justify-between border-t border-slate-800 mt-auto">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest">
                        <div className="w-1 h-1 rounded-full bg-emerald-400" />
                        Billing Engine: Stable
                    </div>
                    <div className="h-3 w-px bg-slate-700" />
                    <div className="text-[9px] font-bold tabular-nums">Engine:KK-PYLD-v2.1</div>
                </div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-white/60">Financial Integrity Layer</div>
            </div>
        </div>
    );
}
