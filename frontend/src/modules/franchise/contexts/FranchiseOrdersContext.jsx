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
    }, []);

    // Computed combined orders with mapping
    const orders = useMemo(() => {
        return liveOrders.map(o => ({
            id: o._id,
            hotelName: o.userId?.fullName || 'Guest User',
            hotelImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80",
            status: o.orderStatus?.toLowerCase() || 'new',
            total: o.totalAmount,
            items: o.items.map(i => ({
                id: i.productId,
                productId: i.productId,
                name: i.name,
                quantity: i.quantity,
                qty: i.quantity,
                unit: i.unit || 'units'
            })),
            deliveryTime: "30 mins",
            deliverySlot: "Standard",
            paymentMode: o.paymentMethod || "Prepaid",
            timeline: [{ status: 'Order Placed', time: o.createdAt, completed: true }],
            date: o.date,
            time: o.time,
            franchiseId: o.franchiseId,
            deliveryPartnerId: o.deliveryPartnerId?._id || o.deliveryPartnerId,
            deliveryPartner: o.deliveryPartnerId // Will contain populated object if fetched with populate
        }));
    }, [liveOrders]);

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const response = await api.put(`/orders/franchise/${orderId}/status`, { status: newStatus });
            if (response.data.success) {
                toast.success(`Order status updated to ${newStatus}`);
                setLiveOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
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
        newOrders: orders.filter(o => o.status === 'placed' && !o.franchiseId).length,
        packing: orders.filter(o => o.status === 'placed' && o.franchiseId).length,
        dispatch: orders.filter(o => ['packed', 'dispatched'].includes(o.status)).length,
        completed: orders.filter(o => ['delivered', 'received'].includes(o.status)).length,
        revenue: orders.filter(o => o.status === 'received').reduce((acc, curr) => acc + (curr.total || 0), 0)
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
            refreshPartners: fetchDeliveryPartners
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
