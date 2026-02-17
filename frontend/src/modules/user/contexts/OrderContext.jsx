import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/axios';
import { toast } from 'sonner';

const OrderContext = createContext();

export function OrderProvider({ children }) {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchMyOrders = async () => {
        const token = localStorage.getItem('userToken') || localStorage.getItem('token');
        if (!token) return;

        setIsLoading(true);
        try {
            const response = await api.get('/orders/my-orders');
            if (response.data.success) {
                setOrders(response.data.results || []);
            }
        } catch (error) {
            console.error("Fetch orders error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMyOrders();
    }, []);

    const placeOrder = async (orderData) => {
        try {
            const response = await api.post('/orders/place', {
                shippingAddress: orderData.shippingAddress,
                paymentMethod: orderData.paymentMethod,
            });

            if (response.data.success) {
                const newOrder = response.data.result;
                setOrders(prev => [newOrder, ...prev]);
                return { success: true, order: newOrder };
            } else {
                toast.error(response.data.message || "Failed to place order");
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.error("Place order error:", error);
            const msg = error.response?.data?.message || "Something went wrong";
            toast.error(msg);
            return { success: false, message: msg };
        }
    };

    const getOrderById = async (id) => {
        try {
            const response = await api.get(`/orders/${id}`);
            return response.data.result;
        } catch (error) {
            console.error("Get order error:", error);
            return null;
        }
    };

    const updateOrderStatus = (orderId, status, additionalData = {}) => {
        // This would typically be a backend call, but keeping local update for UI consistency if needed
        setOrders(prev => prev.map(order =>
            order._id === orderId ? {
                ...order,
                orderStatus: status,
                ...additionalData,
            } : order
        ));
    };

    return (
        <OrderContext.Provider value={{ orders, placeOrder, updateOrderStatus, getOrderById, isLoading, fetchMyOrders }}>
            {children}
        </OrderContext.Provider>
    );
}

export function useOrders() {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error('useOrders must be used within an OrderProvider');
    }
    return context;
}
