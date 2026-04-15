import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft,
    MapPin,
    ChevronRight,
    Clock,
    Sparkles,
    Wallet,
    ShieldCheck,
    Check,
    Loader2,
    X,
    Edit3,
    CreditCard,
    QrCode,
    Ticket,
    CheckCircle2,
    Percent
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
import { geocodeAddressFrontend } from '@/lib/geo'
import { useLocation } from '../contexts/LocationContext'

const SAVED_ADDRESSES_KEY = 'kk_user_saved_addresses'
const ADDRESS_TAGS = [
    { value: 'home', label: 'Home' },
    { value: 'work', label: 'Work' },
    { value: 'other', label: 'Other' }
]

/** Start time of each delivery window (local time). Only slots whose window hasn't started yet are selectable. */
const DELIVERY_SHIFT_SLOTS = [
    { label: '6 AM - 8 AM', start: [6, 0] },
    { label: '8 AM - 10 AM', start: [8, 0] },
    { label: '10 AM - 12 PM', start: [10, 0] },
    { label: '12 PM - 2 PM', start: [12, 0] },
    { label: '2 PM - 4 PM', start: [14, 0] },
    { label: '4 PM - 6 PM', start: [16, 0] },
    { label: '6 PM - 8 PM', start: [18, 0] }
]

function getShiftStartDate(shiftLabel, baseDate = new Date()) {
    const slot = DELIVERY_SHIFT_SLOTS.find((s) => s.label === shiftLabel)
    if (!slot) return null
    const d = new Date(baseDate)
    d.setHours(slot.start[0], slot.start[1], 0, 0)
    return d
}

/** True if this slot can be selected. Before 6 PM: only future windows. From 6 PM onward: all slots (e.g. next-day). */
function isDeliveryShiftSelectable(shiftLabel, now = new Date()) {
    const hour = now.getHours()
    // From 6 PM (18:00) onwards — all slots enabled for ordering (typically next-day delivery)
    if (hour >= 18) {
        return true
    }
    const start = getShiftStartDate(shiftLabel, now)
    if (!start) return false
    return now.getTime() < start.getTime()
}

