import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    MapPin,
    Phone,
    Clock,
    Package,
    User,
    CheckCircle2,
    ArrowRightCircle,
    Copy,
    Share2,
    Truck,
    FileText,
    Shield,
    Home,
    ChevronRight,
    Search,
    RefreshCw,
    ShieldCheck,
    Settings2,
    Download,
    ArrowRight,
    Briefcase
} from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { useFranchiseOrders } from '../contexts/FranchiseOrdersContext';
import { cn } from '@/lib/utils';
import DocumentViewer from '../../vendor/components/documents/DocumentViewer';

export default function OrderDetailScreen() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { updateOrderStatus, deliveryPartners, refreshPartners } = useFranchiseOrders();
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDocOpen, setIsDocOpen] = useState(false);
    const [docType, setDocType] = useState('GRN');
    const [isAccepting, setIsAccepting] = useState(false);
    const [reviewReasons, setReviewReasons] = useState({});
    const [isReviewing, setIsReviewing] = useState(false);
    const [isAssigningPickup, setIsAssigningPickup] = useState(false);

    const fetchOrderDetail = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/orders/franchise/${id}`);
            if (response.data.success) {
                const o = response.data.result;
                console.log('Order API Data:', o);
                console.log('Fields:', { subtotal: o.subtotal, deliveryFee: o.deliveryFee, tax: o.tax, total: o.totalAmount, paymentStatus: o.paymentStatus });
                setOrder({
                    id: o._id,
                    customer: o.userId?.legalEntityName || o.userId?.fullName || o.user?.legalEntityName || o.user?.fullName || 'Guest Client',
                    mobile: o.userId?.mobile || o.user?.mobile || 'N/A',
                    address: o.shippingAddress || o.userId?.address || 'N/A',
                    total: o.totalAmount,
                    subtotal: o.subtotal,
                    deliveryFee: o.deliveryFee,
                    tax: o.tax,
                    status: (o.orderStatus || '').toLowerCase() || 'pending',
                    items: (o.items || []).map(i => ({
                        name: i.name,
                        quantity: i.quantity,
                        price: i.price,
                    })),
                    createdAt: o.createdAt,
                    time: o.time,
                    paymentMethod: o.paymentMethod,
                    paymentStatus: o.paymentStatus || 'Pending',
                    franchiseId: o.franchiseId || o.franchise,
                    returnRequests: (o.returnRequests || []).map((rr, idx) => ({
                        index: idx,
                        items: rr.items || [],
                        reason: rr.reason || '',
                        status: rr.status || 'pending',
                        franchiseReviewReason: rr.franchiseReviewReason || '',
                        requestedAt: rr.requestedAt,
                        pickupDeliveryPartnerId: rr.pickupDeliveryPartnerId || null
                    })),
                    bilty: o.bilty
                });
            }
        } catch (error) {
            console.error('Fetch order detail error:', error);
            toast.error('Failed to load order details');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetail();
    }, [id]);

    const handleAcceptOrder = async () => {
        setIsAccepting(true);
        try {
            const response = await api.put(`/orders/franchise/${id}/accept`);
            if (response.data.success) {
                toast.success('Order accepted successfully!');
                await fetchOrderDetail(); // Refresh to show updated status
            }
        } catch (error) {
            console.error('Accept order error:', error);
            toast.error(error.response?.data?.message || 'Failed to accept order');
        } finally {
            setIsAccepting(false);
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        await updateOrderStatus(id, newStatus);
        fetchOrderDetail(); // Refresh
    };

    const handleReviewReturn = async (requestIndex, action) => {
        const reason = (reviewReasons[requestIndex] || '').trim();
        if (action === 'reject' && reason.length < 5) {
            toast.error('Please enter a valid review reason (minimum 5 characters)');
            return;
        }
        setIsReviewing(true);
        try {
            const response = await api.put(`/orders/franchise/${id}/returns/${requestIndex}/review`, {
                action,
                reason
            });
            if (response.data.success) {
                toast.success(`Return request ${action}d`);
                await fetchOrderDetail();
            }
        } catch (error) {
            console.error('Review return request error:', error);
            toast.error(error.response?.data?.message || 'Failed to review return request');
        } finally {
            setIsReviewing(false);
        }
    };

    const handleAssignReturnPickup = async (requestIndex, deliveryPartnerId) => {
        if (!deliveryPartnerId) return;
        setIsAssigningPickup(true);
        try {
            const response = await api.put(`/orders/franchise/${id}/returns/${requestIndex}/assign-pickup`, {
                deliveryPartnerId
            });
            if (response.data.success) {
                toast.success('Pickup assigned to delivery partner');
                await fetchOrderDetail();
            }
        } catch (error) {
            console.error('Assign return pickup error:', error);
            toast.error(error.response?.data?.message || 'Failed to assign pickup');
        } finally {
            setIsAssigningPickup(false);
        }
    };

    useEffect(() => {
        if (!deliveryPartners?.length) {
            refreshPartners?.();
        }
    }, [deliveryPartners?.length, refreshPartners]);

    if (isLoading) {
        return (
            <div className="p-4 space-y-4 animate-pulse bg-slate-50 min-h-screen">
                <div className="h-4 w-48 bg-slate-200 rounded" />
                <div className="h-40 bg-white border border-slate-200 rounded-sm" />
                <div className="h-80 bg-white border border-slate-200 rounded-sm" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="h-screen flex flex-col items-center justify-center p-8 text-center bg-slate-50">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-6">
                    <Search size={32} />
                </div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none mb-2">Order Not Found</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">The order you are looking for does not exist in the system.</p>
                <button onClick={() => navigate(-1)} className="mt-8 text-[11px] font-black uppercase text-slate-900 border-b-2 border-slate-900 pb-1">Go Back</button>
            </div>
        );
    }

    const timeline = [
        { status: 'Order Placed', time: order.time || (order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : '--'), desc: 'Order received by system', active: true },
        { status: 'Accepted', time: '--', desc: 'Franchise accepted the order', active: !['new', 'placed', 'pending'].includes(order.status) },
        { status: 'Processing', time: '--', desc: 'Order is being prepared', active: ['packed', 'dispatched', 'delivered', 'received'].includes(order.status) },
        { status: 'Dispatch', time: '--', desc: 'Out for delivery', active: ['dispatched', 'delivered', 'received'].includes(order.status) },
        { status: 'Delivered', time: '--', desc: 'Order delivered successfully', active: ['delivered', 'received', 'completed'].includes(order.status) }
    ];

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            {/* Enterprise Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all">
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-r border-slate-200 pr-4">
                            <Home size={12} />
                            <ChevronRight size={10} />
                            <span>Orders</span>
                            <ChevronRight size={10} />
                            <span className="text-slate-900 uppercase tracking-widest">{order.id}</span>
                        </div>
                        <div className={cn(
                            "px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest border",
                            order.status === 'completed' || order.status === 'delivered' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                order.status === 'procuring' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                    "bg-blue-50 text-blue-600 border-blue-100"
                        )}>
                            {order.status === 'procuring' ? 'Under Procurement' : order.status}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors border border-slate-200 rounded-sm bg-white">
                            <Share2 size={14} />
                        </button>
                        <button className="bg-slate-900 text-white px-3 py-1.5 rounded-sm text-[11px] font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm uppercase tracking-widest">
                            <Download size={14} />
                            Export PDF
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-1 px-1 lg:p-4 max-w-6xl mx-auto space-y-4">
                <div className="grid grid-cols-12 gap-4 items-start">
                    {/* Primary Manifest Information */}
                    <div className="col-span-12 lg:col-span-8 space-y-4">
                        {/* Summary Header */}
                        <div className="bg-slate-900 p-8 text-white rounded-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-2 leading-none">Store Details</p>
                                <h2 className="text-3xl font-black tracking-tighter uppercase leading-none mb-4">{order.customer || order.hotelName}</h2>
                                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <div className="flex items-center gap-1.5">
                                        <Briefcase size={12} strokeWidth={2.5} /> Regular Partner
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-slate-700" />
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={12} strokeWidth={2.5} /> System Connected
                                    </div>
                                </div>
                            </div>
                            <div className="relative z-10 flex flex-col items-end gap-2">
                                <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest text-right">Total Amount</span>
                                <span className="text-4xl font-black tracking-tighter tabular-nums leading-none">₹{order.total.toLocaleString()}</span>
                            </div>
                            {/* Grid Pattern Background */}
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }} />
                        </div>

                        {/* Location & Logistical Audit Documents */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white border border-slate-200 p-6 rounded-sm space-y-6">
                                <div className="flex items-center gap-3">
                                    <MapPin className="text-slate-900" size={16} />
                                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Delivery Address</h3>
                                </div>
                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-sm">
                                    <p className="text-[11px] font-bold text-slate-600 leading-relaxed uppercase tracking-tight">{order.address}</p>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-sm bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                                            <Phone size={14} />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-900">{order.mobile}</span>
                                    </div>
                                    <button className="text-[9px] font-black uppercase text-slate-400 hover:text-slate-900 transition-colors">View Map</button>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 p-6 rounded-sm space-y-6">
                                <div className="flex items-center gap-3">
                                    <FileText className="text-slate-900" size={16} />
                                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Documents</h3>
                                </div>
                                <div className="space-y-2">
                                    {order.bilty && (
                                        <button
                                            onClick={() => { setDocType('BILTY'); setIsDocOpen(true); }}
                                            className="w-full flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-sm hover:border-amber-900 transition-all text-left group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Package size={16} className="text-amber-500" />
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Bilty / Consignment Note</span>
                                                    <span className="text-[8px] font-bold text-amber-600 uppercase tracking-tight">{order.bilty.numberOfPackages} Packages • {order.bilty.biltyNumber}</span>
                                                </div>
                                            </div>
                                            <ChevronRight size={12} className="text-slate-300" />
                                        </button>
                                    )}
                                    {order.deliveryChallan && (
                                        <button
                                            onClick={() => { setDocType('DC'); setIsDocOpen(true); }}
                                            className="w-full flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-sm hover:border-slate-900 transition-all text-left group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Truck className="text-slate-400 group-hover:text-slate-900" size={16} />
                                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Delivery Challan</span>
                                            </div>
                                            <ChevronRight size={12} className="text-slate-300" />
                                        </button>
                                    )}
                                    {order.grn && (
                                        <button
                                            onClick={() => { setDocType('GRN'); setIsDocOpen(true); }}
                                            className="w-full flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-sm hover:border-slate-900 transition-all text-left group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <ShieldCheck className="text-emerald-500" size={16} />
                                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Purchase Record (GRN)</span>
                                            </div>
                                            <ChevronRight size={12} className="text-slate-300" />
                                        </button>
                                    )}
                                    {!order.deliveryChallan && !order.grn && (
                                        <div className="p-4 border border-dashed border-slate-200 rounded-sm text-center">
                                            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">No documents available</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Line Item Ledger */}
                        <div className="bg-white border border-slate-200 rounded-sm overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
                                <div className="flex items-center gap-2">
                                    <Package className="text-slate-900" size={16} />
                                    <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Order Items</h2>
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest tabular-nums">{order.items.length} ITEMS</span>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-sm bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-400 flex items-center justify-center tabular-nums">
                                                {item.quantity}×
                                            </div>
                                            <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="hidden md:flex flex-col items-end opacity-0 group-hover:opacity-100 transition-all">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase italic">Price</span>
                                                <span className="text-[10px] font-black text-slate-900 tabular-nums">₹{item.price.toLocaleString()}</span>
                                            </div>
                                            <span className="text-[11px] font-black text-slate-900 tabular-nums">₹{(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-slate-900 p-6 flex flex-col gap-3">
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
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Total</span>
                                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                                            {order.paymentMethod} • {order.paymentStatus}
                                        </span>
                                    </div>
                                    <span className="text-xl font-black text-white tracking-tighter tabular-nums">₹{order.total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Operational Feedback & Timeline */}
                    <div className="col-span-12 lg:col-span-4 space-y-4">
                        {/* Registry Timeline */}
                        <div className="bg-white border border-slate-200 p-8 rounded-sm">
                            <div className="flex items-center gap-3 mb-10">
                                <Clock className="text-slate-900" size={18} />
                                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Order Timeline</h3>
                            </div>
                            <div className="space-y-12 relative">
                                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-100" />
                                {timeline.map((step, idx) => (
                                    <div key={idx} className="flex gap-6 relative z-10">
                                        <div className={cn(
                                            "w-6 h-6 rounded-full border-4 border-white shadow-md flex items-center justify-center transition-all duration-500",
                                            step.active ? "bg-slate-900" : "bg-slate-100"
                                        )}>
                                            {step.active && <CheckCircle2 size={10} className="text-emerald-400" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className={cn("text-[10px] font-black uppercase tracking-widest", step.active ? "text-slate-900" : "text-slate-400")}>{step.status}</h4>
                                                <span className="text-[9px] font-bold text-slate-400 tabular-nums">{step.time}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight leading-normal">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Context Actions */}
                        <div className="bg-white border border-slate-200 p-6 rounded-sm space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Manage Order</h3>

                            {!order.franchiseId ? (
                                <>
                                    <button
                                        onClick={handleAcceptOrder}
                                        disabled={isAccepting}
                                        className="w-full h-12 bg-emerald-600 text-white rounded-sm font-black uppercase text-[10px] tracking-[0.2em] shadow-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isAccepting ? 'Accepting...' : (<>Accept Order <CheckCircle2 size={14} /></>)}
                                    </button>
                                    <button className="w-full h-10 border border-red-200 text-red-600 rounded-sm font-black uppercase text-[9px] tracking-widest hover:bg-red-50 transition-all">
                                        Reject Order
                                    </button>
                                </>
                            ) : (
                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-sm">
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest text-center flex items-center justify-center gap-2">
                                        <CheckCircle2 size={14} /> Order Accepted
                                    </p>
                                </div>
                            )}
                            {order.status === 'procuring' && (
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-sm">
                                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center justify-center gap-2 mb-2">
                                        <RefreshCw size={14} className="animate-spin" /> Under Procurement
                                    </p>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight text-center leading-relaxed">
                                        Stock for some items is low. Procurement request has been initiated. Once received, the order will be ready for packing.
                                    </p>
                                </div>
                            )}
                            {order.status === 'dispatched' && order.deliveryPartnerId && (
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-sm space-y-3">
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                        <Truck size={14} /> Delivery Assigned
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-sm flex items-center justify-center text-blue-600 font-black text-xs">
                                            {order.deliveryPartner?.fullName?.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-slate-900 uppercase">{order.deliveryPartner?.fullName}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{order.deliveryPartner?.mobile}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{order.deliveryPartner?.vehicleNumber}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button className="w-full h-10 border border-slate-200 text-slate-400 rounded-sm font-black uppercase text-[9px] tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all">
                                Report Issue
                            </button>
                        </div>

                        {order.returnRequests?.length > 0 && (
                            <div className="bg-white border border-slate-200 p-6 rounded-sm space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Return Requests</h3>
                                <div className="space-y-4">
                                    {order.returnRequests.map((request) => (
                                        <div key={request.index} className="border border-slate-200 rounded-sm p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                    Request #{request.index + 1}
                                                </span>
                                                <span className={cn(
                                                    "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-sm border",
                                                    request.status === 'pending' ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                        request.status === 'approved' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                                            request.status === 'rejected' ? "bg-rose-50 text-rose-700 border-rose-200" :
                                                                request.status === 'pickup_assigned' ? "bg-blue-50 text-blue-700 border-blue-200" :
                                                                    "bg-slate-50 text-slate-700 border-slate-200"
                                                )}>
                                                    {request.status.replace(/_/g, ' ')}
                                                </span>
                                            </div>

                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                Requested: {new Date(request.requestedAt).toLocaleString()}
                                            </p>

                                            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-tight bg-slate-50 border border-slate-100 p-2 rounded-sm">
                                                Customer Reason: {request.reason}
                                            </div>

                                            <div className="space-y-1">
                                                {request.items.map((item, idx) => (
                                                    <div key={idx} className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex justify-between">
                                                        <span>{item.name}</span>
                                                        <span>{item.quantity} {item.unit}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {request.status === 'pending' && (
                                                <div className="space-y-2 pt-1">
                                                    <textarea
                                                        value={reviewReasons[request.index] || ''}
                                                        onChange={(e) => setReviewReasons(prev => ({ ...prev, [request.index]: e.target.value }))}
                                                        placeholder="Review reason (optional for approve, required for reject)"
                                                        className="w-full min-h-20 border border-slate-200 rounded-sm p-2 text-[11px] font-bold text-slate-700 focus:outline-none focus:border-slate-400"
                                                    />
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <button
                                                            disabled={isReviewing}
                                                            onClick={() => handleReviewReturn(request.index, 'approve')}
                                                            className="h-9 bg-emerald-600 text-white rounded-sm font-black uppercase text-[9px] tracking-widest disabled:opacity-50"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            disabled={isReviewing}
                                                            onClick={() => handleReviewReturn(request.index, 'reject')}
                                                            className="h-9 bg-rose-600 text-white rounded-sm font-black uppercase text-[9px] tracking-widest disabled:opacity-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {['approved', 'pickup_assigned'].includes(request.status) && (
                                                <div className="space-y-2 pt-1">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Assign Delivery Partner For Pickup</p>
                                                    <select
                                                        className="w-full h-9 border border-slate-200 rounded-sm px-2 text-[11px] font-bold text-slate-700"
                                                        defaultValue=""
                                                        onChange={(e) => handleAssignReturnPickup(request.index, e.target.value)}
                                                        disabled={isAssigningPickup}
                                                    >
                                                        <option value="" disabled>Select Partner</option>
                                                        {deliveryPartners.map((p) => (
                                                            <option key={p._id} value={p._id}>
                                                                {p.fullName} - {p.vehicleNumber}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {request.pickupDeliveryPartnerId && (
                                                        <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                                                            Pickup partner assigned
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {request.franchiseReviewReason && (
                                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight bg-slate-50 border border-slate-100 p-2 rounded-sm">
                                                    Franchise Note: {request.franchiseReviewReason}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Document Viewer Overlay */}
            <DocumentViewer
                isOpen={isDocOpen}
                onClose={() => setIsDocOpen(false)}
                type={docType}
                data={docType === 'DC' ? order.deliveryChallan : order.grn}
            />
        </div>
    );
}
