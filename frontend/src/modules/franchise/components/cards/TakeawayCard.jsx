import { motion } from 'framer-motion';
import { Store, User, Clock, Check, Play, PackageCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TakeawayCard({ order, onStatusChange }) {
    const statusMap = {
        kiosk: { label: 'New', color: 'bg-blue-50 text-blue-500', next: 'preparing', actionIcon: Play, actionLabel: 'Start Prep' },
        preparing: { label: 'In Kitchen', color: 'bg-orange-50 text-orange-500', next: 'ready', actionIcon: Check, actionLabel: 'Mark Ready' },
        ready: { label: 'Ready for Pickup', color: 'bg-emerald-50 text-emerald-500', next: 'completed', actionIcon: PackageCheck, actionLabel: 'Handed Over' }
    };

    const config = statusMap[order.status] || statusMap.kiosk;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[32px] p-6 border-2 border-transparent hover:border-primary/20 transition-all shadow-sm flex flex-col h-full"
        >
            <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <span className="font-black text-xl">{order.id.split('-').pop()}</span>
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-slate-900 tracking-tight">{order.customer}</h4>
                        <div className="flex items-center gap-2 mt-1">
                            <Clock size={14} className="text-slate-300" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {order.items.length} Items • Ordered 5m ago
                            </span>
                        </div>
                    </div>
                </div>
                <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight", config.color)}>
                    {config.label}
                </div>
            </div>

            <div className="flex-1 mb-6 space-y-2">
                {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                        <span className="text-sm font-bold text-slate-600">
                            <span className="text-primary font-black mr-2">{item.quantity}x</span> {item.name}
                        </span>
                    </div>
                ))}
            </div>

            <button
                onClick={() => onStatusChange(order.id, config.next)}
                className={cn(
                    "w-full h-14 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-xs tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-black/5",
                    order.status === 'ready' ? "bg-primary text-white" : "bg-slate-900 text-white hover:bg-slate-800"
                )}
            >
                <config.actionIcon size={18} />
                {config.actionLabel}
            </button>
        </motion.div>
    );
}
