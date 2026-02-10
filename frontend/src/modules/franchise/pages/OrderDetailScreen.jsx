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
import { useFranchiseOrders } from '../contexts/FranchiseOrdersContext';
import { cn } from '@/lib/utils';
import { useOrders } from '@/modules/user/contexts/OrderContext';
import DocumentViewer from '../../vendor/components/documents/DocumentViewer';

export default function OrderDetailScreen() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { orders: localOrders, updateOrderStatus: updateLocalStatus } = useFranchiseOrders();
    const { orders: liveOrders, updateOrderStatus: updateLiveStatus } = useOrders();
    const [isDocOpen, setIsDocOpen] = useState(false);
    const [docType, setDocType] = useState('GRN');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    let order = localOrders.find(o => o.id === id);
    if (!order) {
        const liveOrder = liveOrders.find(o => o.id === id);
        if (liveOrder) {
            order = {
                id: liveOrder.id,
                customer: liveOrder.customer || 'Standard Client',
                address: liveOrder.address || 'Standard Delivery Zone',
                total: liveOrder.total,
                status: liveOrder.status === 'processing' ? 'incoming' : liveOrder.status,
                items: liveOrder.items.map(i => ({
                    name: i.name,
                    quantity: i.quantity || parseInt(i.qty) || 1,
                    price: i.price || 0
                })),
                deliveryChallan: liveOrder.deliveryChallan,
                grn: liveOrder.grn,
                type: 'direct',
                timeline: liveOrder.timeline || []
            };
        }
    }

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
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none mb-2">Entity Not Found</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">The requested order identifier does not exist in the active ledger.</p>
                <button onClick={() => navigate(-1)} className="mt-8 text-[11px] font-black uppercase text-slate-900 border-b-2 border-slate-900 pb-1">Return to Registry</button>
            </div>
        );
    }

    const timeline = [
        { status: 'Registry Entry', time: '10:30 AM', desc: 'Order initialized in central manifest', active: true },
        { status: 'Node Acceptance', time: '10:35 AM', desc: 'Franchise node confirmed fulfillment', active: order.status !== 'incoming' },
        { status: 'Fleet Assignment', time: '10:45 AM', desc: 'Logistic partner allocated for dispatch', active: order.status === 'assigned' || order.status === 'completed' || order.status === 'delivered' || order.status === 'out_for_delivery' },
        { status: 'Protocol Finalized', time: '--:--', desc: 'Order reached terminal destination', active: order.status === 'completed' || order.status === 'delivered' }
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
                            <span>Manifest</span>
                            <ChevronRight size={10} />
                            <span className="text-slate-900 uppercase tracking-widest">{order.id}</span>
                        </div>
                        <div className={cn(
                            "px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest border",
                            order.status === 'completed' || order.status === 'delivered' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                        )}>
                            {order.status}
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
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-2 leading-none">Entity Information</p>
                                <h2 className="text-3xl font-black tracking-tighter uppercase leading-none mb-4">{order.customer || order.hotelName}</h2>
                                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <div className="flex items-center gap-1.5">
                                        <Briefcase size={12} strokeWidth={2.5} /> Standard Account
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-slate-700" />
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={12} strokeWidth={2.5} /> Internal Sync Active
                                    </div>
                                </div>
                            </div>
                            <div className="relative z-10 flex flex-col items-end gap-2">
                                <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest text-right">Commitment Volume</span>
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
                                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Geo-spatial Endpoint</h3>
                                </div>
                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-sm">
                                    <p className="text-[11px] font-bold text-slate-600 leading-relaxed uppercase tracking-tight">{order.address}</p>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-sm bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                                            <Phone size={14} />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-900">+91 98765 43210</span>
                                    </div>
                                    <button className="text-[9px] font-black uppercase text-slate-400 hover:text-slate-900 transition-colors">Route Map</button>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 p-6 rounded-sm space-y-6">
                                <div className="flex items-center gap-3">
                                    <FileText className="text-slate-900" size={16} />
                                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Supply Chain Protocols</h3>
                                </div>
                                <div className="space-y-2">
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
                                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Audit Registry (GRN)</span>
                                            </div>
                                            <ChevronRight size={12} className="text-slate-300" />
                                        </button>
                                    )}
                                    {!order.deliveryChallan && !order.grn && (
                                        <div className="p-4 border border-dashed border-slate-200 rounded-sm text-center">
                                            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">No Digital Manifests Linked</p>
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
                                    <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Itemized Manifest Ledger</h2>
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest tabular-nums">{order.items.length} LINE SKUS</span>
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
                                                <span className="text-[9px] font-bold text-slate-400 uppercase italic">Unit Value</span>
                                                <span className="text-[10px] font-black text-slate-900 tabular-nums">₹{item.price.toLocaleString()}</span>
                                            </div>
                                            <span className="text-[11px] font-black text-slate-900 tabular-nums">₹{(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-slate-900 p-6 flex items-center justify-between text-white">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-1">Final Settlement Volume</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Inclusive of Logistic Overheads</span>
                                </div>
                                <span className="text-2xl font-black tracking-tighter tabular-nums">₹{order.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Operational Feedback & Timeline */}
                    <div className="col-span-12 lg:col-span-4 space-y-4">
                        {/* Registry Timeline */}
                        <div className="bg-white border border-slate-200 p-8 rounded-sm">
                            <div className="flex items-center gap-3 mb-10">
                                <Clock className="text-slate-900" size={18} />
                                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Event Telemetry Log</h3>
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
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Protocol Control</h3>
                            <button className="w-full h-12 bg-slate-900 text-white rounded-sm font-black uppercase text-[10px] tracking-[0.2em] shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                                Update Logistics Stage <ArrowRight size={14} />
                            </button>
                            <button className="w-full h-10 border border-slate-200 text-slate-400 rounded-sm font-black uppercase text-[9px] tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all">
                                Flag Audit Variance
                            </button>
                        </div>
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
