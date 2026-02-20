import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft, AlertCircle, MessageSquare,
    CircleDollarSign, FileText, Phone, Mail, Edit3,
    Smartphone, Receipt, X, CheckCircle2,
    Plus, Briefcase, Info, Headset, Trash2, Loader2
} from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import api from '../../../lib/axios'

export default function EditProfileScreen() {
    const navigate = useNavigate()
    const [isPasswordDrawerOpen, setIsPasswordDrawerOpen] = useState(false)
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // User State
    const [user, setUser] = useState({
        fullName: '',
        mobile: '',
        email: '',
        panNumber: '',
        legalEntityName: '',
        address: ''
    })

    const [editData, setEditData] = useState({
        fullName: '',
        email: '',
        panNumber: '',
        legalEntityName: '',
        address: ''
    })

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

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        setIsLoading(true)
        try {
            const response = await api.get('/user/me')
            const userData = response.data.result
            setUser({
                fullName: userData.fullName || '',
                mobile: userData.mobile || '',
                email: userData.email || '',
                panNumber: userData.panNumber || '',
                legalEntityName: userData.legalEntityName || '',
                address: userData.address || ''
            })
            localStorage.setItem('userData', JSON.stringify(userData))
            setEditData({
                fullName: userData.fullName || '',
                email: userData.email || '',
                panNumber: userData.panNumber || '',
                legalEntityName: userData.legalEntityName || '',
                address: userData.address || ''
            })
            setPreferences({
                whatsapp: userData.preferences?.whatsappUpdates || false,
                tax: userData.preferences?.showTaxInclusive || false,
                paper: userData.preferences?.paperInvoice || false
            })
        } catch (error) {
            console.error('Failed to fetch profile:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSaveProfile = async () => {
        setIsSaving(true)
        try {
            const response = await api.put('/user/update-profile', {
                fullName: editData.fullName,
                email: editData.email,
                panNumber: editData.panNumber,
                legalEntityName: editData.legalEntityName,
                address: editData.address
            })
            const updatedUser = response.data.result
            setUser(updatedUser)
            localStorage.setItem('userData', JSON.stringify(updatedUser))
            setIsEditDrawerOpen(false)
            alert('Profile updated successfully')
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update profile')
        } finally {
            setIsSaving(false)
        }
    }

    const handleChangePassword = async () => {
        if (passwordData.new !== passwordData.confirm) {
            alert('Passwords do not match')
            return
        }
        setIsSaving(true)
        try {
            await api.post('/user/change-password', {
                oldPassword: passwordData.old,
                newPassword: passwordData.new
            })
            setIsPasswordDrawerOpen(false)
            setPasswordData({ old: '', new: '', confirm: '' })
            alert('Password changed successfully')
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to change password')
        } finally {
            setIsSaving(false)
        }
    }

    const togglePreference = async (key) => {
        const newPreferences = { ...preferences, [key]: !preferences[key] }
        setPreferences(newPreferences)

        try {
            await api.put('/user/update-profile', {
                preferences: {
                    whatsappUpdates: newPreferences.whatsapp,
                    showTaxInclusive: newPreferences.tax,
                    paperInvoice: newPreferences.paper
                }
            })
        } catch (error) {
            console.error('Failed to update preferences:', error)
            setPreferences(preferences) // revert on error
        }
    }

    const addNumberRow = () => {
        setAdditionalNumbers(prev => [...prev, { id: Date.now(), phone: '', name: '' }])
    }

    const removeNumberRow = (id) => {
        setAdditionalNumbers(prev => prev.filter(row => row.id !== id))
    }

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        )
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
                                    <p className="text-[18px] font-bold text-slate-800 leading-none tracking-tight">{user.fullName || 'Guest User'}</p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-slate-400">Login phone number</label>
                                    <p className="text-[18px] font-bold text-slate-800 leading-none tracking-tight">{user.mobile || 'N/A'}</p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-slate-400">Email address</label>
                                    <p className="text-[18px] font-bold text-slate-800 leading-none tracking-tight">{user.email || 'Not set'}</p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-slate-400">PAN card number</label>
                                    <div className="flex items-center gap-1.5 text-orange-500 font-black">
                                        {user.panNumber ? (
                                            <p className="text-[18px] font-bold text-slate-800 leading-none tracking-tight">{user.panNumber}</p>
                                        ) : (
                                            <>
                                                <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center text-white">
                                                    <AlertCircle size={10} strokeWidth={4} />
                                                </div>
                                                <span className="text-[14px]">Unverified</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-slate-400">Legal entity name</label>
                                    <p className="text-[18px] font-bold text-slate-800 leading-none tracking-tight">{user.legalEntityName || 'Guest Account'}</p>
                                </div>
                            </div>

                            {/* Buttons Group */}
                            <div className="pt-4">
                                <Button
                                    onClick={() => setIsEditDrawerOpen(true)}
                                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-base shadow-lg shadow-emerald-100 transition-all active:scale-[0.98]"
                                >
                                    Edit Details
                                </Button>
                            </div>
                        </div>

                        {/* Right Column: Address Summary Card */}
                        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm relative group hover:border-emerald-600/20 transition-all duration-300">
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{user.fullName || 'Guest User'}</h2>
                                    <p className="text-[14px] font-medium text-slate-400">{user.address || 'Address not set'}</p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 mt-6 border-t border-slate-50">
                                <div className="flex items-center gap-4 text-slate-600">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                                        <Phone size={18} />
                                    </div>
                                    <span className="text-base font-bold text-slate-800">{user.mobile}</span>
                                </div>
                                <div className="flex items-center gap-4 text-slate-600">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <span className="text-base font-bold text-slate-800">{user.email || 'Email not set'}</span>
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
                                                    value={editData.email}
                                                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                                    placeholder="Email address"
                                                    className="h-14 bg-white border-slate-200 rounded-xl px-5 text-base font-bold focus:ring-[#10b981]/10"
                                                />
                                                <span className="absolute -top-2 left-4 bg-white px-1 text-[10px] font-black text-slate-400 uppercase">Email address</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="relative">
                                                <Input
                                                    value={user.mobile}
                                                    disabled
                                                    placeholder="Phone number"
                                                    className="h-14 bg-slate-50 border-slate-200 rounded-xl px-5 text-base font-bold opacity-70"
                                                />
                                                <span className="absolute -top-2 left-4 bg-white px-1 text-[10px] font-black text-slate-400 uppercase">Phone number</span>
                                            </div>
                                            <div className="relative">
                                                <Input
                                                    value={editData.fullName}
                                                    onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                                                    placeholder="Name"
                                                    className="h-14 bg-white border-slate-200 rounded-xl px-5 text-base font-bold focus:ring-[#10b981]/10"
                                                />
                                                <span className="absolute -top-2 left-4 bg-white px-1 text-[10px] font-black text-slate-400 uppercase">Name</span>
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
                                            <div className="relative group">
                                                <Input
                                                    value={editData.panNumber}
                                                    onChange={(e) => setEditData({ ...editData, panNumber: e.target.value })}
                                                    placeholder="PAN Number"
                                                    className="h-14 bg-white border-slate-200 rounded-xl px-5 text-base font-bold pr-16"
                                                />
                                                <span className="absolute -top-2 left-4 bg-white px-1 text-[10px] font-black text-slate-400 uppercase">PAN Number</span>
                                            </div>
                                            <div className="relative group">
                                                <Input
                                                    value={editData.legalEntityName}
                                                    onChange={(e) => setEditData({ ...editData, legalEntityName: e.target.value })}
                                                    placeholder="Legal Entity Name"
                                                    className="h-14 bg-white border-slate-200 rounded-xl px-5 text-base font-bold pr-16"
                                                />
                                                <span className="absolute -top-2 left-4 bg-white px-1 text-[10px] font-black text-slate-400 uppercase">Legal Entity Name</span>
                                            </div>
                                            <div className="relative group">
                                                <Input
                                                    value={editData.address}
                                                    onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                                                    placeholder="Address"
                                                    className="h-14 bg-white border-slate-200 rounded-xl px-5 text-base font-bold"
                                                />
                                                <span className="absolute -top-2 left-4 bg-white px-1 text-[10px] font-black text-slate-400 uppercase">Address</span>
                                            </div>
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
                                    <Button
                                        onClick={handleSaveProfile}
                                        disabled={isSaving}
                                        className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-lg shadow-lg shadow-emerald-100 active:scale-[0.98] transition-all"
                                    >
                                        {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Save Changes'}
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
                                        onClick={handleChangePassword}
                                        disabled={!passwordData.old || !passwordData.new || !passwordData.confirm || isSaving}
                                        className={cn(
                                            "w-full h-14 rounded-xl text-base font-bold shadow-lg transition-all active:scale-[0.98]",
                                            (!passwordData.old || !passwordData.new || !passwordData.confirm || isSaving)
                                                ? "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed"
                                                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100"
                                        )}
                                    >
                                        {isSaving ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Change Password'}
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
