import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/axios';

const VendorAuthContext = createContext();

export function VendorAuthProvider({ children }) {
    const [vendor, setVendor] = useState(() => {
        const saved = localStorage.getItem('vendorData');
        try {
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadVendor = async () => {
            const token = localStorage.getItem('vendorToken');
            if (token) {
                try {
                    const response = await api.get('/vendor/me');
                    if (response.data.success) {
                        setVendor(response.data.result);
                        localStorage.setItem('vendorData', JSON.stringify(response.data.result));
                    }
                } catch (error) {
                    console.error("Failed to load vendor profile", error);
                    if (error.response?.status === 401) {
                        logout();
                    }
                }
            }
            setLoading(false);
        };
        loadVendor();
    }, []);

    const loginSuccess = (data, token) => {
        setVendor(data);
        localStorage.setItem('vendorToken', token);
        localStorage.setItem('vendorData', JSON.stringify(data));
    };

    const logout = () => {
        setVendor(null);
        localStorage.removeItem('vendorToken');
        localStorage.removeItem('vendorData');
    };

    return (
        <VendorAuthContext.Provider value={{
            vendor,
            loginSuccess,
            logout,
            isAuthenticated: !!vendor,
            loading
        }}>
            {children}
        </VendorAuthContext.Provider>
    );
}

export function useVendorAuth() {
    const context = useContext(VendorAuthContext);
    if (!context) throw new Error('useVendorAuth must be used within VendorAuthProvider');
    return context;
}
