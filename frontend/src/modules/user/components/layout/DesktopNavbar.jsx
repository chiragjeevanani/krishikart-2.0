import { useState, useEffect } from 'react'
import { useNavigate, useLocation as useRouteLocation, Link } from 'react-router-dom'
import { Search, Heart, ShoppingCart, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../../contexts/CartContext'
import { useWishlist } from '../../contexts/WishlistContext'
import { useLocation } from '../../contexts/LocationContext'
import { cn } from '@/lib/utils'
import MobileProfileDrawer from './MobileProfileDrawer'
import { toast } from 'sonner'

const PLACEHOLDERS = [
    "Search 'Spring Caps'",
    "Search 'Fresh Apples'",
    "Search 'Organic Spinach'",
    "Search 'Alphonso Mango'",
    "Search 'Red Bell Peppers'"
]

export default function DesktopNavbar() {
    const navigate = useNavigate()
    const { cartCount } = useCart()
    const { wishlistCount } = useWishlist()
    const { address, updateLocation, loading } = useLocation()

    const [index, setIndex] = useState(0)
    const [searchValue, setSearchValue] = useState("")
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % PLACEHOLDERS.length)
        }, 3000)

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)

        return () => {
            clearInterval(interval)
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    const handleLocationClick = async () => {
        toast.info("Fetching real-time location...")
        try {
            await updateLocation(true)
            toast.success("Location updated successfully!")
        } catch (error) {
            toast.error("Failed to fetch location. Please enable location access.")
        }
    }

    return (
        <nav className={cn(
            "w-full bg-white transition-all duration-300 border-b border-slate-100 z-50 sticky top-0",
            isScrolled ? "shadow-sm" : ""
        )}>
            {/* Main Navbar */}
            <div className="max-w-[1440px] mx-auto px-6 h-[72px] flex items-center justify-between gap-4">
                {/* Logo Section */}
                <div className="flex items-center gap-6 shrink-0">
                    <div
                        onClick={() => navigate('/home')}
                        className="cursor-pointer group"
                    >
                        <div className="flex flex-col leading-none">
                            <span className="text-[22px] font-black text-slate-900 tracking-tighter">KrishiKart</span>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-0.5">BY KRISHI</span>
                        </div>
                    </div>

                    {/* Delivery Info */}
                    <div
                        onClick={handleLocationClick}
                        className="hidden lg:flex items-center gap-2.5 cursor-pointer group hover:bg-slate-50 px-3 py-1.5 rounded-xl transition-all"
                    >
                        <div className={cn(
                            "w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-teal-600 transition-colors group-hover:bg-teal-100",
                            loading && "animate-pulse"
                        )}>
                            <MapPin size={18} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col max-w-[150px]">
                            <span className="text-[14px] font-bold text-slate-900 leading-tight">Deliver to</span>
                            <span className="text-[12px] font-medium text-slate-400 leading-tight truncate">
                                {loading ? "Fetching..." : (address || "Set Location")}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 max-w-2xl px-4">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (searchValue.trim()) {
                                navigate(`/products/all?search=${encodeURIComponent(searchValue.trim())}`);
                            }
                        }}
                        className="relative group"
                    >
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 z-10">
                            <Search size={18} strokeWidth={2.5} />
                        </div>
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            placeholder=""
                            className="w-full h-[44px] pl-12 pr-4 bg-slate-50/50 border border-slate-100 rounded-full text-[14px] font-medium placeholder:text-slate-400 focus:bg-white focus:border-slate-200 focus:ring-4 focus:ring-slate-100 transition-all outline-none"
                        />
                        {!searchValue && (
                            <div className="absolute left-12 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[14px] font-medium">
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={index}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {PLACEHOLDERS[index]}
                                    </motion.span>
                                </AnimatePresence>
                            </div>
                        )}
                    </form>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 shrink-0">
                    {/* Wishlist */}
                    <button
                        onClick={() => navigate('/wishlist')}
                        className="w-11 h-11 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-rose-500 transition-all group relative active:scale-95"
                    >
                        <Heart size={20} className={cn(wishlistCount > 0 && "fill-rose-500 text-rose-500")} strokeWidth={2.5} />
                        {wishlistCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                                {wishlistCount}
                            </span>
                        )}
                    </button>

                    {/* Cart */}
                    <button
                        onClick={() => navigate('/cart')}
                        className="relative w-11 h-11 flex items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm hover:translate-y-[-1px] transition-all group active:scale-95"
                    >
                        <ShoppingCart size={20} strokeWidth={2.5} />
                        {cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[23px] h-[23px] px-1.5 bg-black text-white text-[11px] leading-none font-black rounded-full flex items-center justify-center border-2 border-white">
                                {cartCount > 99 ? '99+' : cartCount}
                            </span>
                        )}
                    </button>

                    {/* Profile Drawer */}
                    <MobileProfileDrawer />
                </div>
            </div>
        </nav>
    )
}
