import React from 'react';
import { Search, Filter, Calendar, RefreshCw, ChevronDown, Download, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FilterBar({
    onSearch,
    onRefresh,
    activeFilters = [],
    onFilterChange,
    actions
}) {
    return (
        <div className="bg-slate-50 border-y border-slate-200 px-4 py-2 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                {/* Search Input */}
                <div className="relative min-w-[180px] max-w-[280px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                    <input
                        type="search"
                        placeholder="Filter data..."
                        onChange={(e) => onSearch?.(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-sm pl-8 pr-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-all placeholder:text-slate-400"
                    />
                </div>

                {/* Primary Filters (Quick Tabs) */}
                <div className="flex items-center bg-slate-200/50 p-0.5 rounded-sm">
                    <button className="px-3 py-1 text-[10px] font-bold bg-white text-slate-900 shadow-sm rounded-sm">All</button>
                    <button className="px-3 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-900 transition-colors">Pending</button>
                    <button className="px-3 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-900 transition-colors">Verified</button>
                </div>

                <div className="h-4 w-px bg-slate-300" />

                {/* Date Controls */}
                <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-sm text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                    <Calendar size={13} className="text-slate-400" />
                    <span>Last 30 Days</span>
                    <ChevronDown size={12} className="text-slate-300" />
                </button>

                {/* More Filters */}
                <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-sm text-[10px] font-bold hover:bg-slate-800 transition-colors">
                    <Filter size={13} />
                    <span>Advanced</span>
                </button>
            </div>

            <div className="flex items-center gap-2">
                {actions}
                <button
                    onClick={onRefresh}
                    className="p-1.5 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded transition-colors"
                    title="Refresh Data"
                >
                    <RefreshCw size={14} />
                </button>
            </div>
        </div>
    );
}
