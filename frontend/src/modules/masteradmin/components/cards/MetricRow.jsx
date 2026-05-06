import React from 'react';
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
            {/* Top row: Label */}
            <div className="flex items-center justify-between gap-2 mb-1 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                    {Icon && <Icon size={12} className="text-slate-400 shrink-0" />}
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">
                        {label || 'Metric'}
                    </span>
                </div>
            </div>

            {/* Bottom row: Value & Sparkline */}
            <div className="flex items-end justify-between gap-3 min-w-0">
                <div className="flex items-baseline gap-1 min-w-0 overflow-hidden">
                    <span className="text-lg font-bold text-slate-900 tabular-nums tracking-tight truncate">
                        {value ?? '0'}
                    </span>
                    {currency && <span className="text-[10px] font-bold text-slate-400 shrink-0">{currency}</span>}
                </div>

                {/* Micro Sparkline */}
                {sparklineData.length > 0 && (
                    <div className="w-12 h-6 shrink-0 mb-1">
                        <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                            <path
                                d={`M ${sparklineData.map((d, i) => `${(i / (sparklineData.length - 1)) * 100} ${40 - ((d.value - Math.min(...sparklineData.map(v => v.value))) / (Math.max(...sparklineData.map(v => v.value)) - Math.min(...sparklineData.map(v => v.value)) || 1)) * 35 - 2.5}`).join(' L ')}`}
                                fill="none"
                                stroke={isUp ? "#10b981" : trend === 'down' ? "#f43f5e" : "#94a3b8"}
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
}
