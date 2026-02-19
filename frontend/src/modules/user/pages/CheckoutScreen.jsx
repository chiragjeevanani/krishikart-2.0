import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft,
    MapPin,
    CreditCard,
    ChevronRight,
    Clock,
    Sparkles,
    Wallet,
    ShieldCheck,
    Check,
    Loader2,
    X,
    Edit3
} from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import { Button } from '@/components/ui/button'
import { useCart } from '../contexts/CartContext'
import { useOrders } from '@/modules/user/contexts/OrderContext'
import { useWallet } from '../contexts/WalletContext'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import api from '@/lib/axios'
import { toast } from 'sonner'

export default function CheckoutScreen() {
    const navigate = useNavigate()
    const { cartItems, cartTotal, clearCart } = useCart()
    const { placeOrder } = useOrders()
    const { balance, payWithWallet, creditLimit, creditUsed } = useWallet()

    const [step, setStep] = useState(1) // 1: Address, 2: Payment, 3: Success
    const [lastOrder, setLastOrder] = useState(null)
    const [selectedMethod, setSelectedMethod] = useState('upi')
    const [isPlacingOrder, setIsPlacingOrder] = useState(false)
    const [isEditingAddress, setIsEditingAddress] = useState(false)

    const [user, setUser] = useState(null)
    const [deliveryAddress, setDeliveryAddress] = useState('')

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const response = await api.get('/user/me')
            const userData = response.data.result
            setUser(userData)
            setDeliveryAddress(userData.address || '')
        } catch (error) {
            console.error('Failed to fetch profile:', error)
        }
    }

    const deliveryFee = 50
    const tax = Math.round(cartTotal * 0.05)
    const total = cartTotal + deliveryFee + tax

    const handleRazorpayPayment = async (orderData) => {
        try {
            // 1. Load Razorpay Script
            const res = await loadRazorpay()
            if (!res) {
                toast.error("Razorpay SDK failed to load. Are you online?")
                return
            }

            // 2. Create Razorpay Order on Backend
            const { data: { result: order } } = await api.post('/payment/create-order', {
                amount: total
            })

            // 3. Open Razorpay Modal
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "KrishiKart",
                description: "Fresh Harvest Delivery",
                image: "/logo.png",
                order_id: order.id,
                handler: async (response) => {
                    try {
                        setIsPlacingOrder(true)
                        console.log("Payment successful, verifying...", {
                            orderId: response.razorpay_order_id,
                            paymentId: response.razorpay_payment_id
                        })

                        const verifyRes = await api.post('/payment/verify', {
                            ...response,
                            orderData
                        })

                        if (verifyRes.data.success) {
                            console.log("Verification successful, order created:", verifyRes.data.result._id)
                            setLastOrder(verifyRes.data.result)
                            setStep(3)
                            setTimeout(() => {
                                clearCart()
                            }, 500)
                        } else {
                            const errorMsg = verifyRes.data.message || "Payment verification failed"
                            console.error("Verification failed:", errorMsg)
                            toast.error(errorMsg)
                        }
                    } catch (err) {
                        console.error("Verification error details:", {
                            message: err.message,
                            response: err.response?.data,
                            status: err.response?.status
                        })

                        // Show specific error message from backend if available
                        const errorMessage = err.response?.data?.message || err.message || "Payment verification failed"
                        toast.error(errorMessage)
                    } finally {
                        setIsPlacingOrder(false)
                    }
                },
                prefill: {
                    name: user?.fullName,
                    email: user?.email,
                    contact: user?.mobile
                },
                theme: {
                    color: "#00b894" // Primary teal color
                }
            }

            const paymentObject = new window.Razorpay(options)
            paymentObject.open()

        } catch (error) {
            console.error("Razorpay flow error:", error)
            toast.error("Could not initiate payment")
        } finally {
            setIsPlacingOrder(false)
        }
    }

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true)
                return
            }
            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.async = true
            script.onload = () => resolve(true)
            script.onerror = () => resolve(false)
            document.body.appendChild(script)
        })
    }

    const handlePlaceOrder = async () => {
        if (!deliveryAddress) {
            toast.error("Please provide a delivery address")
            return
        }

        setIsPlacingOrder(true)

        const methodMap = {
            wallet: creditLimit > 0 ? 'Credit' : 'Wallet',
            upi: 'UPI',
            card: 'Card',
            cod: 'COD'
        }

        const orderData = {
            shippingAddress: deliveryAddress,
            paymentMethod: methodMap[selectedMethod]
        }

        // Online Payment Flow (Razorpay)
        if (selectedMethod === 'upi' || selectedMethod === 'card') {
            await handleRazorpayPayment(orderData)
            return
        }

        // Wallet/Credit specific checks
        if (selectedMethod === 'wallet') {
            if (creditLimit > 0) {
                const availableCredit = creditLimit - creditUsed;
                if (availableCredit < total) {
                    toast.error("Insufficient Credit Limit!");
                    setIsPlacingOrder(false)
                    return
                }
            } else {
                if (balance < total) {
                    toast.error("Insufficient Wallet Balance!")
                    setIsPlacingOrder(false)
                    return
                }
            }
        }

        // Standard direct order flow (COD/Wallet/Credit)
        const result = await placeOrder(orderData)

        if (result.success) {
            if (selectedMethod === 'wallet') {
                if (creditLimit > 0) {
                    // Credit handled by backend
                } else {
                    payWithWallet(total)
                }
            }
            setLastOrder(result.order)
            setStep(3)
            setTimeout(() => {
                clearCart()
            }, 500)
        }

        setIsPlacingOrder(false)
    }

    if (step === 3) {
        // Calculate estimated delivery time (current time + 30 minutes)
        const estimatedTime = new Date();
        estimatedTime.setMinutes(estimatedTime.getMinutes() + 30);
        const formattedTime = estimatedTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

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

                    <Button
                        onClick={() => navigate(`/track-order/${lastOrder?._id}`)}
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
                                    <button
                                        onClick={() => setIsEditingAddress(true)}
                                        className="text-primary text-[11px] font-bold uppercase transition-colors hover:text-primary/80"
                                    >
                                        Change
                                    </button>
                                </div>
                                <div className="bg-white rounded-[32px] md:rounded-xl p-6 border border-slate-100 shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl md:rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0">
                                            <MapPin size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-base font-black text-slate-900 md:font-bold">{user?.fullName || 'My Home'}</h3>
                                            <p className="text-sm text-slate-400 font-medium leading-relaxed mt-1">
                                                {deliveryAddress || 'No address provided. Click change to add one.'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setIsEditingAddress(true)}
                                            className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary transition-all"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </section>


                            {/* Payment Method */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest md:normal-case md:tracking-normal md:text-slate-900 md:text-base">Select Payment Method</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {(() => {
                                        const availableTotal = balance + (creditLimit - creditUsed);
                                        const paymentMethods = [
                                            {
                                                id: 'wallet',
                                                name: creditLimit > 0 ? 'Business Credit / Wallet' : 'KK Wallet',
                                                icon: Wallet,
                                                color: 'text-primary bg-primary/5',
                                                subtitle: creditLimit > 0
                                                    ? `Available: ₹${availableTotal.toLocaleString()}`
                                                    : `Balance: ₹${balance.toLocaleString()}`
                                            },
                                            { id: 'upi', name: 'Google Pay / UPI', icon: Sparkles, color: 'text-blue-500 bg-blue-50' },
                                            { id: 'card', name: 'Credit / Debit Card', icon: CreditCard, color: 'text-purple-500 bg-purple-50' },
                                            { id: 'cod', name: 'Cash on Delivery', icon: ShieldCheck, color: 'text-emerald-500 bg-emerald-50' }
                                        ];

                                        return paymentMethods.map((method) => (
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
                                        ));
                                    })()}
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
                                    <div className="hidden md:flex justify-between items-center mb-8">
                                        <span className="text-xl font-bold text-slate-900">Total Payable</span>
                                        <span className="text-3xl font-bold text-primary tracking-tight">₹{total}</span>
                                    </div>

                                    <Button
                                        onClick={handlePlaceOrder}
                                        disabled={isPlacingOrder || cartItems.length === 0}
                                        className="hidden md:flex w-full h-14 rounded-lg bg-primary hover:bg-primary/90 text-lg font-bold shadow-lg shadow-green-100 transition-all active:scale-[0.98] items-center justify-center"
                                    >
                                        {isPlacingOrder ? <Loader2 className="animate-spin mr-2" /> : 'Place Order Now'}
                                    </Button>

                                    <div className="mt-4 md:mt-6 flex items-center justify-center gap-2 text-slate-400">
                                        <ShieldCheck size={16} />
                                        <span className="text-[11px] font-medium">Safe & Secure Transactions</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Integrated Sticky Proceed Bar - Mobile Only */}
                <div className="fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:hidden">
                    <div className="flex items-center gap-4 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] px-6">
                        <div className="shrink-0 flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Final Amount</span>
                            <span className="text-[22px] font-black text-slate-900 leading-none tracking-tighter">₹{total}</span>
                        </div>

                        <Button
                            onClick={handlePlaceOrder}
                            disabled={isPlacingOrder || cartItems.length === 0}
                            className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-[15px] font-black shadow-lg shadow-green-100 transition-all active:scale-[0.98]"
                        >
                            {isPlacingOrder ? <Loader2 className="animate-spin mr-2" /> : 'Place Order Now'}
                        </Button>
                    </div>
                </div>

                {/* Edit Address Drawer */}
                <AnimatePresence>
                    {isEditingAddress && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsEditingAddress(false)}
                                className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100]"
                            />
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[40px] z-[101] p-8 pb-12 shadow-2xl md:max-w-xl md:mx-auto md:bottom-10 md:rounded-[40px]"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-slate-900">Change Delivery Address</h2>
                                    <button onClick={() => setIsEditingAddress(false)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <textarea
                                            value={deliveryAddress}
                                            onChange={(e) => setDeliveryAddress(e.target.value)}
                                            rows={4}
                                            placeholder="Enter your full delivery address..."
                                            className="w-full bg-slate-50 border-slate-100 rounded-2xl p-4 text-sm font-medium focus:ring-primary focus:border-primary resize-none"
                                        />
                                    </div>
                                    <Button
                                        onClick={() => setIsEditingAddress(false)}
                                        className="w-full h-12 rounded-xl bg-primary font-bold text-white shadow-lg shadow-green-100"
                                    >
                                        Save Address
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
