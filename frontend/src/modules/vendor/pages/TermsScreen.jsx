import { motion } from 'framer-motion';
import { ChevronLeft, Box, Truck, CreditCard, Scale, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsScreen() {
    const navigate = useNavigate();

    const sections = [
        {
            title: '1. Inventory Integrity',
            icon: Box,
            content: 'Vendors are required to maintain accurate stock levels in the portal. Any product listed as "Available" must be physically present in the warehouse and ready for dispatch within 2 hours of order acceptance.'
        },
        {
            title: '2. Logistics & Pickup',
            icon: Truck,
            content: 'Kisaankart logistics will conduct pickups at scheduled times. Items must be packed according to the "Vendor Packing Standards" to ensure zero damage during transit. Failure to comply may void insurance claims.'
        },
        {
            title: '3. Payment & Settlements',
            icon: CreditCard,
            content: 'Payments for delivered goods are processed on a T+7 cycle (7 days after delivery). Any disputes regarding payment must be raised within 48 hours of settlement through the Vendor Support Portal.'
        },
        {
            title: '4. Quality Compliance',
            icon: Scale,
            content: 'Marketplace quality is non-negotiable. Persistent quality complaints from customers or franchise nodes may result in temporary store suspension or permanent offboarding from the platform.'
        }
    ];

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm shadow-slate-200/40">
                <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all rounded-full border border-slate-100">
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Vendor Terms & Protocol</h1>
                </div>
            </header>

            <div className="max-w-2xl mx-auto p-6 py-12 space-y-12">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                >
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Marketplace <br/> Agreement</h2>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-sm">
                        This document outlines the operational and legal framework for vendors supplying goods to the Kisaankart network.
                    </p>
                </motion.div>

                <div className="space-y-0.5 bg-slate-200 p-px rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
                    {sections.map((section, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-6 md:p-8 space-y-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center">
                                    <section.icon size={16} />
                                </div>
                                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{section.title}</h3>
                            </div>
                            <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
                                {section.content}
                            </p>
                        </motion.div>
                    ))}
                </div>

                <div className="p-8 bg-slate-900 rounded-3xl text-white flex items-start gap-4 shadow-xl">
                    <Info size={24} className="text-orange-500 shrink-0" />
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Legal Notice</p>
                        <p className="text-xs font-bold leading-relaxed text-slate-300 uppercase tracking-wider">
                            By clicking "Register" or "Login", you certify that you are an authorized representative of your business and agree to the latest Kisaankart Vendor Compliance Protocol.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
