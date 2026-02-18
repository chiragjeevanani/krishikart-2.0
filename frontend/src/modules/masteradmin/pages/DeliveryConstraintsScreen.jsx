import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Truck,
    Save,
    Home,
    ChevronRight,
    IndianRupee,
    ShieldCheck,
    Info,
    Settings2,
    CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function DeliveryConstraintsScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Initial state matching mock values or localStorage
    const [constraints, setConstraints] = useState({
        baseFee: '40',
        freeMov: '500',
        perKmRate: '5',
        maxFee: '150',
        activeZones: true
    });

    useEffect(() => {
        const saved = localStorage.getItem('delivery_constraints');
        if (saved) {
            setConstraints(JSON.parse(saved));
        }
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API delay
        setTimeout(() => {
            localStorage.setItem('delivery_constraints', JSON.stringify(constraints));
            setIsSaving(false);
            toast.success('Delivery Settings Updated', {
                description: 'New fees are now active for all orders.',
                icon: <CheckCircle2 size={16} className="text-emerald-500" />
            });
        }, 800);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setConstraints(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    if (isLoading) {
        return <div className="p-8 animate-pulse text-slate-400 uppercase font-black text-[10px] tracking-widest">Loading settings...</div>;
    }

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            {/* Enterprise Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-r border-slate-200 pr-4">
                            <Home size={12} />
                            <ChevronRight size={10} />
                            <span>Logistics</span>
                            <ChevronRight size={10} />
                            <span className="text-slate-900 uppercase tracking-widest">Settings</span>
                        </div>
                        <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight">Delivery Fee Settings</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            disabled={isSaving}
                            onClick={handleSave}
                            className={cn(
                                "px-6 py-1.5 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:bg-emerald-600 disabled:bg-slate-300",
                                isSaving && "animate-pulse"
                            )}
                        >
                            {isSaving ? 'Saving...' : (
                                <>
                                    <Save size={12} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-8">
                <div className="space-y-8">
                    {/* Security Banner */}
                    <div className="bg-slate-900 rounded-sm p-4 flex items-center justify-between border-l-4 border-emerald-500">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/5 rounded-sm flex items-center justify-center text-emerald-400">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Delivery Fee Rules</h3>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Manage how much customers are charged for delivery.</p>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest border border-slate-800 px-2 py-1 rounded-sm">v2.4.0-logistics</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* 1. Core Fee Logic */}
                        <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden group">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-slate-50 text-slate-600 flex items-center justify-center rounded-sm group-hover:bg-slate-900 group-hover:text-white transition-colors duration-350">
                                        <IndianRupee size={16} />
                                    </div>
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Standard Fees</h3>
                                </div>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5 flex items-center justify-between">
                                        Standard Delivery Fee (₹)
                                        <Info size={10} className="text-slate-300" />
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                                        <input
                                            type="number"
                                            name="baseFee"
                                            value={constraints.baseFee}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50/50 border border-slate-200 rounded-sm px-8 py-2.5 text-sm font-black focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-0.5 flex items-center justify-between">
                                        Free Delivery on Orders Above (₹)
                                        <span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full text-[8px]">Offer</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 text-sm">₹</span>
                                        <input
                                            type="number"
                                            name="freeMov"
                                            value={constraints.freeMov}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50/50 border border-emerald-100 rounded-sm px-8 py-2.5 text-sm font-black text-emerald-700 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider italic mt-1">Orders above this amount will have free delivery.</p>
                                </div>
                            </div>
                        </div>

                        {/* 2. Advanced Metrics */}
                        <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden group">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-slate-50 text-slate-600 flex items-center justify-center rounded-sm group-hover:bg-slate-900 group-hover:text-white transition-colors duration-350">
                                        <Settings2 size={16} />
                                    </div>
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Distance Fees</h3>
                                </div>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Extra Fee per KM (₹)</label>
                                    <input
                                        type="number"
                                        name="perKmRate"
                                        value={constraints.perKmRate}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-sm px-4 py-2.5 text-sm font-black focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Maximum Delivery Fee (₹)</label>
                                    <input
                                        type="number"
                                        name="maxFee"
                                        value={constraints.maxFee}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-sm px-4 py-2.5 text-sm font-black focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Operational Summary Card */}
                    <div className="bg-emerald-50 border border-emerald-100 rounded-sm p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Truck size={80} className="rotate-12" />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-1">Delivery Summary</h4>
                                <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-tight">Customers get free delivery on orders over <span className="text-emerald-900 font-black">₹{constraints.freeMov}</span></p>
                            </div>
                            <div className="flex items-center gap-4 border-l border-emerald-200 pl-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[9px] font-black text-emerald-900 uppercase tracking-widest">Settings Active</span>
                                </div>
                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Node: Master Primary</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
