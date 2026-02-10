import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Camera, User, Mail, Phone, MapPin } from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import { Button } from '@/components/ui/button'

export default function EditProfileScreen() {
    const navigate = useNavigate()

    return (
        <PageTransition>
            <div className="bg-white min-h-screen">
                {/* Header */}
                <div className="px-6 py-6 border-b border-slate-50 flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">Edit Profile</h1>
                </div>

                <div className="p-6">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-[40px] bg-slate-100 overflow-hidden border-4 border-white shadow-xl">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" className="w-full h-full object-cover" />
                            </div>
                            <button className="absolute bottom-0 right-0 w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg border-2 border-white">
                                <Camera size={18} />
                            </button>
                        </div>
                        <p className="mt-4 text-xs font-black text-primary uppercase tracking-widest">Change Photo</p>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-6">
                        {[
                            { label: 'Full Name', icon: User, value: 'Rajesh Kumar' },
                            { label: 'Email Address', icon: Mail, value: 'rajesh.kumar@business.com' },
                            { label: 'Phone Number', icon: Phone, value: '+91 9876543210' },
                            { label: 'Business Location', icon: MapPin, value: 'Pune, Maharashtra' }
                        ].map((field, i) => (
                            <div key={i} className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{field.label}</label>
                                <div className="relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                                        <field.icon size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        defaultValue={field.value}
                                        className="w-full h-16 pl-14 pr-6 bg-slate-50 rounded-2xl border-none text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button className="w-full h-16 rounded-3xl bg-primary mt-12 text-lg font-black shadow-lg shadow-green-100">
                        Save Changes
                    </Button>
                </div>
            </div>
        </PageTransition>
    )
}
