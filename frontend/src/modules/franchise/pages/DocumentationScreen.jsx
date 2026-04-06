import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Upload,
    CheckCircle2,
    CreditCard,
    User,
    X,
    Info,
    UtensilsCrossed,
    Store,
    Landmark,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useFranchiseAuth } from '../contexts/FranchiseAuthContext';
import api from '@/lib/axios';
import {
    countGst14Parts,
    isValidFssai,
    isValidGst14,
    isValidPan,
    normalizeFssaiInput,
    normalizeGst14Input,
    normalizePanInput,
} from '../utils/gstin14';

const FILE_FIELDS = {
    aadhaar: { formKey: 'aadhaarImage', previewKey: 'aadhaar' },
    pan: { formKey: 'panImage', previewKey: 'pan' },
    fssai: { formKey: 'fssaiCertificate', previewKey: 'fssai' },
    shopEstablishment: { formKey: 'shopEstablishmentCertificate', previewKey: 'shopEstablishment' },
    gst: { formKey: 'gstCertificate', previewKey: 'gst' },
};

function DocUploadZone({
    preview,
    onPick,
    onRemove,
    disabled,
    title,
    subtitle,
    inputId,
    error,
}) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">
                {title}
            </label>
            <div
                className={cn(
                    'relative aspect-[1.6/1] border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all overflow-hidden group/upload',
                    preview
                        ? 'border-slate-900'
                        : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-400',
                )}
            >
                {preview ? (
                    <>
                        <img
                            src={preview}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={onRemove}
                                className="p-2 bg-white text-rose-600 rounded-full shadow-lg hover:scale-110 transition-transform"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </>
                ) : (
                    <label
                        htmlFor={inputId}
                        className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-6 text-center"
                    >
                        <div className="w-12 h-12 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 text-slate-400 group-hover/upload:text-slate-900 transition-colors">
                            <Upload size={20} />
                        </div>
                        <span className="text-sm font-bold text-slate-900 mb-1">{subtitle}</span>
                        <span className="text-[10px] text-slate-400 font-medium font-mono uppercase">
                            PDF, JPG or PNG (Max 5MB)
                        </span>
                        <input
                            id={inputId}
                            type="file"
                            className="hidden"
                            accept="image/*,.pdf"
                            disabled={disabled}
                            onChange={onPick}
                        />
                    </label>
                )}
            </div>
            {error ? <p className="text-[11px] font-medium text-rose-600">{error}</p> : null}
        </div>
    );
}

