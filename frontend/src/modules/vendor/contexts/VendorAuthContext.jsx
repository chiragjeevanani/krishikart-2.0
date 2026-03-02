import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/axios';

const VendorAuthContext = createContext();

export function VendorAuthProvider({ children }) {
    const [vendor, setVendor] = useState(() => {
        const savedData = localStorage.getItem('vendorData');
        const savedToken = localStorage.getItem('vendorToken');

        // Only consider authenticated if we have both data and token
        if (!savedToken) return null;

        try {
            return savedData ? JSON.parse(savedData) : null;
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

        const handleStorageChange = (e) => {
            if (e.key === 'vendorToken' && !e.newValue) {
                logout();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
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
            {loading ? (
                <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
                    <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initialising Secure Session...</p>
                </div>
            ) : children}
        </VendorAuthContext.Provider>
    );
}

export function useVendorAuth() {
    const context = useContext(VendorAuthContext);
    if (!context) throw new Error('useVendorAuth must be used within VendorAuthProvider');
    return context;
}
