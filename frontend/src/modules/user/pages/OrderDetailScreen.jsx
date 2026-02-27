import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    ArrowLeft, MapPin, Receipt, Star, RotateCcw,
    ChevronRight, CheckCircle2, CreditCard, Wallet,
    Smartphone, Banknote, ShieldCheck, Clock, Truck,
    Package, ArrowRight, Activity
} from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import { Button } from '@/components/ui/button'
import { useOrders } from '@/modules/user/contexts/OrderContext'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { toast } from 'sonner'

export default function OrderDetailScreen() {
    const navigate = useNavigate()
    const { id } = useParams()
    const { orders, requestReturn } = useOrders()
    const [returnQuantities, setReturnQuantities] = useState({})
    const [returnReason, setReturnReason] = useState('')
    const [isSubmittingReturn, setIsSubmittingReturn] = useState(false)
    const order = orders.find(o => o._id === id)

    if (!order) return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <p className="text-slate-400 font-bold mb-4 italic">Order not found.</p>
                <Button onClick={() => navigate('/orders')} className="rounded-full px-8">Back to Orders</Button>
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

    const getStatusColor = (status) => {
        const s = (status || '').toLowerCase();
        if (s.startsWith('return_')) {
            if (['return_approved', 'return_picked_up', 'return_completed'].includes(s)) return 'bg-emerald-500 text-white';
            if (['return_requested', 'return_pickup_assigned'].includes(s)) return 'bg-amber-500 text-white';
            if (s === 'return_rejected') return 'bg-rose-500 text-white';
        }
        if (['delivered', 'received'].includes(s)) return 'bg-emerald-500 text-white';
        if (s === 'cancelled') return 'bg-rose-500 text-white';
        if (s === 'placed') return 'bg-amber-500 text-white';
        if (s === 'packed') return 'bg-blue-500 text-white';
        if (s === 'dispatched') return 'bg-orange-500 text-white';
        return 'bg-slate-500 text-white';
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

    const isOrderActive = !['delivered', 'received', 'cancelled'].includes(order.orderStatus?.toLowerCase());

    const getReturnEligibility = () => {
        const status = (order.orderStatus || '').toLowerCase();
        const eligibleByStatus = ['delivered', 'received'].includes(status);
        if (!eligibleByStatus) return { eligible: false, remainingHours: 0 };

        const historyCandidates = (order.statusHistory || [])
            .filter(entry => ['Delivered', 'Received'].includes(entry.status))
            .map(entry => new Date(entry.updatedAt))
            .filter(date => !Number.isNaN(date.getTime()))
            .sort((a, b) => b.getTime() - a.getTime());

        const referenceDate = order.deliveredAt
            ? new Date(order.deliveredAt)
            : (historyCandidates[0] || new Date(order.updatedAt || order.createdAt));

        const returnWindowMs = 2 * 24 * 60 * 60 * 1000;
        const elapsed = Date.now() - referenceDate.getTime();
        const remainingMs = Math.max(0, returnWindowMs - elapsed);
        const eligible = elapsed <= returnWindowMs;
        const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));

        return { eligible, remainingHours };
    };

    const returnEligibility = getReturnEligibility();
    const hasExistingReturnRequest = (order.returnRequests || []).length > 0;

    const getAlreadyRequestedQty = (productId) => {
        if (!productId) return 0;
        const pid = productId.toString();
        return (order.returnRequests || [])
            .filter(req => req.status !== 'rejected')
            .reduce((sum, req) => {
                const itemQty = (req.items || [])
                    .filter(item => item.productId?.toString() === pid)
                    .reduce((itemSum, item) => itemSum + Number(item.quantity || 0), 0);
                return sum + itemQty;
            }, 0);
    };

    const handleReturnQuantityChange = (productId, maxAllowed, value) => {
        const parsed = Number(value);
        const sanitized = Number.isFinite(parsed) ? Math.max(0, Math.min(maxAllowed, Math.floor(parsed))) : 0;
        setReturnQuantities(prev => ({ ...prev, [productId]: sanitized }));
    };

    const handleSubmitReturnRequest = async () => {
        if (hasExistingReturnRequest) {
            toast.error('Return request already submitted for this order');
            return;
        }

        const items = (order.items || [])
            .map(item => {
                const productId = item.productId?._id || item.productId;
                const quantity = Number(returnQuantities[productId] || 0);
                if (!productId || quantity <= 0) return null;
                return {
                    productId,
                    quantity,
                    name: item.name,
                    unit: item.unit
                };
            })
            .filter(Boolean);

        if (items.length === 0) {
            toast.error('Enter quantity for at least one item');
            return;
        }

        if (!returnReason || returnReason.trim().length < 10) {
            toast.error('Please enter a valid reason (minimum 10 characters)');
            return;
        }

        setIsSubmittingReturn(true);
        try {
            const result = await requestReturn(order._id, {
                items,
                reason: returnReason.trim()
            });

            if (result?.success) {
                toast.success('Return request submitted');
                setReturnQuantities({});
                setReturnReason('');
            }
        } finally {
            setIsSubmittingReturn(false);
        }
    };

    return (
        <PageTransition>
            <div className="bg-[#f8fafc] min-h-screen pb-32 font-sans">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-xl px-6 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 z-50">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/orders')} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 active:scale-90 transition-all">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-lg font-black text-slate-900 tracking-tight">Order Details</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mt-1">ID: #{order._id.slice(-8)}</p>
                        </div>
                    </div>
                    <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm", getStatusColor(displayStatus))}>
                        {displayStatus?.replace(/_/g, ' ')}
                    </div>
                </div>

                <div className="p-4 md:p-8 max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                        {/* Left Column: Tracking & Items (Main Content) */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* Active Tracking CTA */}
                            {isOrderActive && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => navigate(`/track-order/${order._id}`)}
                                    className="bg-slate-900 rounded-[32px] p-6 text-white shadow-2xl shadow-slate-200 group cursor-pointer active:scale-[0.98] transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 relative overflow-hidden shrink-0">
                                                <Truck size={24} className="text-primary relative z-10" />
                                                <motion.div
                                                    animate={{ x: [-40, 40] }}
                                                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent w-full"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="text-sm md:text-base font-black uppercase tracking-tight">Live Tracking Available</h3>
                                                <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Your harvest is on the way</p>
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center group-hover:translate-x-1 transition-transform shrink-0">
                                            <ArrowRight size={20} strokeWidth={3} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Order Status Card */}
                            <div className="bg-white rounded-[32px] p-8 md:p-12 text-center border border-white shadow-xl shadow-slate-200/50 relative overflow-hidden">
                                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:text-left gap-8">
                                    <div className={cn(
                                        "w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto md:mx-0 border-4 border-white shadow-lg rotate-3 shrink-0",
                                        (displayStatus || '').startsWith('return_') || ['delivered', 'received'].includes(order.orderStatus?.toLowerCase()) ? "bg-emerald-50 text-emerald-500" : "bg-primary/10 text-primary"
                                    )}>
                                        {(displayStatus || '').startsWith('return_') || ['delivered', 'received'].includes(order.orderStatus?.toLowerCase()) ? <CheckCircle2 size={48} strokeWidth={2.5} /> : <Activity size={48} strokeWidth={2.5} />}
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight uppercase tracking-tight italic">
                                            Order {displayStatus?.replace(/_/g, ' ')}
                                        </h2>
                                        <p className="text-xs md:text-sm text-slate-400 font-bold uppercase tracking-[0.15em] mt-2">
                                            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                                        <Button
                                            variant="outline"
                                            onClick={() => navigate('/home')}
                                            className="w-full sm:w-auto h-12 px-8 rounded-2xl border-slate-100 font-black text-[11px] uppercase tracking-widest gap-2 bg-slate-50/50"
                                        >
                                            <RotateCcw size={14} /> Reorder
                                        </Button>
                                        {['delivered', 'received'].includes(order.orderStatus?.toLowerCase()) && (
                                            <Button className="w-full sm:w-auto h-12 px-8 rounded-2xl bg-slate-900 font-black text-[11px] uppercase tracking-widest gap-2 shadow-lg shadow-slate-200 text-white">
                                                <Star size={14} className="text-yellow-400 fill-yellow-400" /> Review
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
                            </div>

                            {/* Items List */}
                            <div className="bg-white rounded-[32px] overflow-hidden border border-slate-50 shadow-sm transition-all hover:shadow-md">
                                <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Items Detail</h3>
                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-100">{order.items?.length} SKUs</span>
                                </div>
                                <div className="divide-y divide-slate-50 max-h-[600px] lg:max-h-none overflow-y-auto">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-6 p-6 hover:bg-slate-50/50 transition-colors">
                                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-slate-100 overflow-hidden border border-slate-100 shrink-0">
                                                <img
                                                    src={item.image || 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=200&q=80'}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover transition-transform hover:scale-110 duration-500"
                                                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=200&q=80' }}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm md:text-base font-black text-slate-900 truncate uppercase tracking-tight">{item.name}</p>
                                                <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase mt-1">
                                                    {item.quantity} {item.unit} <span className="mx-2 opacity-30 text-slate-300">|</span> ₹{item.price}/{item.unit}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-base md:text-lg font-black text-slate-900 tracking-tight">₹{(item.price * item.quantity).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {(returnEligibility.eligible || hasExistingReturnRequest) && (
                                <div className="bg-white rounded-[32px] overflow-hidden border border-slate-50 shadow-sm">
                                    <div className="px-6 py-5 border-b border-slate-50 bg-slate-50/30">
                                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Return Parcel (Partial Allowed)</h3>
                                        {!hasExistingReturnRequest && (
                                            <>
                                                <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-wide">
                                                    Select only the quantity you want to return.
                                                </p>
                                                <p className="text-[10px] font-bold text-amber-600 mt-2 uppercase tracking-wide">
                                                    Return window closes in {returnEligibility.remainingHours}h
                                                </p>
                                            </>
                                        )}
                                        {hasExistingReturnRequest && (
                                            <p className="text-[10px] font-bold text-blue-600 mt-2 uppercase tracking-wide">
                                                Return request already submitted for this order.
                                            </p>
                                        )}
                                    </div>

                                    <div className="p-6 space-y-4">
                                        {!hasExistingReturnRequest && (order.items || []).map((item, idx) => {
                                            const productId = item.productId?._id || item.productId;
                                            const alreadyRequested = getAlreadyRequestedQty(productId);
                                            const maxAllowed = Math.max(0, Number(item.quantity || 0) - alreadyRequested);
                                            const value = Number(returnQuantities[productId] || 0);

                                            return (
                                                <div key={`${productId}-${idx}`} className="flex items-center justify-between gap-4">
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900">{item.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                            Ordered: {item.quantity} {item.unit} | Returnable: {maxAllowed} {item.unit}
                                                        </p>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={maxAllowed}
                                                        value={value}
                                                        disabled={maxAllowed <= 0}
                                                        onChange={(e) => handleReturnQuantityChange(productId, maxAllowed, e.target.value)}
                                                        className="w-24 h-10 border border-slate-200 rounded-xl px-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-100 disabled:text-slate-400"
                                                    />
                                                </div>
                                            );
                                        })}

                                        {!hasExistingReturnRequest && (
                                            <div className="pt-2">
                                                <textarea
                                                    value={returnReason}
                                                    onChange={(e) => setReturnReason(e.target.value)}
                                                    placeholder="Reason for return (minimum 10 characters)"
                                                    className="w-full min-h-20 border border-slate-200 rounded-2xl p-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                />
                                            </div>
                                        )}

                                        {!hasExistingReturnRequest && (
                                            <Button
                                                onClick={handleSubmitReturnRequest}
                                                disabled={isSubmittingReturn}
                                                className="w-full h-12 rounded-2xl bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest"
                                            >
                                                {isSubmittingReturn ? 'Submitting...' : 'Submit Return Request'}
                                            </Button>
                                        )}

                                        {(order.returnRequests || []).length > 0 && (
                                            <div className="pt-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Previous Return Requests</p>
                                                <div className="space-y-2">
                                                    {(order.returnRequests || []).map((req, reqIdx) => (
                                                        <div key={reqIdx} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-600">
                                                            {new Date(req.requestedAt).toLocaleDateString()} - {req.status?.toUpperCase()}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Address, Payment & Pricing (Sidebar) */}
                        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                            {/* Delivery & Payment Info */}
                            <div className="bg-white rounded-[32px] p-6 border border-slate-50 shadow-sm space-y-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                                            <MapPin size={18} />
                                        </div>
                                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Delivery Address</h3>
                                    </div>
                                    <p className="text-sm font-bold text-slate-800 leading-relaxed pl-11">
                                        {order.shippingAddress}
                                    </p>
                                </div>

                                <div className="h-px bg-slate-50" />

                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                                            <ShieldCheck size={18} />
                                        </div>
                                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Payment Info</h3>
                                    </div>
                                    <div className="flex items-center gap-3 pl-11">
                                        <div className="text-slate-800 shrink-0">
                                            {getPaymentIcon(order.paymentMethod)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-800 leading-none">{order.paymentMethod}</p>
                                            <p className="text-[10px] font-bold text-emerald-500 uppercase mt-1">Status: {order.paymentStatus}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing Breakdown */}
                            <div className="bg-white rounded-[32px] p-8 border border-slate-50 shadow-sm space-y-6">
                                <div className="space-y-4 pb-6 border-b border-slate-50 border-dashed">
                                    <div className="flex justify-between text-xs font-bold text-slate-400">
                                        <span className="uppercase tracking-widest text-[10px]">Item Total</span>
                                        <span className="text-slate-800 font-black tabular-nums">₹{(order.subtotal || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold text-slate-400">
                                        <span className="uppercase tracking-widest text-[10px]">Delivery Charge</span>
                                        <span className={cn("font-black tracking-widest tabular-nums", order.deliveryFee === 0 ? "text-emerald-500 uppercase" : "text-slate-800")}>
                                            {order.deliveryFee === 0 ? "Free" : `₹${order.deliveryFee}`}
                                        </span>
                                    </div>
                                    {order.platformFee > 0 && (
                                        <div className="flex justify-between text-xs font-bold text-slate-400">
                                            <span className="uppercase tracking-widest text-[10px]">Platform Fee</span>
                                            <span className="text-slate-800 font-black tabular-nums">₹{order.platformFee}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-xs font-bold text-slate-400">
                                        <span className="uppercase tracking-widest text-[10px]">GST & Taxes</span>
                                        <span className="text-slate-800 font-black tabular-nums">₹{(order.tax || 0).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1 text-left">Grand Total</h4>
                                            <span className="text-3xl font-black text-emerald-600 tracking-tighter tabular-nums">₹{(order.totalAmount || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 flex flex-col items-center">
                                            <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-0.5 whitespace-nowrap">Your Savings</p>
                                            <p className="text-[11px] font-black text-emerald-600 uppercase whitespace-nowrap">₹120 SAVED</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-2 text-slate-300 py-4">
                                <ShieldCheck size={14} />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Verified Secure Transaction</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    )
}
