import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Phone, MessageSquare, Package, Truck, CheckCircle2, MessageSquare as MessageSquareIcon, ShoppingBag, Zap } from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import { Button } from '@/components/ui/button'
import { useOrders } from '@/modules/user/contexts/OrderContext'

const steps = [
    { label: 'Placed', status: 'Placed', icon: ShoppingBag },
    { label: 'Packed', status: 'Packed', icon: Zap },
    { label: 'Dispatched', status: 'Dispatched', icon: Truck },
    { label: 'Delivered', status: 'Delivered', icon: Package },
    { label: 'Received', status: 'Received', icon: CheckCircle2 }
]

export default function OrderTrackingScreen() {
    const navigate = useNavigate()
    const { id } = useParams()
    const { orders, updateOrderStatus } = useOrders()
    const [isUpdating, setIsUpdating] = useState(false)

    const order = orders.find(o => o._id === id)

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

    return (
        <PageTransition>
            <div className="bg-slate-50 min-h-screen pb-32">
                {/* Header */}
                <div className="bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight">Track Order</h1>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">{id}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Status Hero */}
                    <div className="bg-slate-900 rounded-[40px] p-10 text-center relative overflow-hidden shadow-2xl shadow-slate-200">
                        <div className="relative z-10">
                            <motion.div
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ repeat: Infinity, duration: 4 }}
                                className="w-20 h-20 bg-primary/20 rounded-[30px] flex items-center justify-center text-primary mx-auto mb-6 border border-primary/20"
                            >
                                <Truck size={40} strokeWidth={2.5} />
                            </motion.div>
                            <h2 className="text-2xl font-black text-white leading-tight uppercase tracking-tight italic">
                                {order?.orderStatus?.replace(/_/g, ' ') || 'Processing'}
                            </h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-3">
                                Manifest synchronization active
                            </p>
                        </div>
                        {/* Abstract Background Design */}
                        <div className="absolute top-0 left-0 w-full h-full opacity-20">
                            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-primary rounded-full blur-[100px]" />
                            <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-slate-700 rounded-full blur-[100px]" />
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
                        <div className="space-y-8 relative">
                            <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-slate-100" />
                            {steps.map((step, i) => {
                                const orderStatusHistory = order?.statusHistory || [];
                                const historyEntry = orderStatusHistory.find(h => h.status === step.status);
                                const isCompleted = !!historyEntry;
                                const isCurrent = order?.orderStatus === step.status;
                                const time = historyEntry ? new Date(historyEntry.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';

                                return (
                                    <div key={i} className="flex items-start gap-6 relative z-10">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border-4 border-white shadow-sm ${isCompleted ? 'bg-primary text-white' :
                                            isCurrent ? 'bg-orange-500 text-white' :
                                                'bg-slate-50 text-slate-300'
                                            }`}>
                                            <step.icon size={18} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <h3 className={`text-sm font-black ${!isCompleted && !isCurrent ? 'text-slate-300' : 'text-slate-900'}`}>{step.label}</h3>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{time}</span>
                                            </div>
                                            <p className="text-xs text-slate-400 font-medium mt-1">
                                                {step.status === 'Placed' ? 'Your order has been placed successfully.' :
                                                    step.status === 'Packed' ? 'The items are being packed for you.' :
                                                        step.status === 'Dispatched' ? 'Package is on its way to you.' :
                                                            step.status === 'Delivered' ? 'Package reached its destination.' :
                                                                'Thank you for confirming receipt!'}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>


                    {/* Final Verification Flow */}
                    {order?.orderStatus === 'Delivered' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="p-8 rounded-[40px] bg-emerald-50 border border-emerald-100">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-200">
                                        <Package size={28} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-emerald-900 leading-tight">Order On-Site</h4>
                                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-0.5">Please verify all items</p>
                                    </div>
                                </div>

                                <p className="text-sm font-medium text-emerald-800/80 leading-relaxed mb-8">
                                    Your harvest has arrived. Please check the quantities carefully. Since this is a bulk order, ensure nothing is missing before the final confirmation.
                                </p>

                                <Button
                                    onClick={handleConfirmReceived}
                                    disabled={isUpdating}
                                    className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-100 disabled:opacity-50"
                                >
                                    {isUpdating ? 'Verifying...' : 'Items Verified & Received'}
                                </Button>

                                <button className="w-full mt-4 text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] hover:text-emerald-700 transition-colors">
                                    Report Missing Items
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    )
}
