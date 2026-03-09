import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, MessageCircle, Phone, Mail, ChevronDown, ChevronUp } from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import { useState, useEffect } from 'react'
import api from '@/lib/axios'

const defaultFaqs = [
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
    const [faqs, setFaqs] = useState(defaultFaqs)
    const [supportInfo, setSupportInfo] = useState({
        phone: '918555454446',
        email: 'support@kisaankart.in',
        whatsapp: '918555454446'
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Support Settings
                const settingsRes = await api.get('/masteradmin/public-settings')
                if (settingsRes.data.success) {
                    const settings = settingsRes.data.result || []
                    const phone = settings.find(s => s.key === 'support_phone')?.value || '918555454446'
                    const email = settings.find(s => s.key === 'support_email')?.value || 'support@kisaankart.in'
                    const whatsapp = settings.find(s => s.key === 'support_whatsapp')?.value || phone
                    setSupportInfo({ phone, email, whatsapp })
                }

                // Fetch Dynamic FAQs (admin-added from masteradmin)
                const faqRes = await api.get('/masteradmin/public-faqs')
                if (faqRes.data.success) {
                    const list = faqRes.data.results || faqRes.data.result || []
                    if (list.length > 0) setFaqs(list)
                }
            } catch (error) {
                console.error('Failed to fetch data:', error)
            }
        }
        fetchData()
    }, [])

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
                    <div className="grid grid-cols-1 gap-4">
                        <a
                            href={`tel:${supportInfo.phone}`}
                            className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center text-center gap-3 active:scale-95 transition-transform"
                        >
                            <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                                <Phone size={24} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900">Call Us</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">24/7 Support</p>
                            </div>
                        </a>
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
                                        <motion.div
                                            animate={{ rotate: openIndex === idx ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ChevronDown size={18} className="text-slate-400" />
                                        </motion.div>
                                    </button>
                                    <AnimatePresence>
                                        {openIndex === idx && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                            >
                                                <div className="px-5 pb-5 pt-0 text-xs text-slate-500 font-medium leading-relaxed">
                                                    {faq.answer}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Email Support */}
                    <a
                        href={`mailto:${supportInfo.email}`}
                        className="bg-slate-900 text-white p-6 rounded-[32px] flex items-center justify-between active:scale-[0.98] transition-transform"
                    >
                        <div>
                            <h3 className="text-lg font-black">Still need help?</h3>
                            <p className="text-xs text-slate-400 font-medium mt-1">Email our support team directly.</p>
                        </div>
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white">
                            <Mail size={20} />
                        </div>
                    </a>
                </div>
            </div>
        </PageTransition>
    )
}

