import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    ArrowLeft, AlertCircle, MessageSquare,
    CircleDollarSign, FileText, Phone, Mail, Edit3
} from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

export default function EditProfileScreen() {
    const navigate = useNavigate()
    const [preferences, setPreferences] = useState({
        whatsapp: false,
        tax: false,
        paper: false
    })

    const togglePreference = (key) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const userData = {
        name: 'chirag',
        phone: '8225819420',
        email: 'chirag@gmail.com',
        pan: 'Unverified',
        entity: 'Guest Account'
    }

    return (
        <PageTransition>
            <div className="bg-[#f2f5f8] min-h-screen pb-10 font-sans">
                {/* Header */}
                <div className="bg-white px-5 py-4 flex items-center gap-4 shadow-sm border-b border-slate-100">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 active:scale-90 transition-transform"
                    >
                        <ArrowLeft size={18} strokeWidth={2.5} />
                    </button>
                    <h1 className="text-[17px] font-black text-slate-900 tracking-tight">Profile Settings</h1>
                </div>

                <div className="p-4 space-y-4">
                    {/* User Details Card */}
                    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-white space-y-5">
                        <div className="space-y-1">
                            <label className="text-[12px] font-medium text-slate-400">User name</label>
                            <p className="text-[18px] font-black text-slate-900 tracking-tight leading-tight">{userData.name}</p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[12px] font-medium text-slate-400">Login phone number</label>
                            <p className="text-[16px] font-bold text-slate-800 leading-tight">{userData.phone}</p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[12px] font-medium text-slate-400">Email address</label>
                            <p className="text-[16px] font-bold text-slate-800 leading-tight">{userData.email}</p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[12px] font-medium text-slate-400">PAN card number</label>
                            <div className="flex items-center gap-1.5 text-orange-500">
                                <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center text-white">
                                    <span className="text-[10px] font-black">!</span>
                                </div>
                                <span className="text-[14px] font-bold">Unverified</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[12px] font-medium text-slate-400">Legal entity name</label>
                            <p className="text-[16px] font-bold text-slate-800 leading-tight">{userData.entity}</p>
                        </div>

                        {/* Buttons Group */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button className="h-10 border border-primary text-primary rounded-lg text-[13px] font-black px-4 active:scale-95 transition-all">
                                Change Password
                            </button>
                            <button className="h-10 bg-primary text-white rounded-lg text-[13px] font-black px-4 active:scale-95 transition-all shadow-md shadow-green-100">
                                Edit Details
                            </button>
                        </div>

                        <div className="pt-2 border-t border-slate-50">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <MessageSquare size={16} className="text-slate-400" />
                                        <span className="text-[13px] font-bold text-slate-700">Send me order updates on WhatsApp</span>
                                    </div>
                                    <Switch
                                        checked={preferences.whatsapp}
                                        onCheckedChange={() => togglePreference('whatsapp')}
                                        className="scale-90"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <CircleDollarSign size={16} className="text-slate-400" />
                                        <span className="text-[13px] font-bold text-slate-700">Show prices including tax</span>
                                    </div>
                                    <Switch
                                        checked={preferences.tax}
                                        onCheckedChange={() => togglePreference('tax')}
                                        className="scale-90"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 active:scale-95">
                                        <FileText size={16} className="text-slate-400" />
                                        <span className="text-[13px] font-bold text-slate-700">Send me paper invoice with orders.</span>
                                    </div>
                                    <Switch
                                        checked={preferences.paper}
                                        onCheckedChange={() => togglePreference('paper')}
                                        className="scale-90"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Address Detail Card */}
                    <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-white">
                        <div className="p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-[18px] font-black text-slate-900 tracking-tight leading-none">{userData.name}</h2>
                                <button className="flex items-center gap-1 text-[13px] font-black text-primary uppercase tracking-tighter">
                                    <Edit3 size={14} />
                                    edit
                                </button>
                            </div>

                            <p className="text-[14px] font-medium text-slate-500 leading-relaxed -mt-1">
                                pipliyahahna, Indore - 452012
                            </p>

                            <div className="space-y-2 pt-2">
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Phone size={15} className="text-slate-400" />
                                    <span className="text-[14px] font-bold">{userData.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Mail size={15} className="text-slate-400" />
                                    <span className="text-[14px] font-bold">{userData.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    )
}
