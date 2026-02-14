import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft, Search, ShoppingCart,
    Heart, Menu, Store, FileCheck,
    CheckCircle2, X, Calendar
} from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export default function BusinessRegistrationScreen() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        pan: '',
        entityName: '',
        dob: ''
    })

    const isFormValid = formData.pan && formData.entityName && formData.dob;

    // Body scroll lock
    const [isPopupOpen, setIsPopupOpen] = useState(false)
    useEffect(() => {
        if (isPopupOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => { document.body.style.overflow = 'unset' }
    }, [isPopupOpen])

    return (
        <PageTransition>
            <div className="bg-[#f8f9fb] min-h-screen font-sans pb-20 relative">


                <main className="max-w-6xl mx-auto px-6 py-10">
                    {/* Hero Banner Section */}
                    <div className="relative rounded-[40px] overflow-hidden bg-gradient-to-r from-[#9333ea] via-[#c026d3] to-[#ec4899] p-12 md:p-20 mb-12 shadow-2xl shadow-purple-100">
                        {/* Abstract Background Shapes */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />

                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                            <div className="max-w-md space-y-6">
                                <div className="space-y-2">
                                    <h1 className="text-4xl md:text-5xl font-black text-white leading-[1.1] tracking-tight">
                                        Verify <br />
                                        as a registered business
                                    </h1>
                                </div>
                                <div className="w-48 h-10 bg-white/20 backdrop-blur-md rounded-full border border-white/20" />
                            </div>

                            {/* Restaurant Illustration */}
                            <div className="relative group">
                                <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-150 transform group-hover:scale-175 transition-transform duration-700" />
                                <div className="relative bg-white rounded-[32px] p-8 shadow-xl border border-white/10 flex flex-col items-center">
                                    <div className="w-full bg-[#ec5262] text-white text-[10px] font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-lg mb-4 text-center">CAFE</div>
                                    <div className="flex gap-2">
                                        <div className="w-2.5 h-12 bg-emerald-500 rounded-full" />
                                        <div className="w-2.5 h-12 bg-emerald-400 rounded-full opacity-60" />
                                        <div className="w-2.5 h-12 bg-emerald-300 rounded-full opacity-30" />
                                    </div>
                                    <div className="mt-4 grid grid-cols-2 gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50" />
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Step 1: Completed */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm transition-all group text-center"
                        >
                            <div className="relative inline-block mb-8">
                                <div className="w-24 h-24 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center p-6 relative">
                                    <Store size={48} className="text-slate-400" />
                                    <div className="absolute -top-1 -left-1 w-8 h-8 bg-slate-900 rounded-full text-white font-black flex items-center justify-center border-4 border-white shadow-sm">1</div>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-slate-800 mb-8">Restaurant details</h3>

                            <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-sm uppercase tracking-tight">
                                <CheckCircle2 size={16} />
                                Completed
                            </div>
                        </motion.div>

                        {/* Step 2: Action Required */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm transition-all group text-center"
                        >
                            <div className="relative inline-block mb-8">
                                <div className="w-24 h-24 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center p-6 relative">
                                    <div className="relative">
                                        <FileCheck size={48} className="text-amber-400" />
                                        <div className="absolute top-0 right-0 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                                            <CheckCircle2 size={12} className="text-white" />
                                        </div>
                                    </div>
                                    <div className="absolute -top-1 -left-1 w-8 h-8 bg-slate-900 rounded-full text-white font-black flex items-center justify-center border-4 border-white shadow-sm">2</div>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-slate-800 mb-8">Verify GST or FSSAI</h3>

                            <Button
                                onClick={() => setIsPopupOpen(true)}
                                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[20px] font-black text-lg shadow-lg shadow-emerald-100 active:scale-[0.98] transition-all"
                            >
                                Add
                            </Button>
                        </motion.div>
                    </div>

                    {/* Back Button */}
                    <div className="mt-12 flex justify-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2.5 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                        >
                            <ArrowLeft size={18} />
                            Go Back to Account
                        </button>
                    </div>
                </main>

                {/* PAN Verification Popup */}
                <AnimatePresence>
                    {isPopupOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsPopupOpen(false)}
                                className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100]"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
                            >
                                <div className="bg-white w-full max-w-[500px] rounded-[32px] overflow-hidden shadow-2xl flex flex-col pointer-events-auto">
                                    {/* Header */}
                                    <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Enter PAN of legal entity</h2>
                                        <button
                                            onClick={() => setIsPopupOpen(false)}
                                            className="w-8 h-8 flex items-center justify-center text-slate-900 hover:text-slate-600 transition-colors"
                                        >
                                            <X size={24} strokeWidth={3} />
                                        </button>
                                    </div>

                                    {/* Body */}
                                    <div className="p-8 space-y-6">
                                        <p className="text-[15px] font-bold text-slate-800 leading-relaxed">
                                            This will be your primary PAN number and will be used for all your outlets
                                        </p>

                                        <div className="space-y-4 pt-4">
                                            <Input
                                                placeholder="PAN Number"
                                                className="h-14 bg-white border-slate-200 rounded-xl px-5 text-base font-bold placeholder:text-slate-400 focus:ring-emerald-500/10"
                                                value={formData.pan}
                                                onChange={(e) => setFormData(prev => ({ ...prev, pan: e.target.value }))}
                                            />
                                            <Input
                                                placeholder="Legal entity name"
                                                className="h-14 bg-white border-slate-200 rounded-xl px-5 text-base font-bold placeholder:text-slate-400 focus:ring-emerald-500/10"
                                                value={formData.entityName}
                                                onChange={(e) => setFormData(prev => ({ ...prev, entityName: e.target.value }))}
                                            />
                                            <div className="relative">
                                                <Input
                                                    type="text"
                                                    placeholder="Date of birth/registration"
                                                    className="h-14 bg-white border-slate-200 rounded-xl px-5 text-base font-bold placeholder:text-slate-400 focus:ring-emerald-500/10 pr-12"
                                                    value={formData.dob}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                                                />
                                                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-red-400" size={20} strokeWidth={2.5} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="p-8 border-t border-slate-100">
                                        <Button
                                            disabled={!isFormValid}
                                            className={cn(
                                                "w-full h-14 rounded-2xl text-lg font-black transition-all shadow-lg active:scale-[0.98]",
                                                isFormValid
                                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100"
                                                    : "bg-[#d1d1d1] text-white shadow-none cursor-not-allowed"
                                            )}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </PageTransition>
    )
}
