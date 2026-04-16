import React, { createContext, useContext, useState } from 'react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { getSocket } from '@/lib/socket';
import { useNotificationSound } from '@/hooks/useNotificationSound';
import { useEffect } from 'react';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
    const [vendors, setVendors] = useState([]);
    const [franchises, setFranchises] = useState([]);
    const [deliveryPartners, setDeliveryPartners] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isQuotationAlertOpen, setIsQuotationAlertOpen] = useState(false);
    const [newQuotationData, setNewQuotationData] = useState(null);
    const { playNotificationSound } = useNotificationSound();

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

    const fetchPendingFranchises = async (status) => {
        setIsLoading(true);
        try {
            const response = await api.get('/masteradmin/franchises/kyc/pending', { params: { status } });
            if (response.data.success) {
                setFranchises(response.data.results || response.data.result || []);
            }
        } catch (error) {
            console.error('Fetch franchises error:', error);
            toast.error('Failed to fetch franchises');
        } finally {
            setIsLoading(false);
        }
    };

    const updateVendorStatus = async (id, status) => {
        try {
            const response = await api.put(`/masteradmin/vendors/${id}/status`, { status });
            if (response.data.success) {
                toast.success(`Vendor ${status === 'active' ? 'approved' : 'updated'}`);
                setVendors(prev => prev.filter(v => String(v._id || v.id) !== String(id)));
                return true;
            }
            toast.error(response.data?.message || 'Update failed');
            return false;
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
                setFranchises(prev => prev.filter(f => String(f._id || f.id) !== String(id)));
                return true;
            }
            toast.error(response.data?.message || 'Review failed');
            return false;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Review failed');
            return false;
        }
    };

    const fetchDeliveryPartners = async (status) => {
        setIsLoading(true);
        try {
            const response = await api.get('/masteradmin/delivery-partners', { params: { status } });
            if (response.data.success) {
                setDeliveryPartners(response.data.results || response.data.result || []);
            }
        } catch (error) {
            console.error('Fetch delivery partners error:', error);
            toast.error('Failed to fetch delivery partners');
        } finally {
            setIsLoading(false);
        }
    };

    const updateDeliveryPartnerStatus = async (id, isApproved) => {
        const idStr = id != null ? String(id) : '';
        if (!idStr) {
            toast.error('Invalid partner id');
            return false;
        }
        try {
            const response = await api.put(`/masteradmin/delivery-partners/${idStr}/status`, { isApproved });
            const ok = response.status === 200 && (response.data?.success !== false);
            if (ok) {
                toast.success(`Delivery partner ${isApproved ? 'approved' : 'rejected'}`);
                setDeliveryPartners(prev => prev.filter(p => String(p._id || p.id) !== idStr));
                return true;
            }
            toast.error(response.data?.message || 'Update failed');
            return false;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
            return false;
        }
    };

    const reviewDeliveryDocs = async (id, action, reason) => {
        try {
            const response = await api.put(`/masteradmin/delivery-partners/${id}/docs-review`, { action, reason });
            if (response.data.success) {
                toast.success(`Delivery documents ${action}d`);
                return true;
            }
            toast.error(response.data?.message || 'Review failed');
            return false;
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

    const updateFranchiseServiceArea = async (id, serviceHexagons, location) => {
        try {
            const response = await api.put(`/masteradmin/franchises/${id}/service-area`, { 
                serviceHexagons,
                location: location ? {
                    type: 'Point',
                    coordinates: [location.lng, location.lat]
                } : undefined
            });
            if (response.data.success) {
                toast.success('Service area updated successfully');
                fetchPendingFranchises();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Update service area error:', error);
            toast.error(error.response?.data?.message || 'Update failed');
            return false;
        }
    };

    const fetchFranchiseServiceMap = async () => {
        try {
            const response = await api.get('/masteradmin/franchise-service-map');
            if (response.data.success) {
                return response.data.results;
            }
            return [];
        } catch (error) {
            console.error('Fetch service map error:', error);
            return [];
        }
    };

    useEffect(() => {
        const socket = getSocket();
        
        const handleNewQuotation = (data) => {
            console.log("New Quotation Received:", data);
            setNewQuotationData(data);
            setIsQuotationAlertOpen(true);
            playNotificationSound();
        };

        socket.on('procurement_quote_received', handleNewQuotation);

        return () => {
            socket.off('procurement_quote_received', handleNewQuotation);
        };
    }, []);

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
            createFranchiseByAdmin,
            updateFranchiseServiceArea,
            fetchFranchiseServiceMap,
            deliveryPartners,
            fetchDeliveryPartners,
            updateDeliveryPartnerStatus,
            reviewDeliveryDocs,
            isQuotationAlertOpen,
            setIsQuotationAlertOpen,
            newQuotationData
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
