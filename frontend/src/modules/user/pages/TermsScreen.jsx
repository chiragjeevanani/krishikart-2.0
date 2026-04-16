import { motion } from 'framer-motion';
import { ChevronLeft, Shield, ShoppingBag, Truck, Lock, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsScreen() {
    const navigate = useNavigate();

    const sections = [
        {
            title: '1. Account Responsibility',
            icon: Lock,
            content: 'You are responsible for maintaining the confidentiality of your account credentials. Any activity occurring under your account is your sole responsibility. Please notify us immediately of any unauthorized use.'
        },
        {
            title: '2. Product Quality & Returns',
            icon: ShoppingBag,
            content: 'Kisaankart strives for the highest quality. If you receive a damaged or incorrect product, you must report it within 24 hours of delivery through the app for a valid return or refund request.'
        },
        {
            title: '3. Delivery Protocol',
            icon: Truck,
            content: 'Estimated delivery times are provided for convenience. While we aim for punctuality, external factors may cause delays. Deliveries will be made to the address specified in your profile.'
        },
        {
            title: '4. Privacy Policy',
            icon: Shield,
            content: 'We value your privacy. Your personal data is encrypted and used only to improve your shopping experience and fulfill orders. We do not sell your information to third parties.'
        }
    ];

    return (
        <div className="bg-white min-h-screen font-sans pb-20">
            {/* Mobile-First Header */}
            <div className="bg-primary text-white p-6 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/10 rounded-full">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-lg font-bold">Terms of Service</h1>
                </div>
            </div>

            <div className="p-6 space-y-10 max-w-2xl mx-auto">
                <div className="space-y-4">
                    <div className="w-16 h-1 bg-primary rounded-full" />
                    <h2 className="text-3xl font-black text-slate-900 leading-tight">Consumer Agreement</h2>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed">
                        Welcome to Kisaankart. By using our application, you agree to comply with and be bound by the following terms and conditions.
                    </p>
                </div>

                <div className="space-y-8">
                    {sections.map((section, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="flex gap-4"
                        >
                            <div className="w-10 h-10 shrink-0 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-primary">
                                <section.icon size={20} />
                            </div>
                            <div className="space-y-2 pt-1">
                                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">{section.title}</h3>
                                <p className="text-slate-500 text-xs font-medium leading-relaxed">{section.content}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4">
                    <Info size={20} className="text-primary shrink-0" />
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                        Last Modified: April 16, 2026. Kisaankart reserves the right to update these terms at any time without prior notice.
                    </p>
                </div>
            </div>
        </div>
    );
}
