import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Package, CheckCircle2, Clock, Truck, ChevronRight, Zap } from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useOrders } from '@/modules/user/contexts/OrderContext'

export default function OrdersScreen() {
    const navigate = useNavigate()
    const { orders } = useOrders()

    const getStatusColor = (status) => {
        const s = (status || '').toLowerCase();
        switch (s) {
            case 'delivered': return 'bg-green-50 text-green-600 border-green-100'
            case 'in transit':
            case 'out_for_delivery': return 'bg-blue-50 text-blue-600 border-blue-100'
            case 'new':
            case 'processing': return 'bg-amber-50 text-amber-600 border-amber-100'
            case 'preparing': return 'bg-orange-50 text-orange-600 border-orange-100'
            case 'ready': return 'bg-indigo-50 text-indigo-600 border-indigo-100'
            case 'shipped': return 'bg-purple-50 text-purple-600 border-purple-100'
            default: return 'bg-slate-50 text-slate-600 border-slate-100'
        }
    }

    const getStatusIcon = (status) => {
        const s = (status || '').toLowerCase();
        switch (s) {
            case 'delivered': return <CheckCircle2 size={12} />
            case 'in transit':
            case 'out_for_delivery': return <Truck size={12} />
            case 'new':
            case 'processing': return <Clock size={12} />
            case 'preparing': return <Zap size={12} className="fill-current" />
            case 'ready': return <Package size={12} />
            case 'shipped': return <Package size={12} />
            default: return null
        }
    }

    const handleOrderClick = (order) => {
        if (order.status === 'Delivered') {
            navigate(`/order-summary/${order.id}`)
        } else {
            navigate(`/track-order/${order.id}`)
        }
    }

    return (
        <PageTransition>
            <div className="bg-white min-h-screen pb-24">
                {/* Header */}
                <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md px-4 py-4 border-b border-slate-50 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 active:scale-90 transition-transform"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">My Orders</h1>
                </div>

                <div className="p-6 space-y-4">
                    {orders.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
                                <Package size={40} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900">No Orders Yet</h3>
                            <button onClick={() => navigate('/home')} className="mt-4 text-primary font-black uppercase text-xs tracking-widest">Start Shopping</button>
                        </div>
                    ) : (
                        orders.map((order, idx) => (
                            <motion.div
                                key={order.id}
                                onClick={() => handleOrderClick(order)}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-5 rounded-[28px] bg-white border border-slate-100 shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{order.id}</p>
                                        <h3 className="text-sm font-bold text-slate-900 mt-0.5">{order.items.length} Items Ordered</h3>
                                    </div>
                                    <Badge className={cn("rounded-lg border font-bold text-[10px] py-1 px-2.5 flex items-center gap-1", getStatusColor(order.status))}>
                                        {getStatusIcon(order.status)}
                                        <span className="uppercase tracking-wider">{order.status}</span>
                                    </Badge>
                                </div>

                                <div className="flex justify-between items-end">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        {order.date}
                                    </div>
                                    <div className="text-lg font-black text-slate-900">₹{order.total}</div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </PageTransition>
    )
}
