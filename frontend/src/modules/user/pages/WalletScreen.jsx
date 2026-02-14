import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft,
    Plus,
    Wallet,
    History,
    FileText,
    Download,
    Star,
    Clock,
    ChevronRight,
    Info,
    CheckCircle2,
    RefreshCcw,
    Zap
} from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useState } from 'react'
import { useWallet } from '../contexts/WalletContext'
import { cn } from '@/lib/utils'

export default function WalletScreen() {
    const navigate = useNavigate()
    const { balance, transactions, addMoney, creditLimit, creditUsed, loyaltyPoints } = useWallet()
    const [amountToAdd, setAmountToAdd] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [activeFilter, setActiveFilter] = useState('All')
    const [refundToWallet, setRefundToWallet] = useState(true)

    const filters = [
        'All', 'Used', 'Expiring', 'Recharge', 'Refund', 'Loyalty',
        'Promotion', 'Sampling', 'Advance payments', 'COD payment',
        'Cashback savings', 'KrishiKart rewards'
    ]

    const quickAddAmounts = [1000, 2000, 5000]

    const handleAddMoney = (amount = amountToAdd) => {
        const value = amount || amountToAdd;
        if (!value || isNaN(value) || value <= 0) return

        setIsProcessing(true)
        setTimeout(() => {
            addMoney(Number(value))
            setIsProcessing(false)
            setShowSuccess(true)
            setAmountToAdd('')
            setTimeout(() => setShowSuccess(false), 2000)
        }, 1200)
    }

    const filteredTransactions = activeFilter === 'All'
        ? transactions
        : transactions.filter(t => {
            if (activeFilter === 'Loyalty') return t.type === 'Loyalty Bonus';
            if (activeFilter === 'Recharge') return t.type === 'Added';
            if (activeFilter === 'Used') return t.type === 'Paid';
            return true;
        })

    return (
        <PageTransition>
            <div className="bg-[#fcfdff] min-h-screen">
                {/* Mobile Header (Hidden on Desktop) */}
                <div className="lg:hidden bg-white px-6 py-4 border-b border-slate-100 flex items-center gap-4 sticky top-0 z-40">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 active:scale-95 transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900 tracking-tight">KrishiKart Wallet</h1>
                </div>

                <div className="max-w-6xl mx-auto px-6 py-8 pb-32">
                    {/* Desktop Page Title */}
                    <h1 className="hidden lg:block text-2xl font-bold text-slate-900 mb-8 font-sans">KrishiKart Wallet</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Main Content Area */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Balance Card - The Big One */}
                            <div className="bg-[#eff6ff] rounded-2xl p-8 flex items-center justify-between border border-blue-100 relative overflow-hidden group shadow-sm">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-white/40 rounded-full -mr-24 -mt-24 blur-3xl opacity-50" />
                                <div className="flex items-center gap-8 relative z-10">
                                    <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-blue-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                                        <Wallet size={40} className="text-[#3b82f6]" strokeWidth={1.5} />
                                    </div>
                                    <div className="space-y-1">
                                        <h2 className="text-5xl font-bold text-[#1e40af] tracking-tight tabular-nums">
                                            ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </h2>
                                        <p className="text-[11px] font-black text-[#60a5fa] uppercase tracking-[0.15em] ml-1">Your Credit Balance</p>
                                    </div>
                                </div>

                                {/* Loyalty Points Bubble */}
                                <div className="hidden md:flex flex-col items-end gap-1 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-xl border border-blue-50 relative z-10 shadow-sm">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Star size={14} className="fill-primary" />
                                        <span className="text-sm font-bold tabular-nums">{loyaltyPoints}</span>
                                    </div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">KK Points</span>
                                </div>
                            </div>

                            {/* Statement Banner */}
                            <motion.div
                                whileHover={{ scale: 1.005 }}
                                className="bg-[#3b82f6] rounded-2xl p-6 text-white flex items-center justify-between shadow-lg shadow-blue-500/10 cursor-pointer relative overflow-hidden group"
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                                        <FileText size={24} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h3 className="text-xl font-bold tracking-tight">Get your wallet account statement</h3>
                                        <p className="text-xs text-blue-100 font-medium opacity-80">for a specific time period</p>
                                    </div>
                                </div>
                                <div className="relative z-10 hidden sm:block">
                                    <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/20 rotate-12 group-hover:rotate-0 transition-all duration-500">
                                        <div className="w-10 h-10 bg-white rounded-lg flex flex-col items-center justify-center gap-1 shadow-sm">
                                            <div className="w-6 h-0.5 bg-blue-100 rounded" />
                                            <div className="w-4 h-0.5 bg-blue-100 rounded" />
                                            <div className="w-5 h-0.5 bg-blue-50 rounded" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Credit History Section */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">Credit History</h3>
                                    {isProcessing && <p className="text-[10px] font-bold text-blue-500 uppercase animate-pulse">Updating Transactions...</p>}
                                </div>

                                {/* Filters Tags */}
                                <div className="flex flex-wrap gap-2 py-1">
                                    {filters.map((filter) => (
                                        <button
                                            key={filter}
                                            onClick={() => setActiveFilter(filter)}
                                            className={cn(
                                                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all border",
                                                activeFilter === filter
                                                    ? "bg-[#e2f1f1] text-[#2d7d7d] border-[#2d7d7d]/20"
                                                    : "bg-white text-slate-500 border-transparent hover:border-slate-200"
                                            )}
                                        >
                                            {filter}
                                        </button>
                                    ))}
                                </div>

                                {/* Transactions List */}
                                <div className="space-y-3 pt-2">
                                    {filteredTransactions.length > 0 ? (
                                        filteredTransactions.map((txn) => (
                                            <motion.div
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                key={txn.id}
                                                className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between group hover:border-blue-100 transition-colors shadow-sm"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-lg flex items-center justify-center transition-colors shadow-sm",
                                                        txn.type === 'Added' ? "bg-emerald-50 text-emerald-500" :
                                                            txn.type === 'Loyalty Bonus' ? "bg-blue-50 text-blue-500" :
                                                                "bg-[#fef2f2] text-red-500"
                                                    )}>
                                                        {txn.type === 'Added' ? <RefreshCcw size={18} /> :
                                                            txn.type === 'Loyalty Bonus' ? <Star size={18} className="fill-current" /> :
                                                                <Clock size={18} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 leading-none mb-1">
                                                            {txn.type === 'Added' ? 'Recharge' :
                                                                txn.type === 'Loyalty Bonus' ? 'Loyalty Bonus' :
                                                                    'Debit Payment'}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{txn.date} • {txn.id}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right space-y-0.5">
                                                    <p className={cn(
                                                        "text-base font-bold tracking-tight tabular-nums",
                                                        txn.type === 'Added' ? "text-emerald-600" :
                                                            txn.type === 'Loyalty Bonus' ? "text-blue-600" :
                                                                "text-slate-900"
                                                    )}>
                                                        {txn.type === 'Added' || txn.type === 'Loyalty Bonus' ? '+' : '-'}
                                                        {txn.type === 'Loyalty Bonus' ? '' : '₹'}
                                                        {txn.amount.toLocaleString('en-IN')}
                                                        {txn.type === 'Loyalty Bonus' ? ' Pts' : ''}
                                                    </p>
                                                    <div className="flex items-center justify-end gap-1">
                                                        <div className={cn("w-1.5 h-1.5 rounded-full", txn.status === 'Success' ? "bg-emerald-500" : "bg-amber-400")} />
                                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">{txn.status}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-100 italic text-slate-400 text-sm font-bold">
                                            No transaction found for "{activeFilter}"
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Add Money Card */}
                            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6 sticky top-28">
                                <div className="space-y-1">
                                    <h3 className="text-base font-bold text-slate-800">Add money</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instant Recharge via UPI/Nexus</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold">₹</span>
                                        <Input
                                            type="number"
                                            placeholder="Enter amount"
                                            className="h-12 pl-8 bg-slate-50/50 border-slate-100 focus:bg-white transition-all text-sm font-bold placeholder:text-slate-300 rounded-xl"
                                            value={amountToAdd}
                                            onChange={(e) => setAmountToAdd(e.target.value)}
                                        />
                                    </div>

                                    <Button
                                        onClick={() => handleAddMoney()}
                                        disabled={!amountToAdd || isProcessing}
                                        className={cn(
                                            "w-full h-12 bg-[#d1d5db] text-[#4b5563] font-bold tracking-tight rounded-xl hover:bg-slate-300 transition-all",
                                            amountToAdd && "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200 active:scale-[0.98]"
                                        )}
                                    >
                                        {isProcessing ? (
                                            <RefreshCcw className="animate-spin mr-2" size={16} />
                                        ) : "Add"}
                                    </Button>

                                    <div className="grid grid-cols-1 gap-2 pt-2">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Quick Recharge</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {quickAddAmounts.map((amt) => (
                                                <button
                                                    key={amt}
                                                    onClick={() => handleAddMoney(amt)}
                                                    className="py-2.5 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95 flex flex-col items-center justify-center gap-0.5"
                                                >
                                                    <span className="leading-none text-[10px]">+₹{amt.toLocaleString('en-IN')}</span>
                                                    {amt === 2000 && <span className="text-[7px] text-[#3b82f6] font-black uppercase tracking-tighter">Popular</span>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-4 mt-4 border-t border-slate-50">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1 pr-4">
                                            <h3 className="text-sm font-bold text-slate-800">Refund to KrishiKart wallet</h3>
                                            <p className="text-[9px] font-bold text-slate-400 leading-tight">Enable this to get instant refunds to KrishiKart wallet</p>
                                        </div>
                                        <Switch
                                            checked={refundToWallet}
                                            onCheckedChange={setRefundToWallet}
                                            className="data-[state=checked]:bg-[#3b82f6]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Promotional/Nexus Card */}
                            <div className="bg-gradient-to-br from-[#1e40af] to-[#3b82f6] rounded-2xl p-6 text-white overflow-hidden relative group shadow-lg shadow-blue-500/10">
                                <Zap className="absolute top-4 right-4 text-white/10 group-hover:scale-125 transition-transform duration-700" size={60} strokeWidth={1} />
                                <div className="relative z-10 space-y-4">
                                    <div className="bg-white/20 inline-block px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest backdrop-blur-sm">Nexus Exclusive</div>
                                    <h4 className="text-lg font-bold leading-tight tracking-tight italic uppercase">Unlock High-Yield Benefits</h4>
                                    <p className="text-[10px] text-white/90 font-medium leading-relaxed">Boost your loyalty multiplier x1.5 with monthly KK Wallet top-ups over ₹10k.</p>
                                    <button className="text-[10px] font-black uppercase tracking-widest bg-white text-blue-600 px-4 py-2.5 rounded-xl shadow-sm hover:bg-slate-50 transition-colors w-full">Learn More</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Success Notification Toast */}
                <AnimatePresence>
                    {showSuccess && (
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-slate-900 py-4 px-8 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10"
                        >
                            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                                <CheckCircle2 size={16} />
                            </div>
                            <span className="text-white text-sm font-bold tracking-tight">Recharge successful! Funds added to your wallet.</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </PageTransition>
    )
}
