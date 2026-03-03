import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useFCM } from '@/hooks/useFCM';

const FranchiseAuthContext = createContext();

export function FranchiseAuthProvider({ children }) {
    const [franchise, setFranchise] = useState(() => {
        const savedData = localStorage.getItem('franchiseData');
        const savedToken = localStorage.getItem('franchiseToken');
        if (!savedToken) return null;
        try {
            return savedData ? JSON.parse(savedData) : null;
        } catch (e) {
            return null;
        }
    });
    const [loading, setLoading] = useState(true);

    // Register FCM Token
    useFCM(!!franchise, 'franchise');

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('franchiseToken');
            if (token) {
                try {
                    const { data } = await api.get('/franchise/me');
                    setFranchise(data.result);
                    localStorage.setItem('franchiseData', JSON.stringify(data.result));
                } catch (error) {
                    console.error("Failed to load franchise profile", error);
                    if (error.response?.status === 401) {
                        logout();
                    }
                }
            }
            setLoading(false);
        };
        loadUser();

        const handleStorageChange = (e) => {
            if (e.key === 'franchiseToken' && !e.newValue) {
                logout();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const loginSuccess = (data, token) => {
        setFranchise(data);
        localStorage.setItem('franchiseToken', token);
        localStorage.setItem('franchiseData', JSON.stringify(data));
    };

    const updateProfile = async (data) => {
        try {
            const response = await api.put('/franchise/update', data);
            const updated = response.data.result;
            setFranchise(updated);
            localStorage.setItem('franchiseData', JSON.stringify(updated));
            return { success: true };
        } catch (error) {
            console.error("Update profile failed", error);
            throw error;
        }
    };

    const updatePassword = async (oldPassword, newPassword) => {
        try {
            await api.post('/franchise/change-password', { oldPassword, newPassword });
            return { success: true };
        } catch (error) {
            console.error("Update password failed", error);
            throw error;
        }
    };

    const logout = () => {
        setFranchise(null);
        localStorage.removeItem('franchiseToken');
        localStorage.removeItem('franchiseData');
        localStorage.removeItem('kk_franchise'); // Cleanup old
        window.location.href = '/franchise/login';
    };

    return (
        <FranchiseAuthContext.Provider value={{
            franchise,
            loginSuccess,
            logout,
            updateProfile,
            updatePassword,
            isAuthenticated: !!franchise,
            loading
        }}>
            {children}
        </FranchiseAuthContext.Provider>
    );
}

export function useFranchiseAuth() {
    const context = useContext(FranchiseAuthContext);
    return context;
}
