import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import api from '@/lib/axios';
import { toast } from 'sonner';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch cart on mount if token exists
    const fetchCart = async () => {
        const token = localStorage.getItem('userToken') || localStorage.getItem('token');
        const path = window.location.pathname;

        // Skip if no token or if on auth/separate module pages
        if (!token ||
            ['/', '/login', '/verification'].includes(path) ||
            path.includes('/masteradmin') ||
            path.includes('/franchise') ||
            path.includes('/vendor') ||
            path.includes('/delivery')
        ) return;

        try {
            const response = await api.get('/user/cart');
            if (response.data.success) {
                // Map API response to context structure
                const items = (response.data.result?.items || [])
                    .filter(item => item.productId) // Guard against null productId
                    .map(item => ({
                        ...item.productId,
                        quantity: item.quantity,
                        id: item.productId._id // Ensure compatibility
                    }));
                setCartItems(items);
            }
        } catch (error) {
            console.error("Fetch cart error:", error);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const getPriceForQuantity = (product, quantity) => {
        if (!product.bulkPricing) return product.price;
        const applicableBulk = [...product.bulkPricing]
            .reverse()
            .find(b => quantity >= b.minQty);
        return applicableBulk ? applicableBulk.price : product.price;
    };

    const addToCart = async (product, quantity = 1) => {
        const token = localStorage.getItem('userToken') || localStorage.getItem('token');

        // Optimistic local update
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === product._id || item.id === product.id);
            if (existingItem) {
                return prevItems.map((item) =>
                    (item.id === product._id || item.id === product.id)
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prevItems, { ...product, id: product._id || product.id, quantity }];
        });

        if (token) {
            try {
                await api.post('/user/cart/add', { productId: product._id || product.id, quantity });
                fetchCart(); // Sync with backend to be safe
            } catch (error) {
                console.error("API add to cart error:", error);
                toast.error("Failed to sync cart with server");
            }
        }
    };

    const removeFromCart = async (productId) => {
        const token = localStorage.getItem('userToken') || localStorage.getItem('token');

        setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));

        if (token) {
            try {
                await api.delete(`/user/cart/remove/${productId}`);
            } catch (error) {
                console.error("API remove from cart error:", error);
            }
        }
    };

    const updateQuantity = async (productId, delta) => {
        const token = localStorage.getItem('userToken') || localStorage.getItem('token');

        let newQty = 1;
        setCartItems((prevItems) =>
            prevItems.map((item) => {
                if (item.id === productId) {
                    newQty = Math.max(0, item.quantity + delta);
                    return { ...item, quantity: newQty };
                }
                return item;
            }).filter(item => item.quantity > 0)
        );

        if (token) {
            try {
                await api.put('/user/cart/update', { productId, quantity: newQty });
            } catch (error) {
                console.error("API update quantity error:", error);
            }
        }
    };

    const clearCart = () => setCartItems([]);

    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    const cartTotal = useMemo(() => {
        return cartItems.reduce((total, item) => {
            const activePrice = getPriceForQuantity(item, item.quantity);
            return total + (activePrice * item.quantity);
        }, 0);
    }, [cartItems]);

    const getActivePrice = (item) => getPriceForQuantity(item, item.quantity);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartCount,
                cartTotal,
                getActivePrice,
                fetchCart,
                isLoading
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
