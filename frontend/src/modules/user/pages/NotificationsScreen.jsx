import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Bell, Package, Tag, Info, CheckCircle2 } from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'

const notifications = [
    {
        id: 1,
        title: 'Order Delivered',
        message: 'Your order #OD202489 has been successfully delivered.',
        time: '2 hours ago',
        icon: Package,
        color: 'text-green-500 bg-green-50',
        read: false
    },
    {
        id: 2,
        title: 'Flash Sale Alert!',
        message: 'Get up to 50% off on Seeds and Fertilizers. Offer ends tonight!',
        time: '5 hours ago',
        icon: Tag,
        color: 'text-orange-500 bg-orange-50',
        read: true
    },
    {
        id: 3,
        title: 'Wallet Top-up Successful',
        message: '₹500 has been added to your KrishiKart Wallet.',
        time: '1 day ago',
        icon: CheckCircle2,
        color: 'text-blue-500 bg-blue-50',
        read: true
    },
    {
        id: 4,
        title: 'System Update',
        message: 'We have updated our privacy policy. Please review the changes.',
        time: '2 days ago',
        icon: Info,
        color: 'text-slate-500 bg-slate-50',
        read: true
    }
]

export default function NotificationsScreen() {
    const navigate = useNavigate()

    return (
        <PageTransition>
            <div className="bg-[#f8fafd] min-h-screen">
                {/* Header */}
                <div className="bg-white px-6 py-6 border-b border-slate-50 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 active:scale-90 transition-transform">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">Notifications</h1>
                    </div>
                    <button className="text-[10px] font-black uppercase tracking-widest text-primary">Mark all read</button>
                </div>

                <div className="p-6 space-y-4">
                    {notifications.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
                                <Bell size={32} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900">No Notifications</h3>
                            <p className="text-sm text-slate-400 mt-2">You're all caught up!</p>
                        </div>
                    ) : (
                        notifications.map((notif, idx) => (
                            <motion.div
                                key={notif.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`p-5 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden ${notif.read ? 'bg-white' : 'bg-blue-50/50'}`}
                            >
                                {!notif.read && (
                                    <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-red-500" />
                                )}
                                <div className="flex gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${notif.color}`}>
                                        <notif.icon size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900">{notif.title}</h3>
                                        <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">{notif.message}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3">{notif.time}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </PageTransition>
    )
}
