import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

export default function MetricRow({
    label,
    value,
    change,
    trend,
    icon: Icon,
    currency,
    sparklineData = []
}) {
    const isUp = trend === 'up';

    return (
        <div className="flex flex-col py-2.5 px-4 hover:bg-slate-50/50 transition-colors h-full justify-center min-w-0">
            {/* Top row: Label and Trend */}
            <div className="flex items-center justify-between gap-2 mb-1 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                    {Icon && <Icon size={12} className="text-slate-400 shrink-0" />}
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">
                        {label}
                    </span>
                </div>
                <div className={cn(
                    "flex items-center gap-0.5 font-bold tabular-nums text-[10px] shrink-0",
                    isUp ? "text-emerald-600" : "text-rose-600"
                )}>
                    <span>{isUp ? '↑' : '↓'}</span>
                    <span className="leading-none">{change}%</span>
                </div>
            </div>

            {/* Bottom row: Value and Sparkline */}
            <div className="flex items-end justify-between gap-3 min-w-0">
                <div className="flex items-baseline gap-1 min-w-0 overflow-hidden">
                    <span className="text-lg font-bold text-slate-900 tabular-nums tracking-tight truncate">
                        {value}
                    </span>
                    {currency && <span className="text-[10px] font-bold text-slate-400 shrink-0">{currency}</span>}
                </div>

                {/* Micro Sparkline */}
                <div className="w-14 h-5 shrink-0 opacity-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sparklineData}>
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke={isUp ? "#10b981" : "#f43f5e"}
                                strokeWidth={2}
                                dot={false}
                                animationDuration={1000}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
