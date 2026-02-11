import { motion, AnimatePresence } from 'framer-motion'
import { Home, Grid, ShoppingCart, Package, User } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { cn } from '../../../../lib/utils'
import { useCart } from '../../contexts/CartContext'

const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: Grid, label: 'Categories', path: '/categories' },
    { icon: ShoppingCart, label: 'Cart', path: '/cart', badge: 0 },
    { icon: Package, label: 'Orders', path: '/orders' },
    { icon: User, label: 'Profile', path: '/profile' }
]

export default function BottomNav() {
    const { cartCount } = useCart()
    const navigate = useNavigate()
    const location = useLocation()

    return (
        <div className="fixed bottom-16 left-0 right-0 z-50 flex justify-center pointer-events-none px-6 pb-[env(safe-area-inset-bottom)]">
            <nav className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-[0_10px_40px_rgba(0,0,0,0.1)] rounded-3xl h-16 flex items-center gap-1 w-full max-w-[360px] pointer-events-auto px-2 transition-all">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path
                    const badge = item.label === 'Cart' ? cartCount : 0

                    return (
                        <button
                            key={item.label}
                            onClick={() => navigate(item.path)}
                            className="relative flex-1 flex flex-col items-center justify-center h-full group py-1"
                        >
                            {/* Animated Background Pill */}
                            <AnimatePresence>
                                {isActive && (
                                    <motion.div
                                        layoutId="navPill"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="absolute inset-x-1 inset-y-2 bg-primary/10 rounded-2xl z-0"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                            </AnimatePresence>

                            <div className={cn(
                                "relative z-10 transition-all duration-300 flex flex-col items-center justify-center",
                                isActive ? "text-primary scale-110" : "text-slate-400 group-hover:text-slate-600 group-active:scale-95"
                            )}>
                                <div className="relative">
                                    <item.icon
                                        size={22}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className={cn("transition-transform duration-300")}
                                    />

                                    {/* Cart Badge with Pulse */}
                                    {badge > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-1.5 -right-1.5 flex h-4 w-4"
                                        >
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-[9px] font-black items-center justify-center border border-white">
                                                {badge}
                                            </span>
                                        </motion.span>
                                    )}
                                </div>
                            </div>

                            {/* Active Dot */}
                            {isActive && (
                                <motion.div
                                    layoutId="navDot"
                                    className="absolute bottom-1 w-1 h-1 bg-primary rounded-full z-10"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                        </button>
                    )
                })}
            </nav>
        </div>
    )
}
