import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Package, CheckCircle2, Clock, Truck, ChevronRight, Zap, Receipt } from 'lucide-react'
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
        if (order.orderStatus === 'delivered') {
            navigate(`/order-summary/${order._id}`)
        } else {
            navigate(`/track-order/${order._id}`)
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
                                key={order._id}
                                onClick={() => handleOrderClick(order)}
                                className="p-5 rounded-[32px] bg-white border border-slate-100 shadow-sm active:scale-[0.98] transition-all cursor-pointer hover:shadow-md mb-4"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <div className="flex justify-between items-start mb-5">
                                    <div className="flex gap-4">
                                        <div className="flex -space-x-3 overflow-hidden">
                                            {order.items?.slice(0, 3).map((item, i) => (
                                                <div key={i} className="inline-block h-12 w-12 rounded-xl ring-4 ring-white bg-slate-100 overflow-hidden border border-slate-50 shadow-sm">
                                                    <img
                                                        src={item.image || 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=100&q=80'}
                                                        alt={item.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            ))}
                                            {order.items?.length > 3 && (
                                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-[10px] font-black text-white ring-4 ring-white shadow-sm z-10 relative">
                                                    +{order.items.length - 3}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1.5">#{order._id.slice(-8)}</p>
                                            <h3 className="text-sm font-black text-slate-900 tracking-tight leading-none uppercase">{order.items?.length || 0} Products</h3>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <Badge className={cn("rounded-xl border font-black text-[9px] py-1.5 px-3 flex items-center gap-1.5 shadow-sm", getStatusColor(order.orderStatus))}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                                        <span className="uppercase tracking-widest">{order.orderStatus?.replace(/_/g, ' ')}</span>
                                    </Badge>
                                </div>

                                <div className="flex justify-between items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm text-primary">
                                            <Receipt size={14} />
                                        </div>
                                        <div className="text-lg font-black text-slate-900 tracking-tighter italic">₹{(order.totalAmount || 0).toLocaleString()}</div>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest">
                                        Details <ChevronRight size={14} strokeWidth={3} />
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </PageTransition>
    )
}
