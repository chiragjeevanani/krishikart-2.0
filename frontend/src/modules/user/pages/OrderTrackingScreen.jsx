import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Package, Truck, CheckCircle2, ShoppingBag, Zap, ClipboardList, ShieldCheck } from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import { Button } from '@/components/ui/button'
import { useOrders } from '@/modules/user/contexts/OrderContext'

const steps = [
    { label: 'Placed', status: 'Placed', icon: ShoppingBag },
    { label: 'Procuring', status: 'Procuring', icon: ClipboardList },
    { label: 'Packed', status: 'Packed', icon: Zap },
    { label: 'Dispatched', status: 'Dispatched', icon: Truck },
    { label: 'Delivered', status: 'Delivered', icon: Package },
    { label: 'Received', status: 'Received', icon: CheckCircle2 }
]

export default function OrderTrackingScreen() {
    const navigate = useNavigate()
    const { id } = useParams()
    const { orders, updateOrderStatus, getOrderById } = useOrders()
    const [isUpdating, setIsUpdating] = useState(false)
    const [orderDetails, setOrderDetails] = useState(null)

    const orderFromContext = useMemo(() => orders.find((item) => item._id === id), [orders, id])
    const order = orderFromContext || orderDetails

    useEffect(() => {
        let isMounted = true

        const loadOrder = async () => {
            if (!id) return
            if (orderFromContext) {
                setOrderDetails(orderFromContext)
                return
            }

            const freshOrder = await getOrderById(id)
            if (isMounted && freshOrder) {
                setOrderDetails(freshOrder)
            }
        }

        loadOrder()
        return () => {
            isMounted = false
        }
    }, [getOrderById, id, orderFromContext])

    const handleMarkDelivered = () => {
        setIsUpdating(true)
        // Simulate network delay
        setTimeout(() => {
            updateOrderStatus(id, 'Delivered')
            setIsUpdating(false)
        }, 1500)
    }

    const handleConfirmReceived = async () => {
        setIsUpdating(true)
        try {
            await updateOrderStatus(id, 'Received')
            navigate(`/order-summary/${id}`)
        } finally {
            setIsUpdating(false)
        }
    }

    if (!order) {
        return (
            <PageTransition>
                <div className="bg-[#f8fafc] min-h-screen flex items-center justify-center p-6">
                    <div className="text-center">
                        <h2 className="text-lg font-black text-slate-900">Loading Order Trace</h2>
                        <p className="text-sm text-slate-400 mt-2">Syncing the latest order status...</p>
                    </div>
                </div>
            </PageTransition>
        )
    }

    return (
        <PageTransition>
            <div className="bg-[#f8fafc] min-h-screen pb-32">
                {/* Header */}
                <div className="bg-white/90 backdrop-blur-xl px-4 py-2 pt-[max(0.75rem,env(safe-area-inset-top))] border-b border-slate-100/80 sticky top-0 z-40 flex items-center justify-between">
                    <div className="flex items-center gap-3 py-1">
                        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 active:scale-95 transition-transform">
                            <ArrowLeft size={18} />
                        </button>
                        <div className="flex flex-col">
                            <h1 className="text-base font-black text-slate-900 tracking-tight leading-none mb-1">Track Order</h1>
                            <p className="text-[8px] font-black text-emerald-600 uppercase tracking-[0.2em] leading-none">Manifest: #{order._id.slice(-8).toUpperCase()}</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    {/* Status Overview Context */}
                    <div className="bg-slate-900 rounded-[24px] p-6 text-center relative overflow-hidden shadow-xl shadow-slate-200">
                        <div className="relative z-10">
                            <motion.div
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ repeat: Infinity, duration: 4 }}
                                className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4 border border-primary/20 shadow-inner shadow-primary/10"
                            >
                                <Truck size={28} strokeWidth={2.5} />
                            </motion.div>
                            <h2 className="text-xl font-black text-white leading-tight uppercase tracking-tight italic">
                                {order.orderStatus?.replace(/_/g, ' ') || 'Syncing...'}
                            </h2>
                            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.25em] mt-2">
                                Encrypted Trace Active
                            </p>
                        </div>
                        {/* High-end Abstract Background */}
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                            <div className="absolute top-[-40%] right-[-10%] w-48 h-48 bg-primary rounded-full blur-[80px]" />
                            <div className="absolute bottom-[-40%] left-[-10%] w-48 h-48 bg-emerald-700 rounded-full blur-[80px]" />
                        </div>
                    </div>

                    {/* Timeline Log Manifest */}
                    <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm">
                        <div className="space-y-6 relative">
                            <div className="absolute left-[17.5px] top-4 bottom-4 w-[1px] bg-slate-100" />
                            {steps.map((step, i) => {
                                const orderStatusHistory = order.statusHistory || [];
                                const historyEntry = orderStatusHistory.find(h => h.status === step.status);
                                const isCompleted = !!historyEntry;
                                const isCurrent = order.orderStatus === step.status;
                                const time = historyEntry ? new Date(historyEntry.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';

                                return (
                                    <div key={i} className="flex items-start gap-4 p-0.5 relative z-10">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border-4 border-white shadow-sm ring-1 ring-slate-100 shrink-0 ${isCompleted ? 'bg-primary text-white shadow-primary/20' :
                                            isCurrent ? 'bg-orange-500 text-white shadow-orange-200' :
                                                'bg-slate-50 text-slate-300'
                                            }`}>
                                            <step.icon size={16} strokeWidth={2.5} />
                                        </div>
                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <div className="flex justify-between items-center gap-2 mb-1">
                                                <h3 className={`text-[11px] font-black uppercase tracking-tight ${!isCompleted && !isCurrent ? 'text-slate-300' : 'text-slate-900'}`}>{step.label}</h3>
                                                <span className="text-[8px] font-black text-slate-400 tabular-nums">{time}</span>
                                            </div>
                                            <p className={`text-[10px] leading-relaxed ${!isCompleted && !isCurrent ? 'text-slate-200' : 'text-slate-500'} font-medium`}>
                                                {step.status === 'Placed' ? 'Registration successful.' :
                                                    step.status === 'Procuring' ? 'Aggregating from vendor network.' :
                                                        step.status === 'Packed' ? 'Verification & sealing in progress.' :
                                                            step.status === 'Dispatched' ? 'Enroute to distribution hub.' :
                                                                step.status === 'Delivered' ? 'Relay point arrival confirmed.' :
                                                                    'End-to-end cycle complete.'}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* On-Site Verification Portal */}
                    {order.orderStatus === 'Delivered' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 pt-2 pb-6">
                            <div className="p-5 rounded-[28px] bg-emerald-50 border border-emerald-100 shadow-sm relative overflow-hidden">
                                <div className="flex items-center gap-3.5 mb-4 relative z-10">
                                    <div className="w-11 h-11 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-100">
                                        <ShieldCheck size={20} strokeWidth={3} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-[14px] font-black text-emerald-900 tracking-tight leading-none mb-1.5 uppercase">Final Verification</h4>
                                        <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest leading-none">Complete cycle reconciliation</p>
                                    </div>
                                </div>

                                <p className="text-[11px] font-bold text-emerald-800/70 leading-relaxed mb-6 relative z-10">
                                    Your harvest has completed its journey. Please confirm receipt of all items after verifying quantity and quality.
                                </p>

                                <Button
                                    onClick={handleConfirmReceived}
                                    disabled={isUpdating}
                                    className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-100 relative z-10"
                                >
                                    {isUpdating ? 'Synchronizing...' : 'Reconcile & Finish'}
                                </Button>
                                
                                <CheckCircle2 className="absolute -bottom-6 -right-6 w-32 h-32 text-emerald-500/5 rotate-12" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    )
}
