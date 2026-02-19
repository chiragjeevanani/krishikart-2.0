import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/axios';
import { toast } from 'sonner';

const DeliveryOrderContext = createContext();

export function DeliveryOrderProvider({ children }) {
    const [dispatchedOrders, setDispatchedOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchDispatchedOrders = async () => {
        setLoading(true);
        try {
            const response = await api.get('/orders/delivery/dispatched');
            if (response.data.success) {
                setDispatchedOrders(response.data.results || []);
            }
        } catch (error) {
            console.error('Fetch dispatched orders error:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            const response = await api.put(`/orders/delivery/${orderId}/status`, { status: newStatus });
            if (response.data.success) {
                toast.success(`Status updated to ${newStatus}`);
                setDispatchedOrders(prev => prev.filter(o => o.id !== orderId));
                fetchDispatchedOrders();
            }
        } catch (error) {
            console.error('Update status error:', error);
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('deliveryToken');
        if (token) {
            fetchDispatchedOrders();
        }
    }, []);

    return (
        <DeliveryOrderContext.Provider value={{ dispatchedOrders, loading, fetchDispatchedOrders, updateStatus }}>
            {children}
        </DeliveryOrderContext.Provider>
    );
}

export function useDeliveryOrders() {
    const context = useContext(DeliveryOrderContext);
    if (!context) throw new Error('useDeliveryOrders must be used within DeliveryOrderProvider');
    return context;
}
