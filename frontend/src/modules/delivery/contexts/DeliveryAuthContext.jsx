import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/axios';

const DeliveryAuthContext = createContext();

export function DeliveryAuthProvider({ children }) {
    const [delivery, setDelivery] = useState(() => {
        const saved = localStorage.getItem('deliveryData');
        return saved ? JSON.parse(saved) : null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('deliveryToken');
            if (token) {
                try {
                    const { data } = await api.get('/delivery/me');
                    setDelivery(data.result);
                    localStorage.setItem('deliveryData', JSON.stringify(data.result));
                } catch (error) {
                    console.error("Failed to load delivery profile", error);
                    if (error.response?.status === 401) {
                        logout();
                    }
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const loginSuccess = (data, token) => {
        setDelivery(data);
        localStorage.setItem('deliveryToken', token);
        localStorage.setItem('deliveryData', JSON.stringify(data));
    };

    const logout = () => {
        setDelivery(null);
        localStorage.removeItem('deliveryToken');
        localStorage.removeItem('deliveryData');
        window.location.href = '/delivery/login';
    };

    return (
        <DeliveryAuthContext.Provider value={{
            delivery,
            loginSuccess,
            logout,
            isAuthenticated: !!delivery,
            loading
        }}>
            {children}
        </DeliveryAuthContext.Provider>
    );
}

export function useDeliveryAuth() {
    const context = useContext(DeliveryAuthContext);
    if (!context) throw new Error('useDeliveryAuth must be used within DeliveryAuthProvider');
    return context;
}
