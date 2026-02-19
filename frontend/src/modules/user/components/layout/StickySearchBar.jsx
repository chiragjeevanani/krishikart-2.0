import { Search, MapPin, Heart, ShoppingCart } from 'lucide-react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWishlist } from '../../contexts/WishlistContext'
import { useCart } from '../../contexts/CartContext'
import { useLocation } from '../../contexts/LocationContext'
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
    const { wishlistCount } = useWishlist()
    const { cartCount } = useCart()
    const { scrollY } = useScroll()
    const opacity = useTransform(scrollY, [0, 50], [1, 0.95])
    const y = useTransform(scrollY, [0, 50], [0, 2])
    const shadow = useTransform(scrollY, [0, 50], ["0 0 0 rgba(0,0,0,0)", "0 10px 30px rgba(0,0,0,0.05)"])

    const [index, setIndex] = useState(0)
    const [searchValue, setSearchValue] = useState("")

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % PLACEHOLDERS.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    return (
        <motion.div
            style={{ opacity, y, boxShadow: shadow }}
            className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-4 py-3 space-y-3"
        >
            <div className="flex items-center justify-between">
                <div
                    onClick={() => updateLocation(true)}
                    className={`flex items-center gap-1.5 text-primary max-w-[70%] cursor-pointer active:scale-95 transition-all ${loading ? 'opacity-50' : ''}`}
                >
                    <MapPin size={16} strokeWidth={2.5} className={`shrink-0 ${loading ? 'animate-pulse' : ''}`} />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900 truncate flex items-center gap-1">
                        {loading ? "Locating..." : (address || "Set Location")}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/wishlist')}
                        className="relative w-10 h-10 flex items-center justify-center rounded-[18px] bg-white border border-slate-100 shadow-sm text-slate-400 active:scale-95 transition-all"
                    >
                        <Heart size={18} fill={wishlistCount > 0 ? "currentColor" : "none"} className={wishlistCount > 0 ? "text-red-500" : ""} />
                        {wishlistCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                {wishlistCount}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => navigate('/cart')}
                        className="relative w-10 h-10 flex items-center justify-center rounded-[18px] bg-white border border-slate-100 shadow-sm text-slate-400 active:scale-95 transition-all"
                    >
                        <ShoppingCart size={18} className="text-slate-900" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div className="relative group overflow-hidden">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 z-10 bg-inherit">
                    <Search size={18} strokeWidth={2.5} />
                </div>
                <div className="relative w-full">
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="w-full h-12 pl-11 pr-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                    {!searchValue && (
                        <div className="absolute left-11 top-1/2 -translate-y-1/2 pointer-events-none w-full h-full flex items-center">
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={index}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                    className="text-slate-400 text-sm font-medium"
                                >
                                    {PLACEHOLDERS[index]}
                                </motion.span>
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
