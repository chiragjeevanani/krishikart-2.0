import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Search, MapPin, Heart, ShoppingCart, User, Sprout, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWishlist } from '../../contexts/WishlistContext'
import { useCart } from '../../contexts/CartContext'
import categoriesData from '../../data/categories.json'
import { cn } from '@/lib/utils'

const PLACEHOLDERS = [
    "Search 'Fresh Apples'...",
    "Search 'Organic Spinach'...",
    "Search 'Alphonso Mango'...",
    "Search 'Red Bell Peppers'...",
    "Search 'Fresh Cilantro'...",
    "Search 'Broccoli'..."
]

export default function DesktopNavbar() {
    const navigate = useNavigate()
    const location = useLocation()
    const { wishlistCount } = useWishlist()
    const { cartCount } = useCart()

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

    return (
        <nav className={cn(
            "w-full bg-white transition-all duration-300 border-b border-slate-100 z-50",
            isScrolled ? "shadow-md" : ""
        )}>
            {/* Main Navbar */}
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center gap-8">
                {/* Logo */}
                <div
                    onClick={() => navigate('/home')}
                    className="flex items-center gap-2 cursor-pointer group shrink-0"
                >
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-900/10 group-hover:rotate-12 transition-transform">
                        <Sprout size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tighter">
                        Krishi<span className="text-primary">Kart</span>
                    </h1>
                </div>

                {/* Delivery Info */}
                <div className="hidden xl:flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm border border-slate-100">
                        <MapPin size={16} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Delivery to</span>
                        <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-slate-900">Pune, Maharashtra</span>
                            <ChevronDown size={12} className="text-slate-400" />
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="flex-1 relative group max-w-2xl mx-auto">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10 transition-colors group-focus-within:text-primary">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder=""
                        className="w-full h-11 pl-12 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                    />
                    {!searchValue && (
                        <div className="absolute left-12 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-sm font-medium">
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={index}
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -10, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {PLACEHOLDERS[index]}
                                </motion.span>
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 shrink-0">
                    {/* Wishlist */}
                    <button
                        onClick={() => navigate('/wishlist')}
                        className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all font-bold group"
                    >
                        <Heart size={20} fill={wishlistCount > 0 ? "currentColor" : "none"} className={cn(wishlistCount > 0 && "text-red-500")} />
                        {wishlistCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white shadow-sm font-bold">
                                {wishlistCount}
                            </span>
                        )}
                    </button>

                    {/* Cart */}
                    <button
                        onClick={() => navigate('/cart')}
                        className="relative h-10 px-4 flex items-center gap-2 rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all font-bold group"
                    >
                        <ShoppingCart size={20} />
                        <span className="text-sm">Cart</span>
                        {cartCount > 0 && (
                            <span className="w-5 h-5 bg-primary text-white text-[10px] rounded-full flex items-center justify-center border-2 border-slate-900 shadow-sm">
                                {cartCount}
                            </span>
                        )}
                    </button>

                    <div className="w-[1px] h-8 bg-slate-200 mx-2" />

                    {/* Profile */}
                    <button
                        onClick={() => navigate('/profile')}
                        className="flex items-center gap-2 pl-1 pr-3 py-1 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-all group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs font-bold text-slate-900 tracking-tight">Felix</span>
                        <ChevronDown size={14} className="text-slate-400 transition-transform group-hover:translate-y-0.5" />
                    </button>
                </div>
            </div>
        </nav>
    )
}
