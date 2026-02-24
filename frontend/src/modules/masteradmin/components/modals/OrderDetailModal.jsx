import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    MapPin,
    Phone,
    Clock,
    Package,
    UserCircle,
    CheckCircle2,
    Truck,
    ShieldCheck,
    Store,
    ShoppingBag,
    CreditCard,
    Banknote,
    Wallet,
    Download,
    Share2,
    AlertCircle,
    Building2,
    FileText
} from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import StatusBadge from '../common/StatusBadge';

const OrderDetailModal = ({ isOpen, onClose, orderId, onProcure }) => {
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen && orderId) {
            fetchOrderDetail();
        }
    }, [isOpen, orderId]);

    const fetchOrderDetail = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/orders/admin/${orderId}`);
            if (response.data.success) {
                setOrder(response.data.result);
            }
        } catch (error) {
            console.error('Fetch order detail error:', error);
            toast.error('Failed to load order details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        try {
            const response = await api.put(`/orders/admin/${orderId}/status`, {
                status: newStatus
            });
            if (response.data.success) {
                toast.success(`Order status updated to ${newStatus}`);
                fetchOrderDetail();
            }
        } catch (error) {
            console.error('Update status error:', error);
            toast.error('Failed to update status');
        }
    };

    const statusSteps = [
        { label: 'Placed', icon: ShoppingBag },
        { label: 'Confirmed', icon: CheckCircle2 },
        { label: 'Processing', icon: Clock },
        { label: 'Assigned', icon: Truck },
        { label: 'Out for Delivery', icon: Truck },
        { label: 'Delivered', icon: ShieldCheck }
    ];

    const PaymentBadge = ({ method }) => {
        const config = {
            'Prepaid': { icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
            'COD': { icon: Banknote, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
            'Credit': { icon: Wallet, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' }
        };
        const { icon: Icon, color, bg, border } = config[method] || config['COD'];
        return (
            <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] font-black uppercase tracking-wider border", bg, color, border)}>
                <Icon size={12} strokeWidth={2.5} />
                {method}
            </span>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-slate-50 w-full max-w-5xl max-h-[90vh] rounded-sm shadow-2xl overflow-hidden flex flex-col relative z-10"
                    >
                        {/* Header */}
                        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-r border-slate-200 pr-4">
                                    <ShoppingBag size={12} />
                                    <span>Orders</span>
                                </div>
                                <h1 className="text-sm font-black text-slate-900 tracking-tighter uppercase tabular-nums">
                                    {isLoading ? 'Loading Order...' : `Order #${order?._id?.slice(-8)}`}
                                </h1>
                                {!isLoading && order && <StatusBadge status={order.orderStatus} />}
                            </div>

                            <div className="flex items-center gap-3">
                                {!isLoading && order && (
                                    <>
                                        <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors border border-slate-200 rounded-sm bg-white">
                                            <Share2 size={15} />
                                        </button>
                                        <button className="bg-slate-900 text-white px-4 py-2 rounded-sm text-[11px] font-black flex items-center gap-2 hover:bg-slate-800 transition-all shadow-sm uppercase tracking-[0.1em]">
                                            <Download size={14} />
                                            Invoice
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={onClose}
                                    className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all rounded-sm"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Body - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            {isLoading ? (
                                <div className="space-y-6 animate-pulse">
                                    <div className="h-24 bg-white border border-slate-200 rounded-sm" />
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="md:col-span-2 h-96 bg-white border border-slate-200 rounded-sm" />
                                        <div className="h-96 bg-white border border-slate-200 rounded-sm" />
                                    </div>
                                </div>
                            ) : order ? (
                                <div className="space-y-6">

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Left Column - Order Items */}
                                        <div className="md:col-span-2 space-y-6">
                                            <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
                                                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Package size={16} className="text-slate-900" />
                                                        <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Order Items</h2>
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white border border-slate-200 px-2.5 py-1 rounded-sm">
                                                        {order.items?.length || 0} Products
                                                    </span>
                                                </div>
                                                <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                                                    {order.items?.map((item, idx) => (
                                                        <div key={idx} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-all group">
                                                            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-sm overflow-hidden flex items-center justify-center p-2">
                                                                <img
                                                                    src={item.productId?.primaryImage || item.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.productId?.name || item.name)}&background=f1f5f9&color=94a3b8&size=128`}
                                                                    alt={item.productId?.name || item.name}
                                                                    className="w-full h-full object-contain mix-blend-multiply"
                                                                    onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=Product&background=f1f5f9&color=94a3b8&size=128' }}
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight line-clamp-1">{item.productId?.name || item.name}</h4>
                                                                <div className="flex items-center gap-2 mt-1 font-bold text-[9px] text-slate-400 uppercase tracking-widest">
                                                                    <span>Qty: {item.quantity}</span>
                                                                    <div className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                                                                    <span>₹{item.price?.toLocaleString()} / unit</span>
                                                                </div>
                                                                {item.isShortage && (
                                                                    <div className="mt-1.5 flex items-center gap-1.5 text-rose-600 font-black text-[8px] uppercase tracking-[0.1em] bg-rose-50 px-2 py-0.5 rounded-sm border border-rose-100 w-fit animate-pulse">
                                                                        <AlertCircle size={10} />
                                                                        Shortage: {item.shortageQty} {item.unit}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-[11px] font-black text-slate-900 tabular-nums">
                                                                    ₹{(item.price * item.quantity).toLocaleString()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="bg-slate-900 p-6 flex flex-col gap-3">
                                                    {order.items?.some(i => i.isShortage) && (
                                                        <button
                                                            onClick={() => {
                                                                onClose();
                                                                onProcure?.(order);
                                                            }}
                                                            className="mb-4 w-full bg-amber-500 hover:bg-amber-600 text-slate-900 py-3 rounded-sm text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                                                        >
                                                            <Package size={16} />
                                                            Procure Shortage Items
                                                        </button>
                                                    )}
                                                    <div className="flex items-center justify-between text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                                        <span>Subtotal</span>
                                                        <span className="tabular-nums">₹{order.subtotal?.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                                        <span>Delivery Fee</span>
                                                        <span className="tabular-nums">₹{order.deliveryFee?.toLocaleString() || '0'}</span>
                                                    </div>
                                                    {order.tax > 0 && (
                                                        <div className="flex items-center justify-between text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                                            <span>Tax</span>
                                                            <span className="tabular-nums">₹{order.tax?.toLocaleString()}</span>
                                                        </div>
                                                    )}
                                                    <div className="h-px bg-slate-800 my-1" />
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Total</span>
                                                        <span className="text-xl font-black text-white tracking-tighter tabular-nums">₹{order.totalAmount?.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>


                                        </div>

                                        {/* Right Column - Customer & Info */}
                                        <div className="space-y-6">
                                            {/* Customer Insight */}
                                            <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-sm space-y-4">
                                                <div className="flex items-center gap-2 border-l-4 border-slate-900 pl-3">
                                                    <UserCircle size={16} />
                                                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Customer</h3>
                                                </div>
                                                <div className="space-y-3">
                                                    <div>
                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Name</span>
                                                        <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{order.userId?.fullName || 'Guest Client'}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Contact</span>
                                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900 tabular-nums">
                                                                <Phone size={10} className="text-slate-400" />
                                                                {order.userId?.mobile || 'N/A'}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Payment</span>
                                                            <PaymentBadge method={order.paymentMethod || 'COD'} />
                                                        </div>
                                                    </div>
                                                    <div className="pt-3 border-t border-slate-50">
                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Shipping to</span>
                                                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-sm flex gap-2">
                                                            <MapPin size={14} className="text-slate-400 shrink-0" />
                                                            <p className="text-[9px] font-bold text-slate-600 leading-relaxed uppercase">
                                                                {order.shippingAddress || 'No Address Provided'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Fulfillment Insight */}
                                            <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-sm space-y-4">
                                                <div className="flex items-center gap-2 border-l-4 border-emerald-500 pl-3">
                                                    <Store size={16} className="text-emerald-500" />
                                                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Franchise</h3>
                                                </div>
                                                {order.franchiseId ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-emerald-50 rounded-sm flex items-center justify-center text-emerald-600 border border-emerald-100">
                                                            <Building2 size={16} />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{order.franchiseId?.shopName || order.franchiseId?.storeName || 'Primary Facility'}</h4>
                                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Assigned Unit</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    ['Confirmed', 'Processing', 'Out for Delivery', 'Delivered', 'Completed'].includes(order.orderStatus) ? (
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-emerald-50 rounded-sm flex items-center justify-center text-emerald-600 border border-emerald-100">
                                                                <Building2 size={16} />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight">Appzeto Fulfillment</h4>
                                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Central Facility</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="p-4 border border-dashed border-slate-200 rounded-sm flex flex-col items-center text-center gap-2">
                                                            <AlertCircle size={16} className="text-slate-300" />
                                                            <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Unassigned</p>
                                                        </div>
                                                    )
                                                )}
                                            </div>

                                            {/* Audit Log */}
                                            <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-sm space-y-4">
                                                <div className="flex items-center gap-2 border-l-4 border-amber-500 pl-3">
                                                    <FileText size={16} className="text-amber-500" />
                                                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Audit</h3>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex gap-3">
                                                        <div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Created</p>
                                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-64 flex flex-col items-center justify-center text-center">
                                    <AlertCircle size={40} className="text-slate-200 mb-4" />
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Order Not Found</h3>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">The request returned no record</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default OrderDetailModal;
