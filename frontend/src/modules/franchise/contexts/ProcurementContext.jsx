import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/axios';

const ProcurementContext = createContext();

export const ProcurementProvider = ({ children }) => {
    const [procurementRequests, setProcurementRequests] = useState([]);
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('procurementCart');
        return savedCart ? JSON.parse(savedCart) : {};
    });

    useEffect(() => {
        localStorage.setItem('procurementCart', JSON.stringify(cart));
    }, [cart]);

    const clearCart = () => setCart({});

    const addRequest = async (request) => {
        try {
            const response = await api.post('/procurement/franchise/create', request);
            if (response.data.success) {
                setProcurementRequests(prev => [response.data.results, ...prev]);
                return response.data.results;
            }
        } catch (error) {
            console.error('Failed to create procurement request:', error);
            throw error;
        }
    };

    const fetchRequests = async () => {
        try {
            const response = await api.get('/procurement/franchise/my-requests');
            if (response.data.success) {
                setProcurementRequests(response.data.results);
            }
        } catch (error) {
            console.error('Failed to fetch procurement requests:', error);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const updateRequestStatus = (id, status, extraData = {}) => {
        // Optimistic update, ideally should call API
        setProcurementRequests(prev => prev.map(req =>
            req._id === id ? { ...req, status, ...extraData } : req
        ));
    };

    return (
        <ProcurementContext.Provider value={{
            procurementRequests,
            cart,
            setCart,
            clearCart,
            addRequest,
            updateRequestStatus
        }}>
            {children}
        </ProcurementContext.Provider>
    );
};

export const useProcurement = () => {
    const context = useContext(ProcurementContext);
    if (!context) throw new Error('useProcurement must be used within ProcurementProvider');
    return context;
};
