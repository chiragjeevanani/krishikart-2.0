import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Save, Upload, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getGstParts, isValidGst, normalizeGstInput } from '@/modules/franchise/utils/gstin';

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
    fssaiNumber: '',
    gstNumber: '',
    aadhaarImage: null,
    panImage: null,
    fssaiCertificate: null,
    shopEstablishmentCertificate: null,
    gstCertificate: null,
};

export default function FranchiseOnboardingDrawer({ isOpen, onClose, onSave }) {
    const [form, setForm] = useState(initialForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const gstParts = getGstParts(form.gstNumber);

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
        const aadhaarDigits = String(form.aadhaarNumber || '').replace(/\D/g, '');
        if (aadhaarDigits) {
            if (aadhaarDigits.length !== 12) {
                alert('Aadhaar number must be exactly 12 digits.');
                return;
            }
            payload.append('aadhaarNumber', aadhaarDigits);
        }
        if (form.panNumber) payload.append('panNumber', form.panNumber);
        const fssaiDigits = String(form.fssaiNumber || '').replace(/\D/g, '');
        if (fssaiDigits) {
            if (fssaiDigits.length !== 14) {
                alert('FSSAI number must be exactly 14 digits (digits only).');
                return;
            }
            payload.append('fssaiNumber', fssaiDigits);
        }
        if (form.gstNumber) {
            if (!isValidGst(form.gstNumber)) {
                alert(
                    'GSTIN must be a 15-character alphanumeric string (e.g. 22AAAAA0000A1Z5).',
                );
                return;
            }
            payload.append('gstNumber', form.gstNumber);
        }
        if (form.aadhaarImage) payload.append('aadhaarImage', form.aadhaarImage);
        if (form.panImage) payload.append('panImage', form.panImage);
        if (form.fssaiCertificate) payload.append('fssaiCertificate', form.fssaiCertificate);
        if (form.shopEstablishmentCertificate) {
            payload.append('shopEstablishmentCertificate', form.shopEstablishmentCertificate);
        }
        if (form.gstCertificate) payload.append('gstCertificate', form.gstCertificate);

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
                    className="relative w-full max-w-3xl bg-white h-full shadow-2xl flex flex-col min-h-0"
                >
                    <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
                        <div>
                            <h3 className="text-lg font-black text-slate-900">Onboard Franchise</h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Node details plus the same KYC fields as the franchise Documentation page (Aadhaar, PAN,
                                FSSAI, shop establishment, GST).
                            </p>
                        </div>
                        <button type="button" onClick={onClose} className="p-2 rounded hover:bg-slate-100 text-slate-500">
                            <X size={18} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                    Node profile
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input label="Franchise Name" value={form.franchiseName} onChange={(v) => setValue('franchiseName', v)} />
                                    <Input label="Owner Name" value={form.ownerName} onChange={(v) => setValue('ownerName', v)} />
                                    <Input label="Mobile" value={form.mobile} onChange={(v) => setValue('mobile', v.replace(/\D/g, '').slice(0, 10))} />
                                    <Input label="Email (optional)" type="email" value={form.email} onChange={(v) => setValue('email', v)} />
                                    <Input label="Area" value={form.area} onChange={(v) => setValue('area', v)} />
                                    <Input label="City" value={form.city} onChange={(v) => setValue('city', v)} />
                                    <Input label="State" value={form.state} onChange={(v) => setValue('state', v)} />
                                </div>
                            </div>

                            <div className="border border-slate-200 rounded-lg p-4 space-y-5 bg-slate-50/40">
                                <div>
                                    <p className="text-xs font-black text-slate-900">Identity (Aadhaar &amp; PAN)</p>
                                    <p className="text-[11px] text-slate-500 mt-1">Numbers and document uploads (optional if you will collect later).</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Input
                                            label="Aadhaar Number (12 digits)"
                                            type="tel"
                                            inputMode="numeric"
                                            maxLength={12}
                                            placeholder="123456789012"
                                            value={form.aadhaarNumber}
                                            onChange={(v) => setValue('aadhaarNumber', v.replace(/\D/g, '').slice(0, 12))}
                                        />
                                        <p className="text-[10px] text-slate-500 mt-1">
                                            {form.aadhaarNumber.length}/12 digits
                                        </p>
                                    </div>
                                    <Input label="PAN Number" value={form.panNumber} onChange={(v) => setValue('panNumber', v.toUpperCase())} />
                                    <FileField label="Aadhaar image / PDF" onChange={(f) => setValue('aadhaarImage', f)} file={form.aadhaarImage} />
                                    <FileField label="PAN image / PDF" onChange={(f) => setValue('panImage', f)} file={form.panImage} />
                                </div>
                            </div>

                            <div className="border border-slate-200 rounded-lg p-4 space-y-5 bg-slate-50/40">
                                <div>
                                    <p className="text-xs font-black text-slate-900">Business &amp; compliance</p>
                                    <p className="text-[11px] text-slate-500 mt-1">
                                        FSSAI licence, shop establishment certificate, and GST number + GST certificate — same as franchise self-service documentation.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        label="FSSAI number (14 digits)"
                                        type="tel"
                                        inputMode="numeric"
                                        maxLength={14}
                                        placeholder="12345678901234"
                                        value={form.fssaiNumber}
                                        onChange={(v) => setValue('fssaiNumber', v.replace(/\D/g, '').slice(0, 14))}
                                    />
                                    <div>
                                        <Input
                                            label="GSTIN (15-digit Alphanumeric)"
                                            type="text"
                                            maxLength={15}
                                            placeholder="22AAAAA0000A1Z5"
                                            value={form.gstNumber}
                                            onChange={(v) => setValue('gstNumber', normalizeGstInput(v))}
                                        />
                                        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">
                                            Progress: {form.gstNumber.length}/15 chars
                                        </p>
                                    </div>
                                    <FileField label="FSSAI certificate" onChange={(f) => setValue('fssaiCertificate', f)} file={form.fssaiCertificate} />
                                    <FileField label="Shop establishment certificate" onChange={(f) => setValue('shopEstablishmentCertificate', f)} file={form.shopEstablishmentCertificate} />
                                    <FileField label="GST certificate" onChange={(f) => setValue('gstCertificate', f)} file={form.gstCertificate} />
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0 bg-white">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold border border-slate-300 rounded hover:bg-slate-50">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!canSubmit || isSubmitting}
                                className="px-4 py-2 text-xs font-bold rounded bg-slate-900 text-white disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                Create Franchise
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

function Input({ label, value, onChange, type = 'text', inputMode, maxLength, placeholder }) {
    return (
        <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">{label}</label>
            <input
                type={type}
                inputMode={inputMode}
                maxLength={maxLength}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
            />
        </div>
    );
}

function FileField({ label, file, onChange }) {
    return (
        <label className="border border-dashed border-slate-300 rounded p-3 cursor-pointer hover:bg-white bg-white block min-h-[88px]">
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
