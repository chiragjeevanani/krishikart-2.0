import { ShoppingBasket, Heart, ShoppingBag, UserCircle } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { cn } from '../../../../lib/utils'

const navItems = [
    { icon: ShoppingBasket, label: 'Shop', path: '/home' },
    { icon: Heart, label: 'My list', path: '/wishlist' },
    { icon: ShoppingBag, label: 'Orders', path: '/orders' },
    { icon: UserCircle, label: 'Account', path: '/profile' }
]

export default function BottomNav() {
    const navigate = useNavigate()
    const location = useLocation()

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
                        <Icon
                            size={22}
                            className={cn(
                                "transition-colors duration-200",
                                isActive ? "text-emerald-500" : "text-slate-400"
                            )}
                            strokeWidth={1.5}
                        />
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
