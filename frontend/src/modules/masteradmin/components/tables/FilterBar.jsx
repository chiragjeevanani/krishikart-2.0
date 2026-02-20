import React from 'react';
import { Search, Filter, Calendar, RefreshCw, ChevronDown, Download, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FilterBar({
    onSearch,
    onRefresh,
    activeFilter,
    onFilterChange,
    filters = ['All', 'Pending', 'Verified'],
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
                    {filters.map(filter => (
                        <button
                            key={filter}
                            onClick={() => onFilterChange?.(filter)}
                            className={cn(
                                "px-3 py-1 text-[10px] font-bold transition-all rounded-sm",
                                (activeFilter?.toLowerCase() === filter?.toLowerCase())
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-500 hover:text-slate-900"
                            )}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

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
