import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Maximize2, Download, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function ChartPanel({
    title,
    subtitle,
    children,
    actions,
    collapsible = true,
    defaultExpanded = true,
    height = 320,
    data = []
}) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const [isMaximized, setIsMaximized] = useState(false);

    // Prevent scrolling when maximized
    useEffect(() => {
        if (isMaximized) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isMaximized]);

    const handleDownload = () => {
        if (!data || data.length === 0) {
            toast.error("No data available to export");
            return;
        }

        toast.info(`Exporting ${title} data...`, {
            description: "Preparing your CSV file for download.",
        });
        
        try {
            // Simple JSON to CSV converter
            const headers = Object.keys(data[0]);
            const csvRows = [
                headers.join(','), // Header row
                ...data.map(row => 
                    headers.map(fieldName => {
                        const value = row[fieldName];
                        // Handle comma in actual data
                        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
                        return `"${stringValue.replace(/"/g, '""')}"`;
                    }).join(',')
                )
            ];
            
            const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Download Complete", {
                description: `${title} data has been saved to your device.`
            });
        } catch (error) {
            console.error("Download failed:", error);
            toast.error("Export Failed", {
                description: "An error occurred while generating the CSV."
            });
        }
    };

    return (
        <>
            <div className={cn(
                "bg-white border-t border-slate-200 flex flex-col transition-all",
                isMaximized ? "fixed inset-0 z-[100] h-screen w-screen" : "h-full"
            )}>
                {/* Header Strip */}
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10 min-h-[48px]">
                    <div className="flex items-center gap-2">
                        {!isMaximized && collapsible && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="p-1 hover:bg-slate-100 rounded-sm text-slate-400 transition-colors"
                            >
                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                        )}
                        <div>
                            <h3 className={cn(
                                "font-black text-slate-900 uppercase tracking-[0.2em] leading-none mb-1",
                                isMaximized ? "text-sm" : "text-[10px]"
                            )}>
                                {title}
                            </h3>
                            {(isMaximized || (subtitle && isExpanded)) && (
                                <p className="text-[11px] font-bold text-slate-400 leading-none">{subtitle}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {actions}
                        {!isMaximized && <div className="h-4 w-px bg-slate-200 mx-1" />}
                        
                        <button 
                            onClick={handleDownload}
                            className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-all"
                            title="Export Data"
                        >
                            <Download size={16} />
                        </button>
                        
                        <button 
                            onClick={() => setIsMaximized(!isMaximized)}
                            className={cn(
                                "p-1.5 rounded-lg transition-all",
                                isMaximized 
                                    ? "bg-slate-900 text-white hover:bg-slate-800" 
                                    : "hover:bg-slate-50 text-slate-400 hover:text-slate-900"
                            )}
                            title={isMaximized ? "Close Fullscreen" : "Maximize view"}
                        >
                            {isMaximized ? <X size={16} /> : <Maximize2 size={16} />}
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                {(isMaximized || isExpanded) && (
                    <div
                        className={cn(
                            "w-full overflow-hidden p-6 bg-white",
                            isMaximized ? "flex-1 overflow-auto" : ""
                        )}
                        style={!isMaximized ? { height: height } : {}}
                    >
                        {children}
                    </div>
                )}
            </div>
            
            {/* Backdrop for Maximized State */}
            <AnimatePresence>
                {isMaximized && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[90]"
                    />
                )}
            </AnimatePresence>
        </>
    );
}

