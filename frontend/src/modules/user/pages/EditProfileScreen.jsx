import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft, AlertCircle, MessageSquare,
    CircleDollarSign, FileText, Phone, Mail, Edit3,
    Smartphone, Receipt, X, CheckCircle2,
    Plus, Briefcase, Info, Headset, Trash2
} from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export default function EditProfileScreen() {
    const navigate = useNavigate()
    const [isPasswordDrawerOpen, setIsPasswordDrawerOpen] = useState(false)
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)

    // Dynamic Additional Numbers
    const [additionalNumbers, setAdditionalNumbers] = useState([])

    const [preferences, setPreferences] = useState({
        whatsapp: false,
        tax: false,
        paper: false
    })

    const [passwordData, setPasswordData] = useState({
        old: '',
        new: '',
        confirm: ''
    })

    const togglePreference = (key) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const addNumberRow = () => {
        setAdditionalNumbers(prev => [...prev, { id: Date.now(), phone: '', name: '' }])
    }

    const removeNumberRow = (id) => {
        setAdditionalNumbers(prev => prev.filter(row => row.id !== id))
    }

    const userData = {
        name: 'chirag',
        phone: '8225819420',
        email: 'chirag@gmail.com',
        pan: 'Unverified',
        entity: 'Guest Account',
        address: 'pipliyahahna, Indore - 452012'
    }

    return (
        <PageTransition>
            <div className="bg-[#fcfdff] min-h-screen pb-20 font-sans relative overflow-x-hidden">
                {/* Mobile Header (Hidden on Desktop) */}
                <div className="md:hidden bg-white px-5 py-4 flex items-center gap-4 shadow-sm border-b border-slate-100 sticky top-0 z-40">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 active:scale-90 transition-transform"
                    >
                        <ArrowLeft size={18} strokeWidth={2.5} />
                    </button>
                    <h1 className="text-[17px] font-black text-slate-900 tracking-tight">Profile settings</h1>
                </div>

                <div className="max-w-6xl mx-auto px-6 py-8">
                    {/* Desktop Page Title */}
                    <h1 className="hidden md:block text-3xl font-bold text-slate-900 mb-10">Profile settings</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* Left Column: Detailed Form Card */}
                        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-7">
                            <div className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-slate-400">User name</label>
                                    <p className="text-[18px] font-bold text-slate-800 leading-none tracking-tight">{userData.name}</p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-slate-400">Login phone number</label>
                                    <p className="text-[18px] font-bold text-slate-800 leading-none tracking-tight">{userData.phone}</p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-slate-400">Email address</label>
                                    <p className="text-[18px] font-bold text-slate-800 leading-none tracking-tight">{userData.email}</p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-slate-400">PAN card number</label>
                                    <div className="flex items-center gap-1.5 text-orange-500 font-black">
                                        <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center text-white">
                                            <AlertCircle size={10} strokeWidth={4} />
                                        </div>
                                        <span className="text-[14px]">Unverified</span>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-slate-400">Legal entity name</label>
                                    <p className="text-[18px] font-bold text-slate-800 leading-none tracking-tight">{userData.entity}</p>
                                </div>
                            </div>

                            {/* Buttons Group */}
                            <div className="flex gap-4 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsPasswordDrawerOpen(true)}
                                    className="flex-1 h-12 border-emerald-600 text-emerald-600 hover:bg-emerald-50 rounded-xl font-bold text-base transition-all active:scale-[0.98]"
                                >
                                    Change Password
                                </Button>
                                <Button
                                    onClick={() => setIsEditDrawerOpen(true)}
                                    className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-base shadow-lg shadow-emerald-100 transition-all active:scale-[0.98]"
                                >
                                    Edit Details
                                </Button>
                            </div>

                            {/* Switches Section */}
                            <div className="pt-8 space-y-6">
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                                            <Smartphone size={20} />
                                        </div>
                                        <span className="text-[14px] font-bold text-slate-700">Send me order updates on WhatsApp</span>
                                    </div>
                                    <Switch
                                        checked={preferences.whatsapp}
                                        onCheckedChange={() => togglePreference('whatsapp')}
                                        className="data-[state=checked]:bg-emerald-500"
                                    />
                                </div>

                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                                            <CircleDollarSign size={20} />
                                        </div>
                                        <span className="text-[14px] font-bold text-slate-700">Show prices including tax</span>
                                    </div>
                                    <Switch
                                        checked={preferences.tax}
                                        onCheckedChange={() => togglePreference('tax')}
                                        className="data-[state=checked]:bg-emerald-500"
                                    />
                                </div>

                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                                            <Receipt size={20} />
                                        </div>
                                        <span className="text-[14px] font-bold text-slate-700">Send me paper invoice with orders.</span>
                                    </div>
                                    <Switch
                                        checked={preferences.paper}
                                        onCheckedChange={() => togglePreference('paper')}
                                        className="data-[state=checked]:bg-emerald-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Address Summary Card */}
                        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm relative group hover:border-emerald-600/20 transition-all duration-300">
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{userData.name}</h2>
                                    <p className="text-[14px] font-medium text-slate-400">{userData.address}</p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 mt-6 border-t border-slate-50">
                                <div className="flex items-center gap-4 text-slate-600">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                                        <Phone size={18} />
                                    </div>
                                    <span className="text-base font-bold text-slate-800">{userData.phone}</span>
                                </div>
                                <div className="flex items-center gap-4 text-slate-600">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <span className="text-base font-bold text-slate-800">{userData.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Profile Drawer */}
                <AnimatePresence>
                    {isEditDrawerOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsEditDrawerOpen(false)}
                                className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[100]"
                            />
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="fixed top-0 right-0 h-full w-full max-w-[520px] bg-slate-50 shadow-2xl z-[101] flex flex-col"
                            >
                                <div className="flex items-center justify-between px-8 py-6 bg-white border-b border-slate-100">
                                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Edit Profile</h2>
                                    <button
                                        onClick={() => setIsEditDrawerOpen(false)}
                                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 rounded-full"
                                    >
                                        <X size={20} strokeWidth={2.5} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                    {/* Personal Info Section */}
                                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
                                        <div className="space-y-1.5">
                                            <div className="relative">
                                                <Input
                                                    defaultValue={userData.email}
                                                    placeholder="Email address"
                                                    className="h-14 bg-white border-slate-200 rounded-xl px-5 text-base font-bold focus:ring-[#10b981]/10"
                                                />
                                                <span className="absolute -top-2 left-4 bg-white px-1 text-[10px] font-black text-slate-400 uppercase">Email address</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="relative">
                                                <Input
                                                    defaultValue={userData.phone}
                                                    placeholder="Phone number"
                                                    className="h-14 bg-white border-slate-200 rounded-xl px-5 text-base font-bold focus:ring-[#10b981]/10"
                                                />
                                                <span className="absolute -top-2 left-4 bg-white px-1 text-[10px] font-black text-slate-400 uppercase">Phone number</span>
                                            </div>
                                            <div className="relative">
                                                <Input
                                                    placeholder="Name"
                                                    className="h-14 bg-white border-slate-200 rounded-xl px-5 text-base font-bold focus:ring-[#10b981]/10"
                                                />
                                                <span className="absolute -top-2 left-4 bg-white px-1 text-[10px] font-black text-slate-400 uppercase invisible">Name</span>
                                            </div>
                                        </div>

                                        {/* Dynamic Additional Numbers */}
                                        <AnimatePresence initial={false}>
                                            {additionalNumbers.map((row) => (
                                                <motion.div
                                                    key={row.id}
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="grid grid-cols-[1fr,1fr,auto] gap-4 items-center overflow-hidden"
                                                >
                                                    <Input
                                                        placeholder="Phone number"
                                                        className="h-14 bg-white border-slate-200 rounded-xl px-5 text-base font-bold"
                                                    />
                                                    <Input
                                                        placeholder="Name"
                                                        className="h-14 bg-white border-slate-200 rounded-xl px-5 text-base font-bold"
                                                    />
                                                    <button
                                                        onClick={() => removeNumberRow(row.id)}
                                                        className="w-10 h-10 flex items-center justify-center text-[#ec5262] hover:bg-red-50 rounded-xl transition-colors shrink-0"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>

                                        <button
                                            onClick={addNumberRow}
                                            className="flex items-center gap-1.5 text-sm font-black text-emerald-600 group"
                                        >
                                            <Plus size={16} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                                            Add another number
                                        </button>
                                    </div>

                                    {/* Business Details Section */}
                                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                                                <Briefcase size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-slate-800 leading-tight">Business details</h3>
                                                <p className="text-xs text-slate-400 font-medium tracking-tight">official details of your outlet</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-2">
                                            {[1, 2].map((i) => (
                                                <div key={i} className="relative group">
                                                    <Input
                                                        placeholder=" "
                                                        className="h-14 bg-white border-slate-200 rounded-xl px-5 text-base font-bold pr-16"
                                                    />
                                                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-black text-emerald-600 uppercase tracking-tight">Verify</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Support Info Box */}
                                    <div className="bg-[#f0f9ff] rounded-3xl p-6 border border-blue-100 space-y-5">
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-blue-100/50 flex items-center justify-center text-blue-500 shrink-0 mt-0.5">
                                                <Info size={18} strokeWidth={2.5} />
                                            </div>
                                            <p className="text-[13.5px] font-bold text-slate-600 leading-relaxed">
                                                Please reach out to our customer support to update account details & government provided documents
                                            </p>
                                        </div>

                                        <div className="space-y-4 pl-12 pt-1 border-white/50">
                                            <button className="flex items-center gap-3 text-emerald-600 font-black text-sm hover:underline underline-offset-4 decoration-2">
                                                <MessageSquare size={18} />
                                                Chat with us
                                            </button>
                                            <button className="flex items-center gap-3 text-emerald-600 font-black text-sm hover:underline underline-offset-4 decoration-2">
                                                <Headset size={18} />
                                                011-41171717
                                            </button>
                                            <button className="flex items-center gap-3 text-emerald-600 font-black text-sm hover:underline underline-offset-4 decoration-2">
                                                <Mail size={18} />
                                                help@krishikart.com
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 bg-white border-t border-slate-100">
                                    <Button className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-lg shadow-lg shadow-emerald-100 active:scale-[0.98] transition-all">
                                        Save Changes
                                    </Button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Change Password Drawer */}
                <AnimatePresence>
                    {isPasswordDrawerOpen && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsPasswordDrawerOpen(false)}
                                className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[100]"
                            />

                            {/* Drawer Content */}
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="fixed top-0 right-0 h-full w-full max-w-[480px] bg-white shadow-2xl z-[101] flex flex-col"
                            >
                                {/* Drawer Header */}
                                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50">
                                    <h2 className="text-xl font-bold text-slate-800">Change Password</h2>
                                    <button
                                        onClick={() => setIsPasswordDrawerOpen(false)}
                                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 rounded-full"
                                    >
                                        <X size={18} strokeWidth={2.5} />
                                    </button>
                                </div>

                                {/* Drawer Body */}
                                <div className="flex-1 overflow-y-auto px-8 py-10 space-y-8">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Input
                                                type="password"
                                                placeholder="Old Password*"
                                                className="h-14 bg-slate-50/50 border-slate-200 focus:bg-white rounded-xl px-5 text-base placeholder:text-slate-400 placeholder:font-medium font-bold"
                                                value={passwordData.old}
                                                onChange={(e) => setPasswordData(prev => ({ ...prev, old: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Input
                                                type="password"
                                                placeholder="New Password*"
                                                className="h-14 bg-slate-50/50 border-slate-200 focus:bg-white rounded-xl px-5 text-base placeholder:text-slate-400 placeholder:font-medium font-bold"
                                                value={passwordData.new}
                                                onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Input
                                                type="password"
                                                placeholder="Confirm Password*"
                                                className="h-14 bg-slate-50/50 border-slate-200 focus:bg-white rounded-xl px-5 text-base placeholder:text-slate-400 placeholder:font-medium font-bold"
                                                value={passwordData.confirm}
                                                onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    {/* Requirements */}
                                    <div className="space-y-4">
                                        <p className="text-sm font-bold text-slate-800">New password must meet the following requirements:</p>
                                        <div className="space-y-3">
                                            {[
                                                "At least one number",
                                                "At least one special character",
                                                "At least 8 characters"
                                            ].map((req, idx) => (
                                                <div key={idx} className="flex items-center gap-2.5 text-slate-400">
                                                    <CheckCircle2 size={16} className="text-slate-300" strokeWidth={2.5} />
                                                    <span className="text-[13px] font-bold">{req}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Drawer Footer */}
                                <div className="p-8 border-t border-slate-50">
                                    <Button
                                        disabled={!passwordData.old || !passwordData.new || !passwordData.confirm}
                                        className={cn(
                                            "w-full h-14 rounded-xl text-base font-bold shadow-lg transition-all active:scale-[0.98]",
                                            (!passwordData.old || !passwordData.new || !passwordData.confirm)
                                                ? "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed"
                                                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100"
                                        )}
                                    >
                                        Change Password
                                    </Button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </PageTransition>
    )
}
