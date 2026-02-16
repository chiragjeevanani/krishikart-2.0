import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/axios';
import { toast } from 'sonner';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
    const [vendors, setVendors] = useState([]);
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

    const updateVendorStatus = async (id, status) => {
        try {
            const response = await api.put(`/masteradmin/vendors/${id}/status`, { status });
            if (response.data.success) {
                toast.success(`Vendor ${status === 'active' ? 'approved' : 'updated'}`);
                setVendors(prev => prev.filter(v => v._id !== id)); // Remove from pending list
                return true;
            }
        } catch (error) {
            console.error('Update status error:', error);
            toast.error(error.response?.data?.message || 'Update failed');
            return false;
        }
    };

    return (
        <AdminContext.Provider value={{
            vendors,
            isLoading,
            fetchVendors,
            updateVendorStatus
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
