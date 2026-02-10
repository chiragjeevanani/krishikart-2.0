import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    MapPin,
    CreditCard,
    Calendar,
    ShieldCheck,
    Check,
    ChevronRight,
    Clock,
    Sparkles,
    Wallet
} from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import { Button } from '@/components/ui/button'
import { useCart } from '../contexts/CartContext'
import { useOrders } from '@/modules/user/contexts/OrderContext'
import { useWallet } from '../contexts/WalletContext'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export default function CheckoutScreen() {
    const navigate = useNavigate()
    const { cartItems, cartTotal, clearCart } = useCart()
    const { placeOrder } = useOrders()
    const { balance, payWithWallet } = useWallet()
    const [step, setStep] = useState(1) // 1: Address, 2: Payment, 3: Success
    const [lastOrder, setLastOrder] = useState(null)
    const [selectedMethod, setSelectedMethod] = useState('upi')

    const deliveryFee = 50
    const tax = Math.round(cartTotal * 0.05)
    const total = cartTotal + deliveryFee + tax

    const handlePlaceOrder = () => {
        if (selectedMethod === 'wallet') {
            const success = payWithWallet(total)
            if (!success) {
                alert("Insufficient Wallet Balance!")
                return
            }
        }

        const order = placeOrder({
            total,
            customer: 'Hotel Taj Vivanta',
            franchise: 'KrishiKart Koramangala',
            items: cartItems.map(item => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                qty: `${item.quantity}${item.unit}`,
                price: item.price
            })),
            address: 'Flat 402, Galaxy Apartments, Kothrud, Pune',
            paymentMethod: selectedMethod === 'wallet' ? 'KK Wallet' : selectedMethod.toUpperCase()
        })
        setLastOrder(order)
        setStep(3)
        setTimeout(() => {
            clearCart()
        }, 500)
    }

    if (step === 3) {
        return (
            <PageTransition>
                <div className="bg-white min-h-screen flex flex-col items-center justify-center p-8 text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-24 h-24 bg-primary rounded-[40px] flex items-center justify-center text-white mb-8 shadow-2xl shadow-green-100"
                    >
                        <Check size={48} strokeWidth={3} />
                    </motion.div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order Placed Successfully!</h1>
                    <p className="mt-4 text-slate-500 font-medium">Your fresh harvest will be delivered to your doorstep within <span className="text-primary font-black">25 - 30 mins</span>.</p>

                    <div className="mt-12 bg-slate-50 rounded-[32px] p-6 w-full border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                                <Clock size={24} />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] text-slate-400 font-black uppercase">Estimated Arrival</p>
                                <p className="text-sm font-black text-slate-900">4:30 PM Today</p>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={() => navigate(`/track-order/${lastOrder?.id}`)}
                        className="mt-12 w-full h-16 rounded-3xl bg-primary text-xl font-black shadow-lg shadow-green-100 active:scale-95 transition-all"
                    >
                        Track My Order
                    </Button>
                </div>
            </PageTransition>
        )
    }

    return (
        <PageTransition>
            <div className="bg-[#f8fafd] min-h-screen pb-40">
                {/* Header */}
                <div className="sticky top-0 z-40 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">Checkout</h1>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className={cn("w-2 h-2 rounded-full", step >= 1 ? "bg-primary" : "bg-slate-200")} />
                        <div className={cn("w-2 h-2 rounded-full", step >= 2 ? "bg-primary" : "bg-slate-200")} />
                    </div>
                </div>

                <div className="p-6 space-y-8">
                    {/* Delivery Address */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Delivery Address</h2>
                            <button className="text-primary text-[10px] font-black uppercase">Change</button>
                        </div>
                        <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900">Sweet Home</h3>
                                    <p className="text-sm text-slate-400 font-medium leading-relaxed mt-1">
                                        Flat 402, Galaxy Apartments, <br />
                                        Kothrud, Pune - 411038
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Delivery Time */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Delivery Schedule</h2>
                        </div>
                        <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900">Instant Delivery</h3>
                                    <p className="text-xs text-primary font-black uppercase tracking-widest mt-1">Within 30 mins</p>
                                </div>
                            </div>
                            <ChevronRight className="text-slate-300" />
                        </div>
                    </section>

                    {/* Payment Method */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Payment Method</h2>
                        </div>
                        <div className="space-y-3">
                            {[
                                { id: 'wallet', name: 'KK Wallet', icon: Wallet, color: 'text-primary bg-primary/10', subtitle: `Balance: ₹${balance.toLocaleString()}` },
                                { id: 'upi', name: 'Google Pay / UPI', icon: Sparkles, color: 'text-blue-500 bg-blue-50' },
                                { id: 'card', name: 'Credit / Debit Card', icon: CreditCard, color: 'text-purple-500 bg-purple-50' },
                                { id: 'cod', name: 'Cash on Delivery', icon: ShieldCheck, color: 'text-emerald-500 bg-emerald-50' }
                            ].map((method) => (
                                <button
                                    key={method.id}
                                    onClick={() => setSelectedMethod(method.id)}
                                    className={cn(
                                        "w-full p-4 rounded-[28px] bg-white border flex items-center justify-between transition-all",
                                        selectedMethod === method.id ? "border-primary ring-4 ring-primary/5 shadow-md scale-[1.02]" : "border-slate-100"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", method.color)}>
                                            <method.icon size={22} />
                                        </div>
                                        <div className="text-left">
                                            <span className="text-sm font-black text-slate-900 leading-none">{method.name}</span>
                                            {method.subtitle && <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">{method.subtitle}</p>}
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                        selectedMethod === method.id ? "border-primary bg-primary" : "border-slate-200"
                                    )}>
                                        {selectedMethod === method.id && <Check size={14} className="text-white" strokeWidth={4} />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Summary */}
                    <div className="bg-white rounded-[40px] p-8 space-y-4 border border-slate-100 shadow-sm mt-8">
                        <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                            <span>Order Total</span>
                            <span>₹{cartTotal}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                            <span>Delivery Fee</span>
                            <span>₹{deliveryFee}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                            <span>GST (5%)</span>
                            <span>₹{tax}</span>
                        </div>
                        <div className="border-t border-slate-100 pt-5 flex justify-between items-center">
                            <span className="text-xl font-black text-slate-900">Total Payable</span>
                            <span className="text-2xl font-black text-primary tracking-tighter">₹{total}</span>
                        </div>
                    </div>
                </div>

                {/* Sticky Proceed */}
                <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-2xl border-t border-slate-100 px-6 py-8 pb-12 max-w-md mx-auto rounded-t-[48px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                    <Button
                        onClick={handlePlaceOrder}
                        className="w-full h-18 rounded-3xl bg-primary hover:bg-primary/90 text-2xl font-black shadow-lg shadow-green-100 transition-all active:scale-[0.98]"
                    >
                        Place Order · ₹{total}
                    </Button>
                </div>
            </div>
        </PageTransition>
    )
}
