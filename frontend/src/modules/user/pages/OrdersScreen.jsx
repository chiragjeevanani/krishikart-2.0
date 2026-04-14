import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Package, CheckCircle2, Clock, Truck, ChevronRight, Zap, Receipt } from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useOrders } from '@/modules/user/contexts/OrderContext'

export default function OrdersScreen() {
    const navigate = useNavigate()
    const { orders, fetchMyOrders } = useOrders()

    useEffect(() => {
        fetchMyOrders()
    }, [fetchMyOrders])

    const getDisplayStatus = (order) => {
        const latestReturn = [...(order.returnRequests || [])]
            .sort((a, b) => new Date(b.requestedAt || 0) - new Date(a.requestedAt || 0))[0];

        if (!latestReturn?.status) return order.orderStatus;

        const map = {
            pending: 'return_requested',
            approved: 'return_approved',
            rejected: 'return_rejected',
            pickup_assigned: 'return_pickup_assigned',
            picked_up: 'return_picked_up',
            completed: 'return_completed',
        };

        return map[latestReturn.status] || order.orderStatus;
    };

    const getStatusColor = (status) => {
        const s = (status || '').toLowerCase();
        if (s.startsWith('return_')) {
            if (['return_approved', 'return_picked_up', 'return_completed'].includes(s)) return 'bg-green-50 text-green-600 border-green-100';
            if (['return_requested', 'return_pickup_assigned'].includes(s)) return 'bg-amber-50 text-amber-600 border-amber-100';
            if (s === 'return_rejected') return 'bg-rose-50 text-rose-600 border-rose-100';
        }
        switch (s) {
            case 'received':
            case 'delivered': return 'bg-green-50 text-green-600 border-green-100'
            case 'dispatched':
            case 'out for delivery':
            case 'out_for_delivery': return 'bg-blue-50 text-blue-600 border-blue-100'
            case 'placed':
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100'
            case 'procuring':
            case 'accepted': return 'bg-indigo-50 text-indigo-600 border-indigo-100'
            case 'packed':
            case 'ready': return 'bg-purple-50 text-purple-600 border-purple-100'
            case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100'
            default: return 'bg-slate-50 text-slate-600 border-slate-100'
        }
    }

    const handleOrderClick = (order) => {
        navigate(`/order-detail/${order._id}`)
    }

    return (
        <PageTransition>
            <div className="bg-white min-h-screen pb-24">
                {/* Header */}
                <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md px-4 py-3 border-b border-slate-50 flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 active:scale-90 transition-transform"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <h1 className="text-lg font-black text-slate-900 tracking-tight">My Orders</h1>
                </div>

                <div className="p-4 space-y-4">
                    {orders.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-4">
                                <Package size={32} />
                            </div>
                            <h3 className="text-base font-black text-slate-900">No Orders Yet</h3>
                            <button onClick={() => navigate('/home')} className="mt-3 text-primary font-black uppercase text-[10px] tracking-widest">Start Shopping</button>
                        </div>
                    ) : (
                        orders.map((order, idx) => {
                            const displayStatus = getDisplayStatus(order);
                            return (
                                <motion.div
                                    key={order._id}
                                    onClick={() => handleOrderClick(order)}
                                    className="p-4 rounded-[28px] bg-white border border-slate-100 shadow-sm active:scale-[0.98] transition-all cursor-pointer hover:shadow-md mb-2"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className="h-12 w-12 rounded-2xl bg-slate-50 overflow-hidden border border-slate-50 shrink-0">
                                                <img
                                                    src={order.items?.[0]?.image || 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=100&q=80'}
                                                    alt="order"
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <div className="flex flex-col min-w-0 overflow-hidden">
                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-0.5 leading-none">#{order._id.slice(-8).toUpperCase()}</span>
                                                <h3 className="text-[15px] font-black text-slate-900 tracking-tight leading-tight uppercase truncate">
                                                    {order.items?.length || 0} {order.items?.length === 1 ? 'Product' : 'Products'}
                                                </h3>
                                                <div className="text-[10px] font-bold text-slate-400 capitalize mt-1.5 flex items-center gap-1.5 leading-none">
                                                    <Clock size={10} className="text-slate-300" />
                                                    Ordered {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={cn("rounded-lg border-[0.5px] font-black text-[8px] py-1 px-2.5 flex items-center gap-1.5 shrink-0 bg-opacity-40 mt-0.5", getStatusColor(displayStatus))}>
                                            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                                            <span className="uppercase tracking-[0.15em]">{displayStatus?.replace(/_/g, ' ')}</span>
                                        </Badge>
                                    </div>

                                    <div className="flex items-center bg-slate-50/70 p-3 rounded-2xl border border-slate-50 gap-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5 opacity-80">Final Payable</p>
                                            <div className="text-base font-black text-slate-900 tracking-tighter italic">₹{(order.totalAmount || 0).toLocaleString()}</div>
                                        </div>
                                        <div className="h-8 w-[1px] bg-slate-200/50" />
                                        <div className="flex items-center gap-1 text-[9px] font-black text-primary uppercase tracking-[0.2em] shrink-0 pl-1">
                                            Details <ChevronRight size={14} strokeWidth={4} />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>
        </PageTransition>
    )
}
