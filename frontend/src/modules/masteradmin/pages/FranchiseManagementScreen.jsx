import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Store,
    Search,
    ChevronDown,
    ChevronUp,
    Globe,
    Activity,
    BarChart2,
    Power,
    ExternalLink,
    MapPin,
    Calendar,
    Home,
    ChevronRight,
    FileText,
    Settings2,
    Server,
    ShieldCheck,
    Cpu,
    Network
} from 'lucide-react';
import mockFranchises from '../data/mockFranchises.json';
import { cn } from '@/lib/utils';

// Enterprise Components
import MetricRow from '../components/cards/MetricRow';
import FilterBar from '../components/tables/FilterBar';

export default function FranchiseManagementScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const [expandedRow, setExpandedRow] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 700);
        return () => clearTimeout(timer);
    }, []);

    const filteredFranchises = mockFranchises.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.region.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                            <span className="text-slate-900 uppercase tracking-widest">Node Infrastructure</span>
                        </div>
                        <h1 className="text-sm font-bold text-slate-900">Regional Distribution Network</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-sm text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                            <Network size={13} className="text-slate-400" />
                            <span>Map Topology</span>
                        </button>
                        <button className="bg-slate-900 text-white px-3 py-1.5 rounded-sm text-[11px] font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors">
                            <Server size={13} />
                            Provision Node
                        </button>
                    </div>
                </div>
            </div>

            {/* Network KPIs */}
            <div className="bg-white border-b border-slate-200 grid grid-cols-1 md:grid-cols-4">
                <MetricRow
                    label="Nodes Online"
                    value="24"
                    change={4.2}
                    trend="up"
                    icon={Cpu}
                    sparklineData={[22, 23, 24, 23, 24, 24, 24].map(v => ({ value: v }))}
                />
                <MetricRow
                    label="Network Efficiency"
                    value="89.4%"
                    change={1.2}
                    trend="up"
                    icon={Activity}
                    sparklineData={[88, 88.5, 89, 88.8, 89.4, 89.2, 89.4].map(v => ({ value: v }))}
                />
                <MetricRow
                    label="System Throughput"
                    value="1.2M/h"
                    change={8.4}
                    trend="up"
                    icon={BarChart2}
                    sparklineData={[1.0, 1.1, 1.2, 1.1, 1.2, 1.3, 1.2].map(v => ({ value: v }))}
                />
                <MetricRow
                    label="SLA Compliance"
                    value="99.2%"
                    change={0.1}
                    trend="up"
                    icon={ShieldCheck}
                    sparklineData={[99, 99.1, 99.2, 99, 99.2, 99.3, 99.2].map(v => ({ value: v }))}
                />
            </div>

            {/* Node Management Ledger */}
            <div className="flex flex-col gap-0 p-px">
                <FilterBar
                    actions={
                        <div className="flex items-center gap-2">
                            <button className="p-1.5 border border-slate-200 rounded-sm hover:bg-slate-100 transition-colors text-slate-400">
                                <Settings2 size={14} />
                            </button>
                        </div>
                    }
                />

                <div className="bg-white border-t border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
                        <div className="relative group w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors" size={14} />
                            <input
                                type="text"
                                placeholder="Filter by franchise name, region or node ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-sm py-1.5 pl-9 pr-4 outline-none text-[11px] font-medium placeholder:text-slate-400 focus:border-slate-400 transition-all font-sans"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest tabular-nums font-sans">Registered Nodes: {filteredFranchises.length}</span>
                        </div>
                    </div>

                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-slate-200">
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Node Identity</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Efficiency</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Annual Yield</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Queue Density</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Settings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredFranchises.map((franchise) => (
                                <React.Fragment key={franchise.id}>
                                    <tr
                                        className={cn(
                                            "group cursor-pointer hover:bg-slate-50/80 transition-all",
                                            expandedRow === franchise.id ? "bg-slate-50" : "bg-white"
                                        )}
                                        onClick={() => setExpandedRow(expandedRow === franchise.id ? null : franchise.id)}
                                    >
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-9 h-9 rounded-sm flex items-center justify-center border",
                                                    franchise.status === 'active' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-rose-50 border-rose-100 text-rose-600"
                                                )}>
                                                    <Store size={16} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-[11px] tracking-tight leading-none mb-1">{franchise.name}</p>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{franchise.region}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${franchise.performance}%` }}
                                                        className={cn(
                                                            "h-full",
                                                            franchise.performance > 90 ? "bg-emerald-500" :
                                                                franchise.performance > 80 ? "bg-slate-900" : "bg-amber-400"
                                                        )}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-900 tabular-nums">{franchise.performance}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 text-[11px] tabular-nums">₹{(franchise.orderVolume / 1000).toFixed(1)}k</span>
                                                <span className="text-[9px] text-slate-300 font-bold uppercase tracking-tighter">Gross GMV</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="px-2 py-0.5 bg-slate-900 text-white text-[9px] font-black rounded-sm uppercase tracking-widest tabular-nums">
                                                {franchise.activeOrders} Load
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className={cn(
                                                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-wider border",
                                                franchise.status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                                            )}>
                                                <div className={cn("w-1 h-1 rounded-full animate-pulse", franchise.status === 'active' ? "bg-emerald-400" : "bg-rose-400")} />
                                                {franchise.status}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <button className="p-1.5 text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-200 rounded-sm transition-all">
                                                {expandedRow === franchise.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </button>
                                        </td>
                                    </tr>

                                    <AnimatePresence>
                                        {expandedRow === franchise.id && (
                                            <tr>
                                                <td colSpan="6" className="p-0 border-b border-slate-200">
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="bg-slate-50/50"
                                                    >
                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 divide-x divide-slate-100 border-b border-slate-100">
                                                            <div className="p-4 space-y-4">
                                                                <div className="flex items-center gap-2 text-slate-900">
                                                                    <MapPin size={13} />
                                                                    <h5 className="text-[10px] font-black uppercase tracking-widest">Contact Module</h5>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[9px] text-slate-400 uppercase font-bold">Center Lead</span>
                                                                        <p className="text-[11px] font-bold text-slate-900">Rajiv S.</p>
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[9px] text-slate-400 uppercase font-bold">Network ID</span>
                                                                        <p className="text-[11px] font-bold text-slate-900">SEC-42-CENTER</p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="p-4 space-y-4">
                                                                <div className="flex items-center gap-2 text-slate-900">
                                                                    <Activity size={13} />
                                                                    <h5 className="text-[10px] font-black uppercase tracking-widest">Resource Matrix</h5>
                                                                </div>
                                                                <div className="space-y-3">
                                                                    <div className="flex justify-between items-center bg-white p-2 border border-slate-100 rounded-sm">
                                                                        <span className="text-[9px] font-bold text-slate-500 uppercase">Storage</span>
                                                                        <span className="text-[10px] font-black text-slate-900">84%</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center bg-white p-2 border border-slate-100 rounded-sm">
                                                                        <span className="text-[9px] font-bold text-slate-500 uppercase">Supply Nodes</span>
                                                                        <span className="text-[10px] font-black text-slate-900">12</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="p-4 space-y-4">
                                                                <div className="flex items-center gap-2 text-slate-900">
                                                                    <Calendar size={13} />
                                                                    <h5 className="text-[10px] font-black uppercase tracking-widest">24h Signal</h5>
                                                                </div>
                                                                <div className="space-y-3">
                                                                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                                                                        <span>New Bookings</span>
                                                                        <span className="text-slate-900">+42</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                                                                        <span>SLA Fulfillment</span>
                                                                        <span className="text-emerald-600 font-black">98.2%</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="p-4 grid grid-cols-1 gap-2 bg-slate-100/30">
                                                                <button className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest py-2 rounded-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                                                                    <ExternalLink size={12} />
                                                                    Network Portal
                                                                </button>
                                                                <button className="bg-white border border-slate-200 text-rose-600 text-[9px] font-black uppercase tracking-widest py-2 rounded-sm hover:bg-rose-50 transition-all flex items-center justify-center gap-2 group">
                                                                    <Power size={12} />
                                                                    Decommission Node
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                </td>
                                            </tr>
                                        )}
                                    </AnimatePresence>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>

                    {filteredFranchises.length === 0 && (
                        <div className="py-20 flex flex-col items-center text-center bg-white border-t border-slate-100">
                            <div className="w-12 h-12 bg-slate-50 rounded-sm flex items-center justify-center text-slate-300 mb-4 border border-slate-100">
                                <Network size={24} />
                            </div>
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">No network nodes matching query</h3>
                            <p className="text-[10px] text-slate-400 mt-1 font-medium uppercase tracking-widest">System topology verified: No hits</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Simple React import fix for component use
import React from 'react';
