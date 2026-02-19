import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Phone, Mail, ArrowLeft, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HelpSupportScreen() {
    const navigate = useNavigate();

    const faqs = [
        {
            q: "How do I accept a delivery?",
            a: "Go to the 'Task Feed' from your dashboard and click 'Accept Task' on any available delivery request."
        },
        {
            q: "What if I can't reach the customer?",
            a: "Try calling the customer using the number provided in the active delivery screen. If they don't respond, contact our support team immediately."
        },
        {
            q: "How and when do I get paid?",
            a: "Payments are processed weekly every Monday for all deliveries completed in the previous week (Mon-Sun)."
        },
        {
            q: "How to update my vehicle info?",
            a: "Go to your Profile and select 'Vehicle Information' to update your vehicle details."
        }
    ];

    return (
        <div className="flex flex-col min-h-full bg-slate-50 pb-20">
            <div className="px-6 pt-8 pb-4 flex items-center gap-4 sticky top-0 bg-white z-10 border-b border-border/50 shadow-sm">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold text-foreground">Help & Support</h1>
            </div>

            <div className="p-6 space-y-8">
                {/* Contact Options */}
                <div className="grid grid-cols-2 gap-4">
                    <button className="bg-white p-6 rounded-3xl border border-border shadow-sm flex flex-col items-center gap-3 active:scale-95 transition-all">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                            <Phone className="w-6 h-6 text-blue-500" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-foreground">Call Us</span>
                    </button>
                    <button className="bg-white p-6 rounded-3xl border border-border shadow-sm flex flex-col items-center gap-3 active:scale-95 transition-all">
                        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
                            <Mail className="w-6 h-6 text-purple-500" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-foreground">Email Support</span>
                    </button>
                </div>

                {/* FAQ Section */}
                <div className="space-y-4">
                    <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground px-2">Common Questions</h2>
                    <div className="space-y-3">
                        {faqs.map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white rounded-2xl p-5 border border-border shadow-sm"
                            >
                                <div className="flex justify-between items-center gap-4 mb-2">
                                    <h3 className="text-sm font-bold text-foreground">{faq.q}</h3>
                                    <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {faq.a}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Footnote */}
                <div className="text-center py-10">
                    <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <HelpCircle className="w-6 h-6 text-slate-500" />
                    </div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Still need help?</p>
                    <p className="text-xs text-muted-foreground italic">Available 24/7 for our delivery partners</p>
                </div>
            </div>
        </div>
    );
}
