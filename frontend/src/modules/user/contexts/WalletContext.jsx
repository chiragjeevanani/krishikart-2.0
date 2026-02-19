import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/axios';

const WalletContext = createContext();

export function WalletProvider({ children }) {
    const [balance, setBalance] = useState(0);
    const [loyaltyPoints, setLoyaltyPoints] = useState(0);
    const [creditLimit, setCreditLimit] = useState(0);
    const [creditUsed, setCreditUsed] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loyaltyConfig, setLoyaltyConfig] = useState({
        awardRate: 5, // 5% of order value
        redemptionRate: 10, // 10 points = ₹1
        minRedeemPoints: 100
    });

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        const token = localStorage.getItem('userToken');
        const path = window.location.pathname;

        // Skip if on auth pages or in other modules
        if (!token ||
            ['/', '/login', '/verification'].includes(path) ||
            path.includes('/masteradmin') ||
            path.includes('/franchise') ||
            path.includes('/vendor') ||
            path.includes('/delivery')
        ) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.get('/user/me');
            if (response.data && response.data.result) {
                const user = response.data.result;
                setBalance(user.walletBalance || 0);
                setCreditLimit(user.creditLimit || 0);
                setCreditUsed(user.usedCredit || 0);
                setLoyaltyPoints(user.loyaltyPoints || 0);

                // Note: Transactions are currently mock as they aren't in User model
                setTransactions([
                    { id: 'TXN-INIT', type: 'Added', amount: user.walletBalance || 0, date: 'Current Session', status: 'Success' }
                ]);
            }
        } catch (error) {
            console.error('Failed to fetch wallet data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateLoyaltyConfig = (newConfig) => {
        setLoyaltyConfig(prev => ({ ...prev, ...newConfig }));
    };

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

    const redeemLoyaltyPoints = (points) => {
        if (loyaltyPoints >= points && points >= (loyaltyConfig?.minRedeemPoints || 100)) {
            const rupees = Math.floor(points / (loyaltyConfig?.redemptionRate || 10));
            setLoyaltyPoints(prev => prev - points);
            setBalance(prev => prev + rupees);

            const newTxn = {
                id: `RED-${Math.floor(1000 + Math.random() * 9000)}`,
                type: 'Redemption',
                amount: rupees,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                status: 'Success'
            };
            setTransactions(prev => [newTxn, ...prev]);
            return true;
        }
        return false;
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
            addLoyaltyPoints,
            redeemLoyaltyPoints,
            loyaltyConfig,
            updateLoyaltyConfig,
            fetchWalletData,
            isLoading
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
