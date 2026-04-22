import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sprout, Mail, Lock, Loader2, ArrowRight, User, Phone, MapPin, FileText, CreditCard, Building2 } from 'lucide-react';
import api from '../../../lib/axios';

export default function SignupScreen() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        mobile: '',
        password: '',
        farmCity: '',
        farmState: '',
        fssaiLicense: '',
        bankAccountHolderName: '',
        bankAccountNumber: '',
        bankIfscCode: '',
        bankName: '',
        aadharFile: null,
        panFile: null,
        shopProofFile: null,
    });

    const fileInputRefs = {
        aadhar: useRef(null),
        pan: useRef(null),
        shopProof: useRef(null),
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setFormData({ ...formData, [name]: files[0] });
        } else if (['farmCity', 'farmState', 'bankName', 'bankAccountHolderName', 'fullName'].includes(name)) {
            setFormData({ ...formData, [name]: value.replace(/[^A-Za-z\s]/g, '') });
        } else if (name === 'mobile') {
            setFormData({ ...formData, [name]: value.replace(/\D/g, '') });
        } else if (name === 'fssaiLicense') {
            setFormData({ ...formData, [name]: value.replace(/\D/g, '').slice(0, 14) });
        } else if (name === 'bankAccountNumber') {
            setFormData({ ...formData, [name]: value.replace(/\D/g, '').slice(0, 16) });
        } else if (name === 'bankIfscCode') {
            setFormData({ ...formData, [name]: value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        const city = (formData.farmCity || '').trim();
        const state = (formData.farmState || '').trim();
        if (!city || !state) return;

        const accNo = (formData.bankAccountNumber || '').trim();
        if (accNo && (accNo.length < 9 || accNo.length > 16)) {
            alert('Account number must be 9 to 16 digits.');
            return;
        }
        const ifsc = (formData.bankIfscCode || '').trim();
        if (ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
            alert('Invalid IFSC code. Format: 4 letters, then 0, then 6 alphanumeric (e.g. HDFC0001234).');
            return;
        }
        const fssai = (formData.fssaiLicense || '').trim();
        if (fssai && !/^\d{14}$/.test(fssai)) {
            alert('FSSAI License must be exactly 14 digits.');
            return;
        }

        setIsLoading(true);
        const data = new FormData();
        data.append('fullName', formData.fullName);
        data.append('email', formData.email);
        data.append('mobile', formData.mobile);
        data.append('password', formData.password);
        data.append('farmLocation', `${city}, ${state}`);
        data.append('fssaiLicense', formData.fssaiLicense || '');
        data.append('bankDetails', JSON.stringify({
            accountHolderName: formData.bankAccountHolderName,
            accountNumber: formData.bankAccountNumber,
            ifscCode: formData.bankIfscCode,
            bankName: formData.bankName,
        }));
        if (formData.aadharFile) data.append('aadharFile', formData.aadharFile);
        if (formData.panFile) data.append('panFile', formData.panFile);
        if (formData.shopProofFile) data.append('shopProofFile', formData.shopProofFile);

        try {
            await api.post('/vendor/register', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            alert('Registration successful! Please login.');
            navigate('/vendor/login');
        } catch (error) {
            alert(error.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const FileUploadField = ({ label, name, icon: Icon, fileRef }) => (
        <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                {label} <span className="text-slate-300 font-medium normal-case">(optional)</span>
            </label>
            <div onClick={() => fileRef.current?.click()} className="relative group cursor-pointer border-2 border-dashed border-slate-200 rounded-xl p-3 hover:border-primary/50 transition-colors bg-slate-50">
                <input ref={fileRef} name={name} type="file" accept="image/*,application/pdf" onChange={handleChange} className="hidden" />
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                        <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-slate-700 truncate">{formData[name]?.name || 'Click to upload document'}</p>
                        <p className="text-[8px] font-medium text-slate-400">JPG, PNG or PDF (Max 20MB)</p>
                    </div>
                    {formData[name] && <div className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">SELECTED</div>}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafd] flex items-center justify-center p-4 selection:bg-emerald-100 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-100 rounded-full blur-3xl" />
                <motion.div animate={{ scale: [1, 1.1, 1], x: [0, 50, 0] }} transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }} className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-2xl bg-white/80 backdrop-blur-xl p-6 rounded-[32px] border border-white shadow-2xl shadow-emerald-900/5 relative z-10 my-10"
            >
                <div className="flex flex-col items-center mb-6 text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }} className="w-12 h-12 bg-primary rounded-[16px] flex items-center justify-center text-white mb-3 shadow-xl shadow-primary/30">
                        <Sprout size={24} />
                    </motion.div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">Join as Vendor</h1>
                    <p className="text-slate-500 font-medium mt-0.5 text-xs">Complete your profile to start selling</p>
                </div>

                <form onSubmit={handleSignup} className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* ── Business Info ── */}
                    <div className="space-y-3 md:col-span-2">
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Business Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name / Owner Name</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"><User size={14} /></div>
                                    <input name="fullName" type="text" required value={formData.fullName} onChange={handleChange} placeholder="Your Name" className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 outline-none text-xs font-bold focus:ring-4 focus:ring-primary/5 transition-all text-slate-900" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"><Mail size={14} /></div>
                                    <input name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="vendor@kisaankart.com" className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 outline-none text-xs font-bold focus:ring-4 focus:ring-primary/5 transition-all text-slate-900" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"><Phone size={14} /></div>
                                    <input name="mobile" type="tel" required value={formData.mobile} onChange={handleChange} placeholder="9876543210" maxLength={10} className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 outline-none text-xs font-bold focus:ring-4 focus:ring-primary/5 transition-all text-slate-900 tracking-widest" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"><MapPin size={14} /></div>
                                    <input name="farmCity" type="text" required value={formData.farmCity} onChange={handleChange} placeholder="e.g. Indore" maxLength={50} className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 outline-none text-xs font-bold focus:ring-4 focus:ring-primary/5 transition-all text-slate-900" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">State</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"><MapPin size={14} /></div>
                                    <input name="farmState" type="text" required value={formData.farmState} onChange={handleChange} placeholder="e.g. Madhya Pradesh" maxLength={50} className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 outline-none text-xs font-bold focus:ring-4 focus:ring-primary/5 transition-all text-slate-900" />
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* ── Bank Details (optional) ── */}
                    <div className="space-y-3 md:col-span-2">
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">
                            Bank Details <span className="text-slate-300 font-medium normal-case">(optional)</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Bank Name</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"><Building2 size={14} /></div>
                                    <input name="bankName" type="text" value={formData.bankName} onChange={handleChange} placeholder="HDFC Bank" className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 outline-none text-xs font-bold focus:ring-4 focus:ring-primary/5 transition-all text-slate-900" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Holder Name</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"><User size={14} /></div>
                                    <input name="bankAccountHolderName" type="text" value={formData.bankAccountHolderName} onChange={handleChange} placeholder="Name on Passbook" className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 outline-none text-xs font-bold focus:ring-4 focus:ring-primary/5 transition-all text-slate-900" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Number</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"><CreditCard size={14} /></div>
                                    <input name="bankAccountNumber" type="tel" inputMode="numeric" value={formData.bankAccountNumber} onChange={handleChange} maxLength={16} placeholder="9–16 digits" className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 outline-none text-xs font-bold focus:ring-4 focus:ring-primary/5 transition-all text-slate-900" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">IFSC Code</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"><FileText size={14} /></div>
                                    <input name="bankIfscCode" type="text" value={formData.bankIfscCode} onChange={handleChange} maxLength={11} placeholder="HDFC0001234" className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 outline-none text-xs font-bold focus:ring-4 focus:ring-primary/5 transition-all text-slate-900 uppercase" />
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* ── Documents & Compliance (optional) ── */}
                    <div className="space-y-3 md:col-span-2">
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">
                            Documents & Compliance <span className="text-slate-300 font-medium normal-case">(optional)</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">FSSAI License No.</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"><FileText size={14} /></div>
                                    <input name="fssaiLicense" type="tel" value={formData.fssaiLicense} onChange={handleChange} maxLength={14} placeholder="14-digit FSSAI number" className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 outline-none text-xs font-bold focus:ring-4 focus:ring-primary/5 transition-all text-slate-900" />
                                </div>
                            </div>

                            <div className="hidden md:block" />

                            <FileUploadField label="Aadhar Card" name="aadharFile" icon={FileText} fileRef={fileInputRefs.aadhar} />
                            <FileUploadField label="PAN Card" name="panFile" icon={CreditCard} fileRef={fileInputRefs.pan} />
                            <FileUploadField label="Shop / Farm Proof" name="shopProofFile" icon={Building2} fileRef={fileInputRefs.shopProof} />

                        </div>
                    </div>

                    {/* ── Password ── */}
                    <div className="space-y-1 md:col-span-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Create Password</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"><Lock size={14} /></div>
                            <input name="password" type="password" required value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 outline-none text-xs font-bold focus:ring-4 focus:ring-primary/5 transition-all text-slate-900" />
                        </div>
                    </div>

                    <div className="md:col-span-2 text-center py-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                            By registering, you agree to our{' '}
                            <button type="button" onClick={() => navigate('/vendor/terms')} className="text-slate-900 border-b border-slate-200">Vendor Terms & Conditions</button>
                        </p>
                    </div>

                    <button type="submit" disabled={isLoading} className="group md:col-span-2 w-full bg-slate-900 text-white rounded-xl py-3 px-6 font-black text-xs flex items-center justify-center gap-2 hover:bg-primary transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none mt-2">
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <>Register Account <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>}
                    </button>
                </form>

                <div className="mt-5 text-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Already have a vendor account?</p>
                    <button onClick={() => navigate('/vendor/login')} className="mt-1 text-primary font-black text-[10px] hover:underline">Login to Dashboard</button>
                </div>
            </motion.div>
        </div>
    );
}
