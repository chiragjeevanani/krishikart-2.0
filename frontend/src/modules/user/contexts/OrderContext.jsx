import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { initSocket, joinOrderRoom } from '@/lib/socket';

const OrderContext = createContext();

export function OrderProvider({ children }) {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchMyOrders = async () => {
        const token = localStorage.getItem('userToken');
        const path = window.location.pathname;

        // Skip fetching if no user token or if we are on auth pages / different modules
        if (!token ||
            path === '/' ||
            path === '/login' ||
            path === '/verification' ||
            path.includes('/masteradmin') ||
            path.includes('/vendor') ||
            path.includes('/franchise') ||
            path.includes('/delivery')
        ) return;

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

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (!token) return;

        const socket = initSocket();

        const onReturnRequestReviewed = async (payload) => {
            if (!payload?.orderId) return;

            if (payload?.action === 'reject') {
                toast.error(payload.message || 'Your return request was rejected.');
            } else if (payload?.action === 'approve') {
                toast.success(payload.message || 'Your return request was approved.');
            }

            await fetchMyOrders();
        };

        socket.on('return_request_reviewed', onReturnRequestReviewed);

        return () => {
            socket.off('return_request_reviewed', onReturnRequestReviewed);
        };
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (!token || !orders?.length) return;

        orders.forEach((order) => {
            if (order?._id) joinOrderRoom(order._id);
        });
    }, [orders]);

    const placeOrder = async (orderData) => {
        try {
            const response = await api.post('/orders/place', {
                shippingAddress: orderData.shippingAddress,
                paymentMethod: orderData.paymentMethod,
                deliveryShift: orderData.deliveryShift,
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

    const updateOrderStatus = async (orderId, status, additionalData = {}) => {
        try {
            const response = await api.put(`/orders/${orderId}/status`, { status });
            if (response.data.success) {
                const updatedOrder = response.data.result;
                setOrders(prev => prev.map(order =>
                    order._id === orderId ? updatedOrder : order
                ));
                return { success: true };
            }
        } catch (error) {
            console.error("Update order status error:", error);
            const msg = error.response?.data?.message || "Failed to update status";
            toast.error(msg);
            return { success: false, message: msg };
        }
    };

    const requestReturn = async (orderId, payload) => {
        try {
            const response = await api.post(`/orders/${orderId}/return-request`, payload);
            if (response.data.success) {
                const updatedOrder = response.data.result;
                setOrders(prev => prev.map(order =>
                    order._id === orderId ? updatedOrder : order
                ));
                return { success: true, order: updatedOrder };
            }
            const msg = response.data.message || "Failed to submit return request";
            toast.error(msg);
            return { success: false, message: msg };
        } catch (error) {
            console.error("Request return error:", error);
            const msg = error.response?.data?.message || "Failed to submit return request";
            toast.error(msg);
            return { success: false, message: msg };
        }
    };

    return (
        <OrderContext.Provider value={{ orders, placeOrder, updateOrderStatus, requestReturn, getOrderById, isLoading, fetchMyOrders }}>
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
