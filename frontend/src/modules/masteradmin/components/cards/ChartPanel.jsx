import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Maximize2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChartPanel({
    title,
    subtitle,
    children,
    actions,
    collapsible = true,
    defaultExpanded = true,
    height = 320
}) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div className="bg-white border-t border-slate-200 flex flex-col h-full">
            {/* Header Strip */}
            <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10 min-h-[44px]">
                <div className="flex items-center gap-2">
                    {collapsible && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-1 hover:bg-slate-100 rounded-sm text-slate-400 transition-colors"
                        >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                    )}
                    <div>
                        <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest leading-none mb-1">
                            {title}
                        </h3>
                        {subtitle && isExpanded && (
                            <p className="text-[11px] font-bold text-slate-400 leading-none">{subtitle}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    {actions}
                    <div className="h-4 w-px bg-slate-200 mx-1" />
                    <button className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-sm transition-colors">
                        <Download size={14} />
                    </button>
                    <button className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-sm transition-colors">
                        <Maximize2 size={14} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {isExpanded && (
                <div
                    className="w-full flex-1 overflow-hidden"
                    style={{ minHeight: height }}
                >
                    {children}
                </div>
            )}
        </div>
    );
}
