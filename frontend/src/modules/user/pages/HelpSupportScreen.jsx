import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MessageCircle, Phone, Mail, ChevronDown, ChevronUp } from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import { useState } from 'react'

const faqs = [
    {
        question: "How do I track my order?",
        answer: "Go to the 'Orders' section in your profile. Select the order you want to track to see its current status and estimated delivery time."
    },
    {
        question: "What is the return policy?",
        answer: "We have a 7-day no-questions-asked return policy for most items. Seeds and fertilizers must be in unopened packaging."
    },
    {
        question: "How do I add money to my wallet?",
        answer: "Navigate to 'KK Wallet' from your profile, click on 'Add Money', enter the amount, and complete the payment using UPI, Card, or Netbanking."
    },
    {
        question: "Can I change my delivery address after ordering?",
        answer: "You can change the address only if the order status is 'Processing'. Once 'Shipped', the address cannot be changed."
    }
]

export default function HelpSupportScreen() {
    const navigate = useNavigate()
    const [openIndex, setOpenIndex] = useState(null)

    return (
        <PageTransition>
            <div className="bg-[#f8fafd] min-h-screen pb-10">
                {/* Header */}
                <div className="bg-white px-6 py-6 border-b border-slate-50 flex items-center gap-4 sticky top-0 z-30">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 active:scale-90 transition-transform">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">Help & Support</h1>
                </div>

                <div className="p-6 space-y-8">
                    {/* Contact Channels */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center text-center gap-3">
                            <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                                <Phone size={24} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900">Call Us</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">24/7 Support</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center text-center gap-3">
                            <div className="w-14 h-14 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
                                <MessageCircle size={24} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900">Chat</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Instant Help</p>
                            </div>
                        </div>
                    </div>

                    {/* FAQs */}
                    <div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-4">Frequently Asked Questions</h3>
                        <div className="space-y-3">
                            {faqs.map((faq, idx) => (
                                <div key={idx} className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
                                    <button
                                        onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                        className="w-full flex items-center justify-between p-5 text-left"
                                    >
                                        <span className="text-sm font-bold text-slate-900">{faq.question}</span>
                                        {openIndex === idx ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                                    </button>
                                    {openIndex === idx && (
                                        <div className="px-5 pb-5 pt-0 text-xs text-slate-500 font-medium leading-relaxed">
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Email Support */}
                    <div className="bg-slate-900 text-white p-6 rounded-[32px] flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-black">Still need help?</h3>
                            <p className="text-xs text-slate-400 font-medium mt-1">Email our support team directly.</p>
                        </div>
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white">
                            <Mail size={20} />
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    )
}
