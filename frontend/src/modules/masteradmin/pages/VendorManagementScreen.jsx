import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Search,
    MoreVertical,
    Star,
    Package,
    Activity,
    TrendingUp,
    ShieldCheck,
    Filter,
    Plus,
    Home,
    ChevronRight,
    Download,
    FileText,
    Settings2,
    Shield,
    CheckCircle2,
    Clock,
    UserPlus,
    BarChart3
} from 'lucide-react';
import mockVendors from '../data/mockVendors.json';
import { cn } from '@/lib/utils';
import VendorOnboardingDrawer from '../components/drawers/VendorOnboardingDrawer';

// Enterprise Components
import MetricRow from '../components/cards/MetricRow';
import DataGrid from '../components/tables/DataGrid';
import FilterBar from '../components/tables/FilterBar';

export default function VendorManagementScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isOnboardOpen, setIsOnboardOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 700);
        return () => clearTimeout(timer);
    }, []);

    const filteredVendors = mockVendors.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const vendorColumns = [
        {
            header: 'Vendor Name',
            key: 'name',
            render: (val, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-sm bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        <Users size={14} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-[11px] leading-none mb-1">{val}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{row.id}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Vertical',
            key: 'category',
            render: (val) => <span className="text-[10px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-sm border border-slate-200 uppercase tracking-tight">{val}</span>
        },
        {
            header: 'Trust Score',
            key: 'rating',
            render: (val) => (
                <div className="flex items-center gap-1.5">
                    <Star size={10} className="text-amber-500 fill-amber-500" />
                    <span className="text-[11px] font-bold text-slate-900 tabular-nums">{val}</span>
                </div>
            )
        },
        {
            header: 'Total Yield',
            key: 'ordersFulfilled',
            render: (val) => <span className="text-[11px] font-bold text-slate-900 tabular-nums">{val.toLocaleString()}</span>
        },
        {
            header: 'Workload',
            key: 'pendingWorkload',
            render: (val) => (
                <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-[60px] h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={cn("h-full", val > 15 ? "bg-rose-500" : val > 10 ? "bg-amber-400" : "bg-emerald-500")}
                            style={{ width: `${Math.min((val / 20) * 100, 100)}%` }}
                        />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 tabular-nums">{val}</span>
                </div>
            )
        },
        {
            header: 'Status',
            key: 'status',
            render: (val) => (
                <div className={cn(
                    "px-2 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest border w-fit",
                    val === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                )}>
                    {val}
                </div>
            )
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
                            <span>Admin Panel</span>
                            <ChevronRight size={10} />
                            <span className="text-slate-900 uppercase tracking-widest">Vendors</span>
                        </div>
                        <h1 className="text-sm font-bold text-slate-900">Vendor List</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-sm text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                            <FileText size={13} className="text-slate-400" />
                            <span>Partnership Report</span>
                        </button>
                        <button
                            onClick={() => setIsOnboardOpen(true)}
                            className="bg-slate-900 text-white px-3 py-1.5 rounded-sm text-[11px] font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm"
                        >
                            <UserPlus size={13} />
                            Add Vendor
                        </button>
                    </div>
                </div>
            </div>

            {/* Performance KPIs */}
            <div className="bg-white border-b border-slate-200 grid grid-cols-1 md:grid-cols-4">
                <MetricRow
                    label="Verified Partners"
                    value="142"
                    change={2.4}
                    trend="up"
                    icon={ShieldCheck}
                    sparklineData={[135, 138, 140, 139, 142, 141, 142].map(v => ({ value: v }))}
                />
                <MetricRow
                    label="Performance"
                    value="98.4%"
                    change={0.2}
                    trend="up"
                    icon={BarChart3}
                    sparklineData={[97.5, 98, 98.2, 98.1, 98.4, 98.3, 98.4].map(v => ({ value: v }))}
                />
                <MetricRow
                    label="Average Rating"
                    value="4.82"
                    change={0.15}
                    trend="up"
                    icon={Shield}
                    sparklineData={[4.7, 4.75, 4.8, 4.78, 4.82, 4.81, 4.82].map(v => ({ value: v }))}
                />
                <MetricRow
                    label="Average Time"
                    value="2.4h"
                    change={-5.8}
                    trend="up"
                    icon={Clock}
                    sparklineData={[2.8, 2.7, 2.5, 2.6, 2.4, 2.5, 2.4].map(v => ({ value: v }))}
                />
            </div>

            {/* Operational Management */}
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

                <div className="bg-white border-t border-slate-200">
                    <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
                        <div className="relative group w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors" size={14} />
                            <input
                                type="text"
                                placeholder="Search vendors by name, category or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-sm py-1.5 pl-9 pr-4 outline-none text-[11px] font-medium placeholder:text-slate-400 focus:border-slate-400 transition-all font-sans"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest tabular-nums">Total Vendors: {filteredVendors.length}</span>
                        </div>
                    </div>

                    <DataGrid
                        title="Vendor List"
                        columns={vendorColumns}
                        data={filteredVendors}
                        density="compact"
                    />

                    {filteredVendors.length === 0 && (
                        <div className="py-20 flex flex-col items-center text-center bg-white border-t border-slate-100">
                            <div className="w-12 h-12 bg-slate-50 rounded-sm flex items-center justify-center text-slate-300 mb-4 border border-slate-100">
                                <Users size={24} />
                            </div>
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">No vendors found</h3>
                            <p className="text-[10px] text-slate-400 mt-1 font-medium uppercase tracking-widest">Try changing your search or filters</p>
                        </div>
                    )}
                </div>
            </div>

            <VendorOnboardingDrawer
                isOpen={isOnboardOpen}
                onClose={() => setIsOnboardOpen(false)}
                onSave={(data) => {
                    console.log('Vendor Provisioned:', data);
                    setIsOnboardOpen(false);
                }}
            />
        </div>
    );
}
