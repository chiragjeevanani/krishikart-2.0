import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/axios';

const FranchiseAuthContext = createContext();

export function FranchiseAuthProvider({ children }) {
    const [franchise, setFranchise] = useState(() => {
        const saved = localStorage.getItem('franchiseData');
        return saved ? JSON.parse(saved) : null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('franchiseToken');
            if (token) {
                try {
                    const { data } = await api.get('/franchise/me');
                    // Data might be wrapped in result or direct? 
                    // Controller: return handleResponse(res, 200, "Franchise profile", req.franchise);
                    // So data.result is the franchise.
                    setFranchise(data.result);
                    localStorage.setItem('franchiseData', JSON.stringify(data.result));
                } catch (error) {
                    console.error("Failed to load franchise profile", error);
                    // If 401, maybe logout?
                    if (error.response?.status === 401) {
                        logout();
                    }
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const login = async (mobile, otp) => {
        // This is usually handled by LoginScreen directly, but if we want to centralize:
        // For now, let's keep it compatible with LoginScreen which sets localStorage.
        // But if LoginScreen calls this, we can do logic here.
        // Currently LoginScreen does manual API call.
        // We can expose a strict setFranchise to update state after login.
    };

    // Helper to update state manually (called by LoginScreen if needed, but LoginScreen reloads or navigates?)
    // If LoginScreen navigates to Dashboard, Dashboard mounts, Context might not reload from localStorage if it's already mounted higher up.
    // We should listen to storage event or expose a reload function.
    // Or LoginScreen should call a context method `setAuth(data, token)`.

    // Let's rely on window.location.reload() or navigate in LoginScreen.
    // If LoginScreen navigates, the Context (if wrapping App) persists. 
    // It won't see the new localStorage until re-render.
    // So LoginScreen SHOULD call setFranchise.
    // But LoginScreen imports `login` from context but doesn't use it for the API call?
    // It calls `navigate`.

    // I will export a `setAuth` or `loginSuccess` function.

    const loginSuccess = (data) => {
        setFranchise(data);
        localStorage.setItem('franchiseData', JSON.stringify(data));
        // Token is assumed set by caller in localStorage, or passed here.
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
        // Optional: redirect
    };

    return (
        <FranchiseAuthContext.Provider value={{
            franchise,
            login, // Deprecated/Mock
            loginSuccess, // New helper
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