export default function CheckoutScreen() {
    const navigate = useNavigate()
    const { cartItems, cartTotal, clearCart, deliveryConstraints } = useCart()
    const locationCtx = useLocation()
    const ctxDeliveryAddress = locationCtx?.deliveryAddress
    const ctxDeliveryLocation = locationCtx?.deliveryLocation
    const ctxHasDeliveryPinned = locationCtx?.hasDeliveryPinned
    const ctxUpdateDeliveryLocation = locationCtx?.updateDeliveryLocation
    const { placeOrder } = useOrders()
    const { balance, payWithWallet, useCreditAmount, creditLimit, creditUsed, availableCredit } = useWallet()

    const [step, setStep] = useState(1) // 1: Address, 2: Payment, 3: Success
    /** After place / Razorpay verify: `{ orders, orderGroupId }` (split by category when multiple). */
    const [lastPlacement, setLastPlacement] = useState(null)
    const [selectedMethod, setSelectedMethod] = useState('upi')
    const [isPlacingOrder, setIsPlacingOrder] = useState(false)
    const [isEditingAddress, setIsEditingAddress] = useState(false)

    // Coupon States
    const [couponCode, setCouponCode] = useState('')
    const [appliedCoupon, setAppliedCoupon] = useState(null)
    const [availableCoupons, setAvailableCoupons] = useState([])
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)
    const [showCouponList, setShowCouponList] = useState(false)

    const [user, setUser] = useState(null)
    const [deliveryAddress, setDeliveryAddress] = useState('')
    const [savedAddresses, setSavedAddresses] = useState([])
    const [addressTag, setAddressTag] = useState('home')
    const [addressDetails, setAddressDetails] = useState({
        flat: '',
        floor: '',
        colony: '',
        landmark: '',
        city: 'Indore',
        state: 'Madhya Pradesh'
    });
    const [deliveryShift, setDeliveryShift] = useState('');
    /** Re-render every minute so past slots become disabled without refresh */
    const [shiftTimeTick, setShiftTimeTick] = useState(0)

    useEffect(() => {
        const id = setInterval(() => setShiftTimeTick((n) => n + 1), 60000)
        return () => clearInterval(id)
    }, [])

    useEffect(() => {
        if (!deliveryShift) return
        if (!isDeliveryShiftSelectable(deliveryShift)) {
            setDeliveryShift('')
        }
    }, [deliveryShift, shiftTimeTick])

    const handlePinCurrentLocation = async () => {
        if (!ctxUpdateDeliveryLocation) {
            navigate('/location-picker?type=delivery&returnTo=/checkout');
            return;
        }
        try {
            await ctxUpdateDeliveryLocation(true);
            toast.success('Current location pinned for delivery.');
        } catch (error) {
            console.error('Pin current location error:', error);
            toast.error(error?.message || 'Unable to fetch your current location.');
        }
    }

    const buildFullAddress = (details) => (
        `Flat: ${details.flat}, Floor: ${details.floor}, ${details.colony}, Landmark: ${details.landmark}, ${details.city}, ${details.state}`
    )

    const parseAddressToDetails = (address = '') => {
        if (!address || typeof address !== 'string') return null

        const parts = address.split(',').map(part => part.trim()).filter(Boolean)
        if (parts.length < 5) return null

        let flat = ''
        let floor = ''
        let colony = ''
        let landmark = ''
        let city = 'Indore'
        let state = 'Madhya Pradesh'

        // New format: Flat: X, Floor: Y, Colony..., Landmark: Z, City, State
        if (parts[0]?.toLowerCase().startsWith('flat:') && parts[1]?.toLowerCase().startsWith('floor:') && parts.length >= 6) {
            flat = parts[0].replace(/^Flat:\s*/i, '').trim()
            floor = parts[1].replace(/^Floor:\s*/i, '').trim()
            colony = parts[2] || ''
            landmark = (parts[3] || '').replace(/^Landmark:\s*/i, '').trim()
            city = parts[4] || city
            state = parts[5] || state
        } else {
            // Backward compatibility: Floor, Colony, Landmark, City, State
            floor = parts[0] || ''
            colony = parts[1] || ''
            landmark = (parts[2] || '').replace(/^Landmark:\s*/i, '').trim()
            city = parts[3] || city
            state = parts[4] || state
        }

        return {
            flat: flat || '',
            floor: floor || '',
            colony: colony || '',
            landmark: landmark || '',
            city: city || 'Indore',
            state: state || 'Madhya Pradesh'
        }
    }

    const persistAddressToProfile = async (fullAddress) => {
        if (!fullAddress) return
        await api.put('/user/update-profile', { address: fullAddress })
        setUser(prev => prev ? { ...prev, address: fullAddress } : prev)
        setDeliveryAddress(fullAddress)
    }

    const persistSavedAddresses = (addresses) => {
        setSavedAddresses(addresses)
        localStorage.setItem(SAVED_ADDRESSES_KEY, JSON.stringify(addresses))
    }

    const upsertAddressByTag = (tag, details) => {
        const normalizedTag = tag || 'other'
        const fullAddress = buildFullAddress(details)
        const label = ADDRESS_TAGS.find((item) => item.value === normalizedTag)?.label || 'Other'
        const next = [
            ...(savedAddresses.filter((entry) => entry.tag !== normalizedTag)),
            {
                id: normalizedTag,
                tag: normalizedTag,
                label,
                details,
                fullAddress,
                updatedAt: new Date().toISOString()
            }
        ]
        persistSavedAddresses(next)
        return fullAddress
    }

    const handleSelectSavedAddress = (saved) => {
        if (!saved?.details) return
        setAddressTag(saved.tag || 'other')
        setAddressDetails(saved.details)
        const fullAddress = saved.fullAddress || buildFullAddress(saved.details)
        setDeliveryAddress(fullAddress)
        toast.success(`${saved.label || 'Address'} selected`)
    }

    useEffect(() => {
        fetchProfile()
        fetchAvailableCoupons()
    }, [])

    useEffect(() => {
        try {
            const raw = localStorage.getItem(SAVED_ADDRESSES_KEY)
            if (!raw) return
            const parsed = JSON.parse(raw)
            if (Array.isArray(parsed)) {
                setSavedAddresses(parsed)
            }
        } catch (error) {
            console.error('Failed to parse saved addresses:', error)
        }
    }, [])

    useEffect(() => {
        if (!ctxDeliveryAddress) return;
        setDeliveryAddress(ctxDeliveryAddress);
        const parsed = parseAddressToDetails(ctxDeliveryAddress);
        if (parsed) {
            setAddressDetails(parsed);
        }
    }, [ctxDeliveryAddress])

    const fetchProfile = async () => {
        try {
            const response = await api.get('/user/me')
            const userData = response.data.result
            setUser(userData)
            setDeliveryAddress(userData.address || '')
            if (userData.address) {
                const parsed = parseAddressToDetails(userData.address)
                if (parsed) {
                    setAddressDetails(parsed)
                } else {
                    setAddressDetails(prev => ({ ...prev, colony: userData.address }))
                }
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error)
        }
    }

    const fetchAvailableCoupons = async () => {
        try {
            const response = await api.get('/coupons/visible');
            if (response.data.success) {
                // Backend array response is in 'results'
                setAvailableCoupons(response.data.results || response.data.result || []);
            }
        } catch (error) {
            console.error('Failed to fetch coupons:', error);
        }
    };

    const handleApplyCoupon = async () => {
        if (!couponCode) return
        setIsValidatingCoupon(true)
        try {
            const response = await api.post('/coupons/validate', {
                code: couponCode,
                cartValue: cartTotal
            })
            if (response.data.success) {
                setAppliedCoupon(response.data.result)
                toast.success("Coupon applied!")
                setShowCouponList(false)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid coupon")
            setAppliedCoupon(null)
        } finally {
            setIsValidatingCoupon(false)
        }
    }

    const discountAmount = appliedCoupon ? (appliedCoupon.discount || 0) : 0
    const actualDeliveryFee = cartTotal >= parseFloat(deliveryConstraints.freeMov) ? 0 : parseFloat(deliveryConstraints.baseFee)
    const finalDeliveryFee = (appliedCoupon?.type === 'free_delivery') ? 0 : actualDeliveryFee

    // Dynamic Tax calculation matching backend logic (Entire Order)
    const taxRateString = deliveryConstraints.tax || '0'
    const taxRate = parseFloat(taxRateString) / 100
    const tax = parseFloat(((cartTotal + finalDeliveryFee) * taxRate).toFixed(2))

    const total = parseFloat((cartTotal + finalDeliveryFee + tax - discountAmount).toFixed(2))
    const walletContribution = Math.min(Number(balance || 0), total)
    const walletShortfall = parseFloat(Math.max(0, total - walletContribution).toFixed(2))
    const creditContribution = Math.min(Number(availableCredit || 0), total)
    const creditShortfall = parseFloat(Math.max(0, total - creditContribution).toFixed(2))
    const isWalletShort = selectedMethod === 'wallet' && walletShortfall > 0
    const isCreditShort = selectedMethod === 'credit' && creditShortfall > 0
    const hasStructuredAddress = !!(addressDetails.flat && addressDetails.floor && addressDetails.colony && addressDetails.landmark && addressDetails.city && addressDetails.state)
    const displayAddress = hasStructuredAddress
        ? `Flat: ${addressDetails.flat}, Floor: ${addressDetails.floor}, ${addressDetails.colony}, ${addressDetails.landmark}, ${addressDetails.city}, ${addressDetails.state}`
        : (deliveryAddress || '')

    const handleRazorpayPayment = async (orderData, payableAmount = total) => {
        try {
            // 1. Load Razorpay Script
            const res = await loadRazorpay()
            if (!res) {
                toast.error("Razorpay SDK failed to load. Are you online?")
                return
            }

            // 2. Create Razorpay Order on Backend
            const { data: { result: order } } = await api.post('/payment/create-order', {
                amount: payableAmount
            })

            // 3. Open Razorpay Modal
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "Kisaankart",
                description: "Fresh Harvest Delivery",
                image: "/logo.png",
                order_id: order.id,
                handler: async (response) => {
                    try {
                        setIsPlacingOrder(true)
                        const verifyRes = await api.post('/payment/verify', {
                            ...response,
                            orderData
                        })

                        if (verifyRes.data.success) {
                            const r = verifyRes.data.result
                            if (orderData.paymentMethod === 'Wallet + Online' && orderData.walletAmountUsed > 0) {
                                payWithWallet(orderData.walletAmountUsed)
                            }
                            if (orderData.paymentMethod === 'Credit + Online' && orderData.creditAmountUsed > 0) {
                                useCreditAmount(orderData.creditAmountUsed)
                            }
                            const orders = Array.isArray(r?.orders)
                                ? r.orders
                                : r?.order
                                  ? [r.order]
                                  : r?._id
                                    ? [r]
                                    : []
                            setLastPlacement({
                                orders,
                                orderGroupId: r?.orderGroupId ?? null,
                            })
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
        if (!addressDetails.flat || !addressDetails.floor || !addressDetails.colony || !addressDetails.landmark || !addressDetails.city || !addressDetails.state) {
            toast.error("Please fill all the address fields");
            setIsEditingAddress(true);
            return;
        }
        if (!deliveryShift) {
            toast.error("Please select a delivery shift timing");
            return;
        }
        if (!isDeliveryShiftSelectable(deliveryShift)) {
            toast.error("This delivery slot is no longer available. Please pick a later time.");
            setDeliveryShift('');
            return;
        }

        setIsPlacingOrder(true)

        const methodMap = {
            wallet: 'Wallet',
            credit: 'Credit',
            upi: 'UPI',
            card: 'Card',
            cod: 'COD'
        }

        const fullAddress = buildFullAddress(addressDetails)

        try {
            await persistAddressToProfile(fullAddress)
        } catch (error) {
            console.error('Failed to persist address:', error)
            toast.error('Could not save address to profile')
        }

        // Prefer the exact pinned delivery coordinates from the map.
        // Fallback to geocoding the typed address if coordinates are unavailable.
        let coords = ctxDeliveryLocation || null;
        if (!coords) {
            try {
                coords = await geocodeAddressFrontend(fullAddress);
            } catch (geoErr) {
                // non-fatal
            }
        }

        const orderData = {
            shippingAddress: fullAddress,
            shippingLocation: coords,
            paymentMethod: methodMap[selectedMethod],
            deliveryShift: deliveryShift,
            couponCode: appliedCoupon?.code || '',
            discountAmount: discountAmount
        }

        // Online Payment Flow (Razorpay)
        if (selectedMethod === 'upi') {
            await handleRazorpayPayment(orderData)
            return
        }

        if (selectedMethod === 'wallet') {
            if (walletShortfall > 0) {
                await handleRazorpayPayment({
                    ...orderData,
                    paymentMethod: 'Wallet + Online',
                    walletAmountUsed: walletContribution,
                    onlineAmountPaid: walletShortfall
                }, walletShortfall)
                return
            }
        }

        if (selectedMethod === 'credit') {
            if (creditShortfall > 0) {
                await handleRazorpayPayment({
                    ...orderData,
                    paymentMethod: 'Credit + Online',
                    creditAmountUsed: creditContribution,
                    onlineAmountPaid: creditShortfall
                }, creditShortfall)
                return
            }
        }

        // Standard direct order flow (COD/Wallet/Credit)
        const result = await placeOrder(orderData)

        if (result.success) {
            if (selectedMethod === 'wallet') {
                payWithWallet(walletContribution)
            }
            setLastPlacement({
                orders: result.orders || (result.order ? [result.order] : []),
                orderGroupId: result.orderGroupId ?? null,
            })
            setStep(3)
            setTimeout(() => {
                clearCart()
            }, 500)
        } else {
            toast.error(result.message || "Failed to place order")
        }

        setIsPlacingOrder(false)
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
                    {(lastPlacement?.orders?.length ?? 0) > 1 && (
                        <p className="mt-4 text-sm font-medium text-slate-600 max-w-md">
                            Your cart was split into {lastPlacement.orders.length} orders by category — each is fulfilled by the nearest store for that category. You can track them separately.
                        </p>
                    )}

                    <div className="mt-8 w-full max-w-md space-y-3">
                        {lastPlacement?.orders?.map((order, idx) => (
                            <Button
                                key={order._id || idx}
                                onClick={() => navigate(`/track-order/${order._id}`)}
                                className="w-full h-16 md:h-14 rounded-3xl md:rounded-lg bg-primary text-xl font-black md:font-bold md:text-lg shadow-lg shadow-green-100 active:scale-95 transition-all"
                            >
                                {lastPlacement.orders.length > 1 ? `Track Order ${idx + 1}` : 'Track My Order'}
                            </Button>
                        ))}
                    </div>
                    <Button
                        onClick={() => navigate('/orders')}
                        variant="outline"
                        className="mt-4 w-full max-w-md h-14 rounded-3xl md:rounded-lg text-slate-500 font-bold border-slate-200"
                    >
                        View All Orders
                    </Button>
                </div>
            </PageTransition>
        )
    }

    return (
        <PageTransition>
            <div className="bg-[#f8fafd] min-h-screen overflow-x-hidden pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-20">
                {/* Mobile Header */}
                <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] border-b border-slate-100/80 shadow-[0_1px_10px_rgba(0,0,0,0.04)] flex items-center justify-between md:hidden">
                    <div className="flex items-center gap-3 min-w-0">
                        <button onClick={() => navigate(-1)} className="min-h-[40px] min-w-[40px] shrink-0 flex items-center justify-center rounded-full bg-white border border-slate-100 shadow-sm text-slate-600 active:scale-95 transition-transform">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-lg font-black text-slate-900 tracking-tight truncate">Checkout</h1>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto md:px-8">
                    <div className="md:flex md:gap-8 md:py-12">
                        <div className="flex-1 space-y-10 md:space-y-10 px-4 md:px-0 min-w-0">
                            <div className="hidden md:flex items-center justify-between mb-4">
                                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Checkout</h1>
                                <div className="flex items-center gap-3">
                                    <div className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all", step >= 1 ? "bg-primary text-white" : "bg-slate-100 text-slate-400")}>
                                        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span> Address
                                    </div>
                                    <div className="w-8 h-px bg-slate-200" />
                                    <div className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all", step >= 2 ? "bg-primary text-white" : "bg-slate-100 text-slate-400")}>
                                        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span> Payment
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Address */}
                            <section>
                                <div className="mb-3 md:mb-4">
                                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest md:text-sm md:normal-case md:tracking-normal md:text-slate-900 md:text-base md:font-bold">
                                            Delivery Address
                                        </h2>
                                        <div className="hidden md:flex items-center gap-3 flex-wrap justify-end">
                                            {ctxHasDeliveryPinned && (
                                                <div className="flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1">
                                                    <CheckCircle2 size={12} />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Location pinned</span>
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={handlePinCurrentLocation}
                                                className="flex items-center gap-1 text-[11px] font-bold uppercase text-slate-400 hover:text-primary transition-colors"
                                            >
                                                <MapPin size={12} />
                                                <span>{ctxHasDeliveryPinned ? 'Re-pin my location' : 'Pin my location'}</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => navigate('/location-picker?type=delivery&returnTo=/checkout')}
                                                className="flex items-center gap-1 text-[11px] font-bold uppercase text-slate-400 hover:text-primary transition-colors"
                                            >
                                                <MapPin size={12} />
                                                <span>Pin on map</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsEditingAddress(true)}
                                                className="text-primary text-[11px] font-bold uppercase transition-colors hover:text-primary/80"
                                            >
                                                Change
                                            </button>
                                        </div>
                                    </div>
                                    {/* Mobile: actions on second row — avoids cramped single line */}
                                    <div className="flex flex-wrap items-center gap-2 mt-1 md:hidden">
                                        {ctxHasDeliveryPinned && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">
                                                <CheckCircle2 size={11} className="shrink-0" />
                                                Pinned
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={handlePinCurrentLocation}
                                            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 shadow-sm active:scale-[0.98] transition-transform"
                                        >
                                            <MapPin size={12} className="text-primary shrink-0" />
                                            {ctxHasDeliveryPinned ? 'Re-pin location' : 'Pin my location'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => navigate('/location-picker?type=delivery&returnTo=/checkout')}
                                            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 shadow-sm active:scale-[0.98] transition-transform"
                                        >
                                            <MapPin size={12} className="text-blue-500 shrink-0" />
                                            Pick on map
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl md:rounded-xl p-4 md:p-6 border border-slate-100 shadow-sm">
                                    <div className="flex items-start gap-3 md:gap-4 min-w-0">
                                        <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl md:rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0">
                                            <MapPin size={24} />
                                        </div>
                                        <div className="flex-1 min-w-0 pr-1">
                                            <h3 className="text-sm md:text-base font-black text-slate-900 md:font-bold">{user?.fullName || 'My Home'}</h3>
                                            <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed mt-1 break-words">
                                                {displayAddress || 'No address provided. Tap the pencil to add your address.'}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingAddress(true)}
                                            className="w-9 h-9 shrink-0 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:text-primary hover:bg-primary/5 transition-all border border-slate-100"
                                            aria-label="Edit delivery address"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                    </div>
                                    {savedAddresses.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                                            {savedAddresses
                                                .slice()
                                                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                                                .map((saved) => (
                                                    <button
                                                        key={saved.id || saved.tag}
                                                        onClick={() => handleSelectSavedAddress(saved)}
                                                        className={cn(
                                                            "px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all",
                                                            addressTag === saved.tag
                                                                ? "bg-primary/10 border-primary/30 text-primary"
                                                                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                                                        )}
                                                    >
                                                        {saved.label}
                                                    </button>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            </section>


                            {/* Shift Timing */}
                            <section className="mt-6 md:mt-0 pt-2 md:pt-0 border-t border-slate-200/60 md:border-0">
                                <div className="mb-2 md:mb-3 space-y-1">
                                    <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest md:text-sm md:normal-case md:tracking-normal md:text-slate-900 md:text-base md:font-bold">
                                        Delivery Shift Timing
                                    </h2>
                                    <p className="text-[10px] md:text-xs text-slate-400 font-medium leading-snug">
                                        During the day, only upcoming time windows are selectable. After 6 PM, all slots
                                        open for the next delivery day.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                                    {DELIVERY_SHIFT_SLOTS.map(({ label: shift }) => {
                                        const selectable = isDeliveryShiftSelectable(shift)
                                        const selected = deliveryShift === shift
                                        return (
                                            <button
                                                key={shift}
                                                type="button"
                                                disabled={!selectable}
                                                aria-disabled={!selectable}
                                                onClick={() => {
                                                    if (!selectable) return
                                                    setDeliveryShift(shift)
                                                }}
                                                className={cn(
                                                    'rounded-lg md:rounded-xl border flex items-center justify-center gap-1.5 px-2 py-2.5 md:p-3 text-[11px] md:text-sm font-bold leading-tight text-center transition-all min-h-[2.75rem] md:min-h-0',
                                                    !selectable &&
                                                        'cursor-not-allowed opacity-45 border-slate-100 bg-slate-50 text-slate-400 shadow-none',
                                                    selectable &&
                                                        !selected &&
                                                        'border-slate-100 hover:border-slate-200 text-slate-600 bg-white',
                                                    selectable && selected && 'border-primary bg-primary/5 text-primary shadow-sm'
                                                )}
                                            >
                                                <Clock
                                                    size={12}
                                                    className="shrink-0 md:w-[14px] md:h-[14px]"
                                                    strokeWidth={2.25}
                                                />
                                                <span className="leading-snug">{shift}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                                {DELIVERY_SHIFT_SLOTS.every(({ label }) => !isDeliveryShiftSelectable(label)) && (
                                    <p className="mt-3 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                                        No delivery slots are left for today. Please try again tomorrow.
                                    </p>
                                )}
                            </section>


                            {/* Promo Code */}
                            <section className="mt-4 md:mt-0">
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest md:normal-case md:tracking-normal md:text-slate-900 md:text-base">Apply Coupon</h2>
                                    {availableCoupons.length > 0 && (
                                        <button
                                            onClick={() => setShowCouponList(prev => !prev)}
                                            className="text-primary text-[11px] font-bold uppercase"
                                        >
                                            {showCouponList ? 'Hide Offers' : 'View Offers'}
                                        </button>
                                    )}
                                </div>
                                <div className="bg-white rounded-4xl md:rounded-xl p-4 border border-slate-100 shadow-sm space-y-4">
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value.replace(/\s/g, '').toUpperCase())}
                                                placeholder="Enter Code"
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:outline-none focus:border-primary transition-all uppercase"
                                            />
                                        </div>
                                        <Button
                                            onClick={handleApplyCoupon}
                                            disabled={isValidatingCoupon || !couponCode}
                                            className="rounded-xl px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold"
                                        >
                                            {isValidatingCoupon ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
                                        </Button>
                                    </div>

                                    {appliedCoupon && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 flex items-start justify-between group"
                                        >
                                            <div className="flex gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                                    <CheckCircle2 size={24} />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-black text-slate-900 uppercase">'{appliedCoupon.code}' Applied!</span>
                                                        <span className="px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] font-black rounded-sm uppercase tracking-widest">
                                                            Save ₹{appliedCoupon.discount}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] font-bold text-emerald-700 leading-tight">
                                                        {appliedCoupon.message || appliedCoupon.title || "Discount applied successfully!"}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}
                                                className="w-8 h-8 rounded-full hover:bg-emerald-100 flex items-center justify-center text-emerald-600 transition-all"
                                            >
                                                <X size={16} />
                                            </button>
                                        </motion.div>
                                    )}

                                    <AnimatePresence>
                                        {showCouponList && availableCoupons.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="pt-2 space-y-3 overflow-hidden"
                                            >
                                                <div className="h-px bg-slate-100 my-2" />
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-0.5">Exclusive Offers for You</h4>
                                                <div className="space-y-3 max-h-64 overflow-y-auto pr-1 no-scrollbar">
                                                    {availableCoupons.map((coupon) => (
                                                        <div
                                                            key={coupon._id}
                                                            onClick={() => { setCouponCode(coupon.code); }}
                                                            className="p-4 rounded-2xl border border-dashed border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 cursor-pointer transition-all flex items-center justify-between group relative overflow-hidden"
                                                        >
                                                            <div className="flex items-center gap-4 relative z-10">
                                                                <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all duration-300">
                                                                    <Percent size={20} />
                                                                </div>
                                                                <div className="space-y-0.5">
                                                                    <div className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                                                        {coupon.code}
                                                                        {coupon.isFirstTimeUserOnly && (
                                                                            <span className="text-[8px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-black uppercase">NEW USER</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight">{coupon.title}</div>
                                                                    {coupon.description && (
                                                                        <div className="text-[10px] text-slate-400 font-bold lowercase italic leading-none mt-1 line-clamp-1">{coupon.description}</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest px-3 py-1.5 rounded-lg border border-emerald-100 bg-white shadow-sm group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all">
                                                                Use Now
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </section>


                            {/* Payment Method */}
                            <section className="mt-4 md:mt-0">
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest md:normal-case md:tracking-normal md:text-slate-900 md:text-base">Select Payment Method</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {(() => {
                                        const paymentMethods = [
                                            {
                                                id: 'wallet',
                                                name: 'KK Wallet',
                                                icon: Wallet,
                                                color: 'text-primary bg-primary/5',
                                                subtitle: walletShortfall > 0
                                                    ? `Use ₹${walletContribution.toLocaleString()} from wallet, pay ₹${walletShortfall.toLocaleString()} online`
                                                    : 'Balance: ₹' + balance.toLocaleString()
                                            },
                                            {
                                                id: 'credit',
                                                name: 'KK Credit',
                                                icon: CreditCard,
                                                color: 'text-amber-600 bg-amber-50',
                                                subtitle: creditShortfall > 0
                                                    ? `Use ₹${creditContribution.toLocaleString()} from credit, pay ₹${creditShortfall.toLocaleString()} online`
                                                    : 'Available: ₹' + availableCredit.toLocaleString()
                                            },
                                            { id: 'upi', name: 'Google Pay / UPI', icon: Sparkles, color: 'text-blue-500 bg-blue-50' },
                                            { id: 'cod', name: 'Cash on Delivery', icon: ShieldCheck, color: 'text-emerald-500 bg-emerald-50' }
                                        ];

                                        return paymentMethods.map((method) => (
                                            <button
                                                key={method.id}
                                                onClick={() => setSelectedMethod(method.id)}
                                                className={cn(
                                                    "w-full p-4 rounded-[28px] md:rounded-xl bg-white border flex items-center justify-between transition-all outline-none text-left",
                                                    selectedMethod === method.id ? "border-primary bg-primary/2 shadow-sm" : "border-slate-100 hover:border-slate-200"
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
                        <div className="w-full md:w-100 shrink-0 mt-8 md:mt-0 px-4 md:px-0">
                            <div className="bg-white rounded-[32px] md:rounded-xl p-6 space-y-4 border border-slate-100 shadow-sm sticky top-24">
                                <h3 className="text-base font-bold text-slate-900 mb-2">Checkout Summary</h3>

                                <div className="space-y-4 pt-2">
                                    <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                                        <span>Order Value</span>
                                        <span>₹{cartTotal}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                                        <span>Delivery Fee</span>
                                        <span className={finalDeliveryFee === 0 ? "text-green-600 font-bold" : ""}>
                                            {finalDeliveryFee === 0 ? 'FREE' : `₹${finalDeliveryFee}`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                                        <span>Taxes & Charges ({taxRateString}%)</span>
                                        <span title={`GST applied to total order amount`}>₹{tax}</span>
                                    </div>
                                    {discountAmount > 0 && (
                                        <div className="flex justify-between items-center text-sm font-bold text-emerald-600">
                                            <span>Coupon Discount</span>
                                            <span>- ₹{discountAmount}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
                                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                                        <span>KK Wallet Balance</span>
                                        <span className="tabular-nums">₹{balance.toLocaleString()}</span>
                                    </div>
                                    {selectedMethod === 'wallet' && (
                                        <div className="flex items-center justify-between text-[11px] font-bold text-primary">
                                            <span>{walletShortfall > 0 ? 'Wallet Used Now' : 'Wallet Covers'}</span>
                                            <span className="tabular-nums">₹{walletContribution.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {isWalletShort && (
                                        <div className="flex items-center justify-between text-[11px] font-bold text-blue-600">
                                            <span>Online Remaining</span>
                                            <span className="tabular-nums">₹{walletShortfall.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {selectedMethod === 'credit' && (
                                        <div className="flex items-center justify-between text-[11px] font-bold text-amber-700">
                                            <span>{creditShortfall > 0 ? 'Credit Used Now' : 'Credit Covers'}</span>
                                            <span className="tabular-nums">₹{creditContribution.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {isCreditShort && (
                                        <div className="flex items-center justify-between text-[11px] font-bold text-blue-600">
                                            <span>Online Remaining</span>
                                            <span className="tabular-nums">₹{creditShortfall.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-700">
                                        <span>KK Credit Available</span>
                                        <span className="tabular-nums">₹{availableCredit.toLocaleString()}</span>
                                    </div>
                                </div>

                                {isWalletShort && (
                                    <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[11px] font-bold text-blue-700">
                                        Your wallet balance will be used first. The remaining ₹{walletShortfall.toLocaleString()} will open in online payment automatically.
                                    </div>
                                )}
                                {isCreditShort && (
                                    <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[11px] font-bold text-blue-700">
                                        Your credit balance will be used first. The remaining ₹{creditShortfall.toLocaleString()} will open in online payment automatically.
                                    </div>
                                )}

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
                <div className="fixed bottom-0 left-0 right-0 z-60 bg-white/95 backdrop-blur-xl border-t border-slate-100/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] max-w-md mx-auto md:hidden">
                    <div className="flex items-center gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                        <div className="shrink-0 flex flex-col justify-center min-w-0 max-w-[42%]">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Final Amount</span>
                            <span className="text-lg font-black text-slate-900 leading-none tracking-tight tabular-nums truncate">₹{total}</span>
                        </div>

                        <Button
                            onClick={handlePlaceOrder}
                            disabled={isPlacingOrder || cartItems.length === 0}
                            className="flex-1 min-h-[48px] h-11 rounded-xl bg-primary hover:bg-primary/90 text-sm font-bold shadow-md shadow-primary/15 transition-all active:scale-[0.98] flex items-center justify-center px-3"
                        >
                            {isPlacingOrder ? <Loader2 className="animate-spin mr-2 size-4" /> : 'Place Order Now'}
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
                                className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-100"
                            />
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[40px] z-101 p-8 pb-12 shadow-2xl md:max-w-xl md:mx-auto md:bottom-10 md:rounded-[40px]"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-slate-900">Change Delivery Address</h2>
                                    <button onClick={() => setIsEditingAddress(false)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Save as</label>
                                        <div className="flex gap-2">
                                            {ADDRESS_TAGS.map((tag) => (
                                                <button
                                                    key={tag.value}
                                                    type="button"
                                                    onClick={() => setAddressTag(tag.value)}
                                                    className={cn(
                                                        "px-3 py-2 rounded-xl border text-xs font-bold transition-all",
                                                        addressTag === tag.value
                                                            ? "border-primary bg-primary/5 text-primary"
                                                            : "border-slate-200 text-slate-500 hover:border-slate-300"
                                                    )}
                                                >
                                                    {tag.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={addressDetails.flat}
                                            onChange={(e) => setAddressDetails(prev => ({ ...prev, flat: e.target.value }))}
                                            placeholder="Flat / House No. *"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                        <input
                                            type="text"
                                            value={addressDetails.floor}
                                            onChange={(e) => setAddressDetails(prev => ({ ...prev, floor: e.target.value }))}
                                            placeholder="Floor *"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                        <input
                                            type="text"
                                            value={addressDetails.colony}
                                            onChange={(e) => setAddressDetails(prev => ({ ...prev, colony: e.target.value }))}
                                            placeholder="Colony / Street / Area *"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                        <input
                                            type="text"
                                            value={addressDetails.landmark}
                                            onChange={(e) => setAddressDetails(prev => ({ ...prev, landmark: e.target.value }))}
                                            placeholder="Landmark *"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                        <div className="flex gap-3">
                                            <input
                                                type="text"
                                                value={addressDetails.city}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                                    setAddressDetails(prev => ({ ...prev, city: val }));
                                                }}
                                                placeholder="City *"
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                            />
                                            <input
                                                type="text"
                                                value={addressDetails.state}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                                    setAddressDetails(prev => ({ ...prev, state: val }));
                                                }}
                                                placeholder="State *"
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        onClick={async () => {
                                            if (!addressDetails.flat || !addressDetails.floor || !addressDetails.colony || !addressDetails.landmark || !addressDetails.city || !addressDetails.state) {
                                                toast.error("Please fill all required fields");
                                                return;
                                            }
                                            const fullAddress = buildFullAddress(addressDetails)
                                            try {
                                                await persistAddressToProfile(fullAddress)
                                                upsertAddressByTag(addressTag, addressDetails)
                                                toast.success('Address saved')
                                            } catch (error) {
                                                console.error('Save address error:', error)
                                                toast.error('Failed to save address')
                                                return
                                            }
                                            setIsEditingAddress(false)
                                        }}
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





