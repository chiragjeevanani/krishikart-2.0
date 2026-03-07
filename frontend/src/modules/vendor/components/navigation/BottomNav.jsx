import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    ClipboardList,
    Wallet,
    Box,
    User
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { id: 'dashboard', path: '/vendor/dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'orders', path: '/vendor/orders', icon: ClipboardList, label: 'Orders' },
    { id: 'inventory', path: '/vendor/inventory', icon: Box, label: 'Stock' },
    { id: 'payments', path: '/vendor/payments', icon: Wallet, label: 'Earnings' },
    { id: 'profile', path: '/vendor/profile', icon: User, label: 'Account' }
];

export default function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <nav
            className={cn(
                "lg:hidden fixed bottom-0 left-0 right-0 z-40",
                "bg-white/95 backdrop-blur-xl border-t-2 border-slate-200",
                "flex items-center justify-around min-h-[52px] py-1.5",
                "shadow-[0_-2px_16px_rgba(0,0,0,0.06)]"
            )}
            style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom, 0px))' }}
        >
            {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                const Icon = item.icon;
                return (
                    <button
                        key={item.id}
                        onClick={() => navigate(item.path)}
                        aria-current={isActive ? 'page' : undefined}
                        className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1 min-h-[44px] min-w-[44px] transition-all duration-150 active:scale-95"
                    >
                        <div className={cn(
                            "relative flex items-center justify-center rounded-full p-1.5 transition-colors duration-200",
                            isActive && "bg-slate-900/10"
                        )}>
                            <Icon
                                size={isActive ? 20 : 18}
                                className={cn(
                                    "transition-colors duration-200",
                                    isActive ? "text-slate-900" : "text-slate-400"
                                )}
                                strokeWidth={isActive ? 2.5 : 1.5}
                            />
                        </div>
                        <span className={cn(
                            "text-[10px] font-medium transition-colors duration-200 leading-tight",
                            isActive ? "text-slate-900" : "text-slate-400"
                        )}>
                            {item.label}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
}
