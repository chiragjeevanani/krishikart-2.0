import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import api from '@/lib/axios';
import { toast } from 'sonner';

const FranchiseOrdersContext = createContext();

export function FranchiseOrdersProvider({ children }) {
    const [liveOrders, setLiveOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const franchiseData = JSON.parse(localStorage.getItem('franchiseData') || '{}');
            console.log('=== Fetching Franchise Orders ===');
            console.log('Franchise ID:', franchiseData?._id);
            console.log('Franchise Name:', franchiseData?.shopName);

            const response = await api.get('/orders/franchise/all');
            console.log('API Response - Success:', response.data.success);
            console.log('Orders received:', response.data.results?.length || 0);

            if (response.data.success) {
                setLiveOrders(response.data.results || []);
            }
        } catch (error) {
            console.error('Fetch franchise orders error:', error);
            console.error('Franchise logged in?', !!localStorage.getItem('franchiseToken'));
            console.error('Error details:', error.response?.data);
            // toast.error('Failed to load live orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
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
            timeline: [{ status: 'Order Placed', time: o.createdAt, completed: true }]
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
            toast.error('Failed to update status');
        }
    };

    const stats = useMemo(() => ({
        todayOrders: orders.length,
        newOrders: orders.filter(o => ['new', 'processing'].includes(o.status.toLowerCase())).length,
        preparing: orders.filter(o => o.status.toLowerCase() === 'preparing').length,
        outForDelivery: orders.filter(o => ['out_for_delivery', 'ready', 'shipped'].includes(o.status.toLowerCase())).length,
        delivered: orders.filter(o => o.status.toLowerCase() === 'delivered').length,
        revenue: orders.filter(o => o.status.toLowerCase() === 'delivered').reduce((acc, curr) => acc + (curr.total || 0), 0),
        pendingCOD: orders.filter(o => o.status.toLowerCase() === 'delivered' && o.paymentMode === 'COD').reduce((acc, curr) => acc + (curr.total || 0), 0)
    }), [orders]);

    return (
        <FranchiseOrdersContext.Provider value={{ orders, updateOrderStatus, stats, loading, refreshOrders: fetchOrders }}>
            {children}
        </FranchiseOrdersContext.Provider>
    );
}

export function useFranchiseOrders() {
    const context = useContext(FranchiseOrdersContext);
    if (!context) throw new Error('useFranchiseOrders must be used within FranchiseOrdersProvider');
    return context;
}
