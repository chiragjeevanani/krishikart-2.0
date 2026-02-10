import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, ArrowRight, ShieldCheck, CheckCircle2, Sprout } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginScreen() {
    const [step, setStep] = useState('phone') // phone, otp
    const [phone, setPhone] = useState('')
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const navigate = useNavigate()

    const handleNext = () => {
        if (step === 'phone') {
            if (phone.length === 10) setStep('otp')
        } else {
            if (otp.join('') === '123456') navigate('/home')
        }
    }

    return (
        <div className="min-h-screen bg-white flex flex-col px-8 pt-20 pb-10">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-6">
                    <Sprout size={32} />
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
                    Freshness <br />
                    <span className="text-primary">Simplified.</span>
                </h1>
                <p className="mt-4 text-slate-500 font-bold text-lg leading-relaxed">
                    Order fresh fruits & veggies directly from the farm to your door.
                </p>
            </motion.div>

            <div className="flex-1">
                <AnimatePresence mode="wait">
                    {step === 'phone' ? (
                        <motion.div
                            key="phone"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-slate-200 pr-3 mr-3 h-6">
                                    <span className="text-sm font-black text-slate-900">+91</span>
                                </div>
                                <Input
                                    type="tel"
                                    placeholder="Enter phone number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    className="pl-20 h-16 text-lg font-black bg-slate-50 border-none rounded-2xl placeholder:text-slate-300 ring-offset-transparent focus-visible:ring-2 focus-visible:ring-primary/20"
                                />
                            </div>
                            <Button
                                onClick={handleNext}
                                disabled={phone.length !== 10}
                                className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-lg font-black shadow-lg shadow-green-100 transition-all active:scale-[0.98]"
                            >
                                Send Verification <ArrowRight className="ml-2" />
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="otp"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div>
                                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-4">Verification Code</p>
                                <div className="grid grid-cols-6 gap-2">
                                    {otp.map((digit, idx) => (
                                        <input
                                            key={idx}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '')
                                                const newOtp = [...otp]
                                                newOtp[idx] = val
                                                setOtp(newOtp)
                                                if (val && e.target.nextSibling) e.target.nextSibling.focus()
                                            }}
                                            className="w-full h-14 bg-slate-50 border-none rounded-xl text-center text-xl font-black text-slate-900 outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <Button
                                    onClick={handleNext}
                                    className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-slate-800 text-lg font-black shadow-xl"
                                >
                                    Verify & Continue
                                </Button>
                                <button
                                    onClick={() => setStep('phone')}
                                    className="text-slate-400 font-black uppercase text-xs tracking-[0.2em] text-center"
                                >
                                    Change Phone Number
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-auto pt-10">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <ShieldCheck className="text-green-500" size={24} />
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                        Your connection is secure and encrypted. <br /> Trusted by 1M+ Users globally.
                    </p>
                </div>
            </div>
        </div>
    )
}
