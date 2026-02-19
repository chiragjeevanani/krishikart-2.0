import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/axios';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
    const [wishlistItems, setWishlistItems] = useState([]);

    const fetchWishlist = async () => {
        const token = localStorage.getItem('userToken') || localStorage.getItem('token');
        const path = window.location.pathname;

        if (!token ||
            ['/', '/login', '/verification'].includes(path) ||
            path.includes('/masteradmin') ||
            path.includes('/franchise') ||
            path.includes('/vendor') ||
            path.includes('/delivery')
        ) {
            const saved = localStorage.getItem('kk_wishlist');
            setWishlistItems(saved ? JSON.parse(saved) : []);
            return;
        }

        try {
            const response = await api.get('/user/wishlist');
            if (response.data.success) {
                const items = (response.data.result?.products || [])
                    .filter(p => p) // Guard against nulls
                    .map(p => ({
                        ...p,
                        id: p._id // Ensure compatibility
                    }));
                setWishlistItems(items);
            }
        } catch (error) {
            console.error("Fetch wishlist error:", error);
            const saved = localStorage.getItem('kk_wishlist');
            setWishlistItems(saved ? JSON.parse(saved) : []);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const toggleWishlist = async (product) => {
        const token = localStorage.getItem('userToken') || localStorage.getItem('token');
        const productId = product._id || product.id;

        // Optimistic update
        setWishlistItems((prev) => {
            const isExist = prev.find((item) => item.id === productId);
            let newItems;
            if (isExist) {
                newItems = prev.filter((item) => item.id !== productId);
            } else {
                newItems = [...prev, { ...product, id: productId }];
            }
            localStorage.setItem('kk_wishlist', JSON.stringify(newItems));
            return newItems;
        });

        if (token) {
            try {
                await api.post('/user/wishlist/toggle', { productId });
            } catch (error) {
                console.error("Toggle wishlist API error:", error);
            }
        }
    };

    const isWishlisted = (productId) => {
        return wishlistItems.some((item) => item.id === productId);
    };

    const wishlistCount = wishlistItems.length;

    return (
        <WishlistContext.Provider
            value={{
                wishlistItems,
                toggleWishlist,
                isWishlisted,
                wishlistCount,
                fetchWishlist
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}
