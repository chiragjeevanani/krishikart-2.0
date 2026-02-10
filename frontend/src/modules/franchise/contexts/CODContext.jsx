import React, { createContext, useContext, useState, useEffect } from 'react';
import mockCOD from '../data/mockCODTransactions.json';

const CODContext = createContext();

export const CODProvider = ({ children }) => {
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState({
        totalCollectedToday: 0,
        pendingDeposit: 0,
        depositedToday: 0
    });

    useEffect(() => {
        const savedCOD = localStorage.getItem('franchise_cod');
        if (savedCOD) {
            const data = JSON.parse(savedCOD);
            setTransactions(data.transactions);
            setSummary(data.summary);
        } else {
            setTransactions(mockCOD.transactions);
            setSummary(mockCOD.summary);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('franchise_cod', JSON.stringify({ transactions, summary }));
    }, [transactions, summary]);

    const depositCash = (transactionIds) => {
        let totalDeposited = 0;
        const newTransactions = transactions.map(txn => {
            if (transactionIds.includes(txn.id) && txn.status === 'Pending Deposit') {
                totalDeposited += txn.amount;
                return { ...txn, status: 'Deposited', depositDate: new Date().toISOString() };
            }
            return txn;
        });

        setTransactions(newTransactions);
        setSummary(prev => ({
            ...prev,
            pendingDeposit: Math.max(0, prev.pendingDeposit - totalDeposited),
            depositedToday: prev.depositedToday + totalDeposited
        }));
    };

    const addCODTransaction = (orderId, hotelName, amount, collectedBy) => {
        const newTxn = {
            id: `TXN-COD-${Date.now()}`,
            orderId,
            hotelName,
            amount,
            collectedBy,
            timestamp: new Date().toISOString(),
            status: 'Pending Deposit'
        };

        setTransactions(prev => [newTxn, ...prev]);
        setSummary(prev => ({
            ...prev,
            totalCollectedToday: prev.totalCollectedToday + amount,
            pendingDeposit: prev.pendingDeposit + amount
        }));
    };

    return (
        <CODContext.Provider value={{
            transactions,
            summary,
            depositCash,
            addCODTransaction
        }}>
            {children}
        </CODContext.Provider>
    );
};

export const useCOD = () => {
    const context = useContext(CODContext);
    if (!context) throw new Error('useCOD must be used within CODProvider');
    return context;
};
