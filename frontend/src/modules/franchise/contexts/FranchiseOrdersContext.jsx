import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import api from '@/lib/axios';
import { toast } from 'sonner';

const FranchiseOrdersContext = createContext();

export function FranchiseOrdersProvider({ children }) {
    const [liveOrders, setLiveOrders] = useState([]);
    const [deliveryPartners, setDeliveryPartners] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await api.get('/orders/franchise/all');
            if (response.data.success) {
                console.log('Franchise Orders API sync:', response.data.results);
                // Log unique statuses to debug filtering
                const statuses = [...new Set(response.data.results.map(o => o.orderStatus))];
                console.log('Available order statuses in DB:', statuses);
                setLiveOrders(response.data.results || []);
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
                subtotal: i.subtotal || 0
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
            }
        } catch (error) {
            console.error('Update order status error:', error);
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const acceptOrder = async (orderId) => {
        try {
            const response = await api.put(`/orders/franchise/${orderId}/accept`);
            if (response.data.success) {
                toast.success('Order accepted successfully');
                setLiveOrders(prev => prev.map(o => o._id === orderId ? { ...o, franchiseId: "assigned", orderStatus: 'Placed' } : o));
                fetchOrders(); // Refresh to get full details
            }
        } catch (error) {
            console.error('Accept order error:', error);
            toast.error(error.response?.data?.message || 'Failed to accept order');
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
            assignDeliveryPartner,
            deliveryPartners,
            stats,
            loading,
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
