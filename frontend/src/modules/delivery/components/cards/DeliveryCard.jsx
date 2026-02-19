import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Package, Clock, ChevronRight, Check, X } from 'lucide-react';

const DeliveryCard = ({ request, onAccept, onReject }) => {
    const priorityColors = {
        high: 'bg-red-100 text-red-700 border-red-200',
        medium: 'bg-amber-100 text-amber-700 border-amber-200',
        low: 'bg-blue-100 text-blue-700 border-blue-200',
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, x: 100 }}
            whileHover={{ y: -2 }}
            className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all mb-4"
        >
            <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${priorityColors[request.priority]}`}>
                            {request.priority} Priority
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">{request.distance} away</span>
                    </div>
                    <span className="text-sm font-bold text-primary">₹{request.amount}</span>
                </div>

                <div className="space-y-4 relative">
                    {/* Vertical Line Connector */}
                    <div className="absolute left-[7px] top-2 bottom-2 w-0.5 border-l-2 border-dashed border-muted" />

                    {/* Pickup */}
                    <div className="flex gap-3 relative z-10">
                        <div className="w-4 h-4 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">Pickup From</p>
                            <p className="text-sm font-bold text-slate-900 truncate">{request.franchise}</p>
                            <p className="text-[10px] text-slate-400 font-medium line-clamp-1 mt-0.5">{request.franchiseAddress}</p>
                        </div>
                    </div>

                    {/* Dropoff */}
                    <div className="flex gap-3 relative z-10">
                        <div className="w-4 h-4 rounded-full bg-amber-100 border-2 border-amber-500 flex items-center justify-center mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">Deliver To</p>
                            <p className="text-sm font-bold text-slate-900 truncate">{request.customerName}</p>
                            <p className="text-[10px] text-slate-400 font-medium line-clamp-1 mt-0.5">{request.customerAddress}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t border-muted/50">
                    <div className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        <span>{request.itemsCount} items</span>
                    </div>

                </div>
            </div>

            <div className="flex border-t border-border">
                <button
                    onClick={() => onReject(request.id)}
                    className="flex-1 py-4 flex items-center justify-center gap-2 text-sm font-bold text-destructive hover:bg-destructive/5 active:bg-destructive/10 transition-colors border-r border-border"
                >
                    <X className="w-4 h-4" /> Reject
                </button>
                <button
                    onClick={() => onAccept(request.id)}
                    className="flex-1 py-4 flex items-center justify-center gap-2 text-sm font-bold text-primary hover:bg-primary/5 active:bg-primary/10 transition-colors"
                >
                    <Check className="w-4 h-4" /> Accept Task
                </button>
            </div>
        </motion.div>
    );
};

export default DeliveryCard;
