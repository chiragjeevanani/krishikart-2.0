import { motion } from 'framer-motion';
import StatusBadge from '../common/StatusBadge';
import {
    MoreVertical,
    ExternalLink,
    IndianRupee,
    CreditCard,
    Wallet,
    Banknote,
    ShoppingBag,
    Truck,
    Package,
    AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const PaymentBadge = ({ method }) => {
    const config = {
        'Prepaid': { icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
        'COD': { icon: Banknote, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
        'Credit': { icon: Wallet, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' }
    };

    const { icon: Icon, color, bg, border } = config[method] || config['COD'];

    return (
        <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider border", bg, color, border)}>
            <Icon size={10} />
            {method}
        </span>
    );
};

export default function OrdersTable({ orders, onAction, onOrderClick, onProcure }) {
    const navigate = useNavigate();

    return (
        <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 border-y border-slate-200">
                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Franchise</th>
                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Items</th>
                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                    {orders.map((order) => (
                        <tr
                            key={order._id}
                            onClick={() => onOrderClick?.(order._id)}
                            className="group hover:bg-slate-50/80 transition-colors cursor-pointer"
                        >
                            <td className="px-4 py-4">
                                <div className="flex flex-col">
                                    <span className={cn(
                                        "font-bold text-[11px] tracking-widest uppercase",
                                        order.franchiseId ? "text-slate-900" : "text-amber-600"
                                    )}>
                                        {order.franchiseId ? (order.franchiseId.shopName || order.franchiseId.ownerName) : 'Unassigned'}
                                    </span>
                                    {order.franchiseId && (
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">
                                            {order.franchiseId.shopName ? order.franchiseId.ownerName : order.franchiseId.mobile}
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="px-4 py-4">
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-800 text-[11px] leading-none mb-1">{order.userId?.fullName || 'Guest'}</span>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">{order.userId?.mobile || 'No Mobile'}</span>
                                </div>
                            </td>
                            <td className="px-4 py-4">
                                <div className="flex flex-col gap-1 items-start">
                                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-sm">
                                        {order.items?.length || 0} {order.items?.length === 1 ? 'Item' : 'Items'}
                                    </span>
                                    {order.items?.some(i => i.isShortage) && (
                                        <span className="text-[8px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-sm uppercase tracking-tighter animate-pulse">
                                            Stock Shortage
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="px-4 py-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-700">{order.date || new Date(order.createdAt).toLocaleDateString()}</span>
                                    <span className="text-[9px] text-slate-400 font-medium tabular-nums">{order.time || new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </td>
                            <td className="px-4 py-4">
                                <PaymentBadge method={order.paymentMethod || 'COD'} />
                            </td>
                            <td className="px-4 py-4">
                                <StatusBadge status={order.orderStatus} />
                            </td>
                            <td className="px-4 py-4 text-right">
                                <span className="tabular-nums text-[11px] font-bold text-slate-900">₹{order.totalAmount?.toLocaleString()}</span>
                            </td>
                            <td className="px-4 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    {order.items?.some(i => i.isShortage) && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onProcure?.(order);
                                            }}
                                            disabled={!order.franchiseId}
                                            title={!order.franchiseId ? 'Assign franchise before procurement' : 'Create procurement request'}
                                            className={cn(
                                                "px-5 py-2.5 text-white text-[11px] font-black uppercase tracking-[0.15em] rounded-sm transition-all flex items-center gap-2.5 border-2 group/button",
                                                order.franchiseId
                                                    ? "bg-amber-600 hover:bg-slate-900 shadow-[0_4px_15px_rgba(217,119,6,0.3)] hover:shadow-[0_4px_20px_rgba(217,119,6,0.5)] active:scale-95 border-amber-500/50"
                                                    : "bg-slate-300 border-slate-300 cursor-not-allowed opacity-70"
                                            )}
                                        >
                                            <Package size={14} strokeWidth={3} className="group-hover/button:scale-110 transition-transform" />
                                            Procure
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onOrderClick?.(order._id);
                                        }}
                                        className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-sm transition-all"
                                    >
                                        <ExternalLink size={14} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
