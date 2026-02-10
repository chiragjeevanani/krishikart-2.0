import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Package,
    ClipboardList,
    IndianRupee,
    UserCircle,
    Zap,
    Activity,
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
        <div className="flex justify-center">
            <nav className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[32px] p-2 flex items-center justify-between w-full max-w-md mx-auto">
                {navItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                "relative flex flex-col items-center justify-center py-3 px-1 flex-1 transition-all duration-500 outline-none group",
                                isActive ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="nav-glow"
                                    className="absolute inset-0 bg-slate-900/5 rounded-2xl -z-0"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
                                />
                            )}

                            <div className="relative z-10">
                                <item.icon
                                    size={20}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className={cn(
                                        "transition-all duration-500",
                                        isActive ? "scale-110 translate-y-[-2px]" : "scale-100"
                                    )}
                                />
                                {isActive && (
                                    <motion.div
                                        layoutId="active-dot"
                                        className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-slate-900 rounded-full"
                                    />
                                )}
                            </div>

                            <span className={cn(
                                "text-[9px] font-black uppercase tracking-[0.1em] mt-1.5 relative z-10 transition-all duration-500",
                                isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
                            )}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
