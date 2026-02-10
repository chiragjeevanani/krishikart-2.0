import { createContext, useContext, useState, useMemo } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);

    const getPriceForQuantity = (product, quantity) => {
        if (!product.bulkPricing) return product.price;
        const applicableBulk = [...product.bulkPricing]
            .reverse()
            .find(b => quantity >= b.minQty);
        return applicableBulk ? applicableBulk.price : product.price;
    };

    const addToCart = (product, quantity = 1) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === product.id);
            if (existingItem) {
                return prevItems.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prevItems, { ...product, quantity }];
        });
    };

    const removeFromCart = (productId) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
    };

    const updateQuantity = (productId, delta) => {
        setCartItems((prevItems) =>
            prevItems.map((item) => {
                if (item.id === productId) {
                    const newQuantity = Math.max(1, item.quantity + delta);
                    return { ...item, quantity: newQuantity };
                }
                return item;
            })
        );
    };

    const clearCart = () => setCartItems([]);

    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    // Dynamically calculate total based on current quantities and bulk pricing
    const cartTotal = useMemo(() => {
        return cartItems.reduce((total, item) => {
            const activePrice = getPriceForQuantity(item, item.quantity);
            return total + (activePrice * item.quantity);
        }, 0);
    }, [cartItems]);

    // Provide the price checker helper to components
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
                getActivePrice
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
