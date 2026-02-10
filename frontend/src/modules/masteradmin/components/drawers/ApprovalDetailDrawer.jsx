import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, XCircle, FileText, Calendar, Building, User, Mail, Phone, MapPin, ExternalLink, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function ApprovalDetailDrawer({ isOpen, onClose, item, type, onApprove, onReject }) {
    const isVendor = type === 'vendor';
    const isFranchise = type === 'franchise';
    const isCredit = type === 'credit';
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen || !item) return null;

    const handleAction = (action) => {
        setIsProcessing(true);
        setTimeout(() => {
            if (action === 'approve') onApprove(item);
            else onReject(item);
            setIsProcessing(false);
            onClose();
        }, 1500);
    };

    const documents = isVendor ? item.documents :
        isFranchise ? Object.entries(item.checklist).map(([key, val]) => ({ type: key, ...val })) :
            item.supportingDocs;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex justify-end overflow-hidden">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="relative w-full max-w-4xl bg-[#f8fafd] h-full shadow-2xl flex flex-col"
                >
                    {/* Header */}
                    <div className="bg-white p-8 border-b border-slate-100 sticky top-0 z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className={cn(
                                    "w-16 h-16 rounded-[24px] flex items-center justify-center shadow-inner",
                                    isVendor ? "bg-emerald-50 text-emerald-500" :
                                        isFranchise ? "bg-blue-50 text-blue-500" : "bg-purple-50 text-purple-500"
                                )}>
                                    {isVendor ? <User size={32} /> : isFranchise ? <Building size={32} /> : <ShieldCheck size={32} />}
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">
                                        {item.vendorName || item.franchiseName || item.hotelName}
                                    </h3>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-lg uppercase tracking-widest border border-slate-200">
                                            {item.id}
                                        </span>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <Calendar size={14} className="text-slate-300" />
                                            Submitted {new Date(item.submittedAt || item.requestedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all active:scale-95"
                            >
                                <X size={28} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto no-scrollbar p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Detailed Information */}
                            <div className="lg:col-span-7 space-y-8">
                                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-8">Verification Dossier</h4>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-4 p-4 rounded-3xl bg-slate-50/50">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <User size={12} /> Contact Primary
                                            </div>
                                            <p className="font-black text-slate-900">Arjun Singh</p>
                                        </div>
                                        <div className="space-y-4 p-4 rounded-3xl bg-slate-50/50">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <Phone size={12} /> Communication
                                            </div>
                                            <p className="font-black text-slate-900">+91 98765 43210</p>
                                        </div>
                                        <div className="space-y-4 p-4 rounded-3xl bg-slate-50/50">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <Mail size={12} /> Credentials
                                            </div>
                                            <p className="font-black text-slate-900 truncate">verification@krishikart.com</p>
                                        </div>
                                        {isCredit ? (
                                            <div className="space-y-4 p-4 rounded-3xl bg-slate-900 text-white">
                                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    Requested Limit
                                                </div>
                                                <p className="text-2xl font-black italic">₹{item.requestedLimit.toLocaleString()}</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 p-4 rounded-3xl bg-slate-50/50">
                                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    <MapPin size={12} /> Operations Hub
                                                </div>
                                                <p className="font-black text-slate-900">Benguluru Central</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-8 p-6 bg-amber-50 rounded-[32px] border border-amber-100 flex items-start gap-4">
                                        <AlertCircle className="text-amber-500 shrink-0 mt-1" size={20} />
                                        <div>
                                            <p className="text-xs font-black text-amber-900 uppercase tracking-tight">Compliance Note</p>
                                            <p className="text-sm text-amber-800/80 font-medium mt-1">
                                                Self-reported data matches existing network patterns. Ensure physical verification is completed by the regional manager before final activation.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Details based on type */}
                                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-6">Business Profile</h4>
                                    <div className="space-y-4">
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                            This entity has been active in the regional supply chain for 3+ years. They speciallize in high-volume perishable procurement and have maintained a 95% delivery score on external platforms.
                                        </p>
                                        <div className="pt-4 border-t border-slate-50 flex gap-4">
                                            <span className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-500 uppercase">Tier 1 Partner</span>
                                            <span className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-500 uppercase">Verified Address</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Document & Checklist Section */}
                            <div className="lg:col-span-5 space-y-8">
                                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm overflow-hidden relative group">
                                    <div className="relative z-10">
                                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-2">
                                            <FileText size={18} className="text-primary" />
                                            Document Vault
                                        </h4>
                                        <div className="space-y-4">
                                            {documents.map((doc, idx) => (
                                                <div key={idx} className="p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all group/doc cursor-pointer">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover/doc:text-primary transition-colors shadow-sm">
                                                                <FileText size={20} />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-black text-slate-900 uppercase tracking-tight">
                                                                    {(doc.type || 'Document').replace('_', ' ')}
                                                                </p>
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                                                                    {isVendor ? doc.fileName : doc.submitted ? 'Verified File' : 'Missing File'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-300 hover:text-primary hover:border-primary transition-all shadow-sm">
                                                                <ExternalLink size={14} />
                                                            </button>
                                                            <button className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all">
                                                                <Download size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                                </div>

                                <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                                    <div className="relative z-10 flex flex-col items-center text-center">
                                        <div className="w-16 h-16 bg-white/10 rounded-[20px] flex items-center justify-center mb-6">
                                            <CheckCircle2 size={32} className="text-primary" />
                                        </div>
                                        <h4 className="text-xl font-black italic uppercase">Final Approval</h4>
                                        <p className="text-xs text-white/40 font-medium mt-2 leading-relaxed max-w-[200px]">
                                            By approving, you grant full network access to this entity.
                                        </p>
                                        <div className="w-full h-px bg-white/10 my-8" />
                                        <div className="grid grid-cols-1 w-full gap-4">
                                            <button
                                                onClick={() => handleAction('approve')}
                                                disabled={isProcessing}
                                                className="w-full py-5 bg-primary text-white rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                                            >
                                                {isProcessing ? (
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        <ShieldCheck size={18} />
                                                        Verify Entry
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleAction('reject')}
                                                disabled={isProcessing}
                                                className="w-full py-4 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] hover:text-red-400 transition-colors"
                                            >
                                                Reject Application
                                            </button>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -ml-24 -mb-24" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
