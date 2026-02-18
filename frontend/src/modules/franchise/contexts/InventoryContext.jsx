import React, { createContext, useContext, useState, useEffect } from 'react';
import mockInventory from '../data/mockInventory.json';
import api from '@/lib/axios';

const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const response = await api.get('/franchise/inventory');
            if (response.data.success && response.data.results?.items) {
                const mappedInventory = response.data.results.items.map(item => ({
                    id: item.productId?._id || item._id,
                    productId: item.productId?._id,
                    name: item.productId?.name || 'Unknown Product',
                    currentStock: item.currentStock,
                    mbq: item.mbq,
                    price: item.productId?.price || 0,
                    image: item.productId?.primaryImage || '',
                    unit: item.productId?.unit || 'kg',
                    category: item.productId?.category?.name || 'General',
                    lastUpdated: item.lastUpdated
                }));
                setInventory(mappedInventory);
            } else {
                setInventory(mockInventory);
            }
        } catch (error) {
            console.error("Failed to fetch inventory from server:", error);
            setInventory(mockInventory);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const updateStock = (productId, newQty) => {
        setInventory(prev => prev.map(item =>
            (item.id === productId || item.productId === productId)
                ? { ...item, currentStock: Math.max(0, newQty), lastUpdated: new Date().toISOString() }
                : item
        ));
    };

    const deductStock = (itemsToDeduct) => {
        // itemsToDeduct: Array of { productId, qty, name }
        let errors = [];
        setInventory(prev => {
            const nextInventory = prev.map(item => {
                const deduction = itemsToDeduct.find(i => i.productId === item.id || i.id === item.id || i.productId === item.productId);
                if (deduction) {
                    if (item.currentStock < deduction.qty) {
                        errors.push(`Insufficient stock for ${item.name}`);
                        return item;
                    }
                    return {
                        ...item,
                        currentStock: item.currentStock - deduction.qty,
                        lastUpdated: new Date().toISOString()
                    };
                }
                return item;
            });
            return nextInventory;
        });
        return errors;
    };

    const addStock = (itemsToAdd) => {
        // itemsToAdd: Array of { productId, qty }
        setInventory(prev => prev.map(item => {
            const added = itemsToAdd.find(i => i.productId === item.id || i.id === item.id || i.productId === item.productId);
            if (added) {
                return {
                    ...item,
                    currentStock: item.currentStock + added.qty,
                    lastUpdated: new Date().toISOString()
                };
            }
            return item;
        }));
    };

    const getLowStockItems = () => {
        return inventory.filter(item => item.currentStock <= item.mbq);
    };

    const getStockStats = () => {
        const totalItems = inventory.length;
        const healthyCount = inventory.filter(item => item.currentStock > item.mbq).length;
        const lowStockCount = getLowStockItems().length;
        const outOfStockCount = inventory.filter(item => item.currentStock === 0).length;
        const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * (item.price || 0)), 0);

        return {
            totalItems,
            healthyCount,
            lowStockCount,
            outOfStockCount,
            totalValue,
            healthPercentage: totalItems > 0 ? Math.round((healthyCount / totalItems) * 100) : 100
        };
    };

    const categories = Array.from(new Set(inventory.map(item => item.category)));

    return (
        <InventoryContext.Provider value={{
            inventory,
            categories,
            loading,
            updateStock,
            addStock,
            deductStock,
            getLowStockItems,
            getStockStats,
            refreshInventory: fetchInventory
        }}>
            {children}
        </InventoryContext.Provider>
    );
};

export const useInventory = () => {
    const context = useContext(InventoryContext);
    if (!context) throw new Error('useInventory must be used within InventoryProvider');
    return context;
};
