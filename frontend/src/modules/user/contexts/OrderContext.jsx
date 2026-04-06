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

        const syncOrderById = async (orderId) => {
            if (!orderId) return;
            try {
                const response = await api.get(`/orders/${orderId}`);
                if (response.data.success && response.data.result) {
                    const updatedOrder = response.data.result;
                    setOrders((prev) => {
                        const exists = prev.some((order) => order._id === orderId);
                        if (exists) {
                            return prev.map((order) => (order._id === orderId ? updatedOrder : order));
                        }
                        return [updatedOrder, ...prev];
                    });
                }
            } catch (error) {
                console.error('Sync order by id error:', error);
            }
        };

        const onReturnRequestReviewed = async (payload) => {
            if (!payload?.orderId) return;

            if (payload?.action === 'reject') {
                toast.error(payload.message || 'Your return request was rejected.');
            } else if (payload?.action === 'approve') {
                toast.success(payload.message || 'Your return request was approved.');
            }

            await fetchMyOrders();
        };

        const onOrderStatusChanged = async (payload) => {
            if (!payload?.orderId) return;
            await syncOrderById(payload.orderId);
        };

        const onReturnPickupStatusUpdated = async (payload) => {
            if (!payload?.orderId) return;
            await syncOrderById(payload.orderId);
        };

        socket.on('return_request_reviewed', onReturnRequestReviewed);
        socket.on('order_status_changed', onOrderStatusChanged);
        socket.on('return_pickup_status_updated', onReturnPickupStatusUpdated);

        return () => {
            socket.off('return_request_reviewed', onReturnRequestReviewed);
            socket.off('order_status_changed', onOrderStatusChanged);
            socket.off('return_pickup_status_updated', onReturnPickupStatusUpdated);
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
                shippingLocation: orderData.shippingLocation || null,
                paymentMethod: orderData.paymentMethod,
                deliveryShift: orderData.deliveryShift,
                couponCode: orderData.couponCode || '',
                discountAmount: orderData.discountAmount || 0,
            });

            if (response.data.success) {
                const result = response.data.result;
                const placedOrders = Array.isArray(result?.orders)
                    ? result.orders
                    : result?.order
                      ? [result.order]
                      : result?._id
                        ? [result]
                        : [];
                if (placedOrders.length) {
                    setOrders((prev) => [...placedOrders, ...prev]);
                }
                return {
                    success: true,
                    orders: placedOrders,
                    order: placedOrders[0] ?? null,
                    orderGroupId: result?.orderGroupId ?? null,
                    grandTotal: result?.grandTotal,
                };
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
