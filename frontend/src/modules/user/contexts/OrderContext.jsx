import { createContext, useContext, useState, useEffect } from 'react';
import mockProduce from '../../vendor/data/mockProduce.json';

const OrderContext = createContext();

export function OrderProvider({ children }) {
    const [orders, setOrders] = useState([]);

    // Load from localStorage on mount
    useEffect(() => {
        const savedOrders = localStorage.getItem('krishikart_orders');
        if (savedOrders) {
            setOrders(JSON.parse(savedOrders));
        } else {
            // Default mock data if nothing saved
            setOrders([
                {
                    id: 'ORD-9921',
                    date: 'Oct 12, 2024',
                    status: 'Delivered',
                    total: 4500,
                    items: [
                        { name: 'Shimla Apples', qty: '10kg', price: 1650 },
                        { name: 'Organic Spinach', qty: '5kg', price: 425 }
                    ],
                    address: 'Flat 402, Galaxy Apartments, Kothrud, Pune'
                }
            ]);
        }
    }, []);

    // Sync to localStorage on change
    useEffect(() => {
        if (orders.length > 0) {
            localStorage.setItem('krishikart_orders', JSON.stringify(orders));
        }
    }, [orders]);

    // Listen for changes from other tabs
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'krishikart_orders' && e.newValue) {
                setOrders(JSON.parse(e.newValue));
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const placeOrder = (orderDetails) => {
        // In a real app, we would fetch the target franchise's inventory here
        // For simulation, we import mock data or use a global state
        // Updated IDs to match products.json (p1, p2, p3...)
        const mockFranchiseInventory = [
            { id: 'p1', productId: 'p1', currentStock: 500, mbq: 20 },  // High stock
            { id: 'p9', productId: 'p9', currentStock: 800, mbq: 20 },  // High stock
            { id: 'p2', productId: 'p2', currentStock: 5, mbq: 40 }    // Low stock
        ];

        // Since we are in the user context, we simulate the strategy decision
        const hasLowStock = orderDetails.items.some(item => {
            const stock = mockFranchiseInventory.find(s => s.id === item.id || s.productId === item.id);
            // If item.quantity is missing, try to parse from string '20kg'
            const neededQty = item.quantity || parseInt(item.qty) || 0;
            const isMissing = !stock || stock.currentStock < neededQty;

            console.log('Stock Check:', item.name, { needed: neededQty, available: stock?.currentStock, isMissing });
            return isMissing;
        });

        const procurementTotal = orderDetails.items.reduce((sum, item) => {
            const vendorPrice = mockProduce.find(p => p.name === item.name || p.id === item.id)?.price || (item.price * 0.7);
            const qty = item.quantity || parseInt(item.qty) || 0;
            return sum + (vendorPrice * qty);
        }, 0);

        const newOrder = {
            id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: 'new',
            fulfillmentType: hasLowStock ? 'requires_procurement' : 'franchise_stock',
            assignedVendor: hasLowStock ? 'KrishiKart Indore' : null,
            stockStatus: hasLowStock ? 'Low Stock at Franchise' : 'In Stock',
            procurementTotal: Math.round(procurementTotal),
            ...orderDetails
        };
        setOrders(prev => [newOrder, ...prev]);
        return newOrder;
    };

    const updateOrderStatus = (orderId, status, additionalData = {}) => {
        setOrders(prev => prev.map(order =>
            order.id === orderId ? {
                ...order,
                status,
                ...additionalData,
                lastUpdated: new Date().toISOString()
            } : order
        ));
    };

    return (
        <OrderContext.Provider value={{ orders, placeOrder, updateOrderStatus }}>
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
