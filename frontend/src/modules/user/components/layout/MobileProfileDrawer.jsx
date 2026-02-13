import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    User,
    Package,
    MapPin,
    Wallet,
    Bell,
    Heart,
    HelpCircle,
    Power,
    ChevronRight,
    FileText,
    MessageCircle,
    Briefcase,
    Settings,
    CircleDot,
    Ticket,
    Box,
    Info
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet'
import { useWallet } from '../../contexts/WalletContext'
import { cn } from '@/lib/utils'

const HamburgerIcon = () => (
    <div className="flex flex-col gap-1 items-start pl-0.5">
        <span className="w-4 h-[1.8px] bg-slate-900 rounded-full" />
        <span className="w-2.5 h-[1.8px] bg-slate-900 rounded-full" />
        <span className="w-1.5 h-[1.8px] bg-slate-900 rounded-full" />
    </div>
)

const SectionHeader = ({ title }) => (
    <div className="flex items-center gap-3 mb-3 px-2">
        <div className="w-1 h-5 bg-red-600 rounded-full" />
        <h4 className="text-[15px] font-bold text-slate-900 tracking-tight">{title}</h4>
    </div>
)

const MenuItem = ({ icon: Icon, label, path, badge, isNew, hasToggle, isActive, onToggle, isFirst, isLast }) => (
    <button
        onClick={() => !hasToggle && path && window.location.assign(path)}
        className={cn(
            "w-full flex items-center justify-between py-3.5 px-4 bg-white transition-all group active:bg-slate-50 text-left",
            !isFirst && "border-t border-slate-100"
        )}
    >
        <div className="flex items-center gap-3">
            <Icon size={17} className={cn("text-slate-500", label === "Veg mode" && "text-emerald-600")} strokeWidth={isActive ? 2 : 1.5} />
            <span className="text-[13.5px] font-medium text-slate-700 tracking-tight">{label}</span>
        </div>

        <div className="flex items-center gap-2">
            {badge && (
                <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    ₹{badge}
                </span>
            )}
            {isNew && (
                <span className="bg-red-400 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                    NEW
                </span>
            )}
            {hasToggle ? (
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle?.();
                    }}
                    className={cn(
                        "w-10 h-5 rounded-full p-0.5 transition-all duration-200 cursor-pointer",
                        isActive ? "bg-slate-400" : "bg-slate-200"
                    )}
                >
                    <motion.div
                        animate={{ x: isActive ? 20 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                </div>
            ) : (
                <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-400 transition-transform group-hover:translate-x-0.5" />
            )}
        </div>
    </button>
)

export default function MobileProfileDrawer() {
    const navigate = useNavigate()
    const { balance } = useWallet()
    const [vegMode, setVegMode] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <button className="w-11 h-11 rounded-full border border-slate-100 flex items-center justify-center bg-white shadow-sm active:scale-95 transition-all hover:bg-slate-50">
                    <HamburgerIcon />
                </button>
            </SheetTrigger>
            <SheetContent
                side="right"
                className="p-0 border-none w-full max-w-[320px] sm:max-w-[380px] bg-transparent shadow-none"
            >
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="w-full h-full bg-slate-50 shadow-2xl flex flex-col overflow-hidden"
                        >
                            <div className="flex flex-col h-full overflow-y-auto no-scrollbar outline-none">
                                {/* Header */}
                                <div className="bg-white p-6 pt-12 pb-6 border-b border-slate-100 relative">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden shrink-0">
                                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=chirag" alt="avatar" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="min-w-0">
                                            <SheetTitle className="text-2xl font-bold text-slate-900 tracking-tight leading-none mb-1 text-left">chirag</SheetTitle>
                                            <SheetDescription className="text-sm font-medium text-slate-500 text-left">
                                                Guest Account
                                            </SheetDescription>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 p-4 space-y-6">
                                    {/* Orders & statements */}
                                    <div>
                                        <SectionHeader title="Orders & statements" />
                                        <div className="bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-sm">
                                            <MenuItem icon={Package} label="Your orders" path="/orders" isFirst />
                                            <MenuItem icon={FileText} label="Account statement" path="/wallet" />
                                            <MenuItem icon={MessageCircle} label="Need help" path="/help-support" isLast />
                                        </div>
                                    </div>

                                    {/* Wallet & payment */}
                                    <div>
                                        <SectionHeader title="Wallet & payment" />
                                        <div className="bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-sm">
                                            <MenuItem icon={Wallet} label="KrishiKart wallet" path="/wallet" badge={balance.toLocaleString()} isFirst isLast />
                                        </div>
                                    </div>

                                    {/* Others */}
                                    <div>
                                        <SectionHeader title="Others" />
                                        <div className="bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-sm">
                                            <MenuItem icon={User} label="Profile settings" path="/edit-profile" isFirst />
                                            <MenuItem icon={Briefcase} label="Register as business" path="/verification" isNew />
                                            <MenuItem
                                                icon={CircleDot}
                                                label="Veg mode"
                                                hasToggle
                                                isActive={vegMode}
                                                onToggle={() => setVegMode(!vegMode)}
                                            />
                                            <MenuItem icon={Bell} label="Notifications" path="/notifications" />
                                            <MenuItem icon={Heart} label="My list" path="/wishlist" />
                                            <MenuItem icon={Ticket} label="Claim coupon" path="/offers" />
                                            <MenuItem icon={Box} label="Request new product" path="/help-support" />
                                            <MenuItem icon={Info} label="Contact us" path="/help-support" isLast />
                                        </div>
                                    </div>

                                    {/* Logout Account */}
                                    <div className="pb-8">
                                        <button
                                            onClick={() => navigate('/login')}
                                            className="w-full h-14 rounded-[20px] flex items-center gap-4 px-6 text-red-600 font-bold hover:bg-slate-50 transition-colors bg-white border border-slate-100 shadow-sm group active:scale-[0.98]"
                                        >
                                            <Power size={18} strokeWidth={2.5} />
                                            <span className="text-[15px]">Logout</span>
                                        </button>
                                        <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-8">Version 2.4.0 (Stable)</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </SheetContent>
        </Sheet>
    )
}
