import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Download, FileText, CheckCircle2, Truck, Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DocumentViewer({ isOpen, onClose, data, type = 'DC' }) {
    if (!data) return null;

    const isDC = type === 'DC';
    const isInvoice = type === 'INVOICE';
    const accentColor = isInvoice ? 'text-primary' : (isDC ? 'text-indigo-600' : 'text-emerald-600');
    const accentBg = isInvoice ? 'bg-primary/10' : (isDC ? 'bg-indigo-50' : 'bg-emerald-50');
    const accentBorder = isInvoice ? 'border-primary/20' : (isDC ? 'border-indigo-100' : 'border-emerald-100');

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
                    />
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        className="fixed inset-x-0 bottom-0 top-10 lg:inset-y-20 lg:inset-x-64 bg-white rounded-t-[40px] lg:rounded-[40px] shadow-2xl z-[110] overflow-hidden flex flex-col"
                    >
                        {/* Header Actions */}
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                            <div className="flex items-center gap-3">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", accentBg, accentColor)}>
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-900 tracking-tight">
                                        {isInvoice ? 'Tax Invoice' : (isDC ? 'Delivery Challan' : 'Goods Received Note')}
                                    </h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        ID: {data.invoiceNumber || data.id} • {data.date || new Date(data.invoiceDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-3 text-slate-400 hover:text-slate-900 transition-colors">
                                    <Printer size={20} />
                                </button>
                                <button className="p-3 text-slate-400 hover:text-slate-900 transition-colors">
                                    <Download size={20} />
                                </button>
                                <button onClick={onClose} className="p-3 text-slate-400 hover:text-red-500 transition-colors ml-2">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Document Content */}
                        <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-10 custom-scrollbar">
                            {/* Branding & Top Info */}
                            <div className="flex flex-col lg:flex-row justify-between gap-8 pt-4">
                                <div className="space-y-4">
                                    <div className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-2">
                                        <div className="w-8 h-8 bg-black rounded-lg" />
                                        KrishiKart <span className="text-primary font-light">Supply Chain</span>
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest max-w-xs">
                                        B-204, Corporate Hub, Sector 62<br />
                                        Noida, UP - 201301<br />
                                        GSTIN: 09AAAFK1234F1Z5
                                    </div>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Date</p>
                                    <p className="text-sm font-black text-slate-900">{data.date || new Date(data.invoiceDate).toLocaleDateString()}</p>
                                    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black mt-4 uppercase border", accentBg, accentColor, accentBorder)}>
                                        {isInvoice ? 'Invoice Finalized' : (isDC ? 'Dispatched' : 'Audited & Received')}
                                    </div>
                                </div>
                            </div>

                            {/* Node Info */}
                            <div className="grid lg:grid-cols-2 gap-6">
                                <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Truck size={14} className="text-slate-400" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Source Node (Vendor)</span>
                                    </div>
                                    <h4 className="text-sm font-black text-slate-900">{data.vendor || data.sourceNode || 'KrishiKart Global'}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Handover Distribution Partner</p>
                                </div>
                                <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                                    <div className="flex items-center gap-2 mb-4">
                                        <CheckCircle2 size={14} className="text-slate-400" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Destination Node (Franchise)</span>
                                    </div>
                                    <h4 className="text-sm font-black text-slate-900">{data.franchise || data.destNode || 'Main Center'}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Franchise Distribution Point</p>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Consignment Manifest</h3>
                                <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                                <th className="px-6 py-4">Item Details</th>
                                                <th className="px-6 py-4 text-center">Quantity</th>
                                                <th className="px-6 py-4 text-right">Unit Price</th>
                                                <th className="px-6 py-4 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {data.items.map((item, idx) => (
                                                <tr key={idx} className="text-sm font-bold text-slate-700 hover:bg-slate-50/50">
                                                    <td className="px-6 py-4">{item.name}</td>
                                                    <td className="px-6 py-4 text-center font-black text-slate-900">
                                                        {item.quantity || item.qty} {item.unit}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-slate-400 tabular-nums">
                                                        ₹{item.price || item.quotedPrice || '0.00'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-black text-slate-900 tabular-nums">
                                                        ₹{((item.quantity || item.qty) * (item.price || item.quotedPrice || 0)).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Summary & Signatures */}
                            <div className="grid lg:grid-cols-2 gap-12 pt-8">
                                <div className="space-y-6">
                                    <div className="p-6 bg-slate-900 text-white rounded-[32px] space-y-4">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <span>Certified Packaging WT</span>
                                            <span className="text-white">{data.totalWeight || data.weight || '42.5'} KG</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <span>Digital Security Code</span>
                                            <span className="text-emerald-400">#KK-AUTH-SECURE</span>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed pt-2 border-t border-white/10">
                                            Handover finalized at KrishiKart Node Terminal. Gross payload synchronized for logistics leg.
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal</span>
                                        <span className="text-sm font-black text-slate-900">₹{data.items.reduce((acc, item) => acc + (item.quantity * (item.price || item.quotedPrice || 0)), 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Handling Fee</span>
                                        <span className="text-sm font-black text-slate-900">₹40.00</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Grand Total</span>
                                        <span className="text-xl font-black text-primary">₹{(data.items.reduce((acc, item) => acc + (item.quantity * (item.price || item.quotedPrice || 0)), 0) + 40).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[8px] font-black text-slate-400 uppercase tracking-widest shrink-0">
                            <span>Certified Digital Document • KrishiKart Node Architecture v2.0</span>
                            <span>{new Date().toLocaleString()}</span>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
