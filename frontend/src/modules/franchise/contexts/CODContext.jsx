import React, { createContext, useContext, useState, useEffect } from 'react';
import mockCOD from '../data/mockCODTransactions.json';

const CODContext = createContext();

export const CODProvider = ({ children }) => {
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState({
        totalToDeposit: 0,
        totalDeposited: 0,
        pendingTxCount: 0,
        totalCollectedToday: 0
    });

    useEffect(() => {
        const savedCOD = localStorage.getItem('franchise_cod');
        let data;
        if (savedCOD) {
            data = JSON.parse(savedCOD);
        } else {
            data = mockCOD;
        }

        const txs = data.transactions || [];
        setTransactions(txs);

        // Re-calculate summary to ensure consistency with current structure
        const pending = txs.filter(t => t.status.toLowerCase().includes('pending') || t.status.toLowerCase() === 'unreconciled' || t.status.toLowerCase() === 'pending deposit');
        const deposited = txs.filter(t => t.status.toLowerCase() === 'deposited');

        setSummary({
            totalToDeposit: pending.reduce((sum, t) => sum + t.amount, 0),
            totalDeposited: deposited.reduce((sum, t) => sum + t.amount, 0),
            pendingTxCount: pending.length,
            totalCollectedToday: txs.reduce((sum, t) => sum + t.amount, 0)
        });
    }, []);

    useEffect(() => {
        localStorage.setItem('franchise_cod', JSON.stringify({ transactions, summary }));
    }, [transactions, summary]);

    const markAsDeposited = (txId, bankReference) => {
        const newTransactions = transactions.map(txn => {
            if (txn.id === txId) {
                return {
                    ...txn,
                    status: 'deposited',
                    bankReference,
                    depositDate: new Date().toISOString()
                };
            }
            return txn;
        });

        setTransactions(newTransactions);

        // Update summary
        const pending = newTransactions.filter(t => t.status === 'pending' || t.status === 'Pending Deposit' || t.status === 'unreconciled');
        const deposited = newTransactions.filter(t => t.status === 'deposited' || t.status === 'Deposited');

        setSummary({
            totalToDeposit: pending.reduce((sum, t) => sum + t.amount, 0),
            totalDeposited: deposited.reduce((sum, t) => sum + t.amount, 0),
            pendingTxCount: pending.length,
            totalCollectedToday: newTransactions.reduce((sum, t) => sum + t.amount, 0)
        });
    };

    const addCODTransaction = (orderId, hotelName, amount, collectedBy) => {
        const newTxn = {
            id: `TXN-COD-${Date.now()}`,
            orderId,
            hotelName,
            amount,
            collectedBy,
            timestamp: new Date().toISOString(),
            status: 'pending'
        };

        const updatedTxs = [newTxn, ...transactions];
        setTransactions(updatedTxs);

        const pending = updatedTxs.filter(t => t.status === 'pending' || t.status === 'Pending Deposit');
        const deposited = updatedTxs.filter(t => t.status === 'deposited' || t.status === 'Deposited');

        setSummary({
            totalToDeposit: pending.reduce((sum, t) => sum + t.amount, 0),
            totalDeposited: deposited.reduce((sum, t) => sum + t.amount, 0),
            pendingTxCount: pending.length,
            totalCollectedToday: updatedTxs.reduce((sum, t) => sum + t.amount, 0)
        });
    };

    return (
        <CODContext.Provider value={{
            transactions,
            summary,
            markAsDeposited,
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
