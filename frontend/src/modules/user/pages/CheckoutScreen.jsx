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
                        className="w-24 h-24 bg-primary rounded-[40px] md:rounded-xl flex items-center justify-center text-white mb-8 shadow-2xl shadow-green-100"
                    >
                        <Check size={48} strokeWidth={3} />
                    </motion.div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight md:font-bold">Order placed successfully!</h1>
                    <p className="mt-4 text-slate-500 font-medium max-w-md">Your fresh harvest will be delivered to your doorstep within <span className="text-primary font-bold">25 - 30 mins</span>.</p>

                    <div className="mt-12 bg-slate-50 rounded-[32px] md:rounded-xl p-6 w-full max-w-md border border-slate-100 flex items-center justify-between mx-auto">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl md:rounded-lg flex items-center justify-center text-primary shadow-sm border border-slate-50">
                                <Clock size={24} />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] text-slate-400 font-black uppercase md:normal-case md:font-medium">Estimated arrival</p>
                                <p className="text-sm font-black text-slate-900 md:font-bold">4:30 PM Today</p>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={() => navigate(`/track-order/${lastOrder?.id}`)}
                        className="mt-12 w-full max-w-md h-16 md:h-14 rounded-3xl md:rounded-lg bg-primary text-xl font-black md:font-bold md:text-lg shadow-lg shadow-green-100 active:scale-95 transition-all"
                    >
                        Track My Order
                    </Button>
                </div>
            </PageTransition>
        )
    }

    return (
        <PageTransition>
            <div className="bg-[#f8fafd] min-h-screen pb-40 md:pb-20">
                {/* Mobile Header */}
                <div className="sticky top-0 z-40 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between md:hidden">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">Checkout</h1>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto md:px-8">
                    <div className="md:flex md:gap-8 md:py-12">
                        <div className="flex-1 space-y-10 px-6 md:px-0">
                            <div className="hidden md:flex items-center justify-between mb-4">
                                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Checkout</h1>
                                <div className="flex items-center gap-3">
                                    <div className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all", step >= 1 ? "bg-primary text-white" : "bg-slate-100 text-slate-400")}>
                                        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span> Address
                                    </div>
                                    <div className="w-8 h-[1px] bg-slate-200" />
                                    <div className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all", step >= 2 ? "bg-primary text-white" : "bg-slate-100 text-slate-400")}>
                                        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span> Payment
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Address */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest md:normal-case md:tracking-normal md:text-slate-900 md:text-base">Delivery Address</h2>
                                    <button className="text-primary text-[11px] font-bold uppercase transition-colors hover:text-primary/80">Change</button>
                                </div>
                                <div className="bg-white rounded-[32px] md:rounded-xl p-6 border border-slate-100 shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl md:rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0">
                                            <MapPin size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black text-slate-900 md:font-bold">Sweet Home</h3>
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
                                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest md:normal-case md:tracking-normal md:text-slate-900 md:text-base">Delivery Schedule</h2>
                                </div>
                                <div className="bg-white rounded-[32px] md:rounded-xl p-6 border border-slate-100 shadow-sm flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl md:rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0">
                                            <Clock size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black text-slate-900 md:font-bold">Instant Delivery</h3>
                                            <p className="text-xs text-primary font-bold mt-1">Delivery in 30 mins</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-slate-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
                                </div>
                            </section>

                            {/* Payment Method */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest md:normal-case md:tracking-normal md:text-slate-900 md:text-base">Select Payment Method</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[
                                        { id: 'wallet', name: 'KK Wallet', icon: Wallet, color: 'text-primary bg-primary/5', subtitle: `Balance: ₹${balance.toLocaleString()}` },
                                        { id: 'upi', name: 'Google Pay / UPI', icon: Sparkles, color: 'text-blue-500 bg-blue-50' },
                                        { id: 'card', name: 'Credit / Debit Card', icon: CreditCard, color: 'text-purple-500 bg-purple-50' },
                                        { id: 'cod', name: 'Cash on Delivery', icon: ShieldCheck, color: 'text-emerald-500 bg-emerald-50' }
                                    ].map((method) => (
                                        <button
                                            key={method.id}
                                            onClick={() => setSelectedMethod(method.id)}
                                            className={cn(
                                                "w-full p-4 rounded-[28px] md:rounded-xl bg-white border flex items-center justify-between transition-all outline-none text-left",
                                                selectedMethod === method.id ? "border-primary bg-primary/[0.02] shadow-sm" : "border-slate-100 hover:border-slate-200"
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn("w-12 h-12 rounded-2xl md:rounded-lg flex items-center justify-center", method.color)}>
                                                    <method.icon size={22} />
                                                </div>
                                                <div className="text-left">
                                                    <span className="text-sm font-bold text-slate-900 leading-none">{method.name}</span>
                                                    {method.subtitle && <p className="text-[10px] font-medium text-primary mt-1">{method.subtitle}</p>}
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                                selectedMethod === method.id ? "border-primary bg-primary" : "border-slate-200"
                                            )}>
                                                {selectedMethod === method.id && <Check size={12} className="text-white" strokeWidth={4} />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="w-full md:w-[400px] shrink-0 mt-10 md:mt-0 px-6 md:px-0">
                            <div className="bg-white rounded-[40px] md:rounded-xl p-8 space-y-6 border border-slate-100 shadow-sm sticky top-24">
                                <h3 className="text-base font-bold text-slate-900 mb-4">Checkout Summary</h3>

                                <div className="space-y-4 pt-2">
                                    <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                                        <span>Order Value</span>
                                        <span>₹{cartTotal}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                                        <span>Delivery Fee</span>
                                        <span className="text-green-600 font-bold">₹{deliveryFee}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                                        <span>GST (5%)</span>
                                        <span>₹{tax}</span>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-6">
                                    <div className="flex justify-between items-center mb-8">
                                        <span className="text-xl font-bold text-slate-900">Total Payable</span>
                                        <span className="text-3xl font-bold text-primary tracking-tight">₹{total}</span>
                                    </div>

                                    <Button
                                        onClick={handlePlaceOrder}
                                        className="hidden md:flex w-full h-14 rounded-lg bg-primary hover:bg-primary/90 text-lg font-bold shadow-lg shadow-green-100 transition-all active:scale-[0.98] items-center justify-center"
                                    >
                                        Place Order Now
                                    </Button>

                                    <div className="mt-6 flex items-center justify-center gap-2 text-slate-400">
                                        <ShieldCheck size={16} />
                                        <span className="text-[11px] font-medium">Safe & Secure Transactions</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Proceed - Mobile Only */}
                <div className="fixed bottom-16 left-0 right-0 z-40 px-6 max-w-md mx-auto md:hidden pointer-events-none">
                    <div className="bg-white/95 backdrop-blur-2xl border border-slate-200 shadow-[0_10px_40px_rgba(0,0,0,0.12)] rounded-[32px] p-6 pointer-events-auto">
                        <Button
                            onClick={handlePlaceOrder}
                            className="w-full h-18 rounded-3xl bg-primary hover:bg-primary/90 text-2xl font-black shadow-lg shadow-green-100 transition-all active:scale-[0.98]"
                        >
                            Place Order · ₹{total}
                        </Button>
                    </div>
                </div>
            </div>
        </PageTransition>
    )
}
