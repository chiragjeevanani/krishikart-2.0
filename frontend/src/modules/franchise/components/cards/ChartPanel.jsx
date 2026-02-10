import React from 'react';
import { cn } from '@/lib/utils';
import { MoreHorizontal } from 'lucide-react';

export default function ChartPanel({ title, subtitle, children, height = 300, className }) {
    return (
        <div className={cn("bg-white flex flex-col group", className)}>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <div>
                    {title && <h3 className="text-xs font-black text-slate-900 tracking-tight uppercase mb-0.5">{title}</h3>}
                    {subtitle && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{subtitle}</p>}
                </div>
                <button className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-sm transition-all opacity-0 group-hover:opacity-100">
                    <MoreHorizontal size={14} />
                </button>
            </div>
            <div className="p-5 flex-1" style={{ height }}>
                {children}
            </div>
        </div>
    );
}
