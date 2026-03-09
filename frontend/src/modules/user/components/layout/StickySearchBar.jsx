import { Search, MapPin, ShoppingCart } from 'lucide-react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation as useRouteLocation } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { useLocation } from '../../contexts/LocationContext'
import { toast } from 'sonner'
import MobileProfileDrawer from './MobileProfileDrawer'

const PLACEHOLDERS = [
    "Search 'Fresh Apples'...",
    "Search 'Organic Spinach'...",
    "Search 'Alphonso Mango'...",
    "Search 'Red Bell Peppers'...",
    "Search 'Fresh Cilantro'...",
    "Search 'Broccoli'..."
]

export default function StickySearchBar() {
    const navigate = useNavigate()
    const { address, updateLocation, loading } = useLocation()
    const { cartCount } = useCart()
    const { scrollY } = useScroll()
    const opacity = useTransform(scrollY, [0, 50], [1, 0.95])
    const y = useTransform(scrollY, [0, 50], [0, 2])
    const shadow = useTransform(scrollY, [0, 50], ["0 0 0 rgba(0,0,0,0)", "0 10px 30px rgba(0,0,0,0.05)"])
    const locationRowHeight = 76
    const searchBarTop = useTransform(scrollY, [0, locationRowHeight], [locationRowHeight - 3, -3])
    const headerGradientLr = 'linear-gradient(to right, #16a34a 0%, #65a30d 45%, #65a30d 55%, #fde047 100%)'

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

    const topSection = (
        <div className="relative flex items-center justify-between gap-2 min-w-0 w-full">
            {/* Left: on mobile = logo + location; on desktop = location only */}
            <div className="flex items-center gap-2 min-w-0 flex-1 pr-12 md:pr-0 -mt-3 md:mt-0">
                <img
                    src="/logo.png"
                    alt="KrishiKart"
                    className="h-18 w-auto shrink-0 md:hidden object-contain -mt-1.5"
                />
                <div
                    onClick={async () => {
                        toast.info("Fetching real-time location...")
                        try {
                            await updateLocation(true)
                            toast.success("Location updated!")
                        } catch (err) {
                            toast.error("Failed to fetch location")
                        }
                    }}
                    className={`flex items-center gap-1.5 min-w-0 max-w-full md:max-w-[70%] cursor-pointer active:scale-95 transition-all min-h-[38px] md:min-h-[44px] ${loading ? 'opacity-50' : ''} text-white md:text-primary`}
                >
                    <MapPin size={16} strokeWidth={2.5} className={`shrink-0 md:w-[18px] md:h-[18px] ${loading ? 'animate-pulse' : ''}`} />
                    <span className="text-xs font-bold uppercase tracking-wider truncate md:text-sm md:text-slate-900">
                        {loading ? "Locating..." : (address || "Set Location")}
                    </span>
                </div>
            </div>
            <div className="absolute top-0 right-3 md:static md:top-auto md:right-auto flex items-center gap-2 shrink-0">
                <button
                    onClick={() => navigate('/cart')}
                    className="relative min-h-[38px] min-w-[38px] md:min-h-[44px] md:min-w-[44px] flex items-center justify-center rounded-xl md:rounded-2xl bg-white/30 md:bg-white border border-white/50 md:border-slate-100 shadow-md md:shadow-sm text-white md:text-slate-400 active:scale-95 transition-all"
                >
                    <ShoppingCart size={16} className="md:w-[18px] md:h-[18px] md:text-slate-900 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)] md:drop-shadow-none" />
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary text-white text-[9px] leading-none font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                            {cartCount > 99 ? '99+' : cartCount}
                        </span>
                    )}
                </button>
            </div>
        </div>
    )

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

    return (
        <>
            {/* 1. Location + cart – L→R gradient only, no blur to avoid seam line (scrolls away on mobile) */}
            <div
                className="md:hidden px-3 py-4 min-h-[72px] flex items-center relative"
                style={{ background: headerGradientLr }}
            >
                {topSection}
            </div>

            {/* 2. Search bar – same L→R gradient only; fixed on mobile; no top shadow/glow to avoid line at seam */}
            <motion.div
                style={isMobile ? { top: searchBarTop, background: headerGradientLr } : undefined}
                className="fixed left-0 right-0 z-40 overflow-visible md:sticky md:top-0 md:overflow-hidden md:bg-transparent"
            >
                <motion.div
                    style={{
                        opacity,
                        y,
                        boxShadow: isMobile ? '0 4px 12px rgba(22,163,74,0.15)' : shadow,
                        ...(isMobile ? { background: headerGradientLr } : {}),
                    }}
                    className="overflow-hidden md:bg-white/95 md:backdrop-blur-xl px-3 pt-2.5 pb-2.5 md:px-4 md:py-3.5 md:space-y-3 border-b-2 border-[var(--color-brand-primary)]/30 md:border-slate-100/80 md:shadow-none md:border-b -mt-[4px] md:mt-0"
                >
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
                    <div className="hidden md:block">{topSection}</div>
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
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={index}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                    className="text-slate-400 text-xs font-medium md:text-sm"
                                >
                                    {PLACEHOLDERS[index]}
                                </motion.span>
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </form>
                </motion.div>
            </motion.div>
        </>
    )
}
