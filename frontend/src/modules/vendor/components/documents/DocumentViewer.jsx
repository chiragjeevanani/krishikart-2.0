import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Download, FileText, CheckCircle2, Truck, Calendar, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import html2pdf from 'html2pdf.js';

export default function DocumentViewer({ isOpen, onClose, data, type = 'DC', autoDownload = false }) {
    const reportRef = useRef();
    const [isGenerating, setIsGenerating] = React.useState(false);

    React.useEffect(() => {
        if (isOpen && autoDownload && !isGenerating) {
            handleDownload();
        }
    }, [isOpen, autoDownload]);

    if (!data) return null;

    const isDC = type === 'DC';
    const isInvoice = type === 'INVOICE';
    const isBilty = type === 'BILTY';

    const accentColor = isInvoice ? 'text-primary' : (isDC ? 'text-indigo-600' : (isBilty ? 'text-amber-600' : 'text-emerald-600'));
    const accentBg = isInvoice ? 'bg-primary/10' : (isDC ? 'bg-indigo-50' : (isBilty ? 'bg-amber-50' : 'bg-emerald-50'));
    const accentBorder = isInvoice ? 'border-primary/20' : (isDC ? 'border-indigo-100' : (isBilty ? 'border-amber-100' : 'border-emerald-100'));

    const handleDownload = async () => {
        if (!reportRef.current) return;
        setIsGenerating(true);
        try {
            const element = reportRef.current;
            const opt = {
                margin: 10,
                filename: `${type}_${data.biltyNumber || data.invoiceNumber || data.id}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            await html2pdf().set(opt).from(element).save();
        } catch (error) {
            console.error('PDF generation failed:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] print:hidden"
                    />
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        className="fixed inset-x-0 bottom-0 top-10 lg:inset-y-20 lg:inset-x-64 bg-white rounded-t-[40px] lg:rounded-[40px] shadow-2xl z-[110] overflow-hidden flex flex-col print:relative print:inset-0 print:m-0 print:p-0 print:shadow-none print:w-full"
                    >
                        {/* Header Actions */}
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0 print:hidden">
                            <div className="flex items-center gap-3">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", accentBg, accentColor)}>
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-900 tracking-tight">
                                        {isInvoice ? 'Tax Invoice' : (isDC ? 'Delivery Challan' : (isBilty ? 'Bilty / Consignment Note' : 'Goods Received Note'))}
                                    </h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        ID: {data.biltyNumber || data.invoiceNumber || data.id} • {data.date || (data.generatedAt ? new Date(data.generatedAt).toLocaleDateString() : new Date().toLocaleDateString())}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePrint}
                                    className="p-3 text-slate-400 hover:text-slate-900 transition-colors"
                                >
                                    <Printer size={20} />
                                </button>
                                <button
                                    disabled={isGenerating}
                                    onClick={handleDownload}
                                    className="p-3 text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-50"
                                >
                                    {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                                </button>
                                <button onClick={onClose} className="p-3 text-slate-400 hover:text-red-500 transition-colors ml-2">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Document Content */}
                        <div ref={reportRef} className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-10 custom-scrollbar print:overflow-visible print:p-0 bg-white">
                            {/* Branding & Top Info */}
                            <div className="flex flex-col lg:flex-row justify-between gap-8 pt-4">
                                <div className="space-y-4">
                                    <div className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-2">
                                        <div className="w-8 h-8 bg-black rounded-lg" />
                                        KrishiKart <span className="text-primary font-light">Supply Chain</span>
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest max-w-xs">
                                        Headquarters: B-204, Corporate Hub<br />
                                        Sector 62, Noida, UP - 201301<br />
                                        Certified Logistics & Distribution Node
                                    </div>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Issued</p>
                                    <p className="text-sm font-black text-slate-900">
                                        {data.date || (data.generatedAt ? new Date(data.generatedAt).toLocaleDateString() : new Date().toLocaleDateString())}
                                    </p>
                                    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black mt-4 uppercase border", accentBg, accentColor, accentBorder)}>
                                        {isInvoice ? 'Invoice Finalized' : (isDC ? 'Dispatched' : (isBilty ? 'Bilty Generated' : 'Audited & Received'))}
                                    </div>
                                </div>
                            </div>

                            {/* Bilty Specific: Package Count Badge */}
                            {isBilty && (
                                <div className="bg-amber-600 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between text-white shadow-lg shadow-amber-100 border-4 border-amber-500/20">
                                    <div className="flex items-center gap-6 mb-4 md:mb-0">
                                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                                            <Package size={32} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h3 className="text-4xl font-black tracking-tighter tabular-nums leading-none">{data.numberOfPackages || 0}</h3>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mt-1">Total Packages</p>
                                        </div>
                                    </div>
                                    <div className="h-12 w-px bg-white/20 hidden md:block mx-8" />
                                    <div className="flex-1 space-y-1">
                                        <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Consignment Number</p>
                                        <p className="text-lg font-black tracking-widest">{data.biltyNumber}</p>
                                    </div>
                                </div>
                            )}

                            {/* Node Info */}
                            <div className="grid lg:grid-cols-2 gap-6">
                                <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Truck size={14} className="text-slate-400" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            {isBilty ? 'Dispatch Node' : 'Source Node (Vendor)'}
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-black text-slate-900">{data.fromFranchise || data.vendor || 'KrishiKart Partner'}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Verified Processing Terminal</p>
                                </div>
                                <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                                    <div className="flex items-center gap-2 mb-4">
                                        <CheckCircle2 size={14} className="text-slate-400" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            {isBilty ? 'Consignee (Customer)' : 'Destination Node (Franchise)'}
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-black text-slate-900">{data.toCustomer || data.franchise || 'Main Center'}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{data.toAddress || data.destNode || 'Franchise Node'}</p>
                                </div>
                            </div>

                            {/* Delivery legs (Bilty Specific) */}
                            {isBilty && (
                                <div className="p-6 border border-slate-100 rounded-3xl space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Truck size={14} className="text-slate-400" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Logistics Partner</span>
                                    </div>
                                    <div className="grid md:grid-cols-3 gap-8">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Delivery Executive</p>
                                            <p className="text-xs font-black text-slate-900 uppercase">{data.deliveryPartner || 'Pending Assignment'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vehicle Reg. No.</p>
                                            <p className="text-xs font-black text-slate-900 uppercase">{data.vehicleNumber || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vehicle Type</p>
                                            <p className="text-xs font-black text-slate-900 uppercase">{data.vehicleType || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Items Table */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Consignment Manifest</h3>
                                <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                                <th className="px-6 py-4">Item Details</th>
                                                <th className="px-6 py-4 text-center">Quantity</th>
                                                {(!isBilty) && (
                                                    <>
                                                        <th className="px-6 py-4 text-right">Unit Price</th>
                                                        <th className="px-6 py-4 text-right">Total</th>
                                                    </>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {data.items.map((item, idx) => (
                                                <tr key={idx} className="text-sm font-bold text-slate-700 hover:bg-slate-50/50">
                                                    <td className="px-6 py-4">{item.name}</td>
                                                    <td className="px-6 py-4 text-center font-black text-slate-900">
                                                        {item.quantity || item.qty} {item.unit}
                                                    </td>
                                                    {(!isBilty) && (
                                                        <>
                                                            <td className="px-6 py-4 text-right text-slate-400 tabular-nums">
                                                                ₹{item.quotedPrice || item.price || '0.00'}
                                                            </td>
                                                            <td className="px-6 py-4 text-right font-black text-slate-900 tabular-nums">
                                                                ₹{((item.quantity || item.qty) * (item.quotedPrice || item.price || 0)).toLocaleString()}
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Signatures & Summary */}
                            <div className="grid lg:grid-cols-2 gap-12 pt-8">
                                <div className="space-y-6">
                                    {isBilty ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-4">
                                                <div className="h-32 border-2 border-dashed border-slate-200 rounded-3xl flex items-end justify-center pb-4 bg-slate-50/30">
                                                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Franchise Stamp / Sign</span>
                                                </div>
                                                <p className="text-[9px] font-bold text-slate-400 text-center uppercase tracking-widest">Authorized Dispatch</p>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="h-32 border-2 border-dashed border-slate-200 rounded-3xl flex items-end justify-center pb-4 bg-slate-50/30">
                                                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Partner Signature</span>
                                                </div>
                                                <p className="text-[9px] font-bold text-slate-400 text-center uppercase tracking-widest">Handover Acceptance</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-6 bg-slate-900 text-white rounded-[32px] space-y-4">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                <span>Certified Packaging WT</span>
                                                <span className="text-white">{data.totalWeight || data.weight || '0.00'} KG</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                <span>Digital Security Code</span>
                                                <span className="text-emerald-400">#{(data.biltyNumber || data.id)?.slice(-8).toUpperCase() || 'AUTH-SECURE'}</span>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed pt-2 border-t border-white/10">
                                                Terminal finalized at Distribution Center. Payload synchronized for logistics leg.
                                            </p>
                                        </div>
                                    )}
                                </div>
                                {!isBilty && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal</span>
                                            <span className="text-sm font-black text-slate-900">₹{data.items.reduce((acc, item) => acc + ((item.quantity || item.qty) * (item.quotedPrice || item.price || 0)), 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2">
                                            <span className="text-xs font-black text-slate-900 uppercase tracking-widest">
                                                Grand Total
                                            </span>
                                            <span className="text-xl font-black text-primary">
                                                ₹{data.items.reduce((acc, item) => acc + ((item.quantity || item.qty) * (item.quotedPrice || item.price || 0)), 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                {isBilty && (
                                    <div className="flex flex-col justify-end text-right">
                                        <div className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Verification Artifact</div>
                                        <div className="inline-block p-4 bg-slate-50 border border-slate-100 rounded-2xl w-fit ml-auto">
                                            <div className="w-20 h-20 bg-white border border-slate-100 rounded-lg flex items-center justify-center">
                                                <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center">
                                                    <Loader2 size={20} className="text-slate-200" />
                                                </div>
                                            </div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2">Digital Hash: {data.biltyNumber}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[8px] font-black text-slate-400 uppercase tracking-widest shrink-0">
                            <span>Certified Digital Document • {isBilty ? 'KrishiKart Logistics Manifest v2.0' : 'KrishiKart Supply Chain v2.0'}</span>
                            <span>{new Date().toLocaleString()}</span>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
