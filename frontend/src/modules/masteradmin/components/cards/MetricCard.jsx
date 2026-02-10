import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function MetricCard({
    label,
    value,
    change,
    trend,
    icon: Icon,
    currency,
    index,
    sparklineData = [],
    comparisonText
}) {
    const isUp = trend === 'up';
    const isDown = trend === 'down';

    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.04 }}
            className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:border-slate-300 transition-all group"
        >
            <div className="flex items-start justify-between">
                <div className={cn(
                    "p-2 rounded-md transition-colors",
                    label.toLowerCase().includes('revenue') ? "bg-slate-50 text-blue-600" :
                        label.toLowerCase().includes('orders') ? "bg-slate-50 text-emerald-600" :
                            "bg-slate-50 text-slate-600"
                )}>
                    <Icon size={18} />
                </div>

                <div className="flex flex-col items-end gap-1">
                    {trend !== 'neutral' && (
                        <div className={cn(
                            "flex items-center gap-1 text-[11px] font-bold",
                            isUp ? "text-emerald-600" : "text-red-500"
                        )}>
                            {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            <span>{Math.abs(change)}%</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-3 flex items-end justify-between">
                <div>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
                    <div className="flex items-baseline gap-1 mt-0.5">
                        {currency && <span className="text-sm font-semibold text-slate-400">{currency}</span>}
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </h3>
                    </div>
                    {comparisonText && (
                        <p className="text-[10px] text-slate-400 mt-1">{comparisonText}</p>
                    )}
                </div>

                {sparklineData.length > 0 && (
                    <div className="h-10 w-20">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sparklineData}>
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke={isUp ? "#10b981" : isDown ? "#ef4444" : "#94a3b8"}
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
