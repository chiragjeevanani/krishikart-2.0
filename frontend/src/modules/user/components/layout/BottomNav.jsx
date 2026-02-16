import { ShoppingBasket, Heart, ShoppingBag, UserCircle } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { cn } from '../../../../lib/utils'
import { useWishlist } from '../../contexts/WishlistContext'

const navItems = [
    { icon: ShoppingBasket, label: 'Shop', path: '/home' },
    { icon: Heart, label: 'My list', path: '/wishlist', key: 'wishlist' },
    { icon: ShoppingBag, label: 'Orders', path: '/orders' },
    { icon: UserCircle, label: 'Account', path: '/profile' }
]

export default function BottomNav() {
    const navigate = useNavigate()
    const location = useLocation()
    const { wishlistCount } = useWishlist()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 flex items-center justify-around h-16 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path
                const Icon = item.icon

                return (
                    <button
                        key={item.label}
                        onClick={() => navigate(item.path)}
                        className="flex-1 flex flex-col items-center justify-center gap-1.5 py-1 transition-all active:scale-95"
                    >
                        <div className="relative">
                            <Icon
                                size={22}
                                className={cn(
                                    "transition-colors duration-200",
                                    isActive ? "text-emerald-500" : "text-slate-400"
                                )}
                                strokeWidth={1.5}
                            />
                            {item.key === 'wishlist' && wishlistCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white">
                                    {wishlistCount}
                                </span>
                            )}
                        </div>
                        <span className={cn(
                            "text-[11px] font-semibold transition-colors duration-200",
                            isActive ? "text-emerald-600" : "text-slate-400"
                        )}>
                            {item.label}
                        </span>
                    </button>
                )
            })}
        </nav>
    )
}
