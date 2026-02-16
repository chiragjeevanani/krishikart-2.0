import React, { createContext, useContext, useState, useEffect } from 'react';

const ProcurementContext = createContext();

export const ProcurementProvider = ({ children }) => {
    const [procurementRequests, setProcurementRequests] = useState([]);

    useEffect(() => {
        const savedRequests = localStorage.getItem('procurement_requests');
        if (savedRequests) {
            setProcurementRequests(JSON.parse(savedRequests));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('procurement_requests', JSON.stringify(procurementRequests));
    }, [procurementRequests]);

    const addRequest = (request) => {
        const newRequest = {
            ...request,
            id: `PR-${Date.now()}`,
            date: new Date().toISOString(),
            status: 'requested', // status: requested, quoted, approved, rejected, dispatched
            quotationPrice: null
        };
        setProcurementRequests(prev => [newRequest, ...prev]);
    };

    const updateRequestStatus = (id, status, extraData = {}) => {
        setProcurementRequests(prev => prev.map(req =>
            req.id === id ? { ...req, status, ...extraData } : req
        ));
    };

    const submitQuotation = (id, itemsWithPrices) => {
        setProcurementRequests(prev => prev.map(req =>
            req.id === id ? {
                ...req,
                status: 'quoted',
                items: itemsWithPrices,
                totalQuotedAmount: itemsWithPrices.reduce((sum, item) => sum + (item.quotedPrice * item.qty), 0)
            } : req
        ));
    };

    return (
        <ProcurementContext.Provider value={{
            procurementRequests,
            addRequest,
            updateRequestStatus,
            submitQuotation
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
