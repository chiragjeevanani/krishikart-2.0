import { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { getSocket, joinFranchiseRoom } from '@/lib/socket';
import { useFranchiseAuth } from '@/modules/franchise/contexts/FranchiseAuthContext'; // Need franchise ID
import sellerAlert from '@/assets/sounds/seller_alert.mp3';

const FranchiseOrdersContext = createContext();

export function FranchiseOrdersProvider({ children }) {
    const { franchise } = useFranchiseAuth();
    const [liveOrders, setLiveOrders] = useState([]);
    const [deliveryPartners, setDeliveryPartners] = useState([]);
    const [loading, setLoading] = useState(false);

    // Alert State
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [newOrderData, setNewOrderData] = useState(null);
    const audioRef = useRef(null);
    const hasPrimedAudioRef = useRef(false);
    const knownOrderIdsRef = useRef(new Set());

    // Play sound helper when new order arrives.
    // Preferred: play seller_alert.mp3. Fallback: oscillator "beeps".
    const playNotificationSound = () => {
        const fallbackBeep = () => {
            if (!hasPrimedAudioRef.current) return;
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (!AudioContext) return;
                const ctx = new AudioContext();

                const playBeep = (freq, startTime, duration) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();

                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
                    gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
                    gain.gain.linearRampToValueAtTime(1, ctx.currentTime + startTime + 0.05);
                    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + startTime + duration);

                    osc.connect(gain);
                    gain.connect(ctx.destination);

                    osc.start(ctx.currentTime + startTime);
                    osc.stop(ctx.currentTime + startTime + duration);
                };

                playBeep(880, 0, 0.15);
                playBeep(1108.73, 0.15, 0.25);

                setTimeout(() => {
                    playBeep(880, 0, 0.15);
                    playBeep(1108.73, 0.15, 0.25);
                }, 800);

                setTimeout(() => {
                    playBeep(880, 0, 0.15);
                    playBeep(1108.73, 0.15, 0.25);
                }, 1600);

                if (ctx.state === 'suspended') ctx.resume();
            } catch (_) {
                // silent fallback
            }
        };

        try {
            const audio = audioRef.current || new Audio(sellerAlert);
            audioRef.current = audio;
            audio.volume = 1.0;
            audio.currentTime = 0;
            const playPromise = audio.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(() => fallbackBeep());
            }
        } catch (_) {
            fallbackBeep();
        }
    };

    // Prime audio on first user interaction so browser autoplay policies don't block alerts later.
    useEffect(() => {
        if (hasPrimedAudioRef.current) return;
        const prime = () => {
            try {
                hasPrimedAudioRef.current = true;
                const audio = audioRef.current || new Audio(sellerAlert);
                audioRef.current = audio;
                audio.volume = 0;
                const p = audio.play();
                if (p && typeof p.finally === 'function') {
                    p.finally(() => {
                        audio.pause();
                        audio.currentTime = 0;
                        audio.volume = 1;
                    });
                } else {
                    audio.pause();
                    audio.currentTime = 0;
                    audio.volume = 1;
                }
            } catch (_) {
                // Keep silent; fallback beep still exists.
            } finally {
                window.removeEventListener('click', prime);
                window.removeEventListener('touchstart', prime);
                window.removeEventListener('keydown', prime);
            }
        };

        window.addEventListener('click', prime, { once: true });
        window.addEventListener('touchstart', prime, { once: true });
        window.addEventListener('keydown', prime, { once: true });

        return () => {
            window.removeEventListener('click', prime);
            window.removeEventListener('touchstart', prime);
            window.removeEventListener('keydown', prime);
        };
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await api.get('/orders/franchise/all');
            if (response.data.success) {
                const incomingOrders = response.data.results || [];
                const incomingIds = new Set(incomingOrders.map((o) => String(o._id)));
                const knownIds = knownOrderIdsRef.current;

                // For polling fallback: alert only when a truly new order appears after initial load.
                if (knownIds.size > 0) {
                    const newlyAddedOrder = incomingOrders.find((o) => !knownIds.has(String(o._id)));
                    if (newlyAddedOrder) {
                        setNewOrderData(newlyAddedOrder);
                        setIsAlertOpen(true);
                        playNotificationSound();
                    }
                }

                knownOrderIdsRef.current = incomingIds;
                setLiveOrders(incomingOrders);
            }
        } catch (error) {
            console.error('Fetch franchise orders error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDeliveryPartners = async () => {
        try {
            const response = await api.get('/delivery/partners');
            if (response.data.success) {
                setDeliveryPartners(response.data.results || []);
            }
        } catch (error) {
            console.error('Fetch delivery partners error:', error);
        }
    };

    useEffect(() => {
        fetchOrders();
        fetchDeliveryPartners();

        // Auto-poll for new orders every 30 seconds
        const pollInterval = setInterval(() => {
            fetchOrders();
        }, 30000);

        return () => clearInterval(pollInterval);
    }, []);

    useEffect(() => {
        if (!franchise?._id) return;

        const socket = getSocket();
        joinFranchiseRoom();

        const handleNewOrder = (data) => {
            const oid = data?.orderId ?? data?._id;
            setNewOrderData({
                ...data,
                orderId: oid,
                autoAccepted: data?.autoAccepted === true,
                showRejectOnly: data?.showRejectOnly === true,
                franchiseAutoAccepted: data?.franchiseAutoAccepted === true,
            });
            setIsAlertOpen(true);
            playNotificationSound();
            fetchOrders(); // Immediate refresh
        };

        socket.on('new_order', handleNewOrder);

        return () => {
            socket.off('new_order', handleNewOrder);
        };
    }, [franchise?._id]);

    // Computed combined orders with mapping
    const orders = useMemo(() => {
        return liveOrders.map(o => ({
            id: o._id,
            hotelName: o.userId?.legalEntityName || o.userId?.fullName || o.user?.legalEntityName || o.user?.fullName || 'Guest User',
            hotelImage: (o.items && o.items[0]?.image) || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80",
            status: (o.orderStatus || '').toLowerCase(),
            total: o.totalAmount,
            items: (o.items || []).map(i => ({
                id: i.productId || i.product,
                productId: i.productId || i.product,
                name: i.name || 'Unnamed Product',
                image: i.image,
                quantity: i.quantity || 0,
                qty: i.quantity || 0,
                unit: i.unit || 'units',
                price: i.price || 0,
                subtotal: i.subtotal || 0,
                isShortage: i.isShortage || false
            })),
            address: o.userId?.address || o.user?.address || o.shippingAddress || 'Address not provided',
            deliveryTime: "30-45 mins",
            deliverySlot: o.deliverySlot || "Standard",
            paymentMode: o.paymentMethod || "Prepaid",
            timeline: [
                { status: 'Order Placed', time: o.time || 'N/A', completed: true },
                ...(o.statusHistory || []).map(h => ({
                    status: h.status,
                    time: h.updatedAt || o.time,
                    completed: true
                }))
            ].sort((a, b) => new Date(a.time) - new Date(b.time)),
            date: o.date,
            time: o.time,
            franchiseId: o.franchiseId || o.franchise || null,
            franchiseAutoAccepted: !!o.franchiseAutoAccepted,
            deliveryPartnerId: o.deliveryPartnerId?._id || o.deliveryPartnerId,
            deliveryPartner: o.deliveryPartnerId,
            statusHistory: o.statusHistory || []
        }));
    }, [liveOrders]);

    const updateOrderStatus = async (orderId, newStatus, extraData = {}) => {
        try {
            const response = await api.put(`/orders/franchise/${orderId}/status`, {
                status: newStatus,
                ...extraData
            });
            if (response.data.success) {
                toast.success(`Order status updated to ${newStatus}`);
                setLiveOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus, ...extraData } : o));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Update order status error:', error);
            toast.error(error.response?.data?.message || 'Failed to update status');
            return false;
        }
    };

    const acceptOrder = async (orderId) => {
        try {
            const response = await api.put(`/orders/franchise/${orderId}/accept`);
            if (response.data.success) {
                toast.success('Order accepted successfully');
                setLiveOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: 'Accepted' } : o));
                fetchOrders(); // Refresh to get full details from server
                return true;
            }
            return false;
        } catch (error) {
            console.error('Accept order error:', error);
            toast.error(error.response?.data?.message || 'Failed to accept order');
            return false;
        }
    };

    /** Reject auto-assigned order → backend reassigns to next nearest franchise (same category rules). */
    const rejectFranchiseOrder = async (orderId, reason = '') => {
        try {
            const response = await api.put(`/orders/franchise/${orderId}/reject`, { reason });
            if (response.data.success) {
                toast.success(response.data.message || 'Order rejected');
                fetchOrders();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Reject franchise order error:', error);
            toast.error(error.response?.data?.message || 'Failed to reject order');
            return false;
        }
    };

    const assignDeliveryPartner = async (orderId, deliveryPartnerId) => {
        try {
            const response = await api.put(`/orders/franchise/${orderId}/assign-delivery`, { deliveryPartnerId });
            if (response.data.success) {
                toast.success('Order dispatched successfully');
                fetchOrders();
                return true;
            }
        } catch (error) {
            console.error('Assign delivery error:', error);
            toast.error(error.response?.data?.message || 'Failed to assign delivery');
            return false;
        }
    };

    const stats = useMemo(() => ({
        todayOrders: orders.length,
        newOrders: orders.filter(o => ['placed', 'pending', 'new', 'procuring'].includes(o.status)).length,
        readyToDispatch: orders.filter(o => ['packed', 'dispatched', 'ready'].includes(o.status)).length,
        outForDelivery: orders.filter(o => ['dispatched'].includes(o.status)).length,
        dispatch: orders.filter(o => ['packed', 'dispatched'].includes(o.status)).length,
        completedCount: orders.filter(o => ['delivered', 'received', 'completed'].includes(o.status)).length,
        revenue: orders.filter(o => ['delivered', 'received', 'completed'].includes(o.status)).reduce((acc, curr) => acc + (curr.total || 0), 0)
    }), [orders]);

    return (
        <FranchiseOrdersContext.Provider value={{
            orders,
            updateOrderStatus,
            acceptOrder,
            rejectFranchiseOrder,
            assignDeliveryPartner,
            deliveryPartners,
            stats,
            loading,
            isAlertOpen,
            setIsAlertOpen,
            newOrderData,
            refreshOrders: fetchOrders,
            refreshPartners: fetchDeliveryPartners,
            fetchOrdersByDate: async (date) => {
                try {
                    const response = await api.get(`/orders/franchise/all?date=${date}`);
                    if (response.data.success) {
                        return response.data.results.map(o => ({
                            id: o._id,
                            hotelName: o.userId?.fullName || o.user?.fullName || 'Guest User',
                            status: (o.orderStatus || '').toLowerCase() || 'new',
                            total: o.totalAmount,
                            items: o.items || [],
                            date: o.date,
                            time: o.time
                        }));
                    }
                    return [];
                } catch (error) {
                    console.error('Fetch history error:', error);
                    return [];
                }
            }
        }}>
            {children}
        </FranchiseOrdersContext.Provider>
    );
}

export function useFranchiseOrders() {
    const context = useContext(FranchiseOrdersContext);
    if (!context) throw new Error('useFranchiseOrders must be used within FranchiseOrdersProvider');
    return context;
}
