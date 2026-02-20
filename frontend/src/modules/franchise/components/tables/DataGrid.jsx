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
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const itemsPerPage = 10;

    const densityClass = {
        default: 'py-4 px-6',
        compact: 'py-3 px-4',
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
        const filtered = sortedData.filter(item =>
            Object.values(item).some(value =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
        return filtered;
    }, [sortedData, searchTerm]);

    // Reset page when search changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

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
                        {title && <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">{title}</h3>}
                        {showSearch && (
                            <div className="relative group w-full max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={14} />
                                <input
                                    type="text"
                                    placeholder="Filter records..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-sm py-2 pl-9 pr-4 outline-none text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-slate-400 transition-all font-sans"
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
                                        "text-left text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none select-none",
                                        column.sortable ? 'cursor-pointer hover:text-slate-900' : '',
                                        column.align === 'right' ? 'text-right' : '',
                                        densityClass
                                    )}
                                >
                                    <div className={cn("flex items-center gap-2", column.align === 'right' ? 'justify-end' : 'justify-start')}>
                                        {column.header}
                                        {column.sortable && <ArrowUpDown size={12} className={cn("transition-colors", sortConfig.key === column.key ? "text-slate-900" : "text-slate-300")} />}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {paginatedData.length > 0 ? (
                            paginatedData.map((row, rowIdx) => (
                                <tr
                                    key={row.id || rowIdx}
                                    className="group hover:bg-slate-50/80 transition-colors"
                                >
                                    {columns.map((column, colIdx) => (
                                        <td
                                            key={colIdx}
                                            className={cn(
                                                "text-sm font-bold text-slate-600 transition-colors whitespace-nowrap",
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
                                        <div className="w-12 h-12 rounded-sm bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                                            <Search size={20} />
                                        </div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No matching records</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest tabular-nums">
                    Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} records
                </span>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-sm border border-transparent hover:border-slate-200 hover:bg-white text-slate-400 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-all"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="px-2 text-[10px] font-bold text-slate-500">
                        Page {currentPage} of {Math.max(1, totalPages)}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="p-1.5 rounded-sm border border-transparent hover:border-slate-200 hover:bg-white text-slate-400 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-all"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
