/**
 * EXAMPLE: How to fetch products from Backend API instead of local JSON
 * 
 * Replace your ProductListScreen.jsx imports and data fetching with this approach
 */

// 1. Create an API service file (optional but recommended)
// File: frontend/src/services/productService.js

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const productService = {
    // Get all products with optional filters
    async getProducts(filters = {}) {
        const params = new URLSearchParams(filters);
        const response = await fetch(`${API_BASE_URL}/products?${params}`);
        if (!response.ok) throw new Error('Failed to fetch products');
        return response.json();
    },

    // Get single product by ID
    async getProductById(id) {
        const response = await fetch(`${API_BASE_URL}/products/${id}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        return response.json();
    },

    // Create product (Master Admin only)
    async createProduct(productData, token) {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });
        if (!response.ok) throw new Error('Failed to create product');
        return response.json();
    }
};


// 2. Update ProductListScreen.jsx to use API
// Replace this:
import productsData from '../data/products.json'

// With this:
import { useState, useEffect } from 'react';
import { productService } from '@/services/productService';

export default function ProductListScreen() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const data = await productService.getProducts();
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) return <div>Loading products...</div>;

    // Rest of your component code...
}


// 3. For AddProductScreen - Example of creating a product
const handleSave = async () => {
    setIsSaving(true);
    try {
        const token = localStorage.getItem('masterAdminToken'); // Or get from context
        await productService.createProduct(formData, token);
        alert('Product created successfully!');
        // Reset form or redirect
    } catch (error) {
        console.error('Error creating product:', error);
        alert('Failed to create product');
    } finally {
        setIsSaving(false);
    }
};


// 4. Environment Variable Setup
// Create/update frontend/.env file:
/*
VITE_API_URL=http://localhost:3000
*/

// For production:
/*
VITE_API_URL=https://your-production-api.com
*/
