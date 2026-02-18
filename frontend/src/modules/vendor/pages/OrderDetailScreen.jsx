import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Clock,
    CheckCircle2,
    Package,
    Truck,
    AlertCircle,
    MapPin,
    IndianRupee,
    ChevronRight,
    Loader2,
    Calendar,
    Phone,
    Shield,
    ClipboardList,
    XCircle,
    ThumbsUp,
    ThumbsDown,
    FileText,
    ExternalLink
} from 'lucide-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import mockOrders from '../data/mockVendorOrders.json';
import { cn } from '@/lib/utils';
import { useOrders } from '@/modules/user/contexts/OrderContext';
// import { useProcurement } from '@/modules/franchise/contexts/ProcurementContext';
import DocumentViewer from '../components/documents/DocumentViewer';

export default function OrderDetailScreen() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [order, setOrder] = useState(null);
    const [status, setStatus] = useState(null);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [isDocOpen, setIsDocOpen] = useState(false);
    const [docType, setDocType] = useState('DC');
    const [bidPrice, setBidPrice] = useState('');
    const { orders: contextOrders, updateOrderStatus } = useOrders();
    // const { procurementRequests, submitQuotation, updateRequestStatus } = useProcurement(); 
    const procurementRequests = [];
    const submitQuotation = async () => { };
    const updateRequestStatus = async () => { };
    const [quotedItems, setQuotedItems] = useState([]);

    useEffect(() => {
        const timer = setTimeout(() => {
            let foundOrder = location.state?.order;

            if (foundOrder) {
                // UI Fix: If status is 'assigned', treat it as 'requested' (new inquiry)
                let currentStatus = foundOrder.status?.toLowerCase();
                if (currentStatus === 'assigned') {
                    currentStatus = 'requested';
                }

                setStatus(currentStatus);
                setOrder(foundOrder);
                setBidPrice(foundOrder.totalEstimatedAmount?.toString() || foundOrder.total?.toString() || '');
                if (foundOrder.items) {
                    setQuotedItems(foundOrder.items.map(item => ({
                        ...item,
                        quotedPrice: item.quotedPrice || 0,
                        image: item.image
                    })));
                }
            }
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [id, location.state]);

    const handleAction = (newStatus, callback) => {
        setIsActionLoading(true);
        setTimeout(() => {
            if (contextOrders.find(o => o.id === id)) {
                updateOrderStatus(id, newStatus);
            }
            if (procurementRequests.find(r => r.id === id)) {
                updateRequestStatus(id, newStatus);
            }
            setStatus(newStatus);
            setIsActionLoading(false);
            if (callback) callback();
        }, 1000);
    };

    const handleQuotationSubmit = async () => {
        setIsActionLoading(true);
        try {
            const response = await api.post(`/procurement/vendor/${id}/quote`, { items: quotedItems });
            if (response.data.success) {
                setStatus('quoted');
                navigate('/vendor/orders');
            }
        } catch (error) {
            console.error("Failed to submit quotation", error);
        } finally {
            setIsActionLoading(false);
        }
    };

    const updateItemQuotation = (idx, price) => {
        const newItems = [...quotedItems];
        newItems[idx].quotedPrice = parseFloat(price) || 0;
        setQuotedItems(newItems);

        const total = newItems.reduce((sum, item) => sum + (item.quotedPrice * (item.quantity || item.qty || 0)), 0);
        setBidPrice(total.toString());
    };

    if (isLoading) return (
        <div className="space-y-8 animate-pulse">
            <div className="h-10 w-48 bg-slate-100 rounded-xl" />
            <div className="h-32 w-full bg-slate-100 rounded-[32px]" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-96 bg-slate-100 rounded-[40px]" />
                <div className="h-96 bg-slate-100 rounded-[40px]" />
            </div>
        </div>
    );

    if (!order) return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4 border border-dashed border-slate-200">
                <AlertCircle size={32} />
            </div>
            <h4 className="text-slate-900 font-black tracking-tight uppercase tracking-widest">Order Not Found</h4>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">The requested supply reference does not exist</p>
            <button onClick={() => navigate('/vendor/orders')} className="mt-6 text-primary font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                <ArrowLeft size={14} /> Back to Ledger
            </button>
        </div>
    );

    const steps = [
        { id: 'requested', label: 'Inquiry', icon: ClipboardList, description: 'New Node Request' },
        { id: 'quoted', label: 'Quoted', icon: IndianRupee, description: 'Awaiting Approval' },
        { id: 'approved', label: 'Authorized', icon: CheckCircle2, description: 'Order PO Received' },
        { id: 'preparing', label: 'Processing', icon: Package, description: 'Batch under assembly' },
        { id: 'ready', label: 'Staged', icon: Shield, description: 'Verified & Sealed' },
        { id: 'completed', label: 'Dispatched', icon: Truck, description: 'Inbound to Node' }
    ];

    const getActiveStepId = (s) => {
        const lowerS = s?.toLowerCase();
        if (lowerS === 'new') return 'approved';
        if (lowerS === 'bidding') return 'quoted';
        return lowerS;
    };

    const currentStepIndex = steps.findIndex(s => s.id === getActiveStepId(order.status === 'completed' ? 'completed' : order.status));

    return (
        <div className="space-y-6 pb-32">
            <header className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                    <button onClick={() => navigate('/vendor/orders')} className="hover:text-slate-900 transition-colors">Orders</button>
                    <ChevronRight size={10} />
                    <span className="text-primary">{order.id}</span>
                </div>
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Supply Reference</h1>
                    <div className={cn(
                        "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                        status === 'assigned' || status === 'new' ? "bg-blue-50 text-blue-600 border-blue-100" :
                            status === 'bidding' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                status === 'accepted' || status === 'ready' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                    "bg-slate-50 text-slate-400 border-slate-100"
                    )}>
                        {status}
                    </div>
                </div>
            </header>

            {/* Progress Stepper */}
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="flex justify-between relative z-10">
                    {steps.map((step, idx) => {
                        const isCompleted = idx < currentStepIndex;
                        const isCurrent = idx === currentStepIndex;
                        return (
                            <div key={idx} className="flex flex-col items-center gap-3 flex-1 relative">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 relative z-10",
                                    isCompleted ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" :
                                        isCurrent ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "bg-slate-50 text-slate-300 border border-slate-100"
                                )}>
                                    {isCompleted ? <CheckCircle2 size={20} /> : <step.icon size={20} />}
                                </div>
                                <div className="text-center px-2">
                                    <p className={cn(
                                        "text-[9px] font-black uppercase tracking-widest leading-none mb-1",
                                        isCurrent ? "text-slate-900" : isCompleted ? "text-emerald-600" : "text-slate-400"
                                    )}>
                                        {step.label}
                                    </p>
                                    <p className="text-[7px] font-bold text-slate-300 uppercase tracking-tighter leading-none whitespace-nowrap hidden sm:block">
                                        {step.description}
                                    </p>
                                </div>

                                {idx < steps.length - 1 && (
                                    <div className="absolute top-6 left-[60%] w-[80%] h-[2px] bg-slate-100 -z-0">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: idx < currentStepIndex ? '100% ' : '0%' }}
                                            className="h-full bg-emerald-600"
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Price Bidding UI */}
            <AnimatePresence>
                {(status === 'requested' || status === 'quoted' || status === 'assigned') && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-primary/5 p-8 rounded-[40px] border border-primary/10 shadow-sm space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Supply Quotation Aggregate</h4>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                    {status === 'requested' ? "Calculate per-item rates below to generate proposal" : "Current Quotation Value"}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm border border-primary/10">
                                <IndianRupee size={20} />
                            </div>
                        </div>

                        <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xl">₹</span>
                            <div className="w-full bg-white border-2 border-slate-100 rounded-[28px] py-4 pl-12 pr-6 text-2xl font-black text-slate-900 tabular-nums">
                                {parseFloat(bidPrice).toLocaleString()}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Document Log */}
            {(order.deliveryChallan || order.grn) && (
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Compliance & Logistics</p>
                        <Shield size={16} className="text-slate-200" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {order.deliveryChallan && (
                            <button
                                onClick={() => { setDocType('DC'); setIsDocOpen(true); }}
                                className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-100/50 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                        <FileText size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Delivery Challan</p>
                                        <p className="text-[8px] font-bold text-slate-400 tracking-widest mt-0.5">{order.deliveryChallan.id}</p>
                                    </div>
                                </div>
                                <ExternalLink size={14} className="text-slate-300 group-hover:text-primary transition-colors" />
                            </button>
                        )}
                        {order.grn && (
                            <button
                                onClick={() => { setDocType('GRN'); setIsDocOpen(true); }}
                                className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-100/50 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                        <Shield size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Digital GRN</p>
                                        <p className="text-[8px] font-bold text-slate-400 tracking-widest mt-0.5">{order.grn.id}</p>
                                    </div>
                                </div>
                                <ExternalLink size={14} className="text-slate-300 group-hover:text-primary transition-colors" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Items Manifest */}
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                <ClipboardList size={22} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Supply Manifest</h3>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{order.items.length} Component SKUs</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {quotedItems.map((item, idx) => (
                            <div key={idx} className="flex flex-col gap-3 p-4 rounded-2xl border border-slate-50 group hover:border-slate-200 hover:bg-slate-50 transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm flex items-center justify-center">
                                            {item.image ? (
                                                <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                                            ) : (
                                                <Package size={20} className="text-slate-300" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 text-sm tracking-tight">{item.name}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.qty || item.quantity} {item.unit} Requested</p>
                                        </div>
                                    </div>
                                    {status === 'requested' ? (
                                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus-within:border-primary transition-all shadow-sm">
                                            <span className="text-[11px] font-black text-slate-400">₹</span>
                                            <input
                                                type="number"
                                                className="w-16 bg-transparent border-none outline-none font-black text-[11px] tabular-nums text-slate-900"
                                                placeholder="Rate"
                                                value={item.quotedPrice || ''}
                                                onChange={(e) => updateItemQuotation(idx, e.target.value)}
                                            />
                                        </div>
                                    ) : (
                                        <div className="text-right">
                                            <p className="text-[11px] font-black text-slate-900 tabular-nums">₹{item.quotedPrice || (item.price || 0)}</p>
                                            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Quoted Rate</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Operations Intel */}
                <div className="space-y-6">
                    <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl shadow-slate-200 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-[100px] -z-0" />
                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-10">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Target Fulfillment</p>
                                    <h4 className="text-2xl font-black tracking-tight">{order.franchiseName}</h4>
                                </div>
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-primary backdrop-blur-xl border border-white/5">
                                    <MapPin size={24} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md group-hover:border-white/20 transition-colors">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-slate-300">
                                        <Phone size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Node Ops Contact</p>
                                        <p className="text-sm font-black tabular-nums">+91 90000 12345</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md group-hover:border-white/20 transition-colors">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-slate-300">
                                        <Clock size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Deadline Sequence</p>
                                        <p className="text-sm font-black tabular-nums">{new Date(order.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Today</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Settle Info */}
                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2 leading-none">Net Settlement Value</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-slate-900 tracking-tight tabular-nums">₹{(order.procurementTotal || order.total || 0).toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                ESCROW SECURED
                            </div>
                            <p className="text-[8px] font-bold text-slate-300 uppercase mt-2 tracking-tighter">Authorized per PO Agreement</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-2xl border-t border-slate-100 lg:left-64 flex gap-4 z-[100] shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.1)]">
                <AnimatePresence mode="wait">
                    {status === 'requested' && (
                        <motion.div
                            key="action-requested"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex-1 flex gap-4"
                        >
                            <button
                                onClick={handleQuotationSubmit}
                                disabled={isActionLoading || quotedItems.some(item => !item.quotedPrice)}
                                className="flex-[2] bg-slate-900 text-white py-5 rounded-[24px] font-black text-sm flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 active:scale-95 transition-all disabled:opacity-50 group"
                            >
                                {isActionLoading ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>
                                        Transmit Supply Proposal
                                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </motion.div>
                    )}

                    {status === 'quoted' && (
                        <motion.div
                            key="action-quoted"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex-1 bg-amber-50 text-amber-600 py-5 rounded-[24px] font-black text-sm flex items-center justify-center gap-3 border border-amber-100"
                        >
                            <Clock className="animate-pulse" size={18} />
                            Awaiting Node Authorization
                        </motion.div>
                    )}

                    {status === 'approved' && (
                        <motion.div
                            key="action-approved"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex-1 flex gap-4"
                        >
                            <button
                                onClick={() => handleAction('preparing', () => navigate(`/vendor/dispatch?order=${order.id}`))}
                                disabled={isActionLoading}
                                className="flex-1 bg-slate-900 text-white py-5 rounded-[24px] font-black text-sm flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 active:scale-95 transition-all group"
                            >
                                {isActionLoading ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>
                                        Initiate Fulfillment Cycle
                                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </motion.div>
                    )}

                    {(status === 'preparing' || status === 'ready') && (
                        <motion.button
                            key="action-fufillment"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => navigate(`/vendor/dispatch?order=${order.id}`)}
                            className="flex-1 bg-emerald-600 text-white py-5 rounded-[24px] font-black text-sm flex items-center justify-center gap-3 shadow-2xl shadow-emerald-100 active:scale-95 transition-all group"
                        >
                            Sync Progress Checklist
                            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                    )}

                    {status === 'completed' && (
                        <motion.div
                            key="action-completed"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex-1 bg-slate-50 text-slate-300 py-5 rounded-[24px] font-black text-sm flex items-center justify-center gap-2 border border-dashed border-slate-200"
                        >
                            <CheckCircle2 size={18} /> Cycle Completed & Synchronized
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <DocumentViewer
                isOpen={isDocOpen}
                onClose={() => setIsDocOpen(false)}
                type={docType}
                data={docType === 'DC' ? order.deliveryChallan : order.grn}
            />
        </div>
    );
}
