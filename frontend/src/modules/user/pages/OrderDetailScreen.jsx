import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    ArrowLeft, MapPin, Receipt, Star, RotateCcw,
    ChevronRight, CheckCircle2, CreditCard, Wallet,
    Smartphone, Banknote, ShieldCheck, Clock, Truck,
    Package, ArrowRight, Activity, HelpCircle
} from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import { Button } from '@/components/ui/button'
import { useOrders } from '@/modules/user/contexts/OrderContext'
import { useCart } from '@/modules/user/contexts/CartContext'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { toast } from 'sonner'

export default function OrderDetailScreen() {
    const navigate = useNavigate()
    const { id } = useParams()
    const { orders, requestReturn } = useOrders()
    const { addToCart } = useCart()
    const [returnQuantities, setReturnQuantities] = useState({})
    const [returnReason, setReturnReason] = useState('')
    const [isSubmittingReturn, setIsSubmittingReturn] = useState(false)
    const order = orders.find(o => o._id === id)

    if (!order) return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <p className="text-slate-400 font-bold mb-4 italic text-sm">Order history not found.</p>
                <Button onClick={() => navigate('/orders')} className="rounded-2xl px-8 h-12 bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-200">
                    Back to Orders
                </Button>
            </div>
        </div>
    );

    const getPaymentIcon = (method) => {
        const m = (method || '').toLowerCase();
        if (m.includes('wallet')) return <Wallet size={18} />;
        if (m.includes('upi')) return <Smartphone size={18} />;
        if (m.includes('card')) return <CreditCard size={18} />;
        return <Banknote size={18} />;
    }

    const getStatusStyles = (status) => {
        const s = (status || '').toLowerCase();
        if (s.startsWith('return_')) {
            if (['return_approved', 'return_picked_up', 'return_completed'].includes(s)) 
                return { bg: 'bg-emerald-50/50', text: 'text-emerald-600', border: 'border-emerald-100', dot: 'bg-emerald-500' };
            if (['return_requested', 'return_pickup_assigned'].includes(s)) 
                return { bg: 'bg-amber-50/50', text: 'text-amber-600', border: 'border-amber-100', dot: 'bg-amber-500' };
            if (s === 'return_rejected') 
                return { bg: 'bg-rose-50/50', text: 'text-rose-600', border: 'border-rose-100', dot: 'bg-rose-500' };
        }
        switch (s) {
            case 'received':
            case 'delivered': 
                return { bg: 'bg-emerald-50/50', text: 'text-emerald-600', border: 'border-emerald-100', dot: 'bg-emerald-500' };
            case 'dispatched':
            case 'out for delivery':
            case 'out_for_delivery': 
                return { bg: 'bg-sky-50/50', text: 'text-sky-600', border: 'border-sky-100', dot: 'bg-sky-500' };
            case 'placed':
            case 'pending': 
                return { bg: 'bg-amber-50/50', text: 'text-amber-600', border: 'border-amber-100', dot: 'bg-amber-500' };
            case 'procuring':
            case 'accepted': 
                return { bg: 'bg-indigo-50/50', text: 'text-indigo-600', border: 'border-indigo-100', dot: 'bg-indigo-500' };
            case 'packed':
            case 'ready': 
                return { bg: 'bg-purple-50/50', text: 'text-purple-600', border: 'border-purple-100', dot: 'bg-purple-500' };
            case 'cancelled': 
                return { bg: 'bg-rose-50/50', text: 'text-rose-600', border: 'border-rose-100', dot: 'bg-rose-500' };
            default: 
                return { bg: 'bg-slate-50/50', text: 'text-slate-500', border: 'border-slate-100', dot: 'bg-slate-400' };
        }
    }

    const getDisplayStatus = () => {
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

    const displayStatus = getDisplayStatus();
    const status = getStatusStyles(displayStatus);

    const isOrderActive = !['delivered', 'received', 'cancelled'].includes(order.orderStatus?.toLowerCase());

    const handleReorder = async () => {
        toast.promise(
            Promise.all(order.items.map(item =>
                addToCart({ _id: item.productId, ...item }, item.quantity)
            )),
            {
                loading: 'Adding items to cart...',
                success: () => {
                    navigate('/cart');
                    return 'Reordered successfully!';
                },
                error: 'Failed to reorder items'
            }
        );
    };

    return (
        <PageTransition>
            <div className="bg-[#f8fafc] min-h-screen pb-32">
                {/* Header */}
                <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-5 pt-7 pb-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/orders')}
                            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-800 active:scale-95 transition-all border border-slate-100 shadow-sm"
                        >
                            <ArrowLeft size={20} strokeWidth={2.5} />
                        </button>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">Order Details</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">ID: {order._id.slice(-8)}</p>
                        </div>
                    </div>
                </div>

                <div className="px-5 pt-8 space-y-6">
                    {/* Status Overview Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm relative overflow-hidden text-center"
                    >
                        <div className="relative z-10">
                            <div className={cn("w-20 h-20 rounded-[24px] flex items-center justify-center mx-auto border-4 border-white shadow-lg rotate-3 mb-6", status.bg, status.text)}>
                                {displayStatus?.toLowerCase().includes('delivered') ? <CheckCircle2 size={40} strokeWidth={2.5} /> : <Activity size={40} strokeWidth={2.5} />}
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 leading-tight uppercase tracking-tight italic">
                                Order {displayStatus?.replace(/_/g, ' ')}
                            </h2>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-3">
                                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                            
                            <div className="mt-8 flex flex-col gap-3">
                                <Button
                                    onClick={handleReorder}
                                    className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.15em] shadow-xl shadow-slate-200"
                                >
                                    <RotateCcw size={16} className="mr-2" /> Reorder This Basket
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/help-support')}
                                    className="w-full h-14 rounded-2xl border-slate-100 text-slate-600 font-bold text-[11px] uppercase tracking-widest bg-slate-50/50"
                                >
                                    <HelpCircle size={16} className="mr-2" /> Need Help?
                                </Button>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-48 h-48 bg-slate-50 rounded-full blur-3xl -mr-24 -mt-24 opacity-50" />
                    </motion.div>

                    {/* Active Tracking CTA */}
                    {isOrderActive && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => navigate(`/track-order/${order._id}`)}
                            className="bg-emerald-600 rounded-[28px] p-6 text-white shadow-xl shadow-emerald-100 active:scale-[0.98] transition-all flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center border border-white/20">
                                    <Truck size={24} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="font-black uppercase tracking-tight">Track Live Harvest</h3>
                                    <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest mt-1">Real-time farm to door updates</p>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white text-emerald-600 flex items-center justify-center">
                                <ArrowRight size={20} strokeWidth={3} />
                            </div>
                        </motion.div>
                    )}

                    {/* Address & Payment Grid */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-sm space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center border border-orange-100 shadow-sm shrink-0">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Delivery Destination</h3>
                                    <p className="text-sm font-bold text-slate-800 leading-relaxed">{order.shippingAddress}</p>
                                </div>
                            </div>
                            
                            <div className="h-px bg-slate-50" />

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center border border-blue-100 shadow-sm shrink-0">
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Payment Method</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="text-slate-800">{getPaymentIcon(order.paymentMethod)}</div>
                                        <span className="text-sm font-black text-slate-800">{order.paymentMethod}</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-emerald-500 uppercase mt-1">Transaction {order.paymentStatus}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Basket Items ({order.items?.length})</h3>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {order.items?.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-5 p-5">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 shadow-sm shrink-0">
                                        <img
                                            src={item.image || 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=200&q=80'}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80' }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">{item.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                                            {item.quantity} {item.unit} <span className="mx-2 opacity-50">×</span> ₹{item.price}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-slate-900 italic tracking-tight">₹{(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bill Summary */}
                    <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-5">
                        <div className="space-y-4 pb-6 border-b border-slate-100 border-dashed">
                            <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                <span>Cart Subtotal</span>
                                <span className="text-slate-900 font-black tracking-tight tracking-normal italic">₹{(order.subtotal || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                <span>Handling & Tax</span>
                                <span className="text-slate-900 font-black tracking-tight tracking-normal italic">₹{(order.tax || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                <span>Delivery Fee</span>
                                <span className={cn("font-black italic tracking-normal", order.deliveryFee === 0 ? "text-emerald-500" : "text-slate-900")}>
                                    {order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}
                                </span>
                            </div>
                            {order.discountAmount > 0 && (
                                <div className="flex justify-between text-[11px] font-black text-emerald-600 uppercase tracking-widest">
                                    <span>Voucher Discount</span>
                                    <span className="italic tracking-normal">- ₹{order.discountAmount}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-end justify-between">
                            <div className="flex flex-col">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">To be Paid</p>
                                <p className="text-4xl font-black text-slate-900 tracking-tighter italic">₹{(order.totalAmount || 0).toLocaleString()}</p>
                            </div>
                            {order.discountAmount > 0 && (
                                <div className="bg-emerald-600 px-4 py-2 rounded-2xl shadow-lg shadow-emerald-100 border border-emerald-500">
                                    <p className="text-[9px] font-black text-emerald-100 uppercase tracking-widest leading-none mb-1">Savings</p>
                                    <p className="text-[13px] font-black text-white uppercase italic">₹{order.discountAmount}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-3 pt-4 text-slate-400 font-bold text-[9px] uppercase tracking-[0.25em]">
                        <div className="flex items-center gap-2">
                            <Receipt size={12} strokeWidth={2.5} />
                            <span>GST Invoice Generated</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={12} strokeWidth={2.5} />
                            <span>Quality Inspected Harvest</span>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    )
}
