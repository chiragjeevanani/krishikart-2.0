import { motion } from 'framer-motion';
import { Download, ChevronDown, Maximize2, BarChart2, LineChart, AreaChart, Table as TableIcon } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function ChartCard({
    title,
    subtitle,
    children,
    onTimeRangeChange,
    onExport,
    className = "",
    allowTypeSwitch = true
}) {
    const [chartType, setChartType] = useState('area');
    const [showTable, setShowTable] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col",
                className
            )}
        >
            <div className="p-5 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
                    {subtitle && (
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            {subtitle}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {onTimeRangeChange && (
                        <div className="relative group">
                            <select
                                onChange={(e) => onTimeRangeChange(e.target.value)}
                                className="appearance-none bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-600 pl-3 pr-8 py-1.5 rounded-md cursor-pointer hover:bg-slate-100 transition-colors outline-none"
                            >
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                                <option value="90d">Last 3 Months</option>
                            </select>
                            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-slate-600" />
                        </div>
                    )}

                    <div className="h-8 flex items-center bg-slate-50 border border-slate-200 rounded-md p-1">
                        {allowTypeSwitch && (
                            <>
                                <button
                                    onClick={() => { setChartType('bar'); setShowTable(false); }}
                                    className={cn(
                                        "p-1 rounded transition-all",
                                        chartType === 'bar' && !showTable ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                    )}
                                    title="Bar Chart"
                                >
                                    <BarChart2 size={14} />
                                </button>
                                <button
                                    onClick={() => { setChartType('area'); setShowTable(false); }}
                                    className={cn(
                                        "p-1 rounded transition-all",
                                        chartType === 'area' && !showTable ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                    )}
                                    title="Area Chart"
                                >
                                    <AreaChart size={14} />
                                </button>
                                <div className="w-px h-3 bg-slate-200 mx-1" />
                            </>
                        )}
                        <button
                            onClick={() => setShowTable(!showTable)}
                            className={cn(
                                "p-1 rounded transition-all",
                                showTable ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                            title="Data Table"
                        >
                            <TableIcon size={14} />
                        </button>
                        <div className="w-px h-3 bg-slate-200 mx-1" />
                        <button
                            onClick={() => onExport?.('csv')}
                            className="p-1 text-slate-400 hover:text-slate-600 transition-all"
                            title="Export CSV"
                        >
                            <Download size={14} />
                        </button>
                    </div>

                    <button
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-md transition-all"
                        title="Expand View"
                    >
                        <Maximize2 size={14} />
                    </button>
                </div>
            </div>

            <div className="p-5 flex-1 min-h-[400px] w-full relative">
                {showTable ? (
                    <div className="absolute inset-0 p-5 overflow-auto bg-white">
                        {/* Summary/Metric Context can go here */}
                        <div className="text-slate-400 text-center py-20 text-sm italic">
                            Data table view for {title}...
                        </div>
                    </div>
                ) : (
                    children
                )}
            </div>

            <div className="px-5 py-3 border-t border-slate-50 bg-slate-25 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Current Period</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-slate-300" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Benchmark</span>
                    </div>
                </div>
                <button className="text-[11px] font-bold text-blue-600 hover:underline">View Details</button>
            </div>
        </motion.div>
    );
}
