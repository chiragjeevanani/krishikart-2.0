import { Search, MapPin, ShoppingCart, Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation as useRouteLocation } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { useLocation } from '../../contexts/LocationContext'
import { toast } from 'sonner'

const PLACEHOLDERS = [
    "Fresh Apples",
    "Organic Spinach",
    "Alphonso Mango",
    "Red Bell Peppers",
    "Fresh Cilantro",
    "Broccoli"
]

export default function StickySearchBar() {
    const navigate = useNavigate()
    const { address, hasFranchisePinned, updateFranchiseLocation, loading } = useLocation()
    const { cartCount } = useCart()

    const [index, setIndex] = useState(0)
    const [searchValue, setSearchValue] = useState("")
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % PLACEHOLDERS.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [])
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768)
        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [])

    const routeLocation = useRouteLocation()
    const [isInitial, setIsInitial] = useState(true)

    useEffect(() => {
        if (isInitial) {
            setIsInitial(false)
            return
        }
        const timer = setTimeout(() => {
            if (searchValue.trim()) {
                navigate(`/products/all?search=${encodeURIComponent(searchValue.trim())}`)
            } else if (routeLocation.pathname.includes('/products/all')) {
                navigate(`/products/all`)
            }
        }, 500)
        return () => clearTimeout(timer)
    }, [searchValue, navigate, routeLocation.pathname, isInitial])

    const topSection = (
        <div className="relative flex items-center justify-between gap-2 min-w-0 w-full">
            {/* Left: logo + location */}
            <div className="flex items-center gap-2 min-w-0 flex-1 pr-2 -mt-3">
                <img
                    src="/logo.png"
                    alt="KrishiKart"
                    className="h-14 w-auto shrink-0 object-contain"
                />
                <button
                    onClick={async () => {
                        // First time: force map selection for nearest-franchise area
                        // Later: treat as "edit" entry point, still via map
                        if (!hasFranchisePinned) {
                            navigate('/location-picker?type=franchise&returnTo=/home');
                        } else {
                            navigate('/location-picker?type=franchise&returnTo=/home');
                        }
                    }}
                    className={`flex items-center gap-1.5 min-w-0 max-w-full cursor-pointer active:scale-95 transition-all min-h-[38px] ${loading ? 'opacity-50' : ''} text-slate-900`}
                >
                    <MapPin size={16} strokeWidth={2.5} className={`shrink-0 ${loading ? 'animate-pulse' : ''}`} />
                    <span className="text-xs font-bold uppercase tracking-wider truncate">
                        {loading ? "Locating..." : (address || "Set Location")}
                    </span>
                </button>
            </div>
            {/* Right: notifications + cart */}
            <div className="flex items-center gap-2 shrink-0">
                <button
                    onClick={() => navigate('/notifications')}
                    className="relative min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-white/30 border border-white/50 shadow-md text-slate-900 active:scale-95 transition-all"
                    aria-label="Notifications"
                >
                    <Bell size={16} className="w-[16px] h-[16px]" />
                </button>
                <button
                    onClick={() => navigate('/cart')}
                    className="relative min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-white/30 border border-white/50 shadow-md text-slate-900 active:scale-95 transition-all"
                >
                    <ShoppingCart size={16} className="w-[16px] h-[16px]" />
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary text-white text-[9px] leading-none font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                            {cartCount > 99 ? '99+' : cartCount}
                        </span>
                    )}
                </button>
            </div>
        </div>
    )

    return (
        <div className="bg-[var(--color-brand-subtle)] md:bg-transparent">
            {/* Fixed header + search overlay – always stays at top of viewport */}
            <motion.div className="fixed top-0 left-0 right-0 z-40 overflow-visible bg-[var(--color-brand-subtle)] md:bg-transparent md:overflow-hidden">
                <motion.div className="overflow-hidden bg-[var(--color-brand-subtle)] md:bg-white px-3 pt-2.5 pb-2.5 md:px-4 md:py-3.5 md:space-y-3 border-b-0 md:border-b md:border-slate-100/80 md:shadow-none">
                    {/* Shimmer – mobile only (search bar); desktop has full header */}
                    <div
                        aria-hidden
                        className="absolute inset-0 w-full min-w-full pointer-events-none md:hidden header-shimmer"
                        style={{
                            background: 'linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.06) 40%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.06) 60%, transparent 100%)',
                            left: 0,
                            right: 0,
                        }}
                    />
                    <div className="mb-2 md:mb-3">
                        {topSection}
                    </div>
                    <form
                onSubmit={(e) => {
                    e.preventDefault();
                    if (searchValue.trim()) {
                        navigate(`/products/all?search=${encodeURIComponent(searchValue.trim())}`);
                    }
                }}
                className="relative group overflow-hidden"
            >
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 z-10 md:left-4 md:text-primary">
                    <Search size={16} strokeWidth={2.5} className="md:w-[18px] md:h-[18px]" />
                </div>
                <div className="relative w-full">
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value.trim())}
                        className="w-full h-11 pl-9 pr-3 md:h-14 md:pl-12 md:pr-4 bg-white md:bg-slate-50 border border-white/30 md:border-none rounded-xl md:rounded-2xl text-xs md:text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none shadow-sm"
                    />
                    {!searchValue && (
                        <div className="absolute left-9 top-1/2 -translate-y-1/2 pointer-events-none w-full h-full flex items-center md:left-12">
                            <span className="text-slate-400 text-xs font-medium md:text-sm flex items-center">
                                <span>Search&nbsp;‘</span>
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={index}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -20, opacity: 0 }}
                                        transition={{ duration: 0.5, ease: "easeInOut" }}
                                    >
                                        {PLACEHOLDERS[index]}
                                    </motion.span>
                                </AnimatePresence>
                                <span>’</span>
                            </span>
                        </div>
                    )}
                </div>
            </form>
                </motion.div>
            </motion.div>
        </div>
    )
}
