import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Bell,
    Power,
    TrendingUp,
    Package,
    CheckCircle2,
    Star,
} from 'lucide-react';
import MetricCard from '../components/cards/MetricCard';
import { useDeliveryAuth } from '../contexts/DeliveryAuthContext';
import { useDeliveryOrders } from '../contexts/DeliveryOrderContext';
import api from '@/lib/axios';
import axios from 'axios';

const Dashboard = () => {
    const { delivery } = useDeliveryAuth();
    const { dispatchedOrders } = useDeliveryOrders();
    const [isOnline, setIsOnline] = useState(true);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('deliveryToken');

                const response = await api.get('/orders/delivery/history');
                if (response.data.success) {
                    setHistory(response.data.results || []);
                }
            } catch (error) {
                console.error('Fetch history error:', error);
                if (error.response?.status === 401) {
                    console.warn('Unauthorized access. Clearing token and redirecting...');
                    localStorage.removeItem('deliveryToken');
                    localStorage.removeItem('deliveryData');
                    window.location.href = '/delivery/login';
                }
                // alert('Fetch failed: ' + (error.response?.status || error.message)); // Optional alert for user feedback
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const totalEarnings = history.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const completedCount = history.length;

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
        <div className="flex flex-col min-h-full bg-slate-50 pb-24">
            {/* Header */}
            <div className="px-6 pt-8 pb-4 flex justify-between items-center bg-white sticky top-0 z-10 border-b border-border/5">
                <div>
                    <h1 className="text-2xl font-black text-foreground">Hello, {delivery?.fullName?.split(' ')[0] || 'Partner'}!</h1>
                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 mt-1">
                        <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
                        {isOnline ? 'Online & Available' : 'Currently Offline'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="relative p-3 rounded-2xl bg-muted/30 text-foreground active:scale-95 transition-all">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                    </button>
                    <button
                        onClick={() => setIsOnline(!isOnline)}
                        className={`p-3 rounded-2xl active:scale-95 transition-all shadow-sm ${isOnline ? 'bg-primary text-white shadow-primary/20' : 'bg-white text-muted-foreground border border-border'}`}
                    >
                        <Power className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="px-6 space-y-6 pt-6">
                {/* Availability Toggle UI Block */}
                <motion.div
                    onClick={() => setIsOnline(!isOnline)}
                    className={`cursor-pointer px-5 py-4 rounded-3xl flex items-center justify-between border-2 transition-all ${isOnline ? 'bg-primary/5 border-primary/20 shadow-lg shadow-primary/5' : 'bg-white border-border shadow-sm grayscale opacity-70'}`}
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${isOnline ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                            <Power className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-sm font-black uppercase tracking-widest block leading-none mb-1">{isOnline ? 'Active' : 'Resting'}</span>
                            <span className="text-[10px] text-muted-foreground font-medium">{isOnline ? 'Ready for new requests' : 'Status set to offline'}</span>
                        </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 relative transition-colors ${isOnline ? 'bg-primary' : 'bg-muted'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm absolute top-1 transition-all ${isOnline ? 'left-7' : 'left-1'}`} />
                    </div>
                </motion.div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <MetricCard
                        title="New Tasks"
                        value={dispatchedOrders.length}
                        icon={Package}
                        color="bg-blue-600 shadow-blue-200"
                    />
                    <MetricCard
                        title="Today Done"
                        value={completedCount}
                        icon={CheckCircle2}
                        color="bg-primary shadow-emerald-200"
                    />
                    <MetricCard
                        title="Earnings"
                        value={totalEarnings}
                        icon={TrendingUp}
                        color="bg-amber-500 shadow-amber-200"
                        suffix=" ₹"
                    />
                    <MetricCard
                        title="Rating"
                        value="4.8"
                        icon={Star}
                        color="bg-purple-600 shadow-purple-200"
                    />
                </div>

                {/* Task Feed Link */}
                <motion.div
                    whileTap={{ scale: 0.98 }}
                    className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl shadow-slate-200 overflow-hidden relative"
                >
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-2">Live Status</p>
                        <h3 className="text-xl font-black mb-1">Task Feed Ready</h3>
                        <p className="text-white/60 text-xs mb-6">Check and accept incoming delivery requests near you.</p>
                        <button
                            onClick={() => window.location.href = '/delivery/requests'}
                            className="bg-white text-slate-900 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl"
                        >
                            Open Task Feed
                        </button>
                    </div>
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Package size={120} />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
