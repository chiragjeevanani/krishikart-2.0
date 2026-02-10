import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Plus, Trash2, Home, Briefcase, Heart } from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import { Button } from '@/components/ui/button'

const addresses = [
    { id: 1, type: 'Home', address: 'Flat 402, Galaxy Apartments, Kothrud, Pune - 411038', icon: Home, isDefault: true },
    { id: 2, type: 'Office', address: 'Building Q1, IT Park, Hinjewadi Phase 2, Pune - 411057', icon: Briefcase, isDefault: false },
    { id: 3, type: 'Farm House', address: 'Plot 45, Mulshi Valley, Pune - 412108', icon: Heart, isDefault: false },
]

export default function AddressBookScreen() {
    const navigate = useNavigate()

    return (
        <PageTransition>
            <div className="bg-[#f8fafd] min-h-screen">
                {/* Header */}
                <div className="bg-white px-6 py-6 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">Saved Addresses</h1>
                    </div>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-green-100">
                        <Plus size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {addresses.map((addr) => (
                        <div key={addr.id} className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                            {addr.isDefault && (
                                <div className="absolute top-0 right-0 py-1.5 px-4 bg-primary text-white text-[8px] font-black uppercase rounded-bl-2xl">
                                    Default
                                </div>
                            )}
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    <addr.icon size={22} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-base font-black text-slate-900">{addr.type}</h3>
                                    <p className="text-sm text-slate-400 font-medium leading-relaxed mt-1 pr-8">{addr.address}</p>
                                </div>
                            </div>
                            <div className="mt-6 flex gap-3">
                                <Button variant="outline" className="flex-1 h-12 rounded-2xl border-slate-100 font-bold text-xs uppercase tracking-widest text-slate-500">Edit</Button>
                                <Button variant="outline" className="w-12 h-12 p-0 rounded-2xl border-slate-100 text-slate-300 hover:text-red-500 hover:border-red-100">
                                    <Trash2 size={18} />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6">
                    <div className="bg-slate-900 rounded-[32px] p-6 text-center text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Did you know?</p>
                            <p className="text-sm font-medium text-slate-400">You can save up to <span className="text-white font-black">10 different addresses</span> for quick bulk deliveries.</p>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    )
}
