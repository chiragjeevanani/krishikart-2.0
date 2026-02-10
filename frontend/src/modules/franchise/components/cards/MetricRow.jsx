import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function MetricRow({ label, value, change, trend, icon: Icon, sub }) {
    const isUp = trend === 'up';
    const isDown = trend === 'down';

    return (
        <div className="flex items-center gap-4 px-6 py-4 border-r border-slate-200 last:border-r-0 bg-white group hover:bg-slate-50 transition-colors">
            <div className={cn(
                "w-9 h-9 rounded-sm flex items-center justify-center transition-all duration-300",
                isUp ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100" :
                    isDown ? "bg-rose-50 text-rose-600 group-hover:bg-rose-100" :
                        "bg-slate-50 text-slate-500 group-hover:bg-slate-100"
            )}>
                {Icon && <Icon size={16} />}
            </div>
            <div className="flex-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight tabular-nums leading-none">
                        {value}
                    </h3>
                    {change !== undefined && (
                        <span className={cn(
                            "text-[10px] font-black flex items-center",
                            isUp ? "text-emerald-500" : isDown ? "text-rose-500" : "text-slate-400"
                        )}>
                            {isUp && <ArrowUpRight size={12} strokeWidth={3} />}
                            {isDown && <ArrowDownRight size={12} strokeWidth={3} />}
                            {Math.abs(change)}%
                        </span>
                    )}
                    {sub && (
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                            {sub}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
