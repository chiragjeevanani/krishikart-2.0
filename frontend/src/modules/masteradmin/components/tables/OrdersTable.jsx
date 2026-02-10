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
                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client & Hub</th>
                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Supply Chain</th>
                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Invoice</th>
                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                    {orders.map((order) => (
                        <tr
                            key={order.id}
                            className="group hover:bg-slate-50/80 transition-colors"
                        >
                            <td className="px-4 py-4">
                                <span className="font-bold text-slate-900 text-[11px] tracking-widest tabular-nums">#{order.id}</span>
                            </td>
                            <td className="px-4 py-4">
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-800 text-[11px] leading-none mb-1">{order.customer}</span>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">{order.franchise}</span>
                                </div>
                            </td>
                            <td className="px-4 py-4">
                                <PaymentBadge method={order.paymentMethod || 'COD'} />
                            </td>
                            <td className="px-4 py-4">
                                <StatusBadge status={order.status} />
                            </td>
                            <td className="px-4 py-4">
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border",
                                            order.fulfillmentType === 'franchise_stock' ? 'bg-slate-900 text-white border-slate-900' :
                                                order.fulfillmentType === 'requires_procurement' ? 'bg-white text-slate-900 border-slate-900' :
                                                    'bg-slate-100 text-slate-500 border-slate-200'
                                        )}>
                                            {order.fulfillmentType ? order.fulfillmentType.replace('_', ' ') : 'Network Routing'}
                                        </span>
                                        {order.stockStatus && (
                                            <span className="text-[9px] text-amber-600 font-bold uppercase tracking-tight flex items-center gap-1">
                                                <AlertCircle size={10} />
                                                {order.stockStatus}
                                            </span>
                                        )}
                                    </div>

                                    {order.assignedVendor && (
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5">
                                                <Package size={10} className="text-slate-400" />
                                                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">
                                                    Via: {order.assignedVendor}
                                                </span>
                                            </div>
                                            {['accepted', 'preparing', 'ready'].includes(order.status) && (
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-sm w-fit border border-emerald-100">
                                                    <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                                                    <span className="text-[8px] font-black text-emerald-700 uppercase">
                                                        {order.status === 'accepted' ? 'PO Accepted' :
                                                            order.status === 'preparing' ? 'Packing' :
                                                                order.status === 'ready' ? 'Ready' : order.status}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="px-4 py-4 text-right">
                                <div className="flex flex-col items-end gap-1 font-bold text-slate-900">
                                    <span className="tabular-nums text-[11px]">₹{order.total.toLocaleString()}</span>
                                    {order.procurementTotal && (
                                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                                            COGS: ₹{order.procurementTotal}
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="px-4 py-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                    {(order.fulfillmentType === 'requires_procurement' && order.status === 'new') && (
                                        <button
                                            onClick={() => onAction?.(order.id, 'initiate_procurement')}
                                            className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black rounded-sm hover:bg-slate-800 transition-all flex items-center gap-1.5 uppercase tracking-widest"
                                        >
                                            <ShoppingBag size={10} />
                                            Procure
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
