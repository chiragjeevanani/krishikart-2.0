import { createContext, useContext, useState, useEffect } from 'react';

const WalletContext = createContext();

export function WalletProvider({ children }) {
    const [balance, setBalance] = useState(5000); // Initial mock balance
    const [loyaltyPoints, setLoyaltyPoints] = useState(() => {
        const saved = localStorage.getItem('krishikart_loyalty_points');
        return saved ? parseInt(saved) : 0;
    });
    const [creditLimit, setCreditLimit] = useState(50000); // Business Credit Limit
    const [creditUsed, setCreditUsed] = useState(12500); // Current credit used
    const [transactions, setTransactions] = useState([
        { id: 'TXN-101', type: 'Added', amount: 5000, date: 'Jan 15, 2026', status: 'Success' },
    ]);

    useEffect(() => {
        localStorage.setItem('krishikart_loyalty_points', loyaltyPoints.toString());
    }, [loyaltyPoints]);

    const addLoyaltyPoints = (points) => {
        setLoyaltyPoints(prev => prev + points);
        const newTxn = {
            id: `LYT-${Math.floor(1000 + Math.random() * 9000)}`,
            type: 'Loyalty Bonus',
            amount: points,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: 'Success'
        };
        setTransactions(prev => [newTxn, ...prev]);
    };

    const addMoney = (amount) => {
        // In a real app, this would involve Razorpay SDK
        const newTxn = {
            id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
            type: 'Added',
            amount: amount,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: 'Success'
        };
        setBalance(prev => prev + amount);
        setTransactions(prev => [newTxn, ...prev]);
        return true;
    };

    const payWithWallet = (amount) => {
        if (balance >= amount) {
            const newTxn = {
                id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
                type: 'Paid',
                amount: amount,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                status: 'Success'
            };
            setBalance(prev => prev - amount);
            setTransactions(prev => [newTxn, ...prev]);
            return true;
        }
        return false;
    };

    return (
        <WalletContext.Provider value={{
            balance,
            transactions,
            addMoney,
            payWithWallet,
            creditLimit,
            creditUsed,
            loyaltyPoints,
            addLoyaltyPoints
        }}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
}
