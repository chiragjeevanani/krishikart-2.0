import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    Power,
    TrendingUp,
    Package,
    CheckCircle2,
    ChevronRight,
    Navigation,
    Star,
    Truck
} from 'lucide-react';
import { dashboardMetrics, deliveryPartner, activeDelivery } from '../utils/mockData';
import MetricCard from '../components/cards/MetricCard';
import { ROUTES } from '../utils/constants';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [isOnline, setIsOnline] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate initial load
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="p-6 space-y-6 animate-pulse">
                <div className="h-20 bg-muted rounded-2xl w-full" />
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 bg-muted rounded-2xl" />
                    <div className="h-24 bg-muted rounded-2xl" />
                </div>
                <div className="h-40 bg-muted rounded-2xl w-full" />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full pb-24">
            {/* Header */}
            <div className="px-6 pt-8 pb-4 flex justify-between items-center bg-white sticky top-0 z-10">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Hello, {deliveryPartner.name.split(' ')[0]}!</h1>
                    <p className="text-muted-foreground text-sm flex items-center gap-1 mt-0.5">
                        <span className="w-2 h-2 bg-primary rounded-full animate-pulse" /> Ready for deliveries
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="relative p-2 rounded-full bg-muted/50 text-foreground active:scale-95 transition-all">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-white" />
                    </button>
                    <button
                        onClick={() => setIsOnline(!isOnline)}
                        className={`p-2 rounded-full active:scale-95 transition-all ${isOnline ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-muted text-muted-foreground'}`}
                    >
                        <Power className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="px-6 space-y-6 pt-4">
                {/* Availability Toggle UI Block */}
                <motion.div
                    className={`px-4 py-3 rounded-2xl flex items-center justify-between border ${isOnline ? 'bg-primary/5 border-primary/20' : 'bg-muted border-transparent'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-primary shadow-[0_0_8px_rgba(22,163,74,0.5)]' : 'bg-muted-foreground'}`} />
                        <span className="font-medium">{isOnline ? 'You are Online' : 'You are Offline'}</span>
                    </div>
                    <button
                        onClick={() => setIsOnline(!isOnline)}
                        className="text-sm font-semibold text-primary"
                    >
                        Change
                    </button>
                </motion.div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <MetricCard
                        title="Active"
                        value={dashboardMetrics.activeDeliveries}
                        icon={Package}
                        color="bg-blue-500"
                    />
                    <MetricCard
                        title="Today"
                        value={dashboardMetrics.completedToday}
                        icon={CheckCircle2}
                        color="bg-primary"
                    />
                    <MetricCard
                        title="Earnings"
                        value={dashboardMetrics.totalEarningsToday}
                        icon={TrendingUp}
                        color="bg-amber-500"
                        suffix=" ₹"
                    />
                    <MetricCard
                        title="Rating"
                        value={dashboardMetrics.performanceRating}
                        icon={Star}
                        color="bg-purple-500"
                    />
                </div>

                {/* Active Delivery Shortcut */}
                {activeDelivery && (
                    <motion.div
                        whileTap={{ scale: 0.98 }}
                        className="bg-primary text-white p-5 rounded-2xl shadow-xl shadow-primary/20 relative overflow-hidden"
                    >
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                                    Active Delivery
                                </span>
                                <span className="text-white/80 text-xs font-medium">{activeDelivery.eta} ETA</span>
                            </div>

                            <h3 className="text-lg font-bold mb-1">On the way to customer</h3>
                            <p className="text-white/80 text-sm mb-4 truncate">{activeDelivery.drop.address}</p>

                            <Link
                                to={ROUTES.MAP}
                                className="inline-flex items-center gap-2 bg-white text-primary px-4 py-2 rounded-xl text-sm font-bold active:scale-95 transition-all"
                            >
                                Open Map Tracker <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </motion.div>
                )}

                {/* B2B Logistics Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold">B2B Logistics</h2>
                        <span className="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-sm uppercase tracking-widest">New Priority</span>
                    </div>
                    <Link
                        to="/delivery/assignment"
                        className="block bg-white border border-slate-200 rounded-2xl p-5 shadow-sm active:scale-98 transition-all relative overflow-hidden group"
                    >
                        <div className="relative z-10 flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Package className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold leading-none">Order Delivery</h3>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight mt-1">Leg: Franchise → Customer</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Payload</span>
                                        <span className="text-xs font-black">800 kg</span>
                                    </div>
                                    <div className="w-px h-6 bg-slate-100" />
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Earnings</span>
                                        <span className="text-xs font-black text-emerald-600">₹850</span>
                                    </div>
                                </div>
                                <div className="p-2 bg-slate-50 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                                    <ChevronRight size={16} />
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Quick Actions / Insights */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold">Quick Actions</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'Map', icon: Navigation, path: ROUTES.MAP, color: 'text-blue-500 bg-blue-50' },
                            { label: 'Pickup', icon: Package, path: ROUTES.PICKUP, color: 'text-purple-500 bg-purple-50' },
                            { label: 'Help', icon: Bell, path: ROUTES.PROFILE, color: 'text-rose-500 bg-rose-50' },
                        ].map((action, i) => (
                            <Link
                                key={i}
                                to={action.path}
                                className="flex flex-col items-center gap-2"
                            >
                                <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center shadow-sm`}>
                                    <action.icon className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-medium text-muted-foreground">{action.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
