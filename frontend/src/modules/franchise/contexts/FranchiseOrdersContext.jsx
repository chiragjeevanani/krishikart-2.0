import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import mockOrders from '../data/mockOrders.json';
import { useOrders } from '@/modules/user/contexts/OrderContext';

const FranchiseOrdersContext = createContext();

export function FranchiseOrdersProvider({ children }) {
    const { orders: liveOrders, updateOrderStatus: updateLiveOrder } = useOrders();
    const [localOrders, setLocalOrders] = useState(mockOrders);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const savedOrders = localStorage.getItem('franchise_hotel_orders');
        if (savedOrders) {
            setLocalOrders(JSON.parse(savedOrders));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('franchise_hotel_orders', JSON.stringify(localOrders));
    }, [localOrders]);

    // Computed combined orders
    const orders = useMemo(() => {
        const liveFranchiseOrders = liveOrders
            .map(o => ({
                id: o.id,
                hotelName: o.customer || 'Direct Customer',
                hotelImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80",
                status: (o.status?.toLowerCase() === 'processing' || !o.status) ? 'new' : o.status.toLowerCase(),
                total: o.total,
                items: o.items.map(i => ({
                    id: i.id || i.productId,
                    productId: i.id || i.productId,
                    name: i.name,
                    quantity: i.quantity || parseInt(i.qty) || 1,
                    qty: i.quantity || parseInt(i.qty) || 1,
                    unit: i.unit || 'units'
                })),
                deliveryTime: "30 mins",
                deliverySlot: o.deliverySlot || "Standard",
                paymentMode: o.paymentMethod || "Prepaid",
                timeline: o.timeline || [{ status: 'Order Placed', time: new Date().toISOString(), completed: true }]
            }));

        // Combine live with local, strictly avoiding duplicates by ID
        const localOnly = localOrders.filter(l => !liveFranchiseOrders.find(live => live.id === l.id));
        return [...liveFranchiseOrders, ...localOnly];
    }, [liveOrders, localOrders]);

    const updateOrderStatus = (orderId, newStatus) => {
        const isLive = liveOrders.some(o => o.id === orderId);

        if (isLive) {
            updateLiveOrder(orderId, newStatus);
        } else {
            setLocalOrders(prev => prev.map(order => {
                if (order.id === orderId) {
                    const newTimeline = [
                        ...order.timeline,
                        { status: newStatus, time: new Date().toISOString(), completed: true }
                    ];
                    return { ...order, status: newStatus, timeline: newTimeline };
                }
                return order;
            }));
        }
    };

    const stats = useMemo(() => ({
        todayOrders: orders.length,
        newOrders: orders.filter(o => ['new', 'processing'].includes(o.status.toLowerCase())).length,
        preparing: orders.filter(o => o.status.toLowerCase() === 'preparing').length,
        outForDelivery: orders.filter(o => ['out_for_delivery', 'ready'].includes(o.status.toLowerCase())).length,
        delivered: orders.filter(o => o.status.toLowerCase() === 'delivered').length,
        revenue: orders.filter(o => o.status.toLowerCase() === 'delivered').reduce((acc, curr) => acc + curr.total, 0),
        pendingCOD: orders.filter(o => o.status.toLowerCase() === 'delivered' && o.paymentMode === 'COD').reduce((acc, curr) => acc + curr.total, 0)
    }), [orders]);

    return (
        <FranchiseOrdersContext.Provider value={{ orders, updateOrderStatus, stats, loading }}>
            {children}
        </FranchiseOrdersContext.Provider>
    );
}

export function useFranchiseOrders() {
    const context = useContext(FranchiseOrdersContext);
    if (!context) throw new Error('useFranchiseOrders must be used within FranchiseOrdersProvider');
    return context;
}
