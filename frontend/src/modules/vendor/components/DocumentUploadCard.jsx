import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    FileText,
    CheckCircle2,
    AlertCircle,
    Clock,
    X,
    Loader2,
    Eye,
    Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DocumentUploadCard({ title, icon: Icon, status: initialStatus, fileName: initialFileName, uploadDate: initialUploadDate }) {
    const [status, setStatus] = useState(initialStatus || 'not_uploaded');
    const [fileName, setFileName] = useState(initialFileName || null);
    const [uploadDate, setUploadDate] = useState(initialUploadDate || null);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleUpload = () => {
        setIsUploading(true);
        setProgress(0);

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setIsUploading(false);
                        setStatus('pending');
                        setFileName('selected_document.pdf');
                        setUploadDate(new Date().toISOString().split('T')[0]);
                    }, 500);
                    return 100;
                }
                return prev + 10;
            });
        }, 200);
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        setStatus('not_uploaded');
        setFileName(null);
        setUploadDate(null);
    };

    const StatusBadge = () => {
        switch (status) {
            case 'verified':
                return <span className="flex items-center gap-1 text-[8px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-tighter"><CheckCircle2 size={10} /> Verified</span>;
            case 'pending':
                return <span className="flex items-center gap-1 text-[8px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-tighter"><Clock size={10} /> Pending</span>;
            case 'expiring_soon':
                return <span className="flex items-center gap-1 text-[8px] font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md uppercase tracking-tighter"><AlertCircle size={10} /> Expiring</span>;
            default:
                return <span className="flex items-center gap-1 text-[8px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md uppercase tracking-tighter">Not Uploaded</span>;
        }
    };

    return (
        <div className={cn(
            "bg-white p-5 rounded-[32px] border transition-all relative overflow-hidden group",
            status === 'not_uploaded' ? "border-slate-100 hover:border-primary/20" : "border-slate-100 shadow-sm"
        )}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                        status === 'not_uploaded' ? "bg-slate-50 text-slate-400" : "bg-slate-900 text-white"
                    )}>
                        <Icon size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-slate-900 tracking-tight">{title}</h4>
                        <StatusBadge />
                    </div>
                </div>

                <AnimatePresence>
                    {status !== 'not_uploaded' && !isUploading && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-2"
                        >
                            <button className="p-2 text-slate-400 hover:text-primary transition-colors bg-slate-50 rounded-lg">
                                <Eye size={14} />
                            </button>
                            <button onClick={handleRemove} className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 rounded-lg">
                                <Trash2 size={14} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {isUploading ? (
                <div className="space-y-3 py-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                        <span className="flex items-center gap-2"><Loader2 size={12} className="animate-spin" /> Uploading...</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            ) : status === 'not_uploaded' ? (
                <button
                    onClick={handleUpload}
                    className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-primary/30 hover:bg-primary/[0.02] transition-all group/btn"
                >
                    <Upload size={18} className="text-slate-300 group-hover/btn:text-primary transition-colors" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover/btn:text-primary transition-colors">Select & Upload File</span>
                </button>
            ) : (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                    <div className="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-primary">
                        <FileText size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-slate-900 truncate">{fileName}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase">Uploaded on {uploadDate}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
