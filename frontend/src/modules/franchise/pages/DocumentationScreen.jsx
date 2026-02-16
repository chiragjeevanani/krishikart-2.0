import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Upload,
    CheckCircle2,
    AlertCircle,
    CreditCard,
    User,
    Image as ImageIcon,
    X,
    Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function DocumentationScreen() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        aadhaarNumber: '',
        panNumber: '',
        aadhaarImage: null,
        panImage: null
    });

    const [previews, setPreviews] = useState({
        aadhaar: null,
        pan: null
    });

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size should be less than 5MB');
                return;
            }

            setFormData(prev => ({ ...prev, [`${type}Image`]: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews(prev => ({ ...prev, [type]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveFile = (type) => {
        setFormData(prev => ({ ...prev, [`${type}Image`]: null }));
        setPreviews(prev => ({ ...prev, [type]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic Validation
        if (!formData.aadhaarNumber || !formData.panNumber) {
            toast.error('Please fill in all identity numbers');
            return;
        }

        if (!formData.aadhaarImage || !formData.panImage) {
            toast.error('Please upload both document images');
            return;
        }

        setIsSubmitting(true);
        // Simulate API call
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            toast.success('Documentation submitted successfully for verification!');
        } catch (error) {
            toast.error('Failed to submit documentation. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <header className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                        <FileText size={20} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Node Documentation</h1>
                </div>
                <p className="text-slate-500 text-sm font-medium">
                    Verify your franchise identity by providing required legal documentation.
                </p>
            </header>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Aadhaar Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm group hover:border-slate-300 transition-all"
                >
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                        <User size={18} className="text-slate-900" />
                        <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">Aadhaar Card Verification</h2>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Aadhaar Number</label>
                            <input
                                type="text"
                                placeholder="1234 5678 9012"
                                value={formData.aadhaarNumber}
                                onChange={(e) => setFormData(prev => ({ ...prev, aadhaarNumber: e.target.value }))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">National ID Image</label>
                            <div className={cn(
                                "relative aspect-[1.6/1] border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all overflow-hidden",
                                previews.aadhaar ? "border-slate-900" : "border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-400"
                            )}>
                                {previews.aadhaar ? (
                                    <>
                                        <img src={previews.aadhaar} alt="Aadhaar Preview" className="absolute inset-0 w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFile('aadhaar')}
                                                className="p-2 bg-white text-rose-600 rounded-full shadow-lg hover:scale-110 transition-transform"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-6 text-center">
                                        <div className="w-12 h-12 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 text-slate-400 group-hover:text-slate-900 transition-colors">
                                            <Upload size={20} />
                                        </div>
                                        <span className="text-sm font-bold text-slate-900 mb-1">Upload Aadhaar Front/Back</span>
                                        <span className="text-[10px] text-slate-400 font-medium font-mono uppercase">PDF, JPG or PNG (Max 5MB)</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*,.pdf"
                                            onChange={(e) => handleFileChange(e, 'aadhaar')}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* PAN Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm group hover:border-slate-300 transition-all"
                >
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                        <CreditCard size={18} className="text-slate-900" />
                        <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">Permanent Account Number (PAN)</h2>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">PAN Card Number</label>
                            <input
                                type="text"
                                placeholder="ABCDE1234F"
                                value={formData.panNumber}
                                onChange={(e) => setFormData(prev => ({ ...prev, panNumber: e.target.value.toUpperCase() }))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all uppercase"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">PAN Card Image</label>
                            <div className={cn(
                                "relative aspect-[1.6/1] border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all overflow-hidden",
                                previews.pan ? "border-slate-900" : "border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-400"
                            )}>
                                {previews.pan ? (
                                    <>
                                        <img src={previews.pan} alt="PAN Preview" className="absolute inset-0 w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFile('pan')}
                                                className="p-2 bg-white text-rose-600 rounded-full shadow-lg hover:scale-110 transition-transform"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-6 text-center">
                                        <div className="w-12 h-12 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 text-slate-400 group-hover:text-slate-900 transition-colors">
                                            <Upload size={20} />
                                        </div>
                                        <span className="text-sm font-bold text-slate-900 mb-1">Upload PAN Card Image</span>
                                        <span className="text-[10px] text-slate-400 font-medium font-mono uppercase">PDF, JPG or PNG (Max 5MB)</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*,.pdf"
                                            onChange={(e) => handleFileChange(e, 'pan')}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Footer Info & Action */}
                <div className="lg:col-span-2 space-y-6 pt-4">
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex gap-4">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                            <Info size={20} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-[11px] font-black text-emerald-900 uppercase tracking-widest">Verification Protocol</h4>
                            <p className="text-xs text-emerald-800/80 font-medium leading-relaxed">
                                Our KYC engine will verify these documents within 24-48 business hours. Ensure images are clear and numbers match the visual proof for rapid node activation.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 py-6 border-t border-slate-100">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Legal Finality</span>
                            <span className="text-[11px] font-bold text-slate-900">Mandatory for Node Settlement</span>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={cn(
                                "px-8 py-4 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all hover:scale-105 active:scale-95 disabled:bg-slate-300 disabled:shadow-none flex items-center gap-3",
                                isSubmitting && "animate-pulse"
                            )}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Synchronizing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={16} />
                                    Transmit Documentation
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
