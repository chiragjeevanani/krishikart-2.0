import React from 'react';
import { cn } from '@/lib/utils';
import { MoreHorizontal, ArrowUpDown, ChevronRight } from 'lucide-react';

export default function DataGrid({
    columns = [],
    data = [],
    onRowClick,
    title,
    actions,
    footer,
    density = 'compact', // compact, standard
    stickyHeader = true
}) {
    return (
        <div className="w-full bg-white border-t border-slate-200 flex flex-col">
            {/* Grid Header Info (Optional) */}
            {(title || actions) && (
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-25/50">
                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                        {title}
                    </h3>
                    <div className="flex items-center gap-2">
                        {actions}
                    </div>
                </div>
            )}

            {/* Main Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead className={cn(
                        "bg-white border-b border-slate-200",
                        stickyHeader && "sticky top-0 z-20"
                    )}>
                        <tr>
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className={cn(
                                        "text-[11px] font-bold text-slate-500 uppercase tracking-wider",
                                        density === 'compact' ? "px-4 py-2" : "px-4 py-3",
                                        col.align === 'right' ? "text-right" : "text-left",
                                        col.sticky && "sticky left-0 bg-white z-10"
                                    )}
                                    style={{ width: col.width }}
                                >
                                    <div className="flex items-center gap-1.5 group cursor-pointer hover:text-slate-900 transition-colors">
                                        {col.header}
                                        {col.sortable && <ArrowUpDown size={10} className="text-slate-300 group-hover:text-slate-500" />}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.length > 0 ? (
                            data.map((row, rowIdx) => (
                                <tr
                                    key={rowIdx}
                                    onClick={() => onRowClick?.(row)}
                                    className={cn(
                                        "group hover:bg-slate-50/80 transition-colors",
                                        onRowClick && "cursor-pointer"
                                    )}
                                >
                                    {columns.map((col, colIdx) => (
                                        <td
                                            key={colIdx}
                                            className={cn(
                                                "text-sm font-medium text-slate-700 tabular-nums",
                                                density === 'compact' ? "px-4 py-2" : "px-4 py-3",
                                                col.align === 'right' ? "text-right" : "text-left",
                                                col.sticky && "sticky left-0 bg-white group-hover:bg-slate-50/80 z-10"
                                            )}
                                        >
                                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400 text-sm font-medium">
                                    No records found in this view.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer / Aggregation Row */}
            {footer && (
                <div className="px-4 py-2 border-t border-slate-200 bg-slate-50/80">
                    {footer}
                </div>
            )}
        </div>
    );
}
