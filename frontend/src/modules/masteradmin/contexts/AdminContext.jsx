import React, { createContext, useContext, useState } from 'react';
import api from '@/lib/axios';
import { toast } from 'sonner';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
    const [vendors, setVendors] = useState([]);
    const [franchises, setFranchises] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchVendors = async (status) => {
        setIsLoading(true);
        try {
            const response = await api.get('/masteradmin/vendors', { params: { status } });
            if (response.data.success) {
                setVendors(response.data.results || response.data.result || []);
            }
        } catch (error) {
            console.error('Fetch vendors error:', error);
            toast.error('Failed to fetch vendors');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPendingFranchises = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/masteradmin/franchises/kyc/pending');
            if (response.data.success) {
                setFranchises(response.data.results || response.data.result || []);
            }
        } catch (error) {
            console.error('Fetch franchises error:', error);
            toast.error('Failed to fetch pending franchises');
        } finally {
            setIsLoading(false);
        }
    };

    const updateVendorStatus = async (id, status) => {
        try {
            const response = await api.put(`/masteradmin/vendors/${id}/status`, { status });
            if (response.data.success) {
                toast.success(`Vendor ${status === 'active' ? 'approved' : 'updated'}`);
                setVendors(prev => prev.filter(v => v._id !== id));
                return true;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
            return false;
        }
    };

    const reviewFranchiseKYC = async (id, status, rejectionReason) => {
        try {
            const response = await api.put(`/masteradmin/franchises/${id}/kyc-review`, { status, rejectionReason });
            if (response.data.success) {
                toast.success(`Franchise KYC ${status}`);
                setFranchises(prev => prev.filter(f => f._id !== id));
                return true;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Review failed');
            return false;
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            if (response.data.success) {
                return response.data.results || response.data.result || [];
            }
            return [];
        } catch (error) {
            console.error('Fetch products error:', error);
            return [];
        }
    };

    const assignProductsToVendor = async (vendorId, productIds) => {
        try {
            const response = await api.put(`/masteradmin/vendors/${vendorId}/products`, { productIds });
            if (response.data.success) {
                toast.success('Products assigned successfully');
                return true;
            }
        } catch (error) {
            console.error('Assign products error:', error);
            toast.error(error.response?.data?.message || 'Assignment failed');
            return false;
        }
    };

    const createVendorByAdmin = async (payload) => {
        try {
            const response = await api.post('/masteradmin/vendors', payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.success) {
                const createdVendor = response.data.result?.vendor;
                if (createdVendor) {
                    setVendors(prev => [createdVendor, ...prev]);
                }
                toast.success('Vendor onboarded successfully');
                return response.data.result;
            }
            return null;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Vendor onboarding failed');
            return null;
        }
    };

    const createFranchiseByAdmin = async (payload) => {
        try {
            const response = await api.post('/masteradmin/franchises', payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.success) {
                const createdFranchise = response.data.result;
                if (createdFranchise?._id) {
                    setFranchises(prev => [createdFranchise, ...prev]);
                }
                toast.success('Franchise onboarded successfully');
                return createdFranchise;
            }
            return null;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Franchise onboarding failed');
            return null;
        }
    };

    return (
        <AdminContext.Provider value={{
            vendors,
            franchises,
            isLoading,
            fetchVendors,
            fetchPendingFranchises,
            updateVendorStatus,
            reviewFranchiseKYC,
            fetchProducts,
            assignProductsToVendor,
            createVendorByAdmin,
            createFranchiseByAdmin
        }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) throw new Error('useAdmin must be used within AdminProvider');
    return context;
};
