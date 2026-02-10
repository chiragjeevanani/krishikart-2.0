import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Building, User, Mail, Phone, MapPin, Package, ShieldCheck, Upload, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function VendorOnboardingDrawer({ isOpen, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: '',
        category: 'Vegetables',
        phone: '',
        email: '',
        location: '',
        capacity: 80,
        address: ''
    });

    const [files, setFiles] = useState([]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex justify-end">
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
                    className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col"
                >
                    {/* Header */}
                    <div className="p-8 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Onboard New Vendor</h3>
                                <p className="text-slate-500 font-medium text-sm mt-1">Register a new supply partner to the network.</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-8">
                        {/* Section: Basic Identity */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <User size={12} className="text-primary" />
                                Business Identity
                            </h4>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Entity Name</label>
                                    <div className="relative group">
                                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" size={18} />
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Green Valley Agro"
                                            className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 outline-none text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-primary/10 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Primary Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 outline-none text-sm font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-primary/10 transition-all shadow-inner"
                                        >
                                            <option>Vegetables</option>
                                            <option>Fruits</option>
                                            <option>Grains & Pulses</option>
                                            <option>Organic</option>
                                            <option>Dairy</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Initial Capacity %</label>
                                        <div className="relative group">
                                            <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary" size={18} />
                                            <input
                                                type="number"
                                                max="100"
                                                value={formData.capacity}
                                                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 outline-none text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Contact Details */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <ShieldCheck size={12} className="text-blue-500" />
                                Contact & Communication
                            </h4>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary" size={18} />
                                        <input
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+91"
                                            className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 outline-none text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary" size={18} />
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="vendor@email.com"
                                            className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 outline-none text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Operating Location</label>
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary" size={18} />
                                    <input
                                        type="text"
                                        required
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="e.g. North Delhi, Zone 4"
                                        className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 outline-none text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: KYC Documents */}
                        <div className="space-y-6 pb-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Upload size={12} className="text-purple-500" />
                                KYC & Documentation
                            </h4>

                            <div className="p-10 border-2 border-dashed border-slate-100 rounded-[32px] bg-slate-50/50 flex flex-col items-center justify-center text-center group hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer">
                                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm text-slate-300 group-hover:text-primary transition-all mb-4">
                                    <Upload size={32} />
                                </div>
                                <p className="text-sm font-black text-slate-900 uppercase italic">Drop Business Licenses</p>
                                <p className="text-[10px] text-slate-400 font-bold mt-1">SUPPORTED: PDF, JPG (MAX 10MB)</p>
                            </div>

                            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-start gap-4">
                                <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-amber-900 font-bold leading-relaxed">
                                    Manual verification of Trade License and GST Certificate is mandatory for Tier 1 activation.
                                </p>
                            </div>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="p-8 bg-white border-t border-slate-100">
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="py-4 rounded-2xl font-black text-xs text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-2"
                            >
                                <Save size={18} />
                                Register Partner
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
