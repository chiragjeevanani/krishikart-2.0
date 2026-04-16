import { motion } from 'framer-motion';
import { ChevronLeft, Shield, FileText, ScrollText, AlertCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsScreen() {
    const navigate = useNavigate();

    const sections = [
        {
            id: 'node-auth',
            title: 'Node Authorization & Settlement',
            icon: Shield,
            content: 'As a verified franchise node, you are authorized to facilitate orders within your designated geographical cluster. Settlement for all delivered orders is processed on a weekly basis, subject to a 10% platform commission on the gross order value.'
        },
        {
            id: 'logistical-compliance',
            title: 'Logistical Compliance',
            icon: ScrollText,
            content: 'Franchisees must maintain the integrity of the storage conditions as per the categorized guidelines (Ambient, Cold Chain, etc.). Each inbound PO must be audited within 4 hours of arrival to claim any logistical losses or damages.'
        },
        {
            id: 'quality-standards',
            title: 'Quality & Service Standards',
            icon: FileText,
            content: 'All outgoing deliveries must adhere to the KisaanKart packaging standard. Delay in processing "Accepted" orders beyond 120 minutes may result in automated node-reassignment to maintain network efficiency.'
        },
        {
            id: 'data-privacy',
            title: 'Customer Data & Privacy',
            icon: Info,
            content: 'Access to customer contact and delivery information is strictly for order fulfillment. Any unauthorized data scraping or usage for direct marketing outside the KisaanKart ecosystem is a breach of the franchise agreement.'
        },
        {
            id: 'termination',
            title: 'Termination & Liability',
            icon: AlertCircle,
            content: 'Failure to provide valid documentation (KYC/GST) or persistent low service ratings may result in node suspension. Either party may terminate the agreement with a 30-day notice period through the official support channel.'
        }
    ];

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            {/* Enterprise Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="px-4 py-4 flex items-center justify-between max-w-4xl mx-auto">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate(-1)} 
                            className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all rounded-full border border-slate-100"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Terms & Conditions</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Last Updated: April 2026</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto p-4 py-12">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                >
                    <div className="space-y-4">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">Agreement Protocol</h2>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            This agreement governs the relationship between KisaanKart Network (Platform) and the Franchisee (Node). 
                            By logging into the terminal, you acknowledge and agree to the operational protocols outlined below.
                        </p>
                    </div>

                    <div className="space-y-0.5 bg-slate-200 p-px rounded-sm overflow-hidden border border-slate-200">
                        {sections.map((section, idx) => (
                            <motion.div 
                                key={section.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white p-6 md:p-8 space-y-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-sm bg-slate-900 text-white flex items-center justify-center">
                                        <section.icon size={18} />
                                    </div>
                                    <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">{section.title}</h3>
                                </div>
                                <p className="text-[12px] md:text-sm text-slate-500 font-medium leading-relaxed">
                                    {section.content}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="p-8 bg-slate-900 rounded-sm text-white space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Acknowledgment</h4>
                        <p className="text-xs font-bold leading-relaxed text-slate-400 uppercase tracking-wider">
                            By continuing to use the dashboard, you certify that all information provided in your KYC documents is accurate and that you will uphold the logistical integrity of the KisaanKart network.
                        </p>
                    </div>

                    <div className="flex justify-center pt-8">
                        <button 
                            onClick={() => navigate(-1)}
                            className="text-[11px] font-black uppercase text-slate-900 border-b-2 border-slate-900 pb-1"
                        >
                            Back to Franchise Portal
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
