import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Save, Upload, X } from 'lucide-react';
import { useMemo, useState } from 'react';

const initialForm = {
    franchiseName: '',
    ownerName: '',
    mobile: '',
    email: '',
    area: '',
    city: '',
    state: '',
    aadhaarNumber: '',
    panNumber: '',
    aadhaarImage: null,
    panImage: null,
};

export default function FranchiseOnboardingDrawer({ isOpen, onClose, onSave }) {
    const [form, setForm] = useState(initialForm);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const canSubmit = useMemo(() => {
        return Boolean(form.franchiseName && form.ownerName && form.mobile && form.city && form.state);
    }, [form]);

    const setValue = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canSubmit || isSubmitting) return;

        const payload = new FormData();
        payload.append('franchiseName', form.franchiseName);
        payload.append('ownerName', form.ownerName);
        payload.append('mobile', form.mobile);
        payload.append('city', form.city);
        payload.append('state', form.state);
        if (form.email) payload.append('email', form.email);
        if (form.area) payload.append('area', form.area);
        if (form.aadhaarNumber) payload.append('aadhaarNumber', form.aadhaarNumber);
        if (form.panNumber) payload.append('panNumber', form.panNumber);
        if (form.aadhaarImage) payload.append('aadhaarImage', form.aadhaarImage);
        if (form.panImage) payload.append('panImage', form.panImage);

        setIsSubmitting(true);
        const created = await onSave(payload);
        setIsSubmitting(false);

        if (created) {
            setForm(initialForm);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex justify-end">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/40"
                />

                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 24, stiffness: 190 }}
                    className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col"
                >
                    <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-black text-slate-900">Onboard Franchise</h3>
                            <p className="text-xs text-slate-500">Create franchise account directly from admin panel.</p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded hover:bg-slate-100 text-slate-500">
                            <X size={18} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Franchise Name" value={form.franchiseName} onChange={(v) => setValue('franchiseName', v)} />
                            <Input label="Owner Name" value={form.ownerName} onChange={(v) => setValue('ownerName', v)} />
                            <Input label="Mobile" value={form.mobile} onChange={(v) => setValue('mobile', v.replace(/\D/g, '').slice(0, 10))} />
                            <Input label="Email (optional)" type="email" value={form.email} onChange={(v) => setValue('email', v)} />
                            <Input label="Area" value={form.area} onChange={(v) => setValue('area', v)} />
                            <Input label="City" value={form.city} onChange={(v) => setValue('city', v)} />
                            <Input label="State" value={form.state} onChange={(v) => setValue('state', v)} />
                        </div>

                        <div className="border border-slate-200 rounded p-4 space-y-4">
                            <p className="text-xs font-bold text-slate-800">KYC (optional)</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Aadhaar Number" value={form.aadhaarNumber} onChange={(v) => setValue('aadhaarNumber', v)} />
                                <Input label="PAN Number" value={form.panNumber} onChange={(v) => setValue('panNumber', v.toUpperCase())} />
                                <FileField label="Aadhaar Image" onChange={(f) => setValue('aadhaarImage', f)} file={form.aadhaarImage} />
                                <FileField label="PAN Image" onChange={(f) => setValue('panImage', f)} file={form.panImage} />
                            </div>
                        </div>
                    </form>

                    <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
                        <button onClick={onClose} type="button" className="px-4 py-2 text-xs font-bold border border-slate-300 rounded hover:bg-slate-50">Cancel</button>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={!canSubmit || isSubmitting}
                            className="px-4 py-2 text-xs font-bold rounded bg-slate-900 text-white disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Create Franchise
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

function Input({ label, value, onChange, type = 'text' }) {
    return (
        <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
            />
        </div>
    );
}

function FileField({ label, file, onChange }) {
    return (
        <label className="border border-dashed border-slate-300 rounded p-3 cursor-pointer hover:bg-slate-50">
            <div className="flex items-center gap-2 text-slate-700">
                <Upload size={14} />
                <span className="text-xs font-bold">{label}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 truncate">{file?.name || 'Upload file'}</p>
            <input
                type="file"
                className="hidden"
                accept="image/*,application/pdf"
                onChange={(e) => onChange(e.target.files?.[0] || null)}
            />
        </label>
    );
}
