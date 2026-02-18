import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Phone,
    MessageSquare,
    ChevronRight,
    Navigation,
    Package,
    MapPin,
    Clock,
    MoreVertical,
    CheckCircle2
} from 'lucide-react';
import StatusProgress from '../components/ui/StatusProgress';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import { useDeliveryOrders } from '../contexts/DeliveryOrderContext';

const ActiveDelivery = () => {
    const navigate = useNavigate();
    const { dispatchedOrders, loading, fetchDispatchedOrders } = useDeliveryOrders();
    const [order, setOrder] = useState(null);
    const [status, setStatus] = useState('assigned'); // local UI status for sub-steps

    useEffect(() => {
        const activeOrderId = localStorage.getItem('activeDeliveryId');
        if (activeOrderId) {
            const found = dispatchedOrders.find(o => o._id === activeOrderId);
            if (found) {
                setOrder(found);
            } else {
                // If not in dispatched (maybe just picked up), we'd usually fetch by ID
                // For simplicity, we'll assume it's in the list or we need to navigate back
            }
        }
    }, [dispatchedOrders]);

    const handleUpdateStatus = () => {
        if (status === 'assigned') setStatus('picked_up');
        else if (status === 'picked_up') setStatus('on_the_way');
        else if (status === 'on_the_way') {
            navigate(ROUTES.COMPLETION);
        }
    };

    const getButtonText = () => {
        if (status === 'assigned') return 'Confirm Arrival at Franchise';
        if (status === 'picked_up') return 'Start Out for Delivery';
        if (status === 'on_the_way') return 'Arrived at Customer';
        return 'Complete Delivery';
    };

    return (
        <div className="flex flex-col min-h-full">
            {/* Header */}
            <div className="px-6 pt-8 pb-2 bg-white sticky top-0 z-10 border-b border-border/30">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold">Active Delivery</h1>
                    <button className="p-2 rounded-full bg-muted/50">
                        <MoreVertical className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>
                <StatusProgress currentStatus={status} />
            </div>

            <div className="p-6 space-y-6">
                {/* Status Alert */}
                <motion.div
                    animate={{ x: [0, -2, 2, -2, 2, 0] }}
                    transition={{ repeat: Infinity, duration: 4, repeatDelay: 1 }}
                    className="bg-primary/10 border border-primary/20 p-4 rounded-2xl flex items-center gap-4"
                >
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0">
                        <Clock className="text-white w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-primary">Next Action Required</p>
                        <p className="text-xs text-muted-foreground">Deliver items by 10:45 AM today</p>
                    </div>
                </motion.div>

                {/* Location Cards */}
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-border p-4 shadow-sm relative">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-200 shrink-0">
                                <MapPin className="text-primary w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Pickup Location</p>
                                <h3 className="text-sm font-bold">{order?.franchiseId?.shopName || 'Franchise'}</h3>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{order?.franchiseId?.address || 'Pickup from Franchise'}</p>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <button className="flex-1 bg-muted/50 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                                <Phone className="w-3.5 h-3.5" /> Call Franchise
                            </button>
                            <button className="flex-1 bg-muted/50 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                                <Navigation className="w-3.5 h-3.5" /> Directions
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-border p-4 shadow-sm border-l-4 border-l-amber-500">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-200 shrink-0">
                                <MapPin className="text-amber-500 w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Dropoff Location</p>
                                <h3 className="text-sm font-bold">{order?.userId?.fullName || 'Customer'}</h3>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{order?.shippingAddress || 'Delivery Address'}</p>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <button className="flex-1 bg-muted/50 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                                <Phone className="w-3.5 h-3.5" /> Call Customer
                            </button>
                            <button className="flex-1 bg-muted/50 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                                <MessageSquare className="w-3.5 h-3.5" /> Chat
                            </button>
                        </div>
                    </div>
                </div>

                {/* Order Details */}
                <div className="bg-white rounded-2xl border border-border overflow-hidden">
                    <div className="px-4 py-3 border-b border-border bg-muted/20 flex justify-between items-center">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Order Items</h4>
                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{activeDelivery.items.length} Items</span>
                    </div>
                    <div className="p-0">
                        {order?.items?.map((item, i) => (
                            <div key={i} className="px-4 py-3 flex justify-between items-center border-b border-border last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                    <span className="text-sm font-medium">{item.name}</span>
                                </div>
                                <span className="text-sm font-bold text-muted-foreground">{item.quantity}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Floating Action Button / Bottom Bar */}
            <div className="fixed bottom-16 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
                <div className="max-w-md mx-auto pointer-events-auto">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleUpdateStatus}
                        className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-xl shadow-primary/30 flex items-center justify-center gap-3 text-lg"
                    >
                        {status === 'on_the_way' ? <Navigation className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                        {getButtonText()}
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default ActiveDelivery;
