import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingBag,
    ShoppingBasket,
    Package,
    User,
    LogOut,
    ChevronLeft,
    ChevronRight,
    PackageCheck,
    Truck,
    Wallet,
    Monitor,
    ChevronDown,
    Home,
    Settings,
    CreditCard,
    Undo2
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        {
            group: 'Core Operations', items: [
                { icon: LayoutDashboard, label: 'Dashboard', path: '/franchise/dashboard' },
                { icon: ShoppingBag, label: 'Hotel orders', path: '/franchise/orders' },
                { icon: Monitor, label: 'POS Terminal', path: '/franchise/pos' },
            ]
        },
        {
            group: 'Logistics & Supply', items: [
                { icon: PackageCheck, label: 'Vendor Receiving', path: '/franchise/receiving' },
                { icon: Truck, label: 'Delivery Dispatch', path: '/franchise/dispatch' },
                { icon: ShoppingBasket, label: 'Procurement', path: '/franchise/procurement' },
                { icon: Undo2, label: 'Returns', path: '/franchise/returns' },
            ]
        },
        {
            group: 'Assets & Ledger', items: [
                { icon: Package, label: 'Inventory Stock', path: '/franchise/inventory' },
            ]
        },
        {
            group: 'Configuration', items: [
                { icon: User, label: 'Node Profile', path: '/franchise/profile' },
                { icon: CreditCard, label: 'Payment Settings', path: '/franchise/payment-settings' },
                { icon: Settings, label: 'Documentation', path: '/franchise/documentation' },
            ]
        }
    ];

    return (
        <aside className={cn(
            "h-full bg-white border-r border-slate-200 z-10 hidden lg:flex flex-col relative transition-all duration-300 shadow-sm shrink-0",
            isCollapsed ? "w-20" : "w-64"
        )}>
            {/* Header / Brand */}
            <div className="h-14 flex items-center justify-between px-6 border-b border-slate-100">
                {!isCollapsed ? (
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-slate-900 rounded-sm flex items-center justify-center">
                            <span className="text-white font-black text-sm">K</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-[13px] tracking-tight text-slate-900 leading-none">KRISHIKART</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Franchise Node</span>
                        </div>
                    </div>
                ) : (
                    <div className="w-full flex justify-center">
                        <div className="w-7 h-7 bg-slate-900 rounded-sm flex items-center justify-center">
                            <span className="text-white font-black text-sm">K</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Nav Selection Engine */}
            <nav className="flex-1 px-3 py-6 space-y-8 overflow-y-auto no-scrollbar">
                {navItems.map((group) => (
                    <div key={group.group} className="space-y-1.5">
                        {!isCollapsed && (
                            <div className="px-3 mb-2">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">
                                    {group.group}
                                </span>
                            </div>
                        )}
                        {group.items.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2 rounded-sm transition-all duration-200 group relative",
                                        isActive
                                            ? "bg-slate-900 text-white shadow-md shadow-slate-200"
                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                    )}
                                >
                                    <item.icon size={16} className={cn("shrink-0", isActive ? "text-white" : "group-hover:text-slate-900 transition-colors")} />
                                    {!isCollapsed && (
                                        <span className={cn(
                                            "font-bold text-[11px] uppercase tracking-wider flex-1 text-left whitespace-nowrap overflow-hidden transition-all",
                                            isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100"
                                        )}>
                                            {item.label}
                                        </span>
                                    )}
                                    {isActive && isCollapsed && (
                                        <div className="absolute left-0 w-1 h-6 bg-slate-900 rounded-r-full" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* System Footer */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                <button
                    onClick={() => navigate('/franchise/login')}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all group",
                        isCollapsed && "justify-center"
                    )}
                >
                    <LogOut size={16} className="group-hover:scale-110 transition-transform" />
                    {!isCollapsed && <span className="font-black text-[10px] uppercase tracking-[0.2em]">Terminate Session</span>}
                </button>
            </div>

            {/* Collapse Trigger Container */}
            <div className="absolute top-20 -right-3 z-[60]">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-all cursor-pointer"
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </div>
        </aside>
    );
}
