import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DataGrid({
    title,
    columns,
    data = [],
    density = 'compact',
    showSearch = true,
    actions
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    const densityClass = {
        default: 'py-4 px-6',
        compact: 'py-2.5 px-4',
        ultra: 'py-1.5 px-3',
    }[density];

    const sortedData = useMemo(() => {
        let sortableItems = [...data];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [data, sortConfig]);

    const filteredData = useMemo(() => {
        return sortedData.filter(item =>
            Object.values(item).some(value =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [sortedData, searchTerm]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="bg-white border-t border-slate-200">
            {/* Control Header */}
            {(title || showSearch || actions) && (
                <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        {title && <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">{title}</h3>}
                        {showSearch && (
                            <div className="relative group w-full max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={14} />
                                <input
                                    type="text"
                                    placeholder="Filter records..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-sm py-1.5 pl-9 pr-4 outline-none text-[11px] font-bold text-slate-900 placeholder:text-slate-400 focus:border-slate-400 transition-all font-sans"
                                />
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {actions}
                    </div>
                </div>
            )}

            <div className="overflow-x-auto overflow-y-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50/80 border-b border-slate-200">
                        <tr>
                            {columns.map((column, idx) => (
                                <th
                                    key={column.key || idx}
                                    onClick={() => column.sortable && requestSort(column.key)}
                                    className={cn(
                                        "text-left text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none select-none",
                                        column.sortable ? 'cursor-pointer hover:text-slate-900' : '',
                                        column.align === 'right' ? 'text-right' : '',
                                        densityClass
                                    )}
                                >
                                    <div className={cn("flex items-center gap-2", column.align === 'right' ? 'justify-end' : 'justify-start')}>
                                        {column.header}
                                        {column.sortable && <ArrowUpDown size={10} className={cn("transition-colors", sortConfig.key === column.key ? "text-slate-900" : "text-slate-300")} />}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredData.length > 0 ? (
                            filteredData.map((row, rowIdx) => (
                                <tr
                                    key={row.id || rowIdx}
                                    className="group hover:bg-slate-50/80 transition-colors"
                                >
                                    {columns.map((column, colIdx) => (
                                        <td
                                            key={colIdx}
                                            className={cn(
                                                "text-[11px] font-bold text-slate-600 transition-colors whitespace-nowrap",
                                                column.align === 'right' ? 'text-right' : '',
                                                densityClass
                                            )}
                                        >
                                            {column.render ? column.render(row[column.key], row) : row[column.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-10 h-10 rounded-sm bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                                            <Search size={18} />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No matching records</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Micro Pagination */}
            <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest tabular-nums">
                    Count: {filteredData.length} // Page 1 of 1
                </span>
                <div className="flex items-center gap-1">
                    <button className="p-1 text-slate-400 hover:text-slate-900 disabled:opacity-30" disabled>
                        <ChevronLeft size={14} />
                    </button>
                    <button className="p-1 text-slate-400 hover:text-slate-900 disabled:opacity-30" disabled>
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