export default function DocumentationScreen() {
    const { franchise } = useFranchiseAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        aadhaarNumber: franchise?.kyc?.aadhaarNumber || '',
        panNumber: normalizePanInput(franchise?.kyc?.panNumber || ''),
        fssaiNumber: normalizeFssaiInput(franchise?.kyc?.fssaiNumber || ''),
        gstNumber: normalizeGst14Input(franchise?.kyc?.gstNumber || ''),
        aadhaarImage: null,
        panImage: null,
        fssaiCertificate: null,
        shopEstablishmentCertificate: null,
        gstCertificate: null,
    });

    const [previews, setPreviews] = useState({
        aadhaar: franchise?.kyc?.aadhaarImage || null,
        pan: franchise?.kyc?.panImage || null,
        fssai: franchise?.kyc?.fssaiCertificate || null,
        shopEstablishment: franchise?.kyc?.shopEstablishmentCertificate || null,
        gst: franchise?.kyc?.gstCertificate || null,
    });
    const [errors, setErrors] = useState({});

    const isVerified = franchise?.kyc?.status === 'verified';
    const isPending = franchise?.kyc?.status === 'pending';
    const franchiseAccountPending = franchise && !franchise.isVerified;
    const readOnly = isVerified || isPending;
    const gstParts = countGst14Parts(formData.gstNumber);

    const validateForm = () => {
        const nextErrors = {};
        const aadhaarNumber = formData.aadhaarNumber.trim();
        const panNumber = normalizePanInput(formData.panNumber);
        const fssaiDigits = normalizeFssaiInput(formData.fssaiNumber);
        const gstNumber = normalizeGst14Input(formData.gstNumber);

        if (!aadhaarNumber) {
            nextErrors.aadhaarNumber = 'Enter the Aadhaar number shown on the card.';
        }

        if (!panNumber) {
            nextErrors.panNumber = 'Enter your PAN card number.';
        } else if (!isValidPan(panNumber)) {
            nextErrors.panNumber = 'Enter a valid PAN in this format: ABCDE1234F.';
        }

        if (!fssaiDigits) {
            nextErrors.fssaiNumber = 'Enter your 14-digit FSSAI license number.';
        } else if (!isValidFssai(fssaiDigits)) {
            nextErrors.fssaiNumber = 'FSSAI number must contain exactly 14 digits.';
        }

        if (!gstNumber) {
            nextErrors.gstNumber = 'Enter your 15-character GST number.';
        } else if (!isValidGst14(gstNumber)) {
            nextErrors.gstNumber = 'Enter a valid GST number like 27ABCDE1234F1Z5.';
        }

        if (!formData.aadhaarImage && !previews.aadhaar) {
            nextErrors.aadhaarImage = 'Upload a clear Aadhaar image.';
        }
        if (!formData.panImage && !previews.pan) {
            nextErrors.panImage = 'Upload a clear PAN card image.';
        }
        if (!formData.fssaiCertificate && !previews.fssai) {
            nextErrors.fssaiCertificate = 'Upload your FSSAI certificate.';
        }
        if (!formData.shopEstablishmentCertificate && !previews.shopEstablishment) {
            nextErrors.shopEstablishmentCertificate = 'Upload your shop establishment certificate.';
        }
        if (!formData.gstCertificate && !previews.gst) {
            nextErrors.gstCertificate = 'Upload your GST certificate.';
        }

        return {
            nextErrors,
            normalizedValues: {
                aadhaarNumber,
                panNumber,
                fssaiDigits,
                gstNumber,
            },
        };
    };

    const handleFieldChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => {
            if (!prev[field]) return prev;
            const updated = { ...prev };
            delete updated[field];
            return updated;
        });
    };

    const handleFileChange = (e, fieldId) => {
        if (readOnly) return;
        const { formKey, previewKey } = FILE_FIELDS[fieldId];
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size should be less than 5MB');
                return;
            }
            setFormData((prev) => ({ ...prev, [formKey]: file }));
            setErrors((prev) => {
                if (!prev[formKey]) return prev;
                const updated = { ...prev };
                delete updated[formKey];
                return updated;
            });
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews((prev) => ({ ...prev, [previewKey]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleRemoveFile = (fieldId) => {
        if (readOnly) return;
        const { formKey, previewKey } = FILE_FIELDS[fieldId];
        setFormData((prev) => ({ ...prev, [formKey]: null }));
        setPreviews((prev) => ({ ...prev, [previewKey]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (readOnly) return;

        const { nextErrors, normalizedValues } = validateForm();
        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            toast.error('Please correct the highlighted document details.');
            return;
        }

        setErrors({});
        setIsSubmitting(true);
        try {
            const data = new FormData();
            data.append('aadhaarNumber', normalizedValues.aadhaarNumber);
            data.append('panNumber', normalizedValues.panNumber);
            data.append('fssaiNumber', normalizedValues.fssaiDigits);
            data.append('gstNumber', normalizedValues.gstNumber);
            if (formData.aadhaarImage) data.append('aadhaarImage', formData.aadhaarImage);
            if (formData.panImage) data.append('panImage', formData.panImage);
            if (formData.fssaiCertificate) data.append('fssaiCertificate', formData.fssaiCertificate);
            if (formData.shopEstablishmentCertificate) {
                data.append('shopEstablishmentCertificate', formData.shopEstablishmentCertificate);
            }
            if (formData.gstCertificate) data.append('gstCertificate', formData.gstCertificate);

            const response = await api.post('/franchise/kyc/submit', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.success) {
                toast.success('Documentation submitted successfully for verification!');
                window.location.reload();
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to submit documentation');
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
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                        Node Documentation
                    </h1>
                </div>
                <p className="text-slate-500 text-sm font-medium">
                    Verify your franchise identity by providing required legal documentation.
                </p>
            </header>

            {franchiseAccountPending && (
                <div
                    role="status"
                    className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950"
                >
                    <Info className="shrink-0 mt-0.5" size={18} aria-hidden />
                    <div className="space-y-1 text-sm">
                        <p className="font-bold">Franchise approval pending</p>
                        <p className="text-amber-900/90 leading-relaxed">
                            Your franchise account is not verified by admin yet. Until then, only this page is
                            available. After approval, all dashboard sections will unlock automatically.
                        </p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm group hover:border-slate-300 transition-all"
                >
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                        <User size={18} className="text-slate-900" />
                        <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                            Aadhaar Card Verification
                        </h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">
                                Aadhaar Number
                            </label>
                            <input
                                type="text"
                                placeholder="1234 5678 9012"
                                value={formData.aadhaarNumber}
                                readOnly={readOnly}
                                onChange={(e) => handleFieldChange('aadhaarNumber', e.target.value)}
                                className={cn(
                                    'w-full bg-slate-50 border rounded-lg px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all disabled:opacity-50',
                                    errors.aadhaarNumber ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200',
                                )}
                            />
                            {errors.aadhaarNumber ? (
                                <p className="text-[11px] font-medium text-rose-600">{errors.aadhaarNumber}</p>
                            ) : (
                                <p className="text-[10px] text-slate-400 font-medium mt-1">
                                    Enter the same Aadhaar number shown on the uploaded document.
                                </p>
                            )}
                        </div>
                        <DocUploadZone
                            preview={previews.aadhaar}
                            disabled={readOnly}
                            title="National ID Image"
                            subtitle="Upload Aadhaar Front/Back"
                            inputId="doc-aadhaar"
                            error={errors.aadhaarImage}
                            onPick={(e) => handleFileChange(e, 'aadhaar')}
                            onRemove={() => handleRemoveFile('aadhaar')}
                        />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm group hover:border-slate-300 transition-all"
                >
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                        <CreditCard size={18} className="text-slate-900" />
                        <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                            Permanent Account Number (PAN)
                        </h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">
                                PAN Card Number
                            </label>
                            <input
                                type="text"
                                placeholder="ABCDE1234F"
                                value={formData.panNumber}
                                readOnly={readOnly}
                                maxLength={10}
                                onChange={(e) => handleFieldChange('panNumber', normalizePanInput(e.target.value))}
                                className={cn(
                                    'w-full bg-slate-50 border rounded-lg px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all uppercase disabled:opacity-50',
                                    errors.panNumber ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200',
                                )}
                            />
                            {errors.panNumber ? (
                                <p className="text-[11px] font-medium text-rose-600">{errors.panNumber}</p>
                            ) : (
                                <p className="text-[10px] text-slate-400 font-medium mt-1">
                                    Use your PAN in this format: AAAAA9999A
                                </p>
                            )}
                        </div>
                        <DocUploadZone
                            preview={previews.pan}
                            disabled={readOnly}
                            title="PAN Card Image"
                            subtitle="Upload PAN Card Image"
                            inputId="doc-pan"
                            error={errors.panImage}
                            onPick={(e) => handleFileChange(e, 'pan')}
                            onRemove={() => handleRemoveFile('pan')}
                        />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm group hover:border-slate-300 transition-all"
                >
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                        <UtensilsCrossed size={18} className="text-slate-900" />
                        <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                            FSSAI License
                        </h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">
                                FSSAI Number
                            </label>
                            <input
                                type="tel"
                                inputMode="numeric"
                                autoComplete="off"
                                placeholder="12345678901234"
                                maxLength={14}
                                pattern="\d{14}"
                                title="14 digits only"
                                value={formData.fssaiNumber}
                                readOnly={readOnly}
                                onChange={(e) => handleFieldChange('fssaiNumber', normalizeFssaiInput(e.target.value))}
                                className={cn(
                                    'w-full bg-slate-50 border rounded-lg px-4 py-3 text-sm font-bold tracking-widest focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all disabled:opacity-50',
                                    errors.fssaiNumber ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200',
                                )}
                            />
                            {errors.fssaiNumber ? (
                                <p className="text-[11px] font-medium text-rose-600">{errors.fssaiNumber}</p>
                            ) : (
                                <p className="text-[10px] text-slate-400 font-medium mt-1">
                                    {formData.fssaiNumber.length}/14 digits entered
                                </p>
                            )}
                        </div>
                        <DocUploadZone
                            preview={previews.fssai}
                            disabled={readOnly}
                            title="FSSAI Certificate"
                            subtitle="Upload FSSAI license / certificate"
                            inputId="doc-fssai"
                            error={errors.fssaiCertificate}
                            onPick={(e) => handleFileChange(e, 'fssai')}
                            onRemove={() => handleRemoveFile('fssai')}
                        />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm group hover:border-slate-300 transition-all"
                >
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                        <Landmark size={18} className="text-slate-900" />
                        <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">GST</h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">
                                GST Number
                            </label>
                            <input
                                type="text"
                                inputMode="text"
                                autoComplete="off"
                                placeholder="27ABCDE1234F1Z5"
                                maxLength={15}
                                title="Valid GSTIN format: 2 digits + PAN + entity code + Z + checksum"
                                value={formData.gstNumber}
                                readOnly={readOnly}
                                onChange={(e) => handleFieldChange('gstNumber', normalizeGst14Input(e.target.value))}
                                className={cn(
                                    'w-full bg-slate-50 border rounded-lg px-4 py-3 text-sm font-bold tracking-wide focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all disabled:opacity-50 font-mono',
                                    errors.gstNumber ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200',
                                )}
                            />
                            {errors.gstNumber ? (
                                <p className="text-[11px] font-medium text-rose-600">{errors.gstNumber}</p>
                            ) : (
                                <>
                                    <p className="text-[10px] text-slate-400 font-medium mt-1">
                                        Format: state code + PAN + entity code + Z + checksum
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-medium">
                                        Letters {gstParts.letters} · Digits {gstParts.digits}
                                    </p>
                                </>
                            )}
                        </div>
                        <DocUploadZone
                            preview={previews.gst}
                            disabled={readOnly}
                            title="GST Certificate"
                            subtitle="Upload GST registration certificate"
                            inputId="doc-gst"
                            error={errors.gstCertificate}
                            onPick={(e) => handleFileChange(e, 'gst')}
                            onRemove={() => handleRemoveFile('gst')}
                        />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.14 }}
                    className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm group hover:border-slate-300 transition-all"
                >
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                        <Store size={18} className="text-slate-900" />
                        <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                            Shop Establishment Certificate
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="max-w-xl">
                            <DocUploadZone
                                preview={previews.shopEstablishment}
                                disabled={readOnly}
                                title="Certificate Upload"
                                subtitle="Upload shop / establishment proof (Shop Act, Udyam, etc.)"
                                inputId="doc-shop"
                                error={errors.shopEstablishmentCertificate}
                                onPick={(e) => handleFileChange(e, 'shopEstablishment')}
                                onRemove={() => handleRemoveFile('shopEstablishment')}
                            />
                        </div>
                    </div>
                </motion.div>

                <div className="lg:col-span-2 space-y-6 pt-4">
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex gap-4">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                            <Info size={20} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-[11px] font-black text-emerald-900 uppercase tracking-widest">
                                Verification Protocol
                            </h4>
                            <p className="text-xs text-emerald-800/80 font-medium leading-relaxed">
                                Our KYC team will verify these documents within 24-48 business hours. Ensure images
                                are clear and numbers match the uploaded certificates for faster activation.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 py-6 border-t border-slate-100">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Legal Finality
                            </span>
                            <span className="text-[11px] font-bold text-slate-900">Mandatory for Node Settlement</span>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || readOnly}
                            className={cn(
                                'px-8 py-4 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all hover:scale-105 active:scale-95 disabled:bg-slate-300 disabled:shadow-none flex items-center gap-3',
                                isSubmitting && 'animate-pulse',
                                isVerified && 'bg-emerald-600 shadow-emerald-100',
                            )}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Synchronizing...
                                </>
                            ) : isVerified ? (
                                <>
                                    <CheckCircle2 size={16} />
                                    Account Verified
                                </>
                            ) : isPending ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Verification Pending
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
