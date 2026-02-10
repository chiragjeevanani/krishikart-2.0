import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Receipt, Star, RotateCcw, ChevronRight, CheckCircle2 } from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import { Button } from '@/components/ui/button'
import { useOrders } from '@/modules/user/contexts/OrderContext'

export default function OrderSummaryScreen() {
    const navigate = useNavigate()
    const { id } = useParams()
    const { orders } = useOrders()

    const order = orders.find(o => o.id === id)

    if (!order) return null;

    return (
        <PageTransition>
            <div className="bg-[#f8fafd] min-h-screen pb-32">
                {/* Header */}
                <div className="bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">Order Summary</h1>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Status Card */}
                    <div className="bg-white rounded-[40px] p-8 text-center border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                                <CheckCircle2 size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 italic uppercase">Order {order.status}</h2>
                            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1 italic">{order.date}</p>

                            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-50">
                                <Button variant="outline" className="h-14 rounded-2xl border-slate-100 font-black text-xs uppercase tracking-widest gap-2">
                                    <RotateCcw size={16} /> Reorder
                                </Button>
                                <Button className="h-14 rounded-2xl bg-slate-900 font-black text-xs uppercase tracking-widest gap-2">
                                    <Star size={16} className="text-yellow-400 fill-yellow-400" /> Rate Now
                                </Button>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50" />
                    </div>

                    {/* Delivery Info */}
                    <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                                <MapPin size={22} />
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Delivered to</h3>
                                <p className="text-sm font-black text-slate-900 leading-relaxed">{order.address}</p>
                            </div>
                        </div>
                    </div>

                    {/* Bill Details */}
                    <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Bill Details</h3>
                        <div className="space-y-4">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                                    <div>
                                        <p className="text-sm font-black text-slate-900">{item.name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{item.qty} x ₹{(item.price / parseInt(item.qty)).toFixed(2)}</p>
                                    </div>
                                    <span className="text-sm font-black text-slate-900">₹{item.price.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6 space-y-3">
                            <div className="flex justify-between text-xs font-bold text-slate-500">
                                <span>Subtotal</span>
                                <span>₹{order.total.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-slate-500">
                                <span>Delivery Fee</span>
                                <span className="text-primary font-black uppercase tracking-widest">Free</span>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                                <span className="text-lg font-black text-slate-900 tracking-tight italic uppercase">Grand Total</span>
                                <span className="text-2xl font-black text-primary tracking-tighter">₹{order.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    )
}
