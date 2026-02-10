import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Truck,
    ChevronRight,
    IndianRupee,
    Scale,
    ShieldCheck,
    AlertCircle,
    Loader2,
    FileText,
    Target,
    Activity
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import mockOrders from '../data/mockVendorOrders.json';
import { cn } from '@/lib/utils';
import { useOrders } from '@/modules/user/contexts/OrderContext';
import DocumentViewer from '../components/documents/DocumentViewer';

export default function PackingScreen() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('order');
    const [isDispatching, setIsDispatching] = useState(false);
    const [checkedItems, setCheckedItems] = useState({});
    const [step, setStep] = useState(1); // 1: Packing, 2: Weight, 3: Dispatch, 4: Success
    const [isDocOpen, setIsDocOpen] = useState(false);
    const { orders: contextOrders, updateOrderStatus } = useOrders();

    const order = useMemo(() => {
        const foundMock = mockOrders.find(o => o.id === orderId);
        if (foundMock) return foundMock;

        const liveOrder = contextOrders.find(o => o.id === orderId);
        if (liveOrder) {
            return {
                id: orderId,
                franchiseName: liveOrder.franchise || 'Main Center',
                items: liveOrder.items.map(i => ({
                    name: i.name,
                    quantity: i.quantity || parseInt(i.qty),
                    unit: i.unit || 'units',
                    image: i.image
                }))
            };
        }
        return mockOrders[0];
    }, [orderId, contextOrders]);

    useEffect(() => {
        const init = {};
        order.items.forEach(item => {
            init[item.name] = false;
        });
        setCheckedItems(init);
    }, [order.id]);

    const handleToggleCheck = (name) => {
        setCheckedItems(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const isPackingComplete = Object.values(checkedItems).every(v => v);

    const handleFinalDispatch = () => {
        setIsDispatching(true);
        setTimeout(() => {
            const deliveryChallan = {
                id: `DC-${order.id.split('-')[1] || Math.floor(10000 + Math.random() * 90000)}`,
                date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                sourceNode: 'KrishiKart Hub Alpha',
                destNode: order.franchiseName,
                items: order.items.map(i => ({ ...i, quantity: i.quantity || i.qty })),
                weight: '42.5 KG'
            };

            if (contextOrders.find(o => o.id === orderId)) {
                updateOrderStatus(orderId, 'completed', { deliveryChallan });
            }

            setIsDispatching(false);
            setStep(4);
        }, 2000);
    };

    return (
        <div className="space-y-6 pb-20 max-w-2xl mx-auto">
            {step < 4 && (
                <header className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                        <button onClick={() => navigate(-1)} className="hover:text-slate-900 transition-colors">Order {order.id}</button>
                        <ChevronRight size={10} />
                        <span className="text-primary">Fulfillment Cycle</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Assembly & Dispatch</h1>
                </header>
            )}

            {/* Stepper info */}
            {step < 4 && (
                <div className="flex gap-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex-1 space-y-2">
                            <div className={cn(
                                "h-1.5 rounded-full transition-all duration-700",
                                step >= i ? "bg-slate-900" : "bg-slate-100"
                            )} />
                            <p className={cn(
                                "text-[8px] font-black uppercase tracking-widest text-center",
                                step === i ? "text-slate-900" : "text-slate-300"
                            )}>
                                {i === 1 ? 'Verification' : i === 2 ? 'Calibration' : 'Authorization'}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                                        <Target size={22} />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 tracking-tighter uppercase">SKU Checkout</h3>
                                </div>
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{Object.values(checkedItems).filter(Boolean).length}/{order.items.length} Checked</span>
                            </div>

                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest border-b border-slate-50 pb-4">Audit current batch for quality compliance</p>

                            <div className="space-y-3">
                                {order.items.map((item, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => handleToggleCheck(item.name)}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group",
                                            checkedItems[item.name]
                                                ? "bg-emerald-50 border-emerald-100"
                                                : "bg-slate-50 border-slate-50 hover:border-slate-200"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl overflow-hidden border transition-all",
                                                checkedItems[item.name] ? "border-emerald-200" : "border-slate-100"
                                            )}>
                                                <img src={item.image} className={cn("w-full h-full object-cover grayscale", checkedItems[item.name] && "grayscale-0")} alt="" />
                                            </div>
                                            <div>
                                                <span className={cn(
                                                    "font-black text-sm tracking-tight block",
                                                    checkedItems[item.name] ? "text-emerald-900" : "text-slate-600"
                                                )}>{item.name}</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.quantity} {item.unit} Allocated</span>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all",
                                            checkedItems[item.name] ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-slate-200 group-hover:border-slate-400"
                                        )}>
                                            {checkedItems[item.name] && <CheckCircle2 size={12} />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            disabled={!isPackingComplete}
                            onClick={() => setStep(2)}
                            className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-[12px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none group"
                        >
                            Logistics Calibration
                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center">
                                    <Scale size={22} />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 tracking-tighter uppercase">Scale Calibration</h3>
                            </div>

                            <div className="space-y-8">
                                <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 text-center group transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100/50">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gross Consignment Payload</label>
                                    <div className="flex items-center justify-center gap-3 mt-4">
                                        <input
                                            type="number"
                                            defaultValue="42.50"
                                            step="0.01"
                                            className="bg-transparent border-none p-0 outline-none text-5xl font-black text-slate-900 w-32 text-right tabular-nums focus:text-primary transition-colors"
                                        />
                                        <span className="text-2xl font-black text-slate-300 uppercase mt-4">KG</span>
                                    </div>
                                    <div className="mt-6 flex justify-center">
                                        <div className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                            <Activity size={12} className="animate-pulse" />
                                            Live Sensor Active
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-5 bg-slate-900 text-white rounded-[24px] shadow-xl">
                                    <ShieldCheck size={20} className="text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Compliance Check</p>
                                        <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight">Weight data is synchronized with the digital manifest for Node audit.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setStep(1)} className="flex-1 bg-white border border-slate-100 py-5 rounded-[24px] font-black text-[12px] uppercase tracking-widest text-slate-300 hover:text-slate-900 transition-all">Previous</button>
                            <button onClick={() => setStep(3)} className="flex-[2] bg-slate-900 text-white py-5 rounded-[24px] font-black text-[12px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all group">
                                Authorize Cycle
                                <Truck size={18} className="group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-2xl text-center space-y-8"
                    >
                        <div className="w-24 h-24 bg-slate-900 text-white rounded-[32px] flex items-center justify-center mx-auto rotate-6 shadow-2xl group active:rotate-0 transition-transform">
                            <Truck size={48} className="animate-pulse" />
                        </div>

                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-tight">Authorize Node Transfer?</h3>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-3 px-10">Initiating logistics leg to <b>{order.franchiseName}</b> node. Manifest will be locked.</p>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-[32px] space-y-4 border border-slate-100">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                <span className="text-slate-400">Payload WT</span>
                                <span className="text-slate-900 tabular-nums">42.50 KG</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                <span className="text-slate-400">Digital Seal</span>
                                <div className="flex items-center gap-2 text-emerald-600">
                                    <ShieldCheck size={14} />
                                    <span>ENCRYPTED</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={handleFinalDispatch}
                                disabled={isDispatching}
                                className="w-full bg-primary text-white py-6 rounded-[28px] font-black text-[12px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-[0_20px_50px_-15px_rgba(22,163,74,0.4)] active:scale-95 transition-all disabled:opacity-50"
                            >
                                {isDispatching ? <Loader2 size={24} className="animate-spin" /> : <>Final Authorization <ArrowRight size={20} /></>}
                            </button>
                            <button onClick={() => setStep(2)} className="w-full text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] hover:text-slate-900 transition-colors py-2">Return to Calibration</button>
                        </div>
                    </motion.div>
                )}

                {step === 4 && (
                    <motion.div
                        key="step4"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-2xl text-center space-y-10"
                    >
                        <div className="w-24 h-24 bg-emerald-600 text-white rounded-[32px] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-100 rotate-12">
                            <CheckCircle2 size={48} />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">CYCLE SYNCHRONIZED</h3>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">CONSGN REF: KK-IX-{Math.floor(Math.random() * 90000) + 10000}</p>
                        </div>

                        <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 text-left space-y-6">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Node</span>
                                <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{order.franchiseName}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gross Payload</span>
                                <span className="text-sm font-black text-slate-900 tabular-nums">42.50 KG</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Status</span>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-200">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    IN TRANSIT
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <button
                                onClick={() => setIsDocOpen(true)}
                                className="w-full bg-slate-50 text-slate-600 py-5 rounded-[24px] font-black text-[12px] uppercase tracking-widest flex items-center justify-center gap-3 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-100/50 transition-all active:scale-95 group"
                            >
                                <FileText size={20} className="text-slate-300 group-hover:text-primary transition-colors" /> Generate Digital Manifest
                            </button>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => navigate('/vendor/dashboard')}
                                    className="flex-1 bg-slate-900 text-white py-5 rounded-[24px] font-black text-[12px] uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                                >
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => navigate('/vendor/dispatch-history')}
                                    className="flex-1 bg-white border border-slate-100 text-slate-900 py-5 rounded-[24px] font-black text-[12px] uppercase tracking-widest active:scale-95 transition-all"
                                >
                                    History
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <DocumentViewer
                isOpen={isDocOpen}
                onClose={() => setIsDocOpen(false)}
                type="DC"
                data={contextOrders.find(o => o.id === orderId)?.deliveryChallan || {
                    id: 'DC-AUTOGEN',
                    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                    items: order.items,
                    destNode: order.franchiseName,
                    weight: '42.50 KG'
                }}
            />
        </div>
    );
}
