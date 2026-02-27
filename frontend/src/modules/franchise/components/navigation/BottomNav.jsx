import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, User, PackageCheck, Truck, Undo2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: 'Home', path: '/franchise/dashboard' },
        { icon: ShoppingBag, label: 'Orders', path: '/franchise/orders' },
        { icon: Package, label: 'Inventory', path: '/franchise/inventory' },
        { icon: PackageCheck, label: 'Receiving', path: '/franchise/receiving' },
        { icon: Undo2, label: 'Returns', path: '/franchise/returns' },
        { icon: Truck, label: 'Delivery', path: '/franchise/dispatch' },
        { icon: User, label: 'Profile', path: '/franchise/profile' }
    ];

    return (
        <div className="bg-white/80 backdrop-blur-xl border-t border-slate-100 px-3 py-3 pb-8 flex justify-between items-center shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className="relative flex flex-col items-center gap-1 group"
                    >
                        <div className={cn(
                            "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300",
                            isActive ? "bg-primary text-white shadow-lg shadow-green-200 scale-110" : "text-slate-400 group-hover:text-slate-600"
                        )}>
                            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span className={cn(
                            "text-[8px] font-black uppercase tracking-widest transition-colors duration-300",
                            isActive ? "text-primary" : "text-slate-400"
                        )}>
                            {item.label}
                        </span>
                        {isActive && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute -top-3 w-1 h-1 bg-primary rounded-full"
                            />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
