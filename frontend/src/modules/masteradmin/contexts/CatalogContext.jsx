import React, { createContext, useContext, useState, useEffect } from 'react';

const CatalogContext = createContext();

export const useCatalog = () => {
    const context = useContext(CatalogContext);
    if (!context) {
        throw new Error('useCatalog must be used within a CatalogProvider');
    }
    return context;
};

export const CatalogProvider = ({ children }) => {
    const [categories, setCategories] = useState([
        { id: '1', name: 'Fruits & Vegetables', description: 'Fresh farm produce', image: null },
        { id: '2', name: 'Grains & Pulses', description: 'Essential grains', image: null },
        { id: '3', name: 'Dairy & Eggs', description: 'Milk and poultry products', image: null }
    ]);

    const [subcategories, setSubcategories] = useState([
        { id: 's1', categoryId: '1', name: 'Seasonal Fruits', image: null },
        { id: 's2', categoryId: '1', name: 'Leafy Greens', image: null },
        { id: 's3', categoryId: '2', name: 'Basmati Rice', image: null },
        { id: 's4', categoryId: '3', name: 'Fresh Milk', image: null }
    ]);

    const addCategory = (category) => {
        const newCategory = {
            ...category,
            id: Date.now().toString()
        };
        setCategories(prev => [...prev, newCategory]);
        return newCategory;
    };

    const addSubcategory = (subcategory) => {
        const newSubcategory = {
            ...subcategory,
            id: Date.now().toString()
        };
        setSubcategories(prev => [...prev, newSubcategory]);
        return newSubcategory;
    };

    const getSubcategoriesByCategory = (categoryId) => {
        return subcategories.filter(s => s.categoryId === categoryId);
    };

    return (
        <CatalogContext.Provider value={{
            categories,
            subcategories,
            addCategory,
            addSubcategory,
            getSubcategoriesByCategory
        }}>
            {children}
        </CatalogContext.Provider>
    );
};
