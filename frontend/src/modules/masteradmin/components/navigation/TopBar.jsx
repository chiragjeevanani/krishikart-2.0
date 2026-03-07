import { Bell, Search, UserCircle, RefreshCw, X, ShoppingCart, Users, Box } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';
import { useMasterAdminAuth } from '../../contexts/MasterAdminAuthContext';

export default function TopBar() {
    const location = useLocation();
    const { admin, logout } = useMasterAdminAuth();
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, title: "New Vendor Registration", time: "2m ago", read: false },
        { id: 2, title: "Order #8868431 Delivered", time: "1h ago", read: true },
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState({ products: [], orders: [], vendors: [], franchises: [] });
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                setIsSearching(true);
                try {
                    const response = await api.get(`/masteradmin/search?query=${searchQuery}`);
                    if (response.data.success) {
                        setResults(response.data.result);
                    }
                } catch (error) {
                    console.error("Search error:", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setResults({ products: [], orders: [], vendors: [], franchises: [] });
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const getLink = (category, item) => {
        switch (category) {
            case 'products': return `/masteradmin/products/edit/${item._id}`;
            case 'orders': return `/masteradmin/orders/${item._id}`;
            case 'vendors': return `/masteradmin/vendors/${item._id}`;
            case 'franchises': return `/masteradmin/franchises/${item._id}`;
            default: return '#';
        }
    };

    return (
        <header className="h-14 bg-white border-b border-slate-200 sticky top-0 z-40 px-6 flex items-center justify-between shadow-sm">
            <div className="flex-1 flex items-center">
                {/* Global Search Interface */}
                <div className="relative w-full max-w-sm">
                    <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-sm group focus-within:bg-white focus-within:border-slate-300 focus-within:ring-1 focus-within:ring-slate-900/5 transition-all w-full">
                        <Search size={14} className="text-slate-400 group-focus-within:text-slate-900" />
                        <input
                            type="text"
                            placeholder="Search products, orders, or vendors..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value.trim())}
                            onFocus={() => setShowResults(true)}
                            className="bg-transparent border-none outline-none text-[11px] w-full font-bold placeholder:text-slate-400 text-slate-900"
                        />
                        <div className="px-1.5 py-0.5 border border-slate-200 rounded-sm text-[8px] font-black text-slate-400 group-focus-within:opacity-0 transition-opacity">
                            {isSearching ? <RefreshCw size={10} className="animate-spin" /> : "⌘K"}
                        </div>
                    </div>

                    {/* Search Results Dropdown */}
                    <AnimatePresence>
                        {showResults && searchQuery.length >= 2 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 shadow-2xl rounded-sm overflow-hidden z-[100] max-h-[400px] flex flex-col"
                            >
                                <div className="p-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Search Results</span>
                                    <button onClick={() => setShowResults(false)} className="text-slate-400 hover:text-slate-900"><X size={12} /></button>
                                </div>

                                <div className="overflow-y-auto custom-scrollbar">
                                    {Object.entries(results).map(([category, items]) => (
                                        items.length > 0 && (
                                            <div key={category} className="p-2 border-b border-slate-50 last:border-none">
                                                <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mb-2 px-2">{category}</h4>
                                                <div className="space-y-1">
                                                    {items.map((item, idx) => (
                                                        <Link
                                                            key={idx}
                                                            to={getLink(category, item)}
                                                            onClick={() => setShowResults(false)}
                                                            className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-sm transition-colors group"
                                                        >
                                                            <div className="w-8 h-8 bg-slate-100 rounded-sm flex-shrink-0 flex items-center justify-center text-slate-400 group-hover:bg-slate-200 overflow-hidden">
                                                                {item.primaryImage || item.profilePicture ? (
                                                                    <img src={item.primaryImage || item.profilePicture} alt={item.name} className="w-full h-full object-cover" />
                                                                ) : category === 'orders' ? <Box size={14} /> : category === 'vendors' ? <Users size={14} /> : <ShoppingCart size={14} />}
                                                            </div>
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="text-[11px] font-bold text-slate-900 truncate leading-tight">
                                                                    {item.name || item.fullName || item.franchiseName || `#${item._id.slice(-6)}`}
                                                                </span>
                                                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider truncate">
                                                                    {item.category?.name || item.orderStatus || item.email || item.city || "Detail"}
                                                                </span>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    ))}

                                    {Object.values(results).every(arr => arr.length === 0) && searchQuery.length >= 2 && !isSearching && (
                                        <div className="p-8 text-center flex flex-col items-center gap-2">
                                            <Search size={24} className="text-slate-200" />
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">No matching results found</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-sm transition-all relative"
                    >
                        <Bell size={18} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white"></span>
                        )}
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full right-0 mt-2 w-64 bg-white border border-slate-200 shadow-2xl rounded-sm overflow-hidden z-[100]"
                            >
                                <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notifications</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Recent Only</span>
                                </div>
                                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                    {notifications.length > 0 ? (
                                        notifications.map(n => (
                                            <div key={n.id} className={cn("p-3 border-b border-slate-50 last:border-none hover:bg-slate-50 cursor-pointer", !n.read && "bg-slate-50/50")}>
                                                <p className="text-[11px] font-bold text-slate-900 leading-tight">{n.title}</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{n.time}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center">
                                            <Bell size={24} className="mx-auto text-slate-100 mb-2" />
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No new notifications</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Identity Module */}
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200 group relative cursor-pointer group">
                    <div className="text-right hidden sm:block">
                        <p className="text-[11px] font-black text-slate-900 leading-none uppercase tracking-tight">
                            {admin?.fullName || 'Administrator'}
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                            {admin?.role?.replace('_', ' ') || 'Main Control'}
                        </p>
                    </div>
                    <div className="w-8 h-8 rounded-sm bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-slate-900 transition-colors overflow-hidden">
                        {admin?.profilePicture ? (
                            <img src={admin.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <UserCircle size={24} />
                        )}
                    </div>

                    {/* Simple Logout Dropdown */}
                    <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-slate-200 shadow-xl rounded-sm py-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-[100]">
                        <button
                            onClick={logout}
                            className="w-full text-left px-4 py-2 text-[11px] font-bold text-rose-600 hover:bg-rose-50 transition-colors uppercase tracking-widest"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
