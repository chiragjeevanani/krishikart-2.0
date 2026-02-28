import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    Store,
    Truck,
    Monitor,
    BarChart3,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ShieldCheck,
    UserCheck,
    UserCircle,
    CreditCard,
    Landmark,
    HandCoins,
    BookOpen,
    Percent,
    ClipboardCheck,
    Briefcase,
    TrendingUp,
    Building,
    Home,
    Package,
    Tags,
    PlusCircle,
    List,
    Star,
    Clock,
    CheckCircle2,
    FileText,
    Undo2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasterAdminAuth } from '../../contexts/MasterAdminAuthContext';

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
    const navigate = useNavigate();
    const { logout } = useMasterAdminAuth();
    const location = useLocation();
    const [expandedMenu, setExpandedMenu] = useState(null);

    useEffect(() => {
        // Auto-expand menu if current path is a submenu
        navItems.forEach(group => {
            group.items.forEach(item => {
                if (item.submenu) {
                    const isSubPathActive = item.submenu.some(sub =>
                        location.pathname === sub.path.split('?')[0] &&
                        (sub.path.includes('?') ? location.search.includes(sub.path.split('?')[1]) : true)
                    );
                    if (isSubPathActive) {
                        setExpandedMenu(item.label);
                    }
                }
            });
        });
    }, [location.pathname, location.search]);

    const navItems = [
        {
            group: 'Operations', items: [
                { icon: LayoutDashboard, label: 'Dashboard', path: '/masteradmin/dashboard' },
                { icon: ShoppingBag, label: 'Orders', path: '/masteradmin/orders' },
                { icon: UserCheck, label: 'Assign Vendors', path: '/masteradmin/assignment' },
                { icon: Truck, label: 'Delivery Tracking', path: '/masteradmin/delivery' },
                { icon: Undo2, label: 'Returns', path: '/masteradmin/returns' },
            ]
        },
        {
            group: 'Finance', items: [
                { icon: CreditCard, label: 'Credit Management', path: '/masteradmin/credit' },
                { icon: Landmark, label: 'Franchise Payouts', path: '/masteradmin/franchise-payouts' },
                { icon: HandCoins, label: 'COD Remittance', path: '/masteradmin/cod-remittance' },
                { icon: Star, label: 'Loyalty Engine', path: '/masteradmin/loyalty' },
                { icon: Truck, label: 'Delivery Constraints', path: '/masteradmin/delivery-constraints' },
            ]
        },
        {
            group: 'Network', items: [
                { icon: Store, label: 'Franchises', path: '/masteradmin/franchises' },
                { icon: Users, label: 'Vendors', path: '/masteradmin/vendors' },
                { icon: FileText, label: 'Vendor Invoices', path: '/masteradmin/vendor-reports' },
                { icon: Monitor, label: 'Stock Levels', path: '/masteradmin/stock-monitoring' },
                { icon: Star, label: 'Vendor Quotations', path: '/masteradmin/quotations' },
            ]
        },
        {
            group: 'Catalog Management', items: [
                {
                    icon: Package,
                    label: 'Product',
                    path: '/masteradmin/products',
                    submenu: [
                        { label: 'Add Product', path: '/masteradmin/products/add', icon: PlusCircle },
                        { label: 'Manage Product', path: '/masteradmin/products/manage', icon: List }
                    ]
                },
                {
                    icon: Tags,
                    label: 'Category',
                    path: '/masteradmin/categories',
                    submenu: [
                        { label: 'Manage Category', path: '/masteradmin/categories/manage', icon: List },
                        { label: 'Manage Subcategory', path: '/masteradmin/subcategories/manage', icon: List }
                    ]
                }
            ]
        },
        {
            group: 'Settings', items: [
                {
                    icon: ClipboardCheck,
                    label: 'Approvals',
                    path: '/masteradmin/approvals',
                    submenu: [
                        { label: 'Vendor Documents', path: '/masteradmin/approvals?type=vendor', icon: Users },
                        { label: 'Franchise Documents', path: '/masteradmin/approvals?type=franchise', icon: Building },
                    ]
                },
                { icon: BarChart3, label: 'Analytics', path: '/masteradmin/analytics' },
                {
                    icon: Settings,
                    label: 'Settings',
                    path: '/masteradmin/settings',
                    submenu: [
                        { label: 'My Profile', path: '/masteradmin/settings?section=profile', icon: UserCircle },
                    ]
                }
            ]
        }
    ];

    return (
        <aside className={cn(
            "fixed left-0 top-0 h-full bg-white border-r border-slate-200 z-50 hidden lg:flex flex-col transition-all duration-300 shadow-sm",
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
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Admin Panel</span>
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
                            const isActive = location.pathname === item.path || (item.submenu && location.pathname === item.path);
                            const isExpanded = expandedMenu === item.label;

                            return (
                                <div key={item.label}>
                                    <button
                                        onClick={() => {
                                            if (item.submenu) {
                                                setExpandedMenu(isExpanded ? null : item.label);
                                                if (isCollapsed) setIsCollapsed(false);
                                            } else {
                                                navigate(item.path);
                                            }
                                        }}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2 rounded-sm transition-all duration-200 group relative",
                                            isActive && !item.submenu
                                                ? "bg-slate-900 text-white shadow-md shadow-slate-200"
                                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                        )}
                                    >
                                        <item.icon size={16} className={cn("shrink-0", isActive && !item.submenu ? "text-white" : "group-hover:text-slate-900 transition-colors")} />
                                        {!isCollapsed && (
                                            <>
                                                <span className={cn(
                                                    "font-bold text-[11px] uppercase tracking-wider flex-1 text-left whitespace-nowrap overflow-hidden transition-all",
                                                    isActive && !item.submenu ? "opacity-100" : "opacity-80 group-hover:opacity-100"
                                                )}>
                                                    {item.label}
                                                </span>
                                                {item.submenu && (
                                                    <ChevronDown size={12} className={cn("transition-transform duration-300", isExpanded && "rotate-180")} />
                                                )}
                                            </>
                                        )}
                                        {isActive && isCollapsed && (
                                            <div className="absolute left-0 w-1 h-6 bg-slate-900 rounded-r-full" />
                                        )}
                                    </button>

                                    {/* Advanced Submenu Logic */}
                                    <AnimatePresence>
                                        {item.submenu && isExpanded && !isCollapsed && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden ml-5 border-l border-slate-100 pl-3 mt-1 space-y-1"
                                            >
                                                {item.submenu.map((sub) => {
                                                    const isSubActive = location.search.includes(sub.path.split('?')[1]);
                                                    return (
                                                        <button
                                                            key={sub.path}
                                                            onClick={() => navigate(sub.path)}
                                                            className={cn(
                                                                "w-full flex items-center gap-2.5 px-3 py-1.5 rounded-sm transition-all text-[10px] font-bold uppercase tracking-widest",
                                                                isSubActive
                                                                    ? "text-slate-900 bg-slate-50"
                                                                    : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                                                            )}
                                                        >
                                                            <div className={cn("w-1 h-1 rounded-full", isSubActive ? "bg-slate-900" : "bg-slate-200")} />
                                                            <span>{sub.label}</span>
                                                        </button>
                                                    );
                                                })}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* Tactical Footer */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                <button
                    onClick={() => {
                        logout();
                        navigate('/masteradmin/login');
                    }}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all group",
                        isCollapsed && "justify-center"
                    )}
                >
                    <LogOut size={16} className="group-hover:scale-110 transition-transform" />
                    {!isCollapsed && <span className="font-black text-[10px] uppercase tracking-[0.2em]">Logout</span>}
                </button>
            </div>

            {/* Collapse Trigger (Floating) */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-20 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white z-50 hover:scale-110 transition-all active:scale-95"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
        </aside>
    );
}
