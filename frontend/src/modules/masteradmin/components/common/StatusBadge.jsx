import { cn } from '@/lib/utils';

const statusConfig = {
    pending_assignment: { label: 'Pending Assignment', bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-400' },
    assigned: { label: 'Assigned', bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-400' },
    accepted: { label: 'PO Accepted', bg: 'bg-indigo-50', text: 'text-indigo-600', dot: 'bg-indigo-400' },
    preparing: { label: 'Being Packed', bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-400' },
    ready: { label: 'Ready for Pickup', bg: 'bg-primary/10', text: 'text-primary', dot: 'bg-primary' },
    in_transit: { label: 'In Transit', bg: 'bg-purple-50', text: 'text-purple-600', dot: 'bg-purple-400' },
    delivered: { label: 'Delivered', bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-400' },
    incoming: { label: 'Incoming', bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' }
};

export default function StatusBadge({ status }) {
    const config = statusConfig[status] || { label: status, bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' };

    return (
        <div className={cn(
            "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
            config.bg,
            config.text
        )}>
            <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", config.dot)} />
            {config.label}
        </div>
    );
}
