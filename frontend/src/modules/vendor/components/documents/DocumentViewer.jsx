import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Download, FileText, CheckCircle2, Truck, Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DocumentViewer({ isOpen, onClose, data, type = 'DC' }) {
    if (!data) return null;

    const isDC = type === 'DC';
    const accentColor = isDC ? 'text-indigo-600' : 'text-emerald-600';
    const accentBg = isDC ? 'bg-indigo-50' : 'bg-emerald-50';
    const accentBorder = isDC ? 'border-indigo-100' : 'border-emerald-100';

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
                                        {isDC ? 'Delivery Challan' : 'Goods Received Note'}
                                    </h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        ID: {data.id} • {data.date}
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
                                        <div className="w-8 h-8 bg-primary rounded-lg" />
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
                                    <p className="text-sm font-black text-slate-900">{data.date}</p>
                                    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black mt-4 uppercase border", accentBg, accentColor, accentBorder)}>
                                        {isDC ? 'Dispatched' : 'Audited & Received'}
                                    </div>
                                </div>
                            </div>

                            {/* Node Info */}
                            <div className="grid lg:grid-cols-2 gap-6">
                                <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Truck size={14} className="text-slate-400" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Source Node</span>
                                    </div>
                                    <h4 className="text-sm font-black text-slate-900">{data.sourceNode || 'KrishiKart Global'}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Vendor-Warehouse Partner</p>
                                </div>
                                <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                                    <div className="flex items-center gap-2 mb-4">
                                        <CheckCircle2 size={14} className="text-slate-400" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Destination Node</span>
                                    </div>
                                    <h4 className="text-sm font-black text-slate-900">{data.destNode || 'Main Center'}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Franchise Distribution Point</p>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Consignment Manifest</h3>
                                <div className="border border-slate-100 rounded-3xl overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <th className="px-6 py-4">Item Details</th>
                                                <th className="px-6 py-4 text-center">{isDC ? 'Sent' : 'Recv'}</th>
                                                {!isDC && <th className="px-6 py-4 text-center">Dmg</th>}
                                                <th className="px-6 py-4 text-right">Unit</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {data.items.map((item, idx) => (
                                                <tr key={idx} className="text-sm font-bold text-slate-700">
                                                    <td className="px-6 py-4">{item.name}</td>
                                                    <td className="px-6 py-4 text-center font-black text-slate-900">
                                                        {isDC ? item.quantity : (item.receivedQty || item.quantity)}
                                                    </td>
                                                    {!isDC && (
                                                        <td className="px-6 py-4 text-center font-black text-red-500">
                                                            {item.damageQty || 0}
                                                        </td>
                                                    )}
                                                    <td className="px-6 py-4 text-right text-slate-400 uppercase text-[10px]">{item.unit}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Summary & Signatures */}
                            <div className="grid lg:grid-cols-2 gap-12 pt-8">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                        This document is electronically generated and serves as a legal proof of handover for the aforementioned goods. Discrepancies must be reported within 4 hours.
                                    </p>
                                    <div className="flex gap-4">
                                        <div className="px-4 py-2 border border-slate-100 rounded-xl text-[9px] font-black text-slate-400 uppercase">
                                            GROSS WT: 42.5 KG
                                        </div>
                                        <div className="px-4 py-2 border border-slate-100 rounded-xl text-[9px] font-black text-slate-400 uppercase">
                                            SEALS: INTACT
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between gap-8">
                                    <div className="flex-1 text-center space-y-8 pt-8 border-t border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized Signatory</p>
                                        <div className="h-0.5 w-32 bg-slate-100 mx-auto" />
                                    </div>
                                    <div className="flex-1 text-center space-y-8 pt-8 border-t border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recipient Acknowledgement</p>
                                        <div className="h-0.5 w-32 bg-slate-100 mx-auto" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[8px] font-black text-slate-400 uppercase tracking-widest shrink-0">
                            <span>Printed Via KrishiKart Node Terminal</span>
                            <span>{new Date().toLocaleString()}</span>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
