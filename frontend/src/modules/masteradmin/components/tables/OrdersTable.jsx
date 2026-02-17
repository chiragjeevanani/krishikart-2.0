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

export default function OrdersTable({ orders, onAction }) {
    return (
        <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 border-y border-slate-200">
                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
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
                            className="group hover:bg-slate-50/80 transition-colors"
                        >
                            <td className="px-4 py-4">
                                <span className="font-bold text-slate-900 text-[11px] tracking-widest tabular-nums">#{order._id?.slice(-8)}</span>
                            </td>
                            <td className="px-4 py-4">
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-800 text-[11px] leading-none mb-1">{order.userId?.fullName || 'Guest'}</span>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">{order.userId?.mobile || 'No Mobile'}</span>
                                </div>
                            </td>
                            <td className="px-4 py-4">
                                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-sm">
                                    {order.items?.length || 0} {order.items?.length === 1 ? 'Item' : 'Items'}
                                </span>
                            </td>
                            <td className="px-4 py-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-700">{new Date(order.createdAt).toLocaleDateString()}</span>
                                    <span className="text-[9px] text-slate-400 font-medium tabular-nums">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
                                <div className="flex items-center justify-end gap-1">
                                    {(order.orderStatus === 'Placed' || order.orderStatus === 'Pending') && (
                                        <button
                                            onClick={() => onAction?.(order._id, 'Confirmed')}
                                            className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black rounded-sm hover:bg-slate-800 transition-all flex items-center gap-1.5 uppercase tracking-widest"
                                        >
                                            <ShoppingBag size={10} />
                                            Confirm
                                        </button>
                                    )}
                                    <button className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-sm transition-all">
                                        <ExternalLink size={14} />
                                    </button>
                                    <button className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-sm transition-all">
                                        <MoreVertical size={14} />
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
